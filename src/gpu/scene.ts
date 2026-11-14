import type { LayoutModel } from '../domain/types';
import type { Camera, Vec3 } from './math';
import { addV, crossV, normV, projectToScreen, scaleV, subV } from './math';

export type ViewMode = 'elevation' | 'top';

export interface SceneGeometry {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  vertexCount: number;
}

const C = {
  ground: [0.29, 0.31, 0.35],
  grid: [0.36, 0.39, 0.44],
  gridMajor: [0.47, 0.51, 0.57],
  building: [0.60, 0.64, 0.70],
  buildingTop: [0.72, 0.76, 0.81],
  buildingRoof: [0.53, 0.57, 0.63],
  window: [0.30, 0.36, 0.44],
  windowLit: [0.52, 0.58, 0.63],
  floorLine: [0.44, 0.47, 0.52],
  riser: [0.78, 0.81, 0.85],
  main: [0.36, 0.72, 0.58],
  box: [0.13, 0.62, 0.72],
  boxFace: [0.86, 0.91, 0.94],
  boxPinned: [0.99, 0.68, 0.18],
  selected: [1.0, 0.85, 0.25],
  selectedRiser: [1.0, 0.42, 0.2],
  redline: [0.9, 0.36, 0.36],
  walkway: [0.41, 0.43, 0.47],
} as const;

class Builder {
  private pos: number[] = [];
  private nrm: number[] = [];
  private col: number[] = [];

  v(p: Vec3, n: Vec3, c: readonly number[]) {
    this.pos.push(p[0], p[1], p[2]);
    this.nrm.push(n[0], n[1], n[2]);
    this.col.push(c[0], c[1], c[2]);
  }

  tri(a: Vec3, b: Vec3, c: Vec3, color: readonly number[]) {
    const n = normV(crossV(subV(b, a), subV(c, a)));
    this.v(a, n, color);
    this.v(b, n, color);
    this.v(c, n, color);
  }

  quad(a: Vec3, b: Vec3, c: Vec3, d: Vec3, color: readonly number[]) {
    this.tri(a, b, c, color);
    this.tri(a, c, d, color);
  }

  box(cx: number, cy: number, cz: number, w: number, h: number, d: number, color: readonly number[], topColor?: readonly number[]) {
    const x0 = cx - w / 2, x1 = cx + w / 2;
    const y0 = cy - h / 2, y1 = cy + h / 2;
    const z0 = cz - d / 2, z1 = cz + d / 2;
    const p = (x: number, y: number, z: number): Vec3 => [x, y, z];
    this.quad(p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1), color);
    this.quad(p(x1, y0, z0), p(x0, y0, z0), p(x0, y1, z0), p(x1, y1, z0), color);
    this.quad(p(x1, y0, z1), p(x1, y0, z0), p(x1, y1, z0), p(x1, y1, z1), color);
    this.quad(p(x0, y0, z0), p(x0, y0, z1), p(x0, y1, z1), p(x0, y1, z0), color);
    this.quad(p(x0, y1, z1), p(x1, y1, z1), p(x1, y1, z0), p(x0, y1, z0), topColor ?? color);
    this.quad(p(x0, y0, z0), p(x1, y0, z0), p(x1, y0, z1), p(x0, y0, z1), color);
  }

  cylinderY(cx: number, cz: number, y0: number, y1: number, radius: number, color: readonly number[], sides = 10) {
    const h = y1 - y0;
    if (h <= 1e-5) return;
    for (let i = 0; i < sides; i++) {
      const a0 = (i / sides) * Math.PI * 2;
      const a1 = ((i + 1) / sides) * Math.PI * 2;
      const o0: Vec3 = [Math.cos(a0) * radius, 0, Math.sin(a0) * radius];
      const o1: Vec3 = [Math.cos(a1) * radius, 0, Math.sin(a1) * radius];
      const A: Vec3 = [cx + o0[0], y0, cz + o0[2]];
      const B: Vec3 = [cx + o1[0], y0, cz + o1[2]];
      const Bt: Vec3 = [cx + o1[0], y1, cz + o1[2]];
      const At: Vec3 = [cx + o0[0], y1, cz + o0[2]];
      this.tri(A, B, Bt, color);
      this.tri(A, Bt, At, color);
      this.tri([cx, y1, cz], Bt, At, color);
      this.tri([cx, y0, cz], A, B, color);
    }
  }

  /** 沿 x 的横管 */
  pipeX(x0: number, x1: number, y: number, z: number, radius: number, color: readonly number[], sides = 8) {
    const a = Math.min(x0, x1);
    const b = Math.max(x0, x1);
    if (b - a < 1e-5) return;
    for (let i = 0; i < sides; i++) {
      const t0 = (i / sides) * Math.PI * 2;
      const t1 = ((i + 1) / sides) * Math.PI * 2;
      const o0: Vec3 = [0, Math.cos(t0) * radius, Math.sin(t0) * radius];
      const o1: Vec3 = [0, Math.cos(t1) * radius, Math.sin(t1) * radius];
      const A: Vec3 = [a, y + o0[1], z + o0[2]];
      const B: Vec3 = [a, y + o1[1], z + o1[2]];
      const Bb: Vec3 = [b, y + o1[1], z + o1[2]];
      const Ab: Vec3 = [b, y + o0[1], z + o0[2]];
      this.tri(A, B, Bb, color);
      this.tri(A, Bb, Ab, color);
    }
  }

  flat(x0: number, x1: number, z0: number, z1: number, y: number, color: readonly number[]) {
    this.quad([x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], color);
  }

  /** 竖直平面上的矩形（沿街立面用） */
  rectZ(x0: number, x1: number, y0: number, y1: number, z: number, color: readonly number[]) {
    this.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], color);
  }

  finish(): SceneGeometry {
    return {
      positions: new Float32Array(this.pos),
      normals: new Float32Array(this.nrm),
      colors: new Float32Array(this.col),
      vertexCount: this.pos.length / 3,
    };
  }
}

export interface PickBox {
  id: string;
  min: Vec3;
  max: Vec3;
  center: Vec3;
  /** 同类实体中优先级，小的先命中 */
  prio: number;
}

export interface ScenePickables {
  boxes: PickBox[];
  segments: PickBox[];
  risers: PickBox[];
}

export interface Selection {
  kind: 'box' | 'segment' | 'riser' | null;
  id: string | null;
}

export function buildScene(model: LayoutModel, mode: ViewMode, sel: Selection): { geometry: SceneGeometry; pickables: ScenePickables } {
  const g = new Builder();
  const pickables: ScenePickables = { boxes: [], segments: [], risers: [] };
  const b = model.bounds;
  const spanX = Math.max(10, b.maxX - b.minX);
  const roadZ = -model.params.rules.roadSetback;
  // 地面要足够大：俯视时画面外的空白全部由地面填充，避免"悬空"
  const padX = mode === 'top' ? Math.max(spanX * 0.75, 30) : Math.max(spanX * 0.08, 3);
  const padZ = mode === 'top' ? Math.max(spanX * 0.55, 26) : Math.max(6, Math.abs(roadZ) + 4);

  // ---- 地面 ----
  const gx0 = b.minX - padX;
  const gx1 = b.maxX + padX;
  const gz0 = Math.min(roadZ - 3, b.minZ - padZ);
  const gz1 = b.maxZ + 4;
  g.flat(gx0, gx1, gz0, gz1, -0.03, C.ground);

  // 人行道（立面到红线之间）
  g.flat(gx0, gx1, roadZ, b.minZ, -0.012, C.walkway);
  // 车行道（红线外侧）
  g.flat(gx0, gx1, gz0, roadZ - 0.06, -0.02, [0.215, 0.232, 0.255]);
  // 道路中心虚线
  for (let x = Math.floor(gx0); x < gx1; x += 3.2) {
    g.flat(x, Math.min(x + 1.7, gx1), (gz0 + roadZ) * 0.5 - 0.06, (gz0 + roadZ) * 0.5 + 0.06, -0.014, [0.42, 0.44, 0.46]);
  }

  // 2m 网格
  const startX = Math.floor(gx0 / 2) * 2;
  for (let x = startX; x <= gx1; x += 2) {
    const major = Math.round(x / 10) * 10 === x;
    const c = major ? C.gridMajor : C.grid;
    const w = major ? 0.03 : 0.014;
    g.flat(x - w, x + w, gz0, gz1, -0.008, c);
  }
  const startZ = Math.floor(gz0 / 2) * 2;
  for (let z = startZ; z <= gz1; z += 2) {
    const major = Math.round(z / 10) * 10 === z;
    const c = major ? C.gridMajor : C.grid;
    const w = major ? 0.03 : 0.014;
    g.flat(gx0, gx1, z - w, z + w, -0.008, c);
  }

  // 路缘石
  g.flat(gx0, gx1, roadZ - 0.22, roadZ - 0.06, 0.02, [0.5, 0.52, 0.55]);

  // 道路红线（虚线）
  for (let x = Math.floor(gx0); x < gx1; x += 1.8) {
    g.flat(x, Math.min(x + 1.0, gx1), roadZ - 0.05, roadZ + 0.05, 0.002, C.redline);
  }

  // ---- 楼栋 ----
  for (const bd of model.buildings) {
    if (mode === 'elevation') {
      g.box(bd.x + bd.width / 2, bd.height / 2, bd.z + bd.depth / 2, bd.width, bd.height, bd.depth, C.building, C.buildingTop);
      // 楼层线（外墙面 z=0 稍前）
      for (let f = 1; f < bd.floors; f++) {
        const y = f * model.params.floorHeight;
        g.rectZ(bd.x, bd.x + bd.width, y - 0.025, y + 0.025, -0.006, C.floorLine);
      }
      // 女儿墙压顶
      g.rectZ(bd.x - 0.04, bd.x + bd.width + 0.04, bd.height - 0.14, bd.height, -0.01, C.buildingTop);
      // 楼栋分隔缝
      g.rectZ(bd.x - 0.05, bd.x + 0.05, 0, bd.height, -0.011, C.floorLine);
      // 窗格：给立面提供尺度参照（避开立管与表箱所在的下半面）
      const winW = Math.min(1.15, Math.max(0.6, bd.width / 14));
      const winGap = Math.max(1.5, bd.width / 9);
      const winH = Math.min(1.45, model.params.floorHeight * 0.5);
      for (let f = 0; f < bd.floors; f++) {
        const baseY = f * model.params.floorHeight + model.params.floorHeight * 0.42;
        for (let wx = bd.x + winGap * 0.5; wx + winW <= bd.x + bd.width - winGap * 0.25; wx += winGap) {
          const lit = (Math.round(wx * 3 + f * 7) % 5) === 0;
          g.rectZ(wx, wx + winW, baseY, baseY + winH, -0.008, lit ? C.windowLit : C.window);
        }
      }
    } else {
      const y = 0.03;
      g.flat(bd.x, bd.x + bd.width, bd.z, bd.z + bd.depth, y, C.buildingRoof);
      const t = 0.12;
      g.flat(bd.x, bd.x + bd.width, bd.z, bd.z + t, y + 0.004, C.floorLine);
      g.flat(bd.x, bd.x + bd.width, bd.z + bd.depth - t, bd.z + bd.depth, y + 0.004, C.floorLine);
      g.flat(bd.x, bd.x + t, bd.z, bd.z + bd.depth, y + 0.004, C.floorLine);
      g.flat(bd.x + bd.width - t, bd.x + bd.width, bd.z, bd.z + bd.depth, y + 0.004, C.floorLine);
      // 楼梯间
      g.flat(bd.x + bd.width * 0.42, bd.x + bd.width * 0.58, bd.z + 0.4, bd.z + 2.0, y + 0.008, C.building);
    }
  }

  // ---- 干管 ----
  if (model.mainRun && model.mainRun.points.length > 1) {
    const pts = model.mainRun.points;
    for (let i = 1; i < pts.length; i++) {
      g.pipeX(pts[i - 1].x, pts[i].x, pts[i].y, pts[i].z, model.mainRun.radius, C.main);
    }
  }

  // ---- 立管 + 分段 ----
  for (const r of model.risers) {
    const segs = model.segments.filter((s) => s.riserId === r.id);
    const riserSelected = sel.kind === 'riser' && sel.id === r.id;
    for (const s of segs) {
      const y0 = s.baseY;
      const y1 = s.baseY + s.length;
      const selected = sel.kind === 'segment' && sel.id === s.id;
      const color = selected ? C.selected : riserSelected ? C.selectedRiser : C.riser;
      const visR = Math.max(r.radius, 0.055) * (selected ? 1.6 : 1);
      g.cylinderY(r.x, r.z, y0, y1, visR, color);
      // 分段接口环
      g.cylinderY(r.x, r.z, y0 - 0.02, y0 + 0.02, Math.max(r.radius, 0.055) * 1.5, C.floorLine, 8);
      pickables.segments.push({
        id: s.id,
        min: [r.x - 0.16, y0, r.z - 0.16],
        max: [r.x + 0.16, y1, r.z + 0.16],
        center: [r.x, (y0 + y1) / 2, r.z],
        prio: selected ? -1 : 1,
      });
    }
    // 顶部通气帽
    g.cylinderY(r.x, r.z, r.height - 0.06, r.height + 0.16, Math.max(r.radius, 0.055) * 1.8, C.riser, 8);
    if (mode === 'top') {
      g.cylinderY(r.x, r.z, 0.04, 0.4, Math.max(r.radius * 3.2, 0.1), riserSelected ? C.selectedRiser : C.riser, 12);
    }
    pickables.risers.push({
      id: r.id,
      min: [r.x - 0.18, 0, r.z - 0.18],
      max: [r.x + 0.18, r.height, r.z + 0.18],
      center: [r.x, r.height / 2, r.z],
      prio: 2,
    });
  }

  // ---- 表箱 ----
  for (const m of model.boxes) {
    const selected = sel.kind === 'box' && sel.id === m.id;
    const color = selected ? C.selected : m.pinned ? C.boxPinned : C.box;
    g.box(m.x, m.y, m.z, m.w, m.h, m.d, color);
    // 箱门面板 + 表窗
    g.rectZ(m.x - m.w * 0.44, m.x + m.w * 0.44, m.y - m.h * 0.46, m.y + m.h * 0.46, m.z - m.d / 2 - 0.006, selected ? C.selected : C.boxFace);
    g.rectZ(m.x - m.w * 0.30, m.x + m.w * 0.30, m.y - m.h * 0.22, m.y + m.h * 0.06, m.z - m.d / 2 - 0.011, m.pinned ? C.boxPinned : C.window);
    g.rectZ(m.x - m.w * 0.34, m.x + m.w * 0.34, m.y - m.h * 0.40, m.y - m.h * 0.34, m.z - m.d / 2 - 0.011, C.floorLine);
    // 箱号贴纸（俯视也能看到的顶面小点）
    if (mode === 'top') {
      g.flat(m.x - m.w * 0.3, m.x + m.w * 0.3, m.z - m.d * 0.3, m.z + m.d * 0.3, m.y + m.h / 2 + 0.01, selected ? C.selected : [0.9, 0.93, 0.96]);
    }
    if (m.pinned) {
      // 手工标记旗：杆 + 旗面
      const top = m.y + m.h / 2;
      g.box(m.x, top + 0.2, m.z - 0.05, 0.028, 0.4, 0.028, C.boxPinned);
      g.rectZ(m.x, m.x + 0.26, top + 0.26, top + 0.4, m.z - 0.05, C.boxPinned);
    }
    pickables.boxes.push({
      id: m.id,
      min: [m.x - m.w / 2, m.y - m.h / 2, m.z - m.d / 2],
      max: [m.x + m.w / 2, m.y + m.h / 2, m.z + m.d / 2],
      center: [m.x, m.y, m.z],
      prio: selected ? -1 : 0,
    });
  }

  return { geometry: g.finish(), pickables };
}

/** 射线 vs AABB，返回进入 t */
export function rayAabb(origin: Vec3, dir: Vec3, min: Vec3, max: Vec3): number | null {
  let tmin = -Infinity;
  let tmax = Infinity;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(dir[i]) < 1e-9) {
      if (origin[i] < min[i] || origin[i] > max[i]) return null;
    } else {
      const inv = 1 / dir[i];
      let t1 = (min[i] - origin[i]) * inv;
      let t2 = (max[i] - origin[i]) * inv;
      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
      }
      if (t1 > tmin) tmin = t1;
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return null;
    }
  }
  if (tmax < 0) return null;
  return tmin >= 0 ? tmin : 0;
}

export function pickAt(
  pickables: ScenePickables,
  origin: Vec3,
  dir: Vec3,
): { kind: 'box' | 'segment' | 'riser'; id: string; point: Vec3 } | null {
  type Cand = { kind: 'box' | 'segment' | 'riser'; id: string; t: number; prio: number };
  const cands: Cand[] = [];
  for (const b of pickables.boxes) {
    const t = rayAabb(origin, dir, b.min, b.max);
    if (t !== null) cands.push({ kind: 'box', id: b.id, t, prio: b.prio });
  }
  for (const s of pickables.segments) {
    const t = rayAabb(origin, dir, s.min, s.max);
    if (t !== null) cands.push({ kind: 'segment', id: s.id, t, prio: s.prio });
  }
  for (const r of pickables.risers) {
    const t = rayAabb(origin, dir, r.min, r.max);
    if (t !== null) cands.push({ kind: 'riser', id: r.id, t, prio: r.prio });
  }
  if (!cands.length) return null;
  cands.sort((a, b) => a.prio - b.prio || a.t - b.t);
  const best = cands[0];
  return { kind: best.kind, id: best.id, point: addV(origin, scaleV(dir, best.t)) };
}

export interface LabelItem {
  text: string;
  x: number;
  y: number;
  kind: 'box' | 'segment' | 'riser' | 'dim' | 'building';
  accent?: boolean;
  align?: 'center' | 'left' | 'right';
}

/** 2D 叠加标注（由 Canvas2D 绘制在 WebGPU 画面之上） */
export function buildLabels(
  cam: Camera,
  model: LayoutModel,
  mode: ViewMode,
  width: number,
  height: number,
  sel: Selection,
  showLabels: boolean,
  dense = true,
): LabelItem[] {
  const out: LabelItem[] = [];
  const push = (world: Vec3, text: string, kind: LabelItem['kind'], offsetY = -10, accent = false) => {
    const s = projectToScreen(cam, world, width, height);
    if (!s) return;
    if (s.x < -160 || s.x > width + 160 || s.y < -40 || s.y > height + 40) return;
    out.push({ text, x: s.x, y: s.y + offsetY, kind, accent });
  };

  if (showLabels) {
    for (const bd of model.buildings) {
      const world: Vec3 = mode === 'elevation'
        ? [bd.x + bd.width / 2, bd.height + 0.9, bd.z]
        : [bd.x + bd.width / 2, 0.06, bd.z + bd.depth * 0.62];
      push(world, `${bd.label}  ${bd.floors}F×${bd.householdsPerFloor}户`, 'building', 0);
    }
    if (mode === 'elevation' && dense) {
      for (const r of model.risers) {
        push([r.x, r.height * 0.5, r.z], `${r.id}`, 'riser', -12);
      }
    }
  }

  if (sel.kind && sel.id) {
    if (sel.kind === 'box') {
      const m = model.boxes.find((x) => x.id === sel.id);
      if (m) push([m.x, m.y + m.h / 2, m.z], `${m.label} · ${m.serves} 户${m.pinned ? ' · 手工' : ''}`, 'box', -16, true);
    } else if (sel.kind === 'segment') {
      const s = model.segments.find((x) => x.id === sel.id);
      const r = s ? model.risers.find((x) => x.id === s.riserId) : null;
      if (s && r) push([r.x, s.baseY + s.length + 0.1, r.z], `段 ${s.index + 1} · ${s.length.toFixed(2)} m${s.pinned ? ' · 手工' : ''}`, 'segment', -14, true);
    } else if (sel.kind === 'riser') {
      const r = model.risers.find((x) => x.id === sel.id);
      if (r) push([r.x, r.height * 0.5 + 1.2, r.z], `${r.id}  H=${r.height.toFixed(2)} m  ${r.floorCount} 段`, 'riser', -14, true);
    }
  }

  return out;
}

/** 立面左侧标高尺 */
export function buildElevationTicks(cam: Camera, model: LayoutModel, width: number, height: number): { y: number; label: string; x: number }[] {
  const out: { y: number; label: string; x: number }[] = [];
  const b = model.buildings[0];
  if (!b) return out;
  const anchorX = model.bounds.minX;
  for (let f = 0; f <= b.floors; f++) {
    const y = f * model.params.floorHeight;
    const s = projectToScreen(cam, [anchorX, y, 0], width, height);
    if (s) out.push({ y: s.y, label: `${y.toFixed(2)}`, x: s.x });
  }
  return out;
}
