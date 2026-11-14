/**
 * 同一桩号上历次巡检病害的时间线归并与发展趋势分析。
 */
import type { Defect, DefectType, Inspection, SeverityLevel } from './types';
import { dist } from './math';

export interface TimelinePoint {
  defect: Defect;
  inspection: Inspection;
  sortKey: number;
  /** 该次观测的主尺度（裂缝取长度 mm；体块取面积 m² 换算为等价长度 mm） */
  extentMm: number;
  widthMm: number;
  critical: boolean;
}

export interface DefectFamily {
  id: string;
  type: DefectType;
  /** 主尺度的物理含义：裂缝=宽度，支座脱空=深度，铰缝渗水=影响长度 */
  measureKind: 'width' | 'depth' | 'extent';
  /** 该类型适用的预警/严重参考值（裂缝 0.2/0.3 mm；脱空 15%/30% 或深度 2/5 mm；渗水长度 0.5/1.5 m） */
  warnAt: number;
  criticalAt: number;
  unit: string;
  componentId: string;
  label: string;
  points: TimelinePoint[];
  latest: TimelinePoint;
  first: TimelinePoint;
  /** 长度年增长速率，mm/年 */
  extentRatePerYear: number;
  /** 宽度年增长速率，mm/年 */
  widthRatePerYear: number;
  /** 首次→最近一次跨度（年） */
  spanYears: number;
  /** 新增：仅在最近一次巡检出现 */
  isNew: boolean;
  /** 扩展：最近一次相对上一次明显增长 */
  isExpanded: boolean;
  extentDeltaMm: number;
  widthDeltaMm: number;
  /** 用于与限值比较的主尺度（裂缝=宽度；支座=深度；渗水=影响长度；单位 mm） */
  comparableMm: number;
  /** 距严重限值的余量（同一主尺度，mm），负值表示已超 */
  headroomMm: number;
  /** 预计多少年后触达严重限值（不足一次定检周期则告警） */
  yearsToLimit: number | null;
  nearLimit: boolean;
  /** 归并口径说明 */
  matchNote: string;
}

export const INSPECTION_CYCLE_YEARS = 1;

const EXTENT_TOLERANCE_M = 0.35;
const OFFSET_TOLERANCE_M = 0.5;

export function defectExtentMm(d: Defect): number {
  if (d.geometry.kind === 'crack') return d.geometry.lengthMm;
  // 体块：以等效边长（面积开方）换算，便于统一速率比较
  return Math.sqrt(d.geometry.areaM2) * 1000;
}

export function defectWidthMm(d: Defect): number {
  if (d.geometry.kind === 'crack') return d.geometry.widthMm;
  return d.geometry.depthMm;
}

export function yearsBetween(aISO: string, bISO: string): number {
  const a = Date.parse(aISO);
  const b = Date.parse(bISO);
  return Math.max(1 / 365, (b - a) / (365.25 * 24 * 3600 * 1000));
}

function sameDefect(a: Defect, b: Defect): boolean {
  if (a.type !== b.type) return false;
  if (a.componentId !== b.componentId) return false;
  if (Math.abs(a.chainage - b.chainage) > EXTENT_TOLERANCE_M) return false;
  if (Math.abs(a.offset - b.offset) > OFFSET_TOLERANCE_M) return false;
  return true;
}

/**
 * 把同一构件、桩号±0.35 m、偏距±0.5 m 内的历史病害归为一条“病害发展线”。
 */
export function buildTimelines(
  defects: Defect[],
  inspections: Inspection[],
  opts: { criticalWidthMm?: number; cycleYears?: number } = {},
): DefectFamily[] {
  const criticalWidthMm = opts.criticalWidthMm ?? 0.3;
  const cycle = opts.cycleYears ?? INSPECTION_CYCLE_YEARS;
  const inspByld = new Map(inspections.map((i) => [i.id, i]));
  const dated = defects
    .map((d) => ({ d, insp: inspByld.get(d.inspectionId) }))
    .filter((x): x is { d: Defect; insp: Inspection } => !!x.insp)
    .sort((a, b) => Date.parse(a.insp.date) - Date.parse(b.insp.date));

  const families: DefectFamily[] = [];
  const used = new Set<string>();

  for (let i = 0; i < dated.length; i++) {
    const seed = dated[i];
    if (used.has(seed.d.id)) continue;
    const members: { d: Defect; insp: Inspection }[] = [seed];
    used.add(seed.d.id);
    for (let j = i + 1; j < dated.length; j++) {
      if (used.has(dated[j].d.id)) continue;
      if (sameDefect(seed.d, dated[j].d)) {
        members.push(dated[j]);
        used.add(dated[j].d.id);
      }
    }
    members.sort((a, b) => Date.parse(a.insp.date) - Date.parse(b.insp.date));
    const points: TimelinePoint[] = members.map((m) => ({
      defect: m.d,
      inspection: m.insp,
      sortKey: Date.parse(m.insp.date),
      extentMm: defectExtentMm(m.d),
      widthMm: defectWidthMm(m.d),
      critical: m.d.severity === 'critical',
    }));
    const first = points[0];
    const latest = points[points.length - 1];
    const spanYears = yearsBetween(first.inspection.date, latest.inspection.date);
    const extentRate = points.length > 1 ? (latest.extentMm - first.extentMm) / spanYears : 0;
    const widthRate = points.length > 1 ? (latest.widthMm - first.widthMm) / spanYears : 0;

    let isExpanded = false;
    let extentDelta = 0;
    let widthDelta = 0;
    if (points.length > 1) {
      const prev = points[points.length - 2];
      extentDelta = latest.extentMm - prev.extentMm;
      widthDelta = latest.widthMm - prev.widthMm;
      isExpanded =
        extentDelta > Math.max(20, prev.extentMm * 0.08) ||
        widthDelta > Math.max(0.04, prev.widthMm * 0.1) ||
        (latest.critical && !prev.critical);
    }
    const isNew = points.length === 1;
    const type = latest.defect.type;
    const isCrack = type === 'crack';
    const criticalAt = isCrack ? criticalWidthMm : type === 'bearing_void' ? 5 : 1500;
    const warnAt = isCrack ? criticalWidthMm * (2 / 3) : type === 'bearing_void' ? 2 : 500;
    const measureKind: DefectFamily['measureKind'] =
      isCrack ? 'width' : type === 'bearing_void' ? 'depth' : 'extent';
    const unit = 'mm';
    // 各类型的主尺度不同：裂缝比宽度、支座比脱空深度、铰缝比渗水影响长度
    const comparable = isCrack ? latest.widthMm : type === 'bearing_void' ? latest.widthMm : latest.extentMm;
    const headroom = criticalAt - comparable;
    let yearsToLimit: number | null = null;
    const growthPerYear = isCrack ? widthRate : extentRate;
    if (growthPerYear > 0.001) yearsToLimit = Math.max(0, headroom / growthPerYear);
    const nearLimit =
      headroom >= 0 &&
      headroom <= criticalAt * 0.22 &&
      comparable > warnAt &&
      comparable <= criticalAt;
    const predictedSoon = yearsToLimit != null && yearsToLimit <= cycle && comparable > warnAt;

    families.push({
      id: `fam-${latest.defect.id}`,
      type,
      measureKind,
      warnAt,
      criticalAt,
      unit,
      componentId: latest.defect.componentId,
      label: latest.defect.code,
      points,
      latest,
      first,
      extentRatePerYear: extentRate,
      widthRatePerYear: widthRate,
      spanYears,
      isNew,
      isExpanded,
      extentDeltaMm: extentDelta,
      widthDeltaMm: widthDelta,
      comparableMm: comparable,
      headroomMm: headroom,
      yearsToLimit,
      nearLimit: nearLimit || predictedSoon,
      matchNote: `构件相同 · 桩号 ±${EXTENT_TOLERANCE_M} m · 偏距 ±${OFFSET_TOLERANCE_M} m`,
    });
  }

  families.sort((a, b) => {
    const rank = (s: SeverityLevel) => (s === 'critical' ? 0 : s === 'warning' ? 1 : 2);
    return (
      rank(a.latest.defect.severity) - rank(b.latest.defect.severity) ||
      Number(b.nearLimit) - Number(a.nearLimit) ||
      b.latest.defect.chainage - a.latest.defect.chainage
    );
  });
  return families;
}

export interface TimelineSummary {
  families: DefectFamily[];
  total: number;
  critical: number;
  warning: number;
  normal: number;
  newCount: number;
  expandedCount: number;
  nearLimitCount: number;
  /** 近 5 年 / 全部跨度里发展最快的若干条 */
  fastest: DefectFamily[];
  /** 按构件类型统计 */
  byComponent: Record<string, { total: number; critical: number; newCount: number; expanded: number }>;
}

export function summarizeTimelines(families: DefectFamily[]): TimelineSummary {
  const stats: TimelineSummary = {
    families,
    total: families.length,
    critical: 0,
    warning: 0,
    normal: 0,
    newCount: 0,
    expandedCount: 0,
    nearLimitCount: 0,
    fastest: [],
    byComponent: {},
  };
  for (const f of families) {
    const s = f.latest.defect.severity;
    stats[s]++;
    if (f.isNew) stats.newCount++;
    if (f.isExpanded) stats.expandedCount++;
    if (f.nearLimit) stats.nearLimitCount++;
    const compType = f.latest.defect.componentId.includes('girder')
      ? 'girder'
      : f.latest.defect.componentId.includes('pier')
        ? 'pier'
        : f.latest.defect.componentId.includes('bearing')
          ? 'bearing'
          : f.latest.defect.componentId.includes('deck')
            ? 'deck'
            : f.latest.defect.componentId.includes('railing')
              ? 'railing'
              : 'abutment';
    const bucket = (stats.byComponent[compType] ??= { total: 0, critical: 0, newCount: 0, expanded: 0 });
    bucket.total++;
    if (s === 'critical') bucket.critical++;
    if (f.isNew) bucket.newCount++;
    if (f.isExpanded) bucket.expanded++;
  }
  stats.fastest = families
    .filter((f) => f.points.length > 1 && f.widthRatePerYear > 0)
    .sort((a, b) => b.widthRatePerYear - a.widthRatePerYear)
    .slice(0, 5);
  return stats;
}

/** 在同一时间线上按检索圈定的“新增/扩展/稳定/好转”分类 */
export type TrendKind = 'new' | 'expanded' | 'stable' | 'reduced';

export function trendOf(f: DefectFamily): TrendKind {
  if (f.isNew) return 'new';
  if (f.isExpanded) return 'expanded';
  const prev = f.points[f.points.length - 2];
  if (f.points.length > 1 && f.latest.extentMm < prev.extentMm * 0.92) return 'reduced';
  return 'stable';
}

export const TREND_LABEL: Record<TrendKind, string> = {
  new: '新增',
  expanded: '扩展',
  stable: '稳定',
  reduced: '趋缓',
};
