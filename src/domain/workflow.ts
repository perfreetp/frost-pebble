import type { Order, OrderStatus, Role, User } from './types';

export const STATUS_META: Record<OrderStatus, { label: string; tone: string }> = {
  pending: { label: '待派', tone: 'slate' },
  working: { label: '施工中', tone: 'blue' },
  qc: { label: '待质检', tone: 'amber' },
  passed: { label: '已通过', tone: 'green' },
  rework: { label: '退回整改', tone: 'red' },
};

/** 允许的状态流转 — 越级流转一律拒绝 */
export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['working'],
  working: ['qc'],
  qc: ['passed', 'rework'],
  rework: ['working', 'qc'],
  passed: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

const DAY = 86_400_000;

export const USERS: User[] = [
  { id: 'u-clerk', name: '周敏', role: 'clerk', title: '前台派单员' },
  { id: 'u-f1', name: '梁建国', role: 'foreman', title: '施工班组长' },
  { id: 'u-f2', name: '郑海涛', role: 'foreman', title: '施工班组长' },
  { id: 'u-f3', name: '马小军', role: 'foreman', title: '施工班组长' },
  { id: 'u-qc', name: '何玉兰', role: 'inspector', title: '质量检验员' },
];

export function userById(id: string | null): User | null {
  return USERS.find((u) => u.id === id) ?? null;
}

export function usersByRole(role: Role): User[] {
  return USERS.filter((u) => u.role === role);
}

export const FOREMEN = USERS.filter((u) => u.role === 'foreman');

export function orderDeadline(createdAt: number, floors: number, buildings: number): number {
  return createdAt + (5 + floors * 0.6 + buildings * 1.2) * DAY;
}

export function daysBetween(a: number, b: number): number {
  return Math.max(0, (b - a) / DAY);
}

/** 逾期单据：未完结按当前时间比交期，已完结按完工时间比交期 */
export function isOverdue(order: Order, now: number): boolean {
  if (order.status === 'passed') return order.completedAt !== null && order.completedAt > order.deadline;
  return now > order.deadline;
}

/**
 * 逾期天数：已完单按完工日计，未完单按当前日期计。
 * 逾期即至少 1 天，因此向上取整，避免出现「逾期 0 天」。
 */
export function overdueDays(order: Order, now: number): number {
  const ref = order.status === 'passed' ? order.completedAt ?? now : now;
  const diff = ref - order.deadline;
  if (diff <= 0) return 0;
  return Math.max(1, Math.ceil(diff / 86_400_000));
}

export function fmtDate(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function fmtDateTime(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${fmtDate(ts)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function relDays(ts: number, now: number): string {
  const diff = Math.round((ts - now) / DAY);
  if (diff === 0) return '今天';
  if (diff > 0) return `${diff} 天后`;
  return `${-diff} 天前`;
}
