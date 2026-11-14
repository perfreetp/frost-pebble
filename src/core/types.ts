export type CropKind = '水稻' | '小麦' | '玉米' | '大豆' | '高粱';
export type ProjectStatus = '制作中' | '待审核' | '退回' | '已采用';
export type PartKind = 'head' | 'torso' | 'leaf' | 'ear' | 'roots' | 'other';
export type EasingType = 'easeInOut' | 'step' | 'bezier';
export type ChannelKind = 'position' | 'rotation' | 'scale';
export type Role = 'animator' | 'reviewer';
export type AnnotationStatus = 'pending' | 'resolved' | 'explained';

export interface Vec2 { x: number; y: number }

export interface AssetPart {
  id: string;
  name: string;
  kind: PartKind;
  /** builtin assets are generated on demand and not persisted as images */
  builtinKey?: string;
  dataUrl?: string;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
}

export interface Bone {
  id: string;
  name: string;
  parentId: string | null;
  partId: string | null;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  /** saved bind pose */
  bindX: number;
  bindY: number;
  bindRotation: number;
  bindScaleX: number;
  bindScaleY: number;
  locked: boolean;
  z: number;
  color: string;
}

export interface Keyframe {
  id: string;
  frame: number;
  value: Vec2 | number;
  easing: EasingType;
  /** cubic-bezier control points, usable when easing === 'bezier' */
  bezier: [number, number, number, number];
}

export interface Channel {
  kind: ChannelKind;
  keys: Keyframe[];
}

export interface BoneTrack {
  boneId: string;
  channels: Record<ChannelKind, Channel>;
}

export interface Timeline {
  fps: number;
  duration: number;
  tracks: BoneTrack[];
}

export interface Rig {
  bones: Bone[];
}

export interface CharacterVersion {
  id: string;
  number: number;
  submittedAt: number;
  submittedBy: string;
  note: string;
  rig: Rig;
  timeline: Timeline;
}

export interface Annotation {
  id: string;
  projectId: string;
  version: number;
  frame: number;
  /** world coordinates inside the character stage */
  x: number;
  y: number;
  text: string;
  author: string;
  createdAt: number;
  status: AnnotationStatus;
  reply: string;
  repliedBy: string | null;
  repliedAt: number | null;
}

export interface Activity {
  id: string;
  at: number;
  by: string;
  role: Role | 'system';
  action: string;
  from?: ProjectStatus;
  to?: ProjectStatus;
  note?: string;
  version?: number;
}

export interface Project {
  id: string;
  crop: CropKind;
  episode: number;
  title: string;
  deliveryDate: string;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
  assets: AssetPart[];
  rig: Rig;
  timeline: Timeline;
  versions: CharacterVersion[];
  annotations: Annotation[];
  activity: Activity[];
}

export interface AppState {
  projects: Project[];
  currentProjectId: string | null;
  role: Role;
  animatorName: string;
  reviewerName: string;
}

export interface TransformValues {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export const STATUS_ORDER: ProjectStatus[] = ['制作中', '待审核', '退回', '已采用'];
export const CHANNEL_LABEL: Record<ChannelKind, string> = {
  position: '位移',
  rotation: '旋转',
  scale: '缩放',
};
export const EASING_LABEL: Record<EasingType, string> = {
  easeInOut: '缓入缓出',
  step: '阶梯',
  bezier: '贝塞尔',
};
export const PART_LABEL: Record<PartKind, string> = {
  head: '头部',
  torso: '躯干',
  leaf: '叶片',
  ear: '穗',
  roots: '根须',
  other: '零件',
};
export const CROPS: CropKind[] = ['水稻', '小麦', '玉米', '大豆', '高粱'];
export const BONE_COLORS = ['#e9b750', '#73c17a', '#6fa8d6', '#b198d8', '#e0885f', '#62c4b8', '#d9c06a'];
