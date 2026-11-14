import { describe, expect, it } from 'vitest';
import { MeshBuilder, mergeMeshes } from '@core/geom';
import { MeshSurfaceSampler, traceOnSurface, unfoldPolyline } from '@core/surface';
import { measureCrack, gradeDefect, validateDraft, classifyCrackOrientation, makeDefectCode, placementOf, crackPointAt } from '@core/annotation';
import { buildBridge, DEFAULT_CONFIG, spanStarts, deckElevationAt, girderBottomAt, pointChainage } from '@core/bridgeModel';
import { buildTimelines, summarizeTimelines, trendOf } from '@core/timeline';
import { computeStats, buildRepairList, buildDistributionMap, suggestRepair } from '@core/reports';
import type { Defect, Inspection, Vec3 } from '@core/types';
import { dist, polylineLength } from '@core/math';

// 半径 1 m 的圆柱，用来验证“贴合曲面展开长度 > 弦长”
function cylinderSampler(radius = 1, height = 4, segs = 48) {
  const mb = new MeshBuilder();
  mb.cylinder(0, 0, 0, radius, height, segs, false, false);
  const mesh = mb.build();
  const sampler = new MeshSurfaceSampler(mesh);
  return { sampler, mesh, radius };
}

describe('geom / MeshBuilder', () => {
  it('generates outward-facing quads for boxes', () => {
    const mb = new MeshBuilder();
    mb.box(0, 0, 0, 1, 1, 1);
    const m = mb.build();
    expect(m.indices.length / 3).toBe(12);
    expect(m.positions.length / 3).toBe(24);
  });

  it('merges meshes with index offsets', () => {
    const a = new MeshBuilder();
    a.tri([0, 0, 0], [1, 0, 0], [0, 1, 0]);
    const b = new MeshBuilder();
    b.tri([0, 0, 1], [1, 0, 1], [0, 1, 1]);
    const merged = mergeMeshes([a.build(), b.build()]);
    expect(merged.indices.length).toBe(6);
    expect(merged.indices[3]).toBe(3); // 第二个三角形索引偏移
  });
});

describe('曲面上取样与展开', () => {
  it(' snaps sampled points onto the cylinder surface', () => {
    const { sampler, radius } = cylinderSampler();
    const p: Vec3 = [radius + 0.05, 1, 0];
    const hit = sampler.hit(p);
    expect(hit).not.toBeNull();
    const r = Math.hypot(hit!.point[0], hit!.point[2]);
    expect(Math.abs(r - radius)).toBeLessThan(1e-3);
  });

  it('unfolded crack length exceeds the straight chord on a curved surface', () => {
    const { sampler, radius } = cylinderSampler(1, 4, 96);
    // 沿圆柱正面的圆弧取两点，角度 ±30°
    const ang = Math.PI / 6;
    const a: Vec3 = [radius * Math.cos(-ang), 1, radius * Math.sin(-ang)];
    const b: Vec3 = [radius * Math.cos(ang), 1, radius * Math.sin(ang)];
    const chord = dist(a, b);
    const meas = measureCrack({
      a,
      b,
      widthMm: 0.35,
      widthAt: 0.5,
      penetrated: true,
      project: (p) => sampler.hit(p, 1.5),
    });
    // 圆弧长 = r * 2*ang = 1.047，弦长 = 2*r*sin(ang) = 1.0
    expect(meas.geometry.lengthMm / 1000).toBeGreaterThan(chord * 1.02);
    expect(meas.geometry.lengthMm / 1000).toBeLessThan(radius * 2 * ang * 1.01);
    expect(meas.samples).toBeGreaterThan(2);
    // 沿圆周走向 ≈ 90°（垂直于里程方向）
    expect(Math.abs(classifyCrackOrientation(meas.geometry.azimuthDeg) === 'transverse' ? 1 : 0)).toBe(1);
  });

  it('keeps length equal to the folded polyline when the surface is flat', () => {
    const mb = new MeshBuilder();
    mb.quad([0, 0, -1], [0, 0, 1], [4, 0, 1], [4, 0, -1]);
    const sampler = new MeshSurfaceSampler(mb.build());
    const a: Vec3 = [0.5, 0, 0];
    const b: Vec3 = [3.5, 0, 0];
    const path = traceOnSurface(a, b, (p) => sampler.hit(p), { tolerance: 1e-4 });
    const unfold = unfoldPolyline(path, [0, 1, 0].map(() => [0, 1, 0] as Vec3));
    expect(unfold.length).toBeCloseTo(3, 2);
    expect(polylineLength(path)).toBeCloseTo(3, 2);
  });

  it('expands a path on a sloped girder deck and reports chainage/elevation', () => {
    const { bridge } = buildBridge(DEFAULT_CONFIG);
    const deck = bridge.components.find((c) => c.id === 'span-1-deck')!;
    const mb = new MeshBuilder();
    // 用剖切面近似：直接按 1.2% 纵坡做倾斜面
    mb.quad([0, deckElevationAt(DEFAULT_CONFIG, 0), -6], [0, deckElevationAt(DEFAULT_CONFIG, 0), 6],
      [30, deckElevationAt(DEFAULT_CONFIG, 30), 6], [30, deckElevationAt(DEFAULT_CONFIG, 30), -6]);
    const sampler = new MeshSurfaceSampler(mb.build());
    const a: Vec3 = [5, deckElevationAt(DEFAULT_CONFIG, 5) + 0.01, -3];
    const b: Vec3 = [15, deckElevationAt(DEFAULT_CONFIG, 15) + 0.01, -3];
    const meas = measureCrack({ a, b, widthMm: 0.22, widthAt: 0.5, penetrated: false, project: (p) => sampler.hit(p, 0.5) });
    // 水平 10 m + 纵坡 0.12 m → 展开长约 10.0007 m
    expect(meas.geometry.lengthMm / 1000).toBeCloseTo(10.0007, 2);
    const pl = placementOf(crackPointAt(meas.geometry, 0.5), DEFAULT_CONFIG, bridge.components);
    expect(pl.chainage).toBeCloseTo(DEFAULT_CONFIG.stationStart + 10, 1);
    expect(pl.component?.id).toBe('span-1-deck');
    expect(deck.x0).toBe(0);
  });
});

describe('定级规则', () => {
  it('marks cracks > 0.3 mm critical, > 0.2 mm warning', () => {
    const c = gradeDefect({ type: 'crack', widthMm: 0.31, componentType: 'girder' });
    expect(c.severity).toBe('critical');
    expect(c.grade).toBe(4);
    expect(c.requiresJustification).toBe(true);
    expect(c.requiresPhotos).toBe(true);
    const w = gradeDefect({ type: 'crack', widthMm: 0.21, componentType: 'girder' });
    expect(w.severity).toBe('warning');
    expect(w.grade).toBe(2);
    expect(w.requiresPhotos).toBe(false);
    const n = gradeDefect({ type: 'crack', widthMm: 0.15, componentType: 'girder' });
    expect(n.severity).toBe('normal');
    expect(n.grade).toBe(1);
  });

  it('boundary values belong to the lower band (0.30 is still warning)', () => {
    const r = gradeDefect({ type: 'crack', widthMm: 0.3, componentType: 'girder' });
    expect(r.severity).toBe('warning');
    expect(gradeDefect({ type: 'crack', widthMm: 0.2, componentType: 'girder' }).severity).toBe('normal');
  });

  it('raises grade for penetrated long girder cracks', () => {
    const r = gradeDefect({ type: 'crack', widthMm: 0.32, lengthMm: 2200, penetrated: true, componentType: 'girder' });
    expect(r.grade).toBe(5);
    expect(r.severity).toBe('critical');
    expect(r.reasons.join()).toContain('贯通');
  });

  it('grades bearing voiding by ratio and depth', () => {
    expect(gradeDefect({ type: 'bearing_void', voidRatio: 0.35, depthMm: 2, componentType: 'bearing' }).severity).toBe('critical');
    expect(gradeDefect({ type: 'bearing_void', voidRatio: 0.18, depthMm: 1, componentType: 'bearing' }).severity).toBe('warning');
    expect(gradeDefect({ type: 'bearing_void', voidRatio: 0.05, depthMm: 0.5, componentType: 'bearing' }).severity).toBe('normal');
  });

  it('grading joint seepage by affected length', () => {
    expect(gradeDefect({ type: 'joint_seepage', lengthMm: 2000, componentType: 'girder' }).severity).toBe('critical');
    expect(gradeDefect({ type: 'joint_seepage', lengthMm: 800, componentType: 'girder' }).severity).toBe('warning');
  });
});

describe('保存前的硬性校验', () => {
  it('blocks saving a critical defect without photos and justification', () => {
    const v = validateDraft({
      type: 'crack',
      widthMm: 0.35,
      lengthMm: 800,
      componentId: 'span-1-girder',
      componentType: 'girder',
      endpoints: [[0, 0, 0], [1, 0, 0]],
      justification: '',
      photos: [],
    });
    expect(v.ok).toBe(false);
    expect(v.errors.length).toBeGreaterThanOrEqual(2);
    expect(v.errors.join()).toContain('判定依据');
    expect(v.errors.join()).toContain('特写照片');
  });

  it('passes once justification and one photo are supplied', () => {
    const v = validateDraft({
      type: 'crack',
      widthMm: 0.35,
      componentId: 'span-1-girder',
      componentType: 'girder',
      endpoints: [[0, 0, 0], [1, 0, 0]],
      justification: '宽度 0.35 mm，超 0.3 mm 限值，且位于梁底跨中受力区，判定为 4 级。',
      photos: [{ id: 'p1', url: '/uploads/p1.jpg', caption: '裂缝特写' }],
    });
    expect(v.ok).toBe(true);
    expect(v.graded.grade).toBe(4);
  });

  it('allows warning cracks without photos but flags advice', () => {
    const v = validateDraft({
      type: 'crack',
      widthMm: 0.25,
      componentId: 'span-2-girder',
      componentType: 'girder',
      endpoints: [[0, 0, 0], [1, 0, 0]],
      justification: '',
      photos: [],
    });
    expect(v.ok).toBe(true);
    expect(v.warnings.join()).toContain('特写照片');
  });

  it('rejects a crack without endpoints', () => {
    const v = validateDraft({ type: 'crack', widthMm: 0.1, componentId: 'x', justification: '', photos: [] });
    expect(v.ok).toBe(false);
  });
});

describe('构件与桩号', () => {
  it('builds 3 spans with girders, piers, bearings, deck, railings', () => {
    const { bridge } = buildBridge(DEFAULT_CONFIG);
    const byType = (t: string) => bridge.components.filter((c) => c.type === t);
    expect(byType('girder').length).toBe(3);
    expect(byType('pier').length).toBe(2);
    expect(byType('bearing').length).toBe(16); // 4 个墩台 × 4
    expect(byType('deck').length).toBe(3);
    expect(byType('railing').length).toBe(6);
    expect(bridge.length).toBe(90);
    expect(spanStarts(DEFAULT_CONFIG)).toEqual([0, 30, 60, 90]);
    expect(bridge.supports[1].chainage).toBe(DEFAULT_CONFIG.stationStart + 30);
    expect(pointChainage(DEFAULT_CONFIG, [12, 0, 0])).toBe(DEFAULT_CONFIG.stationStart + 12);
  });

  it('computes girder bottom elevation on grade', () => {
    expect(deckElevationAt(DEFAULT_CONFIG, 0)).toBeCloseTo(42.5, 5);
    expect(deckElevationAt(DEFAULT_CONFIG, 30)).toBeCloseTo(42.5 + 0.36, 5);
    expect(girderBottomAt(DEFAULT_CONFIG, 0)).toBeCloseTo(42.5 - 0.1 - 1.8, 5);
  });

  it('generates unique defect codes within the same year', () => {
    const c1 = makeDefectCode([], 'crack', '2025-04-10', 'span-1-girder');
    expect(c1).toMatch(/^LF-2025-001-SP1G$/);
    const c2 = makeDefectCode([{ id: 'x', code: c1 }], 'crack', '2025-04-10', 'span-2-girder');
    expect(c2).toMatch(/^LF-2025-002-SP2G$/);
    // 跨年重新从 001 起
    const c3 = makeDefectCode([{ id: 'x', code: c1 }], 'crack', '2026-04-10', 'span-1-girder');
    expect(c3).toMatch(/^LF-2026-001-/);
    // 不同类型互不干扰
    const c4 = makeDefectCode([{ id: 'x', code: c1 }], 'bearing_void', '2025-04-10', 'support-1-bearing-0');
    expect(c4).toMatch(/^ZK-2025-001-/);
  });
});

// ---------------------------------------------------------------- timeline

function mkDefect(over: Partial<Defect>): Defect {
  return {
    id: 'd1',
    bridgeId: 'b',
    inspectionId: 'i1',
    componentId: 'span-1-girder',
    type: 'crack',
    code: 'LF-1',
    chainage: 1255,
    offset: -2,
    elevation: 40,
    grade: 2,
    severity: 'warning',
    description: '',
    justification: '',
    photos: [],
    createdAt: '2022-01-01',
    createdBy: 'a',
    updatedAt: '2022-01-01',
    geometry: {
      kind: 'crack',
      endpoints: [[0, 0, 0], [1, 0, 0]],
      path: [[0, 0, 0], [1, 0, 0]],
      normal: [0, 1, 0],
      lengthMm: 1000,
      azimuthDeg: 0,
      orientation: 'longitudinal',
      widthMm: 0.15,
      widthAt: 0.5,
      penetrated: false,
    },
    ...over,
  };
}

describe('时间线归并', () => {
  const inspections: Inspection[] = [
    { id: 'i1', bridgeId: 'b', date: '2022-05-10', title: '2022 定检', inspector: 'a', weather: '', equipment: '', note: '', createdAt: '2022-05-10' },
    { id: 'i2', bridgeId: 'b', date: '2023-05-12', title: '2023 定检', inspector: 'a', weather: '', equipment: '', note: '', createdAt: '2023-05-10' },
    { id: 'i3', bridgeId: 'b', date: '2024-05-15', title: '2024 定检', inspector: 'a', weather: '', equipment: '', note: '', createdAt: '2024-05-10' },
    { id: 'i4', bridgeId: 'b', date: '2025-04-20', title: '2025 定检', inspector: 'a', weather: '', equipment: '', note: '', createdAt: '2025-04-10' },
  ];

  it('merges same chainage/offset/component across inspections', () => {
    const ds: Defect[] = [
      mkDefect({ id: 'd1', inspectionId: 'i1', chainage: 1254.9, offset: -2.1 }),
      mkDefect({ id: 'd2', inspectionId: 'i2', chainage: 1255.2, offset: -2.0, geometry: { ...(mkDefect({}).geometry as any), lengthMm: 1200, widthMm: 0.19 } }),
      mkDefect({ id: 'd3', inspectionId: 'i4', chainage: 1255.1, offset: -1.9, geometry: { ...(mkDefect({}).geometry as any), lengthMm: 1800, widthMm: 0.27 } }),
      // 不同构件，不应归并
      mkDefect({ id: 'd4', inspectionId: 'i3', componentId: 'span-2-girder', chainage: 1255, offset: -2 }),
      // 桩号差 0.6 m，不应归并
      mkDefect({ id: 'd5', inspectionId: 'i2', chainage: 1254.2, offset: -2 }),
    ];
    const fams = buildTimelines(ds, inspections);
    expect(fams.length).toBe(3);
    const main = fams.find((f) => f.points.length === 3)!;
    expect(main.latest.defect.id).toBe('d3');
    expect(main.first.defect.id).toBe('d1');
    expect(main.widthRatePerYear).toBeGreaterThan(0.03);
    expect(main.widthRatePerYear).toBeLessThan(0.06);
    expect(main.isExpanded).toBe(true);
    expect(trendOf(main)).toBe('expanded');
    expect(main.spanYears).toBeCloseTo(2.95, 1);
  });

  it('flags single-observation defects as new and predicts time to limit', () => {
    const ds: Defect[] = [
      mkDefect({ id: 'n1', inspectionId: 'i4', code: 'LF-NEW', chainage: 1260, offset: 3 }),
      mkDefect({ id: 'n2', inspectionId: 'i4', code: 'LF-NEW2', chainage: 1300, offset: 1 }),
    ];
    const fams = buildTimelines(ds, inspections);
    expect(fams.every((f) => f.isNew)).toBe(true);
    const s = summarizeTimelines(fams);
    expect(s.newCount).toBe(2);
  });

  it('marks near-limit families when growth is trended', () => {
    const base = mkDefect({ id: 'x1', inspectionId: 'i1', geometry: { ...(mkDefect({}).geometry as any), widthMm: 0.22, lengthMm: 1200 } });
    const next = mkDefect({ id: 'x2', inspectionId: 'i4', geometry: { ...(mkDefect({}).geometry as any), widthMm: 0.285, lengthMm: 1500 } });
    const fams = buildTimelines([base, next], inspections);
    expect(fams[0].headroomMm).toBeCloseTo(0.015, 3);
    expect(fams[0].yearsToLimit).not.toBeNull();
    expect(fams[0].nearLimit).toBe(true);
    expect(fams[0].latest.defect.severity).toBe('warning');
  });
});

describe('报告统计与建议清单', () => {
  const { bridge } = buildBridge(DEFAULT_CONFIG);
  const inspections: Inspection[] = [
    { id: 'i1', bridgeId: 'b', date: '2024-05-10', title: '2024', inspector: 'a', weather: '', equipment: '', note: '', createdAt: '2024-05-10' },
    { id: 'i2', bridgeId: 'b', date: '2025-04-20', title: '2025', inspector: 'a', weather: '', equipment: '', note: '', createdAt: '2025-04-10' },
  ];
  const defects: Defect[] = [
    mkDefect({ id: 'a1', inspectionId: 'i1', componentId: 'span-1-girder', chainage: 1255, offset: -2, severity: 'warning', geometry: { ...(mkDefect({}).geometry as any), widthMm: 0.22, lengthMm: 900 } }),
    mkDefect({ id: 'a2', inspectionId: 'i2', componentId: 'span-1-girder', chainage: 1255.1, offset: -2, severity: 'critical', grade: 4, geometry: { ...(mkDefect({}).geometry as any), widthMm: 0.35, lengthMm: 1600, penetrated: true } }),
    mkDefect({ id: 'b1', inspectionId: 'i2', componentId: 'support-1-bearing-0', type: 'bearing_void', chainage: 1280, offset: -4.2, severity: 'critical', grade: 4, geometry: { kind: 'volume', center: [0, 0, 0], size: [0.6, 0.1, 0.4], yaw: 0, depthMm: 7, areaM2: 0.24, voidRatio: 0.4 } }),
    mkDefect({ id: 'c1', inspectionId: 'i2', componentId: 'span-2-girder', type: 'joint_seepage', chainage: 1360, offset: 4, severity: 'warning', grade: 2, geometry: { kind: 'volume', center: [0, 0, 0], size: [2, 0.1, 0.3], yaw: 0, depthMm: 20, areaM2: 0.6 } }),
  ];
  const fams = buildTimelines(defects, inspections);

  it('computes level/type/component statistics', () => {
    const s = computeStats(defects, bridge.components, fams);
    expect(s.total).toBe(4);
    expect(s.critical).toBe(2);
    expect(s.warning).toBe(2);
    expect(s.byType.crack.total).toBe(2);
    expect(s.byType.bearing_void.critical).toBe(1);
    expect(s.byComponent.girder).toBe(3);
    expect(s.byComponent.bearing).toBe(1);
    expect(s.bySpanCritical[0]).toBeGreaterThanOrEqual(1);
    expect(s.expandedSinceLast).toBe(1);
  });

  it('builds a repair list ordered by urgency and merged by measure', () => {
    const rows = buildRepairList(defects, fams);
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(rows[0].item.urgency).toBe('立即');
    const plate = rows.find((r) => r.item.key === 'crack_plate_strip');
    expect(plate).toBeTruthy();
    expect(plate!.quantity).toMatch(/m²/);
    const reseat = rows.find((r) => r.item.key === 'bearing_reseat');
    expect(reseat!.quantity).toBe('1 个');
  });

  it('suggests monitoring for near-limit normal cracks', () => {
    const d = mkDefect({ severity: 'normal', grade: 1, geometry: { ...(mkDefect({}).geometry as any), widthMm: 0.19 } });
    const fam = buildTimelines([d, mkDefect({ id: 'z', inspectionId: 'i2', geometry: { ...(mkDefect({}).geometry as any), widthMm: 0.19 } })], inspections)[0];
    fam.isExpanded = false;
    fam.nearLimit = true;
    const item = suggestRepair(d, fam);
    expect(item.key).toBe('crack_monitor');
  });

  it('produces distribution markers in both views', () => {
    const map = buildDistributionMap(defects, bridge.components, {
      stationStart: DEFAULT_CONFIG.stationStart,
      length: bridge.length,
      spans: DEFAULT_CONFIG.spans,
      deckWidth: DEFAULT_CONFIG.deckWidth,
    });
    expect(map.elevationView.length).toBe(4);
    expect(map.planView[0].offset).toBeLessThan(0);
    expect(map.spanBounds).toEqual([0, 30, 60, 90]);
    expect(map.legends.length).toBe(6);
    expect(map.extent.chainage[1]).toBeCloseTo(DEFAULT_CONFIG.stationStart + 90, 5);
  });
});
