/** WebGL2 字形渲染器：三角化轮廓上传 GPU，按 em 坐标绘制。 */
export interface MeshData {
  vertices: Float32Array;
  indices: Uint32Array;
}

export interface ViewBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface InkStyle {
  color: [number, number, number];
  alpha: number;
  /** 微妙墨色渐变强度 */
  grain: number;
}

const VERT = `#version 300 es
in vec2 aPos;
uniform vec4 uView; // x0, y0, w, h
out vec2 vPos;
void main() {
  vec2 p = (aPos - uView.xy) / uView.zw; // 0..1
  vec2 clip = p * 2.0 - 1.0;
  gl_Position = vec4(clip, 0.0, 1.0);
  vPos = aPos;
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vPos;
uniform vec3 uColor;
uniform float uAlpha;
uniform float uGrain;
out vec4 outColor;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
void main() {
  float n = hash(floor(vPos * 1.5)) - 0.5;
  float shade = 1.0 + n * 0.11 * uGrain + (vPos.y / 1000.0 - 0.5) * 0.05 * uGrain;
  vec3 c = clamp(uColor * shade, 0.0, 1.0);
  outColor = vec4(c, uAlpha);
}`;

export class GlyphRenderer {
  private gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private vbo: WebGLBuffer;
  private ibo: WebGLBuffer;
  private vao: WebGLVertexArrayObject;
  private count = 0;
  private uView: WebGLUniformLocation | null;
  private uColor: WebGLUniformLocation | null;
  private uAlpha: WebGLUniformLocation | null;
  private uGrain: WebGLUniformLocation | null;
  private canvas: HTMLCanvasElement;
  private dpr = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
    });
    if (!gl) throw new Error('WebGL2 不可用');
    this.gl = gl;

    const make = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        throw new Error('着色器编译失败: ' + gl.getShaderInfoLog(sh));
      }
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, make(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, make(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error('着色器链接失败: ' + gl.getProgramInfoLog(prog));
    }
    this.prog = prog;

    this.vbo = gl.createBuffer()!;
    this.ibo = gl.createBuffer()!;
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bindVertexArray(null);

    this.uView = gl.getUniformLocation(prog, 'uView');
    this.uColor = gl.getUniformLocation(prog, 'uColor');
    this.uAlpha = gl.getUniformLocation(prog, 'uAlpha');
    this.uGrain = gl.getUniformLocation(prog, 'uGrain');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
  }

  resize(cssW: number, cssH: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.dpr = dpr;
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  setMesh(mesh: MeshData) {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.DYNAMIC_DRAW);
    this.count = mesh.indices.length;
    gl.bindVertexArray(null);
  }

  clear() {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  draw(view: ViewBox, style: InkStyle) {
    if (!this.count) return;
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.prog);
    gl.bindVertexArray(this.vao);
    gl.uniform4f(this.uView, view.x0, view.y0, view.x1 - view.x0, view.y1 - view.y0);
    gl.uniform3f(this.uColor, style.color[0], style.color[1], style.color[2]);
    gl.uniform1f(this.uAlpha, style.alpha);
    gl.uniform1f(this.uGrain, style.grain);
    gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_INT, 0);
    gl.bindVertexArray(null);
  }

  dispose() {
    const gl = this.gl;
    gl.deleteBuffer(this.vbo);
    gl.deleteBuffer(this.ibo);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.prog);
  }
}

export function supportsWebGL2(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}
