// 本地持久化数据层:模板、色料、纹样、门店、体验单
import { sampleProfile, computeGeometry, metrics, checkBlowability, computePrice } from './geometry'

const KEY = 'lampwork-studio-db-v1'

const seedTemplates = [
  {
    id: 'vase', name: '小梅瓶', basePrice: 128, minWall: 2, maxHeight: 200, maxDiameter: 120,
    points: [{ r: 0, y: 0 }, { r: 26, y: 2 }, { r: 34, y: 22 }, { r: 31, y: 55 }, { r: 20, y: 82 }, { r: 14, y: 108 }, { r: 15, y: 138 }],
  },
  {
    id: 'cup', name: '直口水杯', basePrice: 88, minWall: 2, maxHeight: 160, maxDiameter: 140,
    points: [{ r: 0, y: 0 }, { r: 28, y: 0 }, { r: 34, y: 4 }, { r: 37, y: 14 }, { r: 38, y: 55 }, { r: 40, y: 100 }],
  },
  {
    id: 'bowl', name: '敞口碗', basePrice: 98, minWall: 3, maxHeight: 120, maxDiameter: 200,
    points: [{ r: 0, y: 0 }, { r: 24, y: 2 }, { r: 44, y: 14 }, { r: 55, y: 38 }, { r: 58, y: 60 }],
  },
  {
    id: 'goblet', name: '细腰花觚', basePrice: 168, minWall: 2, maxHeight: 280, maxDiameter: 140,
    points: [{ r: 0, y: 0 }, { r: 30, y: 2 }, { r: 22, y: 26 }, { r: 15, y: 70 }, { r: 14, y: 110 }, { r: 18, y: 150 }, { r: 30, y: 195 }, { r: 38, y: 220 }],
  },
]

const seedColors = [
  { id: 'clear', name: '透明水晶', hex: '#dfe9ee', surcharge: 0 },
  { id: 'milk', name: '乳白', hex: '#efe9dc', surcharge: 15 },
  { id: 'amber', name: '琥珀', hex: '#d98a2b', surcharge: 20 },
  { id: 'ink', name: '墨黑', hex: '#2a2a2e', surcharge: 20 },
  { id: 'cobalt', name: '钴蓝', hex: '#2745b8', surcharge: 25 },
  { id: 'emerald', name: '翠绿', hex: '#1f8a4c', surcharge: 25 },
  { id: 'violet', name: '紫罗兰', hex: '#7a3fa0', surcharge: 30 },
  { id: 'vermilion', name: '朱红', hex: '#c03325', surcharge: 30 },
]

const seedPatterns = [
  { id: 'none', name: '素面(无纹样)', surcharge: 0 },
  { id: 'stripes', name: '竖条纹', surcharge: 15 },
  { id: 'wave', name: '水波纹', surcharge: 18 },
  { id: 'dots', name: '波点', surcharge: 18 },
  { id: 'spiral', name: '螺旋纹', surcharge: 20 },
  { id: 'grid', name: '网格纹', surcharge: 22 },
]

const seedStores = [
  { id: 'ja', name: '静安旗舰店' },
  { id: 'xh', name: '徐汇工坊店' },
  { id: 'qt', name: '前滩体验店' },
]

// 可复现伪随机,生成近 45 天历史体验单
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedOrders(templates, colors, patterns, stores) {
  const rnd = mulberry32(20260808)
  const orders = []
  const statuses = ['approved', 'approved', 'approved', 'approved', 'rejected', 'pending']
  const rejectReasons = ['尺寸超出模板上限,窑炉装不下', '壁厚过薄,退火易炸裂', '颈部过细,吹杆无法进入']
  const now = Date.now()
  for (let i = 0; i < 46; i++) {
    const t = templates[Math.floor(rnd() * templates.length)]
    const store = stores[Math.floor(rnd() * stores.length)]
    const nColors = 1 + Math.floor(rnd() * 2)
    const picked = [...colors].sort(() => rnd() - 0.5).slice(0, nColors)
    const pattern = patterns[Math.floor(rnd() * patterns.length)]
    const wall = [2, 3, 4][Math.floor(rnd() * 3)]
    const status = statuses[Math.floor(rnd() * statuses.length)]
    const createdAt = now - Math.floor(rnd() * 45 * 24 * 3600 * 1000)
    orders.push({
      id: `EXP${new Date(createdAt).toISOString().slice(0, 10).replaceAll('-', '')}-${String(1000 + i)}`,
      createdAt,
      storeId: store.id,
      templateId: t.id,
      points: t.points,
      wall,
      colorIds: picked.map((c) => c.id),
      patternId: pattern.id,
      price: computePrice(t, picked, pattern),
      durationSec: 300 + Math.floor(rnd() * 1200),
      height: t.maxHeight * (0.55 + rnd() * 0.4),
      maxDiameter: t.maxDiameter * (0.6 + rnd() * 0.35),
      status,
      rejectReason: status === 'rejected' ? rejectReasons[Math.floor(rnd() * rejectReasons.length)] : '',
      violations: [],
    })
  }
  return orders.sort((a, b) => b.createdAt - a.createdAt)
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* 损坏则重建 */ }
  const db = {
    templates: seedTemplates,
    colors: seedColors,
    patterns: seedPatterns,
    stores: seedStores,
    orders: seedOrders(seedTemplates, seedColors, seedPatterns, seedStores),
  }
  localStorage.setItem(KEY, JSON.stringify(db))
  return db
}

let db = load()
const listeners = new Set()

function save() {
  localStorage.setItem(KEY, JSON.stringify(db))
  listeners.forEach((fn) => fn())
}

export function getDb() { return db }
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) }

export function updateTemplates(templates) { db = { ...db, templates }; save() }
export function updateColors(colors) { db = { ...db, colors }; save() }
export function updatePatterns(patterns) { db = { ...db, patterns }; save() }

/** 提交体验单:附带尺寸与校验结果快照 */
export function submitOrder({ storeId, template, points, wall, colorIds, patternId, durationSec }) {
  const samples = computeGeometry(sampleProfile(points))
  const m = metrics(samples)
  const check = checkBlowability(m, wall, template)
  const colors = db.colors.filter((c) => colorIds.includes(c.id))
  const pattern = db.patterns.find((p) => p.id === patternId)
  const order = {
    id: `EXP${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(Math.floor(1000 + Math.random() * 9000))}`,
    createdAt: Date.now(),
    storeId, templateId: template.id, points, wall, colorIds, patternId,
    price: computePrice(template, colors, pattern),
    durationSec: Math.round(durationSec),
    height: m.height, maxDiameter: m.maxDiameter,
    status: 'pending',
    rejectReason: '',
    violations: check.checks.filter((c) => !c.pass).map((c) => c.label),
  }
  db = { ...db, orders: [order, ...db.orders] }
  save()
  return order
}

export function reviewOrder(id, status, rejectReason = '') {
  db = {
    ...db,
    orders: db.orders.map((o) => (o.id === id ? { ...o, status, rejectReason } : o)),
  }
  save()
}

export const PRICE_TIERS = [
  { key: 't1', label: '<100元', test: (p) => p < 100 },
  { key: 't2', label: '100–199元', test: (p) => p >= 100 && p < 200 },
  { key: 't3', label: '≥200元', test: (p) => p >= 200 },
]
