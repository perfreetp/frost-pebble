import { describe, expect, it } from 'vitest';
import { SCENARIOS, referenceAssignments } from '../src/data/scenarios';
import { simulateRun, validatePlacement } from '../src/game/engine';

describe('内置关卡', () => {
  it('关卡数量与船舶数递增', () => {
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(8);
    const beginner = SCENARIOS.filter((s) => s.tier === 'beginner');
    const advanced = SCENARIOS.filter((s) => s.tier === 'advanced');
    expect(beginner.length).toBeGreaterThanOrEqual(4);
    expect(advanced.length).toBeGreaterThanOrEqual(4);
    const counts = beginner.map((s) => s.ships.length);
    expect(counts[0]).toBe(2);
    expect(Math.max(...SCENARIOS.map((s) => s.ships.length))).toBe(8);
  });

  it.each(SCENARIOS.map((s) => [s.id, s] as const))('%s 参考计划通过硬规则校验', (_id, scenario) => {
    const assignments = referenceAssignments(scenario);
    expect(assignments.length).toBe(scenario.ships.length);
    const accepted: typeof assignments = [];
    for (const a of assignments) {
      const issue = validatePlacement(scenario, accepted, {
        shipId: a.shipId,
        berthId: a.berthId,
        pilotId: a.pilotId,
        tugIds: a.tugIds,
        startMin: a.startMin,
      });
      expect(issue, `${scenario.id} ${a.shipId}: ${issue?.message}`).toBeNull();
      accepted.push(a);
    }
  });

  it.each(SCENARIOS.map((s) => [s.id, s] as const))(
    '%s 参考推演零事故且全部靠泊',
    (_id, scenario) => {
      const result = simulateRun(scenario, referenceAssignments(scenario));
      expect(result.incidents.map((i) => i.message)).toEqual([]);
      expect(result.metrics.berthed).toBe(scenario.ships.length);
      // 参考计划应当是一份“优等生”答案
      expect(result.metrics.onTimeRate).toBeGreaterThanOrEqual(
        scenario.tier === 'beginner' ? 0.75 : 0.75,
      );
      expect(result.metrics.objective).toBeGreaterThanOrEqual(80);
    },
  );
});
