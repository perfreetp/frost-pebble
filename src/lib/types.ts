export type Pt = { x: number; y: number };

export type StrokeKind = 'heng' | 'shu' | 'pie' | 'na' | 'dian' | 'zhe' | 'gou' | 'ti';

export type TerminalKind = 'flat' | 'round' | 'sharp' | 'flare' | 'oblique';

export type GlyphStatus = '草稿' | '待审' | '修订中' | '已归档';

export interface GenParams {
  /** 字重：基础笔宽，单位 em/1000 */
  weight: number;
  /** 粗细对比：0 = 均匀，0.85 = 横细竖粗对比极强 */
  contrast: number;
  /** 倾斜角度（度） */
  slant: number;
  /** 圆角半径（em/1000） */
  corner: number;
  /** 收笔形态 */
  terminal: TerminalKind;
  /** 种子 */
  seed: number;
}

export interface SkeletonStroke {
  id: string;
  kind: StrokeKind;
  pts: Pt[];
  widthScale?: number;
}

export interface GlyphSkeleton {
  char: string;
  pinyin: string;
  strokes: SkeletonStroke[];
  /** 骨架来源说明 */
  source: string;
}

export interface StrokeState {
  id: string;
  kind: StrokeKind;
  /** 可编辑的骨架节点（未锁定的笔画由种子抖动生成） */
  nodes: Pt[];
  /** 基准节点（不含手改） */
  baseNodes: Pt[];
  widthScale: number;
  /** 沿程弓度（手写感） */
  bow: number;
  /** 是否被手工微调锁定 */
  manual: boolean;
  /** 手工锁定时的中心线快照 */
  centerline?: Pt[];
  /** 手工锁定时的轮廓快照（单环，em 坐标系，y 轴向上） */
  poly?: Pt[];
  /** 手工锁定时的生成参数快照 */
  lockedParams?: GenParams;
}

export interface Metrics {
  inkWidth: number;
  inkHeight: number;
  inkArea: number;
  inkRatio: number;
  cogX: number;
  cogY: number;
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  strokeCount: number;
}

export interface GlyphVersion {
  id: number;
  label: string;
  createdAt: string;
  params: GenParams;
  strokes: StrokeState[];
  metrics: Metrics;
  svgPath: string;
  /** 版本轮廓（多重多边形，供 WebGL 渲染与比对） */
  polys: Pt[][][];
  fingerprint: string;
  note: string;
  author: string;
  lockedCount: number;
}

export interface ReviewComment {
  id: string;
  x: number;
  y: number;
  tag: string;
  body: string;
  author: string;
  createdAt: string;
  status: '待处理' | '已处理';
  replies: { author: string; body: string; createdAt: string }[];
  resolvedAt?: string;
}

export interface GlyphRecord {
  id: string;
  seq: number;
  char: string;
  pinyin: string;
  library: string;
  weightName: string;
  weight: number;
  faceBox: { width: number; height: number; baseline: number; descender: number };
  skeletonSource: { kind: string; ref: string };
  status: GlyphStatus;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  seed: number;
  params: GenParams;
  versions: GlyphVersion[];
  currentVersionId: number;
  comments: ReviewComment[];
  plate: {
    svgPath: string;
    createdAt: string;
    fingerprint: string;
    note: string;
  };
  report?: {
    generatedAt: string;
    serial: string;
    html: string;
  };
}

export interface VersionPairMetric {
  key: string;
  label: string;
  unit: string;
  a: number;
  b: number;
  delta: number;
  pct: number;
  flagged: boolean;
  digits: number;
}
