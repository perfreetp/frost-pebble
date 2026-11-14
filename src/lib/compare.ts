import type { GlyphVersion, VersionPairMetric } from './types';

export interface PairRow {
  key: string;
  label: string;
  unit: string;
  a: number;
  b: number;
  delta: number;
  pct: number;
  flagged: boolean;
  digits: number;
  /** 越小越好 / 越大越好 / 中性 */
  better?: 'lower' | 'higher' | 'neutral';
  /** 参数类行：仅作参考，不参与 3% 超差判定 */
  meta?: boolean;
}

/** 计算两版之间的关键指标差异；|偏差| > 3% 单独标记 */
export function diffVersions(a: GlyphVersion, b: GlyphVersion): PairRow[] {
  const rows: Array<Omit<PairRow, 'delta' | 'pct' | 'flagged'>> = [
    { key: 'cogX', label: '重心 X', unit: 'em', a: a.metrics.cogX, b: b.metrics.cogX, digits: 1, better: 'neutral' },
    { key: 'cogY', label: '重心 Y', unit: 'em', a: a.metrics.cogY, b: b.metrics.cogY, digits: 1, better: 'neutral' },
    { key: 'inkWidth', label: '字面宽度', unit: 'em', a: a.metrics.inkWidth, b: b.metrics.inkWidth, digits: 1, better: 'neutral' },
    { key: 'inkHeight', label: '字面高度', unit: 'em', a: a.metrics.inkHeight, b: b.metrics.inkHeight, digits: 1, better: 'neutral' },
    { key: 'inkArea', label: '着墨面积', unit: 'sq·em', a: a.metrics.inkArea, b: b.metrics.inkArea, digits: 0, better: 'neutral' },
    { key: 'inkRatio', label: '着墨率', unit: '%', a: a.metrics.inkRatio * 100, b: b.metrics.inkRatio * 100, digits: 1, better: 'neutral' },
    { key: 'weight', label: '字重参数', unit: '', a: a.params.weight, b: b.params.weight, digits: 0, meta: true },
    { key: 'contrast', label: '粗细对比', unit: '%', a: a.params.contrast * 100, b: b.params.contrast * 100, digits: 0, meta: true },
  ];
  return rows.map((r) => {
    const delta = r.b - r.a;
    const pct = r.a === 0 ? (r.b === 0 ? 0 : 100) : (delta / Math.abs(r.a)) * 100;
    return { ...r, delta, pct, flagged: !r.meta && Math.abs(pct) > 3 };
  });
}

export function fmtNum(v: number, digits: number): string {
  if (!Number.isFinite(v)) return '—';
  return v.toFixed(digits);
}
