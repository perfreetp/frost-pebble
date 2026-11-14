// 几何计算引擎：多边形包含判定、点线距离、高程内插、ID 生成
import type { Polygon, Polyline, XY } from '../types';

let idCounter = 0;

/** 生成稳定唯一 ID（同一会话内） */
export function uid(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

export function dist(a: XY, b: XY): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** 射线法判定点是否在多边形内部（边界算内部） */
export function pointInPolygon(p: XY, polygon: Polygon): boolean {
  const pts = polygon.points;
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x;
    const yi = pts[i].y;
    const xj = pts[j].x;
    const yj = pts[j].y;
    const intersect =
      yi > p.y !== yj > p.y &&
      p.x < ((xj - xi) * (p.y - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  if (inside) return true;
  // 边界判定：点在任意一条边上
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    if (pointToSegmentDistance(p, a, b) < 1e-6) return true;
  }
  return false;
}

/** 点到线段距离 */
export function pointToSegmentDistance(p: XY, a: XY, b: XY): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist(p, a);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: a.x + t * dx, y: a.y + t * dy };
  return dist(p, proj);
}

/** 点到折线的最短距离 */
export function pointToPolylineDistance(p: XY, line: Polyline): number {
  const pts = line.points;
  if (pts.length < 2) return Infinity;
  let min = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    min = Math.min(min, pointToSegmentDistance(p, pts[i], pts[i + 1]));
  }
  return min;
}

/** 点到多边形边界的最短距离 */
export function pointToPolygonEdgeDistance(p: XY, polygon: Polygon): number {
  return pointToPolylineDistance(p, { points: [...polygon.points, polygon.points[0]] });
}

/** 沿给定角度方向、从起点前进 distance 米得到的点 */
export function pointAlong(origin: XY, angle: number, distance: number): XY {
  return {
    x: origin.x + Math.cos(angle) * distance,
    y: origin.y + Math.sin(angle) * distance,
  };
}

/**
 * 由等高线估算点高程：取距离最近的等高线高程，
 * 并按到相邻两条等高线的距离做线性内插（简化数字高程模型）。
 */
export function interpolateElevation(
  p: XY,
  contours: { elevation: number; polyline: Polyline }[],
  fallback = 0,
): number {
  if (contours.length === 0) return fallback;
  const measured = contours.map((c) => ({
    elevation: c.elevation,
    d: pointToPolylineDistance(p, c.polyline),
  }));
  measured.sort((a, b) => a.d - b.d);
  const nearest = measured[0];
  if (contours.length === 1 || nearest.d < 1e-6) return nearest.elevation;
  const second = measured[1];
  const total = nearest.d + second.d;
  if (total === 0) return nearest.elevation;
  // 距离越近权重越大
  const w1 = second.d / total;
  const w2 = nearest.d / total;
  return nearest.elevation * w1 + second.elevation * w2;
}

/** 数字范围工具 */
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function formatNum(v: number, digits = 2): string {
  return v.toFixed(digits);
}
