// WebGL2 渲染器：HDR 半浮点场景缓冲 + 亮度提取 + 双向高斯泛光 + ACES 合成
import type { ProjectData, RGB, SignElement } from '../types';
import { ENVIRONMENTS } from '../core/defaults';
import { buildSceneMesh, buildWall, hdrColor, STRIDE } from './mesh';
import {
  BLUR_FS, COMPOSITE_FS, FULLSCREEN_VS, PHOTO_FS, PHOTO_VS,
  SCENE_FS, SCENE_VS, THRESHOLD_FS,
} from './shaders';

interface FBO {
  fb: WebGLFramebuffer;
  tex: WebGLTexture;
  w: number;
  h: number;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error('着色器编译失败: ' + gl.getShaderInfoLog(sh));
  }
  return sh;
}

function program(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error('程序链接失败: ' + gl.getProgramInfoLog(p));
  }
  return p;
}

function uniformLoc(gl: WebGL2RenderingContext, p: WebGLProgram, names: string[]): Record<string, WebGLUniformLocation | null> {
  const out: Record<string, WebGLUniformLocation | null> = {};
  for (const n of names) out[n] = gl.getUniformLocation(p, n);
  return out;
}

export interface Camera {
  centerX: number;
  centerY: number;
  /** 视口世界宽度 mm */
  viewWidth: number;
}

export class NeonRenderer {
  private gl: WebGL2RenderingContext;
  private sceneProg: WebGLProgram;
  private photoProg: WebGLProgram;
  private thresholdProg: WebGLProgram;
  private blurProg: WebGLProgram;
  private compositeProg: WebGLProgram;
  private uScene: Record<string, WebGLUniformLocation | null>;
  private uPhoto: Record<string, WebGLUniformLocation | null>;
  private uThreshold: Record<string, WebGLUniformLocation | null>;
  private uBlur: Record<string, WebGLUniformLocation | null>;
  private uComposite: Record<string, WebGLUniformLocation | null>;

  private emptyVAO: WebGLVertexArrayObject;
  private sceneVAO: WebGLVertexArrayObject;
  private sceneVBO: WebGLBuffer;
  private fillVAO: WebGLVertexArrayObject;
  private fillVBO: WebGLBuffer;
  private photoVAO: WebGLVertexArrayObject;
  private photoVBO: WebGLBuffer;

  private sceneFBO: FBO | null = null;
  private bloomA: FBO | null = null;
  private bloomB: FBO | null = null;
  private photoTex: WebGLTexture | null = null;
  private photoAspect = 1;

  camera: Camera;

  constructor(private canvas: HTMLCanvasElement, private project: ProjectData) {
    const gl = canvas.getContext('webgl2', {
      antialias: false, premultipliedAlpha: true, alpha: false, powerPreference: 'high-performance',
    });
    if (!gl) throw new Error('当前浏览器不支持 WebGL2');
    // 半浮点颜色缓冲（泛光 HDR 必需）
    const ext = gl.getExtension('EXT_color_buffer_float');
    if (!ext) throw new Error('缺少 EXT_color_buffer_float，无法做 HDR 泛光');
    this.gl = gl;

    this.sceneProg = program(gl, SCENE_VS, SCENE_FS);
    this.photoProg = program(gl, PHOTO_VS, PHOTO_FS);
    this.thresholdProg = program(gl, FULLSCREEN_VS, THRESHOLD_FS);
    this.blurProg = program(gl, FULLSCREEN_VS, BLUR_FS);
    this.compositeProg = program(gl, FULLSCREEN_VS, COMPOSITE_FS);
    this.uScene = uniformLoc(gl, this.sceneProg, ['uViewport', 'uCamCenter']);
    this.uPhoto = uniformLoc(gl, this.photoProg, ['uViewport', 'uCamCenter', 'uPhoto', 'uDim']);
    this.uThreshold = uniformLoc(gl, this.thresholdProg, ['uTex', 'uThreshold']);
    this.uBlur = uniformLoc(gl, this.blurProg, ['uTex', 'uTexel', 'uDir', 'uRadius']);
    this.uComposite = uniformLoc(gl, this.compositeProg, ['uScene', 'uBloom', 'uBloomIntensity']);

    this.emptyVAO = gl.createVertexArray()!;
    this.sceneVAO = gl.createVertexArray()!;
    this.sceneVBO = gl.createBuffer()!;
    this.fillVAO = gl.createVertexArray()!;
    this.fillVBO = gl.createBuffer()!;
    this.photoVAO = gl.createVertexArray()!;
    this.photoVBO = gl.createBuffer()!;
    this.bindInterleaved(this.sceneVAO, this.sceneVBO);
    this.bindInterleaved(this.fillVAO, this.fillVBO);
    this.initPhotoVAO();

    this.camera = { centerX: project.wall.width / 2, centerY: project.wall.height / 2, viewWidth: project.wall.width * 1.1 };
    this.resize();
  }

  private bindInterleaved(vao: WebGLVertexArrayObject, vbo: WebGLBuffer): void {
    const gl = this.gl;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    const byteStride = STRIDE * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, byteStride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, byteStride, 2 * 4);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, byteStride, 5 * 4);
    gl.bindVertexArray(null);
  }

  private initPhotoVAO(): void {
    const gl = this.gl;
    gl.bindVertexArray(this.photoVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.photoVBO);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    gl.bindVertexArray(null);
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(2, Math.floor(this.canvas.clientWidth * dpr));
    const h = Math.max(2, Math.floor(this.canvas.clientHeight * dpr));
    if (this.canvas.width === w && this.canvas.height === h) return;
    this.canvas.width = w;
    this.canvas.height = h;
    this.destroyFBOs();
    this.sceneFBO = this.createFBO(w, h);
    const bw = Math.max(2, Math.floor(w / 2));
    const bh = Math.max(2, Math.floor(h / 2));
    this.bloomA = this.createFBO(bw, bh);
    this.bloomB = this.createFBO(bw, bh);
  }

  private destroyFBOs(): void {
    for (const f of [this.sceneFBO, this.bloomA, this.bloomB]) {
      if (!f) continue;
      this.gl.deleteFramebuffer(f.fb);
      this.gl.deleteTexture(f.tex);
    }
    this.sceneFBO = this.bloomA = this.bloomB = null;
  }

  private createFBO(w: number, h: number): FBO {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('浮点帧缓冲创建失败');
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fb, tex, w, h };
  }

  /** 上传/更换墙面照片（dataURL），空串清除 */
  setPhoto(dataUrl: string): void {
    const gl = this.gl;
    if (this.photoTex) {
      gl.deleteTexture(this.photoTex);
      this.photoTex = null;
    }
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => {
      // 限制最大边 2048，控制显存与切换耗时
      const maxDim = 2048;
      let { width, height } = img;
      if (Math.max(width, height) > maxDim) {
        const s = maxDim / Math.max(width, height);
        width = Math.floor(width * s);
        height = Math.floor(height * s);
      }
      const c = document.createElement('canvas');
      c.width = width; c.height = height;
      c.getContext('2d')!.drawImage(img, 0, 0, width, height);
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.photoTex = tex;
      this.photoAspect = width / height;
      this.render();
    };
    img.src = dataUrl;
  }

  private viewHeight(): number {
    const aspect = this.canvas.width / this.canvas.height;
    return this.camera.viewWidth / aspect;
  }

  /** 屏幕像素 → 世界坐标(mm) */
  screenToWorld(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
    return {
      x: this.camera.centerX + (nx * this.camera.viewWidth) / 2,
      y: this.camera.centerY + (ny * this.viewHeight()) / 2,
    };
  }

  /** 世界 mm → 屏幕像素距离 */
  worldToScreenPx(mm: number): number {
    return (mm / this.camera.viewWidth) * this.canvas.clientWidth;
  }

  frameWall(wallW: number, wallH: number): void {
    this.camera.centerX = wallW / 2;
    this.camera.centerY = wallH / 2;
    const aspect = this.canvas.width / this.canvas.height;
    this.camera.viewWidth = Math.max(wallW * 1.05, (wallH * 1.05) * aspect);
  }

  private uploadAndDraw(vao: WebGLVertexArrayObject, vbo: WebGLBuffer, data: Float32Array, mode: number, additive: boolean): void {
    const gl = this.gl;
    if (data.length === 0) return;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    if (additive) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // 预乘 alpha
    gl.drawArrays(mode, 0, data.length / STRIDE);
    gl.bindVertexArray(null);
  }

  private drawPhoto(env: ProjectData['environment']): void {
    const gl = this.gl;
    if (!this.photoTex) return;
    const { width: ww, height: wh } = this.project.wall;
    // cover 适配：按照片宽高比铺满墙面
    const wallAspect = ww / wh;
    let pw = ww, ph = wh;
    if (this.photoAspect > wallAspect) {
      ph = wh; pw = wh * this.photoAspect;
    } else {
      pw = ww; ph = ww / this.photoAspect;
    }
    const x0 = (ww - pw) / 2, y0 = (wh - ph) / 2;
    const verts = new Float32Array([
      x0, y0, 0, 0, x0 + pw, y0, 1, 0, x0 + pw, y0 + ph, 1, 1,
      x0, y0, 0, 0, x0 + pw, y0 + ph, 1, 1, x0, y0 + ph, 0, 1,
    ]);
    gl.useProgram(this.photoProg);
    gl.uniform2f(this.uPhoto.uViewport!, this.camera.viewWidth, this.viewHeight());
    gl.uniform2f(this.uPhoto.uCamCenter!, this.camera.centerX, this.camera.centerY);
    gl.uniform1f(this.uPhoto.uDim!, ENVIRONMENTS[env].photoDim);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.photoTex);
    gl.uniform1i(this.uPhoto.uPhoto!, 0);
    gl.bindVertexArray(this.photoVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.photoVBO);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
  }

  /**
   * 渲染一帧。meshDirty 时重建几何，环境/泛光变化只换 uniform 与合成参数，
   * 保证场景切换远低于 1 秒。
   */
  render(mesh?: { tubeVerts: Float32Array; fillVerts: Float32Array }): void {
    const gl = this.gl;
    this.resize();
    if (!this.sceneFBO || !this.bloomA || !this.bloomB) return;
    const env = ENVIRONMENTS[this.project.environment];
    const { width: cw, height: ch } = this.canvas;

    // ---- Pass 1: HDR 场景 ----
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFBO.fb);
    gl.viewport(0, 0, cw, ch);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 墙面底色（环境光调制）
    const wallCol = env.wallColor;
    const wallLinear: [number, number, number] = [
      Math.pow(wallCol.r, 2.2) * env.ambientLevel,
      Math.pow(wallCol.g, 2.2) * env.ambientLevel,
      Math.pow(wallCol.b, 2.2) * env.ambientLevel,
    ];
    const wallMesh = buildWall(this.project.wall.width, this.project.wall.height, wallLinear);
    gl.useProgram(this.sceneProg);
    gl.uniform2f(this.uScene.uViewport!, this.camera.viewWidth, this.viewHeight());
    gl.uniform2f(this.uScene.uCamCenter!, this.camera.centerX, this.camera.centerY);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    this.uploadAndDraw(this.fillVAO, this.fillVBO, wallMesh, gl.TRIANGLES, false);

    // 照片背景
    this.drawPhoto(this.project.environment);

    // 元素几何
    if (mesh) {
      // 实心面（亚克力面）：预乘混合
      this.uploadAndDraw(this.fillVAO, this.fillVBO, mesh.fillVerts, gl.TRIANGLES, false);
      // 发光体：加法混合
      this.uploadAndDraw(this.sceneVAO, this.sceneVBO, mesh.tubeVerts, gl.TRIANGLES, true);
    }
    gl.disable(gl.BLEND);

    // ---- Pass 2: 亮度提取（半分辨率）----
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomA.fb);
    gl.viewport(0, 0, this.bloomA.w, this.bloomA.h);
    gl.useProgram(this.thresholdProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneFBO.tex);
    gl.uniform1i(this.uThreshold.uTex!, 0);
    gl.uniform1f(this.uThreshold.uThreshold!, 1.0);
    gl.bindVertexArray(this.emptyVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // ---- Pass 3: 两轮双向高斯（H+V ×2）----
    gl.useProgram(this.blurProg);
    gl.uniform1f(this.uBlur.uRadius!, this.project.bloom.radius);
    for (let iteration = 0; iteration < 2; iteration++) {
      // 水平
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomB.fb);
      gl.viewport(0, 0, this.bloomB.w, this.bloomB.h);
      gl.bindTexture(gl.TEXTURE_2D, this.bloomA.tex);
      gl.uniform1i(this.uBlur.uTex!, 0);
      gl.uniform2f(this.uBlur.uTexel!, 1 / this.bloomA.w, 1 / this.bloomA.h);
      gl.uniform2f(this.uBlur.uDir!, 1, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // 垂直
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.bloomA.fb);
      gl.viewport(0, 0, this.bloomA.w, this.bloomA.h);
      gl.bindTexture(gl.TEXTURE_2D, this.bloomB.tex);
      gl.uniform2f(this.uBlur.uTexel!, 1 / this.bloomB.w, 1 / this.bloomB.h);
      gl.uniform2f(this.uBlur.uDir!, 0, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // ---- Pass 4: 合成到默认缓冲 ----
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, cw, ch);
    gl.useProgram(this.compositeProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneFBO.tex);
    gl.uniform1i(this.uComposite.uScene!, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.bloomA.tex);
    gl.uniform1i(this.uComposite.uBloom!, 1);
    gl.uniform1f(this.uComposite.uBloomIntensity!, this.project.bloom.intensity);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  /** 自检用：回读默认帧缓冲的 LDR 像素 */
  readCanvasPixels(): Uint8Array {
    const gl = this.gl;
    const out = new Uint8Array(this.canvas.width * this.canvas.height * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(0, 0, this.canvas.width, this.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, out);
    return out;
  }

  dispose(): void {
    const gl = this.gl;
    this.destroyFBOs();
    if (this.photoTex) gl.deleteTexture(this.photoTex);
    for (const p of [this.sceneProg, this.photoProg, this.thresholdProg, this.blurProg, this.compositeProg]) gl.deleteProgram(p);
    for (const b of [this.sceneVBO, this.fillVBO, this.photoVBO]) gl.deleteBuffer(b);
    for (const a of [this.emptyVAO, this.sceneVAO, this.fillVAO, this.photoVAO]) gl.deleteVertexArray(a);
  }
}

export function buildMeshFor(project: ProjectData, badCornerMap: Map<string, Set<number>>, elements?: SignElement[]) {
  return buildSceneMesh(elements ?? project.elements, 2.6, badCornerMap);
}

export function ambientColor(c: RGB, level: number): [number, number, number] {
  return hdrColor(c, level);
}
