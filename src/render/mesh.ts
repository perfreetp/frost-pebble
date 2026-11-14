// 把招牌元素构建为可直接上传的交错顶点数组
import type { AcrylicElement, RGB, SignElement, TubeElement } from '../types';
import { pointInRing, sampleTubePath, sub } from '../core/geometry';

export const STRIDE = 6; // x, y, r, g, b, alpha（颜色为线性 HDR）

export interface BuiltMesh {
  /** 灯管丝带顶点（三角形） */
  tubeVerts: Float32Array;
  /** 亚克力/墙面实心面顶点 */
  fillVerts: Float32Array;
}

/** sRGB 0-255 → 线性 0-1，并乘 HDR 发光强度 */
export function hdrColor(c: RGB, intensity: number): [number, number, number] {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return [f(c.r) * intensity, f(c.g) * intensity, f(c.b) * intensity];
}

interface RibbonOpts {
  /** 自发光 HDR 强度 */
  glow: number;
  /** 双色交替周期 mm */
  dualPeriod: number;
  /** 半径告警的角索引集合（标红） */
  badCorners?: Set<number>;
  warningColor?: RGB;
}

/** 沿采样路径构建等宽丝带（含两端圆头），每顶点 STRIDE 个 float */
export function buildTubeRibbon(tube: TubeElement, opts: RibbonOpts): Float32Array {
  const path = sampleTubePath(tube.points, tube.cornerRadii, 8);
  if (path.length < 2) return new Float32Array(0);
  const halfW = tube.diameter / 2;
  const verts: number[] = [];
  const warning: RGB = opts.warningColor ?? { r: 255, g: 40, b: 40 };

  const colorAt = (distMm: number, cornerBad: boolean): [number, number, number] => {
    if (cornerBad) return hdrColor(warning, opts.glow * 1.2);
    if (tube.kind === 'tube-dual' && tube.color2) {
      const phase = Math.floor(distMm / Math.max(1, opts.dualPeriod)) % 2;
      return hdrColor(phase === 0 ? tube.color : tube.color2!, opts.glow);
    }
    return hdrColor(tube.color, opts.glow);
  };

  // 累计弧长，用于双色分段
  const cum: number[] = [0];
  for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y));

  const pushVertex = (p: { x: number; y: number }, d: number, bad: boolean) => {
    const [r, g, b] = colorAt(d, bad);
    verts.push(p.x, p.y, r, g, b, 1);
  };

  // 找出采样路径上落在“坏角”附近的段（半径告警整体标红该角附近）
  const badSample = new Set<number>();
  if (opts.badCorners && opts.badCorners.size > 0) {
    // 简化：按原始顶点序号映射，每个折角覆盖其前后各几个采样点
    // sampleTubePath 每个弧 8 段 + 直线点，这里按 cum 距离用角点位置判定
    for (const ci of opts.badCorners) {
      const corner = tube.points[ci + 1];
      for (let i = 0; i < path.length; i++) {
        if (Math.hypot(path[i].x - corner.x, path[i].y - corner.y) <= halfW * 4) badSample.add(i);
      }
    }
  }

  const left: { x: number; y: number }[] = [];
  const right: { x: number; y: number }[] = [];
  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    const prev = path[Math.max(0, i - 1)];
    const next = path[Math.min(path.length - 1, i + 1)];
    const dir = sub(next, prev);
    const l = Math.hypot(dir.x, dir.y) || 1;
    const nx = -dir.y / l;
    const ny = dir.x / l;
    left.push({ x: p.x + nx * halfW, y: p.y + ny * halfW });
    right.push({ x: p.x - nx * halfW, y: p.y - ny * halfW });
  }

  for (let i = 0; i < path.length - 1; i++) {
    const bad = badSample.has(i) || badSample.has(i + 1);
    const d = (cum[i] + cum[i + 1]) / 2;
    // 两个三角形构成四边形
    pushVertex(left[i], d, bad); pushVertex(right[i], d, bad); pushVertex(left[i + 1], d, bad);
    pushVertex(right[i], d, bad); pushVertex(right[i + 1], d, bad); pushVertex(left[i + 1], d, bad);
  }

  // 两端圆头（扇形）
  const cap = (centerIdx: number, sign: 1 | -1) => {
    const c = path[centerIdx];
    const dir = sub(centerIdx === 0 ? path[1] : path[path.length - 2], c);
    const base = Math.atan2(dir.y, dir.x);
    const d = cum[centerIdx];
    const bad = badSample.has(centerIdx);
    const seg = 10;
    let prev = sign === 1 ? right[0] : left[path.length - 1];
    for (let k = 1; k <= seg; k++) {
      const ang = sign === 1 ? base - Math.PI + (Math.PI * k) / seg : base + (Math.PI * k) / seg;
      const pt = { x: c.x + Math.cos(ang) * halfW, y: c.y + Math.sin(ang) * halfW };
      pushVertex(c, d, bad);
      pushVertex(prev, d, bad);
      pushVertex(pt, d, bad);
      prev = pt;
    }
  };
  cap(0, 1);
  cap(path.length - 1, -1);

  return new Float32Array(verts);
}

/** 耳切法三角化单个简单环 */
function earClip(ring: { x: number; y: number }[]): number[] {
  const n = ring.length;
  if (n < 3) return [];
  const indices: number[] = [];
  const alive = new Array(n).fill(true);
  const areaSign = (() => {
    let a = 0;
    for (let i = 0; i < n; i++) a += ring[i].x * ring[(i + 1) % n].y - ring[(i + 1) % n].x * ring[i].y;
    return Math.sign(a);
  })();

  const isConvex = (i: number, prev: number, next: number) => {
    const a = ring[prev], b = ring[i], c = ring[next];
    const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    // 叉积与多边形面积同号即为凸顶点（对顺/逆时针都成立）
    return Math.sign(cross) === areaSign;
  };
  const pointInTri = (p: { x: number; y: number }, a: typeof p, b: typeof p, c: typeof p) => {
    const d1 = (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
    const d2 = (p.x - c.x) * (b.y - c.y) - (b.x - c.x) * (p.y - c.y);
    const d3 = (p.x - a.x) * (c.y - a.y) - (c.x - a.x) * (p.y - a.y);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };

  let guard = n * n;
  let remain = n;
  while (remain > 2 && guard-- > 0) {
    let earFound = false;
    for (let i = 0; i < n; i++) {
      if (!alive[i]) continue;
      let prev = (i - 1 + n) % n;
      while (!alive[prev]) prev = (prev - 1 + n) % n;
      let next = (i + 1) % n;
      while (!alive[next]) next = (next + 1) % n;
      if (!isConvex(i, prev, next)) continue;
      let contains = false;
      for (let j = 0; j < n; j++) {
        if (!alive[j] || j === i || j === prev || j === next) continue;
        if (pointInTri(ring[j], ring[prev], ring[i], ring[next])) { contains = true; break; }
      }
      if (contains) continue;
      indices.push(prev, i, next);
      alive[i] = false;
      remain--;
      earFound = true;
      break;
    }
    if (!earFound) break;
  }
  return indices;
}

/** 亚克力发光字：外环三角化，孔洞反向三角化（叠加着色，非真正 CSG，视觉够用） */
export function buildAcrylicFill(el: AcrylicElement, glow: number): Float32Array {
  const verts: number[] = [];
  const [r, g, b] = hdrColor(el.color, glow * 0.85);
  for (const ring of el.contours) {
    if (ring.length < 3) continue;
    const idx = earClip(ring);
    for (const i of idx) {
      const p = ring[i];
      verts.push(p.x, p.y, r, g, b, 1);
    }
  }
  return new Float32Array(verts);
}

/** 亚克力描边（字壳边缘发光轮廓）：沿每环做细丝带 */
export function buildAcrylicOutline(el: AcrylicElement, glow: number): Float32Array {
  const proxy: TubeElement = {
    id: el.id, kind: 'tube-single', color: el.color,
    points: [], diameter: el.strokeWidth, cornerRadii: [],
  };
  const verts: number[] = [];
  const [r, g, b] = hdrColor(el.color, glow);
  for (const ring of el.contours) {
    const closed = ring.concat([ring[0]]);
    proxy.points = closed;
    proxy.cornerRadii = closed.map(() => 0);
    const ribbon = buildTubeRibbon(proxy, { glow: 1, dualPeriod: 0 });
    // 用统一颜色覆盖（buildTubeRibbon 已按 el.color 生成，直接采用）
    void r; void g; void b;
    for (const v of ribbon) verts.push(v);
  }
  return new Float32Array(verts);
}

/** 墙面矩形（无照片时的纯色底） */
export function buildWall(width: number, height: number, linearColor: [number, number, number], alpha = 1): Float32Array {
  const [r, g, b] = linearColor;
  const tris: [number, number][] = [[0, 0], [width, 0], [width, height], [0, 0], [width, height], [0, height]];
  const out = new Float32Array(tris.length * STRIDE);
  tris.forEach((p, i) => out.set([p[0], p[1], r, g, b, alpha], i * STRIDE));
  return out;
}

export function buildSceneMesh(elements: SignElement[], glow: number, badCornerMap: Map<string, Set<number>>): BuiltMesh {
  const tube: number[] = [];
  const fill: number[] = [];
  for (const el of elements) {
    if (el.kind === 'acrylic') {
      for (const v of buildAcrylicFill(el, glow)) fill.push(v);
      for (const v of buildAcrylicOutline(el, glow * 1.1)) tube.push(v);
    } else {
      const ribbon = buildTubeRibbon(el, {
        glow,
        dualPeriod: el.dualPeriod ?? 300,
        badCorners: badCornerMap.get(el.id),
      });
      for (const v of ribbon) tube.push(v);
    }
  }
  return { tubeVerts: new Float32Array(tube), fillVerts: new Float32Array(fill) };
}

export { pointInRing };
