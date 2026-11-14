import { presetInfo, type Batch, type ComposeSettings } from './types';
import { fmtDate } from './utils';

export const SHEET_W = 1200;
export const PLATE_W = 952;
export const PLATE_H = 1208;
export const SHEET_H = 1600;
const PLATE = { x: 176, y: 196, w: 952, h: 1208 };
const BASE_Y = PLATE.y + PLATE.h - 46;
const MAX_SUBJECT_H = 1060;
const MAX_SUBJECT_W = 860;

function cv(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图像加载失败'));
    img.src = src;
  });
}

function seeded(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** 按场景绘制背景，包含光位、地平线、地面材质与色温底子 */
export function paintScene(scene: ComposeSettings['background'], w: number, h: number): HTMLCanvasElement {
  const rand = seeded(scene.length * 977 + 13);
  const c = cv(w, h);
  const ctx = c.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  switch (scene) {
    case 'field':
      grad.addColorStop(0, '#f8e8c8');
      grad.addColorStop(0.3, '#e2eccd');
      grad.addColorStop(0.5, '#c3d4a8');
      grad.addColorStop(0.53, '#9c8f66');
      grad.addColorStop(0.8, '#7a6748');
      grad.addColorStop(1, '#55462e');
      break;
    case 'cool':
      grad.addColorStop(0, '#e9eff3');
      grad.addColorStop(0.38, '#d2dee4');
      grad.addColorStop(0.52, '#b3c5ba');
      grad.addColorStop(0.54, '#84907f');
      grad.addColorStop(0.82, '#68735f');
      grad.addColorStop(1, '#4e5749');
      break;
    case 'greenhouse':
      grad.addColorStop(0, '#f4f9e8');
      grad.addColorStop(0.34, '#e0eed3');
      grad.addColorStop(0.58, '#c6dab6');
      grad.addColorStop(0.6, '#93a07f');
      grad.addColorStop(0.85, '#7b8a6d');
      grad.addColorStop(1, '#5d6a54');
      break;
    default:
      grad.addColorStop(0, '#4d545c');
      grad.addColorStop(0.4, '#383d44');
      grad.addColorStop(0.62, '#2b2f34');
      grad.addColorStop(0.63, '#232629');
      grad.addColorStop(0.9, '#1c1f22');
      grad.addColorStop(1, '#16181a');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  if (scene === 'studio') {
    const glow = ctx.createRadialGradient(w * 0.34, h * 0.12, 8, w * 0.34, h * 0.12, w * 0.7);
    glow.addColorStop(0, 'rgba(255,255,255,0.3)');
    glow.addColorStop(0.45, 'rgba(255,255,255,0.07)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    const floor = ctx.createLinearGradient(0, h * 0.62, 0, h);
    floor.addColorStop(0, 'rgba(255,255,255,0.06)');
    floor.addColorStop(0.65, 'rgba(198,210,222,0.12)');
    floor.addColorStop(1, 'rgba(170,186,202,0.04)');
    ctx.fillStyle = floor;
    ctx.fillRect(0, h * 0.62, w, h * 0.38);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(0, h * 0.62, w, 2);
  } else if (scene === 'field') {
    const sun = ctx.createRadialGradient(w * 0.78, h * 0.18, 4, w * 0.78, h * 0.18, w * 0.46);
    sun.addColorStop(0, 'rgba(255,248,214,0.7)');
    sun.addColorStop(0.32, 'rgba(255,238,186,0.2)');
    sun.addColorStop(1, 'rgba(255,238,186,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(110,128,84,0.55)';
    for (let x = -20; x < w + 20; x += 13) {
      ctx.beginPath();
      ctx.ellipse(x, h * 0.545, 18 + rand() * 14, 22 + rand() * 42, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 110; i++) {
      ctx.strokeStyle = `rgba(${58 + rand() * 44},${46 + rand() * 30},${26 + rand() * 24},${0.1 + rand() * 0.2})`;
      ctx.lineWidth = 1 + rand() * 2;
      const x = rand() * w;
      const y = h * (0.58 + rand() * 0.4);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rand() - 0.5) * 80, y + 2 + rand() * 7);
      ctx.stroke();
    }
  } else if (scene === 'cool') {
    for (let i = 0; i < 5; i++) {
      const x = rand() * w;
      const y = h * (0.06 + rand() * 0.32);
      const rx = 90 + rand() * 180;
      const cloud = ctx.createRadialGradient(x, y, 4, x, y, rx);
      cloud.addColorStop(0, 'rgba(255,255,255,0.5)');
      cloud.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = cloud;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, rx * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(102,120,102,0.3)';
    for (let x = -20; x < w + 20; x += 17) {
      ctx.beginPath();
      ctx.ellipse(x, h * 0.56, 17 + rand() * 13, 16 + rand() * 24, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    }
  } else if (scene === 'greenhouse') {
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const cx = w * (0.15 + i * 0.24);
      ctx.beginPath();
      ctx.ellipse(cx, h * 0.42, w * 0.27, h * 0.42, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(92,106,72,0.2)';
    ctx.lineWidth = 2;
    for (let k = 0; k < 3; k++) {
      const y = h * (0.16 + k * 0.13);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(88,100,76,0.28)';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(0, h * (0.62 + i * 0.075), w, 6 - i * 2);
    }
  }

  for (let i = 0; i < 420; i++) {
    ctx.fillStyle = `rgba(0,0,0,${rand() * 0.05})`;
    ctx.fillRect(rand() * w, rand() * h, 1.4, 1.4);
  }
  const vig = ctx.createRadialGradient(w / 2, h * 0.48, h * 0.3, w / 2, h * 0.5, h * 0.84);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.34)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  return c;
}

/** 按蒙版裁出主体，并按场景色温给主体轻微补光调色 */
interface SizedSource {
  source: HTMLCanvasElement | HTMLImageElement;
  width: number;
  height: number;
}

function extractSubject(photo: SizedSource, mask: HTMLCanvasElement | HTMLImageElement, preset: ReturnType<typeof presetInfo>): HTMLCanvasElement {
  const c = cv(photo.width, photo.height);
  const ctx = c.getContext('2d')!;
  ctx.drawImage(photo.source, 0, 0, c.width, c.height);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(mask, 0, 0, c.width, c.height);
  ctx.globalCompositeOperation = 'source-atop';

  const tintMag = (Math.abs(preset.tint[0]) + Math.abs(preset.tint[1]) + Math.abs(preset.tint[2])) / 3;
  if (tintMag > 3) {
    const warm = preset.tint[0] > 0;
    const tint = warm ? `rgba(255,${170 + preset.tint[1] * 4},110,1)` : 'rgba(140,180,255,1)';
    // 用 source-atop 保证调色只落在主体像素上，不会在透明区留下色块
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = Math.min(0.22, tintMag / 60);
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  return c;
}

/** 蒙版不透明区域的外接框，即主体的实际边界（避免照片留白影响标尺刻度） */
export function maskBounds(mask: HTMLCanvasElement | HTMLImageElement, w: number, h: number): { x: number; y: number; w: number; h: number } {
  const c = cv(w, h);
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(mask, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  // 先按连通域统计面积，忽略花盆、石块等小杂物对取景框的影响
  const label = new Int32Array(w * h).fill(-1);
  const stack = new Int32Array(w * h);
  const comps: { area: number; minX: number; minY: number; maxX: number; maxY: number }[] = [];
  let total = 0;
  for (let start = 0; start < w * h; start++) {
    if (label[start] !== -1 || data[start * 4 + 3] <= 40) continue;
    const idx = comps.length;
    let sp = 0;
    stack[sp++] = start;
    label[start] = idx;
    const comp = { area: 0, minX: w, minY: h, maxX: -1, maxY: -1 };
    while (sp > 0) {
      const p = stack[--sp];
      const x = p % w;
      const y = (p / w) | 0;
      comp.area += 1;
      if (x < comp.minX) comp.minX = x;
      if (x > comp.maxX) comp.maxX = x;
      if (y < comp.minY) comp.minY = y;
      if (y > comp.maxY) comp.maxY = y;
      const nb = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1];
      for (const q of nb) {
        if (q < 0 || label[q] !== -1 || data[q * 4 + 3] <= 40) continue;
        label[q] = idx;
        stack[sp++] = q;
      }
    }
    comps.push(comp);
    total += comp.area;
  }
  if (!comps.length) return { x: 0, y: 0, w, h };

  const minKeep = Math.max(28, total * 0.004);
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (const c of comps) {
    if (c.area < minKeep) continue;
    if (c.minX < minX) minX = c.minX;
    if (c.maxX > maxX) maxX = c.maxX;
    if (c.minY < minY) minY = c.minY;
    if (c.maxY > maxY) maxY = c.maxY;
  }
  if (maxX < 0) {
    const big = comps.reduce((a, b) => (a.area >= b.area ? a : b));
    return { x: big.minX, y: big.minY, w: big.maxX - big.minX + 1, h: big.maxY - big.minY + 1 };
  }
  return { x: minX, y: minY, w: Math.max(1, maxX - minX + 1), h: Math.max(1, maxY - minY + 1) };
}

function subjectRect(bounds: { w: number; h: number }, heightCm: number) {
  const scale = Math.min(MAX_SUBJECT_H / bounds.h, MAX_SUBJECT_W / bounds.w);
  const w = bounds.w * scale;
  const h = bounds.h * scale;
  const x = (SHEET_W - w) / 2 + 70;
  const y = BASE_Y - h;
  const pxPerCm = heightCm > 0 ? h / heightCm : 0;
  return { x, y, w, h, pxPerCm };
}

function drawShadow(
  ctx: CanvasRenderingContext2D,
  mask: SizedSource,
  bounds: { x: number; y: number; w: number; h: number },
  rect: ReturnType<typeof subjectRect>,
  settings: ComposeSettings,
  preset: ReturnType<typeof presetInfo>,
) {
  const strength = settings.shadow;
  if (strength <= 0.01) return;
  const groundY = rect.y + rect.h;

  // 落地接触阴影
  const contact = ctx.createRadialGradient(
    rect.x + rect.w / 2 + preset.shadowDx * 0.35, groundY, 2,
    rect.x + rect.w / 2 + preset.shadowDx * 0.35, groundY, rect.w * 0.5,
  );
  contact.addColorStop(0, `rgba(0,0,0,${0.36 * strength})`);
  contact.addColorStop(0.55, `rgba(0,0,0,${0.15 * strength})`);
  contact.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = contact;
  ctx.beginPath();
  ctx.ellipse(rect.x + rect.w / 2 + preset.shadowDx * 0.35, groundY, rect.w * 0.46, 14 + strength * 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // 轮廓投影，方向与色温随场景
  const sil = cv(SHEET_W, SHEET_H);
  const sctx = sil.getContext('2d')!;
  sctx.filter = `blur(${Math.round(7 + (1 - strength) * 6)}px)`;
  sctx.drawImage(mask.source, bounds.x, bounds.y, bounds.w, bounds.h, rect.x, rect.y, rect.w, rect.h);
  sctx.filter = 'none';
  sctx.globalCompositeOperation = 'source-in';
  sctx.fillStyle = 'rgb(10,12,10)';
  sctx.fillRect(0, 0, SHEET_W, SHEET_H);

  ctx.save();
  // 影子只作为轻微贴地暗示，避免出现"第二个树影"的观感
  ctx.globalAlpha = Math.min(0.3, 0.1 + strength * 0.24);
  ctx.drawImage(sil, preset.shadowDx * 0.55, preset.shadowDy * 0.5);
  ctx.restore();
}

function drawTemperature(ctx: CanvasRenderingContext2D, preset: ReturnType<typeof presetInfo>) {
  const delta = preset.tempK - 5600;
  if (Math.abs(delta) < 70) return;
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = Math.min(0.26, Math.abs(delta) / 9000 + 0.07);
  ctx.fillStyle = delta < 0 ? '#ffb060' : '#8ebcff';
  ctx.fillRect(0, 0, SHEET_W, SHEET_H);
  ctx.restore();
}

function drawRuler(
  ctx: CanvasRenderingContext2D,
  rect: ReturnType<typeof subjectRect>,
  heightCm: number,
  diameterMm: number,
  inspect: boolean,
) {
  if (rect.pxPerCm <= 0) return;
  const x0 = PLATE.x - 26;
  const stepCm = heightCm <= 40 ? 2 : heightCm <= 120 ? 5 : 10;
  const ink = inspect ? 'rgba(255,255,255,0.72)' : 'rgba(32,42,34,0.6)';
  const accent = inspect ? '#ffef9a' : '#1f3a2a';

  ctx.save();
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineWidth = 1.2;
  ctx.font = '17px "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.beginPath();
  ctx.moveTo(x0, rect.y + rect.h);
  ctx.lineTo(x0, rect.y - 22);
  ctx.stroke();

  for (let cm = 0; cm <= heightCm + 1e-6; cm += stepCm) {
    const y = rect.y + rect.h - cm * rect.pxPerCm;
    const major = Math.round(cm) % (stepCm * 2) === 0;
    ctx.lineWidth = major ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x0 + (major ? 16 : 9), y);
    ctx.stroke();
    if (major && cm > 0) ctx.fillText(String(Math.round(cm)), x0 - 6, y);
  }

  ctx.textAlign = 'left';
  ctx.font = '600 19px "Segoe UI", "Microsoft YaHei", sans-serif';
  ctx.fillText('高度 cm', x0 - 34, rect.y - 42);

  // 地径卡尺
  const dy = rect.y + rect.h - Math.max(26, rect.h * 0.075);
  const half = Math.max(34, (diameterMm / 10) * rect.pxPerCm * 1.15 + 30);
  const cxm = rect.x + rect.w / 2;
  ctx.strokeStyle = inspect ? 'rgba(255,244,150,0.92)' : 'rgba(28,64,44,0.72)';
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.moveTo(cxm - half, dy);
  ctx.lineTo(cxm + half, dy);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const dir of [-1, 1]) {
    const ax = cxm + dir * half;
    ctx.beginPath();
    ctx.moveTo(ax, dy - 22);
    ctx.lineTo(ax, dy + 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ax - dir * 11, dy - 6);
    ctx.lineTo(ax, dy);
    ctx.lineTo(ax - dir * 11, dy + 6);
    ctx.stroke();
  }
  ctx.fillStyle = accent;
  ctx.font = '600 19px "Segoe UI", "Microsoft YaHei", sans-serif';
  const label = `地径 Ø${diameterMm} mm`;
  ctx.fillText(label, cxm - ctx.measureText(label).width / 2, dy - 36);
  ctx.restore();
}

function drawInspectGrid(ctx: CanvasRenderingContext2D, rect: ReturnType<typeof subjectRect>) {
  const step = rect.pxPerCm * 10;
  if (step < 8) return;
  const x0 = PLATE.x;
  const x1 = PLATE.x + PLATE.w;
  const y0 = rect.y - 16;
  const y1 = rect.y + rect.h + 8;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, PLATE.y, PLATE.w, PLATE.h);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  for (let y = rect.y + rect.h; y > y0; y -= step) {
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
  }
  const cxm = rect.x + rect.w / 2;
  for (let x = cxm; x < x1; x += step) {
    for (const px of [x, 2 * cxm - x]) {
      ctx.beginPath();
      ctx.moveTo(px, y0);
      ctx.lineTo(px, y1);
      ctx.stroke();
    }
  }
  // 中轴与基径基准线
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.4;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(cxm, y0);
  ctx.lineTo(cxm, rect.y + rect.h + 14);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,226,120,0.8)';
  ctx.beginPath();
  ctx.moveTo(x0, rect.y + rect.h);
  ctx.lineTo(x1, rect.y + rect.h);
  ctx.stroke();
  ctx.restore();
}

function drawFrame(ctx: CanvasRenderingContext2D, inspect: boolean) {
  ctx.save();
  ctx.strokeStyle = inspect ? 'rgba(255,255,255,0.32)' : 'rgba(48,52,46,0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(PLATE.x, PLATE.y, PLATE.w, PLATE.h);
  ctx.strokeStyle = inspect ? 'rgba(255,255,255,0.14)' : 'rgba(48,52,46,0.24)';
  ctx.lineWidth = 1;
  ctx.strokeRect(PLATE.x + 9, PLATE.y + 9, PLATE.w - 18, PLATE.h - 18);
  ctx.restore();
}

function drawHeader(ctx: CanvasRenderingContext2D, meta: ComposeMeta, preset: ReturnType<typeof presetInfo>, inspect: boolean) {
  const b = meta.batch;
  if (inspect) {
    ctx.fillStyle = '#101d17';
    ctx.fillRect(0, 0, SHEET_W, PLATE.y - 20);
    ctx.fillStyle = '#e9f3e2';
    ctx.font = '700 42px "Segoe UI", "Microsoft YaHei", sans-serif';
    ctx.fillText('苗木出圃查验图 · INSPECTION', 60, 74);
    ctx.fillStyle = 'rgba(233,243,226,0.66)';
    ctx.font = '23px "Segoe UI", "Microsoft YaHei", sans-serif';
    ctx.fillText(`批次 ${b.code}　${b.variety} ${b.cultivar}　样苗 ${meta.photoName}　版本 V${meta.versionNo}`, 62, 118);
    ctx.fillStyle = 'rgba(233,243,226,0.4)';
    ctx.font = '19px "Segoe UI", "Microsoft YaHei", sans-serif';
    ctx.fillText(
      `查验网格 10 cm　高度刻度　地径卡尺　　色温 ${preset.tempK}K ${preset.temp}　　投影 ${Math.round(meta.shadow * 100)}%`,
      62, 152,
    );
    ctx.fillStyle = '#d97b52';
    ctx.fillRect(0, PLATE.y - 20, SHEET_W, 4);
  } else {
    ctx.fillStyle = '#f3efe6';
    ctx.fillRect(0, 0, SHEET_W, PLATE.y - 20);
    ctx.fillStyle = '#243128';
    ctx.font = '700 42px "Segoe UI", "Microsoft YaHei", sans-serif';
    ctx.fillText('苗木规格图 · SPEC', 60, 74);
    ctx.fillStyle = 'rgba(36,49,40,0.62)';
    ctx.font = '23px "Segoe UI", "Microsoft YaHei", sans-serif';
    ctx.fillText(`批次 ${b.code}　${b.variety} ${b.cultivar}　${b.ageYears} 年生　样苗 ${meta.photoName}`, 62, 118);
    ctx.fillStyle = 'rgba(36,49,40,0.42)';
    ctx.font = '19px "Segoe UI", "Microsoft YaHei", sans-serif';
    ctx.fillText(`地径 ${b.diameterMin}–${b.diameterMax} cm　苗高 ${b.heightMin}–${b.heightMax} cm　出圃 ${b.quantity} 株　　版本 V${meta.versionNo}`, 62, 152);
    ctx.fillStyle = '#2f5d3c';
    ctx.fillRect(0, PLATE.y - 20, SHEET_W, 4);
  }
}

function drawFooter(ctx: CanvasRenderingContext2D, meta: ComposeMeta, preset: ReturnType<typeof presetInfo>, inspect: boolean) {
  const footY = PLATE.y + PLATE.h + 24;
  const footH = SHEET_H - footY - 24;
  const b = meta.batch;

  if (inspect) {
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(PLATE.x, footY, PLATE.w, footH);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(PLATE.x, footY, PLATE.w, footH);
    ctx.fillStyle = '#e9f3e2';
    ctx.font = '600 24px "Segoe UI", "Microsoft YaHei", sans-serif';
    ctx.fillText(`高度 ${meta.heightCm} cm　地径 Ø${meta.diameterMm} mm　抽检阈值 ${b.heightMin}–${b.heightMax} cm / ${b.diameterMin}–${b.diameterMax} cm`, PLATE.x + 26, footY + 42);
    ctx.fillStyle = 'rgba(233,243,226,0.62)';
    ctx.font = '20px "Segoe UI", "Microsoft YaHei", sans-serif';
    ctx.fillText(`成像 ${preset.name} · ${preset.tempK}K ${preset.temp} · 羽化 ${meta.feather.toFixed(1)}px`, PLATE.x + 26, footY + 78);
    ctx.fillText(`版本 V${meta.versionNo}　存于 ${fmtDate(meta.savedAt)}　${meta.savedBy ?? ''}`, PLATE.x + 26, footY + 112);

    ctx.save();
    ctx.translate(PLATE.x + PLATE.w - 132, footY + footH / 2);
    ctx.rotate(-0.14);
    ctx.strokeStyle = 'rgba(224,110,88,0.92)';
    ctx.fillStyle = 'rgba(224,110,88,0.12)';
    ctx.lineWidth = 4;
    ctx.strokeRect(-96, -50, 192, 100);
    ctx.fill();
    ctx.fillStyle = 'rgba(236,146,120,0.98)';
    ctx.textAlign = 'center';
    ctx.font = '700 36px "Microsoft YaHei", sans-serif';
    ctx.fillText('待 查 验', 0, 2);
    ctx.font = '17px "Segoe UI", sans-serif';
    ctx.fillText(`V${meta.versionNo} · ${meta.photoName}`, 0, 34);
    ctx.restore();
  } else {
    ctx.fillStyle = 'rgba(36,49,40,0.06)';
    ctx.fillRect(PLATE.x, footY, PLATE.w, footH);
    ctx.fillStyle = '#243128';
    ctx.font = '600 25px "Segoe UI", "Microsoft YaHei", sans-serif';
    ctx.fillText(`规格：高度 ${meta.heightCm} cm ，地径 Ø${meta.diameterMm} mm ，出圃 ${b.quantity} 株`, PLATE.x + 24, footY + 44);
    ctx.fillStyle = 'rgba(36,49,40,0.68)';
    ctx.font = '20px "Segoe UI", "Microsoft YaHei", sans-serif';
    ctx.fillText(`场景 ${preset.name}｜色温 ${preset.tempK}K ${preset.temp}｜投影 ${Math.round(meta.shadow * 100)}%｜羽化 ${meta.feather.toFixed(1)}px`, PLATE.x + 24, footY + 80);
    ctx.fillText(`版本 V${meta.versionNo}｜${fmtDate(meta.savedAt)}｜样苗 ${meta.photoName}`, PLATE.x + 24, footY + 114);

    const chips = ['#f3efe6', '#cbd6c8', '#8da48b', '#5b7059', '#2e4033', '#111a14'];
    chips.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(SHEET_W - 300 + i * 42, footY + 26, 34, 34);
    });
    ctx.fillStyle = 'rgba(36,49,40,0.5)';
    ctx.font = '15px "Segoe UI", sans-serif';
    ctx.fillText('灰度参照 6000K', SHEET_W - 300, footY + 76);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(36,49,40,0.42)';
    ctx.font = '17px "Segoe UI", sans-serif';
    ctx.fillText('Nursery Dispatch Archive', SHEET_W - 60, footY + footH - 16);
    ctx.textAlign = 'left';
  }
}

export interface ComposeMeta {
  batch: Batch;
  versionNo: number;
  photoName: string;
  sampleNote?: string;
  savedAt: string;
  savedBy?: string;
  heightCm: number;
  diameterMm: number;
  feather: number;
  shadow: number;
}

export interface ComposeResult {
  specUrl: string;
  inspectUrl: string;
  thumbUrl: string;
}

export function composeFromSources(
  photo: SizedSource,
  mask: HTMLImageElement | HTMLCanvasElement,
  settings: ComposeSettings,
  meta: ComposeMeta,
): ComposeResult {
  const maskW = mask instanceof HTMLImageElement ? mask.naturalWidth : mask.width;
  const maskH = mask instanceof HTMLImageElement ? mask.naturalHeight : mask.height;
  const maskSized: SizedSource = { source: mask, width: maskW, height: maskH };
  const preset = presetInfo(settings.background);
  const scene = paintScene(settings.background, PLATE.w, PLATE.h);
  const subject = extractSubject(photo, maskSized.source, preset);
  // 以蒙版实际外接框定位与定标：标尺读到的主体高度即真实株高
  const bounds = maskBounds(mask, maskSized.width, maskSized.height);
  const rect = subjectRect(bounds, meta.heightCm);

  const build = (inspect: boolean) => {
    const c = cv(SHEET_W, SHEET_H);
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = inspect ? '#16211b' : '#f3efe6';
    ctx.fillRect(0, 0, SHEET_W, SHEET_H);

    ctx.save();
    ctx.beginPath();
    ctx.rect(PLATE.x, PLATE.y, PLATE.w, PLATE.h);
    ctx.clip();
    ctx.drawImage(scene, PLATE.x, PLATE.y, PLATE.w, PLATE.h);
    const fade = ctx.createLinearGradient(0, PLATE.y + PLATE.h - 110, 0, PLATE.y + PLATE.h);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(1, 'rgba(0,0,0,0.26)');
    ctx.fillStyle = fade;
    ctx.fillRect(PLATE.x, PLATE.y + PLATE.h - 110, PLATE.w, 110);
    if (inspect) drawInspectGrid(ctx, rect);
    drawShadow(ctx, maskSized, bounds, rect, settings, preset);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(subject, bounds.x, bounds.y, bounds.w, bounds.h, rect.x, rect.y, rect.w, rect.h);
    drawTemperature(ctx, preset);
    ctx.restore();

    drawFrame(ctx, inspect);
    if (inspect || settings.showRuler) drawRuler(ctx, rect, meta.heightCm, meta.diameterMm, inspect);
    drawHeader(ctx, meta, preset, inspect);
    drawFooter(ctx, meta, preset, inspect);

    return c;
  };

  const spec = build(false);
  const insp = build(true);
  const thumb = cv(300, 400);
  const tctx = thumb.getContext('2d')!;
  tctx.imageSmoothingQuality = 'high';
  tctx.drawImage(spec, 0, 0, SHEET_W, SHEET_H, 0, 0, 300, 400);

  return {
    specUrl: spec.toDataURL('image/jpeg', 0.92),
    inspectUrl: insp.toDataURL('image/jpeg', 0.92),
    thumbUrl: thumb.toDataURL('image/jpeg', 0.72),
  };
}


export async function composeSheets(
  photoUrl: string,
  maskUrl: string,
  settings: ComposeSettings,
  meta: ComposeMeta,
): Promise<ComposeResult> {
  const [photo, mask] = await Promise.all([loadImage(photoUrl), loadImage(maskUrl)]);
  return composeFromSources(
    { source: photo, width: photo.naturalWidth, height: photo.naturalHeight },
    mask,
    settings,
    meta,
  );
}
