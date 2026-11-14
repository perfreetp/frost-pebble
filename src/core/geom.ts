/**
 * 纯几何构建工具（不依赖 three.js），同时供浏览器与 Node（报告/测试）使用。
 * 坐标约定：x = 里程方向（桩号增大方向），y = 竖直向上，z = 横向（前进方向左侧为负）。
 */
import type { Vec3 } from './types';
import { DEG } from './math';

export interface MeshData {
  positions: Float32Array;
  indices: Uint32Array;
}

export class MeshBuilder {
  positions: number[] = [];
  indices: number[] = [];
  private vcount = 0;

  get vertexCount() {
    return this.vcount;
  }
  get triangleCount() {
    return this.indices.length / 3;
  }

  vertex(p: Vec3): number {
    this.positions.push(p[0], p[1], p[2]);
    return this.vcount++;
  }

  tri(a: Vec3, b: Vec3, c: Vec3): void {
    const i = this.vcount;
    this.vertex(a);
    this.vertex(b);
    this.vertex(c);
    this.indices.push(i, i + 1, i + 2);
  }

  quad(a: Vec3, b: Vec3, c: Vec3, d: Vec3): void {
    const i = this.vcount;
    this.vertex(a);
    this.vertex(b);
    this.vertex(c);
    this.vertex(d);
    this.indices.push(i, i + 1, i + 2, i, i + 2, i + 3);
  }

  /** 轴对齐长方体（y0 底面，y1 顶面） */
  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): void {
    // 6 faces, outward winding
    // -y
    this.quad([x0, y0, z0], [x0, y0, z1], [x1, y0, z1], [x1, y0, z0]);
    // +y
    this.quad([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]);
    // -x
    this.quad([x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]);
    // +x
    this.quad([x0, y0, z1], [x0, y1, z1], [x1, y1, z1], [x1, y0, z1]);
    // -z
    this.quad([x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]);
    // +z
    this.quad([x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]);
  }

  /** 沿 X 拉伸的棱柱：profile 为 (z,y) 平面内逆时针多边形，hole 可选内孔 */
  extrudeX(
    profile: [number, number][],
    hole: [number, number][] | null,
    x0: number,
    x1: number,
    opts: { segments?: number; capped?: boolean } = {},
  ): void {
    const seg = Math.max(1, Math.round(opts.segments ?? 1));
    const ring = profile.map(([z, y]) => [z, y] as [number, number]);
    const holeRing = hole ? hole.map(([z, y]) => [z, y] as [number, number]) : null;

    // 外表面
    for (let s = 0; s < seg; s++) {
      const xa = x0 + ((x1 - x0) * s) / seg;
      const xb = x0 + ((x1 - x0) * (s + 1)) / seg;
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i];
        const b = ring[(i + 1) % ring.length];
        // 外法向：逆时针 zy 平面 → 面朝外
        this.quad([xa, a[1], a[0]], [xa, b[1], b[0]], [xb, b[1], b[0]], [xb, a[1], a[0]]);
      }
      if (holeRing) {
        for (let i = 0; i < holeRing.length; i++) {
          const a = holeRing[i];
          const b = holeRing[(i + 1) % holeRing.length];
          this.quad([xa, a[1], a[0]], [xb, a[1], a[0]], [xb, b[1], b[0]], [xa, b[1], b[0]]);
        }
      }
    }

    if (opts.capped === false) return;
    // 端面封口（带孔时用简单环带三角化：外环→内环配对）
    for (const [x, dir] of [
      [x0, -1],
      [x1, 1],
    ] as [number, number][]) {
      if (holeRing && holeRing.length === ring.length) {
        for (let i = 0; i < ring.length; i++) {
          const a = ring[i];
          const b = ring[(i + 1) % ring.length];
          const ha = holeRing[i];
          const hb = holeRing[(i + 1) % holeRing.length];
          if (dir < 0) {
            this.tri([x, a[1], a[0]], [x, hb[1], hb[0]], [x, b[1], b[0]]);
            this.tri([x, a[1], a[0]], [x, ha[1], ha[0]], [x, hb[1], hb[0]]);
          } else {
            this.tri([x, a[1], a[0]], [x, b[1], b[0]], [x, hb[1], hb[0]]);
            this.tri([x, a[1], a[0]], [x, hb[1], hb[0]], [x, ha[1], ha[0]]);
          }
        }
      } else {
        const verts: Vec3[] = ring.map(([z, y]) => [x, y, z] as Vec3);
        for (let i = 1; i + 1 < verts.length; i++) {
          if (dir < 0) this.tri(verts[0], verts[i + 1], verts[i]);
          else this.tri(verts[0], verts[i], verts[i + 1]);
        }
      }
    }
  }

  /** 竖直圆柱 */
  cylinder(
    cx: number,
    y0: number,
    cz: number,
    radius: number,
    height: number,
    radialSegments = 24,
    capTop = true,
    capBottom = true,
  ): void {
    const y1 = y0 + height;
    for (let i = 0; i < radialSegments; i++) {
      const a0 = (i / radialSegments) * Math.PI * 2;
      const a1 = ((i + 1) / radialSegments) * Math.PI * 2;
      const p0: Vec3 = [cx + Math.cos(a0) * radius, y0, cz + Math.sin(a0) * radius];
      const p1: Vec3 = [cx + Math.cos(a1) * radius, y0, cz + Math.sin(a1) * radius];
      this.quad(p0, [p0[0], y1, p0[2]], [p1[0], y1, p1[2]], p1);
      if (capTop) this.tri([cx, y1, cz], [p0[0], y1, p0[2]], [p1[0], y1, p1[2]]);
      if (capBottom) this.tri([cx, y0, cz], [p1[0], y0, p1[2]], [p0[0], y0, p0[2]]);
    }
  }

  /** 水平圆盘 / 圆环 */
  ringDisc(cx: number, y: number, cz: number, rInner: number, rOuter: number, segments = 24): void {
    for (let i = 0; i < segments; i++) {
      const a0 = (i / segments) * Math.PI * 2;
      const a1 = ((i + 1) / segments) * Math.PI * 2;
      const o0: Vec3 = [cx + Math.cos(a0) * rOuter, y, cz + Math.sin(a0) * rOuter];
      const o1: Vec3 = [cx + Math.cos(a1) * rOuter, y, cz + Math.sin(a1) * rOuter];
      if (rInner <= 1e-6) {
        this.tri([cx, y, cz], o0, o1);
      } else {
        const i0: Vec3 = [cx + Math.cos(a0) * rInner, y, cz + Math.sin(a0) * rInner];
        const i1: Vec3 = [cx + Math.cos(a1) * rInner, y, cz + Math.sin(a1) * rInner];
        this.quad(i0, o0, o1, i1);
      }
    }
  }

  /** 以轴对齐长方体为基础，绕 Y 轴旋转后平移（用于带角度的支座等） */
  orientedBox(center: Vec3, size: Vec3, yaw: number): void {
    const hx = size[0] / 2;
    const hy = size[1] / 2;
    const hz = size[2] / 2;
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);
    const tf = (p: Vec3): Vec3 => [
      center[0] + p[0] * c + p[2] * s,
      center[1] + p[1],
      center[2] - p[0] * s + p[2] * c,
    ];
    const x0 = -hx;
    const x1 = hx;
    const z0 = -hz;
    const z1 = hz;
    const y0 = -hy;
    const y1 = hy;
    this.quad(tf([x0, y0, z0]), tf([x0, y0, z1]), tf([x1, y0, z1]), tf([x1, y0, z0]));
    this.quad(tf([x0, y1, z0]), tf([x1, y1, z0]), tf([x1, y1, z1]), tf([x0, y1, z1]));
    this.quad(tf([x0, y0, z0]), tf([x1, y0, z0]), tf([x1, y1, z0]), tf([x0, y1, z0]));
    this.quad(tf([x0, y0, z1]), tf([x0, y1, z1]), tf([x1, y1, z1]), tf([x1, y0, z1]));
    this.quad(tf([x0, y0, z0]), tf([x0, y1, z0]), tf([x0, y1, z1]), tf([x0, y0, z1]));
    this.quad(tf([x1, y0, z0]), tf([x1, y0, z1]), tf([x1, y1, z1]), tf([x1, y1, z0]));
  }

  build(): MeshData {
    return {
      positions: new Float32Array(this.positions),
      indices: new Uint32Array(this.indices),
    };
  }
}

/** 合并多个 mesh */
export function mergeMeshes(meshes: MeshData[]): MeshData {
  let np = 0;
  let ni = 0;
  for (const m of meshes) {
    np += m.positions.length;
    ni += m.indices.length;
  }
  const positions = new Float32Array(np);
  const indices = new Uint32Array(ni);
  let po = 0;
  let io = 0;
  let base = 0;
  for (const m of meshes) {
    positions.set(m.positions, po);
    po += m.positions.length;
    for (let i = 0; i < m.indices.length; i++) indices[io + i] = m.indices[i] + base;
    io += m.indices.length;
    base += m.positions.length / 3;
  }
  return { positions, indices };
}

/** 三角形面积 */
export function triArea(a: Vec3, b: Vec3, c: Vec3): number {
  const ux = b[0] - a[0];
  const uy = b[1] - a[1];
  const uz = b[2] - a[2];
  const vx = c[0] - a[0];
  const vy = c[1] - a[1];
  const vz = c[2] - a[2];
  const cx = uy * vz - uz * vy;
  const cy = uz * vx - ux * vz;
  const cz = ux * vy - uy * vx;
  return 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);
}

/** 点是否在三角形内（含边），用于粗筛选 */
export function pointInTriangle2D(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): boolean {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

export const deg = (r: number) => r / DEG;
