import * as pcModule from 'polygon-clipping';
import earcut from 'earcut';
import type { Pt, StrokeKind, TerminalKind } from './types';

export type Ring = Pt[];
export type Poly = Ring[];
export type MultiPoly = Poly[];

type PcRing = [number, number][];
type PcPoly = PcRing[];
type PcGeom = PcPoly | PcPoly[];

const pc = ((pcModule as unknown as { default?: unknown }).default ?? pcModule) as {
  union: (geom: PcGeom, ...geoms: PcGeom[]) => PcPoly[];
  difference: (a: PcGeom, ...b: PcGeom[]) => PcPoly[];
};

export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a: Pt, s: number): Pt => ({ x: a.x * s, y: a.y * s });
export const dot = (a: Pt, b: Pt) => a.x * b.x + a.y * b.y;
export const cross = (a: Pt, b: Pt) => a.x * b.y - a.y * b.x;
export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
export const norm = (a: Pt): Pt => {
  const l = Math.hypot(a.x, a.y) || 1;
  return { x: a.x / l, y: a.y / l };
};
export const perp = (a: Pt): Pt => ({ x: -a.y, y: a.x });

export function signedArea(ring: Ring): number {
  let s = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    s += a.x * b.y - b.x * a.y;
  }
  return s / 2;
}

export function ensureCCW(ring: Ring): Ring {
  return signedArea(ring) < 0 ? ring.slice().reverse() : ring;
}

export function ringCentroid(ring: Ring): { c: Pt; area: number } {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i];
    const q = ring[(i + 1) % ring.length];
    const f = p.x * q.y - q.x * p.y;
    a += f;
    cx += (p.x + q.x) * f;
    cy += (p.y + q.y) * f;
  }
  a /= 2;
  if (Math.abs(a) < 1e-9) {
    const sx = ring.reduce((s, p) => s + p.x, 0) / Math.max(1, ring.length);
    const sy = ring.reduce((s, p) => s + p.y, 0) / Math.max(1, ring.length);
    return { c: { x: sx, y: sy }, area: 0 };
  }
  return { c: { x: cx / (6 * a), y: cy / (6 * a) }, area: a };
}

export function multiPolyArea(polys: MultiPoly): number {
  let total = 0;
  for (const poly of polys) for (const ring of poly) total += signedArea(ring);
  return Math.abs(total);
}

export function multiPolyCentroid(polys: MultiPoly): Pt {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (const poly of polys) {
    for (const ring of poly) {
      const { c, area: a } = ringCentroid(ring);
      area += a;
      cx += c.x * a;
      cy += c.y * a;
    }
  }
  if (Math.abs(area) < 1e-9) {
    const pts = polys.flat(2);
    if (!pts.length) return { x: 0, y: 0 };
    return {
      x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
      y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
    };
  }
  return { x: cx / area, y: cy / area };
}

export function polyBounds(polys: MultiPoly) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const poly of polys)
    for (const ring of poly)
      for (const p of ring) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  return { minX, minY, maxX, maxY };
}

/** 中心线倒圆角：在拐点处插入二次贝塞尔。 */
export function roundCorners(pts: Pt[], radius: number): Pt[] {
  if (radius <= 0.5 || pts.length < 3) return pts;
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1];
    const v = pts[i];
    const b = pts[i + 1];
    const d1 = norm(sub(a, v));
    const d2 = norm(sub(b, v));
    const cosv = clamp(dot(d1, d2), -1, 1);
    const interior = Math.acos(cosv);
    const turn = Math.PI - interior;
    if (turn < 0.3) {
      out.push(v);
      continue;
    }
    let t = radius / Math.max(0.05, Math.tan(turn / 2));
    t = Math.min(t, 0.48 * dist(a, v), 0.48 * dist(b, v));
    if (t < 0.8) {
      out.push(v);
      continue;
    }
    const p1 = add(v, mul(d1, t));
    const p2 = add(v, mul(d2, t));
    const steps = 6;
    for (let s = 0; s <= steps; s++) {
      const u = s / steps;
      const w0 = (1 - u) * (1 - u);
      const w1 = 2 * u * (1 - u);
      const w2 = u * u;
      out.push({ x: w0 * p1.x + w1 * v.x + w2 * p2.x, y: w0 * p1.y + w1 * v.y + w2 * p2.y });
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export function densify(pts: Pt[], step: number): Pt[] {
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const d = dist(a, b);
    if (d < 1e-6) continue;
    const n = Math.max(1, Math.min(48, Math.ceil(d / step)));
    for (let k = 1; k <= n; k++) out.push({ x: lerp(a.x, b.x, k / n), y: lerp(a.y, b.y, k / n) });
  }
  return out;
}

/** 多边形轮廓倒圆角（输出环层面）。 */
export function filletRing(ring: Ring, radius: number): Ring {
  if (radius <= 0.5 || ring.length < 4) return ring;
  const ccw = signedArea(ring) > 0;
  const out: Ring = [];
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const p = ring[(i - 1 + n) % n];
    const v = ring[i];
    const q = ring[(i + 1) % n];
    const d1 = norm(sub(p, v));
    const d2 = norm(sub(q, v));
    const turnCross = cross(sub(v, p), sub(q, v));
    const convex = ccw ? turnCross > 1e-7 : turnCross < -1e-7;
    const cosv = clamp(dot(d1, d2), -1, 1);
    const interior = Math.acos(cosv);
    if (!convex || interior < 0.6 || interior > Math.PI - 0.12) {
      out.push(v);
      continue;
    }
    const tanHalf = Math.tan(interior / 2);
    let t = radius / Math.max(0.05, tanHalf);
    t = Math.min(t, 0.45 * dist(p, v), 0.45 * dist(q, v));
    if (t < 0.6) {
      out.push(v);
      continue;
    }
    const effR = t * tanHalf;
    const p1 = add(v, mul(d1, t));
    const p2 = add(v, mul(d2, t));
    const bis = norm(add(d1, d2));
    const c = add(v, mul(bis, effR / Math.max(0.2, Math.sin(interior / 2))));
    const a1 = Math.atan2(p1.y - c.y, p1.x - c.x);
    const a2 = Math.atan2(p2.y - c.y, p2.x - c.x);
    let sweep = a2 - a1;
    while (sweep > Math.PI) sweep -= Math.PI * 2;
    while (sweep < -Math.PI) sweep += Math.PI * 2;
    const steps = Math.max(2, Math.min(8, Math.ceil(Math.abs(sweep) / (Math.PI / 9))));
    out.push(p1);
    for (let s = 1; s < steps; s++) {
      const a = a1 + sweep * (s / steps);
      out.push({ x: c.x + effR * Math.cos(a), y: c.y + effR * Math.sin(a) });
    }
    out.push(p2);
  }
  return out;
}

export interface WidthProfile {
  kind: StrokeKind;
  contrast: number;
}

/** 笔画沿程粗细系数（t: 0 → 1）。 */
export function taperFactor(profile: WidthProfile, t: number): number {
  const c = profile.contrast;
  switch (profile.kind) {
    case 'heng': {
      const head = 0.09 * Math.exp(-t / 0.09);
      const mid = -0.13 * smoothstep((t - 0.16) / 0.44);
      const tail = 0.1 * smoothstep((t - 0.7) / 0.22);
      return clamp(0.9 + head + mid + tail, 0.3, 1.6) * (1 - 0.44 * c);
    }
    case 'shu': {
      const tail = 0.11 * smoothstep((t - 0.78) / 0.2);
      return (0.94 + tail) * (1 + 0.38 * c);
    }
    case 'pie': {
      const k = 0.08 + 1.24 * Math.pow(1 - t, 0.72);
      return k * (1 + 0.12 * c);
    }
    case 'na': {
      const k = 0.24 + 1.26 * Math.pow(t, 1.6);
      return k * (1 + 0.18 * c);
    }
    case 'dian': {
      const head = 0.94 + 0.34 * smoothstep(t / 0.28);
      const tail = 1 - 0.78 * smoothstep((t - 0.22) / 0.78);
      return clamp(head * tail, 0.12, 1.4) * (1 + 0.06 * c);
    }
    case 'ti': {
      return 0.16 + 1.08 * Math.pow(t, 1.2);
    }
    case 'zhe': {
      const tip = -0.1 * smoothstep((t - 0.86) / 0.14);
      return (1 + tip) * (1 + 0.36 * c);
    }
    case 'gou': {
      return clamp(1.06 - 0.78 * smoothstep((t - 0.05) / 0.9), 0.12, 1.2) * (1 + 0.3 * c);
    }
    default:
      return 1;
  }
}

export interface OutlineOpts {
  width: number;
  contrast: number;
  kind: StrokeKind;
  terminal: TerminalKind;
  corner: number;
  bow?: number;
}

export function strokeOutline(nodes: Pt[], opts: OutlineOpts): Ring {
  const { width, contrast, kind, terminal, corner } = opts;
  const smoothNodes = roundCorners(nodes, corner * 0.75);
  const centers = densify(smoothNodes, 12);
  const n = centers.length;
  if (n < 2) return [];
  const rawWidths: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let w = Math.max(1.5, width * taperFactor({ kind, contrast }, t));
    if (terminal === 'flare') w *= 1 + 0.9 * smoothstep((t - 0.8) / 0.2);
    if (terminal === 'sharp') w *= 1 - 0.74 * smoothstep((t - 0.66) / 0.34);
    if (terminal === 'flat') w *= 1 - 0.4 * smoothstep((t - 0.93) / 0.07);
    rawWidths[i] = w;
  }
  // 平滑沿程宽度，避免粗笔画在起笔/收笔处产生凹口
  const widths: number[] = new Array(n);
  const win = Math.max(2, Math.round(n * 0.06));
  for (let i = 0; i < n; i++) {
    let sum = 0;
    let cnt = 0;
    for (let k = -win; k <= win; k++) {
      const j = clamp(i + k, 0, n - 1);
      sum += rawWidths[j];
      cnt++;
    }
    widths[i] = sum / cnt;
  }
  // 半径不得超过局部曲率半径，否则轮廓自交
  const curvatureLimit = (i: number) => {
    const a = centers[Math.max(0, i - 2)];
    const b = centers[i];
    const c = centers[Math.min(n - 1, i + 2)];
    const cross = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
    const base = Math.max(1e-3, dist(a, b) * dist(b, c));
    const sinA = cross / base;
    const turn = Math.max(0.02, Math.asin(clamp(sinA, 0, 1)));
    return turn > 0.35 ? Math.max(width * 0.62, dist(a, c) / (2 * Math.sin(turn))) : Infinity;
  };
  for (let i = 0; i < n; i++) {
    widths[i] = Math.min(widths[i], curvatureLimit(i));
  }

  const bow = opts.bow ?? 0;
  const left: Pt[] = [];
  const right: Pt[] = [];
  const tangents: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = centers[Math.max(0, i - 1)];
    const b = centers[Math.min(n - 1, i + 1)];
    tangents.push(norm(sub(b, a)));
  }
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const nrm = perp(tangents[i]);
    const off = bow * Math.sin(Math.PI * t);
    const c: Pt = { x: centers[i].x + nrm.x * off, y: centers[i].y + nrm.y * off };
    const h = widths[i] / 2;
    left.push(add(c, mul(nrm, h)));
    right.push(add(c, mul(nrm, -h)));
  }

  /** 以 center 为圆心、穿过 from→to 的半圆，凸向 outward 指定的一侧 */
  const arcBetween = (center: Pt, from: Pt, to: Pt, outward: Pt, steps: number): Pt[] => {
    const r = dist(center, from);
    const a1 = Math.atan2(from.y - center.y, from.x - center.x);
    const a2 = Math.atan2(to.y - center.y, to.x - center.x);
    let sweep = a2 - a1;
    while (sweep > Math.PI) sweep -= Math.PI * 2;
    while (sweep < -Math.PI) sweep += Math.PI * 2;
    const midA = a1 + sweep / 2;
    const mid = { x: Math.cos(midA), y: Math.sin(midA) };
    if (mid.x * outward.x + mid.y * outward.y < 0) sweep = -sweep;
    const outPts: Pt[] = [];
    for (let i = 1; i < steps; i++) {
      const a = a1 + sweep * (i / steps);
      outPts.push({ x: center.x + r * Math.cos(a), y: center.y + r * Math.sin(a) });
    }
    return outPts;
  };

  const tEnd = tangents[n - 1];
  const nEnd = perp(tEnd);
  const rEnd = right[n - 1];
  const lEnd = left[n - 1];
  const hEnd = Math.max(1, dist(centers[n - 1], rEnd));
  let endCap: Pt[];
  if (terminal === 'round') {
    endCap = arcBetween(centers[n - 1], rEnd, lEnd, tEnd, 9);
  } else if (terminal === 'sharp') {
    const ext = Math.max(9, hEnd * 1.9);
    endCap = [
      { x: rEnd.x + tEnd.x * ext * 0.55, y: rEnd.y + tEnd.y * ext * 0.55 },
      { x: centers[n - 1].x + tEnd.x * ext, y: centers[n - 1].y + tEnd.y * ext },
      { x: lEnd.x + tEnd.x * ext * 0.55, y: lEnd.y + tEnd.y * ext * 0.55 },
    ];
  } else if (terminal === 'flare') {
    endCap = [
      { x: rEnd.x + tEnd.x * hEnd * 0.5 + nEnd.x * hEnd * 0.34, y: rEnd.y + tEnd.y * hEnd * 0.5 + nEnd.y * hEnd * 0.34 },
      { x: lEnd.x + tEnd.x * hEnd * 0.06 - nEnd.x * hEnd * 0.04, y: lEnd.y + tEnd.y * hEnd * 0.06 - nEnd.y * hEnd * 0.04 },
    ];
  } else if (terminal === 'oblique') {
    endCap = [{ x: rEnd.x + tEnd.x * hEnd * 1.1, y: rEnd.y + tEnd.y * hEnd * 1.1 }];
  } else {
    endCap = [];
  }

  const tStart = tangents[0];
  const rStart = right[0];
  const lStart = left[0];
  const hStart = Math.max(1, dist(centers[0], rStart));
  let startCap: Pt[];
  if (terminal === 'round') {
    startCap = arcBetween(centers[0], lStart, rStart, { x: -tStart.x, y: -tStart.y }, 9);
  } else if (terminal === 'sharp') {
    startCap = [
      { x: lStart.x - tStart.x * hStart * 0.4, y: lStart.y - tStart.y * hStart * 0.4 },
      { x: rStart.x - tStart.x * hStart * 0.4, y: rStart.y - tStart.y * hStart * 0.4 },
    ];
  } else if (terminal === 'flare') {
    startCap = [
      { x: lStart.x - tStart.x * hStart * 0.3, y: lStart.y - tStart.y * hStart * 0.3 },
      { x: rStart.x - tStart.x * hStart * 0.04, y: rStart.y - tStart.y * hStart * 0.04 },
    ];
  } else {
    startCap = [];
  }

  const ring: Ring = [...right, ...endCap, ...left.slice().reverse(), ...startCap];
  return ensureCCW(filletRing(ring, corner * 0.6));
}

const q = (v: number) => Math.round(v * 20) / 20;

function toGeom(polys: MultiPoly): PcPoly[] {
  return polys
    .filter((poly) => poly.length > 0)
    .map((poly) =>
      poly
        .filter((ring) => ring.length >= 3)
        .map((ring) => {
          const out: PcRing = ring.map((p) => [q(p.x), q(p.y)] as [number, number]);
          out.push([q(ring[0].x), q(ring[0].y)]);
          return out;
        }),
    )
    .filter((poly) => poly.length > 0);
}

/** 清理布尔运算产生的细碎环（面积 < 60 sq·em 的空洞或碎片） */
function cleanResult(polys: PcPoly[]): MultiPoly {
  const out: MultiPoly = [];
  for (const poly of polys) {
    const rings = poly.map((ring) => dedupeRing(ring.map(([x, y]) => ({ x, y })))).filter((r) => r.length >= 3);
    if (!rings.length) continue;
    const kept = rings.filter((r, i) => i === 0 || Math.abs(signedArea(r)) > 60);
    if (!kept.length) continue;
    out.push(kept);
  }
  return out;
}

export function unionRings(rings: Ring[], spread = 0): MultiPoly {
  const prepared = spread > 0 ? rings.map((r) => offsetRing(r, spread)) : rings;
  const geom = toGeom(prepared.map((r) => [r]));
  if (!geom.length) return [];
  try {
    const merged = pc.union(geom) as PcPoly[];
    return cleanResult(merged);
  } catch {
    return [];
  }
}

export function subtractWith(polys: MultiPoly, clip: MultiPoly): MultiPoly {
  const a = toGeom(polys);
  const b = toGeom(clip);
  if (!a.length) return [];
  if (!b.length) return polys;
  try {
    const res = pc.difference(a, b) as PcPoly[];
    return cleanResult(res);
  } catch {
    return polys;
  }
}

/** 沿外法线微幅膨胀轮廓（em 单位），用于闭合笔画间接缝与布尔运算的细缝。 */
export function offsetRing(ring: Ring, delta: number): Ring {
  if (ring.length < 4 || delta <= 0) return ring;
  const ccw = signedArea(ring) > 0;
  const pts = ccw ? ring : ring.slice().reverse();
  const n = pts.length;
  const out: Ring = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const e1 = norm({ x: cur.x - prev.x, y: cur.y - prev.y });
    const e2 = norm({ x: next.x - cur.x, y: next.y - cur.y });
    const n1 = { x: e1.y, y: -e1.x };
    const n2 = { x: e2.y, y: -e2.x };
    const bis = norm({ x: n1.x + n2.x, y: n1.y + n2.y });
    const cosHalf = Math.max(0.3, bis.x * n1.x + bis.y * n1.y);
    const scale = Math.min(delta / cosHalf, delta * 3.2);
    out.push({ x: cur.x + bis.x * scale, y: cur.y + bis.y * scale });
  }
  return ccw ? out : out.reverse();
}

export function dedupeRing(ring: Ring): Ring {
  const out: Ring = [];
  for (const p of ring) {
    const last = out[out.length - 1];
    if (!last || Math.abs(last.x - p.x) > 0.03 || Math.abs(last.y - p.y) > 0.03) out.push(p);
  }
  if (out.length > 1) {
    const a = out[0];
    const b = out[out.length - 1];
    if (Math.abs(a.x - b.x) < 0.03 && Math.abs(a.y - b.y) < 0.03) out.pop();
  }
  return out;
}

export function ringsToPath(polys: MultiPoly): string {
  const fmt = (v: number) => {
    const r = Math.round(v * 100) / 100;
    return String(r);
  };
  const parts: string[] = [];
  for (const poly of polys) {
    for (const ring of poly) {
      if (ring.length < 3) continue;
      parts.push(ring.map((p, i) => `${i === 0 ? 'M' : 'L'}${fmt(p.x)} ${fmt(p.y)}`).join(' '));
    }
  }
  return parts.join(' ');
}

export function maskGlyph(polys: MultiPoly, holes: Ring[]): MultiPoly {
  if (!holes.length) return polys;
  return subtractWith(polys, holes.map((h) => [h]));
}

export function triangulate(polys: MultiPoly): { vertices: Float32Array; indices: Uint32Array } {
  const verts: number[] = [];
  const idx: number[] = [];
  for (const poly of polys) {
    if (!poly.length) continue;
    const flat: number[] = [];
    const holeIdx: number[] = [];
    let base = 0;
    for (let ri = 0; ri < poly.length; ri++) {
      const ring = poly[ri];
      if (ri > 0) holeIdx.push(base);
      for (const p of ring) {
        flat.push(p.x, p.y);
        base++;
      }
    }
    if (base < 3) continue;
    let tris: number[];
    try {
      tris = earcut(flat, holeIdx.length ? holeIdx : undefined, 2);
    } catch {
      tris = [];
    }
    const vOff = verts.length / 2;
    for (let i = 0; i < flat.length; i += 2) verts.push(flat[i], flat[i + 1]);
    for (const t of tris) idx.push(t + vOff);
  }
  return { vertices: new Float32Array(verts), indices: new Uint32Array(idx) };
}
