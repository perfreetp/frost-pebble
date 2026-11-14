// 风筝骨架与蒙面的确定性生成器
// 关键性质:同一 (参数 + seed) 生成结果完全一致;学员手动修改以偏移量形式保存在 overrides,
// 换参数重新生成时按稳定 id 重新套用,实现"手动挪过的竹条/改过的分片接缝保留下来"。
import type {
  Bridle, KiteParams, KiteState, Overrides, Panel, SeamPoint,
  SkeletonType, Strip, Vec3,
} from '../types';
import { rng, rand, randInt } from './rng';
import { v, add, mirrorX, verticalCrossings, clamp } from './geom';

export interface TypeSpec {
  minStrips: number;
  maxStrips: number;
  minPanels: number;
  maxPanels: number;
  heightRatio: number; // 高度/翼展
  labels: string[];    // 可调竹条的基础中文名
}

export const TYPE_SPEC: Record<SkeletonType, TypeSpec> = {
  diamond: { minStrips: 2, maxStrips: 10, minPanels: 2, maxPanels: 10, heightRatio: 1.25, labels: ['竖脊', '横梁', '斜撑', '辅助肋'] },
  hexagon: { minStrips: 3, maxStrips: 9, minPanels: 3, maxPanels: 12, heightRatio: 1.05, labels: ['竖脊', '上横梁', '下横梁', '斜撑', '辅助肋'] },
  hardwing: { minStrips: 7, maxStrips: 13, minPanels: 3, maxPanels: 12, heightRatio: 1.15, labels: ['竖脊', '上横梁', '下横梁', '翅条', '斜撑', '辅助肋'] },
  softwing: { minStrips: 4, maxStrips: 10, minPanels: 2, maxPanels: 10, heightRatio: 0.9, labels: ['竖脊', '横梁', '翅条', '肋条', '斜撑'] },
};

export function emptyOverrides(): Overrides {
  return { stripOffset: {}, curvature: {}, seamOffset: {} };
}

interface StripDef {
  id: string;
  name: string;
  role: Strip['role'];
  a: Vec3;
  b: Vec3;
  mirror?: boolean;   // 是否成对生成左右镜像
  curvature?: number;
}

interface BuiltBase {
  silhouette: Vec3[];
  /** 核心竹条:任何参数下都生成 */
  core: StripDef[];
  /** 候选竹条(多为镜像对):目标数量超过核心数时按序补充 */
  optional: StripDef[];
  defaultWingCurvature?: number;
}

const JITTER = 0.006; // 基准位置的种子微扰 ±0.6%W,制造需要校验的小不对称

// ---------- 四种骨架的基准结构 ----------

function buildDiamond(W: number, H: number): BuiltBase {
  const top = v(0, H / 2), bottom = v(0, -H / 2), right = v(W / 2, 0), left = v(-W / 2, 0);
  const silhouette = [top, right, bottom, left];
  const core: StripDef[] = [
    { id: 'spine', name: '竖脊', role: 'spine', a: top, b: bottom },
    { id: 'cross', name: '横梁', role: 'cross', a: left, b: right },
  ];
  const optional: StripDef[] = [];
  for (let i = 1; i <= 4; i++) {
    const t = i / 5;
    const py = H / 2 - t * H;
    const px = (W / 2) * (1 - Math.abs(py) / (H / 2));
    optional.push({ id: `brace_${i}`, name: `斜撑${i}`, role: 'brace', a: v(0, py), b: v(px, py * 0.25), mirror: true });
  }
  return { silhouette, core, optional };
}

function buildHexagon(W: number, H: number): BuiltBase {
  const top = v(0, H / 2), bottom = v(0, -H / 2);
  const rU = v(W / 2, H * 0.18), lU = mirrorX(rU);
  const rL = v(W / 2, -H * 0.18), lL = mirrorX(rL);
  const silhouette = [top, rU, rL, bottom, lL, lU];
  const core: StripDef[] = [
    { id: 'spine', name: '竖脊', role: 'spine', a: top, b: bottom },
    { id: 'cross_u', name: '上横梁', role: 'cross', a: lU, b: rU },
    { id: 'cross_l', name: '下横梁', role: 'cross', a: lL, b: rL },
  ];
  const optional: StripDef[] = [];
  for (let i = 1; i <= 3; i++) {
    const t = i / 4;
    const py = H / 2 - t * H;
    const halfW = (W / 2) * Math.min(1, (H / 2 - Math.abs(py)) / (H * 0.32) + 0.05);
    optional.push({ id: `brace_${i}`, name: `斜撑${i}`, role: 'brace', a: v(0, py), b: v(halfW, py * 0.4), mirror: true });
  }
  return { silhouette, core, optional };
}

function buildHardwing(W: number, H: number): BuiltBase {
  const head = v(0, H / 2), foot = v(0, -H / 2);
  const shoulder = v(W * 0.16, H * 0.22), hip = v(W * 0.14, -H * 0.26);
  const rWingTip = v(W / 2, H * 0.06), lWingTip = mirrorX(rWingTip);
  const rWingLow = v(W * 0.24, -H * 0.08), lWingLow = mirrorX(rWingLow);
  // 顺时针轮廓
  const silhouette = [head, shoulder, rWingTip, rWingLow, hip, foot, mirrorX(hip), lWingLow, lWingTip, mirrorX(shoulder)];
  const core: StripDef[] = [
    { id: 'spine', name: '竖脊', role: 'spine', a: head, b: foot },
    { id: 'cross_u', name: '上横梁', role: 'cross', a: mirrorX(shoulder), b: shoulder },
    { id: 'cross_l', name: '下横梁', role: 'cross', a: mirrorX(hip), b: hip },
    { id: 'wing_top', name: '上翅条', role: 'wing', a: shoulder, b: rWingTip, mirror: true },
    { id: 'wing_bot', name: '下翅条', role: 'wing', a: rWingLow, b: rWingTip, mirror: true },
  ];
  const optional: StripDef[] = [];
  for (let i = 1; i <= 3; i++) {
    const t = i / 4;
    const py = H * 0.22 - t * H * 0.48;
    optional.push({ id: `brace_${i}`, name: `斜撑${i}`, role: 'brace', a: v(0, py), b: v(W * 0.15, py * 0.5), mirror: true });
  }
  return { silhouette, core, optional, defaultWingCurvature: 0.18 };
}

function buildSoftwing(W: number, H: number): BuiltBase {
  const top = v(0, H / 2), bottom = v(0, -H / 2);
  const rTip = v(W / 2, H * 0.05), lTip = mirrorX(rTip);
  const rLow = v(W * 0.2, -H * 0.32), lLow = mirrorX(rLow);
  const silhouette = [top, rTip, rLow, bottom, lLow, lTip];
  const core: StripDef[] = [
    { id: 'spine', name: '竖脊', role: 'spine', a: top, b: bottom },
    { id: 'cross', name: '横梁', role: 'cross', a: mirrorX(rLow), b: rLow },
    { id: 'wing', name: '主翅条', role: 'wing', a: top, b: rTip, mirror: true, curvature: 0.25 },
  ];
  const optional: StripDef[] = [];
  for (let i = 1; i <= 3; i++) {
    const t = i / 4;
    const py = H / 2 - t * H * 0.8;
    const px = (W / 2) * (1 - t * 0.55);
    optional.push({ id: `rib_${i}`, name: `肋条${i}`, role: 'rib', a: v(0, py), b: v(px, py - H * 0.08), mirror: true });
  }
  return { silhouette, core, optional, defaultWingCurvature: 0.25 };
}

const BUILDERS: Record<SkeletonType, (W: number, H: number) => BuiltBase> = {
  diamond: buildDiamond, hexagon: buildHexagon, hardwing: buildHardwing, softwing: buildSoftwing,
};

// ---------- 竹条展开与确定性微扰 ----------

/** 按 (主种子, 盐值) 派生独立随机流:同一 id 永远拿到同一扰动,与竹条数量/调用顺序无关 */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function jitterOffset(seed: number, salt: string, W: number): Vec3 {
  const r = rng((seed ^ hashStr(salt)) >>> 0);
  return v(rand(r, -JITTER, JITTER) * W, rand(r, -JITTER, JITTER) * W, 0);
}

function expandStrips(base: BuiltBase, targetCount: number, seed: number, W: number): Strip[] {
  const out: Strip[] = [];
  const push = (def: StripDef, a: Vec3, b: Vec3, id: string, mirrorId?: string) => {
    const offA = jitterOffset(seed, `${id}:a`, W);
    const offB = jitterOffset(seed, `${id}:b`, W);
    out.push({
      id, name: def.name, role: def.role,
      a: add(a, offA), b: add(b, offB),
      curvature: def.curvature ?? 0,
      ...(mirrorId ? { mirrorId } : {}),
    });
  };
  const materialize = (def: StripDef) => {
    if (def.mirror) {
      push(def, def.a, def.b, `${def.id}_r`, `${def.id}_l`);
      push(def, mirrorX(def.a), mirrorX(def.b), `${def.id}_l`, `${def.id}_r`);
    } else {
      push(def, def.a, def.b, def.id);
    }
  };

  // 核心竹条全部生成
  base.core.forEach(materialize);

  // 候选对按序补充,直到达标;候选耗尽后用通用辅助肋兜底(成对优先)
  for (const def of base.optional) {
    if (out.length >= targetCount) break;
    materialize(def);
  }

  let extra = targetCount - out.length;
  let k = 1;
  while (extra > 0) {
    const y = W * (0.4 - k * 0.13);
    const x = W * (0.18 + (k % 3) * 0.06);
    const name = `辅助肋${k}`;
    const d: StripDef = { id: `extra_${k}`, name, role: 'rib', a: v(0, y), b: v(x, y - W * 0.05) };
    if (extra >= 2) {
      push(d, v(0, y), v(x, y - W * 0.05), `extra_${k}_r`, `extra_${k}_l`);
      push(d, v(0, y), v(-x, y - W * 0.05), `extra_${k}_l`, `extra_${k}_r`);
      extra -= 2;
    } else {
      push(d, v(0, y), v(x, y - W * 0.05), `extra_${k}_r`);
      extra -= 1;
    }
    k++;
    if (k > 12) break; // 安全上限
  }
  return out.slice(0, targetCount);
}

// ---------- 蒙面分片 ----------

const PANEL_COLORS = ['#f4b6c2', '#f9d59b', '#a8d8b9', '#9ec9e8', '#cdb4e8',
  '#f6a5a5', '#b5e0d3', '#e8c39e', '#9fb7e8', '#d9a7c7', '#c7e2a6', '#f2b880'];

function buildPanels(silhouette: Vec3[], panelCount: number, seams: SeamPoint[], seed: number): Panel[] {
  const EPS = 1e-4;
  const xs = seams.map(s => s.pos.x).sort((a, b) => a - b);
  // 用轮廓实际范围作外边界(±Infinity 无法参与射线求交,会丢首尾分片)
  const minX = Math.min(...silhouette.map(p => p.x));
  const maxX = Math.max(...silhouette.map(p => p.x));
  const bounds: number[] = [minX, ...xs, maxX];
  const colorRng = rng((seed ^ 0x9e3779b9) >>> 0);
  const panels: Panel[] = [];
  for (let i = 0; i < panelCount; i++) {
    const xL = bounds[i] + (i === 0 ? EPS : 0);
    const xR = bounds[i + 1] - (i === panelCount - 1 ? EPS : 0);
    const yL = verticalCrossings(silhouette, xL);
    const yR = verticalCrossings(silhouette, xR);
    if (yL.length < 2 || yR.length < 2) continue;
    // 取最外的上下交点
    const lb = v(xL, yL[0]), lt = v(xL, yL[yL.length - 1]);
    const rb = v(xR, yR[0]), rt = v(xR, yR[yR.length - 1]);
    const verts = [lt, rt, rb, lb]; // 顺时针
    panels.push({
      id: `panel_${i + 1}`,
      name: `分片${i + 1}`,
      vertices: verts,
      color: PANEL_COLORS[randInt(colorRng, 0, PANEL_COLORS.length - 1)],
    });
  }
  return panels;
}

function buildSeams(silhouette: Vec3[], panelCount: number, seed: number, W: number, overrides: Overrides): SeamPoint[] {
  const seams: SeamPoint[] = [];
  const n = panelCount - 1;
  for (let i = 1; i <= n; i++) {
    const r = rng((seed ^ hashStr(`seam_${i}`)) >>> 0);
    const baseX = -W / 2 + (i / panelCount) * W;
    const jitter = rand(r, -0.025, 0.025) * W; // 分片不要求严格等宽,留可调空间
    const x = baseX + jitter;
    const ys = verticalCrossings(silhouette, x);
    if (ys.length < 2) continue;
    const midY = (ys[0] + ys[ys.length - 1]) / 2;
    const id = `seam_${i}`;
    const off = overrides.seamOffset[id] ?? v(0, 0, 0);
    // 互逆配对:第 i 条与第 n-i+1 条互为镜像;正中一条(n 为奇数时的中位接缝)无对侧
    const mirrorIdx = n - i + 1;
    seams.push({
      id,
      pos: add(v(x, midY, 0), off),
      ...(mirrorIdx !== i ? { mirrorId: `seam_${mirrorIdx}` } : {}),
    });
  }
  return seams;
}

// ---------- 主入口 ----------

export function generateKite(params: KiteParams, prevOverrides?: Overrides): KiteState {
  const spec = TYPE_SPEC[params.skeleton];
  const stripCount = clamp(params.stripCount, spec.minStrips, spec.maxStrips);
  const panelCount = clamp(params.panelCount, spec.minPanels, spec.maxPanels);
  const W = params.wingspan;
  const H = params.wingspan * spec.heightRatio;
  const overrides: Overrides = prevOverrides
    ? {
      stripOffset: { ...prevOverrides.stripOffset },
      curvature: { ...prevOverrides.curvature },
      seamOffset: { ...prevOverrides.seamOffset },
      ...(prevOverrides.bridleKnot ? { bridleKnot: { ...prevOverrides.bridleKnot } } : {}),
    }
    : emptyOverrides();

  const seed = params.seed;
  const base = BUILDERS[params.skeleton](W, H);
  const silhouette = base.silhouette.map((p, i) =>
    add(p, jitterOffset(seed, `sil:${i}`, W)));

  let strips = expandStrips(base, stripCount, seed, W);
  const allDefs = [...base.core, ...base.optional];
  // 弧度:默认值 + 学员覆盖值
  strips = strips.map(s => {
    const def = allDefs.find(d => s.id === d.id || s.id.startsWith(d.id + '_'));
    const defaultCurv = s.role === 'wing' ? (base.defaultWingCurvature ?? 0.15) : (def?.curvature ?? 0);
    const curvature = overrides.curvature[s.id] ?? defaultCurv;
    const off = overrides.stripOffset[s.id];
    return off
      ? { ...s, a: add(s.a, off), b: add(s.b, off), curvature }
      : { ...s, curvature };
  });

  const seams = buildSeams(silhouette, panelCount, seed, W, overrides);
  const panels = buildPanels(silhouette, panelCount, seams, seed);

  const attach = v(0, H * 0.12, W * 0.02);
  const defaultKnot: Vec3 = v(0, H * 0.05, W * 0.18);
  const bridle: Bridle = {
    attach,
    knot: overrides.bridleKnot ?? defaultKnot,
  };

  return { params: { ...params, stripCount, panelCount }, silhouette, strips, panels, seams, bridle, overrides };
}

/** 竹条当前实际几何(含弧度)采样点,供三维渲染与校验使用 */
export function stripPoints(strip: Strip, segments = 16): Vec3[] {
  const pts: Vec3[] = [];
  const dx = strip.b.x - strip.a.x;
  const dy = strip.b.y - strip.a.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const bow = Math.sin(Math.PI * t) * strip.curvature * length * 0.12;
    pts.push(v(
      strip.a.x + dx * t + nx * bow,
      strip.a.y + dy * t + ny * bow,
      strip.a.z + (strip.b.z - strip.a.z) * t + Math.abs(bow) * 0.15,
    ));
  }
  return pts;
}
