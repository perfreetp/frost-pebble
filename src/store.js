import { defineStore } from 'pinia'
import { calcWeight, isViolation, violationReason } from './utils/glass'

const STORAGE_KEY = 'facade-system-v1'
let idSeq = 1
const uid = p => `${p}${Date.now().toString(36)}${(idSeq++).toString(36)}`

const ZONE_PALETTE = ['#4d9de0', '#e15554', '#3bb273', '#e1bc29', '#7768ae', '#2a9d8f']
const FLOOR_H = 3.6 // 层高
const COL_W = 4.8 // 结构柱距

function makeFacade(projectId, name, width = 24, height = 36) {
  return {
    id: uid('F'),
    projectId,
    name,
    width,
    height,
    status: 'designing', // designing | submitted | approved
    panels: [],
    embeds: [],
    structureLines: [],
    zones: [],
    submittedAt: null,
    lockedAt: null
  }
}

// 依据分格生成结构线 / 埋件点位 / 吊装分区
function buildAuxiliary(facade) {
  const { width: W, height: H } = facade
  const lines = []
  const floors = Math.max(1, Math.round(H / FLOOR_H))
  const cols = Math.max(1, Math.round(W / COL_W))
  const fh = H / floors
  const cw = W / cols
  // 结构线:楼层线 + 柱线 + 外轮廓
  for (let i = 0; i <= floors; i++) lines.push({ x1: 0, y1: i * fh, x2: W, y2: i * fh })
  for (let j = 0; j <= cols; j++) lines.push({ x1: j * cw, y1: 0, x2: j * cw, y2: H })
  facade.structureLines = lines
  // 埋件:结构线交点
  const embeds = []
  for (let i = 0; i <= floors; i++) {
    for (let j = 0; j <= cols; j++) {
      embeds.push({ id: uid('E'), x: j * cw, y: i * fh })
    }
  }
  facade.embeds = embeds
  // 吊装分区:每 4 层一个区
  const zones = []
  const zoneFloors = 4
  const zoneCount = Math.max(1, Math.ceil(floors / zoneFloors))
  for (let z = 0; z < zoneCount; z++) {
    zones.push({
      id: uid('Z'),
      name: `吊装区 Z${z + 1}`,
      x: 0,
      y: z * zoneFloors * fh,
      w: W,
      h: Math.min(zoneFloors * fh, H - z * zoneFloors * fh),
      color: ZONE_PALETTE[z % ZONE_PALETTE.length]
    })
  }
  facade.zones = zones
}

function recalc(panel) {
  panel.weight = calcWeight(panel)
}

export const useStore = defineStore('app', {
  state: () => ({
    role: null, // customer | designer | supervisor
    userName: '',
    projects: []
  }),
  getters: {
    facadeById: state => id => {
      for (const p of state.projects) {
        const f = p.facades.find(f => f.id === id)
        if (f) return f
      }
      return null
    },
    projectById: state => id => state.projects.find(p => p.id === id),
    facadeProgress: () => facade => {
      const total = facade.panels.length
      const approved = facade.panels.filter(p => p.status === 'approved').length
      const rejected = facade.panels.filter(p => p.status === 'rejected').length
      return { total, approved, rejected, pending: total - approved - rejected }
    },
    projectApproved: () => project =>
      project.facades.length > 0 && project.facades.every(f => f.status === 'approved')
  },
  actions: {
    load() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const data = JSON.parse(raw)
          this.projects = data.projects || []
          return
        } catch (e) { /* 数据损坏则重新播种 */ }
      }
      this.projects = seedProjects()
      this.save()
    },
    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects: this.projects }))
    },
    login(role, name) {
      this.role = role
      this.userName = name || ''
    },
    logout() {
      this.role = null
      this.userName = ''
    },
    // 客户下单
    createOrder({ name, building, facadeCount, glassConfig, deliveryDate }) {
      const project = {
        id: uid('PRJ'),
        name,
        building,
        glassConfig,
        deliveryDate,
        createdAt: new Date().toISOString().slice(0, 10),
        facades: []
      }
      for (let i = 0; i < facadeCount; i++) {
        const f = makeFacade(project.id, `${building}-F${i + 1}`)
        f.defaultConfig = glassConfig
        project.facades.push(f)
      }
      this.projects.push(project)
      this.save()
      return project
    },
    // 制作员生成分格(覆盖原有板块)
    generateGrid(facadeId, cols, rows) {
      const facade = this.facadeById(facadeId)
      if (!facade || facade.status === 'approved') return
      const project = this.projectById(facade.projectId)
      const pw = facade.width / cols
      const ph = facade.height / rows
      const panels = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = {
            id: uid('P'),
            code: `${facade.name.split('-').pop()}-R${r + 1}C${c + 1}`,
            x: c * pw,
            y: r * ph,
            w: Math.round(pw * 1000) / 1000,
            h: Math.round(ph * 1000) / 1000,
            config: facade.defaultConfig || project?.glassConfig || '6+12A+6',
            status: 'pending',
            reworkCount: 0,
            rejectReason: ''
          }
          recalc(p)
          panels.push(p)
        }
      }
      facade.panels = panels
      buildAuxiliary(facade)
      this.save()
    },
    deletePanels(facadeId, ids) {
      const facade = this.facadeById(facadeId)
      if (!facade || facade.status === 'approved') return
      const set = new Set(ids)
      facade.panels = facade.panels.filter(p => !set.has(p.id))
      this.save()
    },
    // 批量/单块改配置,重算重量;被退回的板块修改后回到待审
    setPanelsConfig(facadeId, ids, config) {
      const facade = this.facadeById(facadeId)
      if (!facade || facade.status === 'approved') return
      const set = new Set(ids)
      for (const p of facade.panels) {
        if (set.has(p.id)) {
          p.config = config
          recalc(p)
          if (p.status === 'rejected') p.status = 'pending'
        }
      }
      this.save()
    },
    // 提交审核:有超限板块则拦截
    submitFacade(facadeId) {
      const facade = this.facadeById(facadeId)
      if (!facade) return { ok: false, message: '立面不存在' }
      if (!facade.panels.length) return { ok: false, message: '立面还没有板块,请先生成分格' }
      const bad = facade.panels.filter(p => isViolation(p))
      if (bad.length) {
        return {
          ok: false,
          message: `存在 ${bad.length} 块超限板块,禁止提交:\n` +
            bad.slice(0, 5).map(p => `${p.code}: ${violationReason(p)}`).join('\n') +
            (bad.length > 5 ? `\n…共 ${bad.length} 块` : '')
        }
      }
      facade.status = 'submitted'
      facade.submittedAt = new Date().toISOString().slice(0, 10)
      this.save()
      return { ok: true }
    },
    // 主管逐块审核
    reviewPanel(facadeId, panelId, pass, reason) {
      const facade = this.facadeById(facadeId)
      if (!facade || facade.status !== 'submitted') return
      const p = facade.panels.find(p => p.id === panelId)
      if (!p) return
      if (pass) {
        p.status = 'approved'
        p.rejectReason = ''
      } else {
        p.status = 'rejected'
        p.reworkCount += 1
        p.rejectReason = reason || ''
      }
      this.save()
    },
    canLock(facade) {
      return facade.status === 'submitted' && facade.panels.length > 0 &&
        facade.panels.every(p => p.status === 'approved')
    },
    lockFacade(facadeId) {
      const facade = this.facadeById(facadeId)
      if (!facade || !this.canLock(facade)) return false
      facade.status = 'approved'
      facade.lockedAt = new Date().toISOString().slice(0, 10)
      this.save()
      return true
    }
  }
})

// ---------- 演示数据 ----------
function seedProjects() {
  const mk = (name, building, config, date) => ({
    id: uid('PRJ'), name, building, glassConfig: config, deliveryDate: date,
    createdAt: new Date().toISOString().slice(0, 10), facades: []
  })

  // 项目一:进行中。F1 用 2.0×2.0 大板 + 8+12A+8(160kg 超限,演示标红与提交拦截)
  const p1 = mk('滨江金融中心幕墙工程', 'T1栋', '8+12A+8', '2026-12-31')
  const f1 = makeFacade(p1.id, 'T1栋-F1', 24, 36)
  f1.defaultConfig = '8+12A+8'
  p1.facades.push(f1)
  const f2 = makeFacade(p1.id, 'T1栋-F2', 24, 36)
  f2.defaultConfig = '8+12A+8'
  p1.facades.push(f2)
  {
    const cols = 12, rows = 18
    const pw = f1.width / cols, ph = f1.height / rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p = {
          id: uid('P'), code: `F1-R${r + 1}C${c + 1}`,
          x: c * pw, y: r * ph, w: pw, h: ph,
          config: '8+12A+8', status: 'pending', reworkCount: 0, rejectReason: ''
        }
        recalc(p)
        f1.panels.push(p)
      }
    }
    buildAuxiliary(f1)
  }

  // 项目二:审核流程中的项目(部分通过/退回,演示返工标橙)
  const p2 = mk('云谷科技园裙楼幕墙', 'B栋', '6+12A+6', '2026-11-30')
  const g1 = makeFacade(p2.id, 'B栋-F1', 18, 28.8)
  g1.defaultConfig = '6+12A+6'
  g1.status = 'submitted'
  g1.submittedAt = '2026-11-10'
  p2.facades.push(g1)
  {
    const cols = 12, rows = 16
    const pw = g1.width / cols, ph = g1.height / rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p = {
          id: uid('P'), code: `F1-R${r + 1}C${c + 1}`,
          x: c * pw, y: r * ph, w: pw, h: ph,
          config: '6+12A+6', status: 'pending', reworkCount: 0, rejectReason: ''
        }
        recalc(p)
        // 下半部分已通过;零星退回,其中一块退回 3 次(标橙演示)
        if (r < 9) p.status = 'approved'
        else if (r === 12 && c === 5) { p.status = 'rejected'; p.reworkCount = 3; p.rejectReason = '玻璃配置与节点图不符,已退回 3 次' }
        else if (r === 14 && c === 8) { p.status = 'rejected'; p.reworkCount = 1; p.rejectReason = '尺寸偏差超限' }
        g1.panels.push(p)
      }
    }
    buildAuxiliary(g1)
  }

  // 项目三:全部立面通过,演示交付包
  const p3 = mk('湖畔会展中心幕墙', '会展厅', '6+12A+6', '2026-10-15')
  const h1 = makeFacade(p3.id, '会展厅-F1', 15, 21.6)
  h1.defaultConfig = '6+12A+6'
  const h2 = makeFacade(p3.id, '会展厅-F2', 15, 21.6)
  h2.defaultConfig = '6+12A+6'
  p3.facades.push(h1, h2)
  for (const f of [h1, h2]) {
    const cols = 10, rows = 12
    const pw = f.width / cols, ph = f.height / rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p = {
          id: uid('P'), code: `${f.name.split('-').pop()}-R${r + 1}C${c + 1}`,
          x: c * pw, y: r * ph, w: pw, h: ph,
          config: '6+12A+6', status: 'approved', reworkCount: 0, rejectReason: ''
        }
        recalc(p)
        f.panels.push(p)
      }
    }
    buildAuxiliary(f)
    f.status = 'approved'
    f.submittedAt = '2026-09-20'
    f.lockedAt = '2026-09-28'
  }

  return [p1, p2, p3]
}
