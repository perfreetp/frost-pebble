import type { BoardStats, ForemanStat, Order, OrderStatus } from './types';
import { isOverdue, relDays } from './workflow';
import { generateLayout } from './layout';

export const RECTIFY_CODES: { code: string; text: string }[] = [
  { code: 'R01', text: '表箱箱体固定不牢，缺少膨胀螺栓' },
  { code: 'R02', text: '立管卡箍间距超过 2 m' },
  { code: 'R03', text: '立管穿墙处未做套管封堵' },
  { code: 'R04', text: '表箱进线弯曲半径不足' },
  { code: 'R05', text: '管道防腐漆漏涂，局部锈斑' },
  { code: 'R06', text: '表箱与燃气具水平净距不足 0.3 m' },
  { code: 'R07', text: '立管未按分段支撑设置固定支架' },
  { code: 'R08', text: '现场实测标高与排布图偏差超过 50 mm' },
];

export function rectifyText(code: string): string {
  return RECTIFY_CODES.find((r) => r.code === code)?.text ?? code;
}

const DAY = 86_400_000;

function monthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string): string {
  return `${Number(key.slice(5))} 月`;
}

/** 看板统计：全部由订单数组纯函数推导，便于测试 */
export function computeBoard(orders: Order[], foremen: { id: string; name: string; title: string }[], now: number): BoardStats {
  const boxTotal = orders.reduce((sum, o) => {
    const model = generateLayout(o.params, o.overrides);
    return sum + model.boxes.length;
  }, 0);

  const statusSeries: { status: OrderStatus; count: number }[] = (
    ['pending', 'working', 'qc', 'passed', 'rework'] as OrderStatus[]
  ).map((status) => ({ status, count: orders.filter((o) => o.status === status).length }));

  const foremanStats: ForemanStat[] = foremen.map((f) => {
    const mine = orders.filter((o) => o.assigneeId === f.id);
    const completed = mine.filter((o) => o.status === 'passed');
    const reworked = mine.filter((o) => o.reworkCount > 0);
    const active = mine.filter((o) => o.status === 'working' || o.status === 'qc' || o.status === 'rework');
    const overdue = mine.filter((o) => isOverdue(o, now));
    const avg =
      completed.length === 0
        ? null
        : completed.reduce((s, o) => s + Math.max(0, ((o.completedAt ?? now) - o.createdAt) / DAY), 0) / completed.length;
    return {
      userId: f.id,
      name: f.name,
      title: f.title,
      assigned: mine.length,
      active: active.length,
      completed: completed.length,
      reworkedOrders: reworked.length,
      reworkRate: mine.length === 0 ? 0 : reworked.length / mine.length,
      overdue: overdue.length,
      avgDays: avg === null ? null : Math.round(avg * 10) / 10,
    };
  });

  // 最近 6 个月（以 now 所在月为末月）
  const months: { key: string; label: string; passed: number; rework: number; completed: number }[] = [];
  const nowDate = new Date(now);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(nowDate.getFullYear(), nowDate.getMonth() - i, 1);
    months.push({ key: monthKey(d.getTime()), label: monthLabel(monthKey(d.getTime())), passed: 0, rework: 0, completed: 0 });
  }
  for (const o of orders) {
    if (o.status !== 'passed' || o.completedAt === null) continue;
    const key = monthKey(o.completedAt);
    const m = months.find((x) => x.key === key);
    if (!m) continue;
    m.passed += 1;
    m.completed += 1;
    if (o.reworkCount > 0) m.rework += 1;
  }

  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    working: orders.filter((o) => o.status === 'working').length,
    qc: orders.filter((o) => o.status === 'qc').length,
    passed: orders.filter((o) => o.status === 'passed').length,
    rework: orders.filter((o) => o.status === 'rework').length,
    overdue: orders.filter((o) => isOverdue(o, now)).length,
    sampled: orders.filter((o) => o.qcSampled).length,
    inspected: orders.filter((o) => o.qcRounds.some((r) => r.sampled)).length,
    reworkTotal: orders.reduce((s, o) => s + o.reworkCount, 0),
    totalHouseholds: orders.reduce((s, o) => s + o.params.buildingCount * o.params.floors * o.params.householdsPerFloor, 0),
    totalBoxes: boxTotal,
    foremen: foremanStats,
    statusSeries,
    monthly: months,
  };
}

export function dueLabel(order: Order, now: number): { text: string; overdue: boolean; soon: boolean } {
  if (order.status === 'passed') {
    const late = order.completedAt !== null && order.completedAt > order.deadline;
    return { text: late ? '逾期完成' : '按期完成', overdue: late, soon: false };
  }
  const overdue = now > order.deadline;
  const soon = !overdue && order.deadline - now < 2 * DAY;
  return { text: relDays(order.deadline, now), overdue, soon };
}
