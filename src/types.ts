/** 全局数据模型 */

export type CarType = 'passenger' | 'freight' | 'home';
export type DoorType = 'center' | 'folding' | 'side';
export type MaterialId = 'ss-brushed' | 'wood' | 'rock';
export type SurfaceId = 'ceiling' | 'floor' | 'wall-left' | 'wall-right' | 'wall-rear' | 'door-frame';
export type CeilingType = 'flat' | 'luminous' | 'grille';
export type CopPosition = 'front-left' | 'front-right' | 'side-left' | 'side-right';
export type ViewMode = 'clay' | 'render';
export type LightingPreset = 'office' | 'residential' | 'garage';

export interface ProjectSpec {
  name: string;
  carType: CarType;
  /** 内宽/内深/内高 mm */
  width: number;
  depth: number;
  height: number;
  /** 额定载重 kg */
  load: number;
  doorType: DoorType;
  /** 旁开/双折门的门垛侧(门扇收纳侧) */
  doorStackSide: 'left' | 'right';
}

export interface HandrailSpec {
  enabled: boolean;
  wall: 'wall-left' | 'wall-right' | 'wall-rear';
  /** 扶手中心距地高度 mm */
  height: number;
  /** 长度 mm */
  length: number;
}

export interface CabinConfig {
  materials: Record<SurfaceId, MaterialId>;
  ceilingType: CeilingType;
  copPosition: CopPosition;
  handrail: HandrailSpec;
}

export interface Project {
  spec: ProjectSpec;
  config: CabinConfig;
}

/** 材质目录条目 */
export interface MaterialDef {
  id: MaterialId;
  name: string;
  fireRating: string;
  /** 单方重量 kg/m² */
  unitWeight: number;
  /** 单价 元/m² */
  unitPrice: number;
  /** 供货周期 天 */
  leadDays: number;
}

/** 冲突/校验信息 */
export interface Conflict {
  surface: SurfaceId | 'cop' | 'handrail';
  message: string;
}

/** 清单行 */
export interface QuoteLine {
  item: string;
  material: string;
  areaM2: number;
  weightKg: number;
  unitPrice: number;
  amount: number;
}

export const CAR_TYPE_NAMES: Record<CarType, string> = {
  passenger: '乘客梯',
  freight: '载货梯',
  home: '家用梯',
};

export const DOOR_TYPE_NAMES: Record<DoorType, string> = {
  center: '中分门',
  folding: '双折门',
  side: '旁开门',
};

export const SURFACE_NAMES: Record<SurfaceId, string> = {
  ceiling: '天花板',
  floor: '地板',
  'wall-left': '左壁板',
  'wall-right': '右壁板',
  'wall-rear': '后壁板',
  'door-frame': '门套',
};

export const CEILING_NAMES: Record<CeilingType, string> = {
  flat: '平板吊顶',
  luminous: '发光顶',
  grille: '格栅吊顶',
};

export const COP_NAMES: Record<CopPosition, string> = {
  'front-left': '左前壁(门侧)',
  'front-right': '右前壁(门侧)',
  'side-left': '左侧壁前端',
  'side-right': '右侧壁前端',
};
