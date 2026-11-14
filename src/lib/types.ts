export type BatchStatus = 'draft' | 'ready' | 'passed' | 'failed' | 'archived';
export type Verdict = 'pass' | 'fail';

export interface Batch {
  id: string;
  code: string;
  variety: string;
  cultivar: string;
  ageYears: number;
  diameterMin: number;
  diameterMax: number;
  heightMin: number;
  heightMax: number;
  quantity: number;
  block: string;
  createdAt: string;
  createdBy: string;
  note: string;
  status: BatchStatus;
  archivedAt?: string;
  dispatchMonth?: string;
}

export interface BrushStroke {
  mode: 'restore' | 'erase';
  size: number;
  /** 归一化坐标（0..1），与照片尺寸无关 */
  points: [number, number][];
}

export interface Photo {
  id: string;
  batchId: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  createdAt: string;
  isPrimary?: boolean;
  sampleNote?: string;
  /** 演示样张的生成参数，仅种子数据使用 */
  seedSpec?: {
    seed: number;
    bg: 'wall' | 'soil' | 'net' | 'white' | 'bench';
    leaf: 'broad' | 'maple' | 'ginkgo';
    clutter: boolean;
    heightRatio?: number;
  };
}

export type BgPresetId = 'studio' | 'field' | 'cool' | 'greenhouse';

export interface ComposeSettings {
  background: BgPresetId;
  shadow: number;
  feather: number;
  measuredHeightCm: number;
  measuredDiameterMm: number;
  showRuler: boolean;
  tolerance: number;
}

export interface Version {
  id: string;
  batchId: string;
  photoId: string;
  no: number;
  createdAt: string;
  specUrl: string;
  inspectUrl: string;
  thumbUrl: string;
  settings: ComposeSettings;
  strokes: BrushStroke[];
  note: string;
  savedBy: string;
}

export interface Measurement {
  no: number;
  diameterCm: number;
  heightCm: number;
}

export interface Inspection {
  id: string;
  batchId: string;
  inspector: string;
  sampledAt: string;
  sampleSize: number;
  threshold: number;
  passCount: number;
  passRate: number;
  verdict: Verdict;
  reasons: string[];
  notes: string;
  measurements: Measurement[];
}

export type Role = 'technician' | 'inspector' | 'manager';

export interface BatchMeta {
  code: string;
  variety: string;
  cultivar: string;
  ageYears: number;
  diameterMin: number;
  diameterMax: number;
  heightMin: number;
  heightMax: number;
  quantity: number;
  block: string;
}

export const BG_PRESETS: {
  id: BgPresetId;
  name: string;
  scene: string;
  tempK: number;
  temp: string;
  shadow: number;
  shadowDx: number;
  shadowDy: number;
  tint: [number, number, number];
}[] = [
  { id: 'studio', name: '标准棚拍', scene: '中性灰棚 · 顶部柔光', tempK: 5600, temp: '中性', shadow: 0.5, shadowDx: 12, shadowDy: 14, tint: [0, 0, 0] },
  { id: 'field', name: '清晨圃地', scene: '露天苗床 · 晨光', tempK: 4600, temp: '暖调', shadow: 0.4, shadowDx: -26, shadowDy: 10, tint: [16, 6, -12] },
  { id: 'cool', name: '阴天户外', scene: '漫射天光 · 冷调', tempK: 7000, temp: '冷调', shadow: 0.28, shadowDx: 6, shadowDy: 8, tint: [-8, 0, 14] },
  { id: 'greenhouse', name: '温室苗床', scene: '温室散射光 · 嫩绿', tempK: 5200, temp: '微暖', shadow: 0.36, shadowDx: 20, shadowDy: 12, tint: [2, 8, -2] },
];

export function presetInfo(id: BgPresetId) {
  return BG_PRESETS.find((p) => p.id === id) ?? BG_PRESETS[0];
}

export const STATUS_LABEL: Record<BatchStatus, string> = {
  draft: '建档中',
  ready: '待抽检',
  passed: '抽检达标',
  failed: '不达标 · 不出圃',
  archived: '已归档',
};

export const ROLE_LABEL: Record<Role, string> = {
  technician: '苗圃技术员',
  inspector: '质检员',
  manager: '苗圃负责人',
};


export const OPERATOR: Record<Role, string> = {
  technician: '陈立',
  inspector: '周敏',
  manager: '黄成',
};

export const PAGE_TITLE: Record<string, string> = {
  dashboard: '苗圃总览',
  batches: '批次建档',
  photos: '样苗拍照',
  workstation: '加工台',
  versions: '版本比对',
  inspection: '抽检判定',
  reports: '出圃报告',
  archive: '档案检索',
  guide: '作业规范',
};
