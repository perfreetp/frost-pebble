/**
 * 标注草稿状态。裂缝标注流程：
 *   选择构件 → 在模型上点第一个端点 → 点第二个端点 → 系统即时给出长度/走向/桩号 → 录入宽度 → 定级 → 保存。
 */
import type { ComponentInfo, CrackGeometry, Defect, Vec3, VolumeGeometry, SeverityLevel, DefectType } from '@core/types';
import { create } from 'zustand';
import { gradeDefect, validateDraft, type GradeResult, type Thresholds, DEFAULT_THRESHOLDS } from '@core/annotation';
import type { CrackMeasurement } from '@core/annotation';

export type AnnotateTool = 'select' | 'crack' | 'volume' | 'section';

export interface PhotoDraft {
  uid: string;
  /** 服务端照片 id（上传成功后才有） */
  id?: string;
  url: string;
  caption: string;
  uploading?: boolean;
}

export interface MeasurementState {
  crack?: CrackMeasurement & { endpointsScreen: [Vec3, Vec3] };
  volume?: { geometry: VolumeGeometry; normals: Vec3[]; preview: boolean };
}

interface AnnotateStore {
  tool: AnnotateTool;
  componentId: string | null;
  hoverComponentId: string | null;
  /** 已点选的端点（世界坐标） */
  points: Vec3[];
  /** 裂缝实时测量结果 */
  measurement: MeasurementState;
  widthMm: number;
  widthAt: number;
  penetrated: boolean;
  depthMm: number;
  voidRatio: number;
  justification: string;
  description: string;
  photos: PhotoDraft[];
  thresholds: Thresholds;
  editingDefectId: string | null;
  /** 从时间线选择的历史病害：在同位置新增观测 */
  seedFromDefectId: string | null;
  /** 体块标注的病害类型（可手动覆盖按构件推断的结果） */
  volumeType: DefectType | 'auto';
  /** 最近一次校验提示 */
  toast: { kind: 'error' | 'warning' | 'success'; text: string } | null;

  setTool: (t: AnnotateTool) => void;
  setComponent: (id: string | null) => void;
  setHover: (id: string | null) => void;
  addPoint: (p: Vec3) => void;
  setMeasurement: (m: MeasurementState) => void;
  clearPoints: () => void;
  setWidth: (w: number) => void;
  setWidthAt: (t: number) => void;
  setPenetrated: (v: boolean) => void;
  setDepth: (d: number) => void;
  setVoidRatio: (v: number) => void;
  setJustification: (v: string) => void;
  setDescription: (v: string) => void;
  addPhoto: (p: PhotoDraft) => void;
  updatePhoto: (uid: string, p: Partial<PhotoDraft>) => void;
  removePhoto: (uid: string) => void;
  setThresholds: (t: Thresholds) => void;
  setVolumeType: (t: DefectType | 'auto') => void;
  resolveVolumeType: (componentId: string | null) => DefectType;
  setToast: (t: AnnotateStore['toast']) => void;
  loadDefect: (d: Defect) => void;
  startFromHistory: (d: Defect) => void;
  reset: () => void;
  grade: (componentType?: ComponentInfo['type']) => GradeResult;
  validate: (componentType?: ComponentInfo['type']) => ReturnType<typeof validateDraft>;
}

const blank = {
  points: [] as Vec3[],
  measurement: {} as MeasurementState,
  widthMm: 0.25,
  widthAt: 0.5,
  penetrated: false,
  depthMm: 3,
  voidRatio: 0.1,
  justification: '',
  description: '',
  photos: [] as PhotoDraft[],
  editingDefectId: null as string | null,
  seedFromDefectId: null as string | null,
  volumeType: 'auto' as DefectType | 'auto',
};

export const useAnnotate = create<AnnotateStore>((set, get) => ({
  tool: 'crack',
  componentId: null,
  hoverComponentId: null,
  thresholds: DEFAULT_THRESHOLDS,
  toast: null,
  ...blank,

  setTool: (t) => {
    const st = get();
    if (t === st.tool) return;
    // 切换工具时保留构件选择，清空已点选的几何
    set({ tool: t, points: [], measurement: {}, toast: null });
  },
  setComponent: (id) => set({ componentId: id, toast: null }),
  setHover: (id) => set({ hoverComponentId: id }),
  addPoint: (p) => set((s) => ({ points: s.points.length >= 2 ? [p] : [...s.points, p], toast: null })),
  setMeasurement: (m) => set({ measurement: m }),
  clearPoints: () => set({ points: [], measurement: {}, toast: null }),
  setWidth: (w) => set({ widthMm: w }),
  setWidthAt: (t) => set({ widthAt: t }),
  setPenetrated: (v) => set({ penetrated: v }),
  setDepth: (d) => set({ depthMm: d }),
  setVoidRatio: (v) => set({ voidRatio: v }),
  setJustification: (v) => set({ justification: v }),
  setDescription: (v) => set({ description: v }),
  addPhoto: (p) => set((s) => ({ photos: [...s.photos, p], toast: null })),
  updatePhoto: (uid, patch) =>
    set((s) => ({ photos: s.photos.map((p) => (p.uid === uid ? { ...p, ...patch } : p)) })),
  removePhoto: (uid) => set((s) => ({ photos: s.photos.filter((p) => p.uid !== uid) })),
  setThresholds: (t) => set({ thresholds: t }),
  setVolumeType: (t) => set({ volumeType: t }),
  resolveVolumeType: (componentId) => {
    const st = get();
    if (st.volumeType !== 'auto') return st.volumeType;
    if (!componentId) return 'joint_seepage';
    if (componentId.includes('bearing')) return 'bearing_void';
    return 'joint_seepage';
  },
  setToast: (t) => set({ toast: t }),

  loadDefect: (d) => {
    const g = d.geometry;
    set({
      tool: g.kind === 'crack' ? 'crack' : 'volume',
      componentId: d.componentId,
      points: g.kind === 'crack' ? g.endpoints : [g.center, g.center],
      measurement: {
        crack:
          g.kind === 'crack'
            ? {
                geometry: g,
                normals: g.path.map(() => g.normal),
                samples: g.path.length,
                unfolded: [],
                endpointsScreen: g.endpoints,
              }
            : undefined,
        volume: g.kind === 'volume' ? { geometry: g, normals: [g.center, g.center], preview: false } : undefined,
      },
      widthMm: g.kind === 'crack' ? g.widthMm : 0.25,
      widthAt: g.kind === 'crack' ? g.widthAt : 0.5,
      penetrated: g.kind === 'crack' ? g.penetrated : false,
      depthMm: g.kind === 'volume' ? g.depthMm : 3,
      voidRatio: g.kind === 'volume' ? g.voidRatio ?? 0.1 : 0.1,
      justification: d.justification,
      description: d.description,
      photos: d.photos.map((p) => ({ uid: p.id, id: p.id, url: p.url, caption: p.caption })),
      editingDefectId: d.id,
      seedFromDefectId: null,
      volumeType: d.type === 'crack' ? 'auto' : d.type,
      toast: null,
    });
  },

  startFromHistory: (d) => {
    get().reset();
    const g = d.geometry;
    set({
      tool: g.kind === 'crack' ? 'crack' : 'volume',
      componentId: d.componentId,
      seedFromDefectId: d.id,
      description: `沿用 ${d.code} 的上期位置，更新本期观测。`,
      widthMm: g.kind === 'crack' ? g.widthMm : 0.25,
      depthMm: g.kind === 'volume' ? g.depthMm : 3,
    });
  },

  reset: () => set({ ...blank, toast: null }),

  grade: (componentType) => {
    const s = get();
    const type: DefectType =
      s.tool === 'volume'
        ? s.volumeType !== 'auto'
          ? s.volumeType
          : s.componentId?.includes('bearing')
            ? 'bearing_void'
            : 'joint_seepage'
        : 'crack';
    const g = s.measurement.crack?.geometry;
    return gradeDefect({
      type,
      widthMm: g ? s.widthMm : undefined,
      lengthMm: g ? g.lengthMm : s.tool === 'volume' && s.measurement.volume ? Math.max(s.measurement.volume.geometry.size[0], s.measurement.volume.geometry.size[2]) * 1000 : undefined,
      penetrated: g ? s.penetrated : undefined,
      depthMm: s.tool === 'volume' ? s.depthMm : undefined,
      voidRatio: s.tool === 'volume' ? s.voidRatio : undefined,
      influenceLengthMm:
        s.tool === 'volume' && s.measurement.volume
          ? Math.max(s.measurement.volume.geometry.size[0], s.measurement.volume.geometry.size[2]) * 1000
          : undefined,
      componentType: componentType ?? 'girder',
      thresholds: s.thresholds,
    });
  },

  validate: (componentType) => {
    const s = get();
    const type: DefectType =
      s.tool === 'volume'
        ? s.volumeType !== 'auto'
          ? s.volumeType
          : s.componentId?.includes('bearing')
            ? 'bearing_void'
            : 'joint_seepage'
        : 'crack';
    const g = s.measurement.crack?.geometry ?? s.measurement.volume?.geometry;
    return validateDraft({
      type,
      widthMm: g?.kind === 'crack' ? s.widthMm : undefined,
      lengthMm:
        g?.kind === 'crack'
          ? g.lengthMm
          : g?.kind === 'volume'
            ? Math.max(g.size[0], g.size[2]) * 1000
            : undefined,
      penetrated: g?.kind === 'crack' ? s.penetrated : undefined,
      depthMm: g?.kind === 'volume' ? s.depthMm : undefined,
      voidRatio: g?.kind === 'volume' ? g.voidRatio : undefined,
      componentId: s.componentId ?? '',
      componentType,
      endpoints: g?.kind === 'crack' ? g.endpoints : g?.kind === 'volume' ? [g.center, g.center] : undefined,
      justification: s.justification,
      photos: s.photos.filter((p) => !!p.url).map((p) => ({ id: p.id ?? p.uid, url: p.url, caption: p.caption })),
      thresholds: s.thresholds,
    });
  },
}));

if (import.meta.env?.DEV) {
  (window as unknown as Record<string, unknown>).__annotate = useAnnotate;
}
