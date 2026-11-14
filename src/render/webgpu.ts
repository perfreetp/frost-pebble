// WebGPU 炮孔渲染器：存储缓冲区 + 全屏幕三角形实例化，一次 draw call 绘制全部孔点。
// 等高线/边坡/管线/文字等矢量图层仍由叠加 Canvas2D 负责，二者视口同步。
import type { BlastHole, Viewport } from '../types';
import { scaleDenominator } from './render2d';

export const MAX_HOLES = 12000;

const SHADER = /* wgsl */ `
struct Uniforms {
  offsetX: f32, offsetY: f32, scale: f32,
  width: f32, height: f32, radius: f32, pad: f32, pad2: f32,
};
;struct Hole {
  x: f32, y: f32, color: u32, flags: u32,
};
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> holes: array<Hole>;

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) local: vec2f,
  @location(1) color: vec4f,
  @location(2) flags: u32,
};

fn unpackColor(c: u32) -> vec4f {
  return vec4f(
    f32(c & 0xffu) / 255.0,
    f32((c >> 8u) & 0xffu) / 255.0,
    f32((c >> 16u) & 0xffu) / 255.0,
    f32((c >> 24u) & 0xffu) / 255.0,
  );
}

@vertex
fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VSOut {
  // 每个实例一个全屏三角形（3 顶点），在片元阶段按孔心裁剪成圆点
  var out: VSOut;
  let h = holes[ii];
  let sx = h.x * u.scale + u.offsetX;
  let sy = h.y * u.scale + u.offsetY;
  let r = select(u.radius, u.radius * 0.5, (h.flags & 2u) != 0u); // 远景点更小
  // 视口裁剪：孔心在屏幕外（含半径余量）则退化到画布外
  let offscreen = sx < -r || sy < -r || sx > u.width + r || sy > u.height + r;
  let corner = array<vec2f, 3>(
    vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0),
  );
  let c = select(corner[vi] * r + vec2f(sx, sy), vec2f(-9999.0, -9999.0), offscreen);
  out.pos = vec4f(vec2f(c.x / u.width, 1.0 - c.y / u.height) * 2.0 - 1.0, 0.0, 1.0);
  out.local = corner[vi];
  out.color = unpackColor(h.color);
  out.flags = h.flags;
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4f {
  let d = length(in.local);
  // 跳过孔画成红色叉（用两个对角窄条近似），普通孔画圆点
  if ((in.flags & 1u) != 0u) {
    let ax = abs(in.local.x + in.local.y);
    let bx = abs(in.local.x - in.local.y);
    if (d > 1.0 || (ax > 0.28 && bx > 0.28)) {
      discard;
    }
    return vec4f(0.937, 0.275, 0.275, 1.0); // #ef4444
  }
  if (d > 1.0) {
    discard;
  }
  // 选中孔加亮描边
  if ((in.flags & 4u) != 0u && d > 0.72) {
    return vec4f(0.988, 0.875, 0.278, 1.0); // #fde047
  }
  return in.color;
}
`;

interface HoleGpuRecord {
  x: number;
  y: number;
  color: number;
  flags: number;
}

function packColor(r: number, g: number, b: number, a = 255): number {
  return (r | (g << 8) | (b << 16) | (a << 24)) >>> 0;
}

export class WebGpuHoleRenderer {
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private pipeline!: GPURenderPipeline;
  private uniformBuffer!: GPUBuffer;
  private holeBuffer!: GPUBuffer;
  private bindGroup!: GPUBindGroup;
  private format: GPUTextureFormat;
  readonly mode = 'webgpu' as const;

  private constructor(device: GPUDevice, format: GPUTextureFormat) {
    this.device = device;
    this.format = format;
  }

  static async create(canvas: HTMLCanvasElement): Promise<WebGpuHoleRenderer> {
    const gpu = navigator.gpu;
    if (!gpu) throw new Error('当前浏览器不支持 WebGPU');
    const adapter = await gpu.requestAdapter();
    if (!adapter) throw new Error('未获取到 WebGPU 适配器');
    const device = await adapter.requestDevice();
    const context = canvas.getContext('webgpu');
    if (!context) throw new Error('无法创建 WebGPU 画布上下文');
    const format = gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: 'premultiplied' });
    const renderer = new WebGpuHoleRenderer(device, format);
    renderer.context = context;
    renderer.initPipeline();
    return renderer;
  }

  private initPipeline(): void {
    const module = this.device.createShaderModule({ code: SHADER });
    this.pipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: { module, entryPoint: 'vs' },
      fragment: { module, entryPoint: 'fs', targets: [{ format: this.format }] },
      primitive: { topology: 'triangle-list' },
    });
    this.uniformBuffer = this.device.createBuffer({
      size: 32, // 8 个 f32，按 16 字节对齐
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.holeBuffer = this.device.createBuffer({
      size: MAX_HOLES * 16, // 每条记录 x,y,color,flags = 16 字节
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: { buffer: this.holeBuffer } },
      ],
    });
  }

  /** 上传炮孔数据（颜色/标志在每帧根据选择与 LOD 重算） */
  uploadHoles(
    holes: BlastHole[],
    selectedId: string | null,
    far: boolean,
  ): number {
    const records: HoleGpuRecord[] = [];
    for (const h of holes.slice(0, MAX_HOLES)) {
      const skipped = h.state === 'skipped';
      const selected = h.id === selectedId;
      const color = skipped
        ? packColor(239, 68, 68)
        : selected
          ? packColor(250, 204, 21)
          : packColor(56, 189, 248);
      let flags = 0;
      if (skipped) flags |= 1;
      if (far) flags |= 2;
      if (selected) flags |= 4;
      records.push({ x: h.x, y: h.y, color, flags });
    }
    const data = new ArrayBuffer(records.length * 16);
    const view = new DataView(data);
    records.forEach((r, i) => {
      const off = i * 16;
      view.setFloat32(off, r.x, true);
      view.setFloat32(off + 4, r.y, true);
      view.setUint32(off + 8, r.color, true);
      view.setUint32(off + 12, r.flags, true);
    });
    this.device.queue.writeBuffer(this.holeBuffer, 0, data);
    return records.length;
  }

  render(viewport: Viewport, width: number, height: number, instanceCount: number): void {
    const far = scaleDenominator(viewport) > 2000;
    const radius = far ? 2.5 : 4;
    const uniforms = new Float32Array([
      viewport.offsetX, viewport.offsetY, viewport.scale,
      width, height, radius, 0, 0,
    ]);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniforms.buffer);
    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: { r: 0.059, g: 0.09, b: 0.133, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    if (instanceCount > 0) pass.draw(3, instanceCount);
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  destroy(): void {
    this.uniformBuffer.destroy();
    this.holeBuffer.destroy();
  }
}
