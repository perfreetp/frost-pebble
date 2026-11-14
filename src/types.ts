// 全局数据模型 —— 刺绣针法动画课件系统

export type Role = 'teacher' | 'student';
export type Difficulty = '入门' | '进阶' | '高级';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export type PartKind = 'hand' | 'needle' | 'thread' | 'frame' | 'base' | 'other';

export const PART_KIND_LABEL: Record<PartKind, string> = {
  hand: '绣娘手部',
  needle: '绣针',
  thread: '绣线',
  frame: '绷架',
  base: '底稿',
  other: '其他',
};

/** 导入的部件图层（手/针/线/绷架/底稿…） */
export interface PartDef {
  id: string;
  name: string;
  kind: PartKind;
  blobId: string;          // IndexedDB blob 存储 id
  width: number;
  height: number;
  /** 图层左上角在画布中的静止位置 */
  x: number;
  y: number;
  /** 绑定的关节 id（可空，未绑骨则静止不动） */
  jointId: string | null;
  /** 关节相对部件左上角的枢轴偏移 */
  pivotX: number;
  pivotY: number;
  z: number;
  visible: boolean;
}

/** 骨骼关节 */
export interface JointDef {
  id: string;
  name: string;
  x: number;
  y: number;
  parentId: string | null;
}

/** 每关节的缓动（缓入/缓出可单独调） */
export interface Easing {
  inX: number; inY: number;   // 缓入控制点（0..1）
  outX: number; outY: number; // 缓出控制点
}

export const LINEAR_EASING: Easing = { inX: 0, inY: 0, outX: 1, outY: 1 };
export const EASE_EASING: Easing = { inX: 0.42, inY: 0, outX: 0.58, outY: 1 };

export interface Keyframe {
  frame: number;
  x: number;
  y: number;
  rotation: number; // 度
  easing: Easing;
}

export interface JointTrack {
  jointId: string;
  keyframes: Keyframe[]; // 按 frame 升序
}

/** 必须出现的关键动作及其帧区间 */
export interface ActionSpan {
  id: string;
  name: string;
  startFrame: number;
  endFrame: number;
}

export interface TrackData {
  duration: number;          // 要求时长（帧）
  fps: number;
  joints: JointTrack[];
  actions: ActionSpan[];
}

export interface Course {
  id: string;
  name: string;             // 针法名称
  difficulty: Difficulty;
  requiredDuration: number; // 要求时长（帧）
  requiredActions: string[]; // 必须出现的关键动作
  assigneeIds: string[];    // 派给的学员
  parts: PartDef[];
  joints: JointDef[];
  /** 老师的示范动画（可空） */
  demoTrack: TrackData | null;
  createdAt: number;
}

export interface AutoIssue {
  code: 'keyframe_count' | 'duration' | 'loop_close' | 'action_missing' | 'empty';
  message: string;
  deduction: number;
}

export interface AutoCheck {
  passed: boolean;
  score: number;            // 100 起扣
  issues: AutoIssue[];
  keyframeCount: number;
  duration: number;
  durationDelta: number;
  loopClosed: boolean;
  loopError: { dx: number; dy: number; dRot: number };
  actionsFound: { name: string; found: boolean; keyframeCount: number }[];
  checkedAt: number;
}

export type SubmissionStatus = 'submitted' | 'returned' | 'graded';

export interface Submission {
  id: string;
  courseId: string;
  studentId: string;
  version: number;
  status: SubmissionStatus;
  track: TrackData;
  autoCheck: AutoCheck;
  teacherScore: number | null;
  comment: string;
  submittedAt: number;
  reviewedAt: number | null;
}

/** 渲染器需要的每部件姿态 */
export interface StagePart {
  image: HTMLImageElement | HTMLCanvasElement;
  x: number; y: number;
  width: number; height: number;
  pivotX: number; pivotY: number;
  rotation: number; // 弧度
  visible: boolean;
  z: number;
}

export interface JointPose {
  x: number;
  y: number;
  rotation: number; // 弧度
}
