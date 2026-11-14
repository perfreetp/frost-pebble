export type Role = 'client' | 'producer' | 'supervisor';

export interface Person {
  id: string;
  name: string;
  role: Role;
  org: string;
  title: string;
  color: string;
}

export type ItemStatus = 'todo' | 'doing' | 'review' | 'rework' | 'approved';

export interface StrokePoint {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  mode: 'add' | 'erase';
  points: StrokePoint[];
  radius: number;
  hardness: number;
  strength: number;
}

export interface CutParams {
  bgTolerance: number;
  edgeSnap: number;
  feather: number;
  hardness: number;
}

export interface CompositeParams {
  bgScale: number;
  bgOffsetX: number;
  bgOffsetY: number;
  tempStrength: number;
  shadowAngle: number;
  shadowSoftness: number;
  shadowOffset: number;
  shadowOpacity: number;
}

export interface BgChoice {
  kind: 'library' | 'upload';
  backgroundId: string;
  name: string;
  thumb: string;
}

export interface EditDoc {
  cut: CutParams;
  comp: CompositeParams;
  strokes: Stroke[];
  bg: BgChoice | null;
  updatedAt: number;
}

export interface ReviewEvent {
  id: string;
  at: number;
  reviewerId: string;
  reviewerName: string;
  decision: 'approved' | 'rejected';
  comment: string;
  metrics?: ReviewMetrics | null;
}

export interface Project {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  brand: string;
  model: string;
  scenario: string;
  deliverableCount: number;
  dueAt: number;
  createdAt: number;
  notes: string;
  createdBy: string;
}

export interface Item {
  id: string;
  projectId: string;
  index: number;
  title: string;
  sourceImageId: string;
  sourceName: string;
  width: number;
  height: number;
  thumb: string;
  proof: string | null;
  proofMetrics: ReviewMetrics | null;
  status: ItemStatus;
  ownerId: string;
  ownerName: string;
  reworkCount: number;
  createdAt: number;
  updatedAt: number;
  submittedAt: number | null;
  approvedAt: number | null;
  doc: EditDoc;
  reviews: ReviewEvent[];
}

export interface BackgroundRecord {
  id: string;
  name: string;
  kind: 'stock' | 'upload';
  tags: string[];
  blob: Blob;
  thumb: string;
  width: number;
  height: number;
  createdAt: number;
  createdBy: string;
}

export interface ImageRecord {
  id: string;
  blob: Blob;
  width: number;
  height: number;
  name: string;
  thumb: string;
}

export interface ProjectStats {
  total: number;
  approved: number;
  review: number;
  rework: number;
}

export const STATUS_META: Record<ItemStatus, { label: string; short: string; tone: string }> = {
  todo: { label: '待制作', short: '待制作', tone: 'slate' },
  doing: { label: '制作中', short: '制作中', tone: 'blue' },
  review: { label: '待审核', short: '待审核', tone: 'amber' },
  rework: { label: '返工中', short: '返工中', tone: 'red' },
  approved: { label: '已通过', short: '已通过', tone: 'green' },
};

export const STATUS_ORDER: ItemStatus[] = ['todo', 'doing', 'review', 'rework', 'approved'];

export const DEFAULT_CUT: CutParams = {
  bgTolerance: 0.92,
  edgeSnap: 0.72,
  feather: 1.4,
  hardness: 0.66,
};

export const DEFAULT_COMP: CompositeParams = {
  bgScale: 1,
  bgOffsetX: 0,
  bgOffsetY: 0,
  tempStrength: 0.55,
  shadowAngle: 128,
  shadowSoftness: 14,
  shadowOffset: 26,
  shadowOpacity: 0.42,
};

export interface ReviewMetrics {
  edgeScore: number;
  edgeLabel: string;
  fringeRatio: number;
  softRatio: number;
  tempDeviation: number;
  tempLabel: string;
  subjectCct: number;
  bgCct: number;
  measuredAt: number;
}

export function emptyDoc(now = Date.now()): EditDoc {
  return {
    cut: { ...DEFAULT_CUT },
    comp: { ...DEFAULT_COMP },
    strokes: [],
    bg: null,
    updatedAt: now,
  };
}
