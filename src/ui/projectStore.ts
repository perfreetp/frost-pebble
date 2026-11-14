import { create } from 'zustand';
import type { Bridge, ComponentInfo, Confirmation, Defect, Inspection, ReportMeta } from '@core/types';
import { api, type ProjectResponse } from '@/api';

export type TabKey = 'import' | 'tree' | 'annotate' | 'section' | 'timeline' | 'report';

export interface SectionPlane {
  /** 剖切轴：x 沿里程，z 横向，y 水平 */
  axis: 'x' | 'y' | 'z';
  /** 剖切位置（世界坐标，米） */
  pos: number;
  /** 是否翻转保留侧 */
  flip: boolean;
  /** 是否展开显示（正交剖切） */
  enabled: boolean;
  /** 剖切面旁标注用的构件 */
  showLabels: boolean;
}

interface ProjectStore {
  loading: boolean;
  error: string | null;
  bridge: Bridge | null;
  inspections: Inspection[];
  activeInspectionId: string;
  defects: Defect[];
  confirmations: Confirmation[];
  reportMeta: ReportMeta | null;
  tab: TabKey;
  selectedComponentId: string | null;
  hoverComponentId: string | null;
  hiddenComponents: Set<string>;
  /** 构件树折叠状态 */
  collapsed: Set<string>;
  /** 视图模式 */
  viewMode: 'solid' | 'xray' | 'wireframe';
  /** 显示的巡检集（默认仅当前） */
  showHistoryOverlay: boolean;
  /** 渲染网格细分等级：0=轻量，3≈26 万面片，4≈100 万面片 */
  meshDetail: number;
  section: SectionPlane;
  clipEnabled: boolean;
  /** 剖切实时读数 */
  sectionReadout: { elevation: number; chainage: number; componentName: string; components: string[] } | null;
  filter: { severity: string[]; types: string[]; query: string; onlyUnconfirmed: boolean };
  search: string;

  load: () => Promise<void>;
  setTab: (t: TabKey) => void;
  selectComponent: (id: string | null) => void;
  setHoverComponent: (id: string | null) => void;
  toggleVisibility: (id: string) => void;
  showAll: () => void;
  toggleCollapse: (key: string) => void;
  setViewMode: (m: ProjectStore['viewMode']) => void;
  setShowHistory: (v: boolean) => void;
  setMeshDetail: (n: number) => void;
  setSection: (patch: Partial<SectionPlane>) => void;
  setClip: (v: boolean) => void;
  setSectionReadout: (r: ProjectStore['sectionReadout']) => void;
  setFilter: (patch: Partial<ProjectStore['filter']>) => void;
  setSearch: (s: string) => void;
  upsertDefect: (d: Defect) => void;
  removeDefect: (id: string) => Promise<void>;
  setConfirmations: (c: Confirmation[]) => void;
  saveConfirmation: (defectId: string, confirmed: boolean, engineer: string, note: string) => Promise<void>;
  setActiveInspection: (id: string) => Promise<void>;
  addInspection: (body: Partial<Inspection>) => Promise<void>;
  activeDefects: () => Defect[];
  componentById: (id: string | null) => ComponentInfo | null;
  defectsFor: (componentId: string) => Defect[];
}

export const useProject = create<ProjectStore>((set, get) => ({
  loading: true,
  error: null,
  bridge: null,
  inspections: [],
  activeInspectionId: '',
  defects: [],
  confirmations: [],
  reportMeta: null,
  tab: 'annotate',
  selectedComponentId: null,
  hoverComponentId: null,
  hiddenComponents: new Set(),
  collapsed: new Set(),
  viewMode: 'solid',
  showHistoryOverlay: true,
  meshDetail: 0,
  section: { axis: 'z', pos: 0, flip: true, enabled: false, showLabels: true },
  clipEnabled: false,
  sectionReadout: null,
  filter: { severity: [], types: [], query: '', onlyUnconfirmed: false },
  search: '',

  load: async () => {
    set({ loading: true, error: null });
    try {
      const data: ProjectResponse = await api.project();
      set({
        bridge: data.bridge,
        inspections: data.inspections,
        activeInspectionId: data.activeInspectionId,
        defects: data.defects,
        confirmations: data.confirmations,
        reportMeta: data.reportMeta,
        loading: false,
      });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  setTab: (t) => set({ tab: t }),
  selectComponent: (id) => set({ selectedComponentId: id }),
  setHoverComponent: (id) => set({ hoverComponentId: id }),
  toggleVisibility: (id) =>
    set((s) => {
      const next = new Set(s.hiddenComponents);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { hiddenComponents: next };
    }),
  showAll: () => set({ hiddenComponents: new Set() }),
  toggleCollapse: (key) =>
    set((s) => {
      const next = new Set(s.collapsed);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { collapsed: next };
    }),
  setViewMode: (m) => set({ viewMode: m }),
  setShowHistory: (v) => set({ showHistoryOverlay: v }),
  setMeshDetail: (n) => set({ meshDetail: n }),
  setSection: (patch) => set((s) => ({ section: { ...s.section, ...patch }, clipEnabled: true })),
  setClip: (v) => set({ clipEnabled: v }),
  setSectionReadout: (r) => set({ sectionReadout: r }),
  setFilter: (patch) => set((s) => ({ filter: { ...s.filter, ...patch } })),
  setSearch: (s) => set({ search: s }),

  upsertDefect: (d) =>
    set((s) => {
      const idx = s.defects.findIndex((x) => x.id === d.id);
      if (idx >= 0) {
        const next = [...s.defects];
        next[idx] = d;
        return { defects: next };
      }
      return { defects: [...s.defects, d] };
    }),

  removeDefect: async (id) => {
    await api.deleteDefect(id);
    set((s) => ({ defects: s.defects.filter((d) => d.id !== id) }));
  },

  setConfirmations: (c) => set({ confirmations: c }),

  saveConfirmation: async (defectId, confirmed, engineer, note) => {
    const rec = await api.confirm(defectId, confirmed, engineer, note);
    set((s) => {
      const next = s.confirmations.filter((c) => c.defectId !== defectId);
      next.push(rec);
      return { confirmations: next };
    });
  },

  setActiveInspection: async (id) => {
    await api.activateInspection(id);
    set({ activeInspectionId: id });
  },

  addInspection: async (body) => {
    const insp = await api.createInspection(body);
    set((s) => ({ inspections: [...s.inspections, insp], activeInspectionId: insp.id }));
  },

  activeDefects: () => {
    const s = get();
    return s.defects.filter((d) => d.inspectionId === s.activeInspectionId);
  },
  componentById: (id) => {
    if (!id) return null;
    return get().bridge?.components.find((c) => c.id === id) ?? null;
  },
  defectsFor: (componentId) => {
    const s = get();
    return s.defects.filter((d) => d.componentId === componentId);
  },
}));

if (import.meta.env?.DEV) {
  (window as unknown as Record<string, unknown>).__project = useProject;
}
