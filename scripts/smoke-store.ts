// 状态流冒烟测试：审核门禁、归档限制、版本流转（localStorage 用内存桩替代）
const mem = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => mem.set(k, v),
  removeItem: (k: string) => mem.delete(k),
};

const { useStore } = await import('../src/store/useStore');
const store = useStore;

let failures = 0;
function assert(cond: boolean, msg: string): void {
  if (cond) console.log(`  ✓ ${msg}`);
  else { failures++; console.error(`  ✗ ${msg}`); }
}

store.getState().loadSample();
let s = store.getState();
const designId = s.activeDesignId!;
assert(s.designs.find((d) => d.id === designId)!.status === 'draft', '初始为草稿');

console.log('1) 草稿直接归档应被拒绝');
store.getState().archive();
assert(store.getState().designs.find((d) => d.id === designId)!.status === 'draft', '草稿不能归档');

console.log('2) 提交审核 → 驳回 → 仍不能归档');
store.getState().submitReview('张工', '送审');
assert(store.getState().designs.find((d) => d.id === designId)!.status === 'submitted', '状态变为待审核');
store.getState().reject('李矿长', '排距偏大，请重新核算');
const rejected = store.getState().designs.find((d) => d.id === designId)!;
assert(rejected.status === 'rejected', '状态变为审核未过');
assert(rejected.rejectReason === '排距偏大，请重新核算', '驳回原因已记录');
store.getState().archive();
assert(store.getState().designs.find((d) => d.id === designId)!.status === 'rejected', '审核未过不能归档');

console.log('3) 修改后重新送审 → 通过 → 归档');
store.getState().submitReview('张工', '已调整排距');
store.getState().approve('李矿长', '同意');
assert(store.getState().designs.find((d) => d.id === designId)!.status === 'approved', '审核通过');
store.getState().archive();
const archived = store.getState().designs.find((d) => d.id === designId)!;
assert(archived.status === 'archived' && !!archived.archivedAt, '已定稿归档并记录时间');

console.log('4) 归档版本只读保护');
const before = archived.holes.length;
store.getState().placeAt({ x: 100, y: 100 });
assert(store.getState().designs.find((d) => d.id === designId)!.holes.length === before, '归档后布孔被拦截');

console.log('5) 另存新版本');
const newId = store.getState().saveAsNewVersion()!;
const v2 = store.getState().designs.find((d) => d.id === newId)!;
assert(v2.version === 2 && v2.status === 'draft', '新版本号 +1 且回到草稿');
assert(v2.holes.length === before, '新版本继承全部孔位');
assert(v2.id !== designId && v2.arrays[0].id !== archived.arrays[0].id, '新版本获得独立 ID 谱系');

console.log('6) 持久化');
assert(mem.has('mine-blast-design-v1'), '数据已写入 localStorage');
const parsed = JSON.parse(mem.get('mine-blast-design-v1')!) as { designs: unknown[] };
assert(parsed.designs.length === 2, '持久化包含两个版本');

if (failures > 0) {
  console.error(`\n${failures} 项断言失败`);
  process.exit(1);
}
console.log('\n状态流全部断言通过');
