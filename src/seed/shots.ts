import {
  makeCanvas,
  paintSweep,
  paintContactShadow,
  tube,
  grip,
  roundRect,
  fillWithLight,
  wheel,
  vignette,
  canvasToBlob,
  canvasToDataUrl,
  rng,
  type Ctx,
} from './art';

export interface SeededShot {
  key: string;
  name: string;
  width: number;
  height: number;
  blob: Blob;
  thumb: string;
}

const W = 1600;
const H = 1200;

type SweepTone = 'warm' | 'neutral' | 'cool' | 'grey';

const SWEEPS: Record<SweepTone, [string, string]> = {
  warm: ['#efe6d8', '#e2d6c3'],
  neutral: ['#f2f1ee', '#e6e4df'],
  cool: ['#eef1f5', '#e0e6ee'],
  grey: ['#dcdcda', '#cbccc9'],
};

function newScene(tone: SweepTone, seed: number): [HTMLCanvasElement, Ctx] {
  const [c, ctx] = makeCanvas(W, H);
  const [top, bottom] = SWEEPS[tone];
  paintSweep(ctx, W, H, top, bottom, seed);
  return [c, ctx];
}

/** Four-wheeled walker with a padded seat: the flagship rehab frame. */
function drawWalker(ctx: Ctx) {
  const cx = W / 2;
  const groundY = H * 0.80;
  paintContactShadow(ctx, cx, groundY + 26, W * 0.31, H * 0.055, 0.34);

  const chrome = { width: 22, light: '#f2f4f6', mid: '#b7bdc4', dark: '#5c626a' };
  const back = { left: cx - 300, right: cx + 300, top: H * 0.34 };
  const front = { left: cx - 250, right: cx + 250, top: H * 0.41 };

  // Rear uprights
  const p1 = new Path2D();
  p1.moveTo(back.left, back.top);
  p1.lineTo(back.left + 54, groundY - 96);
  const p2 = new Path2D();
  p2.moveTo(back.right, back.top);
  p2.lineTo(back.right - 54, groundY - 96);

  // Front uprights (angled forward for stability)
  const p3 = new Path2D();
  p3.moveTo(front.left, front.top);
  p3.lineTo(front.left - 30, groundY - 96);
  const p4 = new Path2D();
  p4.moveTo(front.right, front.top);
  p4.lineTo(front.right + 30, groundY - 96);

  // Top grab bar
  const top = new Path2D();
  top.moveTo(back.left - 4, back.top);
  top.quadraticCurveTo(cx, back.top - 62, back.right + 4, back.top);

  // Seat rails
  const rail = new Path2D();
  rail.moveTo(back.left + 40, H * 0.60);
  rail.lineTo(back.right - 40, H * 0.60);

  for (const p of [p3, p4]) tube(ctx, p, { width: 20, light: '#eef1f4', mid: '#aeb5bd', dark: '#565c64' });
  for (const p of [p1, p2]) tube(ctx, p, chrome);
  tube(ctx, top, { ...chrome, width: 26 });

  // Seat: padded, dark grey leather with a highlight roll.
  const seatW = 470;
  const seatH = 74;
  const seatX = cx - seatW / 2;
  const seatY = H * 0.545;
  const seatPath = roundRect(ctx, seatX, seatY, seatW, seatH, 34);
  fillWithLight(ctx, seatPath, '#3b4149', '#5c636c', '#22262c', [seatX, seatY, seatW, seatH]);
  // stitch line
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.13)';
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 8]);
  ctx.stroke(roundRect(ctx, seatX + 16, seatY + 13, seatW - 32, seatH - 26, 22));
  ctx.restore();
  tube(ctx, rail, { width: 14, light: '#dfe3e8', mid: '#9aa1a9', dark: '#4d535a' });

  // Hand grips
  const gl = new Path2D();
  gl.moveTo(back.left + 2, back.top + 2);
  gl.lineTo(back.left + 76, back.top - 22);
  const gr = new Path2D();
  gr.moveTo(back.right - 2, back.top + 2);
  gr.lineTo(back.right - 76, back.top - 22);
  grip(ctx, gl, 30);
  grip(ctx, gr, 30);

  // Brake levers
  for (const [x0, y0, x1, y1] of [
    [back.left + 46, back.top + 44, back.left + 122, back.top + 104],
    [back.right - 46, back.top + 44, back.right - 122, back.top + 104],
  ]) {
    const path = new Path2D();
    path.moveTo(x0, y0);
    path.quadraticCurveTo((x0 + x1) / 2 + 12, (y0 + y1) / 2, x1, y1);
    tube(ctx, path, { width: 9, light: '#e9edf1', mid: '#8d949c', dark: '#494f56' });
  }

  // Cross brace under the seat
  const brace = new Path2D();
  brace.moveTo(back.left + 54, groundY - 150);
  brace.lineTo(back.right - 54, groundY - 150);
  tube(ctx, brace, { width: 12, light: '#e2e6ea', mid: '#949ba3', dark: '#454b52' });

  // Wheels
  const wheelR = 74;
  wheel(ctx, back.left + 54, groundY - 74, wheelR * 1.05);
  wheel(ctx, back.right - 54, groundY - 74, wheelR * 1.05);
  wheel(ctx, front.left - 30, groundY - 74, wheelR * 0.82);
  wheel(ctx, front.right + 30, groundY - 74, wheelR * 0.82);

  // Brand plate on the front bar
  const plateW = 132;
  const plateH = 40;
  const plateX = cx - plateW / 2;
  const plateY = front.top + 22;
  const plate = roundRect(ctx, plateX, plateY, plateW, plateH, 8);
  fillWithLight(ctx, plate, '#1f5f8b', '#3d8fbf', '#163f5e', [plateX, plateY, plateW, plateH]);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = '600 21px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RECOVIA', cx, plateY + plateH / 2 + 1);
}

/** Forearm crutch pair, leaning against each other. */
function drawCrutches(ctx: Ctx) {
  const cx = W / 2;
  const groundY = H * 0.845;
  paintContactShadow(ctx, cx, groundY + 18, W * 0.26, H * 0.045, 0.3);

  const drawCrutch = (baseX: number, lean: number, scale: number) => {
    ctx.save();
    ctx.translate(baseX, groundY);
    ctx.rotate(lean);
    ctx.scale(scale, scale);

    // Shaft
    const shaft = new Path2D();
    shaft.moveTo(0, 0);
    shaft.lineTo(0, -H * 0.60);
    tube(ctx, shaft, { width: 17, light: '#eef2f5', mid: '#a8b0b9', dark: '#4f565e' });

    // Ferrule
    const tip = roundRect(ctx, -15, -22, 30, 44, 10);
    ctx.fillStyle = '#1b1e22';
    ctx.fill(tip);

    // Cuff and forearm rest near the top
    const cuffY = -H * 0.585;
    const cuff = new Path2D();
    cuff.ellipse(0, cuffY, 62, 26, 0, 0, Math.PI * 2);
    ctx.save();
    ctx.strokeStyle = '#2d3238';
    ctx.lineWidth = 22;
    ctx.stroke(cuff);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 6;
    ctx.translate(-4, -4);
    ctx.stroke(cuff);
    ctx.restore();

    // Adjustable collar
    const collar = roundRect(ctx, -13, cuffY + 46, 26, 26, 6);
    ctx.fillStyle = '#c9ced4';
    ctx.fill(collar);

    // Handgrip, angled toward the user
    const gripPath = new Path2D();
    gripPath.moveTo(0, -H * 0.40);
    gripPath.lineTo(-58, -H * 0.36);
    grip(ctx, gripPath, 34, '#1e2228');

    // Forearm shelf
    const shelf = roundRect(ctx, -104, cuffY + 4, 86, 24, 12);
    fillWithLight(ctx, shelf, '#2f353c', '#4b525a', '#1a1e23', [-104, cuffY + 4, 86, 24]);

    ctx.restore();
  };

  drawCrutch(cx - 150, -0.055, 1.0);
  drawCrutch(cx + 150, 0.055, 1.0);
}

/** Wheelchair, three-quarter view. */
function drawWheelchair(ctx: Ctx) {
  const cx = W / 2;
  const groundY = H * 0.82;
  paintContactShadow(ctx, cx + 20, groundY + 24, W * 0.33, H * 0.058, 0.36);

  const chrome = { width: 18, light: '#f4f6f8', mid: '#bcc3cb', dark: '#5f666e' };

  // Big rear wheel
  wheel(ctx, cx - 60, groundY - 168, 168);
  // Caster
  wheel(ctx, cx + 268, groundY - 46, 54);

  // Frame: seat base + backrest
  const seat = new Path2D();
  seat.moveTo(cx - 230, H * 0.52);
  seat.lineTo(cx + 180, H * 0.52);
  tube(ctx, seat, { width: 20, light: '#e8ecef', mid: '#9fa7af', dark: '#4a5058' });

  const backrest = new Path2D();
  backrest.moveTo(cx - 230, H * 0.52);
  backrest.lineTo(cx - 268, H * 0.26);
  backrest.quadraticCurveTo(cx - 262, H * 0.20, cx - 210, H * 0.20);
  backrest.lineTo(cx - 176, H * 0.20);
  tube(ctx, backrest, chrome);

  // Seat cushion
  const cushion = roundRect(ctx, cx - 226, H * 0.465, 400, 58, 22);
  fillWithLight(ctx, cushion, '#324a5c', '#4e6c83', '#1c2b36', [cx - 226, H * 0.465, 400, 58]);

  // Back sling
  const sling = roundRect(ctx, cx - 250, H * 0.22, 66, 260, 26);
  fillWithLight(ctx, sling, '#2f4557', '#4a6478', '#1a2833', [cx - 250, H * 0.22, 66, 260]);

  // Armrest
  const arm = roundRect(ctx, cx - 150, H * 0.40, 230, 34, 16);
  fillWithLight(ctx, arm, '#242a31', '#3c444d', '#12161a', [cx - 150, H * 0.40, 230, 34]);
  const armPost = new Path2D();
  armPost.moveTo(cx + 60, H * 0.415);
  armPost.lineTo(cx + 62, H * 0.52);
  tube(ctx, armPost, chrome);

  // Footplate
  const foot = roundRect(ctx, cx + 176, groundY - 40, 128, 22, 8);
  fillWithLight(ctx, foot, '#8f979f', '#c2c8cf', '#565d65', [cx + 176, groundY - 40, 128, 22]);

  // Front fork
  const fork = new Path2D();
  fork.moveTo(cx + 186, H * 0.53);
  fork.lineTo(cx + 260, groundY - 88);
  tube(ctx, fork, chrome);

  // Push handles
  for (const sx of [-1, 1]) {
    const handle = new Path2D();
    handle.moveTo(cx - 222, H * 0.205);
    handle.lineTo(cx - 222 + sx * 18, H * 0.145);
    grip(ctx, handle, 26, '#23272d');
  }

  // Handrim
  ctx.save();
  ctx.strokeStyle = 'rgba(206,212,219,0.9)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx - 60, groundY - 168, 182, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Adjustable walking cane with derby handle. */
function drawCane(ctx: Ctx) {
  const cx = W / 2;
  const groundY = H * 0.86;
  paintContactShadow(ctx, cx + 30, groundY + 14, W * 0.13, H * 0.032, 0.28);

  const shaft = new Path2D();
  shaft.moveTo(cx + 12, groundY - 26);
  shaft.quadraticCurveTo(cx + 34, H * 0.55, cx + 28, H * 0.30);
  tube(ctx, shaft, { width: 21, light: '#f4f6f8', mid: '#b0b8c0', dark: '#565d65' });

  // Height adjust holes
  ctx.save();
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(cx + 27 - i * 0.4, groundY - 90 - i * 26, 4.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(40,46,52,0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  ctx.restore();

  // Derby handle: walnut wood with a warm sheen.
  const handle = new Path2D();
  handle.moveTo(cx + 28, H * 0.305);
  handle.quadraticCurveTo(cx + 26, H * 0.235, cx + 96, H * 0.238);
  handle.quadraticCurveTo(cx + 168, H * 0.242, cx + 162, H * 0.285);
  handle.quadraticCurveTo(cx + 156, H * 0.31, cx + 104, H * 0.305);
  handle.quadraticCurveTo(cx + 54, H * 0.30, cx + 28, H * 0.305);
  handle.closePath();
  const hg = ctx.createLinearGradient(cx + 28, H * 0.235, cx + 90, H * 0.31);
  hg.addColorStop(0, '#8a5a35');
  hg.addColorStop(0.45, '#5f3c22');
  hg.addColorStop(1, '#3a2413');
  ctx.fillStyle = hg;
  ctx.fill(handle);
  ctx.strokeStyle = 'rgba(255,220,180,0.22)';
  ctx.lineWidth = 3;
  ctx.save();
  ctx.clip(handle);
  ctx.translate(0, -6);
  ctx.stroke(handle);
  ctx.restore();

  // Ferrule tip
  const tip = new Path2D();
  tip.moveTo(cx + 12, groundY - 30);
  tip.lineTo(cx + 12.5, groundY - 2);
  tube(ctx, tip, { width: 23, light: '#5a6068', mid: '#2b2f34', dark: '#13161a' });
}

/** Parallel bars, seen head-on. */
function drawParallelBars(ctx: Ctx) {
  const cx = W / 2;
  const groundY = H * 0.85;
  paintContactShadow(ctx, cx, groundY + 20, W * 0.34, H * 0.05, 0.32);

  const chrome = { width: 20, light: '#eef2f5', mid: '#aab1b9', dark: '#52585f' };

  const barTop = H * 0.30;
  for (const side of [-1, 1]) {
    const x = cx + side * 250;
    // two uprights
    for (const dx of [-46, 46]) {
      const p = new Path2D();
      p.moveTo(x + dx * 0.5, barTop + 12);
      p.lineTo(x + dx, groundY - 30);
      tube(ctx, p, chrome);
    }
    // base foot
    const foot = roundRect(ctx, x - 92, groundY - 34, 184, 22, 11);
    fillWithLight(ctx, foot, '#8d959d', '#c4cad1', '#565d65', [x - 92, groundY - 34, 184, 22]);
    // cross brace
    const brace = new Path2D();
    brace.moveTo(x - 62, H * 0.66);
    brace.lineTo(x + 62, H * 0.66);
    tube(ctx, brace, { width: 11, light: '#e3e7eb', mid: '#959da5', dark: '#464c53' });
    // Handrail
    const rail = new Path2D();
    rail.moveTo(x - 66, barTop);
    rail.lineTo(x + 66, barTop);
    tube(ctx, rail, { width: 26, light: '#f6f8fa', mid: '#b8c0c8', dark: '#5a616a' });
    // Grip sleeve
    grip(ctx, (() => {
      const g = new Path2D();
      g.moveTo(x - 60, barTop);
      g.lineTo(x + 60, barTop);
      return g;
    })(), 30, '#20343f');
  }
}

/** Hand therapy grip trainer set. */
function drawGripTrainer(ctx: Ctx) {
  const cx = W / 2;
  const groundY = H * 0.80;
  paintContactShadow(ctx, cx, groundY + 16, W * 0.2, H * 0.038, 0.28);

  const drawOne = (x: number, y: number, s: number, hue: string, hueDark: string) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    // handle barrel
    const body = roundRect(ctx, -46, -96, 92, 192, 44);
    fillWithLight(ctx, body, hue, lighten(hue, 0.28), hueDark, [-46, -96, 92, 192]);
    // knurl rings
    ctx.save();
    ctx.clip(body);
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 3;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-46, i * 22);
      ctx.lineTo(46, i * 22);
      ctx.stroke();
    }
    ctx.restore();
    // spring
    ctx.strokeStyle = '#b8bec5';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 26; i++) {
      const t = i / 26;
      const px = 46 + t * 118;
      const py = -60 + Math.sin(t * Math.PI * 6) * 26;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 26; i++) {
      const t = i / 26;
      const px = 46 + t * 118;
      const py = -64 + Math.sin(t * Math.PI * 6) * 26;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // end cap
    const cap = roundRect(ctx, 152, -96, 70, 192, 34);
    fillWithLight(ctx, cap, hue, lighten(hue, 0.28), hueDark, [152, -96, 70, 192]);
    ctx.restore();
  };

  drawOne(cx - 170, H * 0.50, 1.0, '#3f7fb5', '#22486a');
  drawOne(cx + 170, H * 0.54, 0.86, '#4c8f6a', '#26503a');
}

function lighten(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) + amt * 255);
  const g = Math.min(255, ((n >> 8) & 255) + amt * 255);
  const b = Math.min(255, (n & 255) + amt * 255);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

const DRAWERS: Record<string, (ctx: Ctx) => void> = {
  walker: drawWalker,
  crutches: drawCrutches,
  wheelchair: drawWheelchair,
  cane: drawCane,
  bars: drawParallelBars,
  grip: drawGripTrainer,
};

export interface ShotSpec {
  key: string;
  name: string;
  tone: SweepTone;
  draw: keyof typeof DRAWERS;
  seed: number;
}

export const SHOT_SPECS: ShotSpec[] = [
  { key: 'walker-warm', name: '四轮助行器_暖棚实拍', tone: 'warm', draw: 'walker', seed: 11 },
  { key: 'walker-cool', name: '四轮助行器_冷棚实拍', tone: 'cool', draw: 'walker', seed: 12 },
  { key: 'wheelchair-neutral', name: '康复轮椅_中性棚实拍', tone: 'neutral', draw: 'wheelchair', seed: 21 },
  { key: 'crutches-grey', name: '前臂拐杖_灰棚实拍', tone: 'grey', draw: 'crutches', seed: 31 },
  { key: 'cane-warm', name: '可调手杖_暖棚实拍', tone: 'warm', draw: 'cane', seed: 41 },
  { key: 'bars-cool', name: '双杠训练架_冷棚实拍', tone: 'cool', draw: 'bars', seed: 51 },
  { key: 'grip-neutral', name: '握力训练器_中性棚实拍', tone: 'neutral', draw: 'grip', seed: 61 },
  { key: 'walker-grey', name: '四轮助行器_灰棚实拍', tone: 'grey', draw: 'walker', seed: 13 },
];

export async function renderShot(spec: ShotSpec): Promise<SeededShot> {
  const [canvas, ctx] = newScene(spec.tone, spec.seed);
  DRAWERS[spec.draw](ctx);
  vignette(ctx, W, H, 0.18);
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
  return {
    key: spec.key,
    name: `${spec.name}.jpg`,
    width: W,
    height: H,
    blob,
    thumb: canvasToDataUrl(canvas, 200),
  };
}

// ---------------------------------------------------------------------------
// Background library
// ---------------------------------------------------------------------------

export interface BgSpec {
  key: string;
  name: string;
  tags: string[];
  draw: (ctx: Ctx, w: number, h: number) => void;
}

function studioFloor(ctx: Ctx, w: number, h: number, wall: string, floor: string, horizon = 0.62) {
  const g = ctx.createLinearGradient(0, 0, 0, h * horizon);
  g.addColorStop(0, wall);
  g.addColorStop(1, floor);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h * horizon + 2);
  const fg = ctx.createLinearGradient(0, h * horizon, 0, h);
  fg.addColorStop(0, floor);
  fg.addColorStop(1, shade(floor, -0.16));
  ctx.fillStyle = fg;
  ctx.fillRect(0, h * horizon, w, h - h * horizon);
  // soft horizon blend
  const blend = ctx.createLinearGradient(0, h * (horizon - 0.08), 0, h * (horizon + 0.08));
  blend.addColorStop(0, 'rgba(0,0,0,0)');
  blend.addColorStop(0.5, 'rgba(0,0,0,0.05)');
  blend.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = blend;
  ctx.fillRect(0, h * (horizon - 0.08), w, h * 0.16);
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, v + amt * 255)) | 0;
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

function concrete(ctx: Ctx, w: number, h: number) {
  studioFloor(ctx, w, h, '#c9ccd1', '#b6bac0', 0.58);
  const rand = rng(99);
  ctx.save();
  for (let i = 0; i < 900; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = rand() * 2.6 + 0.4;
    ctx.fillStyle = rand() > 0.5 ? `rgba(255,255,255,${rand() * 0.09})` : `rgba(0,0,0,${rand() * 0.08})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // expansion joints on the floor
  ctx.strokeStyle = 'rgba(0,0,0,0.10)';
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i++) {
    const y = h * (0.62 + i * 0.11);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
  vignette(ctx, w, h, 0.22);
}

function gymMirror(ctx: Ctx, w: number, h: number) {
  studioFloor(ctx, w, h, '#dfe3e8', '#cfd4da', 0.66);
  // mirrored wall panels
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const x = (i / 5) * w;
    const g = ctx.createLinearGradient(x, 0, x + w / 5, h * 0.66);
    g.addColorStop(0, 'rgba(255,255,255,0.30)');
    g.addColorStop(0.5, 'rgba(210,224,238,0.12)');
    g.addColorStop(1, 'rgba(160,180,200,0.16)');
    ctx.fillStyle = g;
    ctx.fillRect(x + 2, 0, w / 5 - 4, h * 0.66);
    ctx.strokeStyle = 'rgba(90,102,116,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h * 0.66);
    ctx.stroke();
  }
  ctx.restore();
  vignette(ctx, w, h, 0.18);
}

function warmWood(ctx: Ctx, w: number, h: number) {
  studioFloor(ctx, w, h, '#cbb08b', '#b89870', 0.56);
  const rand = rng(1234);
  ctx.save();
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 60; i++) {
    const y = h * 0.58 + (i / 60) * h * 0.42;
    ctx.strokeStyle = rand() > 0.5 ? 'rgba(90,64,38,0.35)' : 'rgba(232,208,176,0.35)';
    ctx.lineWidth = 1 + rand() * 2.2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(w * 0.33, y + (rand() - 0.5) * 14, w * 0.66, y + (rand() - 0.5) * 14, w, y);
    ctx.stroke();
  }
  ctx.restore();
  // warm light pool from the left
  const g = ctx.createRadialGradient(w * 0.28, h * 0.34, w * 0.05, w * 0.4, h * 0.45, w * 0.85);
  g.addColorStop(0, 'rgba(255,226,182,0.26)');
  g.addColorStop(1, 'rgba(120,86,48,0.10)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  vignette(ctx, w, h, 0.26);
}

function mintWall(ctx: Ctx, w: number, h: number) {
  studioFloor(ctx, w, h, '#cfdcd6', '#bcccC5', 0.60);
  const g = ctx.createRadialGradient(w * 0.7, h * 0.22, w * 0.04, w * 0.62, h * 0.4, w * 0.9);
  g.addColorStop(0, 'rgba(255,255,255,0.30)');
  g.addColorStop(1, 'rgba(60,86,78,0.10)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  vignette(ctx, w, h, 0.2);
}

function clinicBlue(ctx: Ctx, w: number, h: number) {
  studioFloor(ctx, w, h, '#d7e2ef', '#c2d0e2', 0.60);
  // wall tiles
  ctx.save();
  ctx.strokeStyle = 'rgba(120,142,170,0.18)';
  ctx.lineWidth = 2;
  const step = Math.round(w / 9);
  for (let x = 0; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h * 0.58);
    ctx.stroke();
  }
  for (let y = 0; y < h * 0.58; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
  vignette(ctx, w, h, 0.22);
}

function charcoal(ctx: Ctx, w: number, h: number) {
  studioFloor(ctx, w, h, '#3d434b', '#2c3138', 0.58);
  const g = ctx.createRadialGradient(w * 0.5, h * 0.30, w * 0.04, w * 0.5, h * 0.45, w * 0.85);
  g.addColorStop(0, 'rgba(150,176,205,0.22)');
  g.addColorStop(1, 'rgba(0,0,0,0.14)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  vignette(ctx, w, h, 0.36);
}

function sunsetWall(ctx: Ctx, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#f3d3b6');
  g.addColorStop(0.55, '#e8b49a');
  g.addColorStop(1, '#cf8f7e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const fg = ctx.createLinearGradient(0, h * 0.62, 0, h);
  fg.addColorStop(0, '#d9a08c');
  fg.addColorStop(1, '#ad6f62');
  ctx.fillStyle = fg;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  const pool = ctx.createRadialGradient(w * 0.22, h * 0.28, w * 0.02, w * 0.3, h * 0.4, w * 0.8);
  pool.addColorStop(0, 'rgba(255,240,214,0.5)');
  pool.addColorStop(1, 'rgba(255,240,214,0)');
  ctx.fillStyle = pool;
  ctx.fillRect(0, 0, w, h);
  vignette(ctx, w, h, 0.28);
}

function stairHall(ctx: Ctx, w: number, h: number) {
  studioFloor(ctx, w, h, '#dfe0dc', '#cbccc8', 0.64);
  ctx.save();
  ctx.fillStyle = 'rgba(190,192,188,0.9)';
  for (let i = 0; i < 7; i++) {
    const x = w * 0.62 + i * w * 0.055;
    const top = h * (0.30 + i * 0.045);
    ctx.fillRect(x, top, w * 0.05, h - top);
    ctx.fillStyle = `rgba(${200 + i * 3},${201 + i * 3},${197 + i * 3},0.9)`;
  }
  ctx.restore();
  vignette(ctx, w, h, 0.24);
}

export const BG_SPECS: BgSpec[] = [
  { key: 'concrete', name: '水泥影棚', tags: ['工业', '中性'], draw: concrete },
  { key: 'gym-mirror', name: '康复中心镜面墙', tags: ['机构', '明亮'], draw: gymMirror },
  { key: 'warm-wood', name: '暖木地板', tags: ['居家', '暖调'], draw: warmWood },
  { key: 'mint-wall', name: '薄荷墙面', tags: ['清新', '医疗'], draw: mintWall },
  { key: 'clinic-blue', name: '诊室蓝瓷砖', tags: ['医疗', '冷调'], draw: clinicBlue },
  { key: 'charcoal', name: '深灰影棚', tags: ['高级', '暗调'], draw: charcoal },
  { key: 'sunset-wall', name: '黄昏暖墙', tags: ['氛围', '暖调'], draw: sunsetWall },
  { key: 'stair-hall', name: '楼梯间', tags: ['场景', '居家'], draw: stairHall },
];

export const BG_W = 1600;
export const BG_H = 1200;

export async function renderBackground(spec: BgSpec): Promise<{ key: string; blob: Blob; thumb: string }> {
  const [canvas, ctx] = makeCanvas(BG_W, BG_H);
  spec.draw(ctx, BG_W, BG_H);
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
  return { key: spec.key, blob, thumb: canvasToDataUrl(canvas, 220) };
}
