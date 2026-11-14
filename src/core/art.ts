import type { CropKind, PartKind } from './types';

/**
 * Procedural crop-part artwork. It renders transparent PNGs that behave exactly like
 * imported artwork, so the asset pipeline is identical for built-in and user files.
 */

interface Palette {
  leaf: string;
  leafDark: string;
  leafLight: string;
  grain: string;
  grainDark: string;
  skin: string;
  skinShade: string;
  accent: string;
}

const PALETTES: Record<CropKind, Palette> = {
  水稻: { leaf: '#79b866', leafDark: '#3f7a3f', leafLight: '#a8d58f', grain: '#e4c05e', grainDark: '#b9903a', skin: '#f6e2bf', skinShade: '#e6c99e', accent: '#d9a94b' },
  小麦: { leaf: '#8db457', leafDark: '#4c7a38', leafLight: '#bcd98a', grain: '#dfb45f', grainDark: '#a97f34', skin: '#f7e3c4', skinShade: '#e7c9a0', accent: '#c99a4b' },
  玉米: { leaf: '#7bb85a', leafDark: '#426f35', leafLight: '#b6d98b', grain: '#f0c451', grainDark: '#c08f2e', skin: '#f8e2b8', skinShade: '#e6c494', accent: '#d3a33e' },
  大豆: { leaf: '#6cae64', leafDark: '#3b6d3e', leafLight: '#a4d29a', grain: '#b9cf62', grainDark: '#7f9a3b', skin: '#f2ddc2', skinShade: '#dfc3a2', accent: '#8faf4c' },
  高粱: { leaf: '#6ba35e', leafDark: '#3c6a3a', leafLight: '#9fc98c', grain: '#b4553f', grainDark: '#84392c', skin: '#f5ddbb', skinShade: '#e3c29c', accent: '#a8492f' },
};

export interface PartArtwork {
  kind: PartKind;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  dataUrl: string;
  label: string;
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return { canvas, ctx };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFace(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  // brows
  ctx.strokeStyle = '#6b553c';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-30, -22);
  ctx.quadraticCurveTo(-20, -29, -11, -23);
  ctx.moveTo(11, -23);
  ctx.quadraticCurveTo(20, -29, 30, -22);
  ctx.stroke();
  // eyes
  for (const ex of [-20, 20]) {
    ctx.fillStyle = '#3b3326';
    ctx.beginPath();
    ctx.ellipse(ex, -4, 8.5, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fffdf4';
    ctx.beginPath();
    ctx.ellipse(ex + 3, -8, 3, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.ellipse(ex - 3, 1, 1.6, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // cheeks
  for (const ex of [-38, 38]) {
    const g = ctx.createRadialGradient(ex, 16, 1, ex, 16, 13);
    g.addColorStop(0, 'rgba(232,130,110,0.55)');
    g.addColorStop(1, 'rgba(232,130,110,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(ex, 16, 13, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // mouth
  ctx.strokeStyle = '#7c4a36';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-9, 15);
  ctx.quadraticCurveTo(0, 26, 9, 15);
  ctx.stroke();
  ctx.restore();
}

function drawCrown(ctx: CanvasRenderingContext2D, crop: CropKind, pal: Palette, cx: number, topY: number) {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (crop === '水稻' || crop === '小麦' || crop === '高粱') {
    const stems = crop === '高粱' ? 5 : 6;
    for (let i = 0; i < stems; i++) {
      const spread = (i - (stems - 1) / 2) * 13;
      const lean = spread * 0.45;
      const tipY = topY - 64 - Math.abs(spread) * 0.28;
      ctx.strokeStyle = pal.leafDark;
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(cx + spread * 0.35, topY + 10);
      ctx.quadraticCurveTo(cx + spread * 0.7, tipY + 26, cx + lean, tipY);
      ctx.stroke();
      // grains along the top third
      const grains = crop === '高粱' ? 22 : 16;
      for (let g = 0; g < grains; g++) {
        const t = g / grains;
        const gy = tipY + t * (crop === '高粱' ? 58 : 46);
        const gx = cx + lean * (1 - t) + spread * 0.14 * Math.sin(g * 2.1);
        const rad = crop === '高粱' ? 4.4 : 3.4;
        const grad = ctx.createLinearGradient(gx - rad, gy - rad, gx + rad, gy + rad);
        grad.addColorStop(0, pal.grain);
        grad.addColorStop(1, pal.grainDark);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(gx, gy, rad * 0.85, rad * 1.5, spread * 0.01, 0, Math.PI * 2);
        ctx.fill();
      }
      if (crop === '小麦') {
        ctx.strokeStyle = 'rgba(214,186,122,0.85)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx + lean, tipY);
        ctx.lineTo(cx + lean - 8, tipY - 30);
        ctx.moveTo(cx + lean, tipY);
        ctx.lineTo(cx + lean + 8, tipY - 28);
        ctx.stroke();
      }
    }
  } else if (crop === '玉米') {
    // two side leaves + silk
    for (const dir of [-1, 1]) {
      ctx.fillStyle = pal.leaf;
      ctx.beginPath();
      ctx.moveTo(cx + dir * 6, topY + 6);
      ctx.quadraticCurveTo(cx + dir * 44, topY - 22, cx + dir * 62, topY - 58);
      ctx.quadraticCurveTo(cx + dir * 34, topY - 34, cx + dir * 6, topY + 6);
      ctx.fill();
    }
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 5; i++) {
      const lean = (i - 2) * 7;
      ctx.beginPath();
      ctx.moveTo(cx + lean * 0.4, topY + 4);
      ctx.bezierCurveTo(cx + lean, topY - 34, cx + lean * 2.1, topY - 52, cx + lean * 2.5, topY - 66);
      ctx.stroke();
    }
  } else {
    // 大豆: sprout with two round leaves
    ctx.strokeStyle = pal.leafDark;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, topY + 8);
    ctx.quadraticCurveTo(cx - 3, topY - 26, cx, topY - 44);
    ctx.stroke();
    for (const dir of [-1, 1]) {
      ctx.fillStyle = pal.leaf;
      ctx.beginPath();
      ctx.ellipse(cx + dir * 20, topY - 52, 24, 15, dir * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pal.leafDark;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx + dir * 4, topY - 46);
      ctx.quadraticCurveTo(cx + dir * 20, topY - 50, cx + dir * 36, topY - 60);
      ctx.stroke();
    }
  }
  ctx.restore();
}

const HEAD_W = 260;
const HEAD_H = 300;

function drawHead(crop: CropKind, pal: Palette): PartArtwork {
  const { canvas, ctx } = makeCanvas(HEAD_W, HEAD_H);
  const cx = HEAD_W / 2;
  const faceY = 150;
  drawCrown(ctx, crop, pal, cx, 92);
  // neck
  ctx.fillStyle = pal.skinShade;
  roundRect(ctx, cx - 19, 208, 38, 52, 12);
  ctx.fill();
  // ears (leaf shaped)
  ctx.fillStyle = pal.leaf;
  ctx.beginPath();
  ctx.ellipse(cx - 70, faceY + 2, 16, 25, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 70, faceY + 2, 16, 25, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // head
  const grad = ctx.createLinearGradient(cx - 62, faceY - 74, cx + 62, faceY + 78);
  grad.addColorStop(0, '#fff5e2');
  grad.addColorStop(0.55, pal.skin);
  grad.addColorStop(1, pal.skinShade);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, faceY, 72, 80, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,92,58,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
  drawFace(ctx, cx, faceY + 2);
  // little blush leaf on cheek
  ctx.save();
  ctx.translate(cx - 66, faceY + 40);
  ctx.rotate(-0.5);
  ctx.fillStyle = pal.leafLight;
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return exportPart('head', canvas, '头部', cx, 250, 0.68);
}

const TORSO_W = 220;
const TORSO_H = 300;

function drawTorso(crop: CropKind, pal: Palette): PartArtwork {
  const { canvas, ctx } = makeCanvas(TORSO_W, TORSO_H);
  const cx = TORSO_W / 2;
  // shoulders + body
  const grad = ctx.createLinearGradient(0, 40, 0, 280);
  grad.addColorStop(0, pal.leafLight);
  grad.addColorStop(0.5, pal.leaf);
  grad.addColorStop(1, pal.leafDark);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - 44, 56);
  ctx.quadraticCurveTo(cx - 78, 66, cx - 76, 100);
  ctx.quadraticCurveTo(cx - 66, 208, cx - 44, 268);
  ctx.quadraticCurveTo(cx, 288, cx + 44, 268);
  ctx.quadraticCurveTo(cx + 66, 208, cx + 76, 100);
  ctx.quadraticCurveTo(cx + 78, 66, cx + 44, 56);
  ctx.quadraticCurveTo(cx, 36, cx - 44, 56);
  ctx.closePath();
  ctx.fill();
  // collar leaves
  for (const dir of [-1, 1]) {
    ctx.fillStyle = dir < 0 ? pal.leafDark : pal.leafLight;
    ctx.beginPath();
    ctx.moveTo(cx + dir * 12, 56);
    ctx.quadraticCurveTo(cx + dir * 52, 52, cx + dir * 70, 76);
    ctx.quadraticCurveTo(cx + dir * 46, 92, cx + dir * 12, 72);
    ctx.closePath();
    ctx.fill();
  }
  // front seam + grain pattern
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, 82);
  ctx.quadraticCurveTo(cx - 6, 170, cx, 258);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  for (let row = 0; row < 4; row++) {
    for (let col = -2; col <= 2; col++) {
      ctx.beginPath();
      ctx.ellipse(cx + col * 19 + (row % 2) * 9, 118 + row * 34, 4.6, 7.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // crop badge: tiny grains at chest
  if (crop === '玉米') {
    ctx.fillStyle = pal.grain;
    ctx.beginPath();
    ctx.ellipse(cx, 168, 17, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = pal.grainDark;
    ctx.lineWidth = 1.2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 6, 148);
      ctx.lineTo(cx + i * 6, 188);
      ctx.stroke();
    }
  }
  // hem
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 46, 262);
  ctx.quadraticCurveTo(cx, 280, cx + 46, 262);
  ctx.stroke();
  return exportPart('torso', canvas, '躯干', cx, 276, 0.68);
}

const LEAF_W = 260;
const LEAF_H = 110;

function drawLeaf(pal: Palette): PartArtwork {
  const { canvas, ctx } = makeCanvas(LEAF_W, LEAF_H);
  const cy = LEAF_H / 2;
  const grad = ctx.createLinearGradient(10, 0, LEAF_W, 0);
  grad.addColorStop(0, pal.leafDark);
  grad.addColorStop(0.45, pal.leaf);
  grad.addColorStop(1, pal.leafLight);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(10, cy + 6);
  ctx.bezierCurveTo(60, cy - 44, 170, cy - 50, LEAF_W - 12, cy - 20);
  ctx.bezierCurveTo(196, cy + 18, 90, cy + 46, 10, cy + 6);
  ctx.closePath();
  ctx.fill();
  // veins
  ctx.strokeStyle = 'rgba(255,255,255,0.34)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(14, cy + 6);
  ctx.bezierCurveTo(80, cy - 8, 170, cy - 8, LEAF_W - 18, cy - 18);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  for (let i = 1; i <= 6; i++) {
    const t = i / 7;
    const bx = 14 + t * (LEAF_W - 40);
    const by = cy + 6 - t * 22;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx + 10, by - 20, bx + 16, by - 32);
    ctx.stroke();
  }
  // stem
  ctx.strokeStyle = pal.leafDark;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(4, cy + 8);
  ctx.lineTo(22, cy + 6);
  ctx.stroke();
  return exportPart('leaf', canvas, '叶片', 16, cy + 4, 0.72);
}

const EAR_W = 130;
const EAR_H = 200;

function drawEar(crop: CropKind, pal: Palette): PartArtwork {
  const { canvas, ctx } = makeCanvas(EAR_W, EAR_H);
  const cx = EAR_W / 2;
  // stem
  ctx.strokeStyle = pal.leafDark;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, EAR_H - 8);
  ctx.quadraticCurveTo(cx - 4, 150, cx, 52);
  ctx.stroke();
  // grains
  const count = crop === '高粱' ? 26 : 18;
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const y = 42 + t * (crop === '高粱' ? 104 : 118);
    const spread = 20 * Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.12));
    for (const dir of [-1, 1]) {
      const grad = ctx.createLinearGradient(cx + dir * spread - 7, y - 9, cx + dir * spread + 7, y + 9);
      grad.addColorStop(0, pal.grain);
      grad.addColorStop(1, pal.grainDark);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx + dir * spread * 0.82, y, 7.4, 11.4, dir * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx + dir * spread * 0.82 - 2, y - 3, 2, 5, dir * 0.22, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // awns
  ctx.strokeStyle = 'rgba(226,198,132,0.9)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const off = (i - 2) * 6;
    ctx.beginPath();
    ctx.moveTo(cx + off * 0.4, 54);
    ctx.quadraticCurveTo(cx + off, 18, cx + off * 2.2, 2 + Math.abs(off));
    ctx.stroke();
  }
  return exportPart('ear', canvas, '穗', cx, EAR_H - 10, 0.72);
}

const ROOT_W = 240;
const ROOT_H = 152;

function drawRoots(pal: Palette): PartArtwork {
  const { canvas, ctx } = makeCanvas(ROOT_W, ROOT_H);
  const cx = ROOT_W / 2;
  ctx.lineCap = 'round';
  const branches: Array<[number, number, number, number, number]> = [
    [-4, 0.5, 1, 40, 1],
    [4, 0.42, -1, 26, 1],
    [0, 0.6, 0.6, 0, 1],
    [-10, 0.3, 1.4, 60, 0.8],
    [10, 0.34, -1.5, 70, 0.8],
    [2, 0.26, 0.1, 2, 0.7],
  ];
  for (const [start, tlen, lean, curve, width] of branches) {
    const grad = ctx.createLinearGradient(cx, 10, cx, ROOT_H);
    grad.addColorStop(0, pal.skinShade);
    grad.addColorStop(1, '#b99c74');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 7 * width;
    ctx.beginPath();
    ctx.moveTo(cx + start, 8);
    ctx.bezierCurveTo(cx + start + lean * 30, 40 + tlen * 40, cx + start + lean * curve * 1.6, 100, cx + start + lean * curve * 2.2, 28 + tlen * (ROOT_H - 40));
    ctx.stroke();
    // root hairs
    ctx.lineWidth = 2.2 * width;
    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      const bx = cx + start + lean * curve * t * 1.4;
      const by = 20 + t * (ROOT_H - 50);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + lean * 18, by + 12, bx + lean * 26, by + 30);
      ctx.stroke();
    }
  }
  // soil collar
  ctx.fillStyle = 'rgba(120,92,58,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, 8, 54, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  return exportPart('roots', canvas, '根须', cx, 10, 0.66);
}

function exportPart(
  kind: PartKind,
  source: HTMLCanvasElement,
  label: string,
  anchorX: number,
  anchorY: number,
  factor = 0.72,
): PartArtwork {
  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(source.width * factor));
  out.height = Math.max(1, Math.round(source.height * factor));
  const ctx = out.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, out.width, out.height);
  return {
    kind,
    width: out.width,
    height: out.height,
    anchorX: Math.round(anchorX * factor),
    anchorY: Math.round(anchorY * factor),
    dataUrl: out.toDataURL('image/png'),
    label,
  };
}

export function renderPart(kind: PartKind, crop: CropKind): PartArtwork {
  const pal = PALETTES[crop];
  switch (kind) {
    case 'head': return drawHead(crop, pal);
    case 'torso': return drawTorso(crop, pal);
    case 'leaf': return drawLeaf(pal);
    case 'ear': return drawEar(crop, pal);
    case 'roots': return drawRoots(pal);
    default: return drawLeaf(pal);
  }
}

/** Preview strip of the 5 character kinds for the project list cards. */
export function renderCastPreview(crop: CropKind, size = 120): string {
  const head = renderPart('head', crop);
  const torso = renderPart('torso', crop);
  const { canvas, ctx } = makeCanvas(size, size);
  const img = new Image();
  img.src = head.dataUrl;
  // drawing is synchronous only after load; draw a colored fallback immediately
  ctx.fillStyle = PALETTES[crop].leafLight;
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.38, size * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTES[crop].grain;
  ctx.beginPath();
  ctx.ellipse(size / 2, size * 0.3, size * 0.05, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  img.onload = () => {
    ctx.clearRect(0, 0, size, size);
    const s = (size * 0.82) / torso.height;
    ctx.drawImage(img, size / 2 - (head.width * s) / 2, size * 0.06);
  };
  return canvas.toDataURL('image/png');
}

export function paletteFor(crop: CropKind): Palette {
  return PALETTES[crop];
}
