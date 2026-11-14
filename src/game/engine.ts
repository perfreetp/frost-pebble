import {
  BERTH_TURNOVER_MIN,
  EFFICIENCY_WAIT_CAP_MIN,
  NO_PILOT_GRACE_MIN,
  PILOT_TRAVEL_MIN,
  SCORE_WEIGHTS,
  TUG_TURNOVER_MIN,
} from './constants';
import { formatClock } from './tide';
import type {
  Assignment,
  BlockedRule,
  Incident,
  PlanWarning,
  RunMetrics,
  RunResult,
  Scenario,
  Ship,
  ShipOutcome,
} from './types';

/* ---------------------------- 时间工具 ---------------------------- */

export const pad2 = (n: number) => String(Math.round(n)).padStart(2, '0');

/** 相对分钟 → "HH:MM"（按场景起始钟点换算） */
export function clock(scenario: Scenario, min: number): string {
  return formatClock(scenario.startClockMin, min);
}

export function timeRange(scenario: Scenario, from: number, to: number): string {
  return `${clock(scenario, from)}–${clock(scenario, to)}`;
}

/* ---------------------------- 计划校验 ---------------------------- */

export interface Placement {
  shipId: string;
  berthId: string;
  pilotId: string | null;
  tugIds: string[];
  startMin: number;
}

export interface ValidationIssue {
  rule: BlockedRule;
  message: string;
  conflictingAssignmentId?: string;
}

function shipOf(scenario: Scenario, id: string): Ship {
  const ship = scenario.ships.find((s) => s.id === id);
  if (!ship) throw new Error(`未知船舶 ${id}`);
  return ship;
}

function findOverlap(
  a: { start: number; end: number },
  b: { start: number; end: number },
): number {
  return Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));
}

/**
 * 校验一次“把船放到泊位”的动作。
 * 违反硬规则 → 返回 issue，调用方当场拦截并展示 message。
 */
export function validatePlacement(
  scenario: Scenario,
  assignments: Assignment[],
  placement: Placement,
  excludeAssignmentId?: string,
): ValidationIssue | null {
  const ship = shipOf(scenario, placement.shipId);
  const berth = scenario.berths.find((b) => b.id === placement.berthId);
  if (!berth) return { rule: 'berth-length', message: `未知泊位 ${placement.berthId}` };

  const existing = assignments.find(
    (a) => a.shipId === ship.id && a.id !== excludeAssignmentId,
  );
  if (existing) {
    const existingBerth = scenario.berths.find((b) => b.id === existing.berthId);
    return {
      rule: 'duplicate-ship',
      message: `${ship.name} 已经安排在 ${existingBerth?.name ?? existing.berthId}（${clock(
        scenario,
        existing.startMin,
      )}）当前作业中，请不要重复排船。`,
      conflictingAssignmentId: existing.id,
    };
  }

  const start = placement.startMin;
  const end = start + ship.mooringMin;

  if (start < ship.etaMin) {
    return {
      rule: 'eta',
      message: `${ship.name} 预计 ${clock(scenario, ship.etaMin)} 才到锚地，不能提前 ${Math.round(
        ship.etaMin - start,
      )} 分钟开始靠泊（计划开始 ${clock(scenario, start)}）。`,
    };
  }

  if (end > scenario.horizonMin) {
    return {
      rule: 'horizon',
      message: `${ship.name} 的靠泊作业需跨到 ${clock(
        scenario,
        end,
      )}，已超出训练时限 ${clock(scenario, scenario.horizonMin)}。`,
    };
  }

  if (ship.draftM > berth.maxDraftM) {
    return {
      rule: 'draft',
      message: `${ship.name} 吃水 ${ship.draftM.toFixed(1)} m，超过 ${berth.name} 限吃水 ${berth.maxDraftM.toFixed(
        1,
      )} m（超出 ${(ship.draftM - berth.maxDraftM).toFixed(1)} m），会触底。`,
    };
  }

  if (ship.lengthM > berth.lengthM) {
    return {
      rule: 'berth-length',
      message: `${ship.name} 船长 ${ship.lengthM} m，超过 ${berth.name} 可容纳船长 ${berth.lengthM} m。`,
    };
  }

  if (start < ship.tideFromMin) {
    return {
      rule: 'tide-window',
      message: `${ship.name} 的潮窗 ${timeRange(scenario, ship.tideFromMin, ship.tideToMin)} 尚未开启，计划开始 ${clock(
        scenario,
        start,
      )} 时潮高不足，无法进港。最早可排 ${clock(scenario, ship.tideFromMin)}。`,
    };
  }

  if (end > ship.tideToMin) {
    return {
      rule: 'tide-window',
      message: `${ship.name} 错过潮窗：靠泊作业要到 ${clock(scenario, end)} 才结束，但潮窗 ${clock(
        scenario,
        ship.tideToMin,
      )} 关闭，需在 ${clock(scenario, ship.tideToMin)} 前完成靠泊。`,
    };
  }

  // 泊位占用冲突
  for (const other of assignments) {
    if (other.id === excludeAssignmentId) continue;
    if (other.berthId !== berth.id) continue;
    const otherShip = shipOf(scenario, other.shipId);
    const overlap = findOverlap(
      { start, end: end + BERTH_TURNOVER_MIN },
      { start: other.startMin, end: other.startMin + otherShip.mooringMin + BERTH_TURNOVER_MIN },
    );
    if (overlap > 0) {
      return {
        rule: 'berth-overlap',
        message: `${berth.name} 在 ${clock(scenario, other.startMin)}–${clock(
          scenario,
          other.startMin + otherShip.mooringMin,
        )} 已被 ${otherShip.name} 占用，与本次计划重叠 ${Math.round(overlap)} 分钟（含 ${
          BERTH_TURNOVER_MIN
        } 分钟清泊时间）。`,
        conflictingAssignmentId: other.id,
      };
    }
  }

  // 引航员时间冲突（含登船/离船转场）
  if (placement.pilotId) {
    const pilot = scenario.pilots.find((p) => p.id === placement.pilotId);
    for (const other of assignments) {
      if (other.id === excludeAssignmentId) continue;
      if (other.pilotId !== placement.pilotId) continue;
      const otherShip = shipOf(scenario, other.shipId);
      const overlap = findOverlap(
        { start: start - PILOT_TRAVEL_MIN, end: end + PILOT_TRAVEL_MIN },
        {
          start: other.startMin - PILOT_TRAVEL_MIN,
          end: other.startMin + otherShip.mooringMin + PILOT_TRAVEL_MIN,
        },
      );
      if (overlap > 0) {
        return {
          rule: 'pilot-overlap',
          message: `引航员 ${pilot?.name ?? placement.pilotId} 在 ${clock(
            scenario,
            other.startMin,
          )}–${clock(scenario, other.startMin + otherShip.mooringMin)} 正在引 ${otherShip.name}，与本次计划重叠 ${Math.round(
            overlap,
          )} 分钟（含 ${PILOT_TRAVEL_MIN} 分钟转场）。换一位引航员，或错开 ${Math.ceil(
            overlap,
          )} 分钟以上。`,
          conflictingAssignmentId: other.id,
        };
      }
    }
  }

  return null;
}

/** 软性提示：不拦截，但推演时会演变成事故 */
export function planWarnings(scenario: Scenario, assignments: Assignment[]): PlanWarning[] {
  const warnings: PlanWarning[] = [];

  for (const ship of scenario.ships) {
    const a = assignments.find((x) => x.shipId === ship.id);
    if (!a) {
      warnings.push({
        rule: 'unassigned-ship',
        shipId: ship.id,
        message: `${ship.name} 尚未安排泊位，推演时只能留在锚地。`,
      });
      continue;
    }
    if (!a.pilotId) {
      warnings.push({
        rule: 'pilot-pending',
        shipId: ship.id,
        assignmentId: a.id,
        message: `${ship.name} 未指派引航员，无法进港。`,
      });
    }
    if (a.tugIds.length < ship.tugsNeeded) {
      warnings.push({
        rule: 'tug-shortage',
        shipId: ship.id,
        assignmentId: a.id,
        message: `${ship.name} 需要 ${ship.tugsNeeded} 艘拖轮，当前只指派 ${a.tugIds.length} 艘，靠泊会被迫推迟。`,
      });
    }
    if (a.tugIds.length > 0) {
      for (const other of assignments) {
        if (other.id === a.id) continue;
        // 同一对船只报一次
        if (other.id < a.id) continue;
        const otherShip = shipOf(scenario, other.shipId);
        const shared = a.tugIds.filter((t) => other.tugIds.includes(t));
        if (shared.length === 0) continue;
        const overlap = findOverlap(
          { start: a.startMin - TUG_TURNOVER_MIN, end: a.startMin + ship.mooringMin + TUG_TURNOVER_MIN },
          {
            start: other.startMin - TUG_TURNOVER_MIN,
            end: other.startMin + otherShip.mooringMin + TUG_TURNOVER_MIN,
          },
        );
        if (overlap > 0) {
          const names = shared
            .map((id) => scenario.tugs.find((t) => t.id === id)?.name ?? id)
            .join('、');
          warnings.push({
            rule: 'tug-overlap',
            assignmentId: a.id,
            shipId: ship.id,
            message: `${names} 同时被 ${ship.name} 与 ${otherShip.name} 占用，重叠 ${Math.round(
              overlap,
            )} 分钟，推演时会产生连锁延误。`,
          });
        }
      }
    }
  }

  return warnings;
}

/* ---------------------------- 推演 ---------------------------- */

/** 缺一艘拖轮导致的固定延误（分钟/艘） */
export const TUG_SHORTAGE_DELAY_MIN = 35;
/** 未指派引航员时，船在锚地的最大等待（超过即判定误船） */
export const PILOT_MISS_AFTER_MIN = NO_PILOT_GRACE_MIN;

interface ResourceState {
  /** 资源空闲时刻 */
  freeAt: number;
  /** 上一次服务的船名，用于事故描述 */
  lastShipName: string;
}

/**
 * 按计划推演。确定性：同样的计划永远得到同样的结果。
 * 结果里的每起事故都能追溯到具体规则。
 */
export function simulateRun(scenario: Scenario, assignments: Assignment[]): RunResult {
  const incidents: Incident[] = [];
  const outcomes = new Map<string, ShipOutcome>();
  const incidentsByShip = new Map<string, string[]>();

  const addIncident = (
    code: Incident['code'],
    timeMin: number,
    message: string,
    shipIds: string[],
  ) => {
    const inc: Incident = {
      id: `inc-${incidents.length + 1}`,
      code,
      timeMin,
      message,
      shipIds,
      severity: 'error',
    };
    incidents.push(inc);
    for (const sid of shipIds) {
      const list = incidentsByShip.get(sid) ?? [];
      list.push(inc.id);
      incidentsByShip.set(sid, list);
    }
  };

  const berthState = new Map<string, ResourceState>();
  for (const b of scenario.berths) berthState.set(b.id, { freeAt: -Infinity, lastShipName: '' });
  const pilotState = new Map<string, ResourceState>();
  for (const p of scenario.pilots) pilotState.set(p.id, { freeAt: -Infinity, lastShipName: '' });
  const tugState = new Map<string, ResourceState>();
  for (const t of scenario.tugs) tugState.set(t.id, { freeAt: -Infinity, lastShipName: '' });

  // 有计划的船按计划开始时刻排序；无计划的船在锚地等待
  const ordered = [...assignments]
    .map((a) => ({ a, ship: shipOf(scenario, a.shipId) }))
    .sort((x, y) => x.a.startMin - y.a.startMin || x.ship.etaMin - y.ship.etaMin);

  for (const ship of scenario.ships) {
    if (!assignments.some((a) => a.shipId === ship.id)) {
      outcomes.set(ship.id, {
        shipId: ship.id,
        shipName: ship.name,
        status: 'unassigned',
        plannedStartMin: null,
        actualStartMin: null,
        berthId: null,
        pilotId: null,
        waitMin: Math.max(0, scenario.horizonMin - ship.etaMin),
        delayMin: Math.max(0, scenario.horizonMin - ship.etaMin),
      });
      addIncident(
        'unassigned',
        ship.etaMin,
        `${ship.name} 始终未安排靠泊，在锚地空等到训练结束。`,
        [ship.id],
      );
    }
  }

  for (const { a, ship } of ordered) {
    const berth = scenario.berths.find((b) => b.id === a.berthId);
    const berthName = berth?.name ?? a.berthId;
    if (!berth) continue;

    if (!a.pilotId) {
      outcomes.set(ship.id, {
        shipId: ship.id,
        shipName: ship.name,
        status: 'unassigned',
        plannedStartMin: a.startMin,
        actualStartMin: null,
        berthId: berth.id,
        pilotId: null,
        waitMin: Math.max(0, scenario.horizonMin - ship.etaMin),
        delayMin: Math.max(0, scenario.horizonMin - ship.etaMin),
      });
      addIncident(
        'pilot-missing',
        a.startMin,
        `${ship.name} 计划 ${clock(scenario, a.startMin)} 靠 ${berthName}，但未指派引航员，无法进港，滞留在锚地。`,
        [ship.id],
      );
      continue;
    }

    const pilot = scenario.pilots.find((p) => p.id === a.pilotId);
    const pilotStateRef = pilotState.get(a.pilotId);

    let start = Math.max(a.startMin, ship.etaMin);
    let delayedFromPlan = false;

    // 拖轮不足 → 硬延误
    const missingTugs = Math.max(0, ship.tugsNeeded - a.tugIds.length);
    if (missingTugs > 0) {
      const penalty = missingTugs * TUG_SHORTAGE_DELAY_MIN;
      start += penalty;
      delayedFromPlan = true;
      addIncident(
        'tug-shortage',
        a.startMin,
        `${ship.name} 需要 ${ship.tugsNeeded} 艘拖轮，实际只到 ${a.tugIds.length} 艘，在泊位外等待拖轮 ${penalty} 分钟。`,
        [ship.id],
      );
    }

    // 拖轮被别的船占用 → 连锁延误
    let tugRelease = -Infinity;
    let tugBlocker = '';
    for (const tid of a.tugIds) {
      const st = tugState.get(tid);
      if (!st) continue;
      const ready = st.freeAt + (st.freeAt === -Infinity ? 0 : TUG_TURNOVER_MIN);
      if (ready > start && ready > tugRelease) {
        tugRelease = ready;
        tugBlocker = st.lastShipName;
      }
    }
    if (tugRelease > start && tugRelease !== Infinity) {
      const wait = Math.round(tugRelease - start);
      start = tugRelease;
      delayedFromPlan = true;
      addIncident(
        'tug-chain',
        Math.round(tugRelease),
        `${ship.name} 的拖轮仍在 ${tugBlocker || '上一船'} 作业，需再等 ${wait} 分钟才能就位。`,
        [ship.id],
      );
    }

    // 引航员被上一船拖住（计划不重叠，但上游延误可能造成连锁）
    if (pilotStateRef && pilotStateRef.freeAt !== -Infinity) {
      const ready = pilotStateRef.freeAt + PILOT_TRAVEL_MIN;
      if (ready > start) {
        const wait = Math.round(ready - start);
        start = ready;
        delayedFromPlan = true;
        addIncident(
          'pilot-chain',
          Math.round(ready),
          `引航员 ${pilot?.name ?? a.pilotId} 刚引完 ${pilotStateRef.lastShipName}，还需 ${PILOT_TRAVEL_MIN} 分钟转场，${ship.name} 等待 ${wait} 分钟。`,
          [ship.id, ...scenario.ships.filter((s) => s.name === pilotStateRef.lastShipName).map((s) => s.id)],
        );
      }
    }

    // 泊位被上一船拖住
    const bState = berthState.get(berth.id)!;
    if (bState.freeAt !== -Infinity) {
      const ready = bState.freeAt + BERTH_TURNOVER_MIN;
      if (ready > start) {
        const wait = Math.round(ready - start);
        start = ready;
        delayedFromPlan = true;
        addIncident(
          'berth-chain',
          Math.round(ready),
          `${berthName} 尚未清泊完毕，${ship.name} 需等待 ${wait} 分钟才能靠泊。`,
          [ship.id],
        );
      }
    }

    // 潮窗
    if (start < ship.tideFromMin) start = ship.tideFromMin;
    const end = start + ship.mooringMin;
    if (end > ship.tideToMin) {
      outcomes.set(ship.id, {
        shipId: ship.id,
        shipName: ship.name,
        status: 'missed',
        plannedStartMin: a.startMin,
        actualStartMin: null,
        berthId: berth.id,
        pilotId: a.pilotId,
        waitMin: Math.max(0, ship.tideToMin - ship.etaMin),
        delayMin: Math.max(0, ship.tideToMin - ship.etaMin),
      });
      addIncident(
        'tide-delay',
        ship.tideToMin,
        `${ship.name} 延误后到 ${clock(scenario, start)} 才能进港，潮窗 ${clock(
          scenario,
          ship.tideToMin,
        )} 关闭，错过进港窗口。`,
        [ship.id],
      );
      continue;
    }

    if (start > scenario.horizonMin) {
      outcomes.set(ship.id, {
        shipId: ship.id,
        shipName: ship.name,
        status: 'missed',
        plannedStartMin: a.startMin,
        actualStartMin: null,
        berthId: berth.id,
        pilotId: a.pilotId,
        waitMin: Math.max(0, scenario.horizonMin - ship.etaMin),
        delayMin: Math.max(0, scenario.horizonMin - ship.etaMin),
      });
      addIncident(
        'overrun',
        scenario.horizonMin,
        `${ship.name} 的计划推迟到 ${clock(scenario, start)}，超出训练时限 ${clock(
          scenario,
          scenario.horizonMin,
        )}。`,
        [ship.id],
      );
      continue;
    }

    // 靠泊成功
    const wait = Math.max(0, start - ship.etaMin);
    const late = wait > scenario.ontimeTolMin;
    outcomes.set(ship.id, {
      shipId: ship.id,
      shipName: ship.name,
      status: late ? 'late' : 'on-time',
      plannedStartMin: a.startMin,
      actualStartMin: start,
      berthId: berth.id,
      pilotId: a.pilotId,
      waitMin: wait,
      delayMin: Math.max(0, start - a.startMin),
    });

    bState.freeAt = end;
    bState.lastShipName = ship.name;
    if (pilotStateRef) {
      pilotStateRef.freeAt = end;
      pilotStateRef.lastShipName = ship.name;
    }
    for (const tid of a.tugIds) {
      const st = tugState.get(tid);
      if (!st) continue;
      if (end > st.freeAt) {
        st.freeAt = end;
        st.lastShipName = ship.name;
      }
    }
    if (delayedFromPlan) {
      // 延误已作为独立事故逐条记录（tug-shortage / tug-chain / pilot-chain / berth-chain）
    }
  }

  const outcomeList = scenario.ships
    .map((s) => outcomes.get(s.id))
    .filter((o): o is ShipOutcome => Boolean(o));

  const ships = scenario.ships.length;
  const berthed = outcomeList.filter((o) => o.status === 'on-time' || o.status === 'late').length;
  const onTimeCount = outcomeList.filter((o) => o.status === 'on-time').length;
  const waited = outcomeList.reduce((sum, o) => sum + o.waitMin, 0);
  const avgWaitMin = ships === 0 ? 0 : waited / ships;

  const punctuality = (onTimeCount / Math.max(1, ships)) * SCORE_WEIGHTS.punctuality;
  const conflict = Math.max(0, SCORE_WEIGHTS.conflict - incidents.length * 8);
  const efficiency =
    Math.max(0, Math.min(1, 1 - avgWaitMin / EFFICIENCY_WAIT_CAP_MIN)) * SCORE_WEIGHTS.efficiency;

  const metrics: RunMetrics = {
    ships,
    berthed,
    onTimeCount,
    onTimeRate: ships === 0 ? 0 : onTimeCount / ships,
    incidentCount: incidents.length,
    avgWaitMin,
    objective: Math.round((punctuality + conflict + efficiency) * 10) / 10,
    breakdown: {
      punctuality: Math.round(punctuality * 10) / 10,
      conflict: Math.round(conflict * 10) / 10,
      efficiency: Math.round(efficiency * 10) / 10,
    },
  };

  return { outcomes: outcomeList, incidents, metrics };
}

/** 供回放使用：每条事故挂在开始时刻，便于时间轴标记 */
export function incidentsForShip(result: RunResult, shipId: string): Incident[] {
  return result.incidents.filter((i) => i.shipIds.includes(shipId));
}
