// 纯几何工具：向量、折线长度（含折弯圆弧修正）、包围盒、多边形面积等
import type { Vec2 } from '../types';

export const v = (x: number, y: number): Vec2 => ({ x, y });

export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s });

export const dist = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);

export const len = (a: Vec2): number => Math.hypot(a.x, a.y);

export const norm = (a: Vec2): Vec2 => {
  const l = len(a);
  return l < 1e-9 ? { x: 0, y: 0 } : { x: a.x / l, y: a.y / l };
};

/** 点到线段的最近点与距离 */
export function closestOnSegment(p: Vec2, a: Vec2, b: Vec2): { point: Vec2; t: number; distance: number } {
  const ab = sub(b, a);
  const l2 = ab.x * ab.x + ab.y * ab.y;
  let t = l2 < 1e-9 ? 0 : ((p.x - a.x) * ab.x + (p.y - a.y) * ab.y) / l2;
  t = Math.max(0, Math.min(1, t));
  const point = { x: a.x + ab.x * t, y: a.y + ab.y * t };
  return { point, t, distance: dist(p, point) };
}

/** 点到折线的最近点与距离 */
export function closestOnPolyline(p: Vec2, pts: Vec2[]): { point: Vec2; distance: number; segIndex: number } {
  let best = { point: pts[0], distance: Infinity, segIndex: 0 };
  for (let i = 0; i < pts.length - 1; i++) {
    const r = closestOnSegment(p, pts[i], pts[i + 1]);
    if (r.distance < best.distance) best = { point: r.point, distance: r.distance, segIndex: i };
  }
  return best;
}

/**
 * 折角处用半径 r 的圆弧替代尖角后的路径长度。
 * 相邻两段长度为 l1, l2，夹角（内角）为 theta：
 * 切线距顶点 d = r / tan(theta/2)，弧长 = r * (pi - theta)
 * 若 d 超过任一段长度，按最大可行半径截断。
 */
export function cornerArc(prev: Vec2, corner: Vec2, next: Vec2, radius: number): {
  arcLength: number;
  trim: number;
  p1: Vec2;
  p2: Vec2;
  center: Vec2;
  startAngle: number;
  endAngle: number;
  clockwise: boolean;
  feasibleRadius: number;
} {
  const d1 = dist(corner, prev);
  const d2 = dist(corner, next);
  const u1 = norm(sub(prev, corner)); // 角点指向前一点
  const u2 = norm(sub(next, corner)); // 角点指向下一点
  const dot = Math.max(-1, Math.min(1, u1.x * u2.x + u1.y * u2.y));
  const theta = Math.acos(dot); // 内角 0..pi
  // 退化共线：视为无弧
  if (theta < 1e-4 || Math.abs(theta - Math.PI) < 1e-4) {
    return {
      arcLength: 0, trim: 0, p1: corner, p2: corner, center: corner,
      startAngle: 0, endAngle: 0, clockwise: false, feasibleRadius: 0,
    };
  }
  const half = Math.tan(theta / 2);
  let r = radius;
  let d = r / half;
  const maxD = Math.min(d1, d2) * 0.98;
  if (d > maxD) {
    d = maxD;
    r = d * half;
  }
  const p1 = add(corner, scale(u1, d));
  const p2 = add(corner, scale(u2, d));
  // 圆心：两角边单位向量之和的方向（内角平分线），距角点 r/sin(theta/2)
  const bisector = norm(add(u1, u2));
  const center = add(corner, scale(bisector, r / Math.sin(theta / 2)));
  const startAngle = Math.atan2(p1.y - center.y, p1.x - center.x);
  const endAngle = Math.atan2(p2.y - center.y, p2.x - center.x);
  // 叉积判断绕行方向
  const cross = u1.x * u2.y - u1.y * u2.x;
  const clockwise = cross > 0;
  let sweep = clockwise ? startAngle - endAngle : endAngle - startAngle;
  if (sweep < 0) sweep += Math.PI * 2;
  return {
    arcLength: r * sweep,
    trim: d,
    p1,
    p2,
    center,
    startAngle,
    endAngle,
    clockwise,
    feasibleRadius: r,
  };
}

/** 沿圆弧取点（t: 0..1） */
export function pointOnArc(c: ReturnType<typeof cornerArc>, t: number): Vec2 {
  let a = c.startAngle;
  const b = c.endAngle;
  let sweep = c.clockwise ? a - b : b - a;
  if (sweep < 0) sweep += Math.PI * 2;
  const ang = c.clockwise ? a - sweep * t : a + sweep * t;
  const r = dist(c.center, c.p1);
  return { x: c.center.x + Math.cos(ang) * r, y: c.center.y + Math.sin(ang) * r };
}

/** 把带折弯半径的折线展开为密集采样点（用于渲染与长度核对） */
export function sampleTubePath(points: Vec2[], radii: number[], segPerArc = 10): Vec2[] {
  if (points.length < 2) return points.slice();
  const out: Vec2[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const c = cornerArc(points[i - 1], points[i], points[i + 1], radii[i - 1] ?? 0);
    if (c.feasibleRadius <= 0) {
      out.push(points[i]);
      continue;
    }
    for (let k = 1; k <= segPerArc; k++) out.push(pointOnArc(c, k / segPerArc));
  }
  out.push(points[points.length - 1]);
  return out;
}

/**
 * 带折弯圆弧的折线路径实际长度：
 * 原始折线总长 - 每个折角被裁掉的两段 + 弧长
 */
export function tubePathLength(points: Vec2[], radii: number[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) total += dist(points[i], points[i + 1]);
  for (let i = 1; i < points.length - 1; i++) {
    const c = cornerArc(points[i - 1], points[i], points[i + 1], radii[i - 1] ?? 0);
    if (c.feasibleRadius > 0) total += c.arcLength - 2 * c.trim;
  }
  return total;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function boundsOf(pts: Vec2[]): Bounds {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY };
}

export function mergeBounds(a: Bounds, b: Bounds): Bounds {
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

/** 多边形有符号面积（外环逆时针为正） */
export function polygonArea(ring: Vec2[]): number {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i];
    const q = ring[(i + 1) % ring.length];
    a += p.x * q.y - q.x * p.y;
  }
  return a / 2;
}

/** 射线法点在多边形内 */
export function pointInRing(p: Vec2, ring: Vec2[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a.y > p.y) !== (b.y > p.y) &&
      p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

export function translatePoints(pts: Vec2[], dx: number, dy: number): Vec2[] {
  return pts.map((p) => ({ x: p.x + dx, y: p.y + dy }));
}
