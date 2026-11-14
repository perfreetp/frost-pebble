// 核心数据模型 —— 所有长度单位均为毫米(mm)

/** 发光颜色 0-255 RGB */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** 做法类型：单色灯管 / 双色灯管 / 亚克力发光字 */
export type ElementKind = 'tube-single' | 'tube-dual' | 'acrylic';

export interface Vec2 {
  x: number;
  y: number;
}

export interface BaseElement {
  id: string;
  kind: ElementKind;
  /** 发光主色 */
  color: RGB;
}

/** 灯管（单色 / 双色），按折弯路径（折线）绘制 */
export interface TubeElement extends BaseElement {
  kind: 'tube-single' | 'tube-dual';
  /** 折线顶点（含折弯点），世界坐标 mm */
  points: Vec2[];
  /** 灯管直径 mm */
  diameter: number;
  /** 各折角（points[1..n-2]）的折弯半径 mm，长度 = points.length - 2 */
  cornerRadii: number[];
  /** 双色灯管的第二色 */
  color2?: RGB;
  /** 双色交替周期 mm */
  dualPeriod?: number;
}

/** 亚克力发光字：字库生成的描边轮廓（可多环，外环 + 孔洞） */
export interface AcrylicElement extends BaseElement {
  kind: 'acrylic';
  /** 轮廓环，第一环为外环，其余为孔洞；每环为闭合点列 */
  contours: Vec2[][];
  /** 字壳厚度（笔画视觉宽度）mm */
  strokeWidth: number;
}

export type SignElement = TubeElement | AcrylicElement;

export type EnvironmentKey = 'day' | 'dusk' | 'night';

export interface EnvironmentPreset {
  key: EnvironmentKey;
  label: string;
  /** 环境光颜色（线性 0-1） */
  ambient: RGB;
  /** 环境光强度倍率 */
  ambientLevel: number;
  /** 墙面底色（无照片时）0-1 */
  wallColor: RGB;
  /** 背景照片变暗系数 0-1 */
  photoDim: number;
}

/** 材料单价（元），可在设置面板调整 */
export interface Prices {
  /** 单色灯管 元/米 */
  tubeSinglePerM: number;
  /** 双色灯管 元/米 */
  tubeDualPerM: number;
  /** 单个接头 */
  connectorEach: number;
  /** 单台变压器（按容量档分价） */
  transformerByVA: Record<number, number>;
  /** 亚克力发光字 元/厘米（按字高） */
  acrylicPerCmHeight: number;
  /** 墙面底板 元/平米（可选） */
  wallPanelPerSqm: number;
}

export interface ProjectSettings {
  /** 网格间距 mm */
  gridSize: number;
  /** 吸附容差（屏幕像素换算前的世界距离）mm */
  snapTolerance: number;
  /** 灯管默认直径 mm */
  defaultTubeDiameter: number;
  /** 单根灯管最大连续长度 mm */
  maxTubeLength: number;
  /** 折角半径下限系数：实际下限 = 系数 × 直径 */
  minRadiusFactor: number;
  /** 灯管功率 W/m（LED 霓虹灯带） */
  wattsPerM: number;
  /** 亚克力功率 W/㎡ 发光面 */
  acrylicWattsPerSqm: number;
  /** 变压器系列（VA 容量档） */
  transformerSeries: number[];
  /** 推荐带载余量比例（建议负载不超过容量 × 该值） */
  loadMargin: number;
  prices: Prices;
}

export interface WallSpec {
  width: number;
  height: number;
  /** 招牌距墙左边缘 mm */
  offsetX: number;
  /** 招牌距墙下边缘 mm */
  offsetY: number;
  /** 本地背景照片（dataURL），空字符串表示无 */
  photo: string;
}

export interface ProjectData {
  version: 1;
  id: string;
  name: string;
  updatedAt: string;
  wall: WallSpec;
  settings: ProjectSettings;
  environment: EnvironmentKey;
  bloom: {
    /** 泛光强度 0-2 */
    intensity: number;
    /** 光晕半径 0-1（映射到模糊采样半径） */
    radius: number;
  };
  elements: SignElement[];
}

export interface TransformerPick {
  capacityVA: number;
  loadW: number;
  loadRatio: number;
  /** 该台带的灯管/发光字元素 id */
  memberIds: string[];
  /** 选不到足够大的档位时为 true */
  overloaded: boolean;
  /** 建议更换的容量档（超载时） */
  suggestVA?: number;
}

export interface StatsResult {
  /** 灯管总长度 m（不含亚克力） */
  totalTubeM: number;
  /** 接头总数 */
  connectorCount: number;
  /** 每根灯管的接头明细 */
  connectorDetail: { id: string; joints: number }[];
  /** 折弯半径告警明细 */
  radiusWarnings: { id: string; cornerIndex: number; radius: number; min: number }[];
  /** 超长度（未加接头）告警 */
  lengthWarnings: { id: string; lengthM: number }[];
  /** 变压器配置 */
  transformers: TransformerPick[];
  /** 总功率 W */
  totalWatts: number;
  /** 整体带载余量（1 - 实际负载/总容量） */
  overallMargin: number;
  /** 亚克力字总面积 ㎡ */
  acrylicAreaSqm: number;
  /** 亚克力字最大字高 mm */
  acrylicMaxHeight: number;
}

export interface QuoteLine {
  item: string;
  spec: string;
  qty: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export interface QuoteResult {
  lines: QuoteLine[];
  total: number;
}
