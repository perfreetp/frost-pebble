// 矿山爆破设计系统 —— 领域模型类型定义

/** 设计/档案生命周期状态 */
export type DesignStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'archived';

/** 炮孔布设方式 */
export type HolePlacement = 'single' | 'row' | 'array';

/** 炮孔状态 */
export type HoleState = 'normal' | 'skipped';

/** 图层标识（分层渲染 + 单独开关） */
export type LayerId =
  | 'geology'
  | 'contour'
  | 'slope'
  | 'void'
  | 'pipeline'
  | 'hole'
  | 'label'
  | 'warning';

export interface LayerState {
  id: LayerId;
  name: string;
  visible: boolean;
}

/** 平面坐标（单位：米，矿山本地坐标系） */
export interface XY {
  x: number;
  y: number;
}

/** 多边形（闭合环，首尾点不重复） */
export interface Polygon {
  points: XY[];
}

/** 折线段 */
export interface Polyline {
  points: XY[];
}

/** 地质分层 */
export interface GeologyLayer {
  id: string;
  name: string;
  rockType: string;
  color: string;
  polygon: Polygon;
}

/** 等高线 */
export interface ContourLine {
  id: string;
  elevation: number; // 米
  polyline: Polyline;
}

/** 边坡线（带安全避让距离） */
export interface SlopeLine {
  id: string;
  name: string;
  polyline: Polyline;
  clearance: number; // 安全避让距离（米）
}

/** 空区（采空区/溶洞等，多边形面） */
export interface VoidZone {
  id: string;
  name: string;
  reason: string;
  clearance: number; // 避让距离（米）
  polygon: Polygon;
}

/** 管线标注 */
export interface Pipeline {
  id: string;
  name: string;
  kind: string; // 电缆 / 水管 / 风管 等
  polyline: Polyline;
  clearance: number; // 避让距离（米）
}

/** 单个炮孔 */
export interface BlastHole {
  id: string;
  code: string; // 孔号，如 R03-017
  x: number;
  y: number;
  rowId: string; // 所属排
  indexInRow: number; // 排内序号
  placement: HolePlacement;
  state: HoleState;
  /** 被跳过的原因（state === 'skipped' 时填写） */
  skipReason?: string;
  /** 孔口高程（米），由等高线/台阶面内插得到 */
  collarElevation: number;
  /** 孔深（米） */
  depth: number;
  /** 孔径（毫米） */
  diameter: number;
  /** 倾角（度，90 为垂直孔） */
  inclination: number;
  /** 设计装药量（千克），由装药计算得出 */
  charge: number;
  /** 雷管段位 */
  detonatorDelay: number;
  /** 堵塞长度（米） */
  stemming: number;
  /** 手工编辑过的孔，整图重算时保留其孔深/孔径/倾角/堵塞/药量 */
  manualOverride?: boolean;
}

/** 一排炮孔（阵列中的行） */
export interface HoleRow {
  id: string;
  /** 排基准起点（阵列重算的锚点） */
  origin: XY;
  /** 排方向角（弧度，阵列模式下各排平行） */
  angle: number;
  /** 孔间距（米） */
  spacing: number;
  /** 与上一排的排距（米） */
  burden: number;
  /** 设计孔数（含被跳过的孔位） */
  plannedCount: number;
  placement: HolePlacement;
}

/** 炮孔阵列（一次阵列布设的整体） */
export interface HoleArray {
  id: string;
  name: string;
  rows: HoleRow[];
  createdAt: string;
}

/** 装药参数 */
export interface ChargeParams {
  diameter: number; // mm
  defaultDepth: number; // m
  inclination: number; // 度
  /** 每米装药量 kg/m（按孔径与炸药密度折算，可手工覆盖） */
  chargePerMeter: number;
  /** 堵塞长度（米） */
  stemming: number;
  /** 超深（米） */
  subdrill: number;
}

/** 雷管段位表条目 */
export interface DelayDef {
  delay: number; // 段位
  ms: number; // 毫秒延期
}

/** 审核记录 */
export interface ReviewRecord {
  id: string;
  action: 'submit' | 'approve' | 'reject';
  reviewer: string;
  comment: string;
  at: string;
}

/** 采区档案 */
export interface MiningArea {
  id: string;
  code: string; // 采区编号
  name: string;
  location: string;
  createdAt: string;
  designer: string;
}

/** 一张爆破设计图（一个设计版本的完整数据） */
export interface BlastDesign {
  id: string;
  areaId: string;
  name: string;
  version: number;
  status: DesignStatus;
  designer: string;
  createdAt: string;
  updatedAt: string;
  /** 归档时间（status === 'archived'） */
  archivedAt?: string;
  reviewHistory: ReviewRecord[];
  /** 审核未过原因（最近一次驳回） */
  rejectReason?: string;
  // —— 图面几何 ——
  benchPolygon: Polygon; // 台阶平面范围
  geology: GeologyLayer[];
  contours: ContourLine[];
  slopes: SlopeLine[];
  voids: VoidZone[];
  pipelines: Pipeline[];
  arrays: HoleArray[];
  holes: BlastHole[];
  // —— 设计参数 ——
  chargeParams: ChargeParams;
  delays: DelayDef[];
  layerStates: LayerState[];
}

/** 版本对比单行指标 */
export interface DiffMetric {
  key: string;
  label: string;
  oldValue: number;
  newValue: number;
  delta: number;
  unit: string;
  /** 允许偏差（绝对值），超出则标红 */
  tolerance: number;
  outOfTolerance: boolean;
}

export interface VersionDiff {
  oldVersion: number;
  newVersion: number;
  metrics: DiffMetric[];
  addedHoles: number;
  removedHoles: number;
}

/** 视口（屏幕/世界变换） */
export interface Viewport {
  /** 世界坐标原点在画布上的像素位置 */
  offsetX: number;
  offsetY: number;
  /** 缩放：屏幕像素 / 世界米 */
  scale: number;
}

export const STATUS_LABEL: Record<DesignStatus, string> = {
  draft: '草稿',
  submitted: '待审核',
  approved: '审核通过',
  rejected: '审核未过',
  archived: '已归档',
};
