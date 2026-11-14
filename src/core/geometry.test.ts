import { describe, expect, it } from 'vitest';
import { cornerArc, pointInRing, tubePathLength } from './geometry';
import { v } from './geometry';

describe('tubePathLength', () => {
  it('直折线长度等于各段之和', () => {
    const pts = [v(0, 0), v(1000, 0), v(1000, 500)];
    const len = tubePathLength(pts, [0]);
    expect(len).toBeCloseTo(1500, 5);
  });

  it('折弯圆弧比尖角短（裁掉两段、加弧长）', () => {
    const pts = [v(0, 0), v(100, 0), v(100, 100)];
    const sharp = tubePathLength(pts, [0]);
    const rounded = tubePathLength(pts, [20]);
    expect(rounded).toBeLessThan(sharp);
    expect(rounded).toBeGreaterThan(sharp - 40);
  });

  it('半径超过相邻段长度时自动截断，不产生 NaN', () => {
    const pts = [v(0, 0), v(10, 0), v(10, 10)];
    const len = tubePathLength(pts, [1000]);
    expect(Number.isFinite(len)).toBe(true);
    expect(len).toBeGreaterThan(0);
  });
});

describe('cornerArc', () => {
  it('90 度角、半径 20 的弧长约为 10π', () => {
    const c = cornerArc(v(0, 0), v(100, 0), v(100, 100), 20);
    expect(c.arcLength).toBeCloseTo((Math.PI / 2) * 20, 4);
    expect(c.feasibleRadius).toBeCloseTo(20, 4);
  });

  it('共线退化角返回零弧', () => {
    const c = cornerArc(v(0, 0), v(100, 0), v(200, 0), 20);
    expect(c.arcLength).toBe(0);
  });
});

describe('pointInRing', () => {
  const square = [v(0, 0), v(10, 0), v(10, 10), v(0, 10)];
  it('内部点为 true，外部点为 false', () => {
    expect(pointInRing(v(5, 5), square)).toBe(true);
    expect(pointInRing(v(15, 5), square)).toBe(false);
  });
});
