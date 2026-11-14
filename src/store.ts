import { create } from 'zustand'
import type {
  PanelIssue,
  PlacedPanel,
  PVModule,
  Roof,
  Scheme,
  SchemeSettings,
  SchemeStats,
} from './types'
import { DEFAULT_MODULES, DEFAULT_SETTINGS, uid } from './lib/defaults'
import { db } from './lib/db'
import { computeStats } from './lib/check'
import { createSampleRoof } from './lib/sampleRoof'

export type ViewKey = 'roofs' | 'editor' | 'check' | 'compare'

export interface Toast {
  id: string
  level: 'info' | 'warn' | 'error'
  text: string
}

interface AppState {
  view: ViewKey
  roofs: Roof[]
  schemes: Scheme[]
  modules: PVModule[]
  currentRoofId: string | null
  currentSchemeId: string | null
  selectedPanelIds: string[]
  activeModuleId: string
  toasts: Toast[]

  init: () => Promise<void>
  setView: (v: ViewKey) => void
  toast: (text: string, level?: Toast['level']) => void
  dismissToast: (id: string) => void

  saveRoof: (roof: Roof) => Promise<void>
  deleteRoof: (id: string) => Promise<void>
  openRoof: (roofId: string) => Promise<void>

  createScheme: (roofId: string, name?: string) => Promise<Scheme>
  saveScheme: (scheme: Scheme) => Promise<void>
  deleteScheme: (id: string) => Promise<void>
  forkScheme: (id: string, newName: string) => Promise<Scheme | null>
  selectScheme: (id: string) => void

  setActiveModule: (id: string) => void
  setSelectedPanels: (ids: string[]) => void
  updateSchemePanels: (fn: (panels: PlacedPanel[]) => PlacedPanel[]) => void
  updateSettings: (patch: Partial<SchemeSettings>) => void
  renameScheme: (id: string, name: string) => void
  recompute: () => SchemeStats | null
  currentScheme: () => Scheme | null
  currentRoof: () => Roof | null
}

export const useStore = create<AppState>((set, get) => ({
  view: 'roofs',
  roofs: [],
  schemes: [],
  modules: [],
  currentRoofId: null,
  currentSchemeId: null,
  selectedPanelIds: [],
  activeModuleId: DEFAULT_MODULES[0].id,
  toasts: [],

  init: async () => {
    const [roofs, schemes, modules] = await Promise.all([
      db.roofs.toArray(),
      db.schemes.toArray(),
      db.modules.toArray(),
    ])
    const finalModules = modules.length ? modules : DEFAULT_MODULES
    if (!modules.length) await db.modules.bulkAdd(DEFAULT_MODULES)
    set({ roofs, schemes, modules: finalModules, activeModuleId: finalModules[0].id })

    // 首次使用写入示例屋面
    if (!roofs.length) {
      const sample = createSampleRoof()
      await db.roofs.put(sample)
      set({ roofs: [sample] })
      get().toast('已载入示例厂房屋面，可直接进入排布编辑体验', 'info')
    }
  },

  setView: (v) => set({ view: v }),

  toast: (text, level = 'info') => {
    const id = uid('toast')
    set((s) => ({ toasts: [...s.toasts, { id, text, level }] }))
    setTimeout(() => get().dismissToast(id), 4500)
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  saveRoof: async (roof) => {
    roof.updatedAt = Date.now()
    await db.roofs.put(roof)
    set((s) => {
      const idx = s.roofs.findIndex((r) => r.id === roof.id)
      const roofs = [...s.roofs]
      if (idx >= 0) roofs[idx] = roof
      else roofs.push(roof)
      return { roofs }
    })
  },

  deleteRoof: async (id) => {
    await db.roofs.delete(id)
    const related = await db.schemes.where('roofId').equals(id).primaryKeys()
    await db.schemes.bulkDelete(related)
    set((s) => ({
      roofs: s.roofs.filter((r) => r.id !== id),
      schemes: s.schemes.filter((sc) => sc.roofId !== id),
      currentRoofId: s.currentRoofId === id ? null : s.currentRoofId,
    }))
  },

  openRoof: async (roofId) => {
    const existing = get().schemes.filter((s) => s.roofId === roofId)
    set({
      currentRoofId: roofId,
      currentSchemeId: existing[0]?.id ?? null,
      selectedPanelIds: [],
      view: 'editor',
    })
    if (!existing.length) {
      await get().createScheme(roofId, '方案 V1')
    }
  },

  createScheme: async (roofId, name) => {
    const siblings = get().schemes.filter((s) => s.roofId === roofId)
    const version = siblings.length + 1
    const scheme: Scheme = {
      id: uid('sc'),
      roofId,
      name: name ?? `方案 V${version}`,
      version,
      panels: [],
      settings: { ...DEFAULT_SETTINGS },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await db.schemes.put(scheme)
    set((s) => ({
      schemes: [...s.schemes, scheme],
      currentSchemeId: scheme.id,
      selectedPanelIds: [],
    }))
    return scheme
  },

  saveScheme: async (scheme) => {
    scheme.updatedAt = Date.now()
    await db.schemes.put(scheme)
    set((s) => ({
      schemes: s.schemes.map((x) => (x.id === scheme.id ? scheme : x)),
    }))
  },

  deleteScheme: async (id) => {
    await db.schemes.delete(id)
    set((s) => ({
      schemes: s.schemes.filter((x) => x.id !== id),
      currentSchemeId: s.currentSchemeId === id ? null : s.currentSchemeId,
    }))
  },

  forkScheme: async (id, newName) => {
    const src = get().schemes.find((s) => s.id === id)
    if (!src) return null
    const siblings = get().schemes.filter((s) => s.roofId === src.roofId)
    const clone: Scheme = {
      ...src,
      id: uid('sc'),
      name: newName,
      version: siblings.length + 1,
      panels: src.panels.map((p) => ({ ...p, id: uid('pn') })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stats: undefined,
    }
    await db.schemes.put(clone)
    set((s) => ({ schemes: [...s.schemes, clone], currentSchemeId: clone.id }))
    return clone
  },

  selectScheme: (id) => set({ currentSchemeId: id, selectedPanelIds: [] }),

  setActiveModule: (id) => set({ activeModuleId: id }),
  setSelectedPanels: (ids) => set({ selectedPanelIds: ids }),

  updateSchemePanels: (fn) => {
    const scheme = get().currentScheme()
    if (!scheme) return
    const next = { ...scheme, panels: fn(scheme.panels), updatedAt: Date.now() }
    set((s) => ({
      schemes: s.schemes.map((x) => (x.id === scheme.id ? next : x)),
    }))
    void db.schemes.put(next)
  },

  updateSettings: (patch) => {
    const scheme = get().currentScheme()
    if (!scheme) return
    const next = {
      ...scheme,
      settings: { ...scheme.settings, ...patch },
      updatedAt: Date.now(),
    }
    set((s) => ({
      schemes: s.schemes.map((x) => (x.id === scheme.id ? next : x)),
    }))
    void db.schemes.put(next)
  },

  renameScheme: (id, name) => {
    const scheme = get().schemes.find((s) => s.id === id)
    if (!scheme) return
    const next = { ...scheme, name, updatedAt: Date.now() }
    set((s) => ({ schemes: s.schemes.map((x) => (x.id === id ? next : x)) }))
    void db.schemes.put(next)
  },

  recompute: () => {
    const scheme = get().currentScheme()
    const roof = get().currentRoof()
    if (!scheme || !roof) return null
    const stats = computeStats(scheme, roof.planes, get().modules)
    const next = { ...scheme, stats, updatedAt: Date.now() }
    set((s) => ({
      schemes: s.schemes.map((x) => (x.id === scheme.id ? next : x)),
    }))
    void db.schemes.put(next)
    return stats
  },

  currentScheme: () => {
    const { schemes, currentSchemeId } = get()
    return schemes.find((s) => s.id === currentSchemeId) ?? null
  },

  currentRoof: () => {
    const { roofs, currentRoofId } = get()
    return roofs.find((r) => r.id === currentRoofId) ?? null
  },
}))

export function issuesByPanel(issues: PanelIssue[]): Map<string, PanelIssue[]> {
  const m = new Map<string, PanelIssue[]>()
  for (const i of issues) {
    if (!m.has(i.panelId)) m.set(i.panelId, [])
    m.get(i.panelId)!.push(i)
  }
  return m
}
