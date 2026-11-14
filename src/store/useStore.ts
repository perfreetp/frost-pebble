// 全局状态：采区档案、设计版本、布孔操作、审核流与持久化
import { create } from 'zustand';
import type {
  BlastDesign,
  BlastHole,
  ChargeParams,
  DesignStatus,
  HoleArray,
  LayerId,
  MiningArea,
  ReviewRecord,
  XY,
} from '../types';
import { uid } from '../lib/geometry';
import {
  calcCharge,
  createArray,
  createRowArray,
  createSingleArray,
  generateHoles,
  type PlacementContext,
} from '../lib/placement';
import { createSampleArea, createSampleDesign } from '../lib/sampleData';

const STORAGE_KEY = 'mine-blast-design-v1';

export type ToolMode = 'select' | 'single' | 'row' | 'array';

interface PlacementDraft {
  rows: number;
  holesPerRow: number;
  spacing: number;
  burden: number;
  angleDeg: number;
}

interface PersistShape {
  areas: MiningArea[];
  designs: BlastDesign[];
}

interface AppState extends PersistShape {
  activeDesignId: string | null;
  selectedHoleId: string | null;
  hoverHoleId: string | null;
  tool: ToolMode;
  draft: PlacementDraft;
  renderMode: 'webgpu' | 'canvas2d';
  notice: string | null;

  setTool: (t: ToolMode) => void;
  setDraft: (patch: Partial<PlacementDraft>) => void;
  setRenderMode: (m: 'webgpu' | 'canvas2d') => void;
  setNotice: (n: string | null) => void;

  createArea: (input: Omit<MiningArea, 'id' | 'createdAt'>) => string;
  openDesign: (id: string | null) => void;
  createDesign: (areaId: string, name: string) => string;
  loadSample: () => void;

  placeAt: (world: XY) => void;
  toggleLayer: (id: LayerId) => void;
  selectHole: (id: string | null) => void;
  setHoverHole: (id: string | null) => void;
  updateHole: (id: string, patch: Partial<BlastHole>) => void;
  updateChargeParams: (patch: Partial<ChargeParams>) => void;
  updateRowSpacing: (rowId: string, spacing: number) => void;
  updateRowBurden: (rowId: string, burden: number) => void;
  removeArray: (arrayId: string) => void;

  submitReview: (reviewer: string, comment: string) => void;
  approve: (reviewer: string, comment: string) => void;
  reject: (reviewer: string, comment: string) => void;
  archive: () => void;
  saveAsNewVersion: () => string | null;

  importDesign: (d: BlastDesign, area: MiningArea) => void;
  resetAll: () => void;
}

function persist(state: PersistShape): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ areas: state.areas, designs: state.designs }),
    );
  } catch {
    // 存储空间不足等情况静默处理，内存状态仍然可用
  }
}

function loadPersisted(): PersistShape | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistShape;
  } catch {
    return null;
  }
}

function placementContext(d: BlastDesign): PlacementContext {
  return {
    benchPolygon: d.benchPolygon,
    slopes: d.slopes,
    voids: d.voids,
    pipelines: d.pipelines,
    contours: d.contours,
    chargeParams: d.chargeParams,
    delays: d.delays.map((x) => x.delay),
  };
}

/** 重新生成某设计全部阵列的炮孔（改排距/间距/参数后调用）；手工编辑过的孔保留其参数 */
function regenerate(design: BlastDesign): BlastDesign {
  const ctx = placementContext(design);
  const manualById = new Map(
    design.holes.filter((h) => h.manualOverride).map((h) => [h.code, h]),
  );
  const holes = design.arrays.flatMap((arr) => generateHoles(arr, ctx)).map((h) => {
    const manual = manualById.get(h.code);
    if (!manual || h.state === 'skipped') return h;
    return {
      ...h,
      depth: manual.depth,
      diameter: manual.diameter,
      inclination: manual.inclination,
      stemming: manual.stemming,
      charge: manual.charge,
      manualOverride: true,
    };
  });
  return { ...design, holes, updatedAt: new Date().toISOString() };
}

function mutateDesign(designs: BlastDesign[], id: string | null, fn: (d: BlastDesign) => BlastDesign): BlastDesign[] {
  return designs.map((d) => (d.id === id ? fn(d) : d));
}

const persisted = loadPersisted();

export const useStore = create<AppState>((set, get) => ({
  areas: persisted?.areas ?? [],
  designs: persisted?.designs ?? [],
  activeDesignId: null,
  selectedHoleId: null,
  hoverHoleId: null,
  tool: 'select',
  draft: { rows: 10, holesPerRow: 20, spacing: 1.2, burden: 1.2, angleDeg: 0 },
  renderMode: 'webgpu',
  notice: null,

  setTool: (tool) => set({ tool, selectedHoleId: tool === 'select' ? get().selectedHoleId : null }),
  setDraft: (patch) => set({ draft: { ...get().draft, ...patch } }),
  setRenderMode: (renderMode) => set({ renderMode }),
  setNotice: (notice) => set({ notice }),

  createArea: (input) => {
    const area: MiningArea = { ...input, id: uid('area'), createdAt: new Date().toISOString() };
    const areas = [...get().areas, area];
    persist({ areas, designs: get().designs });
    set({ areas });
    return area.id;
  },

  openDesign: (id) => set({ activeDesignId: id, selectedHoleId: null, hoverHoleId: null }),

  createDesign: (areaId, name) => {
    const area = get().areas.find((a) => a.id === areaId);
    if (!area) throw new Error('采区不存在');
    const design = createSampleDesign(area);
    design.id = uid('design');
    design.areaId = areaId;
    design.name = name;
    design.version = 1;
    design.status = 'draft';
    design.designer = area.designer;
    design.createdAt = new Date().toISOString();
    design.updatedAt = new Date().toISOString();
    const designs = [...get().designs, design];
    persist({ areas: get().areas, designs });
    set({ designs, activeDesignId: design.id, selectedHoleId: null });
    return design.id;
  },

  loadSample: () => {
    const area = createSampleArea();
    const design = createSampleDesign(area);
    const areas = [...get().areas, area];
    const designs = [...get().designs, design];
    persist({ areas, designs });
    set({ areas, designs, activeDesignId: design.id, selectedHoleId: null });
  },

  placeAt: (world) => {
    const state = get();
    const design = state.designs.find((d) => d.id === state.activeDesignId);
    if (!design) return;
    if (design.status === 'archived') {
      set({ notice: '已归档版本为只读，不能继续布孔。请先另存为新版本。' });
      return;
    }
    const angle = (state.draft.angleDeg * Math.PI) / 180;
    let array: HoleArray;
    switch (state.tool) {
      case 'single':
        array = createSingleArray(world);
        break;
      case 'row':
        array = createRowArray(world, state.draft.holesPerRow, state.draft.spacing, angle);
        break;
      case 'array':
        array = createArray({
          name: `阵列 ${design.arrays.length + 1}`,
          origin: world,
          angle,
          spacing: state.draft.spacing,
          burden: state.draft.burden,
          rows: state.draft.rows,
          holesPerRow: state.draft.holesPerRow,
          placement: 'array',
        });
        break;
      default:
        return;
    }
    const next = regenerate({ ...design, arrays: [...design.arrays, array] });
    const designs = mutateDesign(state.designs, design.id, () => next);
    persist({ areas: state.areas, designs });
    const skipped = next.holes.filter((h) => h.state === 'skipped').length;
    set({
      designs,
      notice:
        skipped > 0
          ? `布设完成：新增设计孔位 ${array.rows.reduce((s, r) => s + r.plannedCount, 0)} 个，` +
            `${skipped} 个孔位因边坡/空区/管线自动避开（图中红色×，见孔表备注）`
          : '布设完成，全部孔位有效。',
    });
  },

  toggleLayer: (id) => {
    const state = get();
    const designs = mutateDesign(state.designs, state.activeDesignId, (d) => ({
      ...d,
      layerStates: d.layerStates.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    }));
    persist({ areas: state.areas, designs });
    set({ designs });
  },

  selectHole: (selectedHoleId) => set({ selectedHoleId }),
  setHoverHole: (hoverHoleId) => set({ hoverHoleId }),

  updateHole: (id, patch) => {
    const state = get();
    const designs = mutateDesign(state.designs, state.activeDesignId, (d) => ({
      ...d,
      updatedAt: new Date().toISOString(),
      holes: d.holes.map((h) => {
        if (h.id !== id) return h;
        const merged = { ...h, ...patch, manualOverride: true };
        // 孔深/堵塞变化联动重算装药量（未被手工标记的孔）
        if (patch.depth !== undefined || patch.stemming !== undefined) {
          merged.charge = merged.state === 'skipped' ? 0 : calcCharge(merged.depth, d.chargeParams);
        }
        return merged;
      }),
    }));
    persist({ areas: state.areas, designs });
    set({ designs });
  },

  updateChargeParams: (patch) => {
    const state = get();
    const designs = mutateDesign(state.designs, state.activeDesignId, (d) => {
      const updated = { ...d, chargeParams: { ...d.chargeParams, ...patch } };
      return regenerate(updated); // 参数变化后全量重算装药与孔深
    });
    persist({ areas: state.areas, designs });
    set({ designs });
  },

  updateRowSpacing: (rowId, spacing) => {
    const state = get();
    const designs = mutateDesign(state.designs, state.activeDesignId, (d) => ({
      ...d,
      arrays: d.arrays.map((arr) => ({
        ...arr,
        rows: arr.rows.map((r) => (r.id === rowId ? { ...r, spacing } : r)),
      })),
    })).map((d) => (d.id === state.activeDesignId ? regenerate(d) : d));
    persist({ areas: state.areas, designs });
    set({ designs, notice: `排内孔间距已改为 ${spacing}m，该排孔位已整体重算。` });
  },

  updateRowBurden: (rowId, burden) => {
    const state = get();
    // 改某排排距：该排及其后各排沿法向平移，整排联动重算
    const designs = mutateDesign(state.designs, state.activeDesignId, (d) => ({
      ...d,
      arrays: d.arrays.map((arr) => {
        const idx = arr.rows.findIndex((r) => r.id === rowId);
        if (idx < 0) return arr;
        return {
          ...arr,
          rows: arr.rows.map((r, i) => (i >= idx ? { ...r, burden } : r)),
        };
      }),
    })).map((d) => (d.id === state.activeDesignId ? regenerate(d) : d));
    persist({ areas: state.areas, designs });
    set({ designs, notice: `排距已改为 ${burden}m，该排及后续各排已联动重算。` });
  },

  removeArray: (arrayId) => {
    const state = get();
    const designs = mutateDesign(state.designs, state.activeDesignId, (d) => ({
      ...d,
      arrays: d.arrays.filter((a) => a.id !== arrayId),
    })).map((d) => (d.id === state.activeDesignId ? regenerate(d) : d));
    persist({ areas: state.areas, designs });
    set({ designs, selectedHoleId: null });
  },

  submitReview: (reviewer, comment) => {
    const state = get();
    const record: ReviewRecord = {
      id: uid('rev'), action: 'submit', reviewer, comment, at: new Date().toISOString(),
    };
    const designs = transition(state, (d) =>
      d.status === 'draft' || d.status === 'rejected'
        ? { ...d, status: 'submitted' as DesignStatus, reviewHistory: [...d.reviewHistory, record] }
        : d,
    );
    finishReview(set, get, designs, '设计已提交审核。');
  },

  approve: (reviewer, comment) => {
    const state = get();
    const record: ReviewRecord = {
      id: uid('rev'), action: 'approve', reviewer, comment, at: new Date().toISOString(),
    };
    const designs = transition(state, (d) =>
      d.status === 'submitted'
        ? { ...d, status: 'approved' as DesignStatus, rejectReason: undefined, reviewHistory: [...d.reviewHistory, record] }
        : d,
    );
    finishReview(set, get, designs, '审核通过，可以归档。');
  },

  reject: (reviewer, comment) => {
    const state = get();
    const record: ReviewRecord = {
      id: uid('rev'), action: 'reject', reviewer, comment, at: new Date().toISOString(),
    };
    const designs = transition(state, (d) =>
      d.status === 'submitted'
        ? { ...d, status: 'rejected' as DesignStatus, rejectReason: comment, reviewHistory: [...d.reviewHistory, record] }
        : d,
    );
    finishReview(set, get, designs, '审核未通过，已退回设计员修改（不能归档）。');
  },

  archive: () => {
    const state = get();
    const design = state.designs.find((d) => d.id === state.activeDesignId);
    if (!design) return;
    if (design.status !== 'approved') {
      set({ notice: '只有审核通过的设计才能归档，当前状态不允许归档。' });
      return;
    }
    const designs = mutateDesign(state.designs, design.id, (d) => ({
      ...d,
      status: 'archived' as DesignStatus,
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    persist({ areas: state.areas, designs });
    set({ designs, notice: `V${design.version} 已定稿归档。` });
  },

  saveAsNewVersion: () => {
    const state = get();
    const design = state.designs.find((d) => d.id === state.activeDesignId);
    if (!design) return null;
    const copy: BlastDesign = {
      ...design,
      id: uid('design'),
      version: design.version + 1,
      status: 'draft',
      reviewHistory: [],
      rejectReason: undefined,
      archivedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      arrays: design.arrays.map((a) => ({ ...a, id: uid('arr'), rows: a.rows.map((r) => ({ ...r, id: uid('row') })) })),
      holes: [],
      layerStates: design.layerStates.map((l) => ({ ...l })),
      chargeParams: { ...design.chargeParams },
      delays: design.delays.map((x) => ({ ...x })),
    };
    const regenerated = regenerate(copy);
    const designs = [...state.designs, regenerated];
    persist({ areas: state.areas, designs });
    set({ designs, activeDesignId: regenerated.id, selectedHoleId: null, notice: `已基于 V${design.version} 创建 V${regenerated.version} 草稿。` });
    return regenerated.id;
  },

  importDesign: (d, area) => {
    const areas = get().areas.some((a) => a.id === area.id) ? get().areas : [...get().areas, area];
    const designs = [...get().designs, d];
    persist({ areas, designs });
    set({ areas, designs, activeDesignId: d.id });
  },

  resetAll: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ areas: [], designs: [], activeDesignId: null, selectedHoleId: null, hoverHoleId: null });
  },
}));

function transition(state: AppState, fn: (d: BlastDesign) => BlastDesign): BlastDesign[] {
  return mutateDesign(state.designs, state.activeDesignId, fn);
}

function finishReview(
  set: (partial: Partial<AppState>) => void,
  get: () => AppState,
  designs: BlastDesign[],
  notice: string,
): void {
  persist({ areas: get().areas, designs });
  set({ designs, notice });
}

export function selectActiveDesign(s: AppState): BlastDesign | undefined {
  return s.designs.find((d) => d.id === s.activeDesignId);
}
