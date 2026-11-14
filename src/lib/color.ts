// Colour science helpers: sRGB <-> linear conversion, approximate correlated
// colour temperature from an RGB triple, and the gain vector used to relight
// a subject toward a backdrop's white balance.

export function srgbToLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(c: number) {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export interface ChannelStats {
  r: number;
  g: number;
  b: number;
  luma: number;
  chroma: number;
  cct: number;
  count: number;
}

// Planckian locus approximated by normalised RGB of a black body, sampled at
// the CCTs a product photographer actually meets between a warm tungsten
// studio light and a cool north-facing window.
const BLACKBODY: Array<[number, [number, number, number]]> = [
  [1000, [1.0, 0.405, 0.079]],
  [2000, [1.0, 0.63, 0.297]],
  [3000, [1.0, 0.777, 0.463]],
  [4000, [1.0, 0.855, 0.626]],
  [5000, [1.0, 0.91, 0.785]],
  [6000, [1.0, 0.946, 0.899]],
  [6600, [1.0, 0.966, 0.966]],
  [7500, [0.972, 0.958, 1.0]],
  [9000, [0.904, 0.943, 1.0]],
  [11000, [0.826, 0.914, 1.0]],
];

function blackbodyRgb(cct: number): [number, number, number] {
  const k = Math.max(BLACKBODY[0][0], Math.min(BLACKBODY[BLACKBODY.length - 1][0], cct));
  for (let i = 1; i < BLACKBODY.length; i++) {
    const [hiK, hi] = BLACKBODY[i];
    if (k <= hiK) {
      const [loK, lo] = BLACKBODY[i - 1];
      const t = (k - loK) / (hiK - loK);
      return [lo[0] + (hi[0] - lo[0]) * t, lo[1] + (hi[1] - lo[1]) * t, lo[2] + (hi[2] - lo[2]) * t];
    }
  }
  return [1, 1, 1];
}

/** Approximate CCT by matching the normalised chromaticity to the locus. */
export function cctFromRgb(r: number, g: number, b: number): number {
  const m = Math.max(r, g, b);
  if (m <= 0.0005) return 6600;
  const nr = r / m;
  const nb = b / m;
  let best = 6600;
  let bestDist = Infinity;
  for (let k = 1000; k <= 11000; k += 25) {
    const [br, bg, bb] = blackbodyRgb(k);
    const bm = Math.max(br, bg, bb);
    const dr = br / bm - nr;
    const db = bb / bm - nb;
    const dist = dr * dr + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = k;
    }
  }
  return best;
}

/** Analyse an RGBA pixel buffer, ignoring transparent pixels. */
export function analysePixels(data: Uint8ClampedArray, stride = 1): ChannelStats {
  let sr = 0, sg = 0, sb = 0, sw = 0, count = 0;
  for (let i = 0; i < data.length; i += 4 * stride) {
    const a = data[i + 3] / 255;
    if (a < 0.02) continue;
    sr += srgbToLinear(data[i] / 255) * a;
    sg += srgbToLinear(data[i + 1] / 255) * a;
    sb += srgbToLinear(data[i + 2] / 255) * a;
    sw += a;
    count++;
  }
  if (sw < 1e-6) {
    return { r: 0, g: 0, b: 0, luma: 0, chroma: 0, cct: 6600, count: 0 };
  }
  const r = sr / sw, g = sg / sw, b = sb / sw;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return {
    r, g, b,
    luma,
    chroma: Math.hypot(r - luma, b - luma),
    cct: cctFromRgb(r, g, b),
    count,
  };
}

export function cctToLinearRgb(cct: number): [number, number, number] {
  const [r, g, b] = blackbodyRgb(cct);
  const m = Math.max(r, g, b);
  return [r / m, g / m, b / m];
}

/**
 * Gains that relight a subject shot at `subjectCct` so it sits under a
 * backdrop of `bgCct`. Strength 0 = untouched, 1 = fully balanced. Luminance
 * is preserved so the exposure does not shift while the cast goes away.
 */
export function balanceGains(subjectCct: number, bgCct: number, strength: number): [number, number, number] {
  const src = cctToLinearRgb(subjectCct);
  const dst = cctToLinearRgb(bgCct);
  // A full white-balance match turns a product sepia under a 2400K wood
  // wall, which no art director will accept. Cap each channel so the
  // correction reads as "sitting in the same room", not "re-graded".
  const MAX_GAIN = 1.22;
  const MIN_GAIN = 0.82;
  const gains: [number, number, number] = [1, 1, 1];
  for (let c = 0; c < 3; c++) {
    const raw = dst[c] / Math.max(src[c], 0.05);
    const clamped = Math.max(MIN_GAIN, Math.min(MAX_GAIN, raw));
    // Blend in the limited correction, then cap again after the lerp.
    gains[c] = Math.max(MIN_GAIN, Math.min(MAX_GAIN, 1 + (clamped - 1) * strength));
  }
  const l = 0.2126 * gains[0] + 0.7152 * gains[1] + 0.0722 * gains[2];
  if (l > 1e-4) {
    gains[0] /= l;
    gains[1] /= l;
    gains[2] /= l;
  }
  return gains;
}

export function cctLabel(cct: number) {
  if (cct < 3200) return '暖调钨丝';
  if (cct < 4500) return '暖白';
  if (cct < 5800) return '中性白';
  if (cct < 7000) return '冷白';
  return '冷调';
}

export function formatCct(cct: number) {
  return `${Math.round(cct / 50) * 50}K`;
}

export interface EdgeMetrics {
  score: number;
  fringeRatio: number;
  softRatio: number;
  boundary: number;
  label: string;
  tone: 'good' | 'warn' | 'bad';
}

/** Turn GPU counters into a human diagnosis for the supervisor's checklist. */
export function edgeMetricsFromCounts(boundary: number, fringe: number, soft: number): EdgeMetrics {
  if (boundary < 24) {
    return { score: 0, fringeRatio: 0, softRatio: 0, boundary, label: '主体太小，无法评估边缘', tone: 'warn' };
  }
  const fringeRatio = fringe / boundary;
  // `soft` counts every mid-alpha pixel in the frame; most of them sit inside
  // the contour ramp and are expected. What matters is how many of them are
  // *not* paired with a hard boundary, i.e. a genuinely mushy rim.
  // `soft` counts the anti-aliased rim; a clean feather on a large silhouette
  // is normal, so weight it well below halo spill.
  const softRatio = Math.min(1, soft / Math.max(boundary, 1));
  // Halo is far more visible in print than a slightly soft ramp, so it dominates.
  const score = Math.min(1, fringeRatio * 0.85 + softRatio * 0.12);
  const label = score < 0.08 ? '边缘干净' : score < 0.18 ? '轻微毛刺' : score < 0.30 ? '毛刺明显' : '边缘不合格';
  const tone = score < 0.06 ? 'good' : score < 0.24 ? 'warn' : 'bad';
  return { score, fringeRatio, softRatio, boundary, label, tone };
}

export function formatPct(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

export function formatDate(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDay(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export type Urgency = 'over' | 'urgent' | 'soon' | 'normal';

export function remainingLabel(dueAt: number, now = Date.now()): { text: string; urgency: Urgency } {
  const ms = dueAt - now;
  if (ms < 0) {
    const over = -ms;
    return over < 86400000
      ? { text: `逾期 ${Math.max(1, Math.round(over / 3600000))} 小时`, urgency: 'over' }
      : { text: `逾期 ${Math.floor(over / 86400000)} 天`, urgency: 'over' };
  }
  const days = ms / 86400000;
  if (days < 1) {
    return { text: `剩余 ${Math.floor(ms / 3600000)} 小时`, urgency: 'urgent' };
  }
  if (days < 3) {
    return { text: `剩余 ${Math.floor(days)} 天 ${Math.floor((ms % 86400000) / 3600000)} 小时`, urgency: 'urgent' };
  }
  if (days < 7) return { text: `剩余 ${Math.floor(days)} 天`, urgency: 'soon' };
  return { text: `剩余 ${Math.floor(days)} 天`, urgency: 'normal' };
}
