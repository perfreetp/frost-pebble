import type { SceneGeometry } from './scene';
import { cameraMatrix, type Camera, type Vec3 } from './math';

const SHADER = /* wgsl */ `
struct Uniforms {
  viewProj : mat4x4<f32>,
  camera   : vec4<f32>,
  light    : vec4<f32>,
  fog      : vec4<f32>,
  fogColor : vec4<f32>,
};

@group(0) @binding(0) var<uniform> U : Uniforms;

struct VSOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) normal : vec3<f32>,
  @location(1) color  : vec3<f32>,
  @location(2) world  : vec3<f32>,
  @location(3) viewZ  : f32,
};

@vertex
fn vs_main(
  @location(0) position : vec3<f32>,
  @location(1) normal   : vec3<f32>,
  @location(2) color    : vec3<f32>,
) -> VSOut {
  var out : VSOut;
  out.pos = U.viewProj * vec4<f32>(position, 1.0);
  out.normal = normal;
  out.color = color;
  out.world = position;
  out.viewZ = out.pos.w;
  return out;
}

@fragment
fn fs_main(in : VSOut) -> @location(0) vec4<f32> {
  let n = normalize(in.normal);
  let l = normalize(U.light.xyz);
  let v = normalize(U.camera.xyz - in.world);

  let hemi = mix(vec3<f32>(0.24, 0.27, 0.33), vec3<f32>(0.54, 0.58, 0.64), n.y * 0.5 + 0.5);
  let diff = max(dot(n, l), 0.0);
  let edge = pow(1.0 - abs(dot(n, v)), 2.0) * 0.08;
  let halfV = normalize(l + v);
  let spec = pow(max(dot(n, halfV), 0.0), 48.0) * 0.16;

  var color = in.color * (hemi + vec3<f32>(1.0, 0.97, 0.92) * diff * 0.55) + spec + edge;
  let fogAmt = clamp((in.viewZ - U.fog.x) / max(U.fog.y, 1.0), 0.0, 1.0) * U.fog.z;
  color = mix(color, U.fogColor.xyz, fogAmt);
  return vec4<f32>(color, 1.0);
}
`;

const BG_SHADER = /* wgsl */ `
struct BG {
  top    : vec4<f32>,
  bottom : vec4<f32>,
};
@group(0) @binding(0) var<uniform> B : BG;

struct VOut { @builtin(position) pos : vec4<f32>, @location(0) uv : vec2<f32> };

@vertex
fn vs(@builtin(vertex_index) i : u32) -> VOut {
  var p = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 3.0, -1.0),
    vec2<f32>(-1.0,  3.0),
  );
  var o : VOut;
  o.pos = vec4<f32>(p[i], 0.0, 1.0);
  o.uv = p[i] * 0.5 + 0.5;
  return o;
}

@fragment
fn fs(in : VOut) -> @location(0) vec4<f32> {
  let t = clamp(in.uv.y, 0.0, 1.0);
  let c = mix(B.bottom.rgb, B.top.rgb, smoothstep(0.05, 0.95, t));
  return vec4<f32>(c, 1.0);
}
`;

export class GpuRenderer {
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private pipeline!: GPURenderPipeline;
  private uniformBuffer!: GPUBuffer;
  private bindGroup!: GPUBindGroup;
  private vbo: GPUBuffer | null = null;
  private nbo: GPUBuffer | null = null;
  private cbo: GPUBuffer | null = null;
  private count = 0;
  private capacity = 0;
  private depthTexture: GPUTexture | null = null;
  private depthSize = { w: 0, h: 0 };
  private canvas: HTMLCanvasElement;
  adapterInfo: string;
  private bgPipeline!: GPURenderPipeline;
  private bgBuffer!: GPUBuffer;
  private bgBind!: GPUBindGroup;

  private constructor(canvas: HTMLCanvasElement, adapterInfo: string) {
    this.canvas = canvas;
    this.adapterInfo = adapterInfo;
  }

  static async create(canvas: HTMLCanvasElement): Promise<GpuRenderer> {
    if (!navigator.gpu) throw new Error('当前浏览器不支持 WebGPU，无法渲染三维排布');
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) throw new Error('未找到可用的 WebGPU 适配器');
    const device = await adapter.requestDevice();
    const context = canvas.getContext('webgpu') as GPUCanvasContext | null;
    if (!context) throw new Error('无法获取 WebGPU 画布上下文');

    const info = adapter.info as unknown as { vendor?: string; architecture?: string; device?: string };
    const label = [info?.vendor, info?.architecture, info?.device].filter(Boolean).join(' / ') || 'WebGPU';

    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: 'opaque' });

    const module = device.createShaderModule({ code: SHADER });
    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module,
        entryPoint: 'vs_main',
        buffers: [
          { arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] },
          { arrayStride: 12, attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x3' }] },
          { arrayStride: 12, attributes: [{ shaderLocation: 2, offset: 0, format: 'float32x3' }] },
        ],
      },
      fragment: { module, entryPoint: 'fs_main', targets: [{ format }] },
      primitive: { topology: 'triangle-list', cullMode: 'none' },
      depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less' },
    });

    const uniformBuffer = device.createBuffer({ size: 128, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
    });

    const bgModule = device.createShaderModule({ code: BG_SHADER });
    const bgPipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: { module: bgModule, entryPoint: 'vs' },
      fragment: { module: bgModule, entryPoint: 'fs', targets: [{ format }] },
      primitive: { topology: 'triangle-list' },
      depthStencil: { format: 'depth24plus', depthWriteEnabled: false, depthCompare: 'always' },
    });
    const bgBuffer = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const bgBind = device.createBindGroup({
      layout: bgPipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: bgBuffer } }],
    });
    device.queue.writeBuffer(
      bgBuffer,
      0,
      new Float32Array([0.135, 0.163, 0.196, 1, 0.052, 0.066, 0.084, 1]),
    );

    const r = new GpuRenderer(canvas, label);
    r.device = device;
    r.bgPipeline = bgPipeline;
    r.bgBuffer = bgBuffer;
    r.bgBind = bgBind;
    r.context = context;
    r.pipeline = pipeline;
    r.uniformBuffer = uniformBuffer;
    r.bindGroup = bindGroup;
    return r;
  }

  upload(geometry: SceneGeometry): void {
    const { positions, normals, colors, vertexCount } = geometry;
    if (vertexCount > this.capacity) {
      this.vbo?.destroy();
      this.nbo?.destroy();
      this.cbo?.destroy();
      const size = Math.max(vertexCount, 16) * 12;
      this.vbo = this.device.createBuffer({ size, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
      this.nbo = this.device.createBuffer({ size, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
      this.cbo = this.device.createBuffer({ size, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
      this.capacity = Math.max(vertexCount, 16);
    }
    this.count = vertexCount;
    if (vertexCount === 0 || !this.vbo || !this.nbo || !this.cbo) return;
    this.device.queue.writeBuffer(this.vbo, 0, positions);
    this.device.queue.writeBuffer(this.nbo, 0, normals);
    this.device.queue.writeBuffer(this.cbo, 0, colors);
  }

  render(cam: Camera, width: number, height: number): void {
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    const aspect = w / h;
    const vp = cameraMatrix(cam, aspect);

    const uniforms = new Float32Array(32);
    uniforms.set(vp, 0);
    uniforms.set([cam.eye[0], cam.eye[1], cam.eye[2], 1], 16);
    const l = normalize([0.42, 0.85, 0.32]);
    uniforms.set([l[0], l[1], l[2], 0], 20);
    // fog: (起始距离, 过渡长度, 强度, 保留)
    uniforms.set([40, 260, 0.22, 0], 24);
    uniforms.set([0.062, 0.078, 0.098, 1], 28);
    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniforms);

    const depth = this.ensureDepth(w, h);
    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: { r: 0.086, g: 0.098, b: 0.122, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: depth.createView(),
        depthClearValue: 1,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    });
    // 天空渐变背景
    pass.setPipeline(this.bgPipeline);
    pass.setBindGroup(0, this.bgBind);
    pass.draw(3);

    if (this.count > 0 && this.vbo && this.nbo && this.cbo) {
      pass.setPipeline(this.pipeline);
      pass.setBindGroup(0, this.bindGroup);
      pass.setVertexBuffer(0, this.vbo);
      pass.setVertexBuffer(1, this.nbo);
      pass.setVertexBuffer(2, this.cbo);
      pass.draw(this.count);
    }
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  private ensureDepth(w: number, h: number): GPUTexture {
    if (this.depthTexture && this.depthSize.w === w && this.depthSize.h === h) return this.depthTexture;
    this.depthTexture?.destroy();
    this.depthTexture = this.device.createTexture({
      size: { width: w, height: h },
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.depthSize = { w, h };
    return this.depthTexture;
  }

  destroy(): void {
    this.vbo?.destroy();
    this.nbo?.destroy();
    this.cbo?.destroy();
    this.depthTexture?.destroy();
    this.uniformBuffer?.destroy();
    this.bgBuffer?.destroy();
    this.device?.destroy();
  }
}

function normalize(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}
