// 版本比对:新增/删除/移动边界,差异面积占比
import { union, difference, mergeAll } from './boolean.js';
import { multiPolygonArea, centroid } from './area.js';

// zones: [{id, name, color, geom: MultiPolygon}]
export function compareVersions(oldZones, newZones, moveThresholdKm = 1.5) {
  const oldUnion = mergeAll((oldZones || []).map((z) => z.geom));
  const newUnion = mergeAll((newZones || []).map((z) => z.geom));

  const added = difference(newUnion, oldUnion);   // 新增区域
  const removed = difference(oldUnion, newUnion); // 删除区域

  const oldArea = multiPolygonArea(oldUnion);
  const addedArea = multiPolygonArea(added);
  const removedArea = multiPolygonArea(removed);
  const diffArea = addedArea + removedArea;
  const diffRatio = oldArea > 0 ? diffArea / oldArea : (diffArea > 0 ? 1 : 0);

  // 移动检测:按名称匹配的分区,质心位移超阈值或面积明显变化
  const moved = [];
  const oldByName = new Map((oldZones || []).map((z) => [z.name, z]));
  for (const z of newZones || []) {
    const o = oldByName.get(z.name);
    if (!o) continue;
    const co = centroid(o.geom), cn = centroid(z.geom);
    const shift = Math.hypot(co[0] - cn[0], co[1] - cn[1]);
    const ao = multiPolygonArea(o.geom), an = multiPolygonArea(z.geom);
    const areaChg = ao > 0 ? Math.abs(an - ao) / ao : 0;
    if (shift > moveThresholdKm || areaChg > 0.05) {
      moved.push({ name: z.name, shift: +shift.toFixed(2), areaChange: +(areaChg * 100).toFixed(1) });
    }
  }

  const addedZones = (newZones || []).filter((z) => !oldByName.has(z.name)).map((z) => z.name);
  const newNames = new Set((newZones || []).map((z) => z.name));
  const removedZones = (oldZones || []).filter((z) => !newNames.has(z.name)).map((z) => z.name);

  return {
    added, removed,
    addedArea: +addedArea.toFixed(2),
    removedArea: +removedArea.toFixed(2),
    diffArea: +diffArea.toFixed(2),
    diffRatio: +diffRatio.toFixed(4),
    diffPercent: +(diffRatio * 100).toFixed(1),
    moved, addedZones, removedZones,
    needChangeNote: diffRatio > 0.05
  };
}
