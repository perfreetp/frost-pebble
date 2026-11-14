// 全局领域类型定义

export type VehicleType = 'sedan' | 'suv' | 'pickup';

export type MaterialType = 'glossy' | 'matte' | 'chrome' | 'chameleon';

/** 一块膜的外观：颜色 + 材质类别 + 可调金属度/粗糙度 */
export interface PanelAppearance {
  color: string; // hex, e.g. #c0151f
  material: MaterialType;
  metalness: number; // 0..1
  roughness: number; // 0..1
}

/** 应用状态：整体序列化进 localStorage */
export interface AppState {
  schemeName: string;
  vehicle: VehicleType;
  /** 膜卷宽度（米），常见 1.52 */
  rollWidth: number;
  /** 拼缝搭接量（米） */
  overlap: number;
  /** 每片下料两端预留包边总量（米） */
  trimAllowance: number;
  /** 双拼模式下当前选中的车身分块 id */
  selectedPanel: string | null;
  /** 是否处于双拼分块模式 */
  dualTone: boolean;
  /** 3D 场景中是否显示红色接缝 */
  showSeams: boolean;
  /** 车身基础外观（单色方案 = 全车都用它） */
  base: PanelAppearance;
  /** 双拼覆盖：panelId -> 外观 */
  overrides: Record<string, PanelAppearance>;
  /** 四类材质的门店单价（元 / 平米） */
  prices: Record<MaterialType, number>;
  /** 施工费（元，一口价） */
  laborFee: number;
}

export interface SavedScheme {
  name: string;
  savedAt: string;
  state: AppState;
}
