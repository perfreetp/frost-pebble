// 最小 WebGPU 环境声明（生产环境建议替换为 @webgpu/types）
interface GPUAdapter {
  requestDevice(): Promise<GPUDevice>;
}

interface GPUBuffer {
  destroy(): void;
}

interface GPUTexture {
  createView(): GPUTextureView;
}

interface GPUTextureView {}

interface GPUBindGroup {}

interface GPURenderPipeline {
  getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUBindGroupLayout {}

interface GPUShaderModule {}

interface GPURenderPassEncoder {
  setPipeline(pipeline: GPURenderPipeline): void;
  setBindGroup(index: number, bindGroup: GPUBindGroup): void;
  draw(vertexCount: number, instanceCount?: number): void;
  end(): void;
}

interface GPUCommandEncoder {
  beginRenderPass(descriptor: {
    colorAttachments: {
      view: GPUTextureView;
      clearValue: { r: number; g: number; b: number; a: number };
      loadOp: 'clear';
      storeOp: 'store';
    }[];
  }): GPURenderPassEncoder;
  finish(): GPUCommandBuffer;
}

interface GPUCommandBuffer {}

interface GPUQueue {
  writeBuffer(buffer: GPUBuffer, bufferOffset: number, data: BufferSource | SharedArrayBuffer): void;
  submit(commandBuffers: GPUCommandBuffer[]): void;
}

interface GPUDevice {
  createShaderModule(descriptor: { code: string }): GPUShaderModule;
  createRenderPipeline(descriptor: unknown): GPURenderPipeline;
  createBuffer(descriptor: {
    size: number;
    usage: number;
  }): GPUBuffer;
  createBindGroup(descriptor: unknown): GPUBindGroup;
  createCommandEncoder(): GPUCommandEncoder;
  readonly queue: GPUQueue;
}

interface GPUCanvasContext {
  configure(configuration: {
    device: GPUDevice;
    format: GPUTextureFormat;
    alphaMode?: 'premultiplied' | 'opaque';
  }): void;
  getCurrentTexture(): GPUTexture;
}

type GPUTextureFormat = string;

interface GPUSupportedLimits {}

interface Navigator {
  readonly gpu?: {
    requestAdapter(): Promise<GPUAdapter | null>;
    getPreferredCanvasFormat(): GPUTextureFormat;
  };
}

interface HTMLCanvasElement {
  getContext(contextId: 'webgpu'): GPUCanvasContext | null;
}

declare const GPUBufferUsage: {
  readonly UNIFORM: number;
  readonly STORAGE: number;
  readonly COPY_DST: number;
  readonly VERTEX: number;
};
