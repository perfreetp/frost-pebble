import type { GenParams, GlyphSkeleton, Metrics, Pt, StrokeState } from './types';
import { rngFor, hashNumber } from './rng';
import {
  clamp,
  dedupeRing,
  ensureCCW,
  densify,
  dist,
  lerp,
  multiPolyArea,
  multiPolyCentroid,
  norm,
  perp,
  polyBounds,
  ringsToPath,
  strokeOutline,
  unionRings,
  type MultiPoly,
  type Ring,
} from './geometry';

export const DEFAULT_PARAMS: GenParams = {
  weight: 86,
  contrast: 0.3,
  slant: 0,
  corner: 22,
  terminal: 'flat',
  seed: 20261014,
};

export const TERMINAL_LABEL: Record<GenParams['terminal'], string> = {
  flat: '平切',
  round: '圆头',
  sharp: '尖锐',
  flare: '喇叭',
  oblique: '斜切',
};

export function applySlant(p: Pt, slantDeg: number): Pt {
  if (!slantDeg) return { x: p.x, y: p.y };
  const t = Math.tan((slantDeg * Math.PI) / 180);
  return { x: p.x + (p.y - 500) * t, y: p.y };
}

/** 按弧长重采样为可拖动的节点 */
export function resampleNodes(pts: Pt[], count: number): Pt[] {
  if (pts.length < 2) return pts.slice();
  const dense = densify(pts, 6);
  const total = dense.reduce((acc, p, i) => (i ? acc + dist(dense[i - 1], p) : 0), 0);
  const out: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const target = (total * i) / Math.max(1, count - 1);
    let acc = 0;
    let placed = false;
    for (let k = 1; k < dense.length; k++) {
      const d = dist(dense[k - 1], dense[k]);
      if (acc + d >= target || k === dense.length - 1) {
        const t = d > 1e-6 ? clamp((target - acc) / d, 0, 1) : 0;
        out.push({ x: lerp(dense[k - 1].x, dense[k].x, t), y: lerp(dense[k - 1].y, dense[k].y, t) });
        placed = true;
        break;
      }
      acc += d;
    }
    if (!placed) out.push({ ...dense[dense.length - 1] });
  }
  return out;
}

function nodeCountFor(pts: Pt[]): number {
  let length = 0;
  for (let i = 1; i < pts.length; i++) length += dist(pts[i - 1], pts[i]);
  return clamp(Math.round(length / 95) + 2, 2, 7);
}

export function buildStrokeNodes(
  skeleton: { id: string; kind: StrokeState['kind']; pts: Pt[]; widthScale?: number },
  seed: number,
  char: string,
  slant: number,
): StrokeState {
  const base = resampleNodes(skeleton.pts, nodeCountFor(skeleton.pts));
  const rng = rngFor(seed, char, skeleton.id, 'jitter');
  const amp = 0.8 + rng() * 2.4;
  const freq = 1.1 + rng() * 1.7;
  const phase = rng() * Math.PI * 2;
  const phase2 = rng() * Math.PI * 2;

  // 抖动在端点归零，保证相邻笔画的接点严格对齐
  const jittered: Pt[] = base.map((p, i, arr) => {
    const t = i / Math.max(1, arr.length - 1);
    const prev = arr[Math.max(0, i - 1)];
    const next = arr[Math.min(arr.length - 1, i + 1)];
    const nrm = perp(norm({ x: next.x - prev.x, y: next.y - prev.y }));
    const envelope = Math.sin(Math.PI * t);
    const off =
      (Math.sin(freq * Math.PI * t + phase) * 0.7 + Math.sin(freq * 2.3 * Math.PI * t + phase2) * 0.3) *
      amp *
      envelope;
    return { x: p.x + nrm.x * off, y: p.y + nrm.y * off };
  });

  const nodes = jittered.map((p) => applySlant(p, slant));

  return {
    id: skeleton.id,
    kind: skeleton.kind,
    nodes,
    baseNodes: base.map((p) => applySlant(p, slant)),
    widthScale: skeleton.widthScale ?? 1,
    bow: (rng() - 0.5) * 6,
    manual: false,
  };
}

/** 短画的长度是否小于其笔宽 → 视为点，直接画圆点避免自相交 */
function totalLength(pts: Pt[]): number {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += dist(pts[i - 1], pts[i]);
  return l;
}

export function renderStroke(stroke: StrokeState, params: GenParams): Ring {
  if (stroke.manual && stroke.poly && stroke.poly.length >= 3) {
    return stroke.poly;
  }
  const width = params.weight * stroke.widthScale;
  const len = totalLength(stroke.nodes);
  // 极短笔画：用倾斜椭圆近似，避免超粗笔画的轮廓自相交
  if (len < width * 0.9) {
    const a = stroke.nodes[0];
    const d = stroke.nodes[stroke.nodes.length - 1];
    const c = { x: (a.x + d.x) / 2, y: (a.y + d.y) / 2 };
    const angle = Math.atan2(d.y - a.y, d.x - a.x);
    const rad = Math.max(width * 0.6, len / 2 + width * 0.26);
    const rx = rad * 1.08;
    const ry = rad * 0.9;
    const ring: Ring = [];
    for (let i = 0; i < 24; i++) {
      const t = (i / 24) * Math.PI * 2;
      const lx = Math.cos(t) * rx;
      const ly = Math.sin(t) * ry;
      ring.push({
        x: c.x + lx * Math.cos(angle) - ly * Math.sin(angle),
        y: c.y + lx * Math.sin(angle) + ly * Math.cos(angle),
      });
    }
    return ensureCCW(ring);
  }
  return strokeOutline(stroke.nodes, {
    width,
    contrast: params.contrast,
    kind: stroke.kind,
    terminal: params.terminal,
    corner: params.corner,
    bow: stroke.bow,
  });
}

export interface GenerateInput {
  char: string;
  skeleton: GlyphSkeleton;
  params: GenParams;
  /** 上一版本笔画；其中 manual=true 的将被保留 */
  previous?: StrokeState[];
}

export interface GenerateResult {
  strokes: StrokeState[];
  polys: MultiPoly;
  path: string;
  metrics: Metrics;
  fingerprint: string;
  lockedCount: number;
}

export function canonicalStrokes(strokes: StrokeState[]): string {
  return strokes
    .slice()
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((s) => {
      if (s.manual && s.poly && s.poly.length >= 3) {
        return `${s.id}#M#${s.poly.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}`;
      }
      return `${s.id}#${s.nodes.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}`;
    })
    .join('|');
}

/** 单笔轮廓先自并，消除自相交造成的空洞与碎片 */
export function normalizeStrokeRing(ring: Ring): Ring[] {
  if (ring.length < 3) return [];
  const solved = unionRings([ring]);
  return solved.map((poly) => (poly.length ? poly[0] : [])).filter((r) => r.length >= 3);
}

export function composeGlyph(strokes: StrokeState[], params: GenParams) {
  const rings: Ring[] = [];
  for (const st of strokes) {
    const r = renderStroke(st, params);
    if (r.length >= 3) rings.push(...normalizeStrokeRing(r));
  }
  const polys: MultiPoly = unionRings(rings, 2.6)
    .map((poly) => poly.map((ring) => dedupeRing(ring)))
    .filter((poly) => poly.length > 0);
  const metrics = computeMetrics(polys, strokes.length);
  return { polys, path: ringsToPath(polys), metrics };
}

export function generateGlyph(input: GenerateInput): GenerateResult {
  const { char, skeleton, params, previous } = input;
  const prevMap = new Map<string, StrokeState>();
  for (const st of previous ?? []) prevMap.set(st.id, st);

  const strokes: StrokeState[] = [];
  const rings: Ring[] = [];
  let lockedCount = 0;

  for (const sk of skeleton.strokes) {
    const prev = prevMap.get(sk.id);
    if (prev?.manual && prev.poly && prev.poly.length >= 3) {
      lockedCount++;
      strokes.push({ ...prev, manual: true });
      rings.push(prev.poly);
      continue;
    }
    const st = buildStrokeNodes(sk, params.seed, char, params.slant);
    strokes.push(st);
    rings.push(renderStroke(st, params));
  }

  const polys: MultiPoly = unionRings(rings, 2.6)
    .map((poly) => poly.map((ring) => dedupeRing(ring)))
    .filter((poly) => poly.length > 0);

  const metrics = computeMetrics(polys, strokes.length);
  const path = ringsToPath(polys);
  const fingerprint = hashNumber(
    params.seed,
    params.weight.toFixed(2),
    params.contrast.toFixed(3),
    params.slant.toFixed(2),
    params.corner.toFixed(1),
    params.terminal,
    char,
    canonicalStrokes(strokes),
  );

  return { strokes, polys, path, metrics, fingerprint, lockedCount };
}

/** 仅重建某一笔（供交互式拖点使用） */
export function rebuildStroke(stroke: StrokeState, params: GenParams): MultiPoly {
  const ring = renderStroke(stroke, params);
  if (ring.length < 3) return [];
  return unionRings([ring]);
}

export function computeMetrics(polys: MultiPoly, strokeCount: number): Metrics {
  const b = polyBounds(polys);
  const c = multiPolyCentroid(polys);
  const area = multiPolyArea(polys);
  const w = b.maxX - b.minX;
  const h = b.maxY - b.minY;
  return {
    inkWidth: w,
    inkHeight: h,
    inkArea: area,
    inkRatio: w * h > 0 ? area / (w * h) : 0,
    cogX: c.x,
    cogY: c.y,
    bounds: b,
    strokeCount,
  };
}

export function ringSnapshot(rings: Ring[]): Pt[][] {
  return rings.map((r) => r.map((p) => ({ x: p.x, y: p.y })));
}

export function paramSummary(p: GenParams): string {
  return `重 ${p.weight} · 对比 ${Math.round(p.contrast * 100)}% · 倾 ${p.slant}° · 圆角 ${p.corner} · ${TERMINAL_LABEL[p.terminal]}`;
}

export function compareVersions(a: { metrics: Metrics }, b: { metrics: Metrics }) {
  const rows = [
    { key: 'cogX', label: '重心 X', unit: 'em', a: a.metrics.cogX, b: b.metrics.cogX, digits: 1 },
    { key: 'cogY', label: '重心 Y', unit: 'em', a: a.metrics.cogY, b: b.metrics.cogY, digits: 1 },
    { key: 'inkWidth', label: '字面宽度', unit: 'em', a: a.metrics.inkWidth, b: b.metrics.inkWidth, digits: 1 },
    { key: 'inkHeight', label: '字面高度', unit: 'em', a: a.metrics.inkHeight, b: b.metrics.inkHeight, digits: 1 },
  ];
  return rows.map((r) => {
    const delta = r.b - r.a;
    const pct = r.a === 0 ? (r.b === 0 ? 0 : 100) : (delta / Math.abs(r.a)) * 100;
    return { ...r, delta, pct, flagged: Math.abs(pct) > 3 };
  });
}

export function shiftGlyph(polys: MultiPoly, dx: number, dy: number): MultiPoly {
  return polys.map((poly) => poly.map((ring) => ring.map((p) => ({ x: p.x + dx, y: p.y + dy }))));
}

