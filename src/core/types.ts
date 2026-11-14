// Shared domain types. No three.js dependency here so the server can reuse them.

export type Vec3 = [number, number, number];

export type ComponentType =
  | 'girder' // 梁体
  | 'pier' // 墩柱
  | 'bearing' // 支座
  | 'deck' // 桥面铺装
  | 'railing' // 护栏
  | 'abutment'; // 桥台

export const COMPONENT_TYPE_LABEL: Record<ComponentType, string> = {
  girder: '梁体',
  pier: '墩柱',
  bearing: '支座',
  deck: '桥面铺装',
  railing: '护栏',
  abutment: '桥台',
};

export const COMPONENT_TYPE_ORDER: ComponentType[] = [
  'girder',
  'pier',
  'bearing',
  'deck',
  'railing',
  'abutment',
];

export interface BridgeConfig {
  id: string;
  /** 桥梁名称 */
  name: string;
  /** 结构类型描述，用于报告封面 */
  structureType: string;
  /** 世界坐标 x=0 对应的里程桩号，单位米（例如 K1+250 记为 1250） */
  stationStart: number;
  /** 起点桥面设计标高，米 */
  elevationStart: number;
  /** 纵坡，百分比，正值为沿里程增加方向抬高 */
  gradePercent: number;
  /** 各跨跨径（米），按里程增加方向排列 */
  spans: number[];
  /** 桥面全宽（米） */
  deckWidth: number;
  /** 梁高（米） */
  girderDepth: number;
  /** 桥墩高度（米） */
  pierHeight: number;
  /** 桥面铺装厚度（米） */
  deckThickness: number;
  /** 护栏高度（米） */
  railingHeight: number;
  /** 交接墩 / 桥台顶面到梁底的支座构造高度（米） */
  bearingHeight: number;
  /** 上游侧为左侧（顺里程方向前进时左手侧）。报告按此定义左右侧。 */
  leftSideDefinition: string;
  /** 管养单位 */
  owner: string;
  /** 设计荷载 */
  designLoad: string;
  /** 建成年份 */
  builtYear: number;
}

export interface ComponentInfo {
  id: string;
  /** 构件名称，例如 “第 2 跨箱梁” */
  name: string;
  type: ComponentType;
  /** 跨序号，1 起；墩柱/支座为所属跨编号；桥台为 0 或 spanCount */
  spanIndex: number;
  /** 世界坐标 x 范围（米，从 0 起） */
  x0: number;
  x1: number;
  /** 里程桩号范围（米，绝对） */
  chainageStart: number;
  chainageEnd: number;
  /** 标高范围（米，绝对） */
  elevMin: number;
  elevMax: number;
  /** 横向位置，米，沿里程方向前进时左侧为负 */
  z0: number;
  z1: number;
  bboxMin: Vec3;
  bboxMax: Vec3;
  /** 对护栏/支座等多件同类构件的分侧或分位说明 */
  side?: 'left' | 'right' | 'center';
  /** 所属墩台编号（墩柱/支座用） */
  supportIndex?: number;
  /** 制造/管养档案编号，报告引用 */
  assetCode: string;
}

export interface SupportInfo {
  index: number;
  x: number;
  chainage: number;
  /** 墩台顶面标高 */
  topElevation: number;
  kind: 'abutment' | 'pier';
  label: string;
}

export interface Bridge {
  config: BridgeConfig;
  components: ComponentInfo[];
  supports: SupportInfo[];
  length: number;
}

// ---------------------------------------------------------------- inspections

export interface Inspection {
  id: string;
  bridgeId: string;
  /** 巡检日期 ISO */
  date: string;
  /** 巡检批次名，例如 “2025 年汛前定期检查” */
  title: string;
  inspector: string;
  weather: string;
  /** 巡检设备 */
  equipment: string;
  note: string;
  createdAt: string;
}

export type DefectType = 'crack' | 'bearing_void' | 'joint_seepage';

export const DEFECT_TYPE_LABEL: Record<DefectType, string> = {
  crack: '裂缝',
  bearing_void: '支座脱空',
  joint_seepage: '铰缝渗水',
};

export type SeverityLevel = 'normal' | 'warning' | 'critical';

export const SEVERITY_LEVEL_LABEL: Record<SeverityLevel, string> = {
  normal: '一般',
  warning: '需关注',
  critical: '严重',
};

export interface PhotoRef {
  id: string;
  /** 相对地址 /uploads/xxx.png 或 data URL */
  url: string;
  caption: string;
  takenAt?: string;
}

export interface CrackGeometry {
  kind: 'crack';
  /** 两个端点，世界坐标，单位米 */
  endpoints: [Vec3, Vec3];
  /** 贴合曲面采样点，世界坐标，单位米 */
  path: Vec3[];
  /** 中点曲面法向（单位向量） */
  normal: Vec3;
  /** 展开后的真实长度，毫米 */
  lengthMm: number;
  /** 展开平面内相对里程方向的走向角，度；逆里程方向左转为正 */
  azimuthDeg: number;
  orientation: 'longitudinal' | 'transverse' | 'diagonal';
  /** 同一裂缝上测得的最大宽度，毫米 */
  widthMm: number;
  /** 宽度位置（沿裂缝长度的比例 0..1） */
  widthAt: number;
  /** 贯通/非贯通 */
  penetrated: boolean;
}

export interface VolumeGeometry {
  kind: 'volume';
  center: Vec3;
  /** 世界坐标轴对齐尺寸（米） */
  size: Vec3;
  /** 绕世界 Y 轴旋转，弧度（用于贴合构件走向） */
  yaw: number;
  /** 深度，毫米（脱空深度或渗水影响深度） */
  depthMm: number;
  /** 计算得到的面积，平方米 */
  areaM2: number;
  /** 脱空率（0..1），仅支座脱空 */
  voidRatio?: number;
}

export type DefectGeometry = CrackGeometry | VolumeGeometry;

export interface Defect {
  id: string;
  bridgeId: string;
  inspectionId: string;
  componentId: string;
  type: DefectType;
  /** 编号，例如 LF-2025-014 */
  code: string;
  geometry: DefectGeometry;
  /** 病害所在里程桩号（米，绝对） */
  chainage: number;
  /** 横向偏距，米；左负右正 */
  offset: number;
  /** 顶部/测点标高，米 */
  elevation: number;
  /** 评定等级 1..5，按 JTG/T H21 思路简化 */
  grade: 1 | 2 | 3 | 4 | 5;
  severity: SeverityLevel;
  /** 病害描述 */
  description: string;
  /** 判定依据（严重级必填） */
  justification: string;
  /** 特写照片（严重级至少一张） */
  photos: PhotoRef[];
  /** 建议维修措施 key，见 repairs.ts */
  treatmentKey?: string;
  createdAt: string;
  createdBy: string;
  /** 最近一次修改 */
  updatedAt: string;
}

// ---------------------------------------------------------------- reports

export interface RepairItem {
  key: string;
  title: string;
  detail: string;
  method: string;
  urgency: '立即' | '汛前' | '下次定检' | '观察';
  unit: string;
  quantityHint: string;
}

export interface Confirmation {
  defectId: string;
  confirmed: boolean;
  engineer: string;
  note: string;
  at: string;
}

export interface ReportMeta {
  reportNo: string;
  preparedBy: string;
  reviewedBy: string;
  approvedBy: string;
  organization: string;
  date: string;
}

export interface ReportSnapshot {
  token: string;
  createdAt: string;
  bridge: Bridge;
  inspection: Inspection;
  defects: Defect[];
  confirmations: Confirmation[];
  stats: ReportStats;
  meta: ReportMeta;
  photoMap?: Record<string, string>;
}

export interface ReportStats {
  byLevel: Record<SeverityLevel, number>;
  byType: Record<DefectType, { total: number; warning: number; critical: number }>;
  byComponent: Record<ComponentType, number>;
  bySpanCritical: number[];
  total: number;
  critical: number;
  warning: number;
  normal: number;
  newSinceLast: number;
  expandedSinceLast: number;
  families: number;
}

export interface PhotoUploadResult {
  id: string;
  url: string;
  caption: string;
  takenAt?: string;
}
