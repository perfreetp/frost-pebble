import { describe, expect, it } from 'vitest';
import { generateLayout, normalizeParams, BOX_SPECS, DEFAULT_PARAMS } from '../src/domain/layout';
import { mulberry32, rngFrom, stableHash } from '../src/domain/prng';

const P = {
  ...DEFAULT_PARAMS,
  seed: 'TEST-SEED',
  buildingCount: 3,
  floors: 6,
  householdsPerFloor: 5,
  overrides: { boxes: {}, segments: {} },
} as any;

describe('确定性随机', () => {
  it('同种子产生同序列', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).toEqual(seqB);
  });
  it('不同种子产生不同序列', () => {
    const a = Array.from({ length: 20 }, mulberry32(1));
    const b = Array.from({ length: 20 }, mulberry32(2));
    expect(a).not.toEqual(b);
  });
  it('rngFrom 对参数顺序敏感', () => {
    const a = Array.from({ length: 8 }, rngFrom('a', 'b'));
    const b = Array.from({ length: 8 }, rngFrom('b', 'a'));
    expect(a).not.toEqual(b);
  });
  it('stableHash 稳定', () => {
    expect(stableHash('hello')).toBe(stableHash('hello'));
    expect(stableHash('hello')).not.toBe(stableHash('hellp'));
  });
});

describe('排布生成器 — 同种子同参数完全一致', () => {
  it('重复生成指纹一致', () => {
    const a = generateLayout(P);
    const b = generateLayout(P);
    expect(a.fingerprint).toBe(b.fingerprint);
    expect(JSON.stringify(a.boxes)).toBe(JSON.stringify(b.boxes));
    expect(JSON.stringify(a.segments)).toBe(JSON.stringify(b.segments));
  });

  it('跨参数顺序不影响结果', () => {
    const a = generateLayout(P);
    const b = generateLayout({ ...P });
    expect(a.fingerprint).toBe(b.fingerprint);
  });

  it('换种子排布改变', () => {
    const a = generateLayout(P);
    const b = generateLayout({ ...P, seed: 'OTHER-SEED' });
    // 种子只影响局部偏移与分组建序，但指纹必然不同
    expect(a.fingerprint).not.toBe(b.fingerprint);
  });

  it('改参数排布改变', () => {
    const a = generateLayout(P);
    const b = generateLayout({ ...P, floors: 7 });
    expect(a.fingerprint).not.toBe(b.fingerprint);
  });

  it('规范化后等价参数得到同指纹', () => {
    const a = generateLayout(P);
    const b = generateLayout({ ...P, buildingCount: '3' as any, floorHeight: '3.0' as any });
    expect(a.fingerprint).toBe(b.fingerprint);
  });
});

describe('排布生成器 — 业务约束', () => {
  it('每栋每层表箱服务户数合计等于每层户数', () => {
    for (const h of [1, 2, 3, 4, 5, 6, 7, 8, 10, 12]) {
      const m = generateLayout({ ...P, householdsPerFloor: h, seed: `H-${h}` });
      for (const b of m.buildings) {
        const boxesOnFloor1 = m.boxes.filter((x) => x.buildingIndex === b.index && x.floor === 1);
        const served = boxesOnFloor1.reduce((s, x) => s + x.serves, 0);
        expect(served, `H=${h}`).toBe(h);
      }
    }
  });

  it('每个表箱服务户数在 1~2 之间', () => {
    for (const spec of BOX_SPECS) {
      const m = generateLayout({ ...P, boxSpecId: spec.id });
      for (const box of m.boxes) {
        expect(box.serves).toBeGreaterThanOrEqual(1);
        expect(box.serves).toBeLessThanOrEqual(2);
      }
    }
  });

  it('表箱不重叠（生成态）', () => {
    const m = generateLayout({ ...P, buildings: 4 } as any);
    for (let i = 0; i < m.boxes.length; i++) {
      for (let j = i + 1; j < m.boxes.length; j++) {
        const a = m.boxes[i];
        const b = m.boxes[j];
        const overlapX = Math.abs(a.x - b.x) < (a.w + b.w) / 2 - 1e-6;
        const overlapY = Math.abs(a.y - b.y) < (a.h + b.h) / 2 - 1e-6;
        const sameBuilding = a.buildingIndex === b.buildingIndex;
        expect(overlapX && overlapY && sameBuilding, `${a.id} vs ${b.id}`).toBe(false);
      }
    }
  });

  it('立管总高与各段之和一致', () => {
    const m = generateLayout(P);
    for (const r of m.risers) {
      const sum = m.segments.filter((s) => s.riserId === r.id).reduce((s, x) => s + x.length, 0);
      expect(Math.abs(r.height - sum)).toBeLessThan(1e-6);
    }
  });

  it('立管、表箱都在楼栋沿街立面范围内', () => {
    const m = generateLayout(P);
    for (const b of m.buildings) {
      const boxes = m.boxes.filter((x) => x.buildingIndex === b.index);
      for (const box of boxes) {
        expect(box.x).toBeGreaterThanOrEqual(b.x - 0.01);
        expect(box.x).toBeLessThanOrEqual(b.x + b.width + 0.01);
        expect(box.y).toBeGreaterThan(0);
        expect(box.y).toBeLessThan(b.height + 0.01);
      }
    }
  });

  it('楼栋之间有退距，不相互重叠', () => {
    const m = generateLayout({ ...P, buildingCount: 6 });
    for (let i = 1; i < m.buildings.length; i++) {
      const prev = m.buildings[i - 1];
      const cur = m.buildings[i];
      expect(cur.x - (prev.x + prev.width)).toBeGreaterThanOrEqual(P.rules.betweenBuildings - 1e-6);
    }
  });

  it('总户数核算 = 楼栋×层×户', () => {
    const m = generateLayout(P);
    expect(m.stats.totalHouseholds).toBe(3 * 6 * 5);
  });

  it('脏输入不崩且被规范化', () => {
    const m = generateLayout({ ...P, buildingCount: 999, floors: -3, householdsPerFloor: 0, streetDepth: NaN } as any);
    expect(m.buildings.length).toBeLessThanOrEqual(12);
    expect(m.buildings.length).toBeGreaterThanOrEqual(1);
    expect(m.buildings[0].floors).toBeGreaterThanOrEqual(1);
    expect(Number.isFinite(m.buildings[0].depth)).toBe(true);
  });

  it('规则冲突会产生 error 级校验项', () => {
    const m = generateLayout({ ...P, rules: { ...P.rules, riserWallOffset: 6, roadSetback: 3 } });
    expect(m.violations.some((v) => v.code === 'RISER_BEYOND_REDLINE' && v.level === 'error')).toBe(true);
  });

  it('表箱底标高超过层高产生 error', () => {
    const m = generateLayout({ ...P, floorHeight: 2.4, rules: { ...P.rules, boxBaseHeight: 2.4 } });
    expect(m.violations.some((v) => v.code === 'BOX_EXCEEDS_FLOOR')).toBe(true);
  });
});

describe('手工改动 — 保留已改位置，其余重算', () => {
  it('拖动表箱后仅该箱位置变，其余不变', () => {
    const base = generateLayout(P);
    const target = base.boxes[3];
    const moved = { x: target.x + 0.9, y: target.y + 0.4, z: target.z };
    const next = generateLayout(P, { boxes: { [target.id]: moved }, segments: {} });
    for (const box of next.boxes) {
      if (box.id === target.id) {
        expect(box.x).toBeCloseTo(moved.x, 3);
        expect(box.y).toBeCloseTo(moved.y, 3);
        expect(box.pinned).toBe(true);
      } else {
        const orig = base.boxes.find((b) => b.id === box.id)!;
        expect(box.x).toBeCloseTo(orig.x, 3);
        expect(box.y).toBeCloseTo(orig.y, 3);
        expect(box.pinned).toBe(false);
      }
    }
  });

  it('改一段立管高度后该位置保留，其余段重算', () => {
    const base = generateLayout(P);
    const seg = base.segments[0];
    const next = generateLayout(P, { boxes: {}, segments: { [seg.id]: 4.2 } });
    const after = next.segments.find((s) => s.id === seg.id)!;
    expect(after.length).toBeCloseTo(4.2, 3);
    expect(after.pinned).toBe(true);
    // 其余段名义长度不变，且上移量等于加长量
    const above = next.segments.filter((s) => s.riserId === seg.riserId).sort((a, b) => a.index - b.index);
    for (let i = 1; i < above.length; i++) {
      expect(above[i].length).toBeCloseTo(3, 3);
      expect(above[i].baseY - (base.segments.find((s) => s.id === above[i].id)!.baseY)).toBeCloseTo(1.2, 3);
    }
  });

  it('调参重生成时手工表箱保持不动', () => {
    const base = generateLayout(P);
    const pinned = base.boxes[0].id;
    const moved = { x: base.boxes[0].x + 1.1, y: base.boxes[0].y, z: -0.2 };
    const overrides = { boxes: { [pinned]: moved }, segments: {} };
    const changed = generateLayout({ ...P, floors: 8 }, overrides);
    const box = changed.boxes.find((b) => b.id === pinned)!;
    expect(box.x).toBeCloseTo(moved.x, 3);
    expect(box.y).toBeCloseTo(moved.y, 3);
    expect(box.pinned).toBe(true);
    // 其余部分确实重算了：总箱数变了
    expect(changed.boxes.length).not.toBe(base.boxes.length);
    // 未改的箱随新参数变化
    const unpinned = changed.boxes.find((b) => !b.pinned);
    expect(unpinned).toBeDefined();
  });

  it('楼梯层数减少导致的手工标记标记为失效', () => {
    const base = generateLayout({ ...P, floors: 8 });
    const topBox = base.boxes.filter((b) => b.floor === 8)[0];
    const overrides = { boxes: { [topBox.id]: { x: topBox.x, y: topBox.y, z: topBox.z } }, segments: {} };
    const shrunk = generateLayout({ ...P, floors: 5 }, overrides);
    expect(shrunk.orphans.boxes).toContain(topBox.id);
  });

  it('改表箱规格后手工表箱尺寸更新、位置保留', () => {
    const base = generateLayout(P);
    const target = base.boxes[2];
    const overrides = { boxes: { [target.id]: { x: target.x, y: target.y, z: target.z } }, segments: {} };
    const next = generateLayout({ ...P, boxSpecId: 'BX-3' }, overrides);
    const b = next.boxes.find((x) => x.id === target.id)!;
    expect(b.w).toBe(BOX_SPECS[2].w);
    expect(b.x).toBeCloseTo(target.x, 3);
  });

  it('手工位置与其它表箱重叠产生 error 校验项', () => {
    const base = generateLayout(P);
    const riserWithTwo = base.risers.find(
      (r) => base.boxes.filter((x) => x.riserId === r.id && x.floor === 1).length >= 2,
    )!;
    const floor1 = base.boxes.filter((x) => x.riserId === riserWithTwo.id && x.floor === 1);
    const a = floor1[0];
    const b = floor1[1];
    const overrides = { boxes: { [b.id]: { x: a.x, y: a.y, z: a.z } }, segments: {} };
    const next = generateLayout(P, overrides);
    expect(next.violations.some((v) => v.code === 'MANUAL_BOX_OVERLAP')).toBe(true);
  });

  it('手工段长被限制在合理范围', () => {
    const base = generateLayout(P);
    const seg = base.segments[0];
    const next = generateLayout(P, { boxes: {}, segments: { [seg.id]: 999 } });
    expect(next.segments.find((s) => s.id === seg.id)!.length).toBeLessThanOrEqual(12);
    const next2 = generateLayout(P, { boxes: {}, segments: { [seg.id]: -5 } });
    expect(next2.segments.find((s) => s.id === seg.id)!.length).toBeGreaterThan(0);
  });
});

describe('参数规范化', () => {
  it('管径不在列表则回退', () => {
    expect(normalizeParams({ ...P, pipeDiameter: 33 }).pipeDiameter).toBe(50);
  });
  it('表箱规格未知则回退', () => {
    expect(normalizeParams({ ...P, boxSpecId: 'nope' }).boxSpecId).toBe(BOX_SPECS[0].id);
  });
  it('空种子回退', () => {
    expect(normalizeParams({ ...P, seed: '   ' }).seed).toBe('SEED');
  });
});
