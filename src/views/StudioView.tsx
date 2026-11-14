import { Show, createEffect, createSignal, on, onCleanup, untrack } from 'solid-js';
import { CutoutEngine, GpuError } from '../gpu/engine';
import type { CompositeMode } from '../gpu/engine';
import type { BackgroundRecord, CompositeParams, CutParams, Item, ReviewMetrics, Stroke } from '../lib/types';
import { balanceGains, type ChannelStats } from '../lib/color';
import {
  addBackgroundFromFile,
  addStroke,
  bgById,
  clearStrokes,
  currentPerson,
  patchComp,
  patchCut,
  projectById,
  setActiveItem,
  state,
  submitForReview,
  toast,
  updateDoc,
} from '../lib/store';
import { bitmapFromBlob, downloadBlob, safeFilename } from '../lib/image';
import { buildProof } from '../lib/proof';
import { BrushPanel, BackgroundPanel, CompositePanel, CutPanel, StageCanvas, type BrushState } from '../components/StudioParts';
import { IconArrowLeft, IconCompare, IconDownload, IconEye, IconLayers, IconPackage, IconSend, IconUndo } from '../components/icons';

type Mode = 'matte' | 'scene' | 'mask';

export function StudioView(p: { item: Item; onBack: () => void }) {
  const project = () => projectById(p.item.projectId);
  const locked = () => p.item.status === 'review' || p.item.status === 'approved';

  const [mode, setMode] = createSignal<Mode>('scene');
  const [holding, setHolding] = createSignal(false);
  const [engineError, setEngineError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [backdrop, setBackdrop] = createSignal<null | { mean: [number, number, number]; spread: [number, number, number]; coverage: number; stats: ChannelStats }>(null);
  const [subjectCct, setSubjectCct] = createSignal<number | null>(null);
  const [bgCct, setBgCct] = createSignal<number | null>(null);
  const [busy, setBusy] = createSignal<string | null>(null);
  const [brush, setBrush] = createSignal<BrushState>({ mode: 'add', radius: 44, hardness: 0.62, strength: 0.85 });

  let engine: CutoutEngine | null = null;
  let canvasEl: HTMLCanvasElement | null = null;
  let bgBitmap: ImageBitmap | null = null;
  let raf = 0;
  let needsRender = true;

  const ensureBgBitmap = async (id: string | null) => {
    bgBitmap?.close();
    bgBitmap = null;
    if (!id) {
      engine?.setBackground(null);
      needsRender = true;
      setBgCct(null);
      return;
    }
    const rec = bgById(id);
    if (!rec) return;
    bgBitmap = await bitmapFromBlob(rec.blob);
    engine?.setBackground(bgBitmap);
    const cct = await CutoutEngine.backgroundCct(bgBitmap);
    setBgCct(cct);
    needsRender = true;
  };

  const start = async (canvas: HTMLCanvasElement) => {
    canvasEl = canvas;
    setLoading(true);
    setEngineError(null);
    try {
      const rec = state.images[p.item.sourceImageId];
      if (!rec) throw new Error('找不到源图');
      const bitmap = await bitmapFromBlob(rec.blob);
      const eng = await CutoutEngine.create(bitmap);
      if (engine) {
        engine.destroy();
      }
      engine = eng;
      setBackdrop(eng.backdrop);
      // Subject CCT comes from the matte-covered pixels, not the whole frame.
      const m0 = await eng.measure();
      eng.setSubjectStats(m0.subjectStats);
      setSubjectCct(m0.subjectStats.cct);
      eng.onBackdropRefined = (est) => {
        setBackdrop({ ...est });
        engine?.invalidate();
        needsRender = true;
      };
      eng.sync(p.item.doc.cut, p.item.doc.strokes);
      await ensureBgBitmap(p.item.doc.bg?.backgroundId ?? null);
      scheduleRender();
      if (!eng.backdropReady) setLoading(true);
    } catch (err) {
      const msg = err instanceof GpuError ? err.message : String(err);
      setEngineError(msg);
      toast('error', '无法启动 GPU 预览', msg);
    } finally {
      setLoading(false);
      needsRender = true;
    }
  };

  const renderFrame = () => {
    raf = 0;
    if (!engine || !canvasEl) return;
    try {
      const cssW = canvasEl.clientWidth || p.item.width;
      const cssH = canvasEl.clientHeight || p.item.height;
      // Preview at the on-screen size (capped at source resolution) keeps a
      // slider drag at 60fps on a 4K source.
      const maxW = Math.min(p.item.width, 1600);
      const scale = Math.min(1, maxW / p.item.width, cssW / p.item.width);
      const w = Math.max(64, Math.round(p.item.width * scale));
      const h = Math.max(64, Math.round(p.item.height * scale));
      engine.renderComposite(canvasEl, w, h, compOptions(w, h, holding() ? 'original' : displayMode()));
      setLoading(false);
    } catch (err) {
      setEngineError(String(err));
    }
  };

  const scheduleRender = () => {
    needsRender = true;
    if (!raf && typeof requestAnimationFrame !== 'undefined') {
      raf = requestAnimationFrame(renderFrame);
    }
  };

  const displayMode = (): CompositeMode => {
    if (mode() === 'matte') return 'matte';
    if (mode() === 'mask') return 'mask';
    return 'scene';
  };

  const compOptions = (w: number, h: number, m: CompositeMode) => {
    const comp = p.item.doc.comp;
    const gains: [number, number, number] =
      subjectCct() && bgCct()
        ? balanceGains(subjectCct()!, bgCct()!, comp.tempStrength)
        : [1, 1, 1];
    return {
      gains,
      bgScale: comp.bgScale,
      bgOffsetX: comp.bgOffsetX,
      bgOffsetY: comp.bgOffsetY,
      shadowAngle: comp.shadowAngle,
      shadowSoftness: comp.shadowSoftness,
      shadowOpacity: comp.shadowOpacity,
      opacity: 1,
      contrast: 0.16,
      hasBackground: !!p.item.doc.bg,
      mode: m,
    };
  };

  // Re-sync the GPU whenever the document changes.
  createEffect(
    on(
      () => [p.item.doc.cut, p.item.doc.strokes.length, p.item.doc.bg?.backgroundId] as const,
      ([cut, , bgId], prev) => {
        if (!engine) return;
        engine.sync(untrack(() => p.item.doc.cut), untrack(() => p.item.doc.strokes));
        if (prev && prev[2] !== bgId) void ensureBgBitmap(bgId ?? null);
        scheduleRender();
      },
    ),
  );

  createEffect(() => {
    const c = p.item.doc.comp;
    void c;
    if (engine) scheduleRender();
  });

  createEffect(() => {
    const m = mode();
    void m;
    if (engine) scheduleRender();
  });

  // Resize observer: the canvas is CSS-sized, so re-render on layout change.
  let ro: ResizeObserver | null = null;
  const attachResize = (el: HTMLCanvasElement) => {
    ro?.disconnect();
    ro = new ResizeObserver(() => scheduleRender());
    ro.observe(el);
  };

  const onEngineReady = (canvas: HTMLCanvasElement) => {
    attachResize(canvas);
    void start(canvas);
  };

  onCleanup(() => {
    if (raf) cancelAnimationFrame(raf);
    ro?.disconnect();
    engine?.destroy();
    bgBitmap?.close();
  });

  const beginStroke = () => {
    if (locked()) {
      notifyLocked();
      return;
    }
    if (!engine) return;
    engine.beginLiveStroke();
  };

  const previewStroke = (stroke: Stroke) => {
    if (locked() || !engine) return;
    engine.previewStroke(stroke);
    engine.refreshShaped(p.item.doc.cut);
    scheduleRender();
  };

  /** One pointer drag becomes exactly one committed stroke. */
  const commitStroke = (stroke: Stroke) => {
    if (!engine) return;
    engine.endLiveStroke();
    if (locked()) {
      scheduleRender();
      return;
    }
    void addStroke(p.item.id, stroke);
    engine.sync(p.item.doc.cut, [...p.item.doc.strokes, stroke]);
    scheduleRender();
  };

  const onPickBg = async (bg: BackgroundRecord) => {
    if (locked()) return;
    await updateDoc(p.item.id, { bg: { kind: 'library', backgroundId: bg.id, name: bg.name, thumb: bg.thumb } });
    await ensureBgBitmap(bg.id);
    scheduleRender();
  };

  const onUploadBg = async (file: File) => {
    try {
      const rec = await addBackgroundFromFile(file, file.name.replace(/\.[^.]+$/, ''));
      await updateDoc(p.item.id, { bg: { kind: 'upload', backgroundId: rec.id, name: rec.name, thumb: rec.thumb } });
      await ensureBgBitmap(rec.id);
      scheduleRender();
      toast('ok', '背景已上传', rec.name);
    } catch (err) {
      toast('error', '背景上传失败', String(err));
    }
  };

  const notifyLocked = () => {
    toast(
      'warn',
      p.item.status === 'review' ? '审核中的条目已锁定' : '已通过的条目不可修改',
      p.item.status === 'review'
        ? '主管退回后会回到「返工中」，届时可继续编辑。'
        : '如需调整请让客户新建条目，或由主管退回。',
    );
  };

  const doCut = (patch: Partial<CutParams>) => {
    if (locked()) return;
    void patchCut(p.item.id, patch);
    scheduleRender();
  };

  const doComp = (patch: Partial<CompositeParams>) => {
    if (locked()) return;
    void patchComp(p.item.id, patch);
    scheduleRender();
  };

  const resetCut = () => {
    void patchCut(p.item.id, { bgTolerance: 0.92, edgeSnap: 0.72, feather: 1.4, hardness: 0.66 });
    if (engine) engine.invalidate();
    scheduleRender();
  };

  const undoStroke = () => {
    const doc = p.item.doc;
    if (doc.strokes.length === 0) return;
    void updateDoc(p.item.id, { strokes: doc.strokes.slice(0, -1) });
    engine?.invalidate();
    if (engine) {
      engine.sync(p.item.doc.cut, doc.strokes.slice(0, -1));
    }
    scheduleRender();
  };

  const clearAllStrokes = () => {
    void clearStrokes(p.item.id);
    engine?.invalidate();
    if (engine) engine.sync(p.item.doc.cut, []);
    scheduleRender();
  };

  /** Snapshot + metrics for the reviewer; identical to what the seeder makes. */
  const captureProof = async () => {
    if (!engine || !canvasEl) return { dataUrl: p.item.thumb, metrics: null as ReviewMetrics | null };
    const { dataUrl, metrics } = await buildProof(
      engine,
      p.item.doc.comp,
      bgCct(),
      canvasEl,
      p.item.width,
      p.item.height,
      1280,
    );
    setSubjectCct(metrics.subjectCct);
    scheduleRender();
    return { dataUrl, metrics };
  };

  const submit = async () => {
    if (!engine) return;
    setBusy('正在生成审核用合成图…');
    try {
      const { dataUrl, metrics } = await captureProof();
      await submitForReview(p.item.id, metrics, dataUrl);
      toast('ok', '已提交审核', '主管将在审核台看到当前预览与质检数据。');
    } catch (err) {
      toast('error', '提交失败', String(err));
    } finally {
      setBusy(null);
    }
  };

  const exportPng = async () => {
    if (!engine) return;
    setBusy('正在导出透明底 PNG…');
    try {
      const sCct = subjectCct();
      const bCct = bgCct();
      const gains: [number, number, number] = sCct && bCct ? balanceGains(sCct, bCct, 0.35) : [1, 1, 1];
      const blob = await engine.exportAlpha(gains, true);
      downloadBlob(blob, `${safeFilename(p.item.title)}_透明底.png`);
      toast('ok', '透明底已导出');
    } catch (err) {
      toast('error', '导出失败', String(err));
    } finally {
      setBusy(null);
    }
  };

  const exportComposite = async () => {
    if (!engine) return;
    setBusy('正在导出合成图…');
    try {
      const blob = await engine.exportComposite(compOptions(p.item.width, p.item.height, 'scene'));
      downloadBlob(blob, `${safeFilename(p.item.title)}_合成.jpg`);
      toast('ok', '合成图已导出');
    } catch (err) {
      toast('error', '导出失败', String(err));
    } finally {
      setBusy(null);
    }
  };

  // Hold-to-compare
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat && !locked()) {
      e.preventDefault();
      setHolding(true);
      scheduleRender();
    }
    if (e.code === 'BracketLeft') setBrush((b) => ({ ...b, radius: Math.max(4, b.radius - 8) }));
    if (e.code === 'BracketRight') setBrush((b) => ({ ...b, radius: Math.min(220, b.radius + 8) }));
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      setHolding(false);
      scheduleRender();
    }
  };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  onCleanup(() => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  });

  return (
    <div class="studio" style={{ 'grid-template-columns': '238px 1fr 286px' }}>
      <div class="studio-bar">
        <button class="btn ghost sm back-btn" onClick={p.onBack}>
          <IconArrowLeft size={14} /> 返回看板
        </button>
        <div class="studio-title">
          <b>{p.item.title}</b>
          <span>
            {project()?.code} · {p.item.sourceName} · {p.item.width}×{p.item.height}
          </span>
        </div>
        <div class="spacer" />
        <Show when={locked()}>
          <div class="locked-banner" style={{ padding: '4px 9px' }}>
            {p.item.status === 'review' ? '审核中，已锁定编辑' : '已通过，不可修改'}
          </div>
        </Show>
        <Show when={!locked() && p.item.status === 'rework'}>
          <div class="chip red dot">返工 {p.item.reworkCount} 次 · 按意见返修后重新提交</div>
        </Show>
        <div class="seg" style={{ width: '235px' }}>
          <button class={mode() === 'matte' ? 'on' : ''} onClick={() => setMode('matte')}>
            <IconEye size={12} /> 蒙版
          </button>
          <button class={mode() === 'mask' ? 'on' : ''} onClick={() => setMode('mask')}>
            <IconLayers size={12} /> 选区
          </button>
          <button class={mode() === 'scene' ? 'on' : ''} onClick={() => setMode('scene')}>
            <IconPackage size={12} /> 合成
          </button>
        </div>
        <button class="btn sm" onClick={exportPng} disabled={!!busy()}>
          <IconDownload size={13} /> 透明底
        </button>
        <button class="btn sm" onClick={exportComposite} disabled={!!busy()}>
          <IconDownload size={13} /> 合成图
        </button>
        <Show when={!locked()}>
          <button class="btn primary sm" onClick={submit} disabled={!!busy() || !p.item.doc.bg}>
            <IconSend size={13} /> 提交审核
          </button>
        </Show>
      </div>

      {/* left rail */}
      <div class="sidebar">
        <CutPanel
          cut={p.item.doc.cut}
          locked={locked()}
          backdrop={backdrop()}
          onChange={doCut}
          onReset={resetCut}
        />
        <BrushPanel
          brush={brush()}
          locked={locked()}
          strokeCount={p.item.doc.strokes.length}
          onChange={(patch: Partial<BrushState>) => setBrush((b) => ({ ...b, ...patch }))}
          onUndo={undoStroke}
          onClear={clearAllStrokes}
        />
      </div>

      {/* canvas */}
      <div class="canvas-wrap">
        <div class="canvas-toolbar">
          <span class="chip slate">{mode() === 'matte' ? '蒙版视图' : mode() === 'mask' ? '选区覆盖' : '合成预览'}</span>
          <Show when={loading() && !engineError()}>
            <span style={{ display: 'flex', 'align-items': 'center', gap: '6px', color: 'var(--text-3)', 'font-size': '11.5px' }}>
              <span class="spin" /> 计算着色器正在估计背景并收敛边缘…
            </span>
          </Show>
          <div class="spacer" style={{ flex: 1 }} />
          <Show when={!locked()}>
            <span class="muted" style={{ 'font-size': '11px' }}>
              <span class="kbd">空格</span> 按住对比原图 · <span class="kbd">[</span><span class="kbd">]</span> 调笔刷
            </span>
            <button
              class="btn sm"
              onPointerDown={() => {
                setHolding(true);
                scheduleRender();
              }}
              onPointerUp={() => {
                setHolding(false);
                scheduleRender();
              }}
              onPointerLeave={() => {
                setHolding(false);
                scheduleRender();
              }}
            >
              <IconCompare size={13} /> 按住对比
            </button>
          </Show>
        </div>

        <Show
          when={!engineError()}
          fallback={
            <div class="canvas-stage">
              <div class="error-panel">
                <span class="chip red dot" style={{ 'font-size': '11px' }}>
                  WebGPU 不可用
                </span>
                <h3>计算着色器未能启动</h3>
                <p>{engineError()}</p>
              </div>
            </div>
          }
        >
          <div class="canvas-stage">
            <StageCanvas
              item={p.item}
              viewMode={mode()}
              brush={brush()}
              locked={locked()}
              onStrokeStart={beginStroke}
              onStrokePreview={previewStroke}
              onStrokeEnd={() => scheduleRender()}
              onStrokeCommit={commitStroke}
              onEngineReady={onEngineReady}
            />
            <Show when={holding()}>
              <div class="compare-badge orig">原图对比中</div>
            </Show>
            <Show when={busy()}>
              <div class="compare-badge" style={{ left: 'auto', right: '10px', display: 'flex', gap: '6px', 'align-items': 'center' }}>
                <span class="spin" style={{ width: '11px', height: '11px', 'border-width': '1.5px' }} />
                {busy()}
              </div>
            </Show>
          </div>
        </Show>
      </div>

      {/* right rail */}
      <div class="sidebar right">
        <BackgroundPanel
          backgrounds={state.backgrounds}
          chosenId={p.item.doc.bg?.backgroundId ?? null}
          locked={locked()}
          onPick={onPickBg}
          onUpload={onUploadBg}
          onLockedAttempt={notifyLocked}
        />
        <CompositePanel
          comp={p.item.doc.comp}
          locked={locked()}
          subjectCct={subjectCct()}
          bgCct={bgCct()}
          hasBackground={!!p.item.doc.bg}
          onChange={doComp}
        />
        <Show when={locked()}>
          <div class="section">
            <div class="section-title">
              审核记录
              <span class="rule" />
            </div>
            <div class="muted" style={{ 'font-size': '11.5px', 'line-height': '1.6' }}>
              此条目已锁定。请在审核台查看主管意见。
            </div>
            <button class="btn sm wide" onClick={() => (window.location.hash = '#review')}>
              前往审核台
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}

