// 领域模型类型定义

/** 二维点（屋面局部坐标，单位 m） */
export interface Point2 {
  x: number
  y: number
}

/** 障碍/禁布区类型 */
export type ObstacleType = 'parapet' | 'skylight' | 'fan' | 'shaft'

export const OBSTACLE_LABEL: Record<ObstacleType, string> = {
  parapet: '女儿墙',
  skylight: '天窗',
  fan: '风机基础',
  shaft: '排烟井',
}

export interface Obstacle {
  id: string
  type: ObstacleType
  /** 局部平面内多边形（闭合环，无需重复首尾点） */
  polygon: Point2[]
  /** 突出屋面高度 m */
  height: number
  name?: string
}

/** 屋面平面：局部 (u, v) 映射到世界坐标，u/v 为屋面水平面上两个正交方向 */
export interface RoofPlane {
  id: string
  name: string
  /** 屋面轮廓多边形（局部坐标） */
  outline: Point2[]
  /** 坡度（角度，度），0 = 平屋面 */
  slopeDeg: number
  /** 坡向：局部 +v 轴的世界方位角（度，南向=180，顺时针） */
  aspectDeg: number
  /** 女儿墙高度 m（轮廓整体的女儿墙，0 表示无） */
  parapetHeight: number
  obstacles: Obstacle[]
}

export interface Roof {
  id: string
  name: string
  /** 世界坐标基点 */
  origin: { x: number; y: number; z: number }
  planes: RoofPlane[]
  createdAt: number
  updatedAt: number
}

/** 组件库条目（光伏组件规格） */
export interface PVModule {
  id: string
  manufacturer: string
  model: string
  /** 长 m（沿 u 方向尺寸） */
  length: number
  /** 宽 m（沿 v 方向尺寸） */
  width: number
  /** 标称功率 Wp */
  powerW: number
  /** 效率（0~1），用于利用率校核展示 */
  efficiency: number
}

/** 已放置的组件实例 */
export interface PlacedPanel {
  id: string
  moduleId: string
  planeId: string
  /** 中心点，屋面局部坐标 */
  u: number
  v: number
  /** 平面内旋转角（度），0=组件长边沿 u；90=竖放 */
  rotationDeg: number
}

/** 方案级设计参数 */
export interface SchemeSettings {
  /** 横向间距（同排相邻组件净距）m */
  gapX: number
  /** 纵向间距（前后排净距）m */
  gapY: number
  /** 朝向偏差限值（度） */
  orientationLimitDeg: number
  /** 阴影校核用纬度（度） */
  latitudeDeg: number
  /** 阴影校核时刻：冬至日真太阳时（小时，如 9 = 9:00） */
  shadowHour: number
  /** 距女儿墙/禁布区安全退距 m */
  safetyMargin: number
  /** 每串组件数目标（0 = 自动均分） */
  panelsPerString: number
  /** 平屋面支架倾角（度），坡屋面取屋面坡度 */
  tiltDegOnFlat: number
  /** 首年等效利用小时数 h */
  fullLoadHours: number
  /** 电价 元/kWh */
  tariff: number
  /** 单位造价 元/Wp */
  costPerWp: number
  /** 年衰减率（用于 25 年收益估算） */
  annualDegrade: number
}

export type IssueLevel = 'red' | 'warn'

export interface PanelIssue {
  panelId: string
  level: IssueLevel
  code:
    | 'out-of-roof'
    | 'overlap-obstacle'
    | 'parapet-margin'
    | 'orientation'
    | 'shadow'
    | 'panel-overlap'
  message: string
}

export interface StringInfo {
  id: string
  planeId: string
  panelIds: string[]
  powerW: number
}

export interface SchemeStats {
  panelCount: number
  capacityKw: number
  roofAreaM2: number
  panelAreaM2: number
  utilization: number
  strings: StringInfo[]
  issues: PanelIssue[]
  redCount: number
  warnCount: number
  /** 估算首年发电量 kWh */
  firstYearKwh: number
  /** 25 年累计发电 kWh */
  total25YKwh: number
  /** 25 年累计收益 元 */
  total25YIncome: number
  /** 总投资 元 */
  totalCost: number
  /** 静态回收期 年 */
  paybackYears: number
}

export interface Scheme {
  id: string
  roofId: string
  name: string
  version: number
  panels: PlacedPanel[]
  settings: SchemeSettings
  createdAt: number
  updatedAt: number
  /** 最近一次统计快照（可能为空，需要时重算） */
  stats?: SchemeStats
}
