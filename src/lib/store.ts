import { createStore, produce } from 'solid-js/store';
import { createSignal } from 'solid-js';
import {
  DEFAULT_COMP,
  DEFAULT_CUT,
  emptyDoc,
  type BackgroundRecord,
  type CutParams,
  type CompositeParams,
  type EditDoc,
  type ImageRecord,
  type Item,
  type ItemStatus,
  type Person,
  type Project,
  type ReviewEvent,
  type ReviewMetrics,
  type Role,
  type Stroke,
} from './types';
import * as db from './db';
import { BG_SPECS, BG_H, BG_W, SHOT_SPECS, renderBackground, renderShot, type ShotSpec } from '../seed/shots';

export interface Toast {
  id: number;
  kind: 'info' | 'ok' | 'warn' | 'error';
  text: string;
  detail?: string;
}

const PEOPLE: Record<Role, Person> = {
  client: {
    id: 'p-client',
    name: '苏芃',
    role: 'client',
    org: '康步医疗器械',
    title: '品牌电商负责人',
    color: '#5b8def',
  },
  producer: {
    id: 'p-producer',
    name: '林知遥',
    role: 'producer',
    org: '像素工坊',
    title: '修图制作员',
    color: '#2fb3a1',
  },
  supervisor: {
    id: 'p-supervisor',
    name: '钱立群',
    role: 'supervisor',
    org: '像素工坊',
    title: '影像主管',
    color: '#d78b3c',
  },
};

export interface StoreState {
  ready: boolean;
  role: Role;
  people: Person[];
  projects: Project[];
  items: Item[];
  images: Record<string, ImageRecord>;
  backgrounds: BackgroundRecord[];
  toasts: Toast[];
  activeProjectId: string | null;
  activeItemId: string | null;
  seeding: boolean;
}

const [state, setState] = createStore<StoreState>({
  ready: false,
  role: 'producer',
  people: Object.values(PEOPLE),
  projects: [],
  items: [],
  images: {},
  backgrounds: [],
  toasts: [],
  activeProjectId: null,
  activeItemId: null,
  seeding: false,
});

export { state, setState };

let toastSeq = 0;
export function toast(kind: Toast['kind'], text: string, detail?: string) {
  // Clicking a locked control repeatedly should not stack notices; the same
  // message already on screen is enough feedback.
  if (state.toasts.some((t) => t.text === text)) return;
  const id = ++toastSeq;
  setState('toasts', (t) => [...t.slice(-3), { id, kind, text, detail }]);
  setTimeout(() => dismissToast(id), kind === 'error' ? 8000 : 4200);
}

export function dismissToast(id: number) {
  setState('toasts', (t) => t.filter((x) => x.id !== id));
}

export function currentPerson(): Person {
  return PEOPLE[state.role] ?? PEOPLE.producer;
}

export function setRole(role: Role) {
  setState('role', role);
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const META_SEED = 'seed-version';
const SEED_VERSION = 8;

export async function boot() {
  setState('seeding', true);
  try {
    const version = await db.getMeta<number>(META_SEED);
    const projects = await db.loadProjects();
    const needsSeed = version !== SEED_VERSION || projects.length === 0;
    if (needsSeed) {
      await seedAll();
    } else {
      const [items, images, backgrounds] = await Promise.all([db.loadItems(), db.loadImages(), db.loadBackgrounds()]);
      setState('projects', projects.sort((a, b) => b.createdAt - a.createdAt));
      setState('items', items.sort((a, b) => a.index - b.index));
      setState('backgrounds', backgrounds.sort((a, b) => a.createdAt - b.createdAt));
      const map: Record<string, ImageRecord> = {};
      for (const im of images) map[im.id] = im;
      setState('images', map);
      setState('activeProjectId', projects[0]?.id ?? null);
    }
  } catch (err) {
    console.error(err);
    toast('error', '初始化失败', String(err));
  } finally {
    setState('seeding', false);
    setState('ready', true);
  }
}

async function seedProofs(
  items: Item[],
  rendered: Map<string, { blob: Blob; thumb: string }>,
  backgrounds: BackgroundRecord[],
) {
  const { CutoutEngine } = await import('../gpu/engine');
  type Engine = Awaited<ReturnType<typeof CutoutEngine.create>>;
  const { buildProof } = await import('./proof');

  // A hidden canvas is enough: the composite is a compute pass, then a blit.
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const targets = items.filter((i) => i.status === 'review' || i.status === 'approved' || i.status === 'rework');

  for (const item of targets) {
    const imgKey = item.sourceImageId.replace('img-', '');
    const src = rendered.get(imgKey);
    if (!src) continue;
    let engine: Engine | null = null;
    let bgBitmap: ImageBitmap | null = null;
    try {
      const bitmap = await createImageBitmap(src.blob);
      engine = await CutoutEngine.create(bitmap);
      engine.sync(item.doc.cut, item.doc.strokes);
      let bgCct: number | null = null;
      if (item.doc.bg) {
        const bgRec = backgrounds.find((b) => b.id === item.doc.bg!.backgroundId);
        if (bgRec) {
          bgBitmap = await createImageBitmap(bgRec.blob);
          engine.setBackground(bgBitmap);
          bgCct = await CutoutEngine.backgroundCct(bgBitmap);
        }
      }
      const { dataUrl, metrics } = await buildProof(
        engine,
        item.doc.comp,
        bgCct,
        canvas,
        item.width,
        item.height,
        900,
      );
      item.proof = dataUrl;
      item.proofMetrics = metrics;
      // Keep the newest review event's metrics in step with the snapshot.
      const last = item.reviews[item.reviews.length - 1];
      if (last) last.metrics = metrics;
    } catch (err) {
      console.warn('[seed] proof render failed', item.id, err);
    } finally {
      engine?.destroy();
      bgBitmap?.close();
    }
  }
}

async function seedAll() {
  const now = Date.now();
  const DAY = 86400000;

  // --- background library -------------------------------------------------
  const bgRecords: BackgroundRecord[] = [];
  for (const spec of BG_SPECS) {
    const { blob, thumb } = await renderBackground(spec);
    bgRecords.push({
      id: `bg-${spec.key}`,
      name: spec.name,
      kind: 'stock',
      tags: spec.tags,
      blob,
      thumb,
      width: BG_W,
      height: BG_H,
      createdAt: now,
      createdBy: '系统素材库',
    });
  }
  await Promise.all(bgRecords.map((b) => db.putBackground(b)));

  // --- product shots ------------------------------------------------------
  const rendered = new Map<string, { blob: Blob; width: number; height: number; thumb: string; name: string }>();
  for (const spec of SHOT_SPECS) {
    const shot = await renderShot(spec);
    rendered.set(spec.key, shot);
  }
  const imageRecords: ImageRecord[] = [];
  for (const [key, shot] of rendered) {
    imageRecords.push({
      id: `img-${key}`,
      blob: shot.blob,
      width: shot.width,
      height: shot.height,
      name: shot.name,
      thumb: shot.thumb,
    });
  }
  await Promise.all(imageRecords.map((im) => db.putImage(im)));

  // --- projects -----------------------------------------------------------
  const projectA: Project = {
    id: 'proj-2026-018',
    code: 'KS-2026-018',
    clientId: PEOPLE.client.id,
    clientName: '康步医疗器械 · 苏芃',
    brand: '康步 RECOVIA',
    model: 'RX-W450 四轮助行器 / RC-210 前臂拐杖 / RW-08 康复轮椅',
    scenario: '2026 春季电商主图 + 线下目录册',
    deliverableCount: 8,
    dueAt: now + DAY * 4 + 3600_000 * 6,
    createdAt: now - DAY * 6,
    notes: '主图需透明底 PNG 与暖木/水泥两套场景合成图；目录册按 300dpi 排版，边缘不能有白边。',
    createdBy: '苏芃',
  };
  const projectB: Project = {
    id: 'proj-2026-021',
    code: 'KS-2026-021',
    clientId: PEOPLE.client.id,
    clientName: '康步医疗器械 · 苏芃',
    brand: '康步 RECOVIA',
    model: 'RP-30 双杠训练架 / HG-12 握力训练器',
    scenario: '康复中心机构采购提案册',
    deliverableCount: 4,
    dueAt: now + DAY * 9,
    createdAt: now - DAY * 2,
    notes: '深灰影棚优先，需突出金属件质感；双杠要保留横杆上的防滑纹理。',
    createdBy: '苏芃',
  };

  const shot = (key: string) => rendered.get(key)!;
  const mkItem = (
    id: string,
    projectId: string,
    index: number,
    title: string,
    imgKey: string,
    status: ItemStatus,
    extra: Partial<Item> = {},
  ): Item => {
    const s = shot(imgKey);
    return {
      id,
      projectId,
      index,
      title,
      sourceImageId: `img-${imgKey}`,
      sourceName: s.name,
      width: s.width,
      height: s.height,
      thumb: s.thumb,
      proof: null,
      proofMetrics: null,
      status,
      ownerId: PEOPLE.producer.id,
      ownerName: PEOPLE.producer.name,
      reworkCount: 0,
      createdAt: now - DAY * 3,
      updatedAt: now - DAY * 1,
      submittedAt: null,
      approvedAt: null,
      doc: emptyDoc(now - DAY * 2),
      reviews: [],
      ...extra,
    };
  };

  const bg = (key: string) => {
    const rec = bgRecords.find((b) => b.id === `bg-${key}`)!;
    return { kind: 'library' as const, backgroundId: rec.id, name: rec.name, thumb: rec.thumb };
  };

  const items: Item[] = [
    mkItem('item-a1', projectA.id, 1, '四轮助行器 · 主图 01', 'walker-warm', 'approved', {
      submittedAt: now - DAY * 2,
      approvedAt: now - DAY * 1,
      reworkCount: 1,
      updatedAt: now - DAY * 1,
      reviews: [
        {
          id: 'rv-a1-1',
          at: now - DAY * 2 + 3600_000 * 3,
          reviewerId: PEOPLE.supervisor.id,
          reviewerName: PEOPLE.supervisor.name,
          decision: 'rejected',
          comment: '助行器前轮与地面接触处的阴影偏硬，蒙版边缘有 1px 白边，请收一下羽化并清掉底色溢出。',
          metrics: null,
        },
        {
          id: 'rv-a1-2',
          at: now - DAY * 1,
          reviewerId: PEOPLE.supervisor.id,
          reviewerName: PEOPLE.supervisor.name,
          decision: 'approved',
          comment: '白边已清理干净，暖棚色温校正自然，通过。',
          metrics: null,
        },
      ],
      doc: {
        cut: { ...DEFAULT_CUT, feather: 1.8, hardness: 0.72 },
        comp: { ...DEFAULT_COMP, tempStrength: 0.62, shadowSoftness: 18, shadowOpacity: 0.4 },
        strokes: [],
        bg: bg('warm-wood'),
        updatedAt: now - DAY * 1,
      },
    }),
    // Deliberately mid-flight: a cool studio shot with a cyan spill left on the
    // rim and the correction turned down, so the review desk has real defects
    // (halo + colour cast) to argue about instead of a fake green check.
    mkItem('item-a2', projectA.id, 2, '四轮助行器 · 场景图 02', 'walker-cool', 'review', {
      submittedAt: now - 3600_000 * 5,
      updatedAt: now - 3600_000 * 5,
      doc: {
        cut: { ...DEFAULT_CUT, feather: 1.2, bgTolerance: 1.55 },
        comp: { ...DEFAULT_COMP, tempStrength: 0.22, bgScale: 1.08, bgOffsetY: -0.04 },
        strokes: [],
        bg: bg('charcoal'),
        updatedAt: now - 3600_000 * 5,
      },
    }),
    mkItem('item-a3', projectA.id, 3, '前臂拐杖 · 主图 03', 'crutches-grey', 'rework', {
      reworkCount: 2,
      submittedAt: now - DAY * 1,
      updatedAt: now - 3600_000 * 8,
      reviews: [
        {
          id: 'rv-a3-1',
          at: now - DAY * 2,
          reviewerId: PEOPLE.supervisor.id,
          reviewerName: PEOPLE.supervisor.name,
          decision: 'rejected',
          comment: '拐杖腋托的软垫边缘被削掉了一块，笔刷补回来。',
          metrics: null,
        },
        {
          id: 'rv-a3-2',
          at: now - DAY * 1,
          reviewerId: PEOPLE.supervisor.id,
          reviewerName: PEOPLE.supervisor.name,
          decision: 'rejected',
          comment: '色温偏冷，与灰棚融合度不够；另外两根杖之间的镂空仍残留底色。',
          metrics: null,
        },
      ],
      doc: {
        cut: { ...DEFAULT_CUT, bgTolerance: 0.86, feather: 2.2 },
        comp: { ...DEFAULT_COMP, tempStrength: 0.35 },
        strokes: [],
        bg: bg('concrete'),
        updatedAt: now - 3600_000 * 8,
      },
    }),
    mkItem('item-a4', projectA.id, 4, '康复轮椅 · 主图 04', 'wheelchair-neutral', 'doing', {
      updatedAt: now - 3600_000 * 2,
      doc: {
        cut: { ...DEFAULT_CUT, bgTolerance: 0.95 },
        comp: { ...DEFAULT_COMP },
        strokes: [],
        bg: bg('gym-mirror'),
        updatedAt: now - 3600_000 * 2,
      },
    }),
    mkItem('item-a5', projectA.id, 5, '可调手杖 · 主图 05', 'cane-warm', 'todo'),
    mkItem('item-a6', projectA.id, 6, '四轮助行器 · 白底主图 06', 'walker-grey', 'todo'),
    mkItem('item-a7', projectA.id, 7, '前臂拐杖 · 场景图 07', 'crutches-grey', 'todo'),
    mkItem('item-a8', projectA.id, 8, '康复轮椅 · 场景图 08', 'wheelchair-neutral', 'todo'),

    mkItem('item-b1', projectB.id, 1, '双杠训练架 · 提案图 01', 'bars-cool', 'doing', {
      updatedAt: now - 3600_000 * 26,
      doc: {
        cut: { ...DEFAULT_CUT, bgTolerance: 0.88, edgeSnap: 0.8 },
        comp: { ...DEFAULT_COMP, shadowSoftness: 8, shadowOpacity: 0.5 },
        strokes: [],
        bg: null,
        updatedAt: now - 3600_000 * 26,
      },
    }),
    mkItem('item-b2', projectB.id, 2, '握力训练器 · 提案图 02', 'grip-neutral', 'review', {
      submittedAt: now - 3600_000 * 30,
      updatedAt: now - 3600_000 * 30,
      doc: {
        cut: { ...DEFAULT_CUT },
        comp: { ...DEFAULT_COMP, tempStrength: 0.78 },
        strokes: [],
        bg: bg('mint-wall'),
        updatedAt: now - 3600_000 * 30,
      },
    }),
    mkItem('item-b3', projectB.id, 3, '双杠训练架 · 细节图 03', 'bars-cool', 'todo'),
    mkItem('item-b4', projectB.id, 4, '握力训练器 · 白底图 04', 'grip-neutral', 'todo'),
  ];

  // Give the demo items that already sit in review/approved a real snapshot and
  // real edge/colour numbers, so the review desk is not an empty shell on first
  // open. Each item is rendered through its own GPU engine, exactly like a
  // production submit.
  await seedProofs(items, rendered, bgRecords);

  await db.putProjects([projectA, projectB]);
  await db.putItems(items);
  await db.setMeta(META_SEED, SEED_VERSION);

  const imageMap: Record<string, ImageRecord> = {};
  for (const im of imageRecords) imageMap[im.id] = im;

  setState('projects', [projectA, projectB]);
  setState('items', items);
  setState('backgrounds', bgRecords);
  setState('images', imageMap);
  setState('activeProjectId', projectA.id);
}

// ---------------------------------------------------------------------------
// Projects & items
// ---------------------------------------------------------------------------

export function projectById(id: string) {
  return state.projects.find((p) => p.id === id);
}

export function itemsOfProject(projectId: string) {
  return state.items.filter((i) => i.projectId === projectId).sort((a, b) => a.index - b.index);
}

export function itemById(id: string) {
  return state.items.find((i) => i.id === id);
}

export function setActiveProject(id: string | null) {
  setState('activeProjectId', id);
}

export function setActiveItem(id: string | null) {
  setState('activeItemId', id);
}

export interface NewProjectInput {
  brand: string;
  model: string;
  scenario: string;
  deliverableCount: number;
  dueAt: number;
  notes: string;
}

export async function createProject(input: NewProjectInput): Promise<Project> {
  const now = Date.now();
  // Pick the next free sequence from the existing codes rather than counting
  // projects, so deleting or re-seeding can never mint a duplicate project code.
  const used = new Set(state.projects.map((p) => Number(p.code.split('-').pop()) || 0));
  let seq = 18;
  while (used.has(seq)) seq++;
  const project: Project = {
    id: `proj-${now.toString(36)}`,
    code: `KS-2026-${String(seq).padStart(3, '0')}`,
    clientId: PEOPLE.client.id,
    clientName: `${PEOPLE.client.org} · ${PEOPLE.client.name}`,
    brand: input.brand,
    model: input.model,
    scenario: input.scenario,
    deliverableCount: input.deliverableCount,
    dueAt: input.dueAt,
    createdAt: now,
    notes: input.notes,
    createdBy: PEOPLE.client.name,
  };
  setState('projects', (ps) => [project, ...ps]);
  setState('activeProjectId', project.id);
  await db.putProjects([project]);
  return project;
}

export async function createItem(projectId: string, source: { id: string; name: string; width: number; height: number; thumb: string }, title?: string): Promise<Item> {
  const project = projectById(projectId);
  const siblings = itemsOfProject(projectId);
  const index = siblings.length > 0 ? Math.max(...siblings.map((s) => s.index)) + 1 : 1;
  const now = Date.now();
  const item: Item = {
    id: `item-${now.toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`,
    projectId,
    index,
    title: title || `条目 ${String(index).padStart(2, '0')}`,
    sourceImageId: source.id,
    sourceName: source.name,
    width: source.width,
    height: source.height,
    thumb: source.thumb,
    proof: null,
    proofMetrics: null,
    status: 'todo',
    ownerId: PEOPLE.producer.id,
    ownerName: PEOPLE.producer.name,
    reworkCount: 0,
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
    approvedAt: null,
    doc: emptyDoc(now),
    reviews: [],
  };
  setState('items', (list) => [...list, item]);
  await db.putItems([item]);
  void project;
  return item;
}

export async function updateItem(id: string, patch: Partial<Item>) {
  const idx = state.items.findIndex((i) => i.id === id);
  if (idx < 0) return;
  setState('items', idx, produce((item) => Object.assign(item, patch)));
  const updated = state.items[idx];
  await db.putItems([{ ...updated }]);
}

export async function updateDoc(id: string, patch: Partial<EditDoc>) {
  const idx = state.items.findIndex((i) => i.id === id);
  if (idx < 0) return;
  setState(
    'items',
    idx,
    produce((item) => {
      item.doc = { ...item.doc, ...patch, updatedAt: Date.now() };
      item.updatedAt = Date.now();
    }),
  );
  await db.putItems([{ ...state.items[idx] }]);
}

export async function patchCut(id: string, patch: Partial<CutParams>) {
  const idx = state.items.findIndex((i) => i.id === id);
  if (idx < 0) return;
  setState(
    'items',
    idx,
    produce((item) => {
      item.doc.cut = { ...item.doc.cut, ...patch };
      item.doc.updatedAt = Date.now();
      item.updatedAt = Date.now();
    }),
  );
  await db.putItems([{ ...state.items[idx] }]);
}

export async function patchComp(id: string, patch: Partial<CompositeParams>) {
  const idx = state.items.findIndex((i) => i.id === id);
  if (idx < 0) return;
  setState(
    'items',
    idx,
    produce((item) => {
      item.doc.comp = { ...item.doc.comp, ...patch };
      item.doc.updatedAt = Date.now();
      item.updatedAt = Date.now();
    }),
  );
  await db.putItems([{ ...state.items[idx] }]);
}

export async function addStroke(id: string, stroke: Stroke) {
  const idx = state.items.findIndex((i) => i.id === id);
  if (idx < 0) return;
  setState(
    'items',
    idx,
    produce((item) => {
      item.doc.strokes.push(stroke);
      item.doc.updatedAt = Date.now();
      item.updatedAt = Date.now();
    }),
  );
  await db.putItems([{ ...state.items[idx] }]);
}

export async function clearStrokes(id: string) {
  const idx = state.items.findIndex((i) => i.id === id);
  if (idx < 0) return;
  setState(
    'items',
    idx,
    produce((item) => {
      item.doc.strokes = [];
      item.doc.updatedAt = Date.now();
    }),
  );
  await db.putItems([{ ...state.items[idx] }]);
}

export async function submitForReview(id: string, metrics: ReviewMetrics | null, proof: string | null) {
  const idx = state.items.findIndex((i) => i.id === id);
  if (idx < 0) return;
  const now = Date.now();
  setState(
    'items',
    idx,
    produce((item) => {
      item.status = 'review';
      item.submittedAt = now;
      item.updatedAt = now;
      item.proof = proof;
      item.proofMetrics = metrics;
      item.reviews.push({
        id: `rv-${now.toString(36)}`,
        at: now,
        reviewerId: PEOPLE.producer.id,
        reviewerName: PEOPLE.producer.name,
        decision: 'approved',
        comment: '提交审核',
        metrics,
      });
    }),
  );
  await db.putItems([{ ...state.items[idx] }]);
}

export async function decideReview(id: string, decision: 'approved' | 'rejected', comment: string, metrics: ReviewMetrics | null) {
  const idx = state.items.findIndex((i) => i.id === id);
  if (idx < 0) return;
  const now = Date.now();
  setState(
    'items',
    idx,
    produce((item) => {
      item.reviews.push({
        id: `rv-${now.toString(36)}`,
        at: now,
        reviewerId: PEOPLE.supervisor.id,
        reviewerName: PEOPLE.supervisor.name,
        decision,
        comment,
        metrics,
      });
      item.updatedAt = now;
      if (decision === 'approved') {
        item.status = 'approved';
        item.approvedAt = now;
      } else {
        item.status = 'rework';
        item.reworkCount += 1;
      }
    }),
  );
  await db.putItems([{ ...state.items[idx] }]);
}

// ---------------------------------------------------------------------------
// Backgrounds
// ---------------------------------------------------------------------------

export async function addBackgroundFromFile(file: File, name: string): Promise<BackgroundRecord> {
  const bmp = await createImageBitmap(file);
  const { makeCanvas, canvasToDataUrl, canvasToBlob } = await import('../seed/art');
  const [canvas, ctx] = makeCanvas(bmp.width, bmp.height);
  ctx.drawImage(bmp, 0, 0);
  const thumb = canvasToDataUrl(canvas, 220);
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
  const rec: BackgroundRecord = {
    id: `bg-upl-${Date.now().toString(36)}`,
    name,
    kind: 'upload',
    tags: ['自定义'],
    blob,
    thumb,
    width: bmp.width,
    height: bmp.height,
    createdAt: Date.now(),
    createdBy: currentPerson().name,
  };
  bmp.close();
  setState('backgrounds', (b) => [...b, rec]);
  await db.putBackground(rec);
  return rec;
}

export async function registerImage(rec: ImageRecord) {
  setState('images', rec.id, rec);
  await db.putImage(rec);
}

export async function deleteBackground(id: string) {
  setState('backgrounds', (b) => b.filter((x) => x.id !== id));
  await db.deleteBackgroundRow(id);
}

export function bgById(id: string) {
  return state.backgrounds.find((b) => b.id === id);
}

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------

export function projectProgress(projectId: string) {
  const items = itemsOfProject(projectId);
  const approved = items.filter((i) => i.status === 'approved').length;
  const review = items.filter((i) => i.status === 'review').length;
  const rework = items.filter((i) => i.status === 'rework').length;
  const doing = items.filter((i) => i.status === 'doing').length;
  return { total: items.length, approved, review, rework, doing, done: approved };
}

