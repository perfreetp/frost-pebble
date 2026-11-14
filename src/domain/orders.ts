import type { AuditEntry, LayoutModel, Order, Overrides, Role, User, Vec3 } from './types';
import { generateLayout } from './layout';
import { stableHash } from './prng';

/**
 * 生成审计条目。id 由内容 + 时间派生，因此是纯函数：
 * React StrictMode 或重放同一操作都不会产生重复/分叉的日志。
 */
export function makeAudit(user: User, action: string, detail?: string, at = Date.now()): AuditEntry {
  return {
    id: `A-${stableHash([user.id, action, detail ?? '', String(at)].join('|'))}`,
    at,
    actorId: user.id,
    actorName: user.name,
    role: user.role,
    action,
    detail,
  };
}

export function modelOf(order: Order): LayoutModel {
  return generateLayout(order.params, order.overrides);
}

export function emptyOverrides(): Overrides {
  return { boxes: {}, segments: {} };
}

export function cloneOverrides(o: Overrides): Overrides {
  return { boxes: { ...o.boxes }, segments: { ...o.segments } };
}

export const ROLE_LABEL: Record<Role, string> = {
  clerk: '前台',
  foreman: '施工',
  inspector: '质检',
};

/** 20% 抽查：按提交批次等距抽取，第 5、10、15… 单必检（批次号从 1 起） */
export function isSampledSubmit(seq: number): boolean {
  return seq > 0 && seq % 5 === 0;
}

export function nextSeq(orders: Order[]): number {
  return orders.reduce((m, o) => Math.max(m, o.submitSeq ?? 0), 0) + 1;
}

export function setBoxOverride(overrides: Overrides, boxId: string, pos: Vec3): Overrides {
  const next = cloneOverrides(overrides);
  next.boxes[boxId] = { x: pos.x, y: pos.y, z: pos.z };
  return next;
}

export function clearBoxOverride(overrides: Overrides, boxId: string): Overrides {
  const next = cloneOverrides(overrides);
  delete next.boxes[boxId];
  return next;
}

export function setSegmentOverride(overrides: Overrides, segId: string, length: number): Overrides {
  const next = cloneOverrides(overrides);
  next.segments[segId] = length;
  return next;
}

export function clearSegmentOverride(overrides: Overrides, segId: string): Overrides {
  const next = cloneOverrides(overrides);
  delete next.segments[segId];
  return next;
}

export function clearAllOverrides(): Overrides {
  return emptyOverrides();
}

export function countManual(overrides: Overrides): number {
  return Object.keys(overrides.boxes).length + Object.keys(overrides.segments).length;
}
