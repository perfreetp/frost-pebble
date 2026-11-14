/**
 * 自动初抠：以照片左右边缘的背景色按行插值作为底色模型，
 * 对每个像素做色距判定，再剔除孤立噪点，最后对边缘做羽化。
 * 结果是一张与照片同尺寸的 alpha 蒙版（白色 = 保留）。
 */
export interface CutoutOptions {
  /** 色距容差，越大保留越多（默认 46） */
  tolerance?: number;
  /** 边缘过渡宽度（默认 16） */
  softness?: number;
  /** 孤立区域最小像素面积（默认 260） */
  minArea?: number;
  /** 羽化半径（默认 1.1） */
  feather?: number;
}

export const PLATE_W = 720;
export const PLATE_H = 960;

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function autoCutout(source: HTMLCanvasElement, opts: CutoutOptions = {}): HTMLCanvasElement {
  const tolerance = opts.tolerance ?? 46;
  const softness = Math.max(2, opts.softness ?? 16);
  const minArea = opts.minArea ?? 14;
  const feather = opts.feather ?? 1.1;

  const w = source.width;
  const h = source.height;
  const ctx = source.getContext('2d', { willReadFrequently: true })!;
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;

  // 逐行左右边缘底色
  const bgL = new Float32Array(h * 3);
  const bgR = new Float32Array(h * 3);
  for (let y = 0; y < h; y++) {
    let lr = 0, lg = 0, lb = 0, rr = 0, rg = 0, rb = 0;
    const n = 4;
    for (let k = 0; k < n; k++) {
      const iL = (y * w + k) * 4;
      const iR = (y * w + (w - 1 - k)) * 4;
      lr += data[iL]; lg += data[iL + 1]; lb += data[iL + 2];
      rr += data[iR]; rg += data[iR + 1]; rb += data[iR + 2];
    }
    bgL[y * 3] = lr / n; bgL[y * 3 + 1] = lg / n; bgL[y * 3 + 2] = lb / n;
    bgR[y * 3] = rr / n; bgR[y * 3 + 1] = rg / n; bgR[y * 3 + 2] = rb / n;
  }

  // 背景整体的中位色，作为兜底（处理边缘本身被主体占据的情况）
  const sample: number[] = [];
  for (let y = 0; y < Math.max(4, h * 0.06); y++) {
    for (let x = 0; x < w; x += 3) {
      const i = (y * w + x) * 4;
      sample.push(data[i], data[i + 1], data[i + 2]);
    }
  }
  const med = (arr: number[], ch: number) => {
    const v: number[] = [];
    for (let i = ch; i < arr.length; i += 3) v.push(arr[i]);
    v.sort((a, b) => a - b);
    return v[Math.floor(v.length / 2)] ?? 200;
  };
  const globalBg = [med(sample, 0), med(sample, 1), med(sample, 2)];

  const alpha = new Uint8ClampedArray(w * h);
  const lo = tolerance;
  const hi = tolerance + softness;

  for (let y = 0; y < h; y++) {
    const row = y * w;
    const t = y / (h - 1);
    const gbR = bgL[y * 3] * (1 - t) + bgR[y * 3] * t;
    const gbG = bgL[y * 3 + 1] * (1 - t) + bgR[y * 3 + 1] * t;
    const gbB = bgL[y * 3 + 2] * (1 - t) + bgR[y * 3 + 2] * t;
    for (let x = 0; x < w; x++) {
      const i = (row + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const fx = x / (w - 1);
      // 行内左右插值 + 全局兜底
      const dr1 = r - (bgL[y * 3] * (1 - fx) + bgR[y * 3] * fx);
      const dg1 = g - (bgL[y * 3 + 1] * (1 - fx) + bgR[y * 3 + 1] * fx);
      const db1 = b - (bgL[y * 3 + 2] * (1 - fx) + bgR[y * 3 + 2] * fx);
      const d1 = Math.sqrt(dr1 * dr1 * 0.9 + dg1 * dg1 + db1 * db1 * 0.9);
      const dr2 = r - gbR, dg2 = g - gbG, db2 = b - gbB;
      const d2 = Math.sqrt(dr2 * dr2 * 0.9 + dg2 * dg2 + db2 * db2 * 0.9);
      const d3 = Math.sqrt((r - globalBg[0]) ** 2 + (g - globalBg[1]) ** 2 + (b - globalBg[2]) ** 2);
      const d = Math.min(d1, d2, d3);
      let a: number;
      if (d <= lo) a = 0;
      else if (d >= hi) a = 255;
      else a = Math.round((255 * (d - lo)) / (hi - lo));
      alpha[row + x] = a;
    }
  }

  // 连通域：去掉孤立小噪点（背景杂物碎屑）
  const label = new Int32Array(w * h).fill(-1);
  const stack = new Int32Array(w * h);
  const keep = new Uint8Array(w * h);
  let current = 0;
  for (let start = 0; start < w * h; start++) {
    if (label[start] !== -1 || alpha[start] < 110) continue;
    let sp = 0;
    stack[sp++] = start;
    label[start] = current;
    let area = 0;
    let sx = 0, sy = 0;
    while (sp > 0) {
      const p = stack[--sp];
      area++;
      const px = p % w, py = (p / w) | 0;
      sx += px; sy += py;
      const neighbors = [p - 1, p + 1, p - w, p + w];
      const nx = [px - 1, px + 1, px, px];
      const ny = [py, py, py - 1, py + 1];
      for (let k = 0; k < 4; k++) {
        const q = neighbors[k];
        if (q < 0 || q >= w * h) continue;
        if (Math.abs(nx[k] - px) + Math.abs(ny[k] - py) !== 1) continue;
        if (label[q] !== -1 || alpha[q] < 110) continue;
        label[q] = current;
        stack[sp++] = q;
      }
    }
    if (area >= minArea) {
      // 重新遍历标记 keep
      let sp2 = 0;
      stack[sp2++] = start;
      keep[start] = 1;
      while (sp2 > 0) {
        const p = stack[--sp2];
        const px = p % w, py = (p / w) | 0;
        const nb = [p - 1, p + 1, p - w, p + w];
        const okx = [px > 0, px < w - 1, true, true];
        for (let k = 0; k < 4; k++) {
          if (!okx[k]) continue;
          const q = nb[k];
          if (q < 0 || q >= w * h) continue;
          if (keep[q] || label[q] !== current) continue;
          keep[q] = 1;
          stack[sp2++] = q;
        }
      }
    }
    current++;
  }

  for (let p = 0; p < w * h; p++) {
    if (!keep[p]) alpha[p] = 0;
  }

  // 输出蒙版
  const raw = makeCanvas(w, h);
  const rctx = raw.getContext('2d')!;
  const out = rctx.createImageData(w, h);
  for (let p = 0; p < w * h; p++) {
    const i = p * 4;
    out.data[i] = 255;
    out.data[i + 1] = 255;
    out.data[i + 2] = 255;
    out.data[i + 3] = alpha[p];
  }
  rctx.putImageData(out, 0, 0);

  if (feather <= 0) return raw;
  const soft = makeCanvas(w, h);
  const sctx = soft.getContext('2d')!;
  sctx.filter = `blur(${feather}px)`;
  sctx.drawImage(raw, 0, 0);
  sctx.filter = 'none';
  return soft;
}
