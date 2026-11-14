import bgEstimateSrc from './shaders/bg_estimate.wgsl?raw';
import bgRefineSrc from './shaders/bg_refine.wgsl?raw';
import matteDistanceSrc from './shaders/matte_distance.wgsl?raw';
import matteRefineSrc from './shaders/matte_refine.wgsl?raw';
import matteCleanupSrc from './shaders/matte_cleanup.wgsl?raw';
import matteHardenSrc from './shaders/matte_harden.wgsl?raw';
import strokeSrc from './shaders/stroke.wgsl?raw';
import compositeSrc from './shaders/composite.wgsl?raw';
import shadowBlurSrc from './shaders/shadow_blur.wgsl?raw';
import exportAlphaSrc from './shaders/export_alpha.wgsl?raw';
import decontaminateSrc from './shaders/decontaminate.wgsl?raw';
import metricsSrc from './shaders/metrics.wgsl?raw';
import blitSrc from './shaders/blit.wgsl?raw';
import { analysePixels, cctFromRgb, type ChannelStats } from '../lib/color';
import type { CutParams, Stroke } from '../lib/types';

export interface BackdropEstimate {
  mean: [number, number, number];
  spread: [number, number, number];
  coverage: number;
  stats: ChannelStats;
}

export interface CompositeOptions {
  gains: [number, number, number];
  bgScale: number;
  bgOffsetX: number;
  bgOffsetY: number;
  shadowAngle: number;
  shadowSoftness: number;
  shadowOpacity: number;
  opacity: number;
  contrast: number;
  hasBackground: boolean;
  mode: CompositeMode;
}

export type CompositeMode = 'matte' | 'mask' | 'scene' | 'original';

const MODE_INDEX: Record<CompositeMode, number> = { matte: 0, mask: 1, scene: 2, original: 3 };

export class GpuError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GpuError';
  }
}

function align(n: number, a = 4) {
  return Math.ceil(n / a) * a;
}

function bytesPerRowFor(width: number) {
  return Math.ceil((width * 4) / 256) * 256;
}

const WG = 8;

/**
 * Owns the GPU resources for one open item. The matte lives in three layers,
 * mirroring how a retoucher thinks about the work:
 *
 *   raw      the computed extraction (distance -> edge convergence -> hole fill)
 *   painted  raw + every brush stroke, ping-ponged
 *   shaped   painted + the feather/hardness contour, what preview and export see
 *
 * Recomputing an upstream layer replays every downstream one, which is why the
 * stroke list is kept alongside the mask rather than baked into it.
 */
export class CutoutEngine {
  readonly device: GPUDevice;
  readonly width: number;
  readonly height: number;
  readonly backdrop: BackdropEstimate;
  readonly subject: GPUTexture;

  private rawA: GPUTexture;
  private rawB: GPUTexture;
  private paintA: GPUTexture;
  private paintB: GPUTexture;
  private paint: 'a' | 'b' = 'a';
  private bgField: GPUTexture;
  private liveBase: GPUTexture;
  private liveRes: GPUTexture;
  private liveActive = false;
  private shaped: GPUTexture;
  private blurA: GPUTexture;
  private blurB: GPUTexture;
  private deconTex: GPUTexture;
  private exportTex: GPUTexture;

  private pipelines: Record<string, GPUComputePipeline> = {};
  private bgHist: GPUBuffer;
  private bgAcc: GPUBuffer;
  private metricsBuf: GPUBuffer;
  private metricsRead: GPUBuffer;
  private strokePts: GPUBuffer | null = null;
  private strokeCap = 0;
  private strokeUniform: GPUBuffer;

  private bgTexture: GPUTexture | null = null;
  bgVersion = 0;
  private fallbackBg: GPUTexture | null = null;

  private previewCanvas: HTMLCanvasElement | null = null;
  private previewCtx: GPUCanvasContext | null = null;
  private previewTex: GPUTexture | null = null;
  private previewSize: [number, number] = [0, 0];

  private uniforms = new Map<number, { bufs: GPUBuffer[]; i: number }>();
  private scratch: GPUBuffer[] = [];
  private blitPipeline: GPURenderPipeline;
  private blitSampler: GPUSampler;
  private subjectStatsCache: ChannelStats | null = null;
  private sampleCanvas: HTMLCanvasElement | null = null;
  private bitmap: ImageBitmap;

  private cutSig = '';
  private strokesSig = '';
  private shapedSig = '';
  private destroyed = false;

  backdropReady = false;
  onBackdropRefined: ((e: BackdropEstimate) => void) | null = null;

  static async create(bitmap: ImageBitmap): Promise<CutoutEngine> {
    if (!navigator.gpu) {
      throw new GpuError('当前浏览器没有 WebGPU。请用 Chrome 或 Edge 113+ 打开工作台——抠图、修边与合成都由计算着色器实时完成。');
    }
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) {
      throw new GpuError('没有可用的 GPU 适配器。若在虚拟机或远程桌面中运行，请启用浏览器的软件 WebGPU 适配器后重试。');
    }
    const device = await adapter.requestDevice();
    return new CutoutEngine(device, bitmap);
  }

  private constructor(device: GPUDevice, bitmap: ImageBitmap) {
    this.device = device;
    this.bitmap = bitmap;
    this.width = bitmap.width;
    this.height = bitmap.height;

    const maskUsage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST;
    const colorUsage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST;

    this.subject = device.createTexture({
      label: 'subject',
      size: [this.width, this.height],
      format: 'rgba8unorm',
      // RENDER_ATTACHMENT is required by copyExternalImageToTexture even though
      // we only ever sample the result; without it the copy is a silent no-op.
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.COPY_SRC |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
    device.queue.copyExternalImageToTexture({ source: bitmap }, { texture: this.subject }, [this.width, this.height]);

    const mkMask = (label: string) =>
      device.createTexture({ label, size: [this.width, this.height], format: 'r32float', usage: maskUsage });
    this.rawA = mkMask('rawA');
    this.rawB = mkMask('rawB');
    this.paintA = mkMask('paintA');
    this.paintB = mkMask('paintB');
    this.shaped = mkMask('shaped');
    // One drag = one stroke. The live pair holds the snapshot taken at
    // pointer-down plus the in-progress result, so a drag never rewrites the
    // committed stroke list on every pointermove.
    this.bgField = device.createTexture({
      label: 'bgField',
      size: [16, 16],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    this.liveBase = mkMask('liveBase');
    this.liveRes = mkMask('liveRes');
    this.blurA = mkMask('blurA');
    this.blurB = mkMask('blurB');
    this.deconTex = device.createTexture({ label: 'decon', size: [this.width, this.height], format: 'rgba8unorm', usage: colorUsage });
    this.exportTex = device.createTexture({ label: 'export', size: [this.width, this.height], format: 'rgba8unorm', usage: colorUsage });

    this.bgHist = device.createBuffer({ label: 'bgHist', size: 4096 * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    this.bgAcc = device.createBuffer({ label: 'bgAcc', size: 16 * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC });
    this.metricsBuf = device.createBuffer({ label: 'metrics', size: 8 * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC });
    this.metricsRead = device.createBuffer({ label: 'metricsRead', size: 8 * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    this.strokeUniform = device.createBuffer({ label: 'strokeU', size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

    const make = (label: string, code: string) =>
      device.createComputePipeline({
        label,
        layout: 'auto',
        compute: { module: device.createShaderModule({ label, code }), entryPoint: 'main' },
      });
    this.pipelines = {
      bgEstimate: make('bgEstimate', bgEstimateSrc),
      bgRefine: make('bgRefine', bgRefineSrc),
      distance: make('distance', matteDistanceSrc),
      refine: make('refine', matteRefineSrc),
      cleanup: make('cleanup', matteCleanupSrc),
      harden: make('harden', matteHardenSrc),
      stroke: make('stroke', strokeSrc),
      composite: make('composite', compositeSrc),
      shadow: make('shadow', shadowBlurSrc),
      exportAlpha: make('exportAlpha', exportAlphaSrc),
      decon: make('decon', decontaminateSrc),
      metrics: make('metrics', metricsSrc),
    };
    this.blitSampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });
    this.blitPipeline = device.createRenderPipeline({
      label: 'blit',
      layout: 'auto',
      vertex: { module: device.createShaderModule({ label: 'blit', code: blitSrc }), entryPoint: 'vs' },
      fragment: {
        module: device.createShaderModule({ label: 'blit', code: blitSrc }),
        entryPoint: 'fs',
        targets: [{ format: 'rgba8unorm' }],
      },
      primitive: { topology: 'triangle-list' },
    });

    this.backdrop = this.estimateBackdrop();
    this.solveBackgroundField();
  }

  private p(name: string) {
    return this.pipelines[name];
  }

  private dispatchDims() {
    return [Math.ceil(this.width / WG), Math.ceil(this.height / WG), 1] as [number, number, number];
  }

  // ------------------------------------------------------------------
  // uniform ring buffers
  // ------------------------------------------------------------------

  private uniform(data: Float32Array): GPUBuffer {
    const size = align(data.byteLength, 16);
    let pool = this.uniforms.get(size);
    if (!pool) {
      pool = { bufs: [], i: 0 };
      this.uniforms.set(size, pool);
    }
    if (pool.bufs.length < 8) {
      pool.bufs.push(this.device.createBuffer({ size, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }));
    }
    const buf = pool.bufs[pool.i++ % pool.bufs.length];
    this.device.queue.writeBuffer(buf, 0, data as unknown as GPUAllowSharedBufferSource);
    return buf;
  }

  private tempBuffer(src: Uint32Array): GPUBuffer {
    const data = new Uint32Array(align(src.length, 4));
    data.set(src);
    const buf = this.device.createBuffer({ size: data.byteLength, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.device.queue.writeBuffer(buf, 0, data);
    this.scratch.push(buf);
    if (this.scratch.length > 64) {
      const b = this.scratch.shift()!;
      // Not destroyed immediately: an in-flight submission may still read it.
      setTimeout(() => b.destroy(), 4000);
    }
    return buf;
  }

  // ------------------------------------------------------------------
  // backdrop
  // ------------------------------------------------------------------

  private sampleCtx(size: number) {
    if (!this.sampleCanvas) {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      this.sampleCanvas = c;
    }
    if (this.sampleCanvas.width !== size) {
      this.sampleCanvas.width = size;
      this.sampleCanvas.height = size;
    }
    const ctx = this.sampleCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new GpuError('无法创建取样画布。');
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(this.bitmap, 0, 0, size, size);
    return ctx;
  }

  /**
   * Solve a smooth backdrop colour field for the local-colour matte.
   *
   * A studio sweep is never flat: there is a bright pool from the key light and
   * a vignette toward the corners, so comparing every pixel against one global
   * mean classifies the lit part of the sweep as "subject". The sweep is also
   * the brightest thing in a product shot, so each cell's colour is taken from
   * its bright quartile -- that reports the paper the product stands on even
   * when the product covers half the cell. Cells whose bright quartile is
   * still much darker than the frame as a whole are dark product (tyres, seat
   * padding); those are filled from neighbours and the grid is then smoothed.
   */
  private solveBackgroundField() {
    const G = 16;
    const S = 256;
    const data = this.sampleCtx(S).getImageData(0, 0, S, S).data;
    const cell = S / G;
    const colors = new Float32Array(G * G * 3);
    const luma = new Float32Array(G * G);
    const known = new Uint8Array(G * G);

    for (let gy = 0; gy < G; gy++) {
      for (let gx = 0; gx < G; gx++) {
        const samples: Array<{ l: number; r: number; g: number; b: number }> = [];
        for (let y = gy * cell; y < (gy + 1) * cell; y += 1) {
          for (let x = gx * cell; x < (gx + 1) * cell; x += 1) {
            const i = (y * S + x) * 4;
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;
            samples.push({ l: 0.2126 * r + 0.7152 * g + 0.0722 * b, r, g, b });
          }
        }
        samples.sort((a, b) => b.l - a.l);
        const keep = Math.max(8, Math.floor(samples.length * 0.3));
        let r = 0, g = 0, b = 0, l = 0;
        for (let k = 0; k < keep; k++) {
          r += samples[k].r;
          g += samples[k].g;
          b += samples[k].b;
          l += samples[k].l;
        }
        const idx = gy * G + gx;
        colors[idx * 3] = r / keep;
        colors[idx * 3 + 1] = g / keep;
        colors[idx * 3 + 2] = b / keep;
        luma[idx] = l / keep;
      }
    }

    // Reference level: median of all cell lumas. A cell far below it is product,
    // not sweep, and will be interpolated.
    const sorted = Array.from(luma).sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 0.5;
    for (let i = 0; i < G * G; i++) {
      if (luma[i] > median * 0.72) known[i] = 1;
    }

    for (let pass = 0; pass < G * 3; pass++) {
      let changed = false;
      for (let gy = 0; gy < G; gy++) {
        for (let gx = 0; gx < G; gx++) {
          const idx = gy * G + gx;
          if (known[idx]) continue;
          let r = 0, g = 0, b = 0, n = 0;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = gx + dx;
            const ny = gy + dy;
            if (nx < 0 || ny < 0 || nx >= G || ny >= G) continue;
            const ni = ny * G + nx;
            if (!known[ni]) continue;
            r += colors[ni * 3];
            g += colors[ni * 3 + 1];
            b += colors[ni * 3 + 2];
            n++;
          }
          if (n === 0) continue;
          colors[idx * 3] = r / n;
          colors[idx * 3 + 1] = g / n;
          colors[idx * 3 + 2] = b / n;
          known[idx] = 1;
          changed = true;
        }
      }
      if (!changed) break;
    }

    let cur = colors;
    for (let pass = 0; pass < 2; pass++) {
      const out = new Float32Array(G * G * 3);
      for (let gy = 0; gy < G; gy++) {
        for (let gx = 0; gx < G; gx++) {
          let r = 0, g = 0, b = 0, n = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = gx + dx;
              const ny = gy + dy;
              if (nx < 0 || ny < 0 || nx >= G || ny >= G) continue;
              const ni = (ny * G + nx) * 3;
              r += cur[ni];
              g += cur[ni + 1];
              b += cur[ni + 2];
              n++;
            }
          }
          const oi = (gy * G + gx) * 3;
          out[oi] = r / n;
          out[oi + 1] = g / n;
          out[oi + 2] = b / n;
        }
      }
      cur = out;
    }

    const pixels = new Uint8Array(G * G * 4);
    for (let i = 0; i < G * G; i++) {
      pixels[i * 4] = Math.round(Math.min(1, Math.max(0, cur[i * 3])) * 255);
      pixels[i * 4 + 1] = Math.round(Math.min(1, Math.max(0, cur[i * 3 + 1])) * 255);
      pixels[i * 4 + 2] = Math.round(Math.min(1, Math.max(0, cur[i * 3 + 2])) * 255);
      pixels[i * 4 + 3] = 255;
    }
    this.device.queue.writeTexture({ texture: this.bgField }, pixels, { bytesPerRow: G * 4 }, [G, G]);
  }

  private estimateBackdrop(): BackdropEstimate {
    const device = this.device;
    const S = 256;
    const data = this.sampleCtx(S).getImageData(0, 0, S, S).data;

    const hist = new Uint32Array(4096);
    const border = Math.max(10, Math.round(S * 0.11));
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        if (x >= border && x < S - border && y >= border && y < S - border) continue;
        const i = (y * S + x) * 4;
        const qr = Math.round((data[i] / 255) * 15);
        const qg = Math.round((data[i + 1] / 255) * 15);
        const qb = Math.round((data[i + 2] / 255) * 15);
        hist[qr * 256 + qg * 16 + qb]++;
      }
    }
    let best = 0;
    let bestScore = -1;
    for (let i = 0; i < hist.length; i++) {
      const n = hist[i];
      if (n === 0) continue;
      const r = Math.floor(i / 256);
      const g = Math.floor((i % 256) / 16);
      const b = i % 16;
      // Weight mid-lightness bins so a dark vignette in the corners does not
      // win over the actual sweep the product stands on.
      const lum = (r + g + b) / 3;
      const score = n * (lum > 2 && lum < 15 ? 1.18 : 0.52);
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    }
    const binR = Math.floor(best / 256) % 16;
    const binG = Math.floor((best % 256) / 16) % 16;
    const binB = best % 16;
    const mean: [number, number, number] = [binR / 15, binG / 15, binB / 15];
    const luma = 0.2126 * mean[0] + 0.7152 * mean[1] + 0.0722 * mean[2];

    const estimate: BackdropEstimate = {
      mean,
      spread: [0.06, 0.06, 0.06],
      coverage: 0.25,
      stats: { r: mean[0], g: mean[1], b: mean[2], luma, chroma: Math.hypot(mean[0] - luma, mean[2] - luma), cct: cctFromRgb(mean[0], mean[1], mean[2]), count: hist[best] },
    };

    // GPU pass A: full-res border histogram.
    device.queue.writeBuffer(this.bgHist, 0, new Uint32Array(4096));
    const a = new Uint32Array([this.width, this.height, Math.max(4, Math.round(Math.min(this.width, this.height) * 0.03)), 0]);
    const aBuf = this.tempBuffer(a);
    const bA = device.createBindGroup({
      layout: this.p('bgEstimate').getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.subject.createView() },
        { binding: 1, resource: { buffer: this.bgHist } },
        { binding: 2, resource: { buffer: aBuf } },
      ],
    });
    const encA = device.createCommandEncoder();
    const pA = encA.beginComputePass();
    pA.setPipeline(this.p('bgEstimate'));
    pA.setBindGroup(0, bA);
    pA.dispatchWorkgroups(...this.dispatchDims());
    pA.end();
    device.queue.submit([encA.finish()]);

    // GPU pass B: mean + spread around the seed bin.
    const step = Math.max(1, Math.ceil(Math.sqrt((this.width * this.height) / 2_500_000)));
    device.queue.writeBuffer(this.bgAcc, 0, new Uint32Array(16));
    const b = new Uint32Array([this.width, this.height, binR, binG, binB, step, 0, 0]);
    const bBuf = this.tempBuffer(b);
    const bB = device.createBindGroup({
      layout: this.p('bgRefine').getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.subject.createView() },
        { binding: 1, resource: { buffer: this.bgAcc } },
        { binding: 2, resource: { buffer: bBuf } },
      ],
    });
    const encB = device.createCommandEncoder();
    const pB = encB.beginComputePass();
    pB.setPipeline(this.p('bgRefine'));
    pB.setBindGroup(0, bB);
    pB.dispatchWorkgroups(
      Math.ceil(this.width / (WG * step)),
      Math.ceil(this.height / (WG * step)),
      1,
    );
    pB.end();
    device.queue.submit([encB.finish()]);

    void this.readRefinedBackdrop(estimate);
    return estimate;
  }

  private async readRefinedBackdrop(est: BackdropEstimate) {
    const read = this.device.createBuffer({ size: 16 * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const enc = this.device.createCommandEncoder();
    enc.copyBufferToBuffer(this.bgAcc, 0, read, 0, 16 * 4);
    this.device.queue.submit([enc.finish()]);
    try {
      await read.mapAsync(GPUMapMode.READ);
      const v = new Uint32Array(read.getMappedRange().slice(0));
      read.unmap();
      const count = v[3];
      if (count < 96) return;
      const mr = v[0] / count / 255;
      const mg = v[1] / count / 255;
      const mb = v[2] / count / 255;
      // Moment buffers hold (c*255)^2 >> 4, so undo both scalings.
      const vr = (v[4] * 16) / count / (255 * 255) - mr * mr;
      const vg = (v[5] * 16) / count / (255 * 255) - mg * mg;
      const vb = (v[6] * 16) / count / (255 * 255) - mb * mb;
      const floor = 0.02;
      const luma = 0.2126 * mr + 0.7152 * mg + 0.0722 * mb;
      est.mean = [mr, mg, mb];
      // 2.2 sigma of the measured spread = a working tolerance for a clean
      // sweep; a noisy backdrop widens the gate on its own.
      est.spread = [
        Math.max(floor, Math.sqrt(Math.max(vr, 0)) * 2.2),
        Math.max(floor, Math.sqrt(Math.max(vg, 0)) * 2.2),
        Math.max(floor, Math.sqrt(Math.max(vb, 0)) * 2.2),
      ];
      est.coverage = Math.min(1, count / (this.width * this.height));
      est.stats = { r: mr, g: mg, b: mb, luma, chroma: Math.hypot(mr - luma, mb - luma), cct: cctFromRgb(mr, mg, mb), count };
      this.backdropReady = true;
      if (!this.destroyed) this.onBackdropRefined?.(est);
    } catch {
      /* device lost; CPU estimate stands */
    } finally {
      try { read.destroy(); } catch { /* noop */ }
    }
  }

  // ------------------------------------------------------------------
  // matte layers
  // ------------------------------------------------------------------

  private fullCopy(dst: GPUTexture, src: GPUTexture) {
    const enc = this.device.createCommandEncoder();
    enc.copyTextureToTexture({ texture: src, origin: [0, 0, 0] }, { texture: dst, origin: [0, 0, 0] }, [this.width, this.height, 1]);
    this.device.queue.submit([enc.finish()]);
  }

  /** distance -> edge convergence -> hole fill, into rawA. */
  private computeRaw(cut: CutParams) {
    const device = this.device;
    const d = new Float32Array(8);
    d[0] = this.backdrop.spread[0];
    d[1] = this.backdrop.spread[1];
    d[2] = this.backdrop.spread[2];
    // The slider is "how far from the sweep still counts as background":
    // 1.0 keeps the measured band, > 1 widens it toward the subject.
    d[4] = Math.max(0.05, cut.bgTolerance);
    d[5] = 0.20;
    // Shadow absorption: a hue-matched pixel may sit at most this fraction
    // below the sweep's luma and still count as backdrop, and its normalised
    // chroma must be this close. Kept tight so powder-coated white and silver
    // -- which the whole product line is made of -- never get absorbed.
    // Applies only on top of a normal-tolerance matte; a deliberately low
    // tolerance means the artist wants the sweep's own texture kept.
    d[6] = cut.bgTolerance >= 0.8 ? 0.86 : 0.0;
    d[7] = 0.40;
    const dBuf = this.uniform(d);

    const r = new Float32Array(8);
    r[2] = cut.edgeSnap;
    const rBuf = this.uniform(r);

    const c = new Float32Array(8);
    // White plastic on a white sweep is the standard case; hole fill defaults
    // high, speckle removal moderate.
    c[2] = 0.62;
    c[3] = 0.9;
    c[4] = 3;
    const cBuf = this.uniform(c);

    const bD = device.createBindGroup({
      layout: this.p('distance').getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.subject.createView() },
        { binding: 1, resource: this.rawA.createView() },
        { binding: 2, resource: { buffer: dBuf } },
        { binding: 3, resource: this.bgField.createView() },
      ],
    });
    const bR = device.createBindGroup({
      layout: this.p('refine').getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.rawA.createView() },
        { binding: 1, resource: this.rawB.createView() },
        { binding: 2, resource: { buffer: rBuf } },
      ],
    });
    const bC = device.createBindGroup({
      layout: this.p('cleanup').getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.rawB.createView() },
        { binding: 1, resource: this.rawA.createView() },
        { binding: 2, resource: { buffer: cBuf } },
      ],
    });

    const enc = device.createCommandEncoder();
    const pass = enc.beginComputePass();
    const dims = this.dispatchDims();
    pass.setPipeline(this.p('distance'));
    pass.setBindGroup(0, bD);
    pass.dispatchWorkgroups(...dims);
    pass.setPipeline(this.p('refine'));
    pass.setBindGroup(0, bR);
    pass.dispatchWorkgroups(...dims);
    pass.setPipeline(this.p('cleanup'));
    pass.setBindGroup(0, bC);
    pass.dispatchWorkgroups(...dims);
    pass.end();
    device.queue.submit([enc.finish()]);
  }

  private seedPaint() {
    this.fullCopy(this.paintA, this.rawA);
    this.paint = 'a';
  }

  private paintTexture() {
    return this.paint === 'a' ? this.paintA : this.paintB;
  }

  /** The matte the contour shaping pass should read. */
  private activePaint() {
    return this.liveActive ? this.liveRes : this.paintTexture();
  }

  /** Decimate a long point list so one live dispatch stays cheap. */
  private thin(points: [number, number][], max = 140): [number, number][] {
    if (points.length <= max) return points;
    const out: [number, number][] = [];
    const step = (points.length - 1) / (max - 1);
    for (let i = 0; i < max - 1; i++) out.push(points[Math.round(i * step)]);
    out.push(points[points.length - 1]);
    return out;
  }

  /**
   * Rasterise one stroke from `src` into `dst`. The shader reads src and writes
   * dst for every invocation, so the caller must pre-copy src into dst; then a
   * dispatch limited to the stroke's bounding box leaves the rest intact.
   */
  private renderStroke(src: GPUTexture, dst: GPUTexture, points: [number, number][], stroke: { radius: number; hardness: number; strength: number; mode: 'add' | 'erase' }) {
    if (points.length === 0) return;
    this.fullCopy(dst, src);

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of points) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    const pad = stroke.radius + 3;
    const x0 = Math.max(0, Math.floor((minX - pad) / WG) * WG);
    const y0 = Math.max(0, Math.floor((minY - pad) / WG) * WG);
    const x1 = Math.min(this.width, Math.ceil((maxX + pad) / WG) * WG);
    const y1 = Math.min(this.height, Math.ceil((maxY + pad) / WG) * WG);
    if (x1 <= x0 || y1 <= y0) return;

    // The points buffer must hold every point the shader will read.
    if (!this.strokePts || this.strokeCap < points.length * 16) {
      this.strokePts?.destroy();
      this.strokeCap = Math.max(1024, Math.ceil(points.length * 16 * 2));
      this.strokePts = this.device.createBuffer({ label: 'strokePts', size: this.strokeCap, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    }
    const f = new Float32Array(points.length * 4);
    points.forEach((p, i) => {
      f[i * 4] = p[0];
      f[i * 4 + 1] = p[1];
    });
    this.device.queue.writeBuffer(this.strokePts, 0, f);

    // A ring of uniform buffers: several strokes can be in flight before the
    // GPU has drained the queue, and they must not share one write target.
    const u = new Float32Array(16);
    u[0] = this.width;
    u[1] = this.height;
    u[2] = x0;
    u[3] = y0;
    u[4] = Math.max(1, stroke.radius);
    u[5] = stroke.hardness;
    u[6] = stroke.strength;
    u[7] = stroke.mode === 'erase' ? 1 : 0;
    u[8] = points.length;
    const uBuf = this.uniform(u);

    const bind = this.device.createBindGroup({
      layout: this.p('stroke').getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: src.createView() },
        { binding: 1, resource: dst.createView() },
        { binding: 2, resource: { buffer: uBuf } },
        { binding: 3, resource: { buffer: this.strokePts } },
      ],
    });
    const enc = this.device.createCommandEncoder();
    const pass = enc.beginComputePass();
    pass.setPipeline(this.p('stroke'));
    pass.setBindGroup(0, bind);
    pass.dispatchWorkgroups(Math.ceil((x1 - x0) / WG), Math.ceil((y1 - y0) / WG), 1);
    pass.end();
    this.device.queue.submit([enc.finish()]);
  }

  /** Commit a stroke: chunks keep the per-pixel segment loop short. */
  private rasteriseStroke(stroke: Stroke) {
    const points = stroke.points.map((p) => [p.x, p.y] as [number, number]);
    if (points.length === 0) return;
    const segLen = 24;
    const segs: [number, number][][] = [];
    if (points.length === 1) segs.push([points[0]]);
    else for (let i = 0; i < points.length - 1; i += segLen) segs.push(points.slice(i, Math.min(points.length, i + segLen + 1)));

    // `paint` names the texture that currently holds the committed result.
    // Each chunk renders into the other texture and becomes the new current
    // one, so the last chunk lands in a known place.
    for (const seg of segs) {
      const src = this.paint === 'a' ? this.paintA : this.paintB;
      const dst = this.paint === 'a' ? this.paintB : this.paintA;
      this.renderStroke(src, dst, seg, stroke);
      this.paint = this.paint === 'a' ? 'b' : 'a';
    }
  }

  beginLiveStroke() {
    this.fullCopy(this.liveBase, this.paintTexture());
    this.fullCopy(this.liveRes, this.paintTexture());
    this.liveActive = true;
  }

  previewStroke(stroke: Stroke) {
    if (!this.liveActive) this.beginLiveStroke();
    const points = this.thin(stroke.points.map((p) => [p.x, p.y] as [number, number]));
    this.renderStroke(this.liveBase, this.liveRes, points, stroke);
  }

  endLiveStroke() {
    this.liveActive = false;
  }

  /**
   * Re-run only the contour pass. Used during a live brush drag: the painted
   * layer is the live preview texture, so the artist sees the stroke before
   * the stroke is committed to the document.
   */
  refreshShaped(cut: CutParams) {
    this.shape(cut);
    this.shapedSig = `${cut.feather.toFixed(2)}|${cut.hardness.toFixed(2)}`;
  }

  /** painted -> shaped, applying the feather/hardness contour. */
  private shape(cut: CutParams) {
    const u = new Float32Array(8);
    u[0] = 1 / this.width;
    u[1] = 1 / this.height;
    u[2] = cut.feather;
    u[3] = cut.hardness;
    const buf = this.uniform(u);
    const painted = this.activePaint();
    const bind = this.device.createBindGroup({
      layout: this.p('harden').getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: painted.createView() },
        { binding: 1, resource: this.shaped.createView() },
        { binding: 2, resource: { buffer: buf } },
      ],
    });
    const enc = this.device.createCommandEncoder();
    const pass = enc.beginComputePass();
    pass.setPipeline(this.p('harden'));
    pass.setBindGroup(0, bind);
    pass.dispatchWorkgroups(...this.dispatchDims());
    pass.end();
    this.device.queue.submit([enc.finish()]);
  }

  /**
   * Bring the mask up to date with the document. Called on every edit; the
   * three signature checks make a slider drag cost one shape pass instead of
   * a full re-extraction.
   */
  sync(cut: CutParams, strokes: Stroke[]) {
    const cutSig = `${cut.bgTolerance.toFixed(3)}|${cut.edgeSnap.toFixed(3)}`;
    const strokesSig = strokes.map((s) => `${s.id}:${s.points.length}:${s.mode}:${s.radius.toFixed(2)}`).join(';');
    const shapedSig = `${cut.feather.toFixed(2)}|${cut.hardness.toFixed(2)}`;

    const needRaw = cutSig !== this.cutSig;
    const needStrokes = needRaw || strokesSig !== this.strokesSig;
    const needShape = needStrokes || shapedSig !== this.shapedSig;
    if (!needShape) return;

    if (needRaw) {
      this.computeRaw(cut);
      this.cutSig = cutSig;
    }
    if (needStrokes) {
      this.seedPaint();
      for (const s of strokes) this.rasteriseStroke(s);
      this.strokesSig = strokesSig;
    }
    if (needShape && !this.liveActive) {
      this.shape(cut);
      this.shapedSig = shapedSig;
    }
  }

  /** Force a full recompute (e.g. after the refined backdrop lands). */
  invalidate() {
    this.cutSig = '';
    this.strokesSig = '';
    this.shapedSig = '';
  }

  // ------------------------------------------------------------------
  // background + composite
  // ------------------------------------------------------------------

  setBackground(bitmap: ImageBitmap | null) {
    if (!bitmap) {
      this.bgTexture?.destroy();
      this.bgTexture = null;
      return;
    }
    const tex = this.device.createTexture({
      label: 'bg',
      size: [bitmap.width, bitmap.height],
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.device.queue.copyExternalImageToTexture({ source: bitmap }, { texture: tex }, [bitmap.width, bitmap.height]);
    this.bgVersion++;
    this.bgTexture?.destroy();
    this.bgTexture = tex;
  }

  private ensurePreview(canvas: HTMLCanvasElement, w: number, h: number) {
    if (this.previewCanvas === canvas && this.previewSize[0] === w && this.previewSize[1] === h) return;
    this.previewCanvas = canvas;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('webgpu');
    if (!ctx) throw new GpuError('无法获取 WebGPU 画布上下文。');
    ctx.configure({ device: this.device, format: 'rgba8unorm', alphaMode: 'opaque' });
    this.previewCtx = ctx;
    if (!this.previewTex || this.previewTex.width !== w || this.previewTex.height !== h) {
      this.previewTex?.destroy();
      this.previewTex = this.device.createTexture({
        size: [w, h],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC,
      });
    }
    this.previewSize = [w, h];
  }

  private buildShadow(softness: number, offset: number): GPUTexture {
    const radius = Math.max(1, Math.round(1 + softness * 0.55 + Math.abs(offset) * 0.05));
    const uH = new Float32Array(8);
    uH[0] = 1;
    uH[1] = 0;
    uH[2] = radius;
    const uhb = this.uniform(uH);
    const uV = new Float32Array(8);
    uV[0] = 0;
    uV[1] = 1;
    uV[2] = radius;
    const uvb = this.uniform(uV);
    const bH = this.device.createBindGroup({
      layout: this.p('shadow').getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.shaped.createView() },
        { binding: 1, resource: this.blurA.createView() },
        { binding: 2, resource: { buffer: uhb } },
      ],
    });
    const bV = this.device.createBindGroup({
      layout: this.p('shadow').getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.blurA.createView() },
        { binding: 1, resource: this.blurB.createView() },
        { binding: 2, resource: { buffer: uvb } },
      ],
    });
    const enc = this.device.createCommandEncoder();
    const pass = enc.beginComputePass();
    const dims = this.dispatchDims();
    pass.setPipeline(this.p('shadow'));
    pass.setBindGroup(0, bH);
    pass.dispatchWorkgroups(...dims);
    pass.setBindGroup(0, bV);
    pass.dispatchWorkgroups(...dims);
    pass.end();
    this.device.queue.submit([enc.finish()]);
    return this.blurB;
  }

  private compositeUniform(w: number, h: number, o: CompositeOptions) {
    const rad = (o.shadowAngle * Math.PI) / 180;
    const u = new Float32Array(24);
    u[0] = o.gains[0];
    u[1] = o.gains[1];
    u[2] = o.gains[2];
    u[3] = o.opacity;
    u[4] = o.bgScale;
    u[5] = o.bgOffsetX;
    u[6] = o.bgOffsetY;
    u[7] = o.hasBackground ? 1 : 0;
    u[8] = Math.cos(rad);
    u[9] = Math.sin(rad);
    u[10] = o.shadowSoftness / 60;
    u[11] = o.shadowOpacity;
    u[12] = w;
    u[13] = h;
    u[14] = 0.035;
    u[15] = MODE_INDEX[o.mode];
    // shadow tint: slightly blue-violet, as a neutral fill shadow reads.
    u[16] = 0.20;
    u[17] = 0.22;
    u[18] = 0.30;
    u[19] = o.contrast;
    return this.uniform(u);
  }

  private backgroundView(): GPUTextureView {
    if (this.bgTexture) return this.bgTexture.createView();
    if (!this.fallbackBg) {
      this.fallbackBg = this.device.createTexture({ size: [2, 2], format: 'rgba8unorm', usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST });
      const px = new Uint8Array([232, 234, 238, 255, 228, 230, 235, 255, 236, 238, 241, 255, 230, 232, 236, 255]);
      this.device.queue.writeTexture({ texture: this.fallbackBg }, px, { bytesPerRow: 8 }, [2, 2]);
    }
    return this.fallbackBg.createView();
  }

  private compositeBind(target: GPUTexture, w: number, h: number, o: CompositeOptions) {
    const shadow = this.buildShadow(o.shadowSoftness, 0);
    return this.device.createBindGroup({
      layout: this.p('composite').getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.subject.createView() },
        { binding: 1, resource: this.shaped.createView() },
        { binding: 2, resource: this.backgroundView() },
        { binding: 3, resource: shadow.createView() },
        { binding: 4, resource: target.createView() },
        { binding: 5, resource: { buffer: this.compositeUniform(w, h, o) } },
      ],
    });
  }

  renderComposite(canvas: HTMLCanvasElement, w: number, h: number, o: CompositeOptions) {
    this.ensurePreview(canvas, w, h);
    const bind = this.compositeBind(this.previewTex!, w, h, o);
    const enc = this.device.createCommandEncoder();
    const pass = enc.beginComputePass();
    pass.setPipeline(this.p('composite'));
    pass.setBindGroup(0, bind);
    pass.dispatchWorkgroups(Math.ceil(w / WG), Math.ceil(h / WG), 1);
    pass.end();
    this.blitToCanvas(enc);
    this.device.queue.submit([enc.finish()]);
  }

  private blitToCanvas(enc: GPUCommandEncoder) {
    const bind = this.device.createBindGroup({
      layout: this.blitPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.previewTex!.createView() },
        { binding: 1, resource: this.blitSampler },
      ],
    });
    const pass = enc.beginRenderPass({
      colorAttachments: [
        {
          view: this.previewCtx!.getCurrentTexture().createView(),
          clearValue: { r: 0.04, g: 0.05, b: 0.06, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });
    pass.setPipeline(this.blitPipeline);
    pass.setBindGroup(0, bind);
    pass.draw(3);
    pass.end();
  }

  /** Sample the centre of the composite into an average colour (for the review sheet). */
  async measure(): Promise<{ boundary: number; fringe: number; soft: number; subjectStats: ChannelStats }> {
    const device = this.device;
    device.queue.writeBuffer(this.metricsBuf, 0, new Uint32Array(8));
    const u = new Float32Array(12);
    u[0] = 1 / this.width;
    u[1] = 1 / this.height;
    u[2] = Math.max(1, Math.round(Math.min(this.width, this.height) / 1600));
    u[4] = 0.08;
    u[5] = 0.92;
    u[6] = 0.93;
    u[7] = 0.07;
    const buf = this.uniform(u);
    const bind = device.createBindGroup({
      layout: this.p('metrics').getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.subject.createView() },
        { binding: 1, resource: this.shaped.createView() },
        { binding: 2, resource: { buffer: this.metricsBuf } },
        { binding: 3, resource: { buffer: buf } },
      ],
    });
    const enc = device.createCommandEncoder();
    const pass = enc.beginComputePass();
    pass.setPipeline(this.p('metrics'));
    pass.setBindGroup(0, bind);
    pass.dispatchWorkgroups(...this.dispatchDims());
    pass.end();
    enc.copyBufferToBuffer(this.metricsBuf, 0, this.metricsRead, 0, 32);
    device.queue.submit([enc.finish()]);
    await this.metricsRead.mapAsync(GPUMapMode.READ);
    const v = new Uint32Array(this.metricsRead.getMappedRange().slice(0));
    this.metricsRead.unmap();

    const n = v[3];
    let stats: ChannelStats;
    if (n > 32) {
      const r = v[4] / n / 255;
      const g = v[5] / n / 255;
      const b = v[6] / n / 255;
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      stats = { r, g, b, luma, chroma: Math.hypot(r - luma, b - luma), cct: cctFromRgb(r, g, b), count: n };
    } else {
      stats = this.subjectStats();
    }
    return { boundary: v[0], fringe: v[1], soft: v[2], subjectStats: stats };
  }

  /**
   * Colour temperature of the product itself: the whole-frame average would be
   * dominated by the studio sweep. The caller supplies the current matte via
   * {@link measure}, which is where this is normally filled in.
   */
  subjectStats(): ChannelStats {
    if (this.subjectStatsCache) return this.subjectStatsCache;
    const ctx = this.sampleCtx(192);
    const stats = analysePixels(ctx.getImageData(0, 0, 192, 192).data);
    this.subjectStatsCache = stats;
    return stats;
  }

  setSubjectStats(stats: ChannelStats) {
    this.subjectStatsCache = stats;
  }

  /** Assumed colour temperature of a chosen backdrop, sampled from its pixels. */
  static async backgroundCct(bitmap: ImageBitmap): Promise<number> {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return 6600;
    ctx.drawImage(bitmap, 0, 0, 128, 128);
    return analysePixels(ctx.getImageData(0, 0, 128, 128).data).cct;
  }

  // ------------------------------------------------------------------
  // export
  // ------------------------------------------------------------------

  private async textureToPng(tex: GPUTexture): Promise<Blob> {
    const w = tex.width;
    const h = tex.height;
    const bpr = bytesPerRowFor(w);
    const buf = this.device.createBuffer({ size: bpr * h, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
    const enc = this.device.createCommandEncoder();
    enc.copyTextureToBuffer({ texture: tex }, { buffer: buf, bytesPerRow: bpr }, [w, h, 1]);
    this.device.queue.submit([enc.finish()]);
    await buf.mapAsync(GPUMapMode.READ);
    const src = new Uint8Array(buf.getMappedRange()).slice(0);
    buf.unmap();
    buf.destroy();
    const image = new ImageData(w, h);
    for (let y = 0; y < h; y++) {
      image.data.set(src.subarray(y * bpr, y * bpr + w * 4), y * w * 4);
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(image, 0, 0);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG 编码失败'))), 'image/png'),
    );
  }

  async exportAlpha(gains: [number, number, number], decontaminate = true): Promise<Blob> {
    const device = this.device;
    let src = this.subject;
    if (decontaminate) {
      // {f32, vec3f} rounds up to 32 bytes under uniform layout rules.
      const u = new Float32Array(8);
      u[0] = Math.max(1, Math.round(Math.min(this.width, this.height) * 0.0045));
      const bind = device.createBindGroup({
        layout: this.p('decon').getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: this.subject.createView() },
          { binding: 1, resource: this.shaped.createView() },
          { binding: 2, resource: this.deconTex.createView() },
          { binding: 3, resource: { buffer: this.uniform(u) } },
        ],
      });
      const enc = device.createCommandEncoder();
      const pass = enc.beginComputePass();
      pass.setPipeline(this.p('decon'));
      pass.setBindGroup(0, bind);
      pass.dispatchWorkgroups(...this.dispatchDims());
      pass.end();
      device.queue.submit([enc.finish()]);
      src = this.deconTex;
    }
    const u2 = new Float32Array(4);
    u2[0] = gains[0];
    u2[1] = gains[1];
    u2[2] = gains[2];
    const bind2 = device.createBindGroup({
      layout: this.p('exportAlpha').getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: src.createView() },
        { binding: 1, resource: this.shaped.createView() },
        { binding: 2, resource: this.exportTex.createView() },
        { binding: 3, resource: { buffer: this.uniform(u2) } },
      ],
    });
    const enc2 = device.createCommandEncoder();
    const pass2 = enc2.beginComputePass();
    pass2.setPipeline(this.p('exportAlpha'));
    pass2.setBindGroup(0, bind2);
    pass2.dispatchWorkgroups(...this.dispatchDims());
    pass2.end();
    device.queue.submit([enc2.finish()]);
    return this.textureToPng(this.exportTex);
  }

  async exportComposite(o: CompositeOptions): Promise<Blob> {
    const opts = { ...o, mode: 'scene' as CompositeMode };
    const bind = this.compositeBind(this.exportTex, this.width, this.height, opts);
    const enc = this.device.createCommandEncoder();
    const pass = enc.beginComputePass();
    pass.setPipeline(this.p('composite'));
    pass.setBindGroup(0, bind);
    pass.dispatchWorkgroups(...this.dispatchDims());
    pass.end();
    this.device.queue.submit([enc.finish()]);
    return this.textureToPng(this.exportTex);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const t of [this.previewTex, this.bgTexture, this.fallbackBg, this.subject, this.rawA, this.rawB, this.paintA, this.paintB, this.shaped, this.liveBase, this.bgField, this.liveRes, this.blurA, this.blurB, this.deconTex, this.exportTex]) {
      t?.destroy();
    }
    this.strokePts?.destroy();
    for (const pool of this.uniforms.values()) for (const b of pool.bufs) b.destroy();
    for (const b of this.scratch) b.destroy();
    this.uniforms.clear();
    this.device.destroy();
  }
}
