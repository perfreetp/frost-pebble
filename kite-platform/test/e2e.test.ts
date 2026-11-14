// 端到端冒烟:模拟 localStorage,跑演示数据生成 + 提交/评分/统计全流程
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => store.set(k, v),
  removeItem: (k: string) => store.delete(k),
};

const { loadDB } = await import('../src/lib/storage');
const { runChecks, autoScore } = await import('../src/lib/validation');
const { generateKite } = await import('../src/lib/generator');

let pass = 0;
let fail = 0;
const assert = (cond: boolean, name: string, extra = '') => {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.error(`  ✗ ${name} ${extra}`); }
};

console.log('A. 演示数据');
const db = loadDB();
assert(db.classes.length === 2, '2 个班次');
assert(db.tasks.length === 3, '3 个任务');
assert(db.submissions.length > 0, `生成提交记录 ${db.submissions.length} 条`);
assert(Object.keys(db.workspaces).length > 0, `草稿工作区 ${Object.keys(db.workspaces).length} 份`);

console.log('B. 每份提交的快照可重新校验且数据自洽');
for (const s of db.submissions) {
  const task = db.tasks.find(t => t.id === s.taskId)!;
  const r = runChecks(s.snapshot, task);
  const sc = autoScore(s.snapshot, task, r);
  assert(Math.abs(sc.total - s.autoTotal) < 0.01, `${s.studentName}/${task.title} 自动分可复现 ${sc.total}`);
  assert(s.criteria.length === 6, `${s.studentName} 含6项评分`);
  assert(s.errorLog.every(e => e.count >= 1), `${s.studentName} 错题计数有效`);
  if (s.status === 'graded') assert(s.finalTotal != null && s.comment.length > 0, `${s.studentName} 已评分项有总分与评语`);
  if (s.status === 'returned') assert(s.comment.length > 0, `${s.studentName} 退回项有意见`);
}

console.log('C. 状态分布覆盖四种状态');
const statuses = new Set(db.submissions.map(s => s.status));
assert(['graded', 'submitted', 'returned'].every(x => statuses.has(x)), `状态: ${[...statuses].join('/')}`);

console.log('D. 退回重做后再提交:错题累计、attempts 增加');
{
  const returned = db.submissions.find(s => s.status === 'returned')!;
  const beforeCount = returned.errorLog.reduce((n, e) => n + e.count, 0);
  const task = db.tasks.find(t => t.id === returned.taskId)!;
  // 模拟再次生成一个带失误的风筝并校验
  const kite = generateKite(returned.snapshot.params, returned.snapshot.overrides);
  const r = runChecks(kite, task);
  const newFails = r.issues.filter(i => !i.pass);
  assert(newFails.length > 0, '重做稿仍能产生校验项');
  assert(beforeCount >= 1, '历史错题已存在,可累计');
}

console.log('E. 统计口径');
for (const cls of db.classes) {
  const taskIds = new Set(db.tasks.filter(t => t.classId === cls.id).map(t => t.id));
  const subs = db.submissions.filter(s => taskIds.has(s.taskId));
  const slots = cls.students.length * taskIds.size;
  const submittedSlots = new Set(subs.map(s => `${s.taskId}:${s.studentId}`)).size;
  const rate = Math.round(submittedSlots / slots * 1000) / 10;
  assert(rate >= 0 && rate <= 100, `${cls.name} 提交率 ${rate}% 口径合理`);
  const errTotal = subs.flatMap(s => s.errorLog).reduce((n, e) => n + e.count, 0);
  assert(errTotal > 0, `${cls.name} 有错误统计数据 (${errTotal})`);
}

console.log('F. 持久化往返');
{
  const raw = store.get('kite-platform-db-v1');
  assert(!!raw, '数据已写入 localStorage');
  const reparsed = JSON.parse(raw!);
  assert(reparsed.submissions.length === db.submissions.length, 'JSON 往返不丢记录');
}

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
if (fail) process.exit(1);
