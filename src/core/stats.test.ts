import { describe, expect, it } from 'vitest';
import type { ProjectData, TubeElement } from '../types';
import { createProject } from './defaults';
import { computeQuote, computeStats, connectorJoints, pickTransformer } from './stats';
import { v } from './geometry';

function tube(id: string, pts: [number, number][], diameter = 8, radii?: number[]): TubeElement {
  return {
    id, kind: 'tube-single', color: { r: 255, g: 0, b: 0 },
    points: pts.map(([x, y]) => v(x, y)),
    diameter,
    cornerRadii: radii ?? pts.slice(1, -1).map(() => diameter * 3),
  };
}

function proj(elements: ProjectData['elements']): ProjectData {
  const p = createProject();
  p.elements = elements;
  return p;
}

describe('connectorJoints —— 单根超 2.4m 接头规则', () => {
  it('2.4m 内无接头', () => {
    expect(connectorJoints(2400, 2400)).toBe(0);
    expect(connectorJoints(100, 2400)).toBe(0);
  });
  it('超过 2.4m：每多一段加一个接头', () => {
    expect(connectorJoints(2401, 2400)).toBe(1);
    expect(connectorJoints(4800, 2400)).toBe(1);
    expect(connectorJoints(5000, 2400)).toBe(2);
    expect(connectorJoints(7200, 2400)).toBe(2);
    expect(connectorJoints(7300, 2400)).toBe(3);
  });
});

describe('折弯半径告警', () => {
  it('半径 < 直径 2 倍标红，合规不告警', () => {
    const bad = tube('t1', [[0, 0], [100, 0], [100, 100]], 8, [10]); // 10 < 16
    const ok = tube('t2', [[0, 0], [100, 0], [100, 100]], 8, [20]);
    const stats = computeStats(proj([bad, ok]));
    expect(stats.radiusWarnings).toHaveLength(1);
    expect(stats.radiusWarnings[0].id).toBe('t1');
    expect(stats.radiusWarnings[0].min).toBe(16);
  });
});

describe('变压器选型与带载余量', () => {
  it('按 80% 余量选最小档', () => {
    const p = createProject();
    // 60VA × 0.8 = 48W；40W 应选 60VA
    const pick = pickTransformer(40, p.settings);
    expect(pick.capacityVA).toBe(60);
    expect(pick.overloaded).toBe(false);
    // 50W 超过 60VA 余量，应升 100VA
    const pick2 = pickTransformer(50, p.settings);
    expect(pick2.capacityVA).toBe(100);
  });

  it('超过最大档标记超载并给出建议容量', () => {
    const p = createProject();
    const pick = pickTransformer(1000, p.settings);
    expect(pick.overloaded).toBe(true);
    expect(pick.suggestVA).toBeGreaterThanOrEqual(Math.ceil(1000 / 0.8 / 50) * 50);
  });

  it('多元素贪心装箱到多台变压器', () => {
    // 每根 3m → 27W；造 10 根 = 270W，应分多台
    const els = Array.from({ length: 10 }, (_, i) =>
      tube('t' + i, [[0, i * 10], [3000, i * 10]], 8, []));
    const stats = computeStats(proj(els));
    expect(stats.transformers.length).toBeGreaterThan(1);
    const totalLoad = stats.transformers.reduce((s, t) => s + t.loadW, 0);
    expect(totalLoad).toBeCloseTo(270, 5);
    expect(stats.totalWatts).toBeCloseTo(270, 5);
  });
});

describe('统计与报价', () => {
  it('总长、接头数、报价合计一致', () => {
    const p = proj([tube('long', [[0, 0], [5000, 0]], 8, [])]); // 5m → 2 接头（2.4+0.2+2.4）
    const stats = computeStats(p);
    expect(stats.totalTubeM).toBeCloseTo(5, 5);
    expect(stats.connectorCount).toBe(2);
    const quote = computeQuote(p, stats);
    const tubeLine = quote.lines.find((l) => l.item.includes('单色'));
    expect(tubeLine?.qty).toBeCloseTo(5, 2);
    expect(quote.total).toBeGreaterThan(tubeLine!.amount);
  });
});
