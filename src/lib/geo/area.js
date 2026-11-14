// 鞋带公式面积(平面坐标,单位:平方公里,假定坐标单位为 km)
export function ringArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return a / 2;
}

// polygon: [ring, hole1, ...]; multipolygon: [polygon, ...]
export function polygonArea(poly) {
  if (!poly || !poly.length) return 0;
  let a = Math.abs(ringArea(poly[0]));
  for (let i = 1; i < poly.length; i++) a -= Math.abs(ringArea(poly[i]));
  return a;
}

export function multiPolygonArea(mp) {
  if (!mp) return 0;
  return mp.reduce((s, p) => s + polygonArea(p), 0);
}

export function centroid(mp) {
  // 取最大多边形的质心(近似:外环顶点平均)
  if (!mp || !mp.length) return [0, 0];
  let best = mp[0], bestA = -1;
  for (const p of mp) {
    const a = polygonArea(p);
    if (a > bestA) { bestA = a; best = p; }
  }
  const ring = best[0];
  let x = 0, y = 0, n = Math.max(1, ring.length - 1);
  for (let i = 0; i < ring.length - 1; i++) { x += ring[i][0]; y += ring[i][1]; }
  return [x / n, y / n];
}
