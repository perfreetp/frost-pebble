import type { Scenario, TidePoint } from './types';

export const DAY_MIN = 24 * 60;

/** 把“场景相对分钟”转换为钟表文本 HH:MM */
export function formatClock(startClockMin: number, relativeMin: number): string {
  const total = ((Math.round(startClockMin + relativeMin) % DAY_MIN) + DAY_MIN) % DAY_MIN;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDuration(min: number): string {
  if (!Number.isFinite(min)) return '—';
  const rounded = Math.max(0, Math.round(min));
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h === 0) return `${m} 分钟`;
  if (m === 0) return `${h} 小时`;
  return `${h} 小时 ${m} 分`;
}

/** 线性插值计算任意时刻的潮高（米） */
export function tideAt(tide: TidePoint[], minute: number): number {
  if (tide.length === 0) return 0;
  const sorted = [...tide].sort((a, b) => a.min - b.min);
  if (minute <= sorted[0].min) return sorted[0].heightM;
  const last = sorted[sorted.length - 1];
  if (minute >= last.min) return last.heightM;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const next = sorted[i];
    if (minute <= next.min) {
      const span = next.min - prev.min || 1;
      const ratio = (minute - prev.min) / span;
      return prev.heightM + (next.heightM - prev.heightM) * ratio;
    }
  }
  return last.heightM;
}

/** 潮高首次达到/超过阈值的区间（用于教师出题时一键生成潮窗） */
export function tideWindowsAbove(tide: TidePoint[], thresholdM: number): Array<{ from: number; to: number }> {
  const sorted = [...tide].sort((a, b) => a.min - b.min);
  const result: Array<{ from: number; to: number }> = [];
  let open: number | null = null;
  for (const point of sorted) {
    if (point.heightM >= thresholdM && open === null) open = point.min;
    if (point.heightM < thresholdM && open !== null) {
      result.push({ from: open, to: point.min });
      open = null;
    }
  }
  if (open !== null) result.push({ from: open, to: sorted[sorted.length - 1].min });
  return result;
}

/** 场景推演结束时刻（相对分钟） */
export function scenarioEndMin(scenario: Scenario): number {
  return scenario.horizonMin;
}
