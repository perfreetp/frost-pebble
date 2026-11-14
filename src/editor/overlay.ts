// 2D 叠加层：网格、吸附提示、绘制中路径、选中框、顶点手柄、折弯标红、尺寸
import type { ProjectData, SignElement, Vec2 } from '../types';
import type { Camera } from '../render/NeonRenderer';
import type { SnapResult } from '../core/snap';
import { ENVIRONMENTS } from '../core/defaults';
import { sampleTubePath } from '../core/geometry';

export interface OverlayState {
  project: ProjectData;
  camera: Camera;
  selectedId: string | null;
  draftPoints: Vec2[];
  snap: SnapResult | null;
  badCornerMap: Map<string, Set<number>>;
  /** 鼠标当前世界位置 */
  cursor: Vec2 | null;
  hoverId: string | null;
}

export class Overlay {
  private ctx: CanvasRenderingContext2D;
  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(this.canvas.clientWidth * dpr);
    const h = Math.floor(this.canvas.clientHeight * dpr);
    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private toScreen(p: Vec2, cam: Camera, cw: number, ch: number): Vec2 {
    const vh = cam.viewWidth / (cw / ch);
    return {
      x: ((p.x - cam.centerX) / cam.viewWidth + 0.5) * cw,
      y: (0.5 - (p.y - cam.centerY) / vh) * ch,
    };
  }

  draw(state: OverlayState): void {
    const ctx = this.ctx;
    const cw = this.canvas.clientWidth;
    const ch = this.canvas.clientHeight;
    ctx.clearRect(0, 0, cw, ch);
    const { project, camera } = state;
    const env = ENVIRONMENTS[project.environment];
    const dark = env.key !== 'day';
    const lineCol = dark ? 'rgba(255,255,255,0.55)' : 'rgba(20,20,30,0.6)';
    const faintCol = dark ? 'rgba(255,255,255,0.16)' : 'rgba(20,20,30,0.18)';

    // 网格
    const vh = camera.viewWidth / (cw / ch);
    const g = project.settings.gridSize;
    const x0 = Math.floor((camera.centerX - camera.viewWidth / 2) / g) * g;
    const y0 = Math.floor((camera.centerY - vh / 2) / g) * g;
    ctx.lineWidth = 1;
    ctx.strokeStyle = faintCol;
    ctx.beginPath();
    for (let x = x0; x <= camera.centerX + camera.viewWidth / 2; x += g) {
      const s = this.toScreen({ x, y: 0 }, camera, cw, ch);
      ctx.moveTo(s.x, 0); ctx.lineTo(s.x, ch);
    }
    for (let y = y0; y <= camera.centerY + vh / 2; y += g) {
      const s = this.toScreen({ x: 0, y }, camera, cw, ch);
      ctx.moveTo(0, s.y); ctx.lineTo(cw, s.y);
    }
    ctx.stroke();

    // 墙面边框
    const wallPts = [
      { x: 0, y: 0 }, { x: project.wall.width, y: 0 },
      { x: project.wall.width, y: project.wall.height }, { x: 0, y: project.wall.height },
    ].map((p) => this.toScreen(p, camera, cw, ch));
    ctx.strokeStyle = lineCol;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    wallPts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.stroke();

    // 已有元素的顶点与折弯告警
    for (const el of project.elements) {
      const bad = state.badCornerMap.get(el.id);
      if (el.kind === 'acrylic') {
        if (el.id === state.selectedId || el.id === state.hoverId) this.drawRingHandles(el, camera, cw, ch, lineCol);
      } else {
        const sampled = sampleTubePath(el.points, el.cornerRadii, 6);
        if (el.id === state.hoverId || el.id === state.selectedId) {
          ctx.strokeStyle = 'rgba(120,200,255,0.9)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          sampled.forEach((p, i) => {
            const s = this.toScreen(p, camera, cw, ch);
            i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
          });
          ctx.stroke();
        }
        el.points.forEach((p, i) => {
          const s = this.toScreen(p, camera, cw, ch);
          const isCorner = i > 0 && i < el.points.length - 1;
          const isBad = isCorner && bad?.has(i - 1);
          ctx.fillStyle = isBad ? '#ff4040' : el.id === state.selectedId ? '#7fd0ff' : 'rgba(255,255,255,0.75)';
          ctx.beginPath();
          ctx.arc(s.x, s.y, isCorner ? 4.5 : 5.5, 0, Math.PI * 2);
          ctx.fill();
          if (isBad) {
            ctx.strokeStyle = '#ff8080';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(s.x, s.y, 9, 0, Math.PI * 2);
            ctx.stroke();
          }
        });
      }
    }

    // 绘制中的路径
    if (state.draftPoints.length > 0) {
      ctx.strokeStyle = '#7fd0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      state.draftPoints.forEach((p, i) => {
        const s = this.toScreen(p, camera, cw, ch);
        i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
      });
      if (state.cursor) {
        const s = this.toScreen(state.cursor, camera, cw, ch);
        ctx.lineTo(s.x, s.y);
      }
      ctx.stroke();
      for (const p of state.draftPoints) {
        const s = this.toScreen(p, camera, cw, ch);
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 吸附提示
    if (state.snap && state.snap.source !== 'none' && state.cursor) {
      const s = this.toScreen(state.snap.point, camera, cw, ch);
      ctx.strokeStyle = state.snap.source === 'endpoint' ? '#ffd166' : '#8affc1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = '11px sans-serif';
      ctx.fillText(state.snap.source === 'endpoint' ? '端点吸附' : '网格吸附', s.x + 12, s.y - 8);
    }

    // 选中尺寸标注
    const sel = project.elements.find((e) => e.id === state.selectedId);
    if (sel) this.drawDimensions(sel, camera, cw, ch, lineCol);
  }

  private drawRingHandles(el: Extract<SignElement, { kind: 'acrylic' }>, cam: Camera, cw: number, ch: number, col: string): void {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(120,200,255,0.9)';
    ctx.lineWidth = 1.5;
    for (const ring of el.contours) {
      ctx.beginPath();
      ring.forEach((p, i) => {
        const s = this.toScreen(p, cam, cw, ch);
        i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
      });
      ctx.closePath();
      ctx.stroke();
    }
    ctx.fillStyle = '#7fd0ff';
    for (const ring of el.contours) {
      for (const p of ring) {
        const s = this.toScreen(p, cam, cw, ch);
        ctx.beginPath();
        ctx.arc(s.x, s.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    void col;
  }

  private drawDimensions(el: SignElement, cam: Camera, cw: number, ch: number, col: string): void {
    const ctx = this.ctx;
    const pts = el.kind === 'acrylic' ? el.contours.flat() : el.points;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of pts) {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    const a = this.toScreen({ x: minX, y: minY }, cam, cw, ch);
    const b = this.toScreen({ x: maxX, y: maxY }, cam, cw, ch);
    ctx.strokeStyle = col;
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1;
    ctx.strokeRect(a.x, b.y, b.x - a.x, a.y - b.y);
    ctx.setLineDash([]);
    ctx.fillStyle = col;
    ctx.font = '11px sans-serif';
    ctx.fillText(`${Math.round(maxX - minX)} × ${Math.round(maxY - minY)} mm`, a.x, b.y - 6);
  }
}
