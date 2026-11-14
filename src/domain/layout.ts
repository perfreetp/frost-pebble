import type {
  Bounds,
  BoxSpec,
  Building,
  LayoutModel,
  LayoutParams,
  MainRun,
  MeterBox,
  Overrides,
  Riser,
  Segment,
  Vec3,
  Violation,
} from './types';
import { rngFrom, round, stableHash } from './prng';

export const BOX_SPECS: BoxSpec[] = [
  { id: 'BX-1', label: '单户表箱 BX-1', capacity: 1, w: 0.45, h: 0.6, d: 0.22 },
  { id: 'BX-2', label: '双户表箱 BX-2', capacity: 2, w: 0.62, h: 0.72, d: 0.26 },
  { id: 'BX-3', label: '双户加宽表箱 BX-3', capacity: 2, w: 0.78, h: 0.8, d: 0.3 },
];

export function boxSpecById(id: string): BoxSpec {
  return BOX_SPECS.find((s) => s.id === id) ?? BOX_SPECS[0];
}

export const PIPE_DIAMETERS = [25, 32, 40, 50, 65, 80, 100];

export const DEFAULT_RULES: LayoutParams['rules'] = {
  roadSetback: 4,
  betweenBuildings: 3,
  riserWallOffset: 0.55,
  boxBaseHeight: 1.4,
  boxSpacing: 0.3,
};

export const DEFAULT_PARAMS: LayoutParams = {
  seed: 'MEITAN-2026',
  buildingCount: 4,
  floors: 6,
  householdsPerFloor: 6,
  pipeDiameter: 50,
  boxSpecId: 'BX-2',
  streetDepth: 12,
  floorHeight: 3,
  rules: { ...DEFAULT_RULES },
};

const clampInt = (v: number, lo: number, hi: number) => {
  const n = Math.round(Number(v));
  return Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));
};

const clampNum = (v: number, lo: number, hi: number) => {
  const n = Number(v);
  return Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));
};

/** 把任意输入规整成合法参数，保证生成器不会因为脏输入崩掉 */
export function normalizeParams(input: LayoutParams): LayoutParams {
  const p = input ?? DEFAULT_PARAMS;
  return {
    seed: String(p.seed ?? '').trim() || 'SEED',
    buildingCount: clampInt(p.buildingCount, 1, 12),
    floors: clampInt(p.floors, 1, 40),
    householdsPerFloor: clampInt(p.householdsPerFloor, 1, 12),
    pipeDiameter: PIPE_DIAMETERS.includes(p.pipeDiameter) ? p.pipeDiameter : 50,
    boxSpecId: BOX_SPECS.some((s) => s.id === p.boxSpecId) ? p.boxSpecId : BOX_SPECS[0].id,
    streetDepth: clampNum(p.streetDepth, 6, 40),
    floorHeight: clampNum(p.floorHeight, 2.4, 4.5),
    rules: {
      roadSetback: clampNum(p.rules?.roadSetback ?? 4, 0, 30),
      betweenBuildings: clampNum(p.rules?.betweenBuildings ?? 3, 0, 30),
      riserWallOffset: clampNum(p.rules?.riserWallOffset ?? 0.55, 0.15, 5),
      boxBaseHeight: clampNum(p.rules?.boxBaseHeight ?? 1.4, 0.2, 2.6),
      boxSpacing: clampNum(p.rules?.boxSpacing ?? 0.3, 0.15, 2),
    },
  };
}

/**
 * 把每层户数拆成立管组：单管辖 2~4 户。
 * 组的顺序（余数给前排还是后排）由种子决定，因此同种子同参数结果固定。
 */
function splitHouseholds(households: number, riserCount: number, orderRemainderFirst: boolean): number[] {
  const base = Math.floor(households / riserCount);
  const rem = households % riserCount;
  const groups: number[] = [];
  for (let i = 0; i < riserCount; i++) {
    groups.push(base);
  }
  const targets = orderRemainderFirst ? [...groups.keys()] : [...groups.keys()].reverse();
  for (let i = 0; i < rem; i++) {
    groups[targets[i]] += 1;
  }
  return groups;
}

function boundsOf(buildings: Building[], risers: Riser[], boxes: MeterBox[]): Bounds {
  const b: Bounds = {
    minX: Infinity,
    maxX: -Infinity,
    minY: 0,
    maxY: 0,
    minZ: Infinity,
    maxZ: -Infinity,
  };
  for (const bd of buildings) {
    b.minX = Math.min(b.minX, bd.x);
    b.maxX = Math.max(b.maxX, bd.x + bd.width);
    b.maxY = Math.max(b.maxY, bd.height);
    b.minZ = Math.min(b.minZ, bd.z);
    b.maxZ = Math.max(b.maxZ, bd.z + bd.depth);
  }
  for (const r of risers) {
    b.minX = Math.min(b.minX, r.x - r.radius);
    b.maxX = Math.max(b.maxX, r.x + r.radius);
    b.minZ = Math.min(b.minZ, r.z - r.radius);
  }
  for (const m of boxes) {
    b.minX = Math.min(b.minX, m.x - m.w / 2);
    b.maxX = Math.max(b.maxX, m.x + m.w / 2);
    b.maxY = Math.max(b.maxY, m.y + m.h / 2);
    b.minZ = Math.min(b.minZ, m.z - m.d / 2);
  }
  return b;
}

function fingerprintOf(params: LayoutParams, buildings: Building[], risers: Riser[], segments: Segment[], boxes: MeterBox[]): string {
  const lines: string[] = [];
  lines.push(
    [
      'P',
      params.seed,
      params.buildingCount,
      params.floors,
      params.householdsPerFloor,
      params.pipeDiameter,
      params.boxSpecId,
      round(params.streetDepth, 2),
      round(params.floorHeight, 2),
      round(params.rules.roadSetback, 2),
      round(params.rules.betweenBuildings, 2),
      round(params.rules.riserWallOffset, 2),
      round(params.rules.boxBaseHeight, 2),
      round(params.rules.boxSpacing, 2),
    ].join(','),
  );
  for (const b of buildings) {
    lines.push(['B', b.index, round(b.x, 3), round(b.z, 3), round(b.width, 3), round(b.depth, 3), b.floors, b.householdsPerFloor].join(','));
  }
  for (const r of risers) {
    lines.push(['R', r.id, r.buildingIndex, round(r.x, 3), round(r.z, 3), r.floorCount, r.householdsPerFloor].join(','));
  }
  for (const s of segments) {
    lines.push(['S', s.id, round(s.baseY, 3), round(s.nominal, 3)].join(','));
  }
  for (const m of boxes) {
    lines.push(['M', m.id, round(m.x, 3), round(m.y, 3), round(m.z, 3), m.w, m.h, m.serves].join(','));
  }
  return stableHash(lines.join('|'));
}

/**
 * 核心生成器：纯函数，不依赖时间/随机环境。
 * 同一 seed + 同一参数 → 完全一致的排布（指纹相同）。
 */
export function generateLayout(rawParams: LayoutParams, overrides: Overrides = { boxes: {}, segments: {} }): LayoutModel {
  const params = normalizeParams(rawParams);
  const spec = boxSpecById(params.boxSpecId);
  const rules = params.rules;
  const rng = rngFrom(params.seed, 'layout-v1');

  const buildings: Building[] = [];
  const risers: Riser[] = [];
  const segments: Segment[] = [];
  const boxes: MeterBox[] = [];
  const violations: Violation[] = [];

  const capacity = spec.capacity;
  const floorHeight = round(params.floorHeight, 3);
  const buildingHeight = round(params.floors * floorHeight, 3);

  let cursorX = 0;

  for (let bi = 0; bi < params.buildingCount; bi++) {
    const H = params.householdsPerFloor;
    const maxPerRiser = 3;
    let riserCount = Math.max(1, Math.ceil(H / maxPerRiser));
    // 种子在 4 户及以上时可能多配一根立管（每管辖户更少、表箱更集中）
    if (H >= 4 && riserCount < 3 && rng() < 0.3) riserCount += 1;
    riserCount = Math.min(riserCount, H);

    const orderRemainderFirst = rng() < 0.5;
    const groups = splitHouseholds(H, riserCount, orderRemainderFirst);

    const riserClearance = 0.75 + 0.25 * rng();
    const bayBase = 3.0 + 0.8 * rng();

    const buildingId = `B${String(bi + 1).padStart(2, '0')}`;
    const startX = cursorX;

    let bx = startX;
    const riserIds: string[] = [];

    for (let ri = 0; ri < riserCount; ri++) {
      const g = groups[ri];
      const boxCount = Math.ceil(g / capacity);
      const rowWidth = boxCount * spec.w + (boxCount - 1) * rules.boxSpacing;
      const bay = bayBase + 0.35 * rng();
      const intervalWidth = Math.max(rowWidth + riserClearance + 0.55, g * bay);
      const intervalStart = bx;
      const intervalEnd = bx + intervalWidth;

      const riserId = `R-${buildingId}-${ri + 1}`;
      // 立管通常贴着本组区段的左端（楼梯间一侧），种子给一点横向偏移
      const riserX = round(intervalStart + riserClearance * 0.55 + 0.2 * rng(), 3);
      const riserZ = round(-rules.riserWallOffset, 3);

      const riserSegments: Segment[] = [];
      let cursorY = 0;
      for (let f = 0; f < params.floors; f++) {
        const segmentId = `S-${buildingId}-${ri + 1}-${f + 1}`;
        const nominal = floorHeight;
        const override = overrides.segments?.[segmentId];
        const pinned = typeof override === 'number' && Number.isFinite(override);
        const length = pinned ? round(clampNum(override, 0.2, floorHeight * 4), 3) : nominal;
        riserSegments.push({
          id: segmentId,
          riserId,
          buildingIndex: bi,
          index: f,
          baseY: round(cursorY, 3),
          length,
          nominal,
          pinned,
        });
        // 下段抬高后，其上各段整体跟着上移，保证立管连续
        cursorY = round(cursorY + length, 3);
      }
      segments.push(...riserSegments);

      const riserBoxes: MeterBox[] = [];
      const boxStartX = intervalStart + riserClearance + spec.w / 2;
      for (let f = 0; f < params.floors; f++) {
        // 每层户数相同，因此各层箱位排布一致
        for (let slot = 0; slot < boxCount; slot++) {
          const serves = Math.min(capacity, g - slot * capacity);
          if (serves <= 0) break;
          const nominalX = round(boxStartX + slot * (spec.w + rules.boxSpacing), 3);
          const nominalY = round((f + 1 - 1) * floorHeight + rules.boxBaseHeight + spec.h / 2, 3);
          const nominalZ = round(-spec.d / 2 - 0.02, 3);
          const boxId = `M-${buildingId}-${ri + 1}-${f + 1}-${slot + 1}`;
          const override = overrides.boxes?.[boxId];
          const pinned = !!override && [override.x, override.y, override.z].every((n) => Number.isFinite(n));
          const pos: Vec3 = pinned ? { x: override.x, y: override.y, z: override.z } : { x: nominalX, y: nominalY, z: nominalZ };
          riserBoxes.push({
            id: boxId,
            buildingIndex: bi,
            riserId,
            floor: f + 1,
            slot: slot + 1,
            x: round(pos.x, 3),
            y: round(pos.y, 3),
            z: round(pos.z, 3),
            w: spec.w,
            h: spec.h,
            d: spec.d,
            serves,
            pinned,
            label: `B${bi + 1}-${f + 1}F-${ri + 1}${String.fromCharCode(65 + slot)}`,
          });
        }
      }
      boxes.push(...riserBoxes);

      const riserHeight = round(riserSegments.reduce((s, x) => s + x.length, 0), 3);
      risers.push({
        id: riserId,
        buildingIndex: bi,
        householdsPerFloor: g,
        x: riserX,
        z: riserZ,
        radius: round(params.pipeDiameter / 2000, 4),
        height: riserHeight,
        floorCount: params.floors,
        segmentIds: riserSegments.map((s) => s.id),
        boxIds: riserBoxes.map((b) => b.id),
      });
      riserIds.push(riserId);

      bx = intervalEnd;
    }

    const width = round(bx - startX, 3);
    buildings.push({
      id: buildingId,
      index: bi,
      label: `${bi + 1} 号楼`,
      x: round(startX, 3),
      z: 0,
      width,
      depth: round(params.streetDepth, 3),
      floors: params.floors,
      householdsPerFloor: H,
      height: buildingHeight,
      riserIds,
    });

    const gap = rules.betweenBuildings + 0.6 * rng();
    cursorX = bx + gap;
  }

  // 沿街低压干管：连接各栋立管底部
  const mainPoints: Vec3[] = risers
    .slice()
    .sort((a, b) => a.x - b.x)
    .map((r) => ({ x: r.x, y: 1.15, z: r.z }));
  let mainRun: MainRun | null = null;
  let mainLength = 0;
  if (mainPoints.length > 0) {
    mainRun = { id: 'MAIN', radius: round(params.pipeDiameter / 1600, 4), points: mainPoints };
    for (let i = 1; i < mainPoints.length; i++) {
      mainLength += Math.abs(mainPoints[i].x - mainPoints[i - 1].x);
    }
  }

  // ---- 规则校验 ----
  if (rules.riserWallOffset > rules.roadSetback) {
    violations.push({
      code: 'RISER_BEYOND_REDLINE',
      level: 'error',
      message: `立管退距 ${rules.riserWallOffset.toFixed(2)} m 已超过道路红线退距 ${rules.roadSetback.toFixed(2)} m`,
    });
  }
  if (rules.boxBaseHeight + spec.h > floorHeight) {
    violations.push({
      code: 'BOX_EXCEEDS_FLOOR',
      level: 'error',
      message: `表箱底标高 ${rules.boxBaseHeight.toFixed(2)} m + 箱高 ${spec.h.toFixed(2)} m 超过层高 ${floorHeight.toFixed(2)} m`,
    });
  }
  if (rules.boxSpacing < 0.2) {
    violations.push({ code: 'BOX_SPACING_TIGHT', level: 'warn', message: '同层表箱净距小于 0.20 m，安装与检修空间不足' });
  }
  if (params.pipeDiameter < 32 && params.householdsPerFloor >= 6) {
    violations.push({
      code: 'PIPE_UNDERSIZED',
      level: 'warn',
      message: `DN${params.pipeDiameter} 立管承担每层 ${params.householdsPerFloor} 户，建议不小于 DN40`,
    });
  }
  if (params.floors > 18) {
    violations.push({ code: 'HIGH_RISE_EXTRA', level: 'info', message: '超过 18 层，立管需增加中间支撑与沉降补偿' });
  }

  for (const r of risers) {
    const total = segments.filter((s) => s.riserId === r.id).reduce((s, x) => s + x.length, 0);
    const building = buildings[r.buildingIndex];
    if (total < building.height - 0.05) {
      violations.push({
        code: 'RISER_SHORT',
        level: 'warn',
        message: `${r.id} 立管总高 ${total.toFixed(2)} m 未达楼高 ${building.height.toFixed(2)} m`,
        targetId: r.id,
      });
    } else if (total > building.height + 0.05) {
      violations.push({
        code: 'RISER_OVER',
        level: 'warn',
        message: `${r.id} 立管总高 ${total.toFixed(2)} m 超出楼高 ${building.height.toFixed(2)} m`,
        targetId: r.id,
      });
    }
  }

  for (const m of boxes) {
    if (!m.pinned) continue;
    const building = buildings[m.buildingIndex];
    if (!building) continue;
    if (m.x < building.x - 0.01 || m.x > building.x + building.width + 0.01) {
      violations.push({
        code: 'MANUAL_OFF_FACADE',
        level: 'warn',
        message: `${m.label} 手工位置已移出本栋沿街立面范围`,
        targetId: m.id,
      });
    }
    if (m.y + m.h / 2 > building.height + 0.01 || m.y - m.h / 2 < 0) {
      violations.push({
        code: 'MANUAL_OFF_HEIGHT',
        level: 'warn',
        message: `${m.label} 手工位置超出楼栋竖向范围`,
        targetId: m.id,
      });
    }
    const others = boxes.filter(
      (o) =>
        o.id !== m.id &&
        Math.abs(o.x - m.x) < (o.w + m.w) / 2 + 0.05 &&
        Math.abs(o.y - m.y) < (o.h + m.h) / 2 + 0.05 &&
        Math.abs(o.z - m.z) < 1,
    );
    if (others.length > 0) {
      violations.push({
        code: 'MANUAL_BOX_OVERLAP',
        level: 'error',
        message: `${m.label} 与其他表箱（${others[0].label}）位置重叠`,
        targetId: m.id,
      });
    }
  }

  // 手工标记失效检查
  const orphanBoxes: string[] = [];
  const orphanSegments: string[] = [];
  for (const id of Object.keys(overrides.boxes ?? {})) {
    if (!boxes.some((b) => b.id === id)) orphanBoxes.push(id);
  }
  for (const id of Object.keys(overrides.segments ?? {})) {
    if (!segments.some((s) => s.id === id)) orphanSegments.push(id);
  }

  const totalHouseholds = params.buildingCount * params.floors * params.householdsPerFloor;
  const totalPipeLength = round(
    segments.reduce((s, x) => s + x.length, 0) + mainLength,
    3,
  );

  return {
    params,
    buildings,
    risers,
    segments,
    boxes,
    mainRun,
    violations,
    bounds: boundsOf(buildings, risers, boxes),
    fingerprint: fingerprintOf(params, buildings, risers, segments, boxes),
    stats: {
      buildingCount: buildings.length,
      riserCount: risers.length,
      segmentCount: segments.length,
      boxCount: boxes.length,
      totalHouseholds,
      totalPipeLength,
      manualBoxes: boxes.filter((b) => b.pinned).length,
      manualSegments: segments.filter((s) => s.pinned).length,
    },
    orphans: { boxes: orphanBoxes, segments: orphanSegments },
  };
}
