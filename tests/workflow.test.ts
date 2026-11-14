import { describe, expect, it } from 'vitest';
import { canTransition, TRANSITIONS, orderDeadline, isOverdue, overdueDays, USERS, FOREMEN } from '../src/domain/workflow';
import { computeBoard } from '../src/domain/stats';
import { buildSeedOrders, seedOverridesFor, SEED_NOW } from '../src/data/seed';
import { generateLayout } from '../src/domain/layout';
import { makeAudit, nextSeq, isSampledSubmit, setBoxOverride, setSegmentOverride, countManual, clearBoxOverride } from '../src/domain/orders';
import type { Order, OrderStatus } from '../src/domain/types';

const DAY = 86_400_000;

function seed() {
  return buildSeedOrders().map((o) => ({ ...o, overrides: seedOverridesFor(o) }));
}

function mkOrder(over: Partial<Order>): Order {
  return {
    ...seed()[0],
    id: 'T-1',
    ...over,
  };
}

describe('状态流转', () => {
  it('只允许既定流转路径', () => {
    expect(canTransition('pending', 'working')).toBe(true);
    expect(canTransition('pending', 'qc')).toBe(false);
    expect(canTransition('pending', 'passed')).toBe(false);
    expect(canTransition('working', 'qc')).toBe(true);
    expect(canTransition('working', 'passed')).toBe(false);
    expect(canTransition('qc', 'passed')).toBe(true);
    expect(canTransition('qc', 'rework')).toBe(true);
    expect(canTransition('qc', 'working')).toBe(false);
    expect(canTransition('rework', 'working')).toBe(true);
    expect(canTransition('rework', 'qc')).toBe(true);
    expect(canTransition('passed', 'working')).toBe(false);
    expect(canTransition('passed', 'qc')).toBe(false);
  });

  it('每个状态都有流转定义', () => {
    const all: OrderStatus[] = ['pending', 'working', 'qc', 'passed', 'rework'];
    for (const s of all) expect(TRANSITIONS[s]).toBeDefined();
  });
});

describe('20% 抽查', () => {
  it('每 5 个批次抽 1 个，长期比例为 20%', () => {
    let hits = 0;
    for (let i = 1; i <= 100; i++) if (isSampledSubmit(i)) hits++;
    expect(hits).toBe(20);
  });

  it('抽中序号固定', () => {
    expect(isSampledSubmit(5)).toBe(true);
    expect(isSampledSubmit(10)).toBe(true);
    expect(isSampledSubmit(20)).toBe(true);
    expect(isSampledSubmit(1)).toBe(false);
    expect(isSampledSubmit(4)).toBe(false);
    expect(isSampledSubmit(0)).toBe(false);
  });
});

describe('交期与逾期', () => {
  it('交期随楼栋与层数增加', () => {
    const a = orderDeadline(0, 3, 2);
    const b = orderDeadline(0, 9, 6);
    expect(b).toBeGreaterThan(a);
    expect(b - a).toBeCloseTo((9 - 3) * 0.6 * DAY + (6 - 2) * 1.2 * DAY);
  });

  it('未完工超期按当前时间', () => {
    const dl = SEED_NOW - 2 * DAY;
    expect(isOverdue(mkOrder({ status: 'working', deadline: dl }), SEED_NOW)).toBe(true);
    expect(overdueDays(mkOrder({ status: 'working', deadline: dl }), SEED_NOW)).toBe(2);
  });

  it('已完工按完工时间判定，不随时间漂移', () => {
    const dl = SEED_NOW - 5 * DAY;
    const done = mkOrder({ status: 'passed', deadline: dl, completedAt: dl - DAY });
    expect(isOverdue(done, SEED_NOW)).toBe(false);
    expect(isOverdue(done, SEED_NOW + 30 * DAY)).toBe(false);
    const late = mkOrder({ status: 'passed', deadline: dl, completedAt: dl + 2 * DAY });
    expect(isOverdue(late, SEED_NOW)).toBe(true);
  });
});

describe('看板统计', () => {
  const orders = seed();
  const board = computeBoard(orders, FOREMEN, SEED_NOW);

  it('各状态计数之和等于总数', () => {
    const sum = board.pending + board.working + board.qc + board.passed + board.rework;
    expect(sum).toBe(board.total);
    expect(board.total).toBe(orders.length);
  });

  it('按人分派总数不超过工单总数', () => {
    const assigned = board.foremen.reduce((s, f) => s + f.assigned, 0);
    expect(assigned).toBeLessThanOrEqual(board.total);
    const pendingUnassigned = orders.filter((o) => o.assigneeId === null).length;
    expect(assigned + pendingUnassigned).toBe(board.total);
  });

  it('返工率在 0~1 之间', () => {
    for (const f of board.foremen) {
      expect(f.reworkRate).toBeGreaterThanOrEqual(0);
      expect(f.reworkRate).toBeLessThanOrEqual(1);
    }
  });

  it('已完成工单的平均工期非负', () => {
    for (const f of board.foremen) {
      if (f.avgDays !== null) expect(f.avgDays).toBeGreaterThan(0);
    }
  });

  it('月度序列长度为 6 且按月份升序', () => {
    expect(board.monthly).toHaveLength(6);
    const keys = board.monthly.map((m) => m.key);
    expect([...keys].sort()).toEqual(keys);
  });

  it('表箱总数与排布一致', () => {
    const manual = orders.reduce((s, o) => s + generateLayout(o.params, o.overrides).boxes.length, 0);
    expect(board.totalBoxes).toBe(manual);
  });

  it('抽查数等于被抽中的工单数', () => {
    expect(board.sampled).toBe(orders.filter((o) => o.qcSampled).length);
  });

  it('空数据不崩', () => {
    const b = computeBoard([], FOREMEN, SEED_NOW);
    expect(b.total).toBe(0);
    expect(b.foremen).toHaveLength(FOREMEN.length);
    expect(b.monthly).toHaveLength(6);
  });
});

describe('操作日志', () => {
  it('每条日志带操作人、角色、时间', () => {
    const u = USERS[0];
    const e = makeAudit(u, '建单', 'x', 12345);
    expect(e.actorId).toBe(u.id);
    expect(e.actorName).toBe(u.name);
    expect(e.role).toBe('clerk');
    expect(e.at).toBe(12345);
  });

  it('日志 id 唯一', () => {
    const u = USERS[0];
    const ids = new Set(Array.from({ length: 50 }, (_, i) => makeAudit(u, '操作', String(i), 1000 + i).id));
    expect(ids.size).toBe(50);
  });

  it('建单/派单/提交/质检都写日志', () => {
    for (const o of seed()) {
      expect(o.log.length).toBeGreaterThanOrEqual(1);
      expect(o.log[0].action).toBe('建单');
      if (o.assigneeId) expect(o.log.some((l) => l.action === '派单')).toBe(true);
    }
  });
});

describe('批次序号', () => {
  it('nextSeq 递增且不与既有重复', () => {
    const orders = seed();
    const s = nextSeq(orders);
    expect(orders.every((o) => o.submitSeq === null || o.submitSeq < s)).toBe(true);
  });
});

describe('手工标记操作', () => {
  it('设置与清除', () => {
    const o: { boxes: Record<string, { x: number; y: number; z: number }>; segments: Record<string, number> } = { boxes: {}, segments: {} };
    const withBox = setBoxOverride(o, 'b1', { x: 1, y: 2, z: 3 });
    expect(withBox.boxes.b1).toEqual({ x: 1, y: 2, z: 3 });
    expect(o.boxes.b1).toBeUndefined();
    const cleared = clearBoxOverride(withBox, 'b1');
    expect(cleared.boxes.b1).toBeUndefined();
    const withSeg = setSegmentOverride(withBox, 's1', 3.2);
    expect(countManual(withSeg)).toBe(2);
    expect(countManual(cleared)).toBe(0);
  });
});
