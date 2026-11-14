// 网格与笔画端点吸附
import type { SignElement, Vec2, WallSpec } from '../types';
import { closestOnPolyline, dist } from './geometry';

export interface SnapResult {
  point: Vec2;
  /** 吸附来源，用于叠加层提示 */
  source: 'grid' | 'endpoint' | 'none';
  /** 命中的元素 id（端点吸附时） */
  elementId?: string;
}

function snapGrid(p: Vec2, gridSize: number): Vec2 {
  return {
    x: Math.round(p.x / gridSize) * gridSize,
    y: Math.round(p.y / gridSize) * gridSize,
  };
}

/**
 * 吸附优先级：已有笔画端点 > 网格。
 * tolerance 为世界坐标容差(mm)。绘制中的当前元素自身端点不参与吸附，避免自吸。
 */
export function snapPoint(
  p: Vec2,
  wall: WallSpec,
  elements: SignElement[],
  options: { gridSize: number; tolerance: number; excludeId?: string },
): SnapResult {
  const { gridSize, tolerance, excludeId } = options;

  let best: { point: Vec2; d: number; id: string } | null = null;
  for (const el of elements) {
    if (el.id === excludeId) continue;
    if (el.kind === 'acrylic') {
      for (const ring of el.contours) {
        for (const ep of [ring[0], ring[ring.length - 1]]) {
          const d = dist(p, ep);
          if (d <= tolerance && (!best || d < best.d)) best = { point: ep, d, id: el.id };
        }
      }
    } else {
      const eps = [el.points[0], el.points[el.points.length - 1]];
      for (const ep of eps) {
        const d = dist(p, ep);
        if (d <= tolerance && (!best || d < best.d)) best = { point: ep, d, id: el.id };
      }
    }
  }
  if (best) return { point: best.point, source: 'endpoint', elementId: best.id };

  const g = snapGrid(p, gridSize);
  if (dist(p, g) <= tolerance && inWall(g, wall)) return { point: g, source: 'grid' };
  // 网格超容差时仍返回网格吸附（绘图体验：默认贴网格），但夹在墙面内
  return { point: clampToWall(g, wall), source: 'grid' };
}

export function inWall(p: Vec2, wall: WallSpec): boolean {
  return p.x >= 0 && p.y >= 0 && p.x <= wall.width && p.y <= wall.height;
}

export function clampToWall(p: Vec2, wall: WallSpec): Vec2 {
  return {
    x: Math.max(0, Math.min(wall.width, p.x)),
    y: Math.max(0, Math.min(wall.height, p.y)),
  };
}

/** 命中测试：找距离点击位置最近的元素（灯管按折线，亚克力按轮廓环） */
export function hitTest(
  p: Vec2,
  elements: SignElement[],
  pickRadius: number,
): SignElement | null {
  let best: { el: SignElement; d: number } | null = null;
  for (const el of elements) {
    let d = Infinity;
    if (el.kind === 'acrylic') {
      for (const ring of el.contours) {
        const r = closestOnPolyline(p, ring);
        d = Math.min(d, r.distance);
      }
    } else {
      d = closestOnPolyline(p, el.points).distance;
    }
    if (d <= pickRadius && (!best || d < best.d)) best = { el, d };
  }
  return best?.el ?? null;
}

/** 命中元素上的某个顶点，返回顶点索引（亚克力返回 [环, 点] 编码） */
export function hitVertex(
  p: Vec2,
  el: SignElement,
  pickRadius: number,
): { type: 'tube'; index: number } | { type: 'acrylic'; ring: number; index: number } | null {
  if (el.kind === 'acrylic') {
    for (let ri = 0; ri < el.contours.length; ri++) {
      for (let i = 0; i < el.contours[ri].length; i++) {
        if (dist(p, el.contours[ri][i]) <= pickRadius) return { type: 'acrylic', ring: ri, index: i };
      }
    }
    return null;
  }
  for (let i = 0; i < el.points.length; i++) {
    if (dist(p, el.points[i]) <= pickRadius) return { type: 'tube', index: i };
  }
  return null;
}
