import { describe, expect, it } from 'vitest';
import { validatePlacement, simulateRun, planWarnings } from '../src/game/engine';
import type { Assignment, Scenario } from '../src/game/types';

const scenario: Scenario = {
  id: 'test',
  title: '测试',
  tier: 'beginner',
  brief: '',
  startClockMin: 360,
  horizonMin: 300,
  ontimeTolMin: 20,
  berths: [
    { id: 'shallow', name: '浅水泊', maxDraftM: 8, lengthM: 180 },
    { id: 'deep', name: '深水泊', maxDraftM: 15, lengthM: 350 },
  ],
  ships: [
    {
      id: 's1',
      name: '甲',
      lengthM: 150,
      draftM: 7,
      etaMin: 0,
      tideFromMin: 0,
      tideToMin: 200,
      mooringMin: 60,
      tugsNeeded: 1,
      cargo: '',
    },
    {
      id: 's3',
      name: '丙',
      lengthM: 140,
      draftM: 6.5,
      etaMin: 90,
      tideFromMin: 90,
      tideToMin: 300,
      mooringMin: 60,
      tugsNeeded: 1,
      cargo: '',
    },
    {
      id: 's2',
      name: '乙',
      lengthM: 200,
      draftM: 11,
      etaMin: 20,
      tideFromMin: 20,
      tideToMin: 260,
      mooringMin: 60,
      tugsNeeded: 2,
      cargo: '',
    },
  ],
  pilots: [
    { id: 'p1', name: '引航甲' },
    { id: 'p2', name: '引航乙' },
  ],
  tugs: [
    { id: 't1', name: '拖1', powerTon: 3000 },
    { id: 't2', name: '拖2', powerTon: 3000 },
    { id: 't3', name: '拖3', powerTon: 3000 },
    { id: 't4', name: '拖4', powerTon: 3000 },
  ],
  tide: [
    { min: 0, heightM: 4 },
    { min: 300, heightM: 3 },
  ],
};

const assignment = (over: Partial<Assignment>): Assignment => ({
  id: 'a1',
  shipId: 's1',
  berthId: 'shallow',
  pilotId: 'p1',
  tugIds: ['t1'],
  startMin: 0,
  ...over,
});

const check = (a: Assignment, existing: Assignment[] = []) =>
  validatePlacement(
    scenario,
    existing,
    { shipId: a.shipId, berthId: a.berthId, pilotId: a.pilotId, tugIds: a.tugIds, startMin: a.startMin },
    a.id,
  );

describe('硬规则拦截', () => {
  it('吃水超限', () => {
    const issue = check(assignment({ shipId: 's2', startMin: 30 }));
    expect(issue?.rule).toBe('draft');
    expect(issue?.message).toContain('吃水');
  });

  it('船长超限', () => {
    const issue = check(assignment({ berthId: 'shallow', startMin: 0 }), []);
    expect(issue).toBeNull();
    // 乙船 200m 放不进 180m 泊位
    const issue2 = validatePlacement(scenario, [], {
      shipId: 's2',
      berthId: 'shallow',
      pilotId: 'p1',
      tugIds: [],
      startMin: 30,
    });
    // 先触发吃水（11 > 8）；换一个吃水合规但船长超限的场景
    expect(issue2?.rule).toBe('draft');
    const tallScenario: Scenario = {
      ...scenario,
      berths: [{ id: 'short', name: '短泊', maxDraftM: 20, lengthM: 100 }],
    };
    const issue3 = validatePlacement(tallScenario, [], {
      shipId: 's1',
      berthId: 'short',
      pilotId: 'p1',
      tugIds: [],
      startMin: 0,
    });
    expect(issue3?.rule).toBe('berth-length');
    expect(issue3?.message).toContain('船长');
  });

  it('早于 ETA', () => {
    const issue = validatePlacement(scenario, [], {
      shipId: 's2',
      berthId: 'deep',
      pilotId: 'p1',
      tugIds: [],
      startMin: 0,
    });
    expect(issue?.rule).toBe('eta');
  });

  it('潮窗未开 / 关闭', () => {
    const early = validatePlacement(
      scenario,
      [],
      { shipId: 's2', berthId: 'deep', pilotId: 'p1', tugIds: [], startMin: 10 },
      undefined,
    );
    // eta 20 → 先触发 ETA；用一条潮窗晚于 ETA 的船
    const tideBound: Scenario = {
      ...scenario,
      ships: scenario.ships.map((s) => (s.id === 's2' ? { ...s, tideFromMin: 40 } : s)),
    };
    const issue = validatePlacement(tideBound, [], {
      shipId: 's2',
      berthId: 'deep',
      pilotId: 'p1',
      tugIds: [],
      startMin: 25,
    });
    expect(issue?.rule).toBe('tide-window');
    expect(early).not.toBeNull();
  });

  it('作业结束晚于潮窗关闭', () => {
    const issue = validatePlacement(
      scenario,
      [],
      { shipId: 's2', berthId: 'deep', pilotId: 'p1', tugIds: [], startMin: 210 },
      undefined,
    );
    expect(issue?.rule).toBe('tide-window');
    expect(issue?.message).toContain('潮窗');
  });

  it('超出训练时限', () => {
    const long: Scenario = { ...scenario, horizonMin: 100 };
    const issue = validatePlacement(long, [], {
      shipId: 's1',
      berthId: 'shallow',
      pilotId: 'p1',
      tugIds: [],
      startMin: 50,
    });
    expect(issue?.rule).toBe('horizon');
  });

  it('同一船重复排', () => {
    const first = assignment({ id: 'a1', startMin: 0 });
    const issue = validatePlacement(
      scenario,
      [first],
      { shipId: 's1', berthId: 'deep', pilotId: 'p2', tugIds: [], startMin: 100 },
      'a2',
    );
    expect(issue?.rule).toBe('duplicate-ship');
  });

  it('泊位时段重叠（含清泊时间）', () => {
    const first = assignment({ id: 'a1', startMin: 0 });
    // s1 作业 0-60，清泊 10 分钟 → 70 之前不能再放
    const overlapScenario: Scenario = {
      ...scenario,
      ships: scenario.ships.map((s) => (s.id === 's3' ? { ...s, etaMin: 0, tideFromMin: 0 } : s)),
    };
    const issue = validatePlacement(
      overlapScenario,
      [first],
      { shipId: 's3', berthId: 'shallow', pilotId: 'p2', tugIds: [], startMin: 65 },
      'a2',
    );
    expect(issue?.rule).toBe('berth-overlap');
    expect(issue?.message).toContain('清泊');
  });

  it('引航员时段重叠（含转场）', () => {
    const first = assignment({ id: 'a1', startMin: 0 });
    const issue = validatePlacement(
      scenario,
      [first],
      { shipId: 's2', berthId: 'deep', pilotId: 'p1', tugIds: [], startMin: 65 },
      'a2',
    );
    expect(issue?.rule).toBe('pilot-overlap');
    expect(issue?.message).toContain('转场');
  });

  it('换引航员后通过', () => {
    const first = assignment({ id: 'a1', startMin: 0 });
    const issue = validatePlacement(
      scenario,
      [first],
      { shipId: 's2', berthId: 'deep', pilotId: 'p2', tugIds: [], startMin: 70 },
      'a2',
    );
    expect(issue).toBeNull();
  });
});

describe('软性提示', () => {
  it('未指派引航员与拖轮不足', () => {
    const warnings = planWarnings(scenario, [
      assignment({ shipId: 's2', berthId: 'deep', pilotId: null, tugIds: ['t1'], startMin: 30 }),
    ]);
    expect(warnings.some((w) => w.rule === 'pilot-pending')).toBe(true);
    expect(warnings.some((w) => w.rule === 'tug-shortage')).toBe(true);
    expect(warnings.some((w) => w.rule === 'unassigned-ship' && w.shipId === 's1')).toBe(true);
  });

  it('拖轮时段冲突提示', () => {
    const warnings = planWarnings(scenario, [
      assignment({ id: 'a1', shipId: 's1', berthId: 'shallow', pilotId: 'p1', tugIds: ['t1'], startMin: 0 }),
      assignment({ id: 'a2', shipId: 's2', berthId: 'deep', pilotId: 'p2', tugIds: ['t1', 't2'], startMin: 30 }),
    ]);
    expect(warnings.some((w) => w.rule === 'tug-overlap')).toBe(true);
  });
});

describe('推演与计分', () => {
  it('无计划 → 每船一起事故', () => {
    const result = simulateRun(scenario, []);
    expect(result.incidents).toHaveLength(3);
    expect(result.metrics.berthed).toBe(0);
    expect(result.metrics.objective).toBeLessThan(20);
  });

  it('完美计划 → 满分', () => {
    const result = simulateRun(scenario, [
      assignment({ id: 'a1', shipId: 's1', berthId: 'shallow', pilotId: 'p1', tugIds: ['t1'], startMin: 0 }),
      assignment({ id: 'a2', shipId: 's2', berthId: 'deep', pilotId: 'p2', tugIds: ['t3', 't4'], startMin: 20 }),
      assignment({ id: 'a3', shipId: 's3', berthId: 'shallow', pilotId: 'p1', tugIds: ['t1'], startMin: 90 }),
    ]);
    expect(result.incidents).toHaveLength(0);
    expect(result.metrics.onTimeRate).toBe(1);
    expect(result.metrics.objective).toBe(100);
  });

  it('缺引航员 → 该船事故', () => {
    const result = simulateRun(scenario, [
      assignment({ id: 'a1', shipId: 's1', berthId: 'shallow', pilotId: null, tugIds: ['t1'], startMin: 0 }),
    ]);
    expect(result.incidents.map((i) => i.code)).toContain('pilot-missing');
    expect(result.outcomes.find((o) => o.shipId === 's1')?.status).toBe('unassigned');
  });

  it('拖轮不足 → 延误并产生事故', () => {
    const result = simulateRun(scenario, [
      assignment({ id: 'a1', shipId: 's1', berthId: 'shallow', pilotId: 'p1', tugIds: ['t1'], startMin: 0 }),
      assignment({ id: 'a2', shipId: 's2', berthId: 'deep', pilotId: 'p2', tugIds: ['t1'], startMin: 20 }),
    ]);
    expect(result.incidents.some((i) => i.code === 'tug-shortage')).toBe(true);
    const s2 = result.outcomes.find((o) => o.shipId === 's2');
    expect(s2!.actualStartMin).toBeGreaterThan(20);
  });

  it('确定性：同样输入同样输出', () => {
    const plan = [
      assignment({ id: 'a1', shipId: 's1', berthId: 'shallow', pilotId: 'p1', tugIds: ['t1'], startMin: 0 }),
      assignment({ id: 'a2', shipId: 's2', berthId: 'deep', pilotId: 'p2', tugIds: ['t1'], startMin: 30 }),
    ];
    expect(simulateRun(scenario, plan)).toEqual(simulateRun(scenario, plan));
  });

  it('评分拆分等于总分', () => {
    const result = simulateRun(scenario, []);
    const { punctuality, conflict, efficiency } = result.metrics.breakdown;
    expect(Math.abs(punctuality + conflict + efficiency - result.metrics.objective)).toBeLessThan(0.2);
  });
});
