// 点位吸附:优先吸附乡镇界最近点,其次网格交点,取更近者;超出阈值不吸附
function dist2(a, b) {
  const dx = a[0] - b[0], dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

// 点到线段最近点
function nearestOnSegment(p, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1];
  const len2 = vx * vx + vy * vy;
  let t = len2 === 0 ? 0 : ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / len2;
  t = Math.max(0, Math.min(1, t));
  return [a[0] + t * vx, a[1] + t * vy];
}

export function nearestOnBoundary(p, townshipRings) {
  let best = null, bestD = Infinity;
  for (const ring of townshipRings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const q = nearestOnSegment(p, ring[i], ring[i + 1]);
      const d = dist2(p, q);
      if (d < bestD) { bestD = d; best = q; }
    }
  }
  return best ? { point: best, dist: Math.sqrt(bestD), kind: 'boundary' } : null;
}

export function nearestGrid(p, gridSize) {
  const gx = Math.round(p[0] / gridSize) * gridSize;
  const gy = Math.round(p[1] / gridSize) * gridSize;
  const g = [gx, gy];
  return { point: g, dist: Math.sqrt(dist2(p, g)), kind: 'grid' };
}

// 返回 { point, kind, snapped } ;threshold 单位与坐标一致(km)
export function snapPoint(p, townshipRings, gridSize, threshold) {
  const candidates = [];
  const b = nearestOnBoundary(p, townshipRings);
  if (b && b.dist <= threshold) candidates.push(b);
  const g = nearestGrid(p, gridSize);
  if (g.dist <= threshold) candidates.push(g);
  if (!candidates.length) return { point: p, kind: null, snapped: false };
  candidates.sort((a, b2) => a.dist - b2.dist);
  const c = candidates[0];
  return { point: c.point, kind: c.kind, snapped: true };
}
