import type {
  Activity, Annotation, AnnotationStatus, AppState, AssetPart, Bone, BoneTrack, CharacterVersion,
  CropKind, Project, ProjectStatus, Rig, Role, Timeline,
} from './types';
import { BONE_COLORS, STATUS_ORDER } from './types';
import { clone, fmtDate, uid } from './util';
import { renderPart } from './art';

const STORAGE_KEY = 'heying.workbench.v2';

export function emptyTimeline(): Timeline {
  return { fps: 24, duration: 48, tracks: [] };
}

function mkAsset(kind: AssetPart['kind'], crop: CropKind): AssetPart {
  const art = renderPart(kind, crop);
  return {
    id: uid('asset'),
    name: art.label,
    kind,
    builtinKey: `${crop}:${kind}`,
    width: art.width,
    height: art.height,
    anchorX: art.anchorX,
    anchorY: art.anchorY,
    dataUrl: art.dataUrl,
  };
}

function mkBone(name: string, x: number, y: number, parentId: string | null, partId: string | null, colorIndex = 0, z = 0): Bone {
  return {
    id: uid('bone'), name, parentId, partId, x, y, rotation: 0, scaleX: 1, scaleY: 1,
    bindX: x, bindY: y, bindRotation: 0, bindScaleX: 1, bindScaleY: 1,
    locked: false, z, color: BONE_COLORS[colorIndex % BONE_COLORS.length],
  };
}

interface SeedOpts {
  crop: CropKind;
  episode: number;
  title: string;
  deliveryDate: string;
  status: ProjectStatus;
  progress: 'fresh' | 'posed' | 'polished';
  reviewerNotes?: Array<{ frame: number; x: number; y: number; text: string; status: AnnotationStatus; reply?: string }>;
  versions?: number;
}

export function createProject(opts: SeedOpts & { savedAt?: number }): Project {
  const { crop } = opts;
  const assets = (['torso', 'head', 'leaf', 'ear', 'roots'] as const).map((k) => mkAsset(k, crop));
  const byKind = (k: string) => assets.find((a) => a.kind === k)!.id;

  // anchors in armature space (canvas 960x640, character centered near x=480)
  // Armature-space layout: the torso art is 300px tall with a shoulder anchor at y=62,
  // so the hips sit under the body and the head joint sits on the neck.
  const root = mkBone('根骨', 480, 466, null, null, 0, 0);
  const hips = mkBone('胯部', 0, 0, root.id, byKind('torso'), 1, 1);
  const chest = mkBone('胸腔', 0, -118, hips.id, null, 1, 2);
  const head = mkBone('头部', 0, -90, chest.id, byKind('head'), 2, 3);
  const earL = mkBone('左穗', -26, -54, head.id, byKind('ear'), 3, 4);
  const earR = mkBone('右穗', 26, -54, head.id, byKind('ear'), 3, 4);
  const armL = mkBone('左叶臂', -40, -52, chest.id, byKind('leaf'), 4, 5);
  const armR = mkBone('右叶臂', 40, -52, chest.id, byKind('leaf'), 4, 5);
  const legL = mkBone('左根须', -20, 22, hips.id, byKind('roots'), 5, 6);
  const legR = mkBone('右根须', 20, 22, hips.id, byKind('roots'), 5, 6);

  const bones = [root, hips, chest, head, earL, earR, armL, armR, legL, legR];

  // mirror the left leaf arm so the pair opens outward like real leaves
  armL.scaleX = -1;
  armL.bindScaleX = -1;
  earL.rotation = -12;
  earR.rotation = 10;
  earL.bindRotation = -12;
  earR.bindRotation = 10;

  const timeline = emptyTimeline();
  const now = opts.savedAt ?? Date.now();

  if (opts.progress !== 'fresh') {
    const track = (b: Bone): BoneTrack => ({
      boneId: b.id,
      channels: {
        position: { kind: 'position', keys: [] },
        rotation: { kind: 'rotation', keys: [] },
        scale: { kind: 'scale', keys: [] },
      },
    });
    const hipTrack = track(hips);
    const headTrack = track(head);
    const armLTrack = track(armL);
    const armRTrack = track(armR);
    const earLTrack = track(earL);
    const earRTrack = track(earR);
    hipTrack.channels.position.keys = [
      { id: uid('k'), frame: 0, value: { x: 0, y: 0 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 12, value: { x: 0, y: -14 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 24, value: { x: 0, y: 0 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 36, value: { x: 0, y: -12 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 48, value: { x: 0, y: 0 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
    ];
    headTrack.channels.rotation.keys = [
      { id: uid('k'), frame: 0, value: -4, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 10, value: 6, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 22, value: -3, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 34, value: 7, easing: 'bezier', bezier: [0.34, 1.56, 0.64, 1] },
      { id: uid('k'), frame: 48, value: 0, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
    ];
    armLTrack.channels.rotation.keys = [
      { id: uid('k'), frame: 0, value: 0, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 12, value: -20, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 24, value: 4, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 36, value: -18, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 48, value: 0, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
    ];
    armRTrack.channels.rotation.keys = [
      { id: uid('k'), frame: 0, value: 0, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 12, value: 18, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 24, value: -4, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 36, value: 16, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 48, value: 0, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
    ];
    earLTrack.channels.rotation.keys = [
      { id: uid('k'), frame: 0, value: -12, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 16, value: -23, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 32, value: -8, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 48, value: -12, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
    ];
    earRTrack.channels.rotation.keys = [
      { id: uid('k'), frame: 0, value: 10, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 16, value: 21, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 32, value: 6, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 48, value: 10, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
    ];
    if (opts.progress === 'polished') {
      const chestTrack = track(chest);
      chestTrack.channels.scale.keys = [
        { id: uid('k'), frame: 0, value: { x: 1, y: 1 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
        { id: uid('k'), frame: 12, value: { x: 1.04, y: 0.97 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
        { id: uid('k'), frame: 24, value: { x: 1, y: 1 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
        { id: uid('k'), frame: 48, value: { x: 1, y: 1 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      ];
      timeline.tracks.push(chestTrack);
      hipTrack.channels.scale.keys = [
        { id: uid('k'), frame: 0, value: { x: 1, y: 1 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
        { id: uid('k'), frame: 12, value: { x: 0.98, y: 1.03 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
        { id: uid('k'), frame: 24, value: { x: 1, y: 1 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
        { id: uid('k'), frame: 36, value: { x: 0.98, y: 1.03 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
        { id: uid('k'), frame: 48, value: { x: 1, y: 1 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      ];
    }
    timeline.tracks.push(hipTrack, headTrack, armLTrack, armRTrack, earLTrack, earRTrack);
    hipTrack.channels.rotation.keys = [
      { id: uid('k'), frame: 0, value: 0, easing: 'step', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 30, value: 2, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
      { id: uid('k'), frame: 48, value: 0, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
    ];
  }

  const versions: CharacterVersion[] = [];
  const vCount = opts.versions ?? (opts.status === '制作中' ? 0 : 1);
  for (let i = 0; i < vCount; i++) {
    const snapshot = evolveSnapshot(clone({ bones }), clone(timeline), i, vCount);
    versions.push({
      id: uid('ver'),
      number: i + 1,
      submittedAt: now - (vCount - i) * 86400000 * 2,
      submittedBy: '林小满',
      note: i === 0 ? '首版提交：基础呼吸循环' : `第 ${i + 1} 版提交：按批注修订（穗幅收小 / 穿模修复 / 节奏调整）`,
      rig: snapshot.rig,
      timeline: snapshot.timeline,
    });
  }

  const annotations: Annotation[] = (opts.reviewerNotes ?? []).map((n, i) => ({
    id: uid('ann'),
    projectId: '',
    version: versions.length || 1,
    frame: n.frame,
    x: n.x,
    y: n.y,
    text: n.text,
    author: '陈穗生',
    createdAt: now - (i + 1) * 3600000 * 5,
    status: n.status,
    reply: n.reply ?? '',
    repliedBy: n.status === 'pending' ? null : '林小满',
    repliedAt: n.status === 'pending' ? null : now - (i + 1) * 3600000,
  }));

  const activity: Activity[] = [
    { id: uid('act'), at: now - 86400000 * 6, by: '林小满', role: 'animator', action: '创建项目', to: '制作中' },
  ];
  if (versions.length) {
    activity.push({ id: uid('act'), at: versions[versions.length - 1].submittedAt, by: '林小满', role: 'animator', action: '提交新版本', from: '制作中', to: '待审核', version: versions.length });
  }
  if (opts.status === '退回') {
    activity.push({ id: uid('act'), at: now - 86400000, by: '陈穗生', role: 'reviewer', action: '审核退回', from: '待审核', to: '退回', note: '批注未处理完' });
  }
  if (opts.status === '已采用') {
    activity.push({ id: uid('act'), at: now - 3600000 * 3, by: '陈穗生', role: 'reviewer', action: '审核采用', from: '待审核', to: '已采用', note: '镜头可用' });
  }

  const project: Project = {
    id: uid('proj'),
    crop,
    episode: opts.episode,
    title: opts.title,
    deliveryDate: opts.deliveryDate,
    status: opts.status,
    createdAt: now - 86400000 * 8,
    updatedAt: now,
    assets,
    rig: { bones },
    timeline,
    versions,
    annotations,
    activity,
  };
  for (const a of annotations) a.projectId = project.id;
  return project;
}


/**
 * Older versions carry slightly different poses so the comparison view has real
 * differences to show: each earlier revision is a little "wild" in its amplitudes.
 */
function evolveSnapshot(rig: Rig, timeline: Timeline, index: number, count: number): { rig: Rig; timeline: Timeline } {
  const stepsBack = count - 1 - index;
  if (stepsBack <= 0) return { rig, timeline };
  const bones = new Map(rig.bones.map((b) => [b.id, b]));
  const amp = 1 + stepsBack * 0.9;
  for (const track of timeline.tracks) {
    const bone = bones.get(track.boneId);
    if (!bone) continue;
    // Rotations swing wider in older revisions, always around the bind pose so the
    // rig stays contiguous (no detached joints).
    for (const key of track.channels.rotation.keys) {
      const dev = key.value as number;
      key.value = Math.round((bone.bindRotation + (dev - bone.bindRotation) * amp) * 10) / 10;
    }
    // Scale accents get stronger, measured away from 1 so parts stay attached.
    for (const key of track.channels.scale.keys) {
      const v = key.value as { x: number; y: number };
      key.value = {
        x: Math.round((1 + (v.x - 1) * amp) * 1000) / 1000,
        y: Math.round((1 + (v.y - 1) * amp) * 1000) / 1000,
      };
    }
    for (const key of track.channels.position.keys) {
      const v = key.value as { x: number; y: number };
      key.value = { x: v.x, y: Math.round((v.y + (v.y === 0 ? 0 : (v.y > 0 ? 3 : -3) * stepsBack)) * 10) / 10 };
    }
  }
  return { rig, timeline };
}

function seedState(): AppState {
  const today = new Date();
  const day = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return fmtDate(d.getTime());
  };
  const projects: Project[] = [
    createProject({
      crop: '水稻', episode: 3, title: '第三集 · 抽穗的清晨', deliveryDate: day(-2), status: '退回',
      progress: 'polished', versions: 2,
      reviewerNotes: [
        { frame: 12, x: 480, y: 258, text: '穗子抬头的幅度偏大，农学上抽穗期没有这么弹，麻烦收小到 15° 以内。', status: 'pending' },
        { frame: 36, x: 398, y: 430, text: '左叶臂摆动时穿模到躯干里了，这一帧能看出黑边。', status: 'pending' },
        { frame: 24, x: 480, y: 430, text: '呼吸节奏没问题，保留。', status: 'resolved', reply: '已确认保留。' },
      ],
    }),
    createProject({
      crop: '小麦', episode: 2, title: '第二集 · 越冬的守望', deliveryDate: day(1), status: '待审核',
      progress: 'polished', versions: 3,
      reviewerNotes: [
        { frame: 30, x: 522, y: 262, text: '右侧麦穗的颜色和上一集不一致，需要统一到 #dfb45f 这一档。', status: 'pending' },
        { frame: 8, x: 480, y: 400, text: '根须入土的位置再压低一点，现在像悬空的。', status: 'explained', reply: '根须沿用了第一集的分层阴影，压低会破坏土壤接触面，建议保留；如仍要调整可在合成层处理。' },
      ],
    }),
    createProject({
      crop: '玉米', episode: 1, title: '第一集 · 破土', deliveryDate: day(4), status: '制作中',
      progress: 'posed', versions: 0,
    }),
    createProject({
      crop: '大豆', episode: 5, title: '第五集 · 结荚', deliveryDate: day(-6), status: '制作中',
      progress: 'fresh', versions: 0,
    }),
    createProject({
      crop: '高粱', episode: 4, title: '第四集 · 红穗满坡', deliveryDate: day(-9), status: '已采用',
      progress: 'polished', versions: 4,
      reviewerNotes: [
        { frame: 18, x: 480, y: 300, text: '高粱穗的红色再压暗一点，更接近实拍。', status: 'resolved', reply: '已按批注压暗一档。' },
      ],
    }),
    createProject({
      crop: '水稻', episode: 6, title: '第六集 · 灌浆', deliveryDate: day(8), status: '制作中',
      progress: 'posed', versions: 0,
    }),
  ];
  return {
    projects,
    currentProjectId: projects[0].id,
    role: 'animator',
    animatorName: '林小满',
    reviewerName: '陈穗生',
  };
}

type Listener = (state: AppState, reason: string) => void;

export class Store {
  state: AppState;
  private listeners = new Set<Listener>();
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.state = this.load() ?? seedState();
  }

  private load(): AppState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AppState;
      if (!parsed?.projects?.length) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      /* quota exceeded: keep running in memory */
    }
  }

  scheduleSave() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.persist(), 250);
  }

  emit(reason = 'update') {
    this.scheduleSave();
    for (const l of this.listeners) l(this.state, reason);
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  get project(): Project | null {
    return this.state.projects.find((p) => p.id === this.state.currentProjectId) ?? null;
  }

  get currentName(): string {
    return this.state.role === 'animator' ? this.state.animatorName : this.state.reviewerName;
  }

  setRole(role: Role) {
    this.state.role = role;
    this.emit('role');
  }

  selectProject(id: string) {
    this.state.currentProjectId = id;
    this.emit('project');
  }

  addProject(opts: { crop: CropKind; episode: number; title: string; deliveryDate: string }): Project {
    const p = createProject({ ...opts, status: '制作中', progress: 'fresh', versions: 0 });
    this.state.projects.unshift(p);
    this.state.currentProjectId = p.id;
    this.emit('project');
    return p;
  }

  deleteProject(id: string) {
    this.state.projects = this.state.projects.filter((p) => p.id !== id);
    if (this.state.currentProjectId === id) this.state.currentProjectId = this.state.projects[0]?.id ?? null;
    this.emit('project');
  }

  updateProject(mutator: (p: Project) => void, reason = 'edit') {
    const p = this.project;
    if (!p) return;
    mutator(p);
    p.updatedAt = Date.now();
    this.emit(reason);
  }

  log(p: Project, action: string, opts: { from?: ProjectStatus; to?: ProjectStatus; note?: string; version?: number; by?: string; role?: Role | 'system' } = {}) {
    p.activity.unshift({
      id: uid('act'),
      at: Date.now(),
      by: opts.by ?? this.currentName,
      role: opts.role ?? this.state.role,
      action,
      from: opts.from,
      to: opts.to,
      note: opts.note,
      version: opts.version,
    });
  }

  private transitionTo(p: Project, to: ProjectStatus, note?: string) {
    const from = p.status;
    p.status = to;
    this.log(p, statusAction(from, to), { from, to, note });
  }

  pendingAnnotations(p: Project = this.project!): Annotation[] {
    return p.annotations.filter((a) => a.status === 'pending');
  }

  /** Submits a snapshot as a new version; blocked while annotations are open. */
  submitVersion(note: string): { ok: boolean; message: string; version?: CharacterVersion } {
    const p = this.project;
    if (!p) return { ok: false, message: '未选择项目' };
    if (p.status === '已采用') return { ok: false, message: '已采用的项目需从制作中重新开始' };
    const pending = this.pendingAnnotations(p);
    if (pending.length > 0) {
      return { ok: false, message: `还有 ${pending.length} 条批注未处理，无法定稿提交` };
    }
    const nextNumber = p.versions.reduce((max, v) => Math.max(max, v.number), 0) + 1;
    const version: CharacterVersion = {
      id: uid('ver'),
      number: nextNumber,
      submittedAt: Date.now(),
      submittedBy: this.currentName,
      note: note.trim() || `第 ${nextNumber} 版提交`,
      rig: clone(p.rig),
      timeline: clone(p.timeline),
    };
    p.versions.push(version);
    // Handled annotations stay attached to the version they were written against so the
    // review desk keeps a readable audit trail; nothing remains pending at this point.
    for (const a of p.annotations) {
      if (a.status !== 'pending' && !a.repliedAt) a.version = version.number;
    }
    this.transitionTo(p, '待审核', note.trim() || undefined);
    p.updatedAt = Date.now();
    this.emit('version');
    return { ok: true, message: `已生成 v${nextNumber}`, version };
  }

  revertToDraft() {
    const p = this.project;
    if (!p || p.status !== '待审核') return;
    const from = p.status;
    p.status = '制作中';
    this.log(p, '撤回编辑', { from, to: '制作中' });
    this.emit('status');
  }

  review(decision: '已采用' | '退回', note: string): { ok: boolean; message: string } {
    const p = this.project;
    if (!p) return { ok: false, message: '未选择项目' };
    if (p.status !== '待审核' && p.status !== '退回') return { ok: false, message: '当前状态不可审核' };
    const pending = this.pendingAnnotations(p);
    if (decision === '已采用' && pending.length > 0) {
      return { ok: false, message: `还有 ${pending.length} 条批注未处理，无法定稿` };
    }
    if (decision === '退回' && !note.trim()) {
      return { ok: false, message: '退回需要填写理由' };
    }
    this.transitionTo(p, decision, note.trim() || undefined);
    p.updatedAt = Date.now();
    this.emit('status');
    return { ok: true, message: decision === '已采用' ? '已采用，版本锁定' : '已退回制作方' };
  }

  addAnnotation(frame: number, x: number, y: number, text: string): Annotation | null {
    const p = this.project;
    if (!p || !text.trim()) return null;
    const ann: Annotation = {
      id: uid('ann'),
      projectId: p.id,
      version: p.versions.length || 1,
      frame,
      x,
      y,
      text: text.trim(),
      author: this.currentName,
      createdAt: Date.now(),
      status: 'pending',
      reply: '',
      repliedBy: null,
      repliedAt: null,
    };
    p.annotations.push(ann);
    p.updatedAt = Date.now();
    this.log(p, `新增第 ${frame} 帧批注`, { note: text.trim() });
    if (p.status === '待审核') {
      this.transitionTo(p, '退回', '审核提出批注');
    }
    this.emit('annotations');
    return ann;
  }

  replyAnnotation(id: string, reply: string, status: Exclude<AnnotationStatus, 'pending'>) {
    const p = this.project;
    if (!p) return;
    const ann = p.annotations.find((a) => a.id === id);
    if (!ann) return;
    ann.reply = reply.trim();
    ann.status = status;
    ann.repliedBy = this.currentName;
    ann.repliedAt = Date.now();
    p.updatedAt = Date.now();
    this.log(p, status === 'resolved' ? '回复批注 · 已改' : '回复批注 · 说明理由', { note: reply.trim() });
    this.emit('annotations');
  }

  reopenAnnotation(id: string) {
    const p = this.project;
    if (!p) return;
    const ann = p.annotations.find((a) => a.id === id);
    if (!ann) return;
    ann.status = 'pending';
    ann.repliedAt = null;
    ann.repliedBy = null;
    this.emit('annotations');
  }

  deleteAnnotation(id: string) {
    const p = this.project;
    if (!p) return;
    p.annotations = p.annotations.filter((a) => a.id !== id);
    this.emit('annotations');
  }

  resetAll() {
    this.state = seedState();
    this.persist();
    this.emit('reset');
  }

  statusCounts() {
    const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<ProjectStatus, number>;
    for (const p of this.state.projects) counts[p.status]++;
    return counts;
  }
}

function statusAction(from: ProjectStatus, to: ProjectStatus): string {
  if (to === '待审核') return '提交待审核';
  if (to === '已采用') return '审核采用';
  if (to === '退回') return from === '待审核' ? '审核退回' : '退回修改';
  return '转入制作中';
}
