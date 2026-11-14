import type { Vec3 } from '../types';

export const v = (x: number, y: number, z = 0): Vec3 => ({ x, y, z });
export const add = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
export const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
export const scale = (a: Vec3, s: number): Vec3 => ({ x: a.x * s, y: a.y * s, z: a.z * s });
export const len = (a: Vec3): number => Math.hypot(a.x, a.y, a.z);
export const dist = (a: Vec3, b: Vec3): number => len(sub(a, b));
export const mirrorX = (a: Vec3): Vec3 => ({ x: -a.x, y: a.y, z: a.z });
export const round = (n: number, d = 3): number => Math.round(n * 10 ** d) / 10 ** d;
export const mm = (m: number): number => Math.round(m * 10000) / 10; // 米 → 毫米(保留1位)

export function midpoint(a: Vec3, b: Vec3): Vec3 {
  return v((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
}

/** 点 p 到线段 ab 的距离(三维) */
export function pointSegDist(p: Vec3, a: Vec3, b: Vec3): number {
  const ab = sub(b, a);
  const ap = sub(p, a);
  const t = Math.min(1, Math.max(0, (ap.x * ab.x + ap.y * ab.y + ap.z * ab.z) / (len(ab) ** 2 || 1)));
  const proj = add(a, scale(ab, t));
  return dist(p, proj);
}

/** 线段 a-b 与 c-d 是否相交(仅 xy 平面) */
export function segIntersectXY(a: Vec3, b: Vec3, c: Vec3, d: Vec3): boolean {
  const d1 = cross2(sub(c, a), sub(b, a));
  const d2 = cross2(sub(d, a), sub(b, a));
  const d3 = cross2(sub(a, c), sub(d, c));
  const d4 = cross2(sub(b, c), sub(d, c));
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
         ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function cross2(a: Vec3, b: Vec3): number {
  return a.x * b.y - a.y * b.x;
}

/** 多边形面积(xy),顺时针为负 */
export function polyArea(poly: Vec3[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    s += p.x * q.y - q.x * p.y;
  }
  return s / 2;
}

/** 射线 x=给定值(竖向)与多边形交点的 y 集合 */
export function verticalCrossings(poly: Vec3[], x: number): number[] {
  const ys: number[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    if ((a.x <= x && b.x > x) || (b.x <= x && a.x > x)) {
      const t = (x - a.x) / (b.x - a.x);
      ys.push(a.y + t * (b.y - a.y));
    }
  }
  return ys.sort((p, q) => p - q);
}

/** 射线 y=给定值(横向)与多边形交点的 x 集合 */
export function horizontalCrossings(poly: Vec3[], y: number): number[] {
  const xs: number[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
      const t = (y - a.y) / (b.x - a.x);
      xs.push(a.x + t * (b.x - a.x));
    }
  }
  return xs.sort((p, q) => p - q);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function fmtDate(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
