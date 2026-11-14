import { autoCutout, type CutoutOptions } from './cutout';
import type { BrushStroke } from './types';

export interface MaskLayers {
  base: HTMLCanvasElement;
  work: HTMLCanvasElement;
  restore: HTMLCanvasElement | null;
  erase: HTMLCanvasElement | null;
}

export function canvasFromImage(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  c.getContext('2d')!.drawImage(img, 0, 0);
  return c;
}

export function buildBaseMask(source: HTMLCanvasElement, opts: CutoutOptions): HTMLCanvasElement {
  return autoCutout(source, opts);
}

/** 将笔刷图层按归一化坐标绘制到指定尺寸的蒙版画布上 */
export function paintStrokes(
  target: HTMLCanvasElement,
  strokes: BrushStroke[],
  color: '#fff' | '#000',
  alpha = 1,
  blur = 0,
): void {
  const ctx = target.getContext('2d')!;
  ctx.save();
  if (blur > 0) ctx.filter = `blur(${blur}px)`;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const W = target.width;
  const H = target.height;
  for (const s of strokes) {
    if (s.points.length === 0) continue;
    const r = Math.max(0.5, s.size * Math.min(W, H));
    ctx.lineWidth = r * 2;
    if (s.points.length === 1) {
      const [px, py] = s.points[0];
      ctx.beginPath();
      ctx.arc(px * W, py * H, r * 0.6, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(s.points[0][0] * W, s.points[0][1] * H);
    for (let i = 1; i < s.points.length; i++) {
      const [px, py] = s.points[i];
      ctx.lineTo(px * W, py * H);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** 生成合成蒙版：base + restore(白) + erase(黑) */
export function compositeMask(
  base: HTMLCanvasElement,
  strokes: BrushStroke[],
  feather: number,
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = base.width;
  c.height = base.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(base, 0, 0);

  const restore = strokes.filter((s) => s.mode === 'restore');
  const erase = strokes.filter((s) => s.mode === 'erase');
  if (restore.length) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    paintStrokes(c, restore, '#fff', 1, 0);
  }
  if (erase.length) {
    ctx.globalCompositeOperation = 'destination-out';
    paintStrokes(c, erase, '#000', 1, 0);
    ctx.globalCompositeOperation = 'source-over';
  }

  if (feather > 0) {
    const soft = document.createElement('canvas');
    soft.width = c.width;
    soft.height = c.height;
    const sctx = soft.getContext('2d')!;
    sctx.filter = `blur(${feather}px)`;
    sctx.drawImage(c, 0, 0);
    return soft;
  }
  return c;
}
