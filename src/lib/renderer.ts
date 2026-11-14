// WebGPU 2D 骨骼渲染器：图片部件经 GPU 仿射变换合成；不支持时降级 Canvas2D
import type { StagePart } from '../types';

export const MAX_PARTS = 32;

export interface Renderer {
  readonly kind: 'webgpu' | 'canvas2d';
  resize(cssWidth: number, cssHeight: number): void;
  render(parts: StagePart[]): void;
  destroy(): void;
}

const SHADER = /* wgsl */ `
struct Uniforms {
  view: mat3x3f,
  models: array<mat3x3f, ${MAX_PARTS}>,
};
@group(0) @binding(0) var<uniform> uni: Uniforms;
@group(1) @binding(0) var tex: texture_2d<f32>;
@group(1) @binding(1) var samp: sampler;

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn vs_main(@location(0) local: vec2f, @location(1) uv: vec2f,
           @builtin(instance_index) ii: u32) -> VSOut {
  let world = uni.models[ii] * vec3f(local, 1.0);
  let clip = uni.view * world;
  var out: VSOut;
  out.pos = vec4f(clip.xy, 0.0, 1.0);
  out.uv = uv;
  return out;
}

@fragment
fn fs_main(in: VSOut) -> @location(0) vec4f {
  return textureSample(tex, samp, in.uv);
}
`;

function partModelMatrix(p: StagePart): Float32Array {
  // mat3 列主序：T(pivot) * R * T(-pivot) * S(w,h)
  const c = Math.cos(p.rotation);
  const s = Math.sin(p.rotation);
  const px = p.x + p.pivotX;
  const py = p.y + p.pivotY;
  // 基础列（未平移枢轴前），直接展开合成
  const m00 = c * p.width;
  const m01 = s * p.width;
  const m10 = -s * p.height;
  const m11 = c * p.height;
  const tx = px - (m00 * p.pivotX + m10 * p.pivotY);
  const ty = py - (m01 * p.pivotX + m11 * p.pivotY);
  // uniform 地址空间 mat3x3 每列按 vec4 对齐（步长 48B），返回 12 浮点：
  // col0=(m00,m01,0,·), col1=(m10,m11,0,·), col2=(tx,ty,1,·)
  return new Float32Array([m00, m01, 0, 0, m10, m11, 0, 0, tx, ty, 1, 0]);
}

/** 视图矩阵同样按 3 个填充列输出（12 浮点） */
function viewMatrix(w: number, h: number): Float32Array {
  // 像素坐标 -> 裁剪空间（y 翻转）：col0=(2/w,0,0,·) col1=(0,-2/h,0,·) col2=(-1,1,1,·)
  return new Float32Array([2 / w, 0, 0, 0, 0, -2 / h, 0, 0, -1, 1, 1, 0]);
}

class WebGPURenderer implements Renderer {
  readonly kind = 'webgpu' as const;
  private device: GPUDevice;
  private context: GPUCanvasContext;
  private canvas: HTMLCanvasElement;
  private format: GPUTextureFormat;
  private pipeline: GPURenderPipeline;
  private uniformBuffer: GPUBuffer;
  private sampler: GPUSampler;
  private uniformViews: Float32Array;
  private texCache = new Map<HTMLImageElement | HTMLCanvasElement, { texture: GPUTexture; bindGroup: GPUBindGroup }>();
  private cssW = 1;
  private cssH = 1;

  private constructor(canvas: HTMLCanvasElement, device: GPUDevice, context: GPUCanvasContext, format: GPUTextureFormat) {
    this.canvas = canvas;
    this.device = device;
    this.context = context;
    this.format = format;
    this.sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });

    const module = device.createShaderModule({ code: SHADER });
    this.pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module,
        entryPoint: 'vs_main',
        buffers: [
          {
            arrayStride: 16,
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x2' },
              { shaderLocation: 1, offset: 8, format: 'float32x2' },
            ],
          },
        ],
      },
      fragment: { module, entryPoint: 'fs_main', targets: [{ format, blend: {
        color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
        alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
      } }] },
      primitive: { topology: 'triangle-list' },
    });

    // 四边形：local(0..1) + uv
    const verts = new Float32Array([
      0, 0, 0, 0,
      1, 0, 1, 0,
      0, 1, 0, 1,
      1, 1, 1, 1,
    ]);
    const vb = device.createBuffer({ size: verts.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(vb, 0, verts);
    const ib = device.createBuffer({ size: 6 * 2, usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(ib, 0, new Uint16Array([0, 1, 2, 2, 1, 3]));
    (this as unknown as { vb: GPUBuffer; ib: GPUBuffer }).vb = vb;
    (this as unknown as { ib: GPUBuffer }).ib = ib;

    // view(mat3=48B 对齐) + models(32*48B)
    const total = 48 + MAX_PARTS * 48;
    this.uniformBuffer = device.createBuffer({ size: total, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.uniformViews = new Float32Array(total / 4);

    const bgl0 = this.pipeline.getBindGroupLayout(0);
    (this as unknown as { globalBind: GPUBindGroup }).globalBind = device.createBindGroup({
      layout: bgl0,
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
    });
  }

  static async create(canvas: HTMLCanvasElement): Promise<WebGPURenderer> {
    if (!navigator.gpu) throw new Error('当前浏览器不支持 WebGPU');
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('未找到可用 GPU 适配器');
    const device = await adapter.requestDevice();
    const context = canvas.getContext('webgpu') as GPUCanvasContext | null;
    if (!context) throw new Error('无法获取 WebGPU 画布上下文');
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: 'premultiplied' });
    return new WebGPURenderer(canvas, device, context, format);
  }

  resize(cssWidth: number, cssHeight: number): void {
    this.cssW = Math.max(1, cssWidth);
    this.cssH = Math.max(1, cssHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(this.cssW * dpr);
    const h = Math.round(this.cssH * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    // 视图矩阵：像素坐标 -> 裁剪空间（y 翻转），12 浮点含列填充
    this.uniformViews.set(viewMatrix(w, h), 0);
  }

  private getTexture(img: HTMLImageElement | HTMLCanvasElement) {
    const cached = this.texCache.get(img);
    if (cached) return cached;
    const w = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
    const h = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
    const texture = this.device.createTexture({
      size: { width: w, height: h },
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.device.queue.copyExternalImageToTexture({ source: img }, { texture }, { width: w, height: h });
    const bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(1),
      entries: [
        { binding: 0, resource: texture.createView() },
        { binding: 1, resource: this.sampler },
      ],
    });
    const rec = { texture, bindGroup };
    this.texCache.set(img, rec);
    return rec;
  }

  render(parts: StagePart[]): void {
    const self = this as unknown as { vb: GPUBuffer; ib: GPUBuffer; globalBind: GPUBindGroup };
    const visible = parts.slice(0, MAX_PARTS);
    visible.forEach((p, i) => {
      // 每个 mat3x3 占 12 浮点（48B，含 vec4 列填充）
      this.uniformViews.set(partModelMatrix(p), 12 + i * 12);
    });
    this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformViews);

    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: { r: 0.976, g: 0.957, b: 0.925, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, self.globalBind);
    pass.setVertexBuffer(0, self.vb);
    pass.setIndexBuffer(self.ib, 'uint16');
    visible.forEach((p, i) => {
      const { bindGroup } = this.getTexture(p.image);
      pass.setBindGroup(1, bindGroup);
      pass.drawIndexed(6, 1, 0, 0, i);
    });
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  destroy(): void {
    this.texCache.forEach((t) => t.texture.destroy());
    this.texCache.clear();
    this.uniformBuffer.destroy();
  }
}

class Canvas2DRenderer implements Renderer {
  readonly kind = 'canvas2d' as const;
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法获取 2D 画布上下文');
    this.ctx = ctx;
  }

  resize(cssWidth: number, cssHeight: number): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(cssWidth * dpr));
    this.canvas.height = Math.max(1, Math.round(cssHeight * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  render(parts: StagePart[]): void {
    const { ctx, canvas } = this;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#f9f4ec';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    for (const p of parts) {
      ctx.save();
      ctx.translate(p.x + p.pivotX, p.y + p.pivotY);
      ctx.rotate(p.rotation);
      ctx.translate(-p.pivotX, -p.pivotY);
      ctx.drawImage(p.image, 0, 0, p.width, p.height);
      ctx.restore();
    }
  }

  destroy(): void {
    /* 无 GPU 资源 */
  }
}

export async function createRenderer(canvas: HTMLCanvasElement): Promise<{ renderer: Renderer; fallback: boolean; reason?: string }> {
  try {
    const renderer = await WebGPURenderer.create(canvas);
    return { renderer, fallback: false };
  } catch (err) {
    return { renderer: new Canvas2DRenderer(canvas), fallback: true, reason: (err as Error).message };
  }
}
