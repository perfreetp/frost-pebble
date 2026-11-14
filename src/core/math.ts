import type { Vec3 } from './types';

export const DEG = Math.PI / 180;

export function fmt(n: number, digits = 1): string {
  return n.toFixed(digits);
}

/** 将绝对里程（米）格式化为 K1+250.0 形式 */
export function formatChainage(metres: number, digits = 1): string {
  const sign = metres < 0 ? '-' : '';
  const abs = Math.abs(metres);
  const km = Math.floor(abs / 1000);
  const rest = abs - km * 1000;
  return `${sign}K${km}+${rest.toFixed(digits).padStart(digits > 0 ? digits + 4 : 3, '0')}`;
}

/** 相对里程（米）→ 桩号标签 */
export function formatStationOffset(m: number): string {
  const sign = m < 0 ? '-' : '+';
  return `${sign}${Math.abs(m).toFixed(2)}`;
}

export const v3 = (x = 0, y = 0, z = 0): Vec3 => [x, y, z];
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const len = (a: Vec3): number => Math.sqrt(dot(a, a));
export function norm(a: Vec3): Vec3 {
  const l = len(a);
  return l > 1e-12 ? scale(a, 1 / l) : [0, 0, 0];
}
export const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
export const dist = (a: Vec3, b: Vec3): number => len(sub(a, b));

/** 折线长度，单位与输入一致 */
export function polylineLength(pts: readonly Vec3[]): number {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += dist(pts[i - 1], pts[i]);
  return s;
}

/** 与 X 轴（里程方向）在水平面内的夹角，逆时针为正（从 +X 转向 +Z） */
export function yawOf(dir: Vec3): number {
  return Math.atan2(dir[2], dir[0]);
}

export function wrapPi(a: number): number {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

/** 在 XY 平面内绕原点旋转 */
export function rot2(p: [number, number], ang: number): [number, number] {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
}

export function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

export function clamp01(x: number): number {
  return clamp(x, 0, 1);
}

export function median(xs: number[]): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** 点到直线的投影参数 t（允许超出 [0,1]） */
export function projectParam(p: Vec3, a: Vec3, b: Vec3): number {
  const ab = sub(b, a);
  const d = dot(ab, ab);
  if (d < 1e-12) return 0;
  return dot(sub(p, a), ab) / d;
}

/** 点到线段距离 */
export function distToSegment(p: Vec3, a: Vec3, b: Vec3): number {
  const t = clamp01(projectParam(p, a, b));
  return dist(p, lerp3(a, b, t));
}

export function bboxOf(points: readonly Vec3[]): { min: Vec3; max: Vec3 } {
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const p of points) {
    for (let i = 0; i < 3; i++) {
      if (p[i] < min[i]) min[i] = p[i];
      if (p[i] > max[i]) max[i] = p[i];
    }
  }
  return { min, max };
}

export function padBBox(min: Vec3, max: Vec3, pad: number): { min: Vec3; max: Vec3 } {
  return {
    min: [min[0] - pad, min[1] - pad, min[2] - pad],
    max: [max[0] + pad, max[1] + pad, max[2] + pad],
  };
}

export function bboxIntersects(
  aMin: Vec3,
  aMax: Vec3,
  bMin: Vec3,
  bMax: Vec3,
): boolean {
  return (
    aMin[0] <= bMax[0] &&
    aMax[0] >= bMin[0] &&
    aMin[1] <= bMax[1] &&
    aMax[1] >= bMin[1] &&
    aMin[2] <= bMax[2] &&
    aMax[2] >= bMin[2]
  );
}

export function bboxContains(min: Vec3, max: Vec3, p: Vec3, eps = 0): boolean {
  return (
    p[0] >= min[0] - eps &&
    p[0] <= max[0] + eps &&
    p[1] >= min[1] - eps &&
    p[1] <= max[1] + eps &&
    p[2] >= min[2] - eps &&
    p[2] <= max[2] + eps
  );
}

export function roundTo(x: number, digits: number): number {
  const f = Math.pow(10, digits);
  return Math.round(x * f) / f;
}

/** 二分查找：有序数组中 <= x 的最大下标，-1 表示都比 x 大 */
export function lowerBoundIndex(arr: readonly number[], x: number): number {
  let lo = 0;
  let hi = arr.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= x) {
      ans = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return ans;
}
