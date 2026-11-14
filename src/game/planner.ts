import {
  BERTH_TURNOVER_MIN,
  PILOT_TRAVEL_MIN,
  TUG_TURNOVER_MIN,
} from './constants';
import type { Assignment, Scenario, Ship } from './types';

interface Interval {
  start: number;
  end: number;
}

const overlaps = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end;

function shipOrderStrategies(ships: Ship[]): Ship[][] {
  const by = (fn: (a: Ship, b: Ship) => number) => [...ships].sort(fn);
  const compares: Array<(a: Ship, b: Ship) => number> = [
    (a, b) => a.tideToMin - b.tideToMin || a.etaMin - b.etaMin,
    (a, b) => a.etaMin - b.etaMin || b.tideToMin - a.tideToMin,
    (a, b) => b.draftM - a.draftM || a.etaMin - b.etaMin,
    (a, b) => b.mooringMin - a.mooringMin || a.etaMin - b.etaMin,
    (a, b) => a.tideToMin - a.tideFromMin - (b.tideToMin - b.tideFromMin) || a.etaMin - b.etaMin,
    (a, b) => b.lengthM - a.lengthM || a.etaMin - b.etaMin,
    (a, b) => a.tideToMin - b.tideToMin || b.mooringMin - a.mooringMin,
    (a, b) => b.tugsNeeded - a.tugsNeeded || a.etaMin - b.etaMin,
  ];
  const orders = compares.map(by);
  orders.push(...orders.map((order) => [...order].reverse()));
  return orders;
}

/**
 * 贪心排程器：为场景生成一组合法计划。
 * - 硬约束：eta / 潮窗 / 吃水 / 船长 / 训练时限 / 泊位·引航员·拖轮不重叠
 * - 目标：在合法前提下让船舶尽量早靠泊
 *
 * 尝试多种排序，取“总等待最短”的方案；返回 null 表示资源不足无解。
 */
export function planScenario(scenario: Scenario): Assignment[] | null {
  let best: Assignment[] | null = null;
  let bestScore = Infinity;
  for (const order of shipOrderStrategies(scenario.ships)) {
    const plan = tryPlan(scenario, order);
    if (!plan) continue;
    const improved = improvePlan(scenario, plan);
    const score = planScore(scenario, improved);
    if (score < bestScore) {
      best = improved;
      bestScore = score;
    }
  }
  return best;
}

/** 对贪心结果做局部改进：逐船摘出后尝试更早插入，直到不再变好。 */
function improvePlan(scenario: Scenario, plan: Assignment[]): Assignment[] {
  let current = plan;
  let score = planScore(scenario, current);
  for (let round = 0; round < 6; round += 1) {
    let improved = false;
    const order = [...current].sort((a, b) => a.startMin - b.startMin);
    for (const item of order) {
      const rest = current.filter((a) => a.shipId !== item.shipId);
      const rebuilt = rebuild(scenario, rest, item.shipId);
      if (!rebuilt) continue;
      const nextScore = planScore(scenario, rebuilt);
      if (nextScore < score - 0.5) {
        current = rebuilt;
        score = nextScore;
        improved = true;
      }
    }
    if (!improved) break;
  }
  return current.sort((a, b) => a.startMin - b.startMin);
}

function rebuild(
  scenario: Scenario,
  existing: Assignment[],
  shipId: string,
): Assignment[] | null {
  const ship = scenario.ships.find((s) => s.id === shipId);
  if (!ship) return null;
  const berthBusy = new Map<string, Interval[]>();
  const pilotBusy = new Map<string, Interval[]>();
  const tugBusy = new Map<string, Interval[]>();
  for (const b of scenario.berths) berthBusy.set(b.id, []);
  for (const p of scenario.pilots) pilotBusy.set(p.id, []);
  for (const t of scenario.tugs) tugBusy.set(t.id, []);
  for (const a of existing) {
    const s = scenario.ships.find((x) => x.id === a.shipId)!;
    const end = a.startMin + s.mooringMin;
    berthBusy.get(a.berthId)?.push({ start: a.startMin, end: end + BERTH_TURNOVER_MIN });
    if (a.pilotId) {
      pilotBusy
        .get(a.pilotId)
        ?.push({ start: a.startMin - PILOT_TRAVEL_MIN, end: end + PILOT_TRAVEL_MIN });
    }
    for (const tid of a.tugIds) {
      tugBusy.get(tid)?.push({ start: a.startMin, end: end + TUG_TURNOVER_MIN });
    }
  }
  const placed = placeShip(scenario, ship, berthBusy, pilotBusy, tugBusy);
  if (!placed) return null;
  return [...existing, placed.assignment];
}

/** 计划质量：总等待 + 误点重罚，用于比较不同排序 */
export function planScore(scenario: Scenario, plan: Assignment[]): number {
  let total = 0;
  for (const a of plan) {
    const ship = scenario.ships.find((s) => s.id === a.shipId);
    if (!ship) continue;
    const wait = Math.max(0, a.startMin - ship.etaMin);
    total += wait;
    if (wait > scenario.ontimeTolMin) {
      total += 600 + (wait - scenario.ontimeTolMin) * 8;
    }
  }
  return total;
}

function tryPlan(scenario: Scenario, order: Ship[]): Assignment[] | null {
  const berthBusy = new Map<string, Interval[]>();
  const pilotBusy = new Map<string, Interval[]>();
  const tugBusy = new Map<string, Interval[]>();
  for (const b of scenario.berths) berthBusy.set(b.id, []);
  for (const p of scenario.pilots) pilotBusy.set(p.id, []);
  for (const t of scenario.tugs) tugBusy.set(t.id, []);

  const result: Assignment[] = [];

  for (const ship of order) {
    const placed = placeShip(scenario, ship, berthBusy, pilotBusy, tugBusy);
    if (!placed) return null;
    result.push(placed.assignment);
  }

  return result.sort((a, b) => a.startMin - b.startMin);
}

function placeShip(
  scenario: Scenario,
  ship: Ship,
  berthBusy: Map<string, Interval[]>,
  pilotBusy: Map<string, Interval[]>,
  tugBusy: Map<string, Interval[]>,
): { assignment: Assignment } | null {
  const minStart = Math.max(ship.etaMin, ship.tideFromMin);
  const latestStart = Math.min(ship.tideToMin - ship.mooringMin, scenario.horizonMin - ship.mooringMin);
  if (latestStart < minStart) return null;

  const candidateBerths = scenario.berths.filter(
    (b) => ship.draftM <= b.maxDraftM && ship.lengthM <= b.lengthM,
  );
  if (candidateBerths.length === 0) return null;

  for (let start = minStart; start <= latestStart; start += 5) {
    const end = start + ship.mooringMin;
    const berthInterval = { start, end: end + BERTH_TURNOVER_MIN };
    const pilotInterval = {
      start: start - PILOT_TRAVEL_MIN,
      end: end + PILOT_TRAVEL_MIN,
    };

    for (const berth of candidateBerths) {
      const busy = berthBusy.get(berth.id)!;
      if (busy.some((iv) => overlaps(iv, berthInterval))) continue;

      for (const pilot of scenario.pilots) {
        const pBusy = pilotBusy.get(pilot.id)!;
        if (pBusy.some((iv) => overlaps(iv, pilotInterval))) continue;

        if (ship.tugsNeeded > scenario.tugs.length) continue;
        const tugChoice = pickTugs(scenario, ship, start, end, tugBusy);
        if (!tugChoice) continue;

        // 接受该方案
        busy.push(berthInterval);
        pBusy.push(pilotInterval);
        for (const tid of tugChoice) {
          tugBusy.get(tid)!.push({ start, end: end + TUG_TURNOVER_MIN });
        }
        return {
          assignment: {
            id: `auto-${ship.id}`,
            shipId: ship.id,
            berthId: berth.id,
            pilotId: pilot.id,
            tugIds: tugChoice,
            startMin: start,
          },
        };
      }
    }
  }

  return null;
}

function pickTugs(
  scenario: Scenario,
  ship: Ship,
  start: number,
  end: number,
  tugBusy: Map<string, Interval[]>,
): string[] | null {
  const busyUntil = (id: string) => {
    const list = tugBusy.get(id)!;
    return list.some((iv) =>
      overlaps(iv, { start, end: end + TUG_TURNOVER_MIN }),
    );
  };
  const free = scenario.tugs.filter((t) => !busyUntil(t.id));
  if (free.length < ship.tugsNeeded) return null;
  // 优先用大马力拖轮
  return [...free]
    .sort((a, b) => b.powerTon - a.powerTon)
    .slice(0, ship.tugsNeeded)
    .map((t) => t.id);
}

/** 判定一组计划是否完整覆盖所有船舶 */
export function planCoversAll(scenario: Scenario, assignments: Assignment[]): boolean {
  return scenario.ships.every((s) => assignments.some((a) => a.shipId === s.id));
}
