// 设计统计、版本对比与超差判定
import type { BlastDesign, DiffMetric, VersionDiff } from '../types';

export interface DesignStats {
  totalHoles: number;
  skippedHoles: number;
  effectiveHoles: number;
  totalCharge: number;
  avgDepth: number;
  avgCharge: number;
  totalMeters: number;
}

export function computeStats(d: BlastDesign): DesignStats {
  const normal = d.holes.filter((h) => h.state === 'normal');
  const totalCharge = normal.reduce((s, h) => s + h.charge, 0);
  const totalMeters = normal.reduce((s, h) => s + h.depth, 0);
  return {
    totalHoles: d.holes.length,
    skippedHoles: d.holes.length - normal.length,
    effectiveHoles: normal.length,
    totalCharge: Math.round(totalCharge * 10) / 10,
    avgDepth: normal.length ? Math.round((totalMeters / normal.length) * 100) / 100 : 0,
    avgCharge: normal.length ? Math.round((totalCharge / normal.length) * 100) / 100 : 0,
    totalMeters: Math.round(totalMeters * 10) / 10,
  };
}

interface ToleranceSpec {
  key: string;
  label: string;
  unit: string;
  tolerance: number;
  get: (s: DesignStats) => number;
}

const METRICS: ToleranceSpec[] = [
  { key: 'totalHoles', label: '炮孔总数', unit: '个', tolerance: 20, get: (s) => s.totalHoles },
  { key: 'effectiveHoles', label: '有效炮孔数', unit: '个', tolerance: 20, get: (s) => s.effectiveHoles },
  { key: 'totalCharge', label: '总装药量', unit: 'kg', tolerance: 500, get: (s) => s.totalCharge },
  { key: 'avgDepth', label: '平均孔深', unit: 'm', tolerance: 0.3, get: (s) => s.avgDepth },
  { key: 'avgCharge', label: '平均单孔装药', unit: 'kg', tolerance: 2, get: (s) => s.avgCharge },
  { key: 'totalMeters', label: '总钻孔进尺', unit: 'm', tolerance: 100, get: (s) => s.totalMeters },
];

export function diffDesigns(oldD: BlastDesign, newD: BlastDesign): VersionDiff {
  const oldStats = computeStats(oldD);
  const newStats = computeStats(newD);
  const metrics: DiffMetric[] = METRICS.map((m) => {
    const oldValue = m.get(oldStats);
    const newValue = m.get(newStats);
    const delta = Math.round((newValue - oldValue) * 100) / 100;
    return {
      key: m.key,
      label: m.label,
      oldValue,
      newValue,
      delta,
      unit: m.unit,
      tolerance: m.tolerance,
      outOfTolerance: Math.abs(delta) > m.tolerance,
    };
  });
  const oldIds = new Set(oldD.holes.map((h) => h.code));
  const newIds = new Set(newD.holes.map((h) => h.code));
  return {
    oldVersion: oldD.version,
    newVersion: newD.version,
    metrics,
    addedHoles: newD.holes.filter((h) => !oldIds.has(h.code)).length,
    removedHoles: oldD.holes.filter((h) => !newIds.has(h.code)).length,
  };
}
