import { createEffect, createMemo } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import type {
  Batch, BatchMeta, BatchStatus, ComposeSettings, Inspection, Measurement, Photo, Role, Version,
} from './types';
import { OPERATOR } from './types';
import { currentMonth, nowISO, uid } from './utils';
import { seedData } from './seed';
import { clearSnapshot, loadSnapshot, saveSnapshot } from './idb';
import { evaluateMeasurements, type EvalResult } from './store-eval';

export { evaluateMeasurements } from './store-eval';
export type { EvalResult } from './store-eval';

interface Toast {
  id: string;
  kind: 'ok' | 'warn' | 'err';
  text: string;
}

interface AppState {
  batches: Batch[];
  photos: Photo[];
  versions: Version[];
  inspections: Inspection[];
  activeBatchId: string | null;
  activePhotoId: string | null;
  role: Role;
  toast: Toast[];
  settings: ComposeSettings;
  ready: boolean;
  storage: 'idb' | 'local' | 'none';
}

export const defaultSettings: ComposeSettings = {
  background: 'studio',
  shadow: 0.5,
  feather: 1.1,
  measuredHeightCm: 60,
  measuredDiameterMm: 8,
  showRuler: true,
  tolerance: 46,
};

function emptyState(): AppState {
  return {
    batches: [],
    photos: [],
    versions: [],
    inspections: [],
    activeBatchId: null,
    activePhotoId: null,
    role: 'technician',
    toast: [],
    settings: { ...defaultSettings },
    ready: false,
    storage: 'none',
  };
}

export const [state, setState] = createStore<AppState>(emptyState());

interface Persisted {
  batches: Batch[];
  photos: Photo[];
  versions: Version[];
  inspections: Inspection[];
  activeBatchId: string | null;
  activePhotoId: string | null;
  settings: ComposeSettings;
}

const LS_KEY = 'nursery-dispatch-ls-v1';

export async function initStore(): Promise<void> {
  const snapshot = await loadSnapshot<Persisted>();
  let loaded: Persisted | null = null;
  let storage: AppState['storage'] = 'none';

  if (snapshot && snapshot.batches?.length) {
    loaded = snapshot;
    storage = 'idb';
  } else {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Persisted;
        if (p.batches?.length) {
          loaded = p;
          storage = 'local';
        }
      }
    } catch {
      /* ignore */
    }
  }

  if (!loaded) {
    const seeded = seedData(defaultSettings);
    setState({ ...seeded, ready: true, storage: 'idb' });
    await saveSnapshot(plain());
    return;
  }

  setState({
    ...loaded,
    settings: { ...defaultSettings, ...loaded.settings },
    toast: [],
    ready: true,
    storage,
    activeBatchId: loaded.activeBatchId ?? loaded.batches[0]?.id ?? null,
    activePhotoId:
      loaded.activePhotoId ??
      loaded.photos.find((p) => p.batchId === (loaded!.activeBatchId ?? loaded!.batches[0]?.id))?.id ??
      null,
  });
}

/** Solid store 代理不能直接用于 structuredClone，需先转为普通对象 */
function plain(): Persisted {
  return JSON.parse(JSON.stringify(serialize())) as Persisted;
}

function serialize(): Persisted {
  return {
    batches: state.batches,
    photos: state.photos,
    versions: state.versions,
    inspections: state.inspections,
    activeBatchId: state.activeBatchId,
    activePhotoId: state.activePhotoId,
    settings: state.settings,
  };
}

let persistTimer: number | undefined;
let writing = false;
let dirty = false;

async function flush(): Promise<void> {
  if (writing) {
    dirty = true;
    return;
  }
  writing = true;
  try {
    await saveSnapshot(plain());
    setState('storage', 'idb');
  } catch (e) {
    console.warn('IndexedDB 写入失败，回落到 localStorage', e);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(plain()));
      setState('storage', 'local');
    } catch {
      setState('storage', 'none');
      pushToast('err', '本地存储不可用，本次编辑无法保存');
    }
  } finally {
    writing = false;
    if (dirty) {
      dirty = false;
      void flush();
    }
  }
}

export function persist(immediate = false): void {
  if (!state.ready) return;
  if (immediate) {
    void flush();
    return;
  }
  window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => void flush(), 400);
}

// 状态变化即调度一次保存
createEffect(() => {
  const fingerprint = [
    state.batches.length, state.photos.length, state.versions.length, state.inspections.length,
    state.activeBatchId, state.activePhotoId, state.batches, state.photos, state.versions, state.inspections,
  ];
  // 触发依赖收集
  JSON.stringify(state.settings);
  JSON.stringify(fingerprint);
  if (state.ready) persist();
});

export function pushToast(kind: Toast['kind'], text: string): void {
  const id = uid('toast');
  setState('toast', (t) => [...t, { id, kind, text }]);
  window.setTimeout(() => setState('toast', (t) => t.filter((x) => x.id !== id)), 4200);
}

export function dismissToast(id: string): void {
  setState('toast', (t) => t.filter((x) => x.id !== id));
}

export function setRole(role: Role): void {
  setState('role', role);
}

export function makeCode(variety: string, year: number): string {
  const prefix = variety.replace(/[^一-龥A-Za-z]/g, '').slice(0, 2) || 'MM';
  const n = state.batches.length + 1;
  let code = `MC-${year}-${prefix}-${String(n).padStart(3, '0')}`;
  let bump = 0;
  while (state.batches.some((b) => b.code === code)) {
    bump += 1;
    code = `MC-${year}-${prefix}-${String(n + bump).padStart(3, '0')}`;
  }
  return code;
}

export function createBatch(meta: BatchMeta): { ok: boolean; id?: string; error?: string } {
  if (!meta.variety.trim()) return { ok: false, error: '请填写品种名称' };
  if (!(meta.quantity > 0)) return { ok: false, error: '出圃数量需大于 0' };
  if (meta.diameterMin > meta.diameterMax) return { ok: false, error: '地径区间下限不能大于上限' };
  if (meta.heightMin > meta.heightMax) return { ok: false, error: '苗高区间下限不能大于上限' };
  if (!(meta.ageYears > 0)) return { ok: false, error: '苗龄需大于 0' };
  const code = meta.code.trim() || makeCode(meta.variety, new Date().getFullYear());
  if (state.batches.some((b) => b.code === code)) return { ok: false, error: `编号 ${code} 已存在` };

  const batch: Batch = {
    id: uid('batch'),
    code,
    variety: meta.variety.trim(),
    cultivar: meta.cultivar.trim() || '—',
    ageYears: meta.ageYears,
    diameterMin: meta.diameterMin,
    diameterMax: meta.diameterMax,
    heightMin: meta.heightMin,
    heightMax: meta.heightMax,
    quantity: Math.round(meta.quantity),
    block: meta.block.trim() || '—',
    createdAt: nowISO(),
    createdBy: OPERATOR.technician,
    note: '',
    status: 'draft',
  };
  setState(produce((s) => {
    s.batches.unshift(batch);
    s.activeBatchId = batch.id;
    s.activePhotoId = null;
  }));
  persist(true);
  pushToast('ok', `批次 ${code} 已建档，可上传样苗照片`);
  return { ok: true, id: batch.id };
}

export function updateBatch(id: string, patch: Partial<Batch>): void {
  setState('batches', (b) => b.id === id, patch);
}

export function deleteBatch(id: string): void {
  setState(produce((s) => {
    s.batches = s.batches.filter((b) => b.id !== id);
    const photoIds = s.photos.filter((p) => p.batchId === id).map((p) => p.id);
    s.photos = s.photos.filter((p) => p.batchId !== id);
    s.versions = s.versions.filter((v) => v.batchId !== id && !photoIds.includes(v.photoId));
    s.inspections = s.inspections.filter((i) => i.batchId !== id);
    if (s.activeBatchId === id) {
      s.activeBatchId = s.batches[0]?.id ?? null;
      s.activePhotoId = s.photos.find((p) => p.batchId === s.activeBatchId)?.id ?? null;
    }
  }));
  persist(true);
}

export function setActiveBatch(id: string | null): void {
  setState(produce((s) => {
    s.activeBatchId = id;
    s.activePhotoId = s.photos.find((p) => p.batchId === id)?.id ?? null;
  }));
}

export function setActivePhoto(id: string | null): void {
  setState('activePhotoId', id);
}

export function addPhoto(photo: Omit<Photo, 'id' | 'createdAt'>): Photo {
  const full: Photo = { ...photo, id: uid('photo'), createdAt: nowISO() };
  setState(produce((s) => {
    s.photos.push(full);
    s.activePhotoId = full.id;
    s.activeBatchId = full.batchId;
    const batch = s.batches.find((b) => b.id === full.batchId);
    if (batch && batch.status === 'draft') batch.status = 'ready';
  }));
  persist(true);
  return full;
}

export function updatePhoto(id: string, patch: Partial<Photo>): void {
  setState('photos', (p) => p.id === id, patch);
}

export function deletePhoto(id: string): void {
  setState(produce((s) => {
    s.photos = s.photos.filter((p) => p.id !== id);
    s.versions = s.versions.filter((v) => v.photoId !== id);
    if (s.activePhotoId === id) s.activePhotoId = null;
  }));
  persist(true);
}

export function setSettings(patch: Partial<ComposeSettings>): void {
  setState('settings', (s) => ({ ...s, ...patch }));
}

export function nextVersionNo(batchId: string, photoId: string): number {
  return state.versions
    .filter((v) => v.batchId === batchId && v.photoId === photoId)
    .reduce((m, v) => Math.max(m, v.no), 0) + 1;
}

export function addVersion(v: Omit<Version, 'id' | 'no' | 'createdAt'>): Version {
  const no = nextVersionNo(v.batchId, v.photoId);
  const full: Version = { ...v, id: uid('ver'), no, createdAt: nowISO() };
  setState('versions', (list) => [...list, full]);
  persist(true);
  pushToast('ok', `已保存 V${no} 版本（规格图 + 查验图）`);
  return full;
}

export function deleteVersion(id: string): void {
  setState('versions', (list) => list.filter((v) => v.id !== id));
  persist(true);
}

export function versionsOf(photoId: string): Version[] {
  return state.versions.filter((v) => v.photoId === photoId).sort((a, b) => a.no - b.no);
}

export function versionsOfBatch(batchId: string): Version[] {
  return state.versions.filter((v) => v.batchId === batchId).sort((a, b) => {
    if (a.photoId !== b.photoId) return a.photoId.localeCompare(b.photoId);
    return a.no - b.no;
  });
}

export function photosOfBatch(batchId: string | null): Photo[] {
  if (!batchId) return [];
  return state.photos.filter((p) => p.batchId === batchId);
}

export function inspectionOf(batchId: string): Inspection | undefined {
  return state.inspections.find((i) => i.batchId === batchId);
}

export function saveInspection(input: {
  batchId: string;
  sampleSize: number;
  threshold: number;
  notes: string;
  measurements: Measurement[];
}): Inspection {
  const batch = state.batches.find((b) => b.id === input.batchId)!;
  const result = evaluateMeasurements(batch, input.measurements, input.threshold);
  const existing = inspectionOf(input.batchId);
  const insp: Inspection = {
    id: existing?.id ?? uid('insp'),
    batchId: input.batchId,
    inspector: OPERATOR.inspector,
    sampledAt: nowISO(),
    sampleSize: input.sampleSize,
    threshold: input.threshold,
    passCount: result.passCount,
    passRate: result.passRate,
    verdict: result.verdict,
    reasons: result.reasons,
    notes: input.notes,
    measurements: input.measurements.map((m) => ({ ...m })),
  };
  setState(produce((s) => {
    s.inspections = [...s.inspections.filter((i) => i.batchId !== input.batchId), insp];
    const b = s.batches.find((x) => x.id === input.batchId);
    if (b && b.status !== 'archived') b.status = result.verdict === 'pass' ? 'passed' : 'failed';
  }));
  persist(true);
  return insp;
}

export function archiveBatch(batchId: string): { ok: boolean; error?: string } {
  const batch = state.batches.find((b) => b.id === batchId);
  if (!batch) return { ok: false, error: '批次不存在' };
  const insp = inspectionOf(batchId);
  if (!state.versions.some((v) => v.batchId === batchId)) {
    return { ok: false, error: '尚无规格图版本，不能归档' };
  }
  if (!insp) return { ok: false, error: '尚未完成抽检，不能归档' };
  if (insp.verdict === 'fail') return { ok: false, error: '不达标批次不出圃，不能归档出圃报告' };
  setState(produce((s) => {
    const b = s.batches.find((x) => x.id === batchId)!;
    b.status = 'archived';
    b.archivedAt = nowISO();
    b.dispatchMonth = currentMonth();
  }));
  persist(true);
  pushToast('ok', `批次 ${batch.code} 已归档，可在档案检索中调阅`);
  return { ok: true };
}

export function statusOfBatch(batchId: string): BatchStatus {
  return state.batches.find((b) => b.id === batchId)?.status ?? 'draft';
}

export const activeBatch = createMemo(() => state.batches.find((b) => b.id === state.activeBatchId) ?? null);
export const activePhoto = createMemo(() => state.photos.find((p) => p.id === state.activePhotoId) ?? null);

export async function resetAll(): Promise<void> {
  localStorage.removeItem(LS_KEY);
  await clearSnapshot();
  const seeded = seedData(defaultSettings);
  setState({ ...seeded, ready: true, storage: 'idb', toast: [] });
  await saveSnapshot(plain());
  pushToast('ok', '演示数据已重置');
}

export function exportAll(): string {
  return JSON.stringify({
    exportedAt: nowISO(),
    batches: state.batches,
    photos: state.photos,
    versions: state.versions,
    inspections: state.inspections,
  }, null, 2);
}
