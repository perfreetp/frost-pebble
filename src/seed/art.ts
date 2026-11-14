// Procedural artwork for the demo library. Everything here draws with the
// 2D canvas API so the app ships with a believable starting library without
// bundling binary assets.

export type Ctx = CanvasRenderingContext2D;

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return [c, ctx];
}

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Soft studio sweep with a gentle falloff and fine sensor grain. */
export function paintSweep(ctx: Ctx, w: number, h: number, top: string, bottom: string, seed = 7) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(0.62, bottom);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Corner falloff, as if lit from above-front.
  const v = ctx.createRadialGradient(w * 0.5, h * 0.42, w * 0.18, w * 0.5, h * 0.5, w * 0.82);
  v.addColorStop(0, 'rgba(255,255,255,0.10)');
  v.addColorStop(0.55, 'rgba(255,255,255,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.20)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);

  const rand = rng(seed);
  const grains = Math.floor((w * h) / 900);
  ctx.save();
  for (let i = 0; i < grains; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const a = rand() * 0.035;
    ctx.fillStyle = rand() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

/** Elliptical contact shadow under a product. */
export function paintContactShadow(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, alpha = 0.32) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
  g.addColorStop(0, `rgba(20,22,26,${alpha})`);
  g.addColorStop(0.55, `rgba(20,22,26,${alpha * 0.55})`);
  g.addColorStop(1, 'rgba(20,22,26,0)');
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  ctx.translate(-cx, -cy);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export interface TubeStyle {
  width: number;
  light: string;
  mid: string;
  dark: string;
}

/** Stroke a path as a chrome/powder-coated tube with a cylindrical highlight. */
export function tube(ctx: Ctx, path: Path2D, style: TubeStyle) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Base body
  ctx.strokeStyle = style.mid;
  ctx.lineWidth = style.width;
  ctx.stroke(path);
  // Top-left specular: offset stroke, thinner, brighter.
  ctx.strokeStyle = style.light;
  ctx.lineWidth = style.width * 0.34;
  ctx.globalAlpha = 0.85;
  ctx.translate(-style.width * 0.13, -style.width * 0.16);
  ctx.stroke(path);
  ctx.translate(style.width * 0.13, style.width * 0.16);
  // Bottom-right occlusion.
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = style.dark;
  ctx.lineWidth = style.width * 0.22;
  ctx.translate(style.width * 0.16, style.width * 0.18);
  ctx.stroke(path);
  ctx.restore();
}

export function grip(ctx: Ctx, path: Path2D, width: number, color = '#22262c') {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = width + 6;
  ctx.stroke(path);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke(path);
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = width * 0.26;
  ctx.translate(-width * 0.14, -width * 0.2);
  ctx.stroke(path);
  ctx.restore();
}

export function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  const p = new Path2D();
  p.moveTo(x + rr, y);
  p.arcTo(x + w, y, x + w, y + h, rr);
  p.arcTo(x + w, y + h, x, y + h, rr);
  p.arcTo(x, y + h, x, y, rr);
  p.arcTo(x, y, x + w, y, rr);
  p.closePath();
  return p;
}

export function fillWithLight(ctx: Ctx, path: Path2D, base: string, highlight: string, shadow: string, bbox: [number, number, number, number]) {
  const [x, y, w, h] = bbox;
  const g = ctx.createLinearGradient(x, y, x + w * 0.35, y + h);
  g.addColorStop(0, highlight);
  g.addColorStop(0.35, base);
  g.addColorStop(1, shadow);
  ctx.fillStyle = g;
  ctx.fill(path);
}

export function wheel(ctx: Ctx, cx: number, cy: number, r: number, rim = '#2a2f36') {
  // tyre
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const tg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
  tg.addColorStop(0, '#4a5058');
  tg.addColorStop(0.7, '#22262b');
  tg.addColorStop(1, '#14171b');
  ctx.fillStyle = tg;
  ctx.fill();

  // rim
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.lineWidth = r * 0.1;
  ctx.strokeStyle = '#b9c0c8';
  ctx.stroke();

  // spokes
  ctx.strokeStyle = 'rgba(196,203,211,0.85)';
  ctx.lineWidth = Math.max(2, r * 0.035);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r * 0.2, cy + Math.sin(a) * r * 0.2);
    ctx.lineTo(cx + Math.cos(a) * r * 0.74, cy + Math.sin(a) * r * 0.74);
    ctx.stroke();
  }
  // hub
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = rim;
  ctx.fill();
  ctx.restore();
}

export function vignette(ctx: Ctx, w: number, h: number, strength = 0.35) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.78);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas encode failed'))), type, quality),
  );
}

export function canvasToDataUrl(canvas: HTMLCanvasElement, size = 240): string {
  const [c, ctx] = makeCanvas(size, size);
  const s = Math.min(canvas.width, canvas.height);
  const sx = (canvas.width - s) / 2;
  const sy = (canvas.height - s) / 2;
  ctx.drawImage(canvas, sx, sy, s, s, 0, 0, size, size);
  return c.toDataURL('image/jpeg', 0.82);
}
