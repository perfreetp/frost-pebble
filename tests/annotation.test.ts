import { describe, expect, it } from 'vitest';
import { MeshBuilder } from '@core/geom';
import { MeshSurfaceSampler, unfoldPolyline, traceOnSurface, horizontalAzimuthDeg } from '@core/surface';
import { measureCrack, measureVolumeDefect, gradeDefect, validateDraft, componentTag, crackPointAt } from '@core/annotation';
import { buildBridge, DEFAULT_CONFIG } from '@core/bridgeModel';
import type { Vec3 } from '@core/types';
import { dist } from '@core/math';

/** 折面：两级台阶，模拟箱梁底板→腹板的转折，验证展开长度沿真实拓扑 */
function foldedSurface() {
  const mb = new MeshBuilder();
  // 水平底板 z∈[-1,0]，y=0
  mb.quad([0, 0, -1], [0, 0, 0], [10, 0, 0], [10, 0, -1]);
  // 竖直腹板 y∈[0,1.8]，在 z=0
  mb.quad([0, 0, 0], [0, 1.8, 0], [10, 1.8, 0], [10, 0, 0]);
  return new MeshSurfaceSampler(mb.build());
}

describe('贴合曲面展开（折面）', () => {
  it('measures the unfolded path across a bottom slab → web fold', () => {
    const sampler = foldedSurface();
    // 起点在底板 z=-0.8，终点在腹板 y=1.4：直线弦 < 折线展开
    const a: Vec3 = [4, 0, -0.8];
    const b: Vec3 = [5, 1.4, 0];
    const chord = dist(a, b);
    const m = measureCrack({
      a,
      b,
      widthMm: 0.3,
      widthAt: 0.5,
      penetrated: false,
      project: (p) => sampler.hit(p, 2),
    });
    // 展开长度应接近沿底板的 0.8 + 沿腹板的 1.4 ≈ 2.2 m，大于弦长
    expect(m.geometry.path.length).toBeGreaterThan(3);
    expect(m.geometry.lengthMm / 1000).toBeGreaterThan(chord);
    expect(m.geometry.lengthMm / 1000).toBeGreaterThan(1.8);
    expect(m.geometry.lengthMm / 1000).toBeLessThan(2.6);
  });

  it('keeps the first endpoint exactly on the surface', () => {
    const sampler = foldedSurface();
    const a: Vec3 = [4, 0.06, -0.8];
    const b: Vec3 = [5, 1.3, 0.02];
    const m = measureCrack({ a, b, widthMm: 0.2, widthAt: 0.5, penetrated: false, project: (p) => sampler.hit(p, 2) });
    expect(m.geometry.path[0][1]).toBeCloseTo(0, 2);
    expect(Math.abs(m.geometry.path[m.geometry.path.length - 1][2])).toBeLessThan(0.02);
  });

  it('samples densely along a long segment', () => {
    const sampler = foldedSurface();
    const m = measureCrack({
      a: [1, 0, -0.9],
      b: [9, 0, -0.9],
      widthMm: 0.1,
      widthAt: 0.5,
      penetrated: false,
      project: (p) => sampler.hit(p, 2),
    });
    expect(m.samples).toBeGreaterThan(10);
    expect(m.geometry.lengthMm / 1000).toBeCloseTo(8, 1);
  });
});

describe('体块类病害测量', () => {
  it('derives area and void ratio from two corners on a bearing', () => {
    const v = measureVolumeDefect({
      a: [30.0, 41.0, -4.3],
      b: [30.3, 41.0, -4.1],
      depthMm: 4,
      referenceAreaM2: 0.26,
    });
    // 体块主轴沿两角点连线（含 yaw），因此 size[0] 是对角长度
    expect(v.geometry.size[0]).toBeCloseTo(Math.hypot(0.3, 0.2), 2);
    expect(Math.abs(v.geometry.yaw)).toBeGreaterThan(0);
    expect(v.geometry.areaM2).toBeGreaterThan(0.01);
    expect(v.geometry.voidRatio).not.toBeUndefined();
    expect(v.geometry.voidRatio!).toBeLessThanOrEqual(1);
    expect(v.geometry.yaw).toBeGreaterThan(-Math.PI);
  });

  it('handles a long longitudinal seepage band', () => {
    const v = measureVolumeDefect({ a: [70, 41, 3.8], b: [75, 41, 3.8], depthMm: 28 });
    expect(v.geometry.size[0]).toBeCloseTo(5, 1);
    expect(v.geometry.areaM2).toBeGreaterThan(0.5);
    expect(v.geometry.voidRatio).toBeUndefined();
  });

  it('grades seepage by influence length, not by area square root', () => {
    expect(gradeDefect({ type: 'joint_seepage', influenceLengthMm: 4700, componentType: 'girder' }).severity).toBe('critical');
    expect(gradeDefect({ type: 'joint_seepage', influenceLengthMm: 300, componentType: 'girder' }).severity).toBe('normal');
  });
});

describe('严重级保存门槛（端到端语义）', () => {
  const base = {
    type: 'crack' as const,
    widthMm: 0.34,
    componentId: 'span-2-deck',
    componentType: 'deck' as const,
    endpoints: [[0, 0, 0], [1, 0, 0]] as [Vec3, Vec3],
  };
  it('rejects with中文提示 when only the width is entered', () => {
    const v = validateDraft({ ...base, justification: '', photos: [] });
    expect(v.ok).toBe(false);
    expect(v.errors).toEqual([
      '等级 4 级（严重）必须填写判定依据后方可保存',
      '严重级病害必须至少上传一张特写照片后方可保存',
    ]);
    expect(v.graded.grade).toBe(4);
  });
  it('rejects when justification present but no photo', () => {
    const v = validateDraft({ ...base, justification: '超 0.3 mm 限值', photos: [] });
    expect(v.ok).toBe(false);
    expect(v.errors.join()).toContain('特写照片');
  });
  it('accepts once both are provided', () => {
    const v = validateDraft({
      ...base,
      justification: '超 0.3 mm 限值',
      photos: [{ id: 'p', url: '/uploads/p.png', caption: '特写' }],
    });
    expect(v.ok).toBe(true);
  });
  it('does not gate warning-level cracks on photos', () => {
    const v = validateDraft({ ...base, widthMm: 0.25, justification: '', photos: [] });
    expect(v.ok).toBe(true);
    expect(v.graded.severity).toBe('warning');
  });
});

describe('病害编号与构件标签', () => {
  it('produces readable component tags', () => {
    expect(componentTag('span-2-girder')).toBe('SP2G');
    expect(componentTag('span-1-railing-left')).toBe('SP1RL');
    expect(componentTag('support-1-bearing-0')).toBe('SUP1B-0');
    expect(componentTag('support-2-pier')).toBe('SUP2P');
  });

  it('normalises crack point lookup by arc length', () => {
    const g = {
      kind: 'crack' as const,
      endpoints: [[0, 0, 0], [10, 0, 0]] as [Vec3, Vec3],
      path: [[0, 0, 0], [4, 0, 0], [10, 0, 0]] as Vec3[],
      normal: [0, 1, 0] as Vec3,
      lengthMm: 10000,
      azimuthDeg: 0,
      orientation: 'longitudinal' as const,
      widthMm: 0.2,
      widthAt: 0.5,
      penetrated: false,
    };
    expect(crackPointAt(g, 0)[0]).toBe(0);
    expect(crackPointAt(g, 0.5)[0]).toBeCloseTo(5, 1);
    expect(crackPointAt(g, 1)[0]).toBe(10);
  });
});

describe('走向角', () => {
  it('maps +X to 0°, +Z to 90°, -Z to -90°', () => {
    expect(horizontalAzimuthDeg([1, 0, 0])).toBeCloseTo(0);
    expect(horizontalAzimuthDeg([0, 0, 1])).toBeCloseTo(90);
    expect(horizontalAzimuthDeg([0, 0, -1])).toBeCloseTo(-90);
    expect(horizontalAzimuthDeg([1, 1, 0])).toBeCloseTo(0);
  });
});

describe('桥梁模型与桩号换算一致性', () => {
  it('mounts every component on its design span chainage, bbox may overhang slightly', () => {
    const { bridge } = buildBridge(DEFAULT_CONFIG);
    for (const c of bridge.components) {
      expect(c.chainageStart).toBeLessThanOrEqual(c.chainageEnd);
      // 桩号取设计范围；实际几何（护栏立柱外挑 6 cm）允许小幅超出
      expect(c.chainageStart).toBeCloseTo(DEFAULT_CONFIG.stationStart + c.x0, 5);
      expect(c.chainageEnd).toBeCloseTo(DEFAULT_CONFIG.stationStart + c.x1, 5);
      // 支座/盖梁等横向构件会略微缩进，纵向门槛允许 ±0.5 m（护栏立柱、盖梁倒角）
      expect(c.bboxMin[0]).toBeGreaterThanOrEqual(c.x0 - 0.5);
      expect(c.bboxMax[0]).toBeLessThanOrEqual(c.x1 + 0.5);
    }
  });

  it('bearings sit between pier top and girder bottom', () => {
    const { bridge } = buildBridge(DEFAULT_CONFIG);
    const sup = bridge.supports[1];
    const bearings = bridge.components.filter((c) => c.type === 'bearing' && c.supportIndex === 1);
    expect(bearings.length).toBe(4);
    for (const b of bearings) {
      expect(b.elevMin).toBeCloseTo(sup.topElevation, 4);
      expect(b.elevMax).toBeLessThanOrEqual(b.elevMin + DEFAULT_CONFIG.bearingHeight + 1e-6);
    }
  });
});
