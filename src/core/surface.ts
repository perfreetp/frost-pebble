/**
 * 曲面采样（把屏幕上的点吸附到真实构件表面）。
 *
 * 运行时由 three-mesh-bvh 提供加速的采样器；本文件同时提供纯 TS 实现，
 * 供单元测试和报告生成（无 WebGL 环境）复用。
 */
import type { Vec3 } from './types';
import { add, cross, dist, dot, len, lerp3, norm, scale, sub, yawOf } from './math';
import type { MeshData } from './geom';
import { triArea } from './geom';

export interface SurfaceHit {
  point: Vec3;
  normal: Vec3;
  /** 命中三角形索引（全局，相对采样器内部网格） */
  triangle: number;
  distance: number;
}

export interface SurfaceSampler {
  hit(p: Vec3, maxDistance?: number): SurfaceHit | null;
  /** 采样器覆盖的三角形数 */
  triangleCount: number;
}

interface Tri {
  a: Vec3;
  b: Vec3;
  c: Vec3;
  n: Vec3;
  centroid: Vec3;
  radius: number;
}

function makeTri(a: Vec3, b: Vec3, c: Vec3): Tri {
  const n = norm(cross(sub(b, a), sub(c, a)));
  const centroid: Vec3 = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
  const radius = Math.max(dist(a, centroid), dist(b, centroid), dist(c, centroid));
  return { a, b, c, n, centroid, radius };
}

function closestOnTri(p: Vec3, t: Tri): Vec3 {
  const ab = sub(t.b, t.a);
  const ac = sub(t.c, t.a);
  const ap = sub(p, t.a);
  const d1 = dot(ab, ap);
  const d2 = dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) return t.a;
  const bp = sub(p, t.b);
  const d3 = dot(ab, bp);
  const d4 = dot(ac, bp);
  if (d3 >= 0 && d4 <= d3) return t.b;
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3);
    return lerp3(t.a, t.b, v);
  }
  const cp = sub(p, t.c);
  const d5 = dot(ab, cp);
  const d6 = dot(ac, cp);
  if (d6 >= 0 && d5 <= d6) return t.c;
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6);
    return lerp3(t.a, t.c, w);
  }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    const w = (d4 - d3) / (d4 - d3 + (d5 - d6));
    return lerp3(t.b, t.c, w);
  }
  const denom = 1 / (va + vb + vc);
  const v = vb * denom;
  const w = vc * denom;
  return add(t.a, add(scale(ab, v), scale(ac, w)));
}

/** 纯 TS 网格采样器（线性扫描，测试与小网格够用） */
export class MeshSurfaceSampler implements SurfaceSampler {
  tris: Tri[];
  triangleCount: number;

  constructor(mesh: MeshData) {
    const pos = mesh.positions;
    const idx = mesh.indices;
    this.tris = [];
    for (let i = 0; i < idx.length; i += 3) {
      const ia = idx[i] * 3;
      const ib = idx[i + 1] * 3;
      const ic = idx[i + 2] * 3;
      this.tris.push(
        makeTri(
          [pos[ia], pos[ia + 1], pos[ia + 2]],
          [pos[ib], pos[ib + 1], pos[ib + 2]],
          [pos[ic], pos[ic + 1], pos[ic + 2]],
        ),
      );
    }
    this.triangleCount = this.tris.length;
  }

  hit(p: Vec3, maxDistance = Infinity): SurfaceHit | null {
    let best: SurfaceHit | null = null;
    let bestSq = maxDistance * maxDistance;
    for (let i = 0; i < this.tris.length; i++) {
      const t = this.tris[i];
      const q = closestOnTri(p, t);
      const dsq = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2;
      if (dsq <= bestSq) {
        bestSq = dsq;
        best = { point: q, normal: t.n, triangle: i, distance: Math.sqrt(dsq) };
      }
    }
    return best;
  }

  /** 网格三角形总数、面积，用于报告统计 */
  area(): number {
    return this.tris.reduce((s, t) => s + triArea(t.a, t.b, t.c), 0);
  }
}

export type Projector = (p: Vec3) => SurfaceHit | null;

/**
 * 贴合曲面展开：在 A→B 之间沿弦线插入采样点，每次迭代把偏离超过容差的点吸附回曲面，
 * 直至折线贴合表面。返回曲面上的折线（世界坐标）。
 */
export function traceOnSurface(
  a: Vec3,
  b: Vec3,
  project: Projector,
  opts: { maxDepth?: number; tolerance?: number; snapDistance?: number; maxSegment?: number } = {},
): Vec3[] {
  const maxDepth = opts.maxDepth ?? 7;
  const tol = opts.tolerance ?? 0.004;
  const snapDist = opts.snapDistance ?? 0.6;
  // 长线段即使曲率偏离为 0 也要打断，保证展开时能跟随箱梁腹板/底板的多面转折
  const maxSeg = opts.maxSegment ?? 0.5;

  const hitA = project(a);
  const hitB = project(b);
  const start = hitA ? hitA.point : a;
  const end = hitB ? hitB.point : b;

  const snap = (p: Vec3): Vec3 => {
    const h = project(p);
    if (!h || h.distance > snapDist) return p;
    return h.point;
  };

  const out: Vec3[] = [start, end];
  for (let depth = 0; depth < maxDepth; depth++) {
    if (out.length > 512) break;
    const next: Vec3[] = [out[0]];
    let changed = false;
    for (let i = 1; i < out.length; i++) {
      const p0 = out[i - 1];
      const p1 = out[i];
      const segLen = dist(p0, p1);
      const mid = lerp3(p0, p1, 0.5);
      const snapped = snap(mid);
      const off = dist(snapped, mid);
      if (off > tol || segLen > maxSeg) {
        next.push(snapped);
        changed = true;
      }
      next.push(p1);
    }
    out.length = 0;
    out.push(...next);
    if (!changed) break;
  }
  // 去掉过近的重复点
  const dedup: Vec3[] = [out[0]];
  for (let i = 1; i < out.length; i++) {
    if (dist(out[i], dedup[dedup.length - 1]) > 1e-6) dedup.push(out[i]);
  }
  return dedup.length >= 2 ? dedup : out;
}

/** 折线在曲面上的展开长度 */
export function unfoldedLength(path: Vec3[]): number {
  let s = 0;
  for (let i = 1; i < path.length; i++) s += dist(path[i - 1], path[i]);
  return s;
}

/**
 * 沿曲面展开折线（离散可展近似）。
 *
 * 每一段：把上一段的切向按两相邻法向之间的二面角做平行输运到当前切平面，
 * 再与当前段方向求带符号夹角（即测地曲率 × 弧长），累加得到平面内转角。
 * 这样展开后弧长严格保持，走向与真实贴合曲线一致。
 */
export function unfoldPolyline(
  path: Vec3[],
  normals: Vec3[],
): { points2d: { x: number; y: number }[]; length: number; firstTangent: Vec3; turnDeg: number } {
  const out = [{ x: 0, y: 0 }];
  if (path.length < 2) return { points2d: out, length: 0, firstTangent: [1, 0, 0] as Vec3, turnDeg: 0 };

  const nn = (i: number): Vec3 => norm(normals[Math.min(i, normals.length - 1)] ?? [0, 1, 0]);
  const segDir = (i: number): Vec3 => norm(sub(path[i + 1], path[i]));

  // 平面内初始朝向 = 0；首段方向作为参考
  let heading = 0;
  let totalTurn = 0;
  const firstTangent = segDir(0);

  for (let i = 1; i < path.length - 1; i++) {
    const prev = segDir(i - 1);
    const cur = segDir(i);
    const nPrev = nn(i - 1);
    const nCur = nn(i);
    // 平行输运：绕 cross(nPrev,nCur) 旋转二面角
    const axisRaw = cross(nPrev, nCur);
    const axisLen = len(axisRaw);
    let transported = prev;
    if (axisLen > 1e-9) {
      const axis = scale(axisRaw, 1 / axisLen);
      const ang = Math.atan2(axisLen, dot(nPrev, nCur));
      transported = rotateAboutAxis(prev, axis, ang);
    }
    const delta = signedAngleOnPlane(transported, cur, nCur);
    if (Number.isFinite(delta)) {
      heading += delta;
      totalTurn += delta;
    }
    const segLen = dist(path[i], path[i + 1]);
    const last = out[out.length - 1];
    out.push({ x: last.x + segLen * Math.cos(heading), y: last.y + segLen * Math.sin(heading) });
  }
  if (out.length === 1) {
    const segLen = dist(path[0], path[1]);
    out.push({ x: segLen, y: 0 });
  }

  return { points2d: out, length: pathLength(path), firstTangent, turnDeg: (totalTurn * 180) / Math.PI };
}

function pathLength(path: Vec3[]): number {
  let s = 0;
  for (let i = 1; i < path.length; i++) s += dist(path[i - 1], path[i]);
  return s;
}

/** 3D 折线的水平走向角（度），相对里程方向，逆时针（指向左侧）为正 */
export function horizontalAzimuthDeg(dir: Vec3): number {
  const horiz: Vec3 = [dir[0], 0, dir[2]];
  const hz: Vec3 = len(horiz) > 1e-9 ? norm(horiz) : [1, 0, 0];
  return (yawOf(hz) * 180) / Math.PI;
}

export function signedAngleOnPlane(a: Vec3, b: Vec3, n: Vec3): number {
  const an = norm(sub(a, scale(n, dot(a, n))));
  const bn = norm(sub(b, scale(n, dot(b, n))));
  const c = cross(an, bn);
  const s = dot(c, n);
  const dotv = dot(an, bn);
  return Math.atan2(s, dotv);
}

export function rotateAboutAxis(v: Vec3, axis: Vec3, ang: number): Vec3 {
  const k = norm(axis);
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const kv = dot(k, v);
  const cr = cross(k, v);
  return add(add(scale(v, c), scale(cr, s)), scale(k, kv * (1 - c)));
}
