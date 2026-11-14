// 全局状态 + localStorage 持久化 + 时间线(Svelte 5 runes 模块)
import { STORAGE_KEY, DEFAULT_SHED, EQUIP_TYPES } from './constants.js';
import { validateShed, buildBOM, snapGrid } from './geometry.js';

let uidSeq = 1;
export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${(uidSeq++).toString(36)}`;

function now() {
  return new Date().toLocaleString('zh-CN', { hour12: false });
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('本地数据读取失败', e);
  }
  return null;
}

const seed = load();

export const state = $state({
  user: seed?.user ?? null,                 // { name, role }
  projects: seed?.projects ?? [],           // 项目列表
  route: { name: seed?.user ? 'dashboard' : 'login', params: {} }
});

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    user: state.user,
    projects: state.projects
  }));
}

// ---------- 时间线 ----------
export function addTimeline(project, action, detail = '') {
  project.timeline.push({
    id: uid('tl'), time: now(), user: state.user?.name ?? '系统',
    role: state.user?.role ?? '', action, detail
  });
}

// ---------- 登录 / 登出 ----------
export function login(name, role) {
  state.user = { name, role };
  state.route = { name: 'dashboard', params: {} };
  persist();
}
export function logout() {
  state.user = null;
  state.route = { name: 'login', params: {} };
  persist();
}

export function go(name, params = {}) {
  state.route = { name, params };
}

// ---------- 项目 ----------
export function createProject(form) {
  const p = {
    id: uid('prj'),
    code: `JD-${new Date().getFullYear()}-${String(state.projects.length + 1).padStart(3, '0')}`,
    name: form.name,
    customer: form.customer,
    maker: form.maker,
    supervisor: form.supervisor,
    shedCount: Number(form.shedCount),
    layers: Number(form.layers),          // 需求层数
    loadPerLayer: Number(form.loadPerLayer), // 单层承重 kg
    deadline: form.deadline,
    status: '制作中',
    reworkCount: 0,
    shedRework: {},                        // shedId -> 返工次数
    version: 'v1.0',
    deliveredAt: null,
    packageId: null,
    createdAt: now(),
    timeline: [],
    sheds: [],
    returnReason: ''
  };
  for (let i = 0; i < p.shedCount; i++) {
    p.sheds.push(makeShed(i + 1));
  }
  addTimeline(p, '客户下单', `${p.shedCount} 个菇棚,需求 ${p.layers} 层,单层承重 ${p.loadPerLayer}kg,交期 ${p.deadline}`);
  state.projects.unshift(p);
  persist();
  return p;
}

function makeShed(index) {
  return {
    id: uid('shed'),
    index,
    name: `${index}号棚`,
    w: DEFAULT_SHED.w,
    d: DEFAULT_SHED.d,
    h: DEFAULT_SHED.h,
    objects: seedColumns(DEFAULT_SHED.w, DEFAULT_SHED.d)
  };
}

// 棚内默认立柱:沿长边两列
function seedColumns(w, d) {
  const cols = [];
  const xs = [w * 0.25, w * 0.75];
  const zs = [3, d / 2, d - 3];
  for (const x of xs) for (const z of zs) {
    cols.push(makeObject('column', x, z, 0));
  }
  return cols;
}

let codeSeq = {};
export function makeObject(type, x, z, y = 0) {
  const t = EQUIP_TYPES[type];
  codeSeq[type] = (codeSeq[type] || 0) + 1;
  const prefix = { rack: 'SJ', tray: 'TP', pipe: 'JS', fan: 'FJ', light: 'CG', column: 'LZ' }[type];
  return {
    id: uid('obj'),
    type,
    code: `${prefix}-${String(codeSeq[type]).padStart(3, '0')}`,
    x, z, y,
    rotY: 0,
    size: { w: t.w, d: t.d, h: t.h }
  };
}

export function getProject(id) {
  return state.projects.find((p) => p.id === id);
}

export function saveProject(p, action, detail = '') {
  if (action) addTimeline(p, action, detail);
  persist();
}

// ---------- 棚内编辑 ----------
// 安全落点:两排立柱(x=3/9)之间的走廊,6 个槽位(均在 0.5m 网格上)循环使用
const SAFE_SLOTS = [
  { x: 4.5, z: 8 }, { x: 6, z: 8 }, { x: 7.5, z: 8 },
  { x: 4.5, z: 22 }, { x: 6, z: 22 }, { x: 7.5, z: 22 }
];

function nextSlot(shed) {
  const used = new Set(shed.objects.filter((o) => o.type !== 'column').map((o) => `${o.x},${o.z}`));
  return SAFE_SLOTS.find((s) => !used.has(`${s.x},${s.z}`)) ?? SAFE_SLOTS[SAFE_SLOTS.length - 1];
}

export function addObject(project, shedId, type) {
  const shed = project.sheds.find((s) => s.id === shedId);
  const slot = nextSlot(shed);
  const o = makeObject(type, slot.x, slot.z, type === 'pipe' ? 2.6 : type === 'light' ? 3.6 : 0);
  const snapped = snapGrid(o);
  shed.objects.push(snapped);
  addTimeline(project, '摆放设备', `${shed.name}:${EQUIP_TYPES[type].name} ${snapped.code}`);
  persist();
  return snapped;
}

export function updateObject(project, shedId, obj) {
  const shed = project.sheds.find((s) => s.id === shedId);
  const i = shed.objects.findIndex((o) => o.id === obj.id);
  if (i >= 0) shed.objects[i] = obj;
  persist();
}

export function removeObject(project, shedId, objId) {
  const shed = project.sheds.find((s) => s.id === shedId);
  const o = shed.objects.find((x) => x.id === objId);
  if (!o) return;
  if (o.type === 'column') {
    alert('立柱为棚体结构,不可删除');
    return;
  }
  shed.objects = shed.objects.filter((x) => x.id !== objId);
  addTimeline(project, '删除设备', `${shed.name}:${EQUIP_TYPES[o.type].name} ${o.code}`);
  persist();
}

// ---------- 校验 / 提交 / 审核 ----------
export function projectValidation(p) {
  const perShed = p.sheds.map((s) => ({ shed: s, ...validateShed(s) }));
  const total = perShed.reduce((n, r) => n + r.violations.length, 0);
  return { perShed, total, bom: buildBOM(p.sheds) };
}

export function submitForReview(p) {
  const { total } = projectValidation(p);
  if (total > 0) {
    return { ok: false, msg: `仍有 ${total} 项碰撞/违规未处理,无法提交` };
  }
  p.status = '待审核';
  addTimeline(p, '提交审核', '制作员提交三维布置方案');
  persist();
  return { ok: true };
}

export function rejectProject(p, reason) {
  p.status = '已退回';
  p.returnReason = reason;
  p.reworkCount += 1;
  for (const s of p.sheds) p.shedRework[s.id] = (p.shedRework[s.id] || 0) + 1;
  const v = p.version.replace(/v(\d+)\.(\d+)/, (m, a, b) => `v${a}.${Number(b) + 1}`);
  p.version = v;
  addTimeline(p, '整单退回', `原因:${reason}(第 ${p.reworkCount} 次返工)`);
  persist();
}

export function approveAndPackage(p) {
  const { total, bom } = projectValidation(p);
  if (total > 0) return { ok: false, msg: `存在 ${total} 项违规,不能通过` };
  p.status = '已交付';
  p.deliveredAt = now();
  p.packageId = `PKG-${p.code.replace('JD-', '')}-${p.version.replace('.', '')}`;
  addTimeline(p, '审核通过并打包', `交付包 ${p.packageId},版本 ${p.version}`);
  persist();
  return { ok: true, bom };
}

// 退回后制作员修改完毕重新提交
export function resubmit(p) {
  const { total } = projectValidation(p);
  if (total > 0) return { ok: false, msg: `仍有 ${total} 项违规未处理` };
  p.status = '待审核';
  p.returnReason = '';
  addTimeline(p, '返工后重新提交', `累计返工 ${p.reworkCount} 次`);
  persist();
  return { ok: true };
}

// ---------- 导出 ----------
export function exportJSON(p) {
  const { bom, perShed, total } = projectValidation(p);
  const payload = {
    交付包编号: p.packageId,
    项目编号: p.code,
    项目名称: p.name,
    版本: p.version,
    交付时间: p.deliveredAt,
    交期: p.deadline,
    需求: { 菇棚数量: p.shedCount, 层数: p.layers, 单层承重kg: p.loadPerLayer },
    物料清单: bom.map((b) => ({ 物料: b.name, 数量: b.qty, 单位: b.unit })),
    碰撞告警数: total,
    各棚告警: perShed.map((r) => ({ 棚: r.shed.name, 告警: r.violations.map((v) => v.reason) })),
    三维数据: p.sheds.map((s) => ({
      棚: s.name, 尺寸: { 宽: s.w, 深: s.d, 高: s.h },
      物体: s.objects.map((o) => ({
        编号: o.code, 类型: EQUIP_TYPES[o.type].name,
        位置: { x: o.x, y: o.y, z: o.z }, 旋转: o.rotY, 尺寸: o.size
      }))
    })),
    时间线: p.timeline
  };
  download(`${p.packageId || p.code}-交付包.json`, JSON.stringify(payload, null, 2), 'application/json');
}

export function exportBOMCSV(p) {
  const { bom } = projectValidation(p);
  const rows = [
    ['项目编号', p.code, '项目名称', p.name],
    ['版本', p.version, '导出时间', now()],
    [],
    ['物料', '数量', '单位'],
    ...bom.map((b) => [b.name, b.qty, b.unit]),
    [],
    ['棚号', '层架(套)', '托盘(个)', '管道(米)', '风机(台)', '灯具(盏)'],
    ...p.sheds.map((s) => {
      const c = { rack: 0, tray: 0, pipe: 0, fan: 0, light: 0 };
      for (const o of s.objects) {
        if (o.type === 'pipe') c.pipe = +(c.pipe + (o.size?.d ?? EQUIP_TYPES.pipe.d)).toFixed(2);
        else if (c[o.type] !== undefined) c[o.type]++;
      }
      return [s.name, c.rack, c.tray, c.pipe, c.fan, c.light];
    })
  ];
  const csv = '﻿' + rows.map((r) => r.join(',')).join('\n');
  download(`${p.code}-物料清单.csv`, csv, 'text/csv');
}

function download(filename, content, mime) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- 看板统计 ----------
export function dashboardStats() {
  const u = state.user;
  const mine = state.projects.filter((p) =>
    u.role === 'supervisor' ? true :
    u.role === 'maker' ? p.maker === u.name :
    p.customer === u.name
  );
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);
  const overdue = mine.filter((p) => p.status !== '已交付' && new Date(p.deadline) < today);
  const weekDue = mine.filter((p) => {
    const d = new Date(p.deadline);
    return p.status !== '已交付' && d >= today && d <= weekEnd;
  });
  const reviewing = mine.filter((p) => p.status === '待审核');
  const todo = mine.filter((p) =>
    u.role === 'supervisor' ? p.status === '待审核' :
    u.role === 'maker' ? ['制作中', '已退回'].includes(p.status) :
    ['草稿', '制作中', '待审核'].includes(p.status)
  );
  return { mine, overdue, weekDue, reviewing, todo };
}
