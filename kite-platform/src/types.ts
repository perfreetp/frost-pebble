// 全局类型定义 —— 单位统一为米(m),坐标: x 左右(右为正), y 上下(上为正), z 蒙面法向
export type SkeletonType = 'diamond' | 'hexagon' | 'hardwing' | 'softwing';

export const SKELETON_LABEL: Record<SkeletonType, string> = {
  diamond: '板式菱形',
  hexagon: '板式六边形',
  hardwing: '硬翅(沙燕)',
  softwing: '软翅',
};

export interface KiteParams {
  seed: number;
  skeleton: SkeletonType;
  stripCount: number;      // 竹条数量(任务要求值)
  wingspan: number;        // 翼展(m)
  panelCount: number;      // 蒙面分片数
  tolerancePct: number;    // 允许偏差百分比,如 3 表示 ±3%
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Strip {
  id: string;
  name: string;
  /** 骨架基准两端点(不含手动偏移、不含弧度弯曲) */
  a: Vec3;
  b: Vec3;
  curvature: number;       // 弧度系数 -1..1,正方向沿 +z
  mirrorId?: string;       // 左右对称对的对侧 id
  role: 'spine' | 'cross' | 'brace' | 'rib' | 'edge' | 'wing';
}

export interface Panel {
  id: string;
  name: string;
  vertices: Vec3[];        // 顺时针多边形
  color: string;
}

export interface SeamPoint {
  id: string;
  pos: Vec3;
  mirrorId?: string;
}

export interface Bridle {
  attach: Vec3;            // 提线在骨架上的附着点
  knot: Vec3;              // 提线汇交点(提线点)
}

/** 学员手动修改记录:全部以"相对基准位置的偏移量"或覆盖值保存,重新生成时可复用 */
export interface Overrides {
  stripOffset: Record<string, Vec3>;   // 竹条整体平移偏移
  curvature: Record<string, number>;   // 弧度覆盖
  seamOffset: Record<string, Vec3>;    // 接缝点偏移
  bridleKnot?: Vec3;
}

export interface KiteState {
  params: KiteParams;
  silhouette: Vec3[];    // 风筝外轮廓(顺时针)
  strips: Strip[];
  panels: Panel[];
  seams: SeamPoint[];
  bridle: Bridle;
  overrides: Overrides;
}

export interface Task {
  id: string;
  title: string;
  classId: string;
  createdAt: number;
  skeleton: SkeletonType;
  stripCount: number;
  wingspan: number;
  panelCount: number;
  tolerancePct: number;
}

export type SubmissionStatus = 'draft' | 'submitted' | 'graded' | 'returned';

export interface CheckIssue {
  code: string;
  label: string;
  targetId?: string;       // 关联竹条/接缝/提线 id,用于三维标红
  severity: 'error' | 'warn';
  message: string;
  deviationMm?: number;    // 偏差值(毫米)
  pass: boolean;
}

export interface CriterionScore {
  code: string;
  label: string;
  autoScore: number;       // 系统自动评分 0..满分
  maxScore: number;
  teacherScore?: number;   // 老师复核分(可改)
}

export interface Submission {
  id: string;
  taskId: string;
  classId: string;
  studentId: string;
  studentName: string;
  status: SubmissionStatus;
  submittedAt?: number;
  gradedAt?: number;
  snapshot: KiteState;
  issues: CheckIssue[];
  criteria: CriterionScore[];
  autoTotal: number;
  finalTotal?: number;
  comment: string;
  attempts: number;
  /** 错题记录(历次提交未通过项的 code 去重累计) */
  errorLog: { code: string; label: string; count: number; lastAt: number }[];
  version: number;
}

export interface ClassInfo {
  id: string;
  name: string;
  students: { id: string; name: string }[];
}
