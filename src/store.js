import { reactive, watch } from 'vue'
import { AREAS, getArea, plotRect, plotKey } from './data/cemetery.js'

const KEY = 'cemetery-ops-v1'
const DAY = 86400000

export const STELE_TYPES = [
  { id: 'trad',   name: '传统立碑',   w: 0.9, d: 0.3, blocks: 4 },
  { id: 'art',    name: '艺术碑',     w: 1.0, d: 0.4, blocks: 5 },
  { id: 'lying',  name: '卧碑',       w: 0.8, d: 0.6, blocks: 2 },
  { id: 'family', name: '家族合葬碑', w: 1.4, d: 0.4, blocks: 7 }
]

export const WORKERS = [
  { id: 'w1', name: '张建国', skills: ['立碑', '石栏'] },
  { id: 'w2', name: '李守信', skills: ['刻字', '立碑'] },
  { id: 'w3', name: '王春林', skills: ['绿化', '供桌'] },
  { id: 'w4', name: '赵永坤', skills: ['立碑', '刻字', '石栏'] },
  { id: 'w5', name: '刘福生', skills: ['绿化', '刻字'] },
  { id: 'w6', name: '陈广明', skills: ['立碑', '绿化'] }
]

export const STATUS = {
  pending_layout: { label: '待布置', color: '#8a6d3b', bg: '#fcf3dc' },
  layout_done:    { label: '待派工', color: '#1d4ed8', bg: '#dbe7fe' },
  in_progress:    { label: '施工中', color: '#0e7490', bg: '#cffafe' },
  pending_qc:     { label: '待质检', color: '#7c3aed', bg: '#ede9fe' },
  rejected:       { label: '打回整改', color: '#b91c1c', bg: '#fee2e2' },
  completed:      { label: '已完成', color: '#15803d', bg: '#dcfce7' }
}

let uidSeq = 1
export function uid(prefix = 'o') {
  return prefix + Date.now().toString(36) + (uidSeq++).toString(36)
}

// 物料清单：石材块数 / 绿植棵数 / 刻字字数
export function calcMaterials(order) {
  let stone = 0, plants = 0
  const st = STELE_TYPES.find(s => s.id === order.steleType)
  for (const o of order.layout.objects) {
    if (o.type === 'stele') stone += st ? st.blocks : 3
    else if (o.type === 'railing') stone += Math.max(1, Math.round(o.w / 0.5))
    else if (o.type === 'table') stone += 3
    else if (o.type === 'plant') plants++
  }
  const chars = (order.engraving || '').replace(/\s/g, '').length
  return { stone, plants, chars }
}

function defaultObjects(area, r, c, steleTypeId) {
  const st = STELE_TYPES.find(s => s.id === steleTypeId) || STELE_TYPES[0]
  const pr = plotRect(area, r, c)
  const cx = pr.x + pr.w / 2
  return [
    { id: uid(), type: 'stele', x: cx, y: pr.y + 0.3, w: st.w, h: st.d, rot: 0 },
    { id: uid(), type: 'table', x: cx, y: pr.y + 0.85, w: 0.6, h: 0.4, rot: 0 },
    { id: uid(), type: 'plant', x: pr.x + 0.22, y: pr.y + 0.9, w: 0.4, h: 0.4, rot: 0 }
  ]
}

// 可复现的伪随机（种子固定，墓区已占用分布稳定）
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function samplePhoto(text) {
  const c = document.createElement('canvas')
  c.width = 480; c.height = 320
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 320)
  g.addColorStop(0, '#b8c4b0'); g.addColorStop(1, '#8a967f')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 480, 320)
  ctx.fillStyle = '#7d8590'
  ctx.fillRect(180, 90, 120, 150)
  ctx.fillStyle = '#5f656e'
  ctx.fillRect(160, 240, 160, 24)
  ctx.fillStyle = '#5a9a52'
  ctx.beginPath(); ctx.arc(90, 230, 34, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(400, 220, 28, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = '20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(text, 240, 300)
  return c.toDataURL('image/jpeg', 0.75)
}

function makeOrder(patch, area, r, c) {
  const o = {
    id: '',
    familyName: '', phone: '', deceased: '', needs: '',
    areaId: area.id, row: r, col: c,
    steleType: 'trad', engraving: '',
    status: 'pending_layout', createdAt: Date.now(),
    layout: { objects: [] }, materials: null, layoutPreview: null,
    assignee: null, assignDays: 0, assignedAt: null, deadline: null,
    photos: [], submittedAt: null, completedAt: null,
    reworkCount: 0, qcRecords: [],
    ...patch
  }
  if (!o.layout.objects.length && o.status !== 'pending_layout') {
    o.layout.objects = defaultObjects(area, r, c, o.steleType)
  }
  if (!o.materials && ['layout_done', 'in_progress', 'pending_qc', 'rejected', 'completed'].includes(o.status)) {
    o.materials = calcMaterials(o)
  }
  return o
}

function seed() {
  const now = Date.now()
  const rnd = mulberry32(20261114)
  const occupied = {}
  for (const a of AREAS) {
    const set = []
    for (let r = 0; r < a.rows; r++) {
      for (let c = 0; c < a.cols; c++) {
        if (rnd() < 0.35) set.push(plotKey(r, c))
      }
    }
    occupied[a.id] = set
  }

  const A = getArea('A'), B = getArea('B'), C = getArea('C')
  const orders = [
    makeOrder({ familyName: '王秀兰', phone: '13800001111', deceased: '王德福', needs: '希望朝向好，碑前留祭拜空间', steleType: 'trad', engraving: '先考王公德福之墓' }, A, 2, 3),
    makeOrder({ familyName: '李国强', phone: '13800002222', deceased: '李张氏', needs: '合葬，家属要求两侧绿植', steleType: 'family', engraving: '李门张氏孺人之墓' }, A, 7, 12),
    makeOrder({ familyName: '周敏', phone: '13800003333', deceased: '周文斌', needs: '简约风格', steleType: 'lying', engraving: '周文斌之墓', status: 'layout_done', createdAt: now - 2 * DAY }, B, 3, 5),
    makeOrder({ familyName: '吴建华', phone: '13800004444', deceased: '吴老太君', needs: '石栏围护，供桌一张', steleType: 'trad', engraving: '吴母老太君之墓', status: 'layout_done', createdAt: now - 3 * DAY }, A, 11, 20),
    makeOrder({ familyName: '郑晓东', phone: '13800005555', deceased: '郑世昌', needs: '', steleType: 'art', engraving: '先严郑公世昌之墓', status: 'in_progress', assignee: 'w1', assignDays: 5, assignedAt: now - 6 * DAY, deadline: now - 1 * DAY, createdAt: now - 8 * DAY }, A, 16, 8),
    makeOrder({ familyName: '孙丽华', phone: '13800006666', deceased: '孙老爷子', needs: '加急', steleType: 'trad', engraving: '孙公之墓', status: 'in_progress', assignee: 'w4', assignDays: 4, assignedAt: now - 1 * DAY, deadline: now + 3 * DAY, createdAt: now - 2 * DAY }, C, 5, 10),
    makeOrder({ familyName: '马文君', phone: '13800007777', deceased: '马秀珍', needs: '', steleType: 'lying', engraving: '马秀珍之墓', status: 'in_progress', assignee: 'w2', assignDays: 6, assignedAt: now - 2 * DAY, deadline: now + 4 * DAY, createdAt: now - 4 * DAY }, B, 9, 14),
    makeOrder({ familyName: '胡永强', phone: '13800008888', deceased: '胡广才', needs: '', steleType: 'trad', engraving: '胡广才之墓', status: 'pending_qc', assignee: 'w1', assignDays: 4, assignedAt: now - 5 * DAY, deadline: now + 1 * DAY, submittedAt: now - 0.5 * DAY, createdAt: now - 7 * DAY, photos: [] }, A, 22, 30),
    makeOrder({ familyName: '郭晓梅', phone: '13800009999', deceased: '郭老太太', needs: '', steleType: 'art', engraving: '郭母之墓', status: 'pending_qc', assignee: 'w3', assignDays: 3, assignedAt: now - 4 * DAY, deadline: now + 2 * DAY, submittedAt: now - 0.2 * DAY, createdAt: now - 5 * DAY, photos: [] }, C, 12, 6),
    makeOrder({ familyName: '林志远', phone: '13800010000', deceased: '林伯', needs: '质检打回：石栏未对齐', steleType: 'trad', engraving: '林伯之墓', status: 'rejected', assignee: 'w2', assignDays: 5, assignedAt: now - 6 * DAY, deadline: now + 1 * DAY, submittedAt: now - 1 * DAY, reworkCount: 1, createdAt: now - 9 * DAY, qcRecords: [{ time: now - 1 * DAY, result: 'fail', items: '石栏与墓位边界未对齐，供桌位置压住通道边缘，需调整后重新提交', inspector: '质检员-刘' }] }, B, 15, 8),
    makeOrder({ familyName: '何春花', phone: '13800011111', deceased: '何老汉', needs: '', steleType: 'trad', engraving: '何公之墓', status: 'completed', assignee: 'w1', assignDays: 4, assignedAt: now - 20 * DAY, deadline: now - 16 * DAY, submittedAt: now - 17 * DAY, completedAt: now - 16 * DAY, createdAt: now - 22 * DAY, qcRecords: [{ time: now - 16 * DAY, result: 'pass', items: '', inspector: '质检员-刘' }] }, A, 5, 18),
    makeOrder({ familyName: '罗大伟', phone: '13800012222', deceased: '罗母', needs: '', steleType: 'family', engraving: '罗门之墓', status: 'completed', assignee: 'w4', assignDays: 6, assignedAt: now - 15 * DAY, deadline: now - 9 * DAY, submittedAt: now - 11 * DAY, completedAt: now - 10 * DAY, reworkCount: 1, createdAt: now - 17 * DAY, qcRecords: [{ time: now - 11 * DAY, result: 'fail', items: '刻字有错别字，重新刻制', inspector: '质检员-刘' }, { time: now - 10 * DAY, result: 'pass', items: '', inspector: '质检员-刘' }] }, A, 26, 5),
    makeOrder({ familyName: '高玉兰', phone: '13800013333', deceased: '高老先生', needs: '', steleType: 'lying', engraving: '高公之墓', status: 'completed', assignee: 'w3', assignDays: 3, assignedAt: now - 12 * DAY, deadline: now - 9 * DAY, submittedAt: now - 10 * DAY, completedAt: now - 9 * DAY, createdAt: now - 14 * DAY, qcRecords: [{ time: now - 9 * DAY, result: 'exempt', items: '', inspector: '' }] }, B, 6, 22),
    makeOrder({ familyName: '谢天明', phone: '13800014444', deceased: '谢公', needs: '', steleType: 'art', engraving: '谢公天明之墓', status: 'completed', assignee: 'w1', assignDays: 5, assignedAt: now - 9 * DAY, deadline: now - 4 * DAY, submittedAt: now - 5 * DAY, completedAt: now - 4 * DAY, createdAt: now - 11 * DAY, qcRecords: [{ time: now - 4 * DAY, result: 'pass', items: '', inspector: '质检员-刘' }] }, C, 2, 15)
  ]
  orders.forEach((o, i) => { o.id = 'WO' + (260001 + i) })
  // 待质检的种子工单补示例完工照片
  for (const o of orders) {
    if (o.status === 'pending_qc' && !o.photos.length) {
      o.photos = [samplePhoto(o.id + ' 完工照'), samplePhoto(o.id + ' 局部照')]
    }
  }
  return { orders, occupied, seq: 260001 + orders.length, qcTarget: 0.3 }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export const store = reactive(load() || seed())

let saveTimer = null
watch(store, () => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(store)) } catch (e) { /* 超出配额时忽略 */ }
  }, 300)
}, { deep: true })

export function resetStore() {
  localStorage.removeItem(KEY)
  location.reload()
}

// 某墓区已被占用的墓位集合（历史占用 + 其他工单已选）
export function occupiedSet(areaId, excludeOrderId) {
  const set = new Set(store.occupied[areaId] || [])
  for (const o of store.orders) {
    if (o.areaId === areaId && o.id !== excludeOrderId) set.add(plotKey(o.row, o.col))
  }
  return set
}

// 仅其他工单占用的墓位（编辑器里区分"已售"与"老墓"）
export function takenSet(areaId, excludeOrderId) {
  const set = new Set()
  for (const o of store.orders) {
    if (o.areaId === areaId && o.id !== excludeOrderId) set.add(plotKey(o.row, o.col))
  }
  return set
}

export function nextOrderId() {
  return 'WO' + store.seq++
}

export function workerById(id) {
  return WORKERS.find(w => w.id === id)
}

export function activeOrdersOf(workerId) {
  return store.orders.filter(o =>
    o.assignee === workerId && ['in_progress', 'pending_qc', 'rejected'].includes(o.status)
  )
}

export function fileToDataURL(file, max = 480) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = reject
    img.src = url
  })
}
