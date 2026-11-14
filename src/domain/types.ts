export type Role = 'clerk' | 'foreman' | 'inspector';

export interface User {
  id: string;
  name: string;
  role: Role;
  title: string;
}

export type OrderStatus = 'pending' | 'working' | 'qc' | 'passed' | 'rework';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** 退距规则组 —— 前台建单时可调的街区控制参数 */
export interface RuleSet {
  /** 建筑外墙退道路红线距离 (m) */
  roadSetback: number;
  /** 相邻楼栋山墙净距 (m) */
  betweenBuildings: number;
  /** 立管中心距外墙面的退距 (m) */
  riserWallOffset: number;
  /** 表箱安装底标高，距所在楼层地面 (m) */
  boxBaseHeight: number;
  /** 同层相邻表箱水平净距 (m) */
  boxSpacing: number;
}

export interface BoxSpec {
  id: string;
  label: string;
  /** 单箱服务户数 1~2 */
  capacity: 1 | 2;
  /** 宽 (沿街) m */
  w: number;
  /** 高 m */
  h: number;
  /** 厚 m */
  d: number;
}

export interface LayoutParams {
  seed: string;
  buildingCount: number;
  /** 每栋层数 */
  floors: number;
  /** 每层户数 */
  householdsPerFloor: number;
  /** 管径 DN (mm) */
  pipeDiameter: number;
  /** 表箱规格 id */
  boxSpecId: string;
  /** 街区进深 = 楼栋进深 (m) */
  streetDepth: number;
  /** 层高 (m) */
  floorHeight: number;
  rules: RuleSet;
}

export interface Segment {
  id: string;
  riserId: string;
  buildingIndex: number;
  index: number;
  /** 段底标高 */
  baseY: number;
  /** 实际段长（可手工改） */
  length: number;
  /** 参数推导的名义段长 */
  nominal: number;
  pinned: boolean;
}

export interface Riser {
  id: string;
  buildingIndex: number;
  /** 本立管每层服务户数 */
  householdsPerFloor: number;
  x: number;
  z: number;
  radius: number;
  /** 立管总高 = 各段之和 */
  height: number;
  floorCount: number;
  segmentIds: string[];
  boxIds: string[];
}

export interface MeterBox {
  id: string;
  buildingIndex: number;
  riserId: string;
  /** 楼层，1 起 */
  floor: number;
  /** 该层该立管内的序号 */
  slot: number;
  /** 世界坐标（箱体中心） */
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  /** 服务户数 1~2 */
  serves: number;
  pinned: boolean;
  label: string;
}

export interface Building {
  id: string;
  index: number;
  label: string;
  /** 立面起点 x */
  x: number;
  z: number;
  width: number;
  depth: number;
  floors: number;
  householdsPerFloor: number;
  height: number;
  riserIds: string[];
}

export interface Violation {
  code: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  /** 关联实体 id，便于在视图中定位 */
  targetId?: string;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface Overrides {
  /** boxId -> 手工坐标 */
  boxes: Record<string, Vec3>;
  /** segmentId -> 手工段长 */
  segments: Record<string, number>;
}

export interface MainRun {
  id: string;
  radius: number;
  points: Vec3[];
}

export interface LayoutModel {
  params: LayoutParams;
  buildings: Building[];
  risers: Riser[];
  segments: Segment[];
  boxes: MeterBox[];
  mainRun: MainRun | null;
  violations: Violation[];
  bounds: Bounds;
  /** 排布指纹：同参数同种子必然一致 */
  fingerprint: string;
  stats: {
    buildingCount: number;
    riserCount: number;
    segmentCount: number;
    boxCount: number;
    totalHouseholds: number;
    totalPipeLength: number;
    manualBoxes: number;
    manualSegments: number;
  };
  /** 参数变化后失效的手工标记 */
  orphans: {
    boxes: string[];
    segments: string[];
  };
}

export interface RectifyItem {
  id: string;
  code: string;
  text: string;
}

export interface AuditEntry {
  id: string;
  at: number;
  actorId: string;
  actorName: string;
  role: Role;
  action: string;
  detail?: string;
}

export interface Photo {
  id: string;
  dataUrl: string;
  at: number;
  actorName: string;
  caption: string;
}

export interface QcRound {
  round: number;
  /** 是否为按比例抽中的质检单 */
  sampled: boolean;
  decision: 'pass' | 'reject' | 'auto-pass';
  items: RectifyItem[];
  note?: string;
  inspectorName?: string;
  at: number;
}

export interface Order {
  id: string;
  community: string;
  address: string;
  contact: string;
  params: LayoutParams;
  overrides: Overrides;
  status: OrderStatus;
  assigneeId: string | null;
  createdAt: number;
  deadline: number;
  completedAt: number | null;
  photos: Photo[];
  qcRounds: QcRound[];
  rectifications: RectifyItem[];
  reworkCount: number;
  /** 提交完成时的批次序号，用于 20% 等距抽查 */
  submitSeq: number | null;
  /** 本单是否为抽中质检 */
  qcSampled: boolean;
  log: AuditEntry[];
}

export interface ForemanStat {
  userId: string;
  name: string;
  title: string;
  assigned: number;
  active: number;
  completed: number;
  reworkedOrders: number;
  reworkRate: number;
  overdue: number;
  avgDays: number | null;
}

export interface BoardStats {
  total: number;
  pending: number;
  working: number;
  qc: number;
  passed: number;
  rework: number;
  overdue: number;
  sampled: number;
  inspected: number;
  reworkTotal: number;
  totalHouseholds: number;
  totalBoxes: number;
  foremen: ForemanStat[];
  statusSeries: { status: OrderStatus; count: number }[];
  monthly: { key: string; label: string; passed: number; rework: number; completed: number }[];
}
