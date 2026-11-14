// 路径布尔运算封装(并/交/差),坐标均为 MultiPolygon 结构
import pc from 'polygon-clipping';

function asMP(geom) {
  if (!geom || !geom.length) return [];
  return geom;
}

export function union(a, b) {
  if (!a || !a.length) return asMP(b);
  if (!b || !b.length) return asMP(a);
  return pc.union(a, b);
}

export function intersect(a, b) {
  if (!a || !a.length || !b || !b.length) return [];
  return pc.intersection(a, b);
}

export function difference(a, b) {
  if (!a || !a.length) return [];
  if (!b || !b.length) return asMP(a);
  return pc.difference(a, b);
}

// 把一组分区多边形合并为一个完整分区(依次并集)
export function mergeAll(polys) {
  let acc = [];
  for (const p of polys) acc = union(acc, p);
  return acc;
}
