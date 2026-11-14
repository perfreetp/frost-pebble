// 核心逻辑冒烟测试:确定性、覆盖项保留、校验与评分
import { generateKite, TYPE_SPEC, emptyOverrides } from '../src/lib/generator';
import { runChecks, autoScore } from '../src/lib/validation';
import type { KiteParams, Task } from '../src/types';
import { dist } from '../src/lib/geom';

let pass = 0;
let fail = 0;
function assert(cond: boolean, name: string, extra = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.error(`  ✗ ${name} ${extra}`); }
}

const baseParams: KiteParams = {
  seed: 42, skeleton: 'diamond', stripCount: 6, wingspan: 1.2, panelCount: 4, tolerancePct: 3,
};
const task: Task = {
  id: 't', title: '测试任务', classId: 'c', createdAt: 0,
  skeleton: 'diamond', stripCount: 6, wingspan: 1.2, panelCount: 4, tolerancePct: 3,
};

console.log('1. 同种子确定性');
{
  const a = generateKite(baseParams);
  const b = generateKite({ ...baseParams });
  assert(JSON.stringify(a.strips) === JSON.stringify(b.strips), '竹条两次生成完全一致');
  assert(JSON.stringify(a.panels) === JSON.stringify(b.panels), '蒙面分片两次生成完全一致');
  assert(JSON.stringify(a.seams) === JSON.stringify(b.seams), '接缝两次生成完全一致');
  const c = generateKite({ ...baseParams, seed: 43 });
  assert(JSON.stringify(c.strips) !== JSON.stringify(a.strips), '不同种子结果不同');
}

console.log('2. 四种骨架均可生成且数量受控');
{
  for (const sk of ['diamond', 'hexagon', 'hardwing', 'softwing'] as const) {
    const spec = TYPE_SPEC[sk];
    const k = generateKite({ ...baseParams, skeleton: sk, stripCount: spec.minStrips + 1, panelCount: spec.minPanels + 1 });
    assert(k.strips.length === spec.minStrips + 1, `${sk} 竹条数量=${k.strips.length}`);
    assert(k.panels.length === spec.minPanels + 1, `${sk} 分片数量=${k.panels.length}`);
    assert(k.silhouette.length >= 4, `${sk} 轮廓点数=${k.silhouette.length}`);
  }
  const clamped = generateKite({ ...baseParams, stripCount: 99, panelCount: 99 });
  assert(clamped.strips.length === TYPE_SPEC.diamond.maxStrips, '竹条数超上限被钳制');
}

console.log('3. 手动修改在换参数重新生成后保留');
{
  const k1 = generateKite(baseParams);
  const target = k1.strips.find(s => s.id.endsWith('_r'))!;
  const ov = {
    ...emptyOverrides(),
    stripOffset: { [target.id]: { x: 0.03, y: 0.01, z: 0 } },
    curvature: { [target.id]: 0.33 },
    seamOffset: { seam_1: { x: 0.02, y: 0, z: 0 } },
  };
  const k2 = generateKite({ ...baseParams, stripCount: 8, wingspan: 1.5, panelCount: 6 }, ov);
  const again = k2.strips.find(s => s.id === target.id)!;
  assert(!!again, `目标竹条 ${target.id} 在新参数下仍存在`);
  assert(Math.abs(again.curvature - 0.33) < 1e-9, '弧度覆盖被保留');
  const base = generateKite({ ...baseParams, stripCount: 8, wingspan: 1.5, panelCount: 6 });
  const baseStrip = base.strips.find(s => s.id === target.id)!;
  assert(Math.abs(again.a.x - (baseStrip.a.x + 0.03)) < 1e-9, '平移偏移按 id 重新套用');
  assert(Math.abs(k2.seams.find(s => s.id === 'seam_1')!.pos.x - (base.seams.find(s => s.id === 'seam_1')!.pos.x + 0.02)) < 1e-9, '接缝偏移被保留');
}

console.log('4. 校验:无修改的风筝应通过对称/尺寸类检查');
{
  const k = generateKite(baseParams);
  const r = runChecks(k, task);
  const structuralFails = r.issues.filter(i => !i.pass && ['sym_strip', 'sym_spine', 'sym_seam', 'wingspan', 'strip_count', 'panel_count'].includes(i.code));
  assert(structuralFails.length === 0, `无修改风筝结构类检查全通过(实际失败 ${structuralFails.map(i => i.code).join(',') || '无'})`);
}

console.log('5. 校验:手动失误能被检出并标红,含偏差值');
{
  const k1 = generateKite(baseParams);
  const target = k1.strips.find(s => s.id.endsWith('_r'))!;
  const ov = {
    ...emptyOverrides(),
    stripOffset: { [target.id]: { x: 0.09, y: 0.02, z: 0 } },
  };
  const k2 = generateKite(baseParams, ov);
  const r = runChecks(k2, task);
  const symFail = r.issues.find(i => i.code === 'sym_strip' && i.targetId === target.id && !i.pass);
  assert(!!symFail, '不对称竹条被检出并关联 targetId 标红');
  assert(typeof symFail?.deviationMm === 'number' && symFail.deviationMm > 0, `偏差值为正数 mm: ${symFail?.deviationMm}`);
}

console.log('6. 自动评分在 0..100 且六类齐全');
{
  const k = generateKite(baseParams);
  const r = runChecks(k, task);
  const sc = autoScore(k, task, r);
  assert(sc.criteria.length === 6, '六个评分项');
  assert(Math.abs(sc.criteria.reduce((s, c) => s + c.autoScore, 0) - sc.total) < 1e-6, '总分=各项之和');
  assert(sc.total >= 0 && sc.total <= 100, `总分在 0..100: ${sc.total}`);
  assert(sc.criteria.every(c => c.autoScore >= 0 && c.autoScore <= c.maxScore), '每项不超满分');
}

console.log('7. 成对竹条镜像关系与接缝镜像');
{
  const k = generateKite({ ...baseParams, skeleton: 'hardwing', stripCount: 9, panelCount: 5 });
  const pairs = k.strips.filter(s => s.mirrorId);
  assert(pairs.length >= 4, `硬翅含镜像对竹条: ${pairs.length} 根`);
  const byId = new Map(k.strips.map(s => [s.id, s]));
  let mirrorOk = true;
  for (const s of pairs) {
    const m = byId.get(s.mirrorId!);
    if (!m || Math.abs(s.a.x + m.a.x) > 0.05) mirrorOk = false;
  }
  assert(mirrorOk, '镜像对端点 x 近似相反');
  assert(k.seams.every(s => s.mirrorId === undefined || byId.has(s.mirrorId) || k.seams.some(q => q.id === s.mirrorId)), '接缝镜像 id 有效');
}

console.log('8. 提线点校验');
{
  const k = generateKite(baseParams);
  const r1 = runChecks(k, task);
  assert(r1.issues.filter(i => i.code.startsWith('bridle') && !i.pass).length === 0, '默认提线点通过');
  const bad = { ...k, bridle: { ...k.bridle, knot: { x: 0.08, y: 0, z: -0.05 } } };
  const r2 = runChecks(bad, task);
  assert(r2.issues.some(i => i.code === 'bridle_x' && !i.pass), '提线左右偏移被检出');
  assert(r2.issues.some(i => i.code === 'bridle_z' && !i.pass), '提线前后距离被检出');
}

console.log('9. 几何工具');
{
  assert(dist({ x: 3, y: 4, z: 0 }, { x: 0, y: 0, z: 0 }) === 5, 'dist 计算正确');
}

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
if (fail) process.exit(1);
