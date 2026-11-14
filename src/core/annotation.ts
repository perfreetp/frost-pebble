/**
 * 病害标注的纯逻辑部分：由吸附点 + 曲面采样计算几何量、桩号、偏距、标高、走向、定级。
 */
import type {
  ComponentInfo,
  CrackGeometry,
  Defect,
  DefectType,
  SeverityLevel,
  Vec3,
  VolumeGeometry,
  BridgeConfig,
} from './types';
import {
  add,
  bboxOf,
  clamp,
  clamp01,
  cross,
  dist,
  dot,
  len,
  lerp3,
  norm,
  scale,
  sub,
} from './math';
import type { Projector } from './surface';
import { unfoldPolyline, horizontalAzimuthDeg, traceOnSurface } from './surface';

export interface CrackDraft {
  a: Vec3;
  b: Vec3;
  widthMm: number;
  widthAt: number;
  penetrated: boolean;
  project: Projector;
}

export interface CrackMeasurement {
  geometry: CrackGeometry;
  /** 采样点上的法向（用于渲染偏移） */
  normals: Vec3[];
  /** 采样点数 */
  samples: number;
  /** 展开平面坐标（用于诊断/测试） */
  unfolded: { x: number; y: number }[];
}

export interface Thresholds {
  warnWidthMm: number;
  criticalWidthMm: number;
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  warnWidthMm: 0.2,
  criticalWidthMm: 0.3,
};

/** 裂缝走向分类：与里程方向夹角 <= 20° 纵向，>= 70° 横向，其余斜向 */
export function classifyCrackOrientation(azimuthDeg: number): CrackGeometry['orientation'] {
  // 走向角取绝对值后折叠到 [0,90]
  let a = Math.abs(azimuthDeg) % 180;
  if (a > 90) a = 180 - a;
  if (a <= 20) return 'longitudinal';
  if (a >= 70) return 'transverse';
  return 'diagonal';
}

/**
 * 在两点之间沿曲面采样并计算裂缝真实长度/走向。
 * a/b 为用户点击的屏幕点经射线投射后的表面点；两者必须来自同一构件。
 */
export function measureCrack(draft: CrackDraft): CrackMeasurement {
  const { a, b, project } = draft;
  const path = traceOnSurface(a, b, project, { maxDepth: 7, tolerance: 0.003, snapDistance: 0.8 });
  // 采样法向
  const normals: Vec3[] = [];
  for (const p of path) {
    const h = project(p);
    normals.push(h ? h.normal : [0, 1, 0]);
  }
  const unfold = unfoldPolyline(path, normals);
  const lengthMm = unfold.length * 1000;
  // 整体走向取端点弦向；若端点几乎重合（绕行一周）则退回首段切向
  const chord = sub(path[path.length - 1], path[0]);
  const firstNonZero = path.find((p, i) => i > 0 && dist(p, path[0]) > 1e-6);
  const dir = len(chord) > 1e-4 ? norm(chord) : norm(firstNonZero ? sub(firstNonZero, path[0]) : [1, 0, 0]);
  const azimuthDeg = horizontalAzimuthDeg(dir);
  // 中点法向
  const midIdx = Math.floor(path.length / 2);
  const midHit = project(path[midIdx]);
  const normal: Vec3 = midHit ? midHit.normal : [0, 1, 0];
  const widthAt = clamp01(draft.widthAt);

  return {
    geometry: {
      kind: 'crack',
      endpoints: [path[0], path[path.length - 1]],
      path,
      normal,
      lengthMm,
      azimuthDeg,
      orientation: classifyCrackOrientation(azimuthDeg),
      widthMm: draft.widthMm,
      widthAt,
      penetrated: draft.penetrated,
    },
    normals,
    samples: path.length,
    unfolded: unfold.points2d,
  };
}

export function crackCenter(g: CrackGeometry): Vec3 {
  if (g.path.length === 0) return g.endpoints[0];
  const mid = g.path[Math.floor(g.path.length / 2)];
  return mid;
}

/** 裂缝上按比例 t 处的点 */
export function crackPointAt(g: CrackGeometry, t: number): Vec3 {
  if (g.path.length < 2) return g.path[0];
  const total = g.path.reduce((s, p, i) => (i ? s + dist(g.path[i - 1], p) : 0), 0);
  let target = total * clamp01(t);
  for (let i = 1; i < g.path.length; i++) {
    const seg = dist(g.path[i - 1], g.path[i]);
    if (target <= seg || i === g.path.length - 1) {
      return lerp3(g.path[i - 1], g.path[i], seg > 0 ? target / seg : 0);
    }
    target -= seg;
  }
  return g.path[g.path.length - 1];
}

/** 裂缝上 t 处法向 */
export function crackNormalAt(g: CrackGeometry, t: number, normals?: Vec3[]): Vec3 {
  if (normals && normals.length >= 2) {
    const idx = Math.round(clamp01(t) * (normals.length - 1));
    return normals[idx];
  }
  return g.normal;
}

// ---------------------------------------------------------------- volume defects

export interface VolumeDraft {
  a: Vec3;
  b: Vec3;
  depthMm: number;
  /** 仅支座脱空：设计支承面积（平方米），用于脱空率 */
  referenceAreaM2?: number;
}

export function measureVolumeDefect(draft: VolumeDraft): { geometry: VolumeGeometry; normals: Vec3[] } {
  const center = lerp3(draft.a, draft.b, 0.5);
  // 以水平面内 A→B 为主轴
  const dx = draft.b[0] - draft.a[0];
  const dz = draft.b[2] - draft.a[2];
  const spanX = Math.abs(dx);
  const spanZ = Math.abs(dz);
  const yaw = Math.atan2(dz, dx);
  const halfLen = Math.sqrt(spanX * spanX + spanZ * spanZ) / 2;
  // 横向宽度：垂直于主轴的水平尺寸，默认取 60% 主轴长度或 0.3 m 中较小，最小 0.08
  const cross_ = Math.min(0.45, Math.max(0.08, halfLen * 0.6));
  const dy = Math.abs(draft.b[1] - draft.a[1]);
  const thickness = Math.max(0.04, Math.min(0.35, dy + 0.05));
  const size: Vec3 = [halfLen * 2, thickness, cross_ * 2];
  const areaM2 = Math.max(1e-6, halfLen * 2 * cross_ * 2);
  const voidRatio =
    draft.referenceAreaM2 && draft.referenceAreaM2 > 0
      ? clamp01(areaM2 / draft.referenceAreaM2)
      : undefined;
  const upAxis: Vec3 = [0, 1, 0];
  return {
    geometry: {
      kind: 'volume',
      center,
      size,
      yaw,
      depthMm: draft.depthMm,
      areaM2,
      voidRatio,
    },
    normals: [upAxis, upAxis],
  };
}

// ---------------------------------------------------------------- grading

export interface GradeInput {
  type: DefectType;
  widthMm?: number;
  lengthMm?: number;
  penetrated?: boolean;
  voidRatio?: number;
  depthMm?: number;
  /** 体块类：影响长度（毫米），用于铰缝渗水定级 */
  influenceLengthMm?: number;
  componentType: ComponentInfo['type'];
  thresholds?: Thresholds;
}

export interface GradeResult {
  grade: 1 | 2 | 3 | 4 | 5;
  severity: SeverityLevel;
  reasons: string[];
  /** 是否触发“必须补特写照片 + 判定依据才可保存” */
  requiresJustification: boolean;
  requiresPhotos: boolean;
  thresholdLabel: string;
}

export function severityColor(s: SeverityLevel): string {
  return s === 'critical' ? '#e5484d' : s === 'warning' ? '#e8b033' : '#5aa76a';
}

/**
 * 定级规则（简化自 JTG/T H21-2011 桥梁技术状况评定标准中裂缝/支座/铰缝条款）：
 * - 裂缝宽度 > 0.3 mm，或 >0.2 mm 且位于梁体/墩柱受力部位且贯通 → 严重（4/5 级）
 * - 裂缝宽度 > 0.2 mm → 需关注（2/3 级）
 * - 支座脱空率 > 30% 或脱空深度 > 5 mm → 严重；>15% → 需关注
 * - 铰缝渗水影响长度 > 1.5 m 或呈线状析白 → 严重；轻度渗水 → 需关注
 */
export function gradeDefect(input: GradeInput): GradeResult {
  const th = input.thresholds ?? DEFAULT_THRESHOLDS;
  const reasons: string[] = [];
  let grade: GradeResult['grade'] = 1;
  let severity: SeverityLevel = 'normal';
  let thresholdLabel = '';

  if (input.type === 'crack') {
    const w = input.widthMm ?? 0;
    const l = input.lengthMm ?? 0;
    thresholdLabel = `宽度 ${w.toFixed(2)} mm（阈值 ${th.warnWidthMm.toFixed(1)} / ${th.criticalWidthMm.toFixed(1)} mm）`;
    if (w > th.criticalWidthMm) {
      grade = 4;
      severity = 'critical';
      reasons.push(`裂缝宽度 ${w.toFixed(2)} mm > ${th.criticalWidthMm.toFixed(1)} mm 严重限值`);
    } else if (w > th.warnWidthMm) {
      grade = 2;
      severity = 'warning';
      reasons.push(`裂缝宽度 ${w.toFixed(2)} mm > ${th.warnWidthMm.toFixed(1)} mm 预警限值`);
    }
    if (input.penetrated) {
      reasons.push('裂缝贯通（贯穿截面），按承重构件条款提高一级');
      grade = Math.min(5, grade + 1) as GradeResult['grade'];
      if (w > th.warnWidthMm) severity = 'critical';
    }
    if (input.componentType === 'girder' && w > th.warnWidthMm && l > 1500) {
      reasons.push(`梁体裂缝长度 ${(l / 1000).toFixed(2)} m > 1.5 m，且位于受力主筋区`);
      grade = Math.min(5, grade + 1) as GradeResult['grade'];
      severity = 'critical';
    }
    if (severity === 'normal') reasons.push('宽度未超预警限值，按一般病害记录');
  } else if (input.type === 'bearing_void') {
    const vr = input.voidRatio ?? 0;
    const d = input.depthMm ?? 0;
    thresholdLabel = `脱空率 ${(vr * 100).toFixed(0)}% / 脱空深度 ${d.toFixed(1)} mm`;
    if (vr > 0.3 || d > 5) {
      grade = 4;
      severity = 'critical';
      reasons.push(
        vr > 0.3
          ? `支座脱空面积占支承面 ${(vr * 100).toFixed(0)}% > 30%，局部承压失效风险`
          : `支座脱空深度 ${d.toFixed(1)} mm > 5 mm，局部承压失效风险`,
      );
    } else if (vr > 0.15 || d > 2) {
      grade = 2;
      severity = 'warning';
      reasons.push(`支座脱空率 ${(vr * 100).toFixed(0)}% 或深度 ${d.toFixed(1)} mm，超出早期预警限值`);
    }
    if (severity === 'normal') reasons.push('脱空量与深度均未超预警限值');
  } else {
    const l = input.influenceLengthMm ?? input.lengthMm ?? 0;
    const area = (input as GradeInput & { areaM2?: number }).areaM2 ?? 0;
    thresholdLabel = `影响长度 ${(l / 1000).toFixed(2)} m（阈值 0.5 / 1.5 m）`;
    if (l > 1500 || area > 1.5) {
      grade = 4;
      severity = 'critical';
      reasons.push('铰缝渗水呈线状贯通并伴析白、锈迹，影响长度 > 1.5 m');
    } else if (l > 500 || area > 0.4) {
      grade = 2;
      severity = 'warning';
      reasons.push('铰缝存在渗水迹，影响长度 > 0.5 m');
    }
    if (severity === 'normal') reasons.push('仅局部湿渍，未成线状');
  }

  if (input.type === 'crack' && input.componentType === 'bearing') {
    reasons.push('支座不适用裂缝条款，建议按构造病害复核');
  }

  return {
    grade,
    severity,
    reasons,
    requiresJustification: severity === 'critical',
    requiresPhotos: severity === 'critical',
    thresholdLabel,
  };
}

// ---------------------------------------------------------------- placement

export interface Placement {
  chainage: number;
  offset: number;
  elevation: number;
  component: ComponentInfo | null;
}

/** 计算标注位置：里程桩号 / 偏距 / 标高 */
export function placementOf(p: Vec3, config: BridgeConfig, components: ComponentInfo[]): Placement {
  const chainage = config.stationStart + p[0];
  const offset = p[2];
  const elevation = p[1];
  return { chainage, offset, elevation, component: nearestComponent(components, p) };
}

export function nearestComponent(components: ComponentInfo[], p: Vec3): ComponentInfo | null {
  let best: ComponentInfo | null = null;
  let bestD = Infinity;
  let bestVol = Infinity;
  for (const c of components) {
    let d = 0;
    for (let i = 0; i < 3; i++) {
      const q = p[i] < c.bboxMin[i] ? c.bboxMin[i] : p[i] > c.bboxMax[i] ? c.bboxMax[i] : p[i];
      d += (q - p[i]) ** 2;
    }
    const vol =
      (c.bboxMax[0] - c.bboxMin[0]) * (c.bboxMax[1] - c.bboxMin[1]) * (c.bboxMax[2] - c.bboxMin[2]);
    // 包围盒重叠（d=0）时优先更“薄”的具体构件（铺装 > 梁体）
    if (d < bestD - 1e-9 || (Math.abs(d - bestD) <= 1e-9 && vol < bestVol)) {
      bestD = d;
      bestVol = vol;
      best = c;
    }
  }
  return best;
}

/** 横向位置描述（左侧/右侧/跨中） */
export function sideLabel(offset: number, deckWidth: number): string {
  const half = deckWidth / 2;
  const frac = offset / half;
  if (Math.abs(frac) < 0.12) return '跨中';
  if (frac < -0.75) return '左侧边缘';
  if (frac < -0.2) return '左侧';
  if (frac > 0.75) return '右侧边缘';
  if (frac > 0.2) return '右侧';
  return Math.abs(frac) <= 0.5 ? (frac < 0 ? '左半幅' : '右半幅') : frac < 0 ? '左侧' : '右侧';
}

export function offsetLabel(offset: number, deckWidth: number): string {
  const side = offset < 0 ? '左' : offset > 0 ? '右' : '中';
  return `距中线${side} ${Math.abs(offset).toFixed(2)} m`;
}

// ---------------------------------------------------------------- validation gate

export interface DraftValidation {
  ok: boolean
  errors: string[]
  warnings: string[]
}

export interface DraftMeta {
  type: DefectType;
  widthMm?: number;
  lengthMm?: number;
  penetrated?: boolean;
  depthMm?: number;
  influenceLengthMm?: number;
  justification: string;
  photos: { id: string; url: string; caption: string }[];
  componentId: string;
  componentType?: ComponentInfo['type'];
  endpoints?: [Vec3, Vec3];
  thresholds?: Thresholds;
  voidRatio?: number;
}

export function validateDraft(d: DraftMeta): DraftValidation & { graded: GradeResult } {
  const graded = gradeDefect({
    type: d.type,
    widthMm: d.widthMm,
    lengthMm: d.lengthMm,
    penetrated: d.penetrated,
    depthMm: d.depthMm,
    voidRatio: d.voidRatio,
    influenceLengthMm: d.influenceLengthMm,
    componentType: d.componentType ?? 'girder',
    thresholds: d.thresholds,
  });
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!d.componentId) errors.push('请先选择病害所属构件');
  if (d.type === 'crack') {
    if (!d.endpoints) errors.push('请先点击裂缝的两个端点');
    if (d.widthMm == undefined || d.widthMm <= 0) errors.push('请录入实测裂缝宽度');
    if (d.widthMm != undefined && d.widthMm > 3) warnings.push('宽度异常大，请复核是否单位填写正确');
  }
  if (d.type === 'bearing_void' && d.depthMm != undefined && d.depthMm <= 0) {
    errors.push('请录入脱空深度');
  }
  if (d.type === 'joint_seepage' && !d.endpoints) {
    errors.push('请先框选渗水范围（拖拽两个角点）');
  }
  if (graded.requiresJustification && !d.justification?.trim()) {
    errors.push(`等级 ${graded.grade} 级（${graded.severity === 'critical' ? '严重' : '需关注'}）必须填写判定依据后方可保存`);
  }
  if (graded.requiresPhotos && (d.photos?.length ?? 0) < 1) {
    errors.push('严重级病害必须至少上传一张特写照片后方可保存');
  }
  if (d.widthMm != undefined && d.widthMm > 0.2 && d.photos.length === 0) {
    warnings.push('宽度超 0.2 mm，建议补充特写照片');
  }
  if (graded.severity === 'critical' && d.photos.length === 1) {
    warnings.push('严重级建议补充正视 + 侧视至少两张照片');
  }
  return { ok: errors.length === 0, errors, warnings, graded };
}

export function emptyDefectMeta(type: DefectType): DraftMeta {
  return {
    type,
    widthMm: type === 'crack' ? 0.25 : undefined,
    penetrated: true,
    depthMm: type === 'bearing_void' ? 3 : type === 'joint_seepage' ? 20 : undefined,
    justification: '',
    photos: [],
    componentId: '',
  };
}

/** 构件短标签：span-2-girder → SP2G，support-1-bearing-0 → P1B0 */
export function componentTag(componentId: string): string {
  const parts = componentId.split('-');
  const type =
    componentId.includes('girder') ? 'G'
      : componentId.includes('deck') ? 'D'
        : componentId.includes('bearing') ? 'B'
          : componentId.includes('pier') ? 'P'
            : componentId.includes('railing') ? 'R'
              : componentId.includes('abutment') ? 'A'
                : 'X';
  if (parts[0] === 'span') return `SP${parts[1]}${type}${parts[3] ? parts[3].slice(0, 1).toUpperCase() : ''}`;
  if (parts[0] === 'support') {
    const idx = parts[1];
    const pos = parts[3] !== undefined ? `-${parts[3]}` : '';
    return `SUP${idx}${type}${pos}`;
  }
  return componentId.replace(/[^0-9a-zA-Z]+/g, '').slice(0, 6).toUpperCase();
}

/** 生成病害编号，带巡检年份与序号 */
export function makeDefectCode(
  defects: Pick<Defect, 'id' | 'code'>[],
  type: DefectType,
  dateISO: string,
  componentId: string,
): string {
  const year = dateISO.slice(0, 4);
  const prefix = type === 'crack' ? 'LF' : type === 'bearing_void' ? 'ZK' : 'HF';
  // 编号具有 LF-2025-014-SP2D 形式；以“同年同前缀”的最大序号 + 1 递增，
  // 这样跨构件也不会重号，且不受 id 格式影响。
  let maxSeq = 0;
  for (const d of defects) {
    const code = (d as { code?: unknown })?.code;
    if (typeof code !== 'string') continue;
    const m = new RegExp(`^${prefix}-([0-9]{4})-([0-9]+)-`).exec(code);
    if (!m || m[1] !== year) continue;
    const n = Number(m[2]);
    if (Number.isFinite(n) && n > maxSeq) maxSeq = n;
  }
  return `${prefix}-${year}-${String(maxSeq + 1).padStart(3, '0')}-${componentTag(componentId)}`;
}
