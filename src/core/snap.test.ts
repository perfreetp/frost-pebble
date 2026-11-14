import { describe, expect, it } from 'vitest';
import type { TubeElement } from '../types';
import { hitTest, snapPoint } from './snap';
import { v } from './geometry';

const wall = { width: 3000, height: 1200, offsetX: 0, offsetY: 0, photo: '' };

function tube(id: string, pts: [number, number][]): TubeElement {
  return {
    id, kind: 'tube-single', color: { r: 1, g: 1, b: 1 },
    points: pts.map(([x, y]) => v(x, y)), diameter: 8, cornerRadii: [],
  };
}

describe('snapPoint', () => {
  it('优先吸附已有笔画端点', () => {
    const els = [tube('a', [[500, 500], [800, 500]])];
    const r = snapPoint(v(505, 498), wall, els, { gridSize: 50, tolerance: 20 });
    expect(r.source).toBe('endpoint');
    expect(r.point).toEqual({ x: 500, y: 500 });
    expect(r.elementId).toBe('a');
  });

  it('无端点时吸附网格', () => {
    const r = snapPoint(v(507, 309), wall, [], { gridSize: 50, tolerance: 20 });
    expect(r.source).toBe('grid');
    expect(r.point).toEqual({ x: 500, y: 300 });
  });

  it('排除自身元素，避免自吸', () => {
    const els = [tube('a', [[500, 500], [800, 500]])];
    const r = snapPoint(v(502, 500), wall, els, { gridSize: 50, tolerance: 20, excludeId: 'a' });
    expect(r.source).toBe('grid');
  });

  it('结果夹在墙面范围内', () => {
    const r = snapPoint(v(-50, -50), wall, [], { gridSize: 50, tolerance: 5 });
    expect(r.point.x).toBeGreaterThanOrEqual(0);
    expect(r.point.y).toBeGreaterThanOrEqual(0);
  });
});

describe('hitTest', () => {
  it('命中距离最近的灯管', () => {
    const els = [tube('a', [[0, 0], [1000, 0]]), tube('b', [[0, 500], [1000, 500]])];
    expect(hitTest(v(300, 510), els, 30)?.id).toBe('b');
    expect(hitTest(v(300, 900), els, 30)).toBeNull();
  });
});
