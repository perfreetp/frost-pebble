/** 演示用样苗照片：合成一株带枝叶的苗木与不同背景，供加工台自动初抠使用。 */

export type SampleBg = 'wall' | 'soil' | 'net' | 'white' | 'bench';
export type SampleLeaf = 'broad' | 'maple' | 'ginkgo';

export interface SampleSpec {
  seed: number;
  bg: SampleBg;
  leaf: SampleLeaf;
  clutter: boolean;
  heightRatio?: number;
}

function rng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LEAF_PALETTE: Record<SampleLeaf, string[]> = {
  broad: ['#4e7a34', '#5f8f3d', '#3f6a2b', '#6d9c48', '#335c27', '#57893a'],
  maple: ['#a33127', '#b94530', '#8d2a20', '#c2563a', '#7c271e', '#ad3c2b'],
  ginkgo: ['#8fa63c', '#a7b84f', '#7a9432', '#b9c463', '#6d8a2d'],
};

export function drawSamplePhoto(spec: SampleSpec): { dataUrl: string; canvas: HTMLCanvasElement } {
  const W = 560;
  const H = 760;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  const rand = rng(spec.seed);
  const cx = W * (0.48 + (rand() - 0.5) * 0.06);

  // ---- 背景 ----
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  if (spec.bg === 'wall') {
    bgGrad.addColorStop(0, '#d9d5cb');
    bgGrad.addColorStop(0.6, '#cfcbc1');
    bgGrad.addColorStop(1, '#c4c0b6');
  } else if (spec.bg === 'soil') {
    bgGrad.addColorStop(0, '#9c8a6c');
    bgGrad.addColorStop(0.5, '#8d7a5c');
    bgGrad.addColorStop(1, '#7b684a');
  } else if (spec.bg === 'net') {
    bgGrad.addColorStop(0, '#7d8f6d');
    bgGrad.addColorStop(0.5, '#6f8260');
    bgGrad.addColorStop(1, '#5f7052');
  } else if (spec.bg === 'bench') {
    bgGrad.addColorStop(0, '#b9a98f');
    bgGrad.addColorStop(0.55, '#a5937a');
    bgGrad.addColorStop(1, '#8f7d64');
  } else {
    bgGrad.addColorStop(0, '#f2f1ed');
    bgGrad.addColorStop(0.7, '#eae9e4');
    bgGrad.addColorStop(1, '#e0ded8');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 背景细纹理（低对比，确保自动抠图可识别）
  for (let i = 0; i < 900; i++) {
    const a = 0.02 + rand() * 0.04;
    ctx.fillStyle = `rgba(0,0,0,${a})`;
    ctx.fillRect(rand() * W, rand() * H, 1.5, 1.5);
  }
  if (spec.bg === 'net') {
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 9) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 9) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }
  if (spec.bg === 'bench' || spec.bg === 'soil') {
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.fillRect(0, H * 0.7, W, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, H * 0.7 + 6, W, 2);
  }

  // ---- 杂物（用于演示擦除） ----
  if (spec.clutter) {
    // 左下的塑料盆
    const potX = W * 0.14;
    const potY = H * 0.84;
    ctx.fillStyle = '#2f4d5e';
    ctx.beginPath();
    ctx.moveTo(potX - 42, potY - 46);
    ctx.lineTo(potX + 42, potY - 46);
    ctx.lineTo(potX + 32, potY + 26);
    ctx.lineTo(potX - 32, potY + 26);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3d6377';
    ctx.beginPath();
    ctx.ellipse(potX, potY - 46, 42, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a2018';
    ctx.beginPath();
    ctx.ellipse(potX, potY - 45, 36, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // 右下的石块
    ctx.fillStyle = '#8a8578';
    ctx.beginPath();
    ctx.ellipse(W * 0.86, H * 0.9, 44, 24, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#767162';
    ctx.beginPath();
    ctx.ellipse(W * 0.84, H * 0.885, 30, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // 一根掉落的枝条
    ctx.strokeStyle = '#6d5636';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.74, H * 0.94);
    ctx.quadraticCurveTo(W * 0.82, H * 0.9, W * 0.94, H * 0.93);
    ctx.stroke();
  }

  // ---- 投影 ----
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.beginPath();
  ctx.ellipse(cx + 34, H * 0.945, 96, 16, 0.06, 0, Math.PI * 2);
  ctx.fill();

  // ---- 苗木 ----
  const topY = H * (0.16 + rand() * 0.06) * (spec.heightRatio ?? 1);
  const baseY = H * 0.94;
  const curve = (rand() - 0.5) * 26;
  const trunkW = 13 + rand() * 5;

  const trunkPath = (widthScale: number, color: string) => {
    ctx.beginPath();
    ctx.moveTo(cx - trunkW * widthScale, baseY);
    ctx.quadraticCurveTo(cx - trunkW * widthScale * 0.7 + curve * 0.4, H * 0.6, cx - 4 * widthScale + curve, topY);
    ctx.lineTo(cx + 4 * widthScale + curve, topY);
    ctx.quadraticCurveTo(cx + trunkW * widthScale * 0.7 + curve * 0.4, H * 0.6, cx + trunkW * widthScale, baseY);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };
  trunkPath(1, '#6b533a');
  trunkPath(0.55, '#7f6547');

  // 树皮纹理
  ctx.strokeStyle = 'rgba(58,42,26,0.45)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 26; i++) {
    const t = rand();
    const y = baseY - t * (baseY - topY);
    const x = cx + curve * t + (rand() - 0.5) * trunkW * 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rand() - 0.5) * 3, y - 8 - rand() * 16);
    ctx.stroke();
  }

  // 根际
  ctx.fillStyle = '#5d4630';
  ctx.beginPath();
  ctx.ellipse(cx, baseY - 2, trunkW * 1.7, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 枝条与叶片
  const palette = LEAF_PALETTE[spec.leaf];
  const branchCount = 5 + Math.floor(rand() * 3);
  for (let b = 0; b < branchCount; b++) {
    const t = 0.12 + (b / branchCount) * 0.72 + rand() * 0.05;
    const y = baseY - (baseY - topY) * t;
    const dir = b % 2 === 0 ? 1 : -1;
    const len = (44 + rand() * 74) * (1 - t * 0.35);
    const ex = cx + curve * t + dir * len;
    const ey = y - 18 - rand() * 34;
    ctx.strokeStyle = '#6a5136';
    ctx.lineWidth = Math.max(2.2, 6.5 - t * 4);
    ctx.beginPath();
    ctx.moveTo(cx + curve * t, y);
    ctx.quadraticCurveTo(cx + curve * t + dir * len * 0.55, y - 8, ex, ey);
    ctx.stroke();

    // 叶簇
    const clusters = 2 + Math.floor(rand() * 2);
    for (let cl = 0; cl < clusters; cl++) {
      const lx = ex + (rand() - 0.5) * 26 + dir * cl * 8;
      const ly = ey + (rand() - 0.5) * 26;
      if (spec.leaf === 'ginkgo') {
        for (let i = 0; i < 7; i++) {
          const ang = rand() * Math.PI * 2;
          const r = rand() * 20;
          const px = lx + Math.cos(ang) * r;
          const py = ly + Math.sin(ang) * r;
          ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.quadraticCurveTo(px + 7, py - 7, px + 12, py - 2);
          ctx.quadraticCurveTo(px + 5, py + 4, px, py);
          ctx.fill();
        }
      } else if (spec.leaf === 'maple') {
        for (let i = 0; i < 5; i++) {
          const px = lx + (rand() - 0.5) * 36;
          const py = ly + (rand() - 0.5) * 30;
          const s = 6 + rand() * 6;
          ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
          ctx.beginPath();
          for (let k = 0; k < 5; k++) {
            const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
            const rr = k % 2 === 0 ? s : s * 0.45;
            const x = px + Math.cos(a) * rr;
            const y = py + Math.sin(a) * rr;
            if (k === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
        }
      } else {
        for (let i = 0; i < 16; i++) {
          const px = lx + (rand() - 0.5) * 44;
          const py = ly + (rand() - 0.5) * 36;
          const rx = 4 + rand() * 7;
          const ry = 3 + rand() * 5;
          ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
          ctx.beginPath();
          ctx.ellipse(px, py, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // 顶部主导叶簇
  for (let i = 0; i < 34; i++) {
    const px = cx + curve + (rand() - 0.5) * 100;
    const py = topY + (rand() - 0.5) * 80;
    ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
    ctx.beginPath();
    ctx.ellipse(px, py, 5 + rand() * 8, 4 + rand() * 6, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // 叶面高光
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 60; i++) {
    const px = cx + (rand() - 0.5) * 220;
    const py = topY + rand() * (baseY - topY) * 0.75;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(px, py, 2 + rand() * 3, 1 + rand() * 2, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 微暗角，让背景有真实光感
  const vig = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.28, W / 2, H * 0.5, H * 0.85);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  return { dataUrl: c.toDataURL('image/jpeg', 0.86), canvas: c };
}
