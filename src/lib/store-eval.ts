import type { Batch, Measurement } from './types';

export interface EvalResult {
  passCount: number;
  passRate: number;
  verdict: 'pass' | 'fail';
  reasons: string[];
  fails: { no: number; why: string[] }[];
  avgDiameter: number;
  avgHeight: number;
}

type Dim = 'dLow' | 'dHigh' | 'hLow' | 'hHigh';

const DIM_TEXT: Record<Dim, string> = {
  dLow: '地径低于下限',
  dHigh: '地径超出上限',
  hLow: '苗高低于下限',
  hHigh: '苗高超出上限',
};

export interface DimStat {
  dim: Dim;
  label: string;
  bound: number;
  unit: string;
  rows: { no: number; value: number }[];
}

/** 按品种批次的地径/苗高区间逐株判定，再按达标率阈值给批次结论 */
export function evaluateMeasurements(
  batch: Batch,
  measurements: Measurement[],
  thresholdPercent: number,
): EvalResult {
  const fails: { no: number; why: string[] }[] = [];
  const stats = new Map<Dim, DimStat>();
  let passCount = 0;
  let sumD = 0;
  let sumH = 0;

  const hit = (dim: Dim, no: number, value: number, bound: number, unit: string) => {
    const cur = stats.get(dim) ?? { dim, label: DIM_TEXT[dim], bound, unit, rows: [] };
    cur.rows.push({ no, value });
    stats.set(dim, cur);
  };

  for (const m of measurements) {
    sumD += m.diameterCm;
    sumH += m.heightCm;
    const why: string[] = [];
    if (m.diameterCm < batch.diameterMin) {
      why.push(`${DIM_TEXT.dLow} ${batch.diameterMin} cm`);
      hit('dLow', m.no, m.diameterCm, batch.diameterMin, 'cm');
    }
    if (m.diameterCm > batch.diameterMax) {
      why.push(`${DIM_TEXT.dHigh} ${batch.diameterMax} cm`);
      hit('dHigh', m.no, m.diameterCm, batch.diameterMax, 'cm');
    }
    if (m.heightCm < batch.heightMin) {
      why.push(`${DIM_TEXT.hLow} ${batch.heightMin} cm`);
      hit('hLow', m.no, m.heightCm, batch.heightMin, 'cm');
    }
    if (m.heightCm > batch.heightMax) {
      why.push(`${DIM_TEXT.hHigh} ${batch.heightMax} cm`);
      hit('hHigh', m.no, m.heightCm, batch.heightMax, 'cm');
    }
    if (why.length) fails.push({ no: m.no, why });
    else passCount += 1;
  }

  const n = Math.max(1, measurements.length);
  const passRate = passCount / n;
  const verdict: 'pass' | 'fail' = passRate * 100 >= thresholdPercent - 1e-9 ? 'pass' : 'fail';

  const reasons: string[] = [];
  if (verdict === 'fail') {
    const order: Dim[] = ['dLow', 'dHigh', 'hLow', 'hHigh'];
    for (const dim of order) {
      const s = stats.get(dim);
      if (!s) continue;
      const detail = s.rows
        .sort((a, b) => a.no - b.no)
        .map((r) => `第${r.no}株 ${r.value.toFixed(1)}${s.unit}`)
        .join('、');
      reasons.push(`${s.label} ${s.bound} ${s.unit}：${detail}（共 ${s.rows.length} 株）`);
    }
    reasons.push(`抽检达标率 ${(passRate * 100).toFixed(1)}%，低于阈值 ${thresholdPercent}%`);
  }

  return {
    passCount,
    passRate,
    verdict,
    reasons,
    fails,
    avgDiameter: measurements.length ? sumD / measurements.length : 0,
    avgHeight: measurements.length ? sumH / measurements.length : 0,
  };
}
