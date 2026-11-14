// 纯逻辑冒烟测试：缓动、关键帧求值、区间复制、自动核对
// 运行：node scripts/smoke-test.mjs（由 npm 脚本经 esbuild 临时打包）
import assert from 'node:assert';
import {
  applyEasing, autoCheckSubmission, copyActionRange, countKeyframes,
  emptyTrack, evalTrack, upsertKeyframe,
} from '../src/lib/anim.ts';
import { EASE_EASING, LINEAR_EASING } from '../src/types.ts';

let passed = 0;
const ok = (name, cond) => { assert.ok(cond, name); passed++; console.log('  ✓', name); };

// 1. 缓动：端点固定、线性中点 0.5、缓入缓出中点仍为 0.5
assert.strictEqual(applyEasing(0, EASE_EASING), 0);
assert.strictEqual(applyEasing(1, EASE_EASING), 1);
ok('缓动端点固定为 0/1', true);
assert.strictEqual(Math.abs(applyEasing(0.5, EASE_EASING) - 0.5) < 1e-6, true);
ok('对称缓入缓出曲线过中点 (0.5,0.5)', Math.abs(applyEasing(0.5, EASE_EASING) - 0.5) < 1e-6);
assert.strictEqual(Math.abs(applyEasing(0.5, LINEAR_EASING) - 0.5) < 1e-9, true);
ok('线性缓动中点为 0.5', true);
assert.ok(applyEasing(0.25, EASE_EASING) < 0.25, '缓入段应慢于线性');
assert.ok(applyEasing(0.75, EASE_EASING) > 0.75, '缓出段应快于线性');
ok('缓入段滞后、缓出段超前', true);

// 2. 关键帧求值与插值
const course = {
  id: 'c1', name: '测试针法', difficulty: '进阶', requiredDuration: 48,
  requiredActions: ['起针', '收针'], assigneeIds: [], parts: [],
  joints: [{ id: 'j1', name: '关节1', x: 100, y: 100, parentId: null }],
  demoTrack: null, createdAt: 0,
};
let track = emptyTrack(48);
track = upsertKeyframe(track, 'j1', { frame: 0, x: 0, y: 0, rotation: 0, easing: { ...LINEAR_EASING } });
track = upsertKeyframe(track, 'j1', { frame: 10, x: 100, y: 200, rotation: 90, easing: { ...LINEAR_EASING } });
const mid = evalTrack(track, 5, course.joints).get('j1');
ok('中间帧线性插值位置', Math.abs(mid.x - 50) < 1e-6 && Math.abs(mid.y - 100) < 1e-6);
ok('中间帧角度插值(弧度)', Math.abs(mid.rotation - Math.PI / 4) < 1e-6);
const end = evalTrack(track, 10, course.joints).get('j1');
ok('关键帧精确命中', end.x === 100 && end.y === 200);
const beyond = evalTrack(track, 40, course.joints).get('j1');
ok('超出末帧保持末姿态', beyond.x === 100);

// 3. 同位置覆盖而不是新增
track = upsertKeyframe(track, 'j1', { frame: 10, x: 120, y: 200, rotation: 90, easing: { ...LINEAR_EASING } });
ok('同帧 upsert 覆盖关键帧', countKeyframes(track) === 2);

// 4. 动作区间复制
track = upsertKeyframe(track, 'j1', { frame: 20, x: 0, y: 0, rotation: 0, easing: { ...LINEAR_EASING } });
const copied = copyActionRange(track, 0, 10, 30);
const copiedKfs = copied.joints[0].keyframes;
ok('复制后目标区间出现对应关键帧', copiedKfs.some((k) => k.frame === 30) && copiedKfs.some((k) => k.frame === 40));
ok('复制保留源区间关键帧', copiedKfs.some((k) => k.frame === 0) && copiedKfs.some((k) => k.frame === 10));
const k40 = copiedKfs.find((k) => k.frame === 40);
ok('复制的关键帧数值随帧偏移保持一致', k40.x === 120 && k40.y === 200);

// 5. 自动核对：空作品
const empty = emptyTrack(48);
const checkEmpty = autoCheckSubmission(course, empty);
ok('空作品判定不通过且 0 分', checkEmpty.passed === false && checkEmpty.score === 0);

// 6. 自动核对：合格作业（首尾闭合、时长一致、动作区间有关键帧）
let good = emptyTrack(48);
good.actions = [
  { id: 'a1', name: '起针', startFrame: 0, endFrame: 24 },
  { id: 'a2', name: '收针', startFrame: 24, endFrame: 48 },
];
for (const [f, x, y] of [[0, 100, 100], [12, 200, 150], [36, 150, 180], [48, 100, 100]]) {
  good = upsertKeyframe(good, 'j1', { frame: f, x, y, rotation: 0, easing: { ...EASE_EASING } });
}
const checkGood = autoCheckSubmission(course, good);
ok('合格作业无扣分', checkGood.passed === true && checkGood.score === 100);
ok('合格作业循环闭合', checkGood.loopClosed === true);
ok('两个关键动作均检出', checkGood.actionsFound.every((a) => a.found));

// 7. 自动核对：时长超 5 帧 + 首尾不闭合 + 缺动作
let bad = emptyTrack(60);
bad.actions = [...good.actions];
for (const [f, x, y] of [[0, 100, 100], [20, 260, 260]]) {
  bad = upsertKeyframe(bad, 'j1', { frame: f, x, y, rotation: 0, easing: { ...EASE_EASING } });
}
const checkBad = autoCheckSubmission(course, bad);
ok('时长误差 12 帧被扣分', checkBad.issues.some((i) => i.code === 'duration'));
ok('首尾不闭合被扣分', checkBad.issues.some((i) => i.code === 'loop_close'));
ok('缺关键动作被扣分', checkBad.issues.some((i) => i.code === 'action_missing'));
ok('扣分项汇总后分数低于 60', checkBad.score < 60 && checkBad.passed === false);

// 8. 边界：时长恰好差 5 帧不扣分
let edge = emptyTrack(53);
edge.actions = [...good.actions];
for (const [f, x, y] of [[0, 100, 100], [12, 200, 150], [36, 150, 180], [53, 100, 100]]) {
  edge = upsertKeyframe(edge, 'j1', { frame: f, x, y, rotation: 0, easing: { ...EASE_EASING } });
}
const checkEdge = autoCheckSubmission(course, edge);
ok('时长偏差恰为 5 帧在容忍范围内', !checkEdge.issues.some((i) => i.code === 'duration'));

console.log(`\n全部 ${passed} 项断言通过`);
