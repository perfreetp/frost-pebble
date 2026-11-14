// 核心算法冒烟测试：由 esbuild 打包后用 node 直接运行，不依赖浏览器/DOM
import { createSampleArea, createSampleDesign } from '../src/lib/sampleData';
import { generateHoles, checkAvoidance, type PlacementContext } from '../src/lib/placement';
import { computeStats, diffDesigns } from '../src/lib/diff';
import type { BlastDesign } from '../src/types';

let failures = 0;
function assert(cond: boolean, msg: string): void {
  if (cond) {
    console.log(`  ✓ ${msg}`);
  } else {
    failures++;
    console.error(`  ✗ ${msg}`);
  }
}

console.log('1) 示例设计生成（8000+ 孔）');
const area = createSampleArea();
const design = createSampleDesign(area);
assert(design.holes.length >= 8000, `孔位数 ${design.holes.length} >= 8000`);
const stats = computeStats(design);
assert(stats.totalHoles === design.holes.length, '统计孔数一致');
assert(stats.skippedHoles > 0, `存在避让跳过孔（${stats.skippedHoles} 个）`);
assert(stats.effectiveHoles + stats.skippedHoles === stats.totalHoles, '有效+跳过=总数');
assert(stats.totalCharge > 0, `总装药量 ${stats.totalCharge}kg > 0`);
const skipWithReason = design.holes
  .filter((h) => h.state === 'skipped')
  .every((h) => typeof h.skipReason === 'string' && h.skipReason.length > 0);
assert(skipWithReason, '每个跳过孔都带避让原因');
const skippedZeroCharge = design.holes
  .filter((h) => h.state === 'skipped')
  .every((h) => h.charge === 0 && h.detonatorDelay === -1);
assert(skippedZeroCharge, '跳过孔装药量为 0 且无雷管段位');

console.log('2) 避让检查');
const ctx: PlacementContext = {
  benchPolygon: design.benchPolygon,
  slopes: design.slopes,
  voids: design.voids,
  pipelines: design.pipelines,
  contours: design.contours,
  chargeParams: design.chargeParams,
  delays: design.delays.map((d) => d.delay),
};
assert(checkAvoidance({ x: -50, y: -50 }, ctx) === '超出台阶平面范围', '台阶外被拒绝');
const voidCenter = {
  x: design.voids[0].polygon.points.reduce((s, p) => s + p.x, 0) / design.voids[0].polygon.points.length,
  y: design.voids[0].polygon.points.reduce((s, p) => s + p.y, 0) / design.voids[0].polygon.points.length,
};
assert((checkAvoidance(voidCenter, ctx) ?? '').includes('空区'), '空区中心被拒绝并指明空区');
assert(checkAvoidance({ x: 50, y: 40 }, ctx) === null, '正常区域允许布孔');

console.log('3) 阵列重算（改间距/排距）');
const arr = design.arrays[0];
const before = design.holes.length;
const row0 = arr.rows[0];
arr.rows = arr.rows.map((r) => (r.id === row0.id ? { ...r, spacing: 1.5 } : r));
const holes2 = generateHoles(arr, ctx);
assert(holes2.length === before, `改间距后孔数不变（${holes2.length}）`);
const row1First = design.holes.find((h) => h.rowId === arr.rows[1].id)!;
// 第二排的法向位置由首排 burden 累计决定：改首排排距
arr.rows = arr.rows.map((r, i) => (i === 0 ? { ...r, burden: 2.0 } : r));
const holes3 = generateHoles(arr, ctx);
const row1After = holes3.find((h) => h.code === row1First.code)!;
const moved = Math.hypot(row1After.x - row1First.x, row1After.y - row1First.y);
assert(Math.abs(moved - 0.8) < 1e-6, `首排排距 1.2→2.0 后第二排平移 0.8m（实测 ${moved.toFixed(2)}m）`);

console.log('4) 版本对比与超差标红');
const v2: BlastDesign = {
  ...design,
  version: 2,
  holes: design.holes.slice(0, Math.floor(design.holes.length * 0.9)),
};
const diff = diffDesigns(design, v2);
assert(diff.oldVersion === 1 && diff.newVersion === 2, '版本号正确');
const holeMetric = diff.metrics.find((m) => m.key === 'totalHoles')!;
assert(holeMetric.delta < 0, '孔数差值为负');
assert(holeMetric.outOfTolerance === true, '孔数减少超过容差被标红');
const depthMetric = diff.metrics.find((m) => m.key === 'avgDepth')!;
assert(depthMetric.outOfTolerance === false, '平均孔深未变判定合格');

console.log('5) 雷管段位分配');
const delaysUsed = new Set(design.holes.filter((h) => h.state === 'normal').map((h) => h.detonatorDelay));
assert(delaysUsed.size > 1, `有效孔覆盖多个段位（${delaysUsed.size} 个）`);
assert([...delaysUsed].every((d) => d >= 1 && d <= 20), '段位都在定义范围内');

if (failures > 0) {
  console.error(`\n${failures} 项断言失败`);
  process.exit(1);
}
console.log('\n全部断言通过');
