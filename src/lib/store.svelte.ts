import type {
  GenParams,
  Pt,
  GlyphRecord,
  GlyphStatus,
  GlyphSkeleton,
  GlyphVersion,
  ReviewComment,
  StrokeState,
} from './types';
import { DEFAULT_PARAMS, composeGlyph, generateGlyph, renderStroke, TERMINAL_LABEL } from './generator';
import { getSkeleton } from './skeletons';
import { buildSeedRecords, makeRecordId, weightNameFor, widthForWeight, LIBRARIES } from './seed';
import type { Ring } from './geometry';

const STORAGE_KEY = 'glyph-forge.v2';
const UI_KEY = 'glyph-forge.ui.v2';

export type Screen = 'archive' | 'generate' | 'compare' | 'review';

export interface Filters {
  library: string;
  weightName: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  query: string;
}

export const EMPTY_FILTERS: Filters = {
  library: '',
  weightName: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  query: '',
};

const nowIso = () => new Date().toISOString();
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export { fmtDate };

function dateKey(iso: string) {
  return fmtDate(iso);
}

export interface Toast {
  id: number;
  kind: 'ok' | 'warn' | 'info';
  text: string;
}

export class Studio {
  records = $state<GlyphRecord[]>([]);
  screen = $state<Screen>('archive');
  selectedId = $state<string | null>(null);
  filters = $state<Filters>({ ...EMPTY_FILTERS });
  toasts = $state<Toast[]>([]);
  /** 生成台：当前正在编辑的档案 id */
  editorId = $state<string | null>(null);
  /** 比对：左右版本 id */
  compareA = $state<number | null>(null);
  compareB = $state<number | null>(null);
  /** 报告预览 */
  reportHtml = $state<string | null>(null);
  reportTitle = $state('');
  hydrated = $state(false);

  load() {
    if (this.hydrated) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { records: GlyphRecord[]; savedAt: string };
        if (parsed?.records?.length) {
          this.records = parsed.records;
          this.hydrated = true;
          this.restoreUi();
          return;
        }
      }
    } catch {
      // 损坏则重建种子
    }
    this.records = buildSeedRecords();
    this.hydrated = true;
    this.save();
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ records: this.records, savedAt: nowIso() }));
    } catch {
      this.toast('warn', '本地存储空间不足，档案未能写入浏览器缓存');
    }
    this.saveUi();
  }

  saveUi() {
    try {
      localStorage.setItem(
        UI_KEY,
        JSON.stringify({
          screen: this.screen,
          selectedId: this.selectedId,
          editorId: this.editorId,
          filters: this.filters,
        }),
      );
    } catch {
      /* 忽略 */
    }
  }

  restoreUi() {
    try {
      const raw = localStorage.getItem(UI_KEY);
      if (!raw) return;
      const ui = JSON.parse(raw);
      if (ui.screen && ['archive', 'generate', 'compare', 'review'].includes(ui.screen)) this.screen = ui.screen;
      if (ui.selectedId && this.records.some((r) => r.id === ui.selectedId)) this.selectedId = ui.selectedId;
      if (ui.editorId && this.records.some((r) => r.id === ui.editorId)) this.editorId = ui.editorId;
      if (ui.filters) this.filters = { ...EMPTY_FILTERS, ...ui.filters };
    } catch {
      /* 忽略 */
    }
  }

  resetAll() {
    this.records = buildSeedRecords();
    this.selectedId = null;
    this.editorId = null;
    this.save();
    this.toast('info', '已重置为工作室示例档案');
  }

  toast(kind: Toast['kind'], text: string) {
    const id = Date.now() + Math.random();
    this.toasts = [...this.toasts, { id, kind, text }];
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }, 3200);
  }

  get selected(): GlyphRecord | undefined {
    return this.records.find((r) => r.id === this.selectedId);
  }

  get editorRecord(): GlyphRecord | undefined {
    return this.records.find((r) => r.id === this.editorId) ?? this.selected;
  }

  currentVersion(rec: GlyphRecord | undefined): GlyphVersion | undefined {
    if (!rec) return undefined;
    return rec.versions.find((v) => v.id === rec.currentVersionId) ?? rec.versions[rec.versions.length - 1];
  }

  filtered = $derived.by(() => {
    const f = this.filters;
    return this.records.filter((r) => {
      if (f.library && r.library !== f.library) return false;
      if (f.weightName && r.weightName !== f.weightName) return false;
      if (f.status && r.status !== f.status) return false;
      if (f.dateFrom && dateKey(r.createdAt) < f.dateFrom) return false;
      if (f.dateTo && dateKey(r.createdAt) > f.dateTo) return false;
      if (f.query) {
        const q = f.query.trim().toLowerCase();
        const hay = `${r.id} ${r.char} ${r.pinyin} ${r.library} ${r.weightName} ${r.skeletonSource.ref} ${r.status}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  });

  activeFilterCount = $derived.by(() => {
    const f = this.filters;
    let n = 0;
    if (f.library) n++;
    if (f.weightName) n++;
    if (f.status) n++;
    if (f.dateFrom || f.dateTo) n++;
    if (f.query.trim()) n++;
    return n;
  });

  nextSeq(): number {
    return this.records.reduce((m, r) => Math.max(m, r.seq), 0) + 1;
  }

  createRecord(input: {
    char: string;
    library: string;
    weightName: string;
    skeletonSourceKind: string;
    skeletonRef: string;
    params: GenParams;
    note: string;
  }): GlyphRecord | null {
    const sk = getSkeleton(input.char);
    if (!sk) {
      this.toast('warn', `骨架库中没有「${input.char}」的字形`);
      return null;
    }
    const createdAt = nowIso();
    const seq = this.nextSeq();
    const id = makeRecordId(seq, createdAt);
    const params = { ...input.params };
    const gen = generateGlyph({ char: input.char, skeleton: sk, params });
    const comp = composeGlyph(gen.strokes, params);
    const version: GlyphVersion = {
      id: 1,
      label: 'v1',
      createdAt,
      params,
      strokes: gen.strokes,
      metrics: comp.metrics,
      svgPath: comp.path,
      polys: serializeMultiPoly(comp.polys),
      fingerprint: gen.fingerprint,
      note: input.note || '初版样张：由骨架与参数自动生成。',
      author: '设计员 · 沈砚',
      lockedCount: 0,
    };
    const rec: GlyphRecord = {
      id,
      seq,
      char: input.char,
      pinyin: sk.pinyin,
      library: input.library,
      weightName: input.weightName,
      weight: parseInt(input.weightName, 10) || 400,
      faceBox: { width: 1000, height: 1000, baseline: 0, descender: 200 },
      skeletonSource: { kind: input.skeletonSourceKind, ref: input.skeletonRef },
      status: '草稿',
      createdAt,
      updatedAt: createdAt,
      seed: params.seed,
      params,
      versions: [version],
      currentVersionId: 1,
      comments: [],
      plate: {
        svgPath: comp.path,
        createdAt,
        fingerprint: gen.fingerprint,
        note: '建档初版样张',
      },
    };
    this.records = [rec, ...this.records];
    this.selectedId = id;
    this.save();
    this.toast('ok', `已建档 ${id}「${rec.char}」，初版样张入档`);
    return rec;
  }

  /** 保存当前生成结果为新版本 */
  saveVersion(rec: GlyphRecord, params: GenParams, strokes: StrokeState[], note: string): GlyphVersion {
    const comp = composeGlyph(strokes, params);
    const nextId = rec.versions.reduce((m, v) => Math.max(m, v.id), 0) + 1;
    const gen = generateGlyph({
      char: rec.char,
      skeleton: getSkeleton(rec.char)!,
      params,
      previous: strokes,
    });
    const version: GlyphVersion = {
      id: nextId,
      label: `v${nextId}`,
      createdAt: nowIso(),
      params: { ...params },
      strokes: strokes.map(cloneStroke),
      metrics: comp.metrics,
      svgPath: comp.path,
      polys: serializeMultiPoly(comp.polys),
      fingerprint: gen.fingerprint,
      note,
      author: '设计员 · 沈砚',
      lockedCount: strokes.filter((s) => s.manual).length,
    };
    const next: GlyphRecord = {
      ...rec,
      params: { ...params },
      versions: [...rec.versions, version],
      currentVersionId: nextId,
      updatedAt: version.createdAt,
      status: rec.status === '已归档' ? '已归档' : rec.status === '草稿' ? '修订中' : rec.status,
    };
    this.replace(next);
    this.save();
    this.toast('ok', `${rec.id} 已保存为 ${version.label}（共 ${next.versions.length} 版）`);
    return version;
  }

  replace(rec: GlyphRecord) {
    this.records = this.records.map((r) => (r.id === rec.id ? rec : r));
  }

  updateParams(rec: GlyphRecord, params: GenParams) {
    this.replace({ ...rec, params: { ...params }, seed: params.seed, updatedAt: nowIso() });
    this.save();
  }

  addComment(rec: GlyphRecord, input: { x: number; y: number; tag: string; body: string; author: string }): ReviewComment {
    const c: ReviewComment = {
      id: `c-${rec.id}-${rec.comments.length + 1}-${Math.floor(Math.random() * 999)}`,
      x: input.x,
      y: input.y,
      tag: input.tag,
      body: input.body,
      author: input.author,
      createdAt: nowIso(),
      status: '待处理',
      replies: [],
    };
    this.replace({ ...rec, comments: [...rec.comments, c], updatedAt: nowIso() });
    this.save();
    this.toast('ok', `已记录审稿意见（${input.tag}）并定位到字面`);
    return c;
  }

  replyComment(rec: GlyphRecord, commentId: string, body: string, author = '设计员 · 沈砚') {
    const comments = rec.comments.map((c) =>
      c.id === commentId ? { ...c, replies: [...c.replies, { author, body, createdAt: nowIso() }] } : c,
    );
    this.replace({ ...rec, comments, updatedAt: nowIso() });
    this.save();
    this.toast('ok', '回复已记录');
  }

  resolveComment(rec: GlyphRecord, commentId: string) {
    const target = rec.comments.find((c) => c.id === commentId);
    if (!target) return;
    if (!target.replies.length) {
      this.toast('warn', '请先回复该条意见，再标记为已处理');
      return;
    }
    const comments = rec.comments.map((c) =>
      c.id === commentId ? { ...c, status: '已处理' as const, resolvedAt: nowIso() } : c,
    );
    this.replace({ ...rec, comments, updatedAt: nowIso() });
    this.save();
    this.toast('ok', '意见已处理完毕');
  }

  reopenComment(rec: GlyphRecord, commentId: string) {
    const comments = rec.comments.map((c) =>
      c.id === commentId ? { ...c, status: '待处理' as const, resolvedAt: undefined } : c,
    );
    this.replace({ ...rec, comments, updatedAt: nowIso() });
    this.save();
  }

  setStatus(rec: GlyphRecord, status: GlyphStatus) {
    this.replace({ ...rec, status, updatedAt: nowIso() });
    this.save();
  }

  archive(rec: GlyphRecord): string | null {
    const open = rec.comments.filter((c) => c.status === '待处理');
    if (open.length) {
      this.toast('warn', `仍有 ${open.length} 条审稿意见待处理，无法归档`);
      return null;
    }
    const v = this.currentVersion(rec);
    if (!v) return null;
    const archivedAt = nowIso();
    const serial = `${rec.id}-AR`;
    const html = buildReport(rec, v, archivedAt, serial);
    const next: GlyphRecord = {
      ...rec,
      status: '已归档',
      archivedAt,
      updatedAt: archivedAt,
      report: { generatedAt: archivedAt, serial, html },
    };
    this.replace(next);
    this.save();
    this.toast('ok', `已验收归档，字样报告 ${serial} 已生成`);
    this.reportHtml = html;
    this.reportTitle = `${next.id} · 字样报告`;
    return html;
  }

  openReport(rec: GlyphRecord) {
    if (!rec.report) {
      this.toast('warn', '该档案尚未生成字样报告，请先完成验收归档');
      return;
    }
    this.reportHtml = rec.report.html;
    this.reportTitle = `${rec.id} · 字样报告`;
  }

  closeReport() {
    this.reportHtml = null;
  }

  setScreen(s: Screen) {
    this.screen = s;
    if (s === 'generate' && !this.editorId) this.editorId = this.selectedId ?? this.records[0]?.id ?? null;
    if (s === 'compare') {
      const rec = this.selected ?? this.records[0];
      if (rec) {
        if (this.compareB == null || !rec.versions.some((v) => v.id === this.compareB)) this.compareB = rec.currentVersionId;
        if (this.compareA == null || !rec.versions.some((v) => v.id === this.compareA))
          this.compareA = rec.versions.length > 1 ? rec.versions[rec.versions.length - 2].id : rec.versions[0].id;
      }
    }
    this.saveUi();
  }

  select(id: string | null) {
    this.selectedId = id;
    this.saveUi();
  }

  versionsOf(rec: GlyphRecord | undefined) {
    return rec?.versions ?? [];
  }

  setCompare(which: 'a' | 'b', versionId: number) {
    if (which === 'a') this.compareA = versionId;
    else this.compareB = versionId;
    this.saveUi();
  }
}

function cloneStroke(s: StrokeState): StrokeState {
  return {
    ...s,
    nodes: s.nodes.map((p) => ({ ...p })),
    baseNodes: s.baseNodes.map((p) => ({ ...p })),
    poly: s.poly?.map((p) => ({ ...p })),
  };
}

function serializeMultiPoly(polys: Ring[][]): Pt[][][] {
  return polys.map((poly) =>
    poly.map((ring) =>
      ring.map((p) => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 })),
    ),
  );
}

export function strokePolygon(stroke: StrokeState, params: GenParams): Ring {
  if (stroke.manual && stroke.poly && stroke.poly.length >= 3) return stroke.poly;
  const r = renderStroke(stroke, params);
  return r.length >= 3 ? r : [];
}

/** 可打印字样报告 */
export function buildReport(rec: GlyphRecord, v: GlyphVersion, archivedAt: string, serial: string): string {
  const d = new Date(archivedAt);
  const dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  const done = rec.comments.filter((c) => c.status === '已处理').length;
  const open = rec.comments.filter((c) => c.status === '待处理').length;
  const versionsRows = rec.versions
    .map(
      (ver) =>
        `<tr><td>${ver.label}</td><td>${fmtDate(ver.createdAt)}</td><td>${ver.params.weight}</td><td>${Math.round(
          ver.params.contrast * 100,
        )}%</td><td>${ver.params.slant}°</td><td>${ver.params.corner}</td><td>${TERMINAL_LABEL[ver.params.terminal]}</td><td>${
          ver.lockedCount
        }</td><td>${ver.note}</td></tr>`,
    )
    .join('');
  const commentRows = rec.comments
    .map(
      (c, i) =>
        `<tr><td>${i + 1}</td><td>${c.tag}</td><td>(${Math.round(c.x)}, ${Math.round(
          c.y,
        )})</td><td>${escapeHtml(c.body)}</td><td>${c.replies.length ? c.replies.map((r) => escapeHtml(r.body)).join(' / ') : '—'}</td><td>${
          c.status
        }</td></tr>`,
    )
    .join('');
  const m = v.metrics;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${serial} 字样报告</title>
<style>
@page { size: A4; margin: 18mm; }
body { font-family: "Songti SC","SimSun",serif; color:#17150f; margin:0; background:#fbf8f1; }
.page { width: 174mm; margin: 0 auto; padding: 10mm 0; }
h1 { font-size: 26px; letter-spacing: .28em; margin: 0; font-weight: 600; }
.sub { font-family: Consolas,monospace; font-size: 12px; letter-spacing:.14em; color:#7a6a52; margin-top:6px; }
.rule { height:2px; background:#17150f; margin:14px 0 18px; }
.grid { display:grid; grid-template-columns: 62mm 1fr; gap:18px; align-items:start; }
.glyph { background:#f3eee2; border:1px solid #d8cfbb; height:62mm; display:flex; align-items:center; justify-content:center; }
.glyph svg { width:100%; height:100%; }
.glyph { padding: 2mm; }
.spec { display:grid; grid-template-columns: 26mm 1fr; row-gap:5px; font-size:13px; }
.spec b { font-weight:600; letter-spacing:.08em; }
.metrics { display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin:16px 0; }
.mcard { border:1px solid #d8cfbb; padding:8px 10px; background:#fffdf8; }
.mcard span { display:block; font-family:Consolas,monospace; font-size:11px; color:#7a6a52; letter-spacing:.08em; }
.mcard strong { font-family:Consolas,monospace; font-size:17px; }
table { width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; }
th,td { border-bottom:1px solid #ddd4c2; padding:6px 8px; text-align:left; white-space:nowrap; }
td:nth-child(4),td:nth-child(5) { white-space:normal; }
th { font-weight:600; background:#efe8d9; letter-spacing:.08em; }
h2 { font-size:15px; letter-spacing:.2em; margin:22px 0 8px; }
.sign { margin-top:26px; display:flex; justify-content:space-between; font-size:12px; color:#5c513e; }
.stamp { border:2px solid #a8261d; color:#a8261d; padding:6px 14px; border-radius:3px; letter-spacing:.3em; font-size:13px; transform:rotate(-3deg); }
.note { font-size:11px; color:#7a6a52; margin-top:14px; line-height:1.7; }
</style></head><body><div class="page">
<div style="display:flex;justify-content:space-between;align-items:flex-end">
  <div><h1>点画字坊</h1><div class="sub">GLYPH SPECIMEN REPORT · 字样报告</div></div>
  <div class="sub" style="text-align:right">${serial}<br>${dateStr}</div>
</div>
<div class="rule"></div>
<div class="grid">
  <div><div class="glyph">${inlineGlyphSvg(v.svgPath)}</div>
  <div style="text-align:center;margin-top:8px;font-size:22px">${rec.char}</div>
  <div style="text-align:center;font-family:Consolas,monospace;font-size:12px;color:#7a6a52">${rec.pinyin}</div>
  <div style="text-align:center;margin-top:8px"><span style="border:2px solid #a8261d;color:#a8261d;padding:3px 10px;border-radius:3px;letter-spacing:.3em;font-size:12px">验收通过</span></div>
  <div style="text-align:center;font-family:Consolas,monospace;font-size:9px;color:#8a7a5f;margin-top:6px">${serial}</div>
  </div>
  <div>
    <div class="spec">
      <b>档案编号</b><span style="font-family:Consolas,monospace">${rec.id}</span>
      <b>字库</b><span>${rec.library}</span>
      <b>字重</b><span>${rec.weightName}（${rec.weight}）</span>
      <b>字面框</b><span>${rec.faceBox.width} × ${rec.faceBox.height} em · 基线 ${rec.faceBox.baseline} · 下伸 ${rec.faceBox.descender}</span>
      <b>骨架来源</b><span>${rec.skeletonSource.kind} — ${rec.skeletonSource.ref}</span>
      <b>验收版本</b><span>${v.label} · ${fmtDate(v.createdAt)} · 指纹 ${v.fingerprint}</span>
      <b>生成参数</b><span>字重 ${v.params.weight} · 对比 ${Math.round(v.params.contrast * 100)}% · 倾斜 ${v.params.slant}° · 圆角 ${v.params.corner} · 收笔 ${TERMINAL_LABEL[v.params.terminal]} · 种子 ${v.params.seed}</span>
      <b>手改笔画</b><span>${v.strokes.filter((s) => s.manual).map((s) => s.id).join('、') || '无'}（共 ${v.strokes.filter((s) => s.manual).length} 笔锁定）</span>
    </div>
    <div class="metrics">
      <div class="mcard"><span>INK WIDTH</span><strong>${m.inkWidth.toFixed(1)}</strong></div>
      <div class="mcard"><span>INK HEIGHT</span><strong>${m.inkHeight.toFixed(1)}</strong></div>
      <div class="mcard"><span>重心 X / Y</span><strong>${m.cogX.toFixed(0)} / ${m.cogY.toFixed(0)}</strong></div>
      <div class="mcard"><span>着墨率</span><strong>${Math.round(m.inkRatio * 100)}%</strong></div>
    </div>
  </div>
</div>
<h2>版本沿革</h2>
<table><thead><tr><th>版本</th><th>日期</th><th>字重</th><th>对比</th><th>倾斜</th><th>圆角</th><th>收笔</th><th>锁定</th><th>说明</th></tr></thead><tbody>${versionsRows}</tbody></table>
<h2>审稿意见处理（已处理 ${done} · 待处理 ${open}）</h2>
<table><thead><tr><th>#</th><th>类别</th><th>定位</th><th>意见</th><th>设计员回复</th><th>状态</th></tr></thead><tbody>${
    commentRows || '<tr><td colspan="6">本档案无审稿意见记录</td></tr>'
  }</tbody></table>
<div class="sign"><span>设计员　沈砚　____</span><span>审稿人　林岫　____</span><span class="stamp">验收通过</span></div>
<div class="note">本报告由「点画字坊」字形档案与生成平台生成。字形几何由确定性种子引擎产生：同一种子与同一组参数必得完全一致的字形；手工微调笔画以锁定快照入档，重新生成时保持不动。</div>
</div></body></html>`;
}

function inlineGlyphSvg(path: string): string {
  return `<svg viewBox="-120 -1030 1240 1240" xmlns="http://www.w3.org/2000/svg" style="overflow:hidden"><g transform="scale(1,-1)"><path d="${path}" fill="#17150f" fill-rule="evenodd"/></g></svg>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
}

export const studio = new Studio();
export { LIBRARIES, weightNameFor, widthForWeight, DEFAULT_PARAMS, getSkeleton };
export type { GenParams, GlyphRecord, GlyphSkeleton, GlyphVersion, ReviewComment, StrokeState };
