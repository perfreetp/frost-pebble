import { createEffect, createMemo, createSignal, For, onCleanup, Show } from 'solid-js';
import { BenchCanvas } from '../components/BenchCanvas';
import { Card, Empty, Field } from '../components/ui';
import { Icon } from '../components/Icon';
import { BenchScene } from '../phaser/bench';
import { autoCutout } from '../lib/cutout';
import { compositeMask } from '../lib/mask-engine';
import { composeFromSources, type ComposeResult } from '../lib/compose';
import { addVersion, pushToast, setSettings, state, versionsOf } from '../lib/store';
import { BG_PRESETS, OPERATOR, presetInfo, type BgPresetId, type Version } from '../lib/types';
import { fmtDateTime } from '../lib/utils';

function canvasFrom(dataUrl: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d')!.drawImage(img, 0, 0);
      resolve(c);
    };
    img.onerror = () => reject(new Error('照片加载失败'));
    img.src = dataUrl;
  });
}

export default function WorkstationPage(props: { onGo: (p: 'versions' | 'photos') => void }) {
  const batch = () => state.batches.find((b) => b.id === state.activeBatchId) ?? null;
  const photo = () => state.photos.find((p) => p.id === state.activePhotoId) ?? null;

  const [scene, setScene] = createSignal<BenchScene | null>(null);
  const [strokeCount, setStrokeCount] = createSignal(0);
  const [tool, setTool] = createSignal<'restore' | 'erase'>('restore');
  const [brushSize, setBrushSize] = createSignal(0.05);
  const [maskOn, setMaskOn] = createSignal(false);
  const [tolerance, setTolerance] = createSignal(state.settings.tolerance);
  const [feather, setFeather] = createSignal(state.settings.feather);
  const [shadow, setShadow] = createSignal(state.settings.shadow);
  const [preset, setPreset] = createSignal<BgPresetId>(state.settings.background);
  const [heightCm, setHeightCm] = createSignal(0);
  const [diameterMm, setDiameterMm] = createSignal(0);
  const [note, setNote] = createSignal('');
  const [autoVersion, setAutoVersion] = createSignal(true);
  const [preview, setPreview] = createSignal<ComposeResult | null>(null);
  const [busy, setBusy] = createSignal(false);
  const [dirty, setDirty] = createSignal(false);
  const [compareOn, setCompareOn] = createSignal(false);
  const [maskGuide, setMaskGuide] = createSignal<HTMLCanvasElement | null>(null);
  const [compareLabel, setCompareLabel] = createSignal('');
  const [compareAlpha, setCompareAlpha] = createSignal(0.9);
  const [photoCanvas, setPhotoCanvas] = createSignal<HTMLCanvasElement | null>(null);
  const [baseMask, setBaseMask] = createSignal<HTMLCanvasElement | null>(null);
  const [hint, setHint] = createSignal('自动初抠完成。用画笔补回被切掉的枝叶，用橡皮擦掉背景杂物。');
  const [cutting, setCutting] = createSignal(false);

  let photoCacheKey = '';
  let lastSavedSig = '';
  let composeTimer: number | undefined;
  let autosaveTimer: number | undefined;
  let suppress = false;

  const photoVersions = createMemo(() => (photo() ? versionsOf(photo()!.id) : []));
  const prevVersion = createMemo(() => {
    const list = photoVersions();
    return list.length ? list[list.length - 1] : null;
  });

  function currentSettings() {
    return {
      background: preset(),
      shadow: shadow(),
      feather: feather(),
      measuredHeightCm: heightCm(),
      measuredDiameterMm: diameterMm(),
      showRuler: true,
      tolerance: tolerance(),
    };
  }

  function signature(): string {
    return JSON.stringify({
      preset: preset(),
      shadow: Number(shadow().toFixed(2)),
      feather: Number(feather().toFixed(2)),
      tol: tolerance(),
      h: heightCm(),
      d: diameterMm(),
      strokes: scene()?.getStrokes() ?? [],
    });
  }

  /** 同步合成当前参数下的规格图与查验图 */
  function composeNow(): ComposeResult | null {
    const pcv = photoCanvas();
    const mask = scene()?.getWorkMask();
    const b = batch();
    const p = photo();
    if (!pcv || !mask || !b || !p) return null;
    const settings = currentSettings();
    return composeFromSources(
      { source: pcv, width: pcv.width, height: pcv.height },
      mask,
      settings,
      {
        batch: b,
        versionNo: (prevVersion()?.no ?? 0) + 1,
        photoName: p.name,
        sampleNote: p.sampleNote,
        savedAt: new Date().toISOString(),
        savedBy: OPERATOR.technician,
        heightCm: heightCm(),
        diameterMm: diameterMm(),
        feather: feather(),
        shadow: shadow(),
      },
    );
  }

  function refreshPreview(commit: boolean): ComposeResult | null {
    const result = composeNow();
    if (!result) return null;
    setPreview(result);
    setDirty(true);
    if (commit) {
      saveVersionWith(result);
    }
    return result;
  }

  function schedulePreview(autosave = false) {
    if (suppress) return;
    window.clearTimeout(composeTimer);
    composeTimer = window.setTimeout(() => {
      refreshPreview(false);
      if (autosave && autoVersion()) {
        window.clearTimeout(autosaveTimer);
        autosaveTimer = window.setTimeout(() => {
          if (signature() === lastSavedSig) return;
          const result = composeNow();
          if (result) {
            setPreview(result);
            saveVersionWith(result);
          }
        }, 4500);
      }
    }, 320);
  }

  function saveVersionWith(result: ComposeResult, overrideNote?: string) {
    const b = batch();
    const p = photo();
    if (!b || !p) return;
    if (!(heightCm() > 0) || !(diameterMm() > 0)) {
      pushToast('warn', '请先填写实测苗高与地径，规格图需要标注尺寸');
      return;
    }
    const settings = currentSettings();
    addVersion({
      batchId: b.id,
      photoId: p.id,
      specUrl: result.specUrl,
      inspectUrl: result.inspectUrl,
      thumbUrl: result.thumbUrl,
      settings,
      strokes: JSON.parse(JSON.stringify(scene()?.getStrokes() ?? [])),
      note: overrideNote ?? (note().trim() || describeChange()),
      savedBy: OPERATOR.technician,
    });
    setSettings(settings);
    setNote('');
    setDirty(false);
    lastSavedSig = signature();
    setCompareOn(false);
    setMaskGuide(null);
    scene()?.setCompareCanvas(null);
  }

  function describeChange(): string {
    const p = presetInfo(preset());
    const list = photoVersions();
    if (!list.length) return `${p.name}首版`;
    const prev = list[list.length - 1];
    const parts: string[] = [];
    if (prev.settings.background !== preset()) parts.push(`换背景为${p.name}`);
    if (Math.abs(prev.settings.shadow - shadow()) > 0.02) parts.push(`投影 ${Math.round(shadow() * 100)}%`);
    if (Math.abs(prev.settings.feather - feather()) > 0.02) parts.push(`羽化 ${feather().toFixed(1)}px`);
    const sc = scene()?.getStrokes() ?? [];
    if (sc.length !== prev.strokes.length) parts.push(`笔触 ${prev.strokes.length}→${sc.length} 条`);
    if (Math.abs(prev.settings.measuredHeightCm - heightCm()) > 0 || Math.abs(prev.settings.measuredDiameterMm - diameterMm()) > 0) {
      parts.push(`尺寸 ${heightCm()}cm/Ø${diameterMm()}mm`);
    }
    return parts.join('，') || '微调';
  }

  /* ---------- 换照片：载入 + 初抠 ---------- */
  createEffect(() => {
    const p = photo();
    const s = scene();
    if (!p || !s) return;
    const key = `${p.id}:${p.dataUrl.length}`;
    if (key === photoCacheKey) return;
    photoCacheKey = key;

    const b = batch();
    setBusy(true);
    setCutting(true);
    setPreview(null);
    setDirty(false);
    void (async () => {
      try {
        const canvas = await canvasFrom(p.dataUrl);
        const h = b ? Math.round((b.heightMin + b.heightMax) / 2) : 60;
        const d = b ? Math.round(((b.diameterMin + b.diameterMax) / 2) * 10) : 8;
        suppress = true;
        setHeightCm(h);
        setDiameterMm(d);
        setTolerance(state.settings.tolerance);
        setFeather(state.settings.feather);
        setShadow(state.settings.shadow);
        setPreset(state.settings.background);
        setPhotoCanvas(canvas);
        s.setPhoto(canvas);
        s.setFeather(state.settings.feather);
        s.setShadow(state.settings.shadow);
        s.setPreset(state.settings.background);
        s.setBrushSize(brushSize());
        suppress = false;

        const mask = autoCutout(canvas, { tolerance: state.settings.tolerance, softness: 16, minArea: 14, feather: 0 });
        setBaseMask(mask);
        s.setBaseMask(mask);
        // 从上一版继续：恢复该版保存的笔触，避免重复劳动
        const last = prevVersion();
        const restored = last?.strokes ? JSON.parse(JSON.stringify(last.strokes)) as typeof last.strokes : [];
        s.setStrokes(restored);
        setStrokeCount(restored.length);
        setCutting(false);
        setHint(
          restored.length
            ? `自动初抠完成，已载入上一版 ${restored.length} 条笔触。继续用画笔补枝或橡皮擦除，改动会自动存为新版本。`
            : '自动初抠完成。绿色画笔补回被切掉的枝叶，红色橡皮擦除背景杂物，空格键切换。',
        );
        const result = refreshPreview(false);
        if (result) {
          setDirty(false);
          lastSavedSig = signature();
          // 首张照片完成初抠后自动留存首版，保证质检/报告有图可用
          if (autoVersion() && !prevVersion()) {
            saveVersionWith(result, '自动初抠首版');
          }
        }
      } catch (e) {
        pushToast('err', (e as Error).message);
      } finally {
        setBusy(false);
        setCutting(false);
      }
    })();
  });

  onCleanup(() => {
    window.clearTimeout(composeTimer);
    window.clearTimeout(autosaveTimer);
  });

  /**
   * 与上一版叠合比对：以同一张照片为底，
   * 青色 = 上一版保留的枝叶轮廓（幽灵），
   * 红色 = 本版擦掉的部分，绿色 = 本版补回的部分。
   */
  function buildPrevOverlay(): HTMLCanvasElement | null {
    const pcv = photoCanvas();
    const base = baseMask();
    const last = prevVersion();
    if (!pcv || !base || !last) return null;
    const W = pcv.width;
    const H = pcv.height;
    const prevMask = compositeMask(base, last.strokes, 0);
    const curMask = scene()?.getWorkMask() ?? null;

    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d', { willReadFrequently: true })!;

    // 上一版轮廓：外扩后减去本体，得到一圈 2px 左右的描边
    const ring = document.createElement('canvas');
    ring.width = W;
    ring.height = H;
    const rctx = ring.getContext('2d')!;
    rctx.filter = 'blur(2.2px)';
    rctx.drawImage(prevMask, 0, 0, W, H);
    rctx.filter = 'none';
    rctx.globalCompositeOperation = 'source-in';
    rctx.fillStyle = 'rgba(84,214,255,1)';
    rctx.fillRect(0, 0, W, H);
    rctx.globalCompositeOperation = 'destination-out';
    rctx.drawImage(prevMask, 0, 0, W, H);
    rctx.globalCompositeOperation = 'source-over';
    // 再叠一层原始轮廓的浅色填充，方便看清上一版覆盖范围
    const fill = document.createElement('canvas');
    fill.width = W;
    fill.height = H;
    const fctx = fill.getContext('2d')!;
    fctx.drawImage(prevMask, 0, 0, W, H);
    fctx.globalCompositeOperation = 'source-in';
    fctx.fillStyle = 'rgba(70,190,240,0.28)';
    fctx.fillRect(0, 0, W, H);

    ctx.drawImage(fill, 0, 0);
    ctx.globalAlpha = 0.95;
    ctx.drawImage(ring, 0, 0);
    ctx.globalAlpha = 1;

    if (curMask) {
      const a = document.createElement('canvas');
      a.width = W;
      a.height = H;
      const actx = a.getContext('2d', { willReadFrequently: true })!;
      actx.drawImage(prevMask, 0, 0, W, H);
      const da = actx.getImageData(0, 0, W, H).data;
      actx.clearRect(0, 0, W, H);
      actx.drawImage(curMask, 0, 0, W, H);
      const dc = actx.getImageData(0, 0, W, H).data;

      const out = actx.createImageData(W, H);
      for (let i = 0; i < da.length; i += 4) {
        const wasOn = da[i + 3] > 90;
        const isOn = dc[i + 3] > 90;
        if (wasOn === isOn) {
          out.data[i + 3] = 0;
          continue;
        }
        if (wasOn && !isOn) {
          out.data[i] = 255; out.data[i + 1] = 78; out.data[i + 2] = 58;
        } else {
          out.data[i] = 104; out.data[i + 1] = 246; out.data[i + 2] = 156;
        }
        out.data[i + 3] = 235;
      }
      actx.putImageData(out, 0, 0);
      ctx.drawImage(a, 0, 0);
    }

    // 只保留落在照片主体范围内的像素，避免边框色块
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(pcv, 0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    return c;
  }

  /** 叠加开启时，随每次笔触/参数变化刷新差异层 */
  function refreshOverlay(): void {
    if (!compareOn()) return;
    const overlay = buildPrevOverlay();
    setMaskGuide(overlay);
    scene()?.setCompareCanvas(overlay, compareAlpha());
  }

  function rerunCutout() {
    const pcv = photoCanvas();
    const s = scene();
    if (!pcv || !s) return;
    setCutting(true);
    const mask = autoCutout(pcv, { tolerance: tolerance(), softness: 16, minArea: 14, feather: 0 });
    setBaseMask(mask);
    s.setBaseMask(mask);
    setCutting(false);
    setHint(`按色距容差 ${tolerance()} 重新初抠；已有笔触叠加在初始蒙版之上。`);
    schedulePreview();
  }

  function onStrokeChange() {
    setStrokeCount(scene()?.getStrokes().length ?? 0);
    schedulePreview(true);
    // 等画布把新蒙版算完再比对
    window.setTimeout(() => refreshOverlay(), 60);
  }

  const compareTarget = (): Version | null => prevVersion();

  return (
    <div class="ws-grid">
      <div class="grid" style={{ gap: '16px', 'align-content': 'start' }}>
        <Card
          tight
          title="加工台 · Phaser 画布"
          sub={hint()}
          actions={
            <span class="tag" classList={{ warn: dirty() }}>
              {busy() || cutting() ? '初抠中…' : dirty() ? '有未存改动' : '已同步'}
            </span>
          }
        >
          <Show
            when={photo()}
            fallback={<Empty text="尚未选择样苗照片。" action={<button class="btn primary" onClick={() => props.onGo('photos')}>去拍照</button>} />}
          >
            <BenchCanvas
              callbacks={{
                onStrokes: () => onStrokeChange(),
                onMask: () => undefined,
                onToolSize: (v) => setBrushSize(v),
                onHint: (t) => setHint(t),
              }}
              onReady={(s) => setScene(s)}
            />
            <div class="row between wrap" style={{ 'margin-top': '12px', 'align-items': 'center' }}>
              <div class="row wrap" style={{ gap: '8px' }}>
                <span class="tag mono">{photo()!.name}</span>
                <span class="tag mono">{photo()!.width}×{photo()!.height}px</span>
                <span class="tag">笔触 {strokeCount()} 条</span>
                <Show when={compareOn() && compareTarget()}>
                  <span class="tag blue">叠加 V{compareTarget()!.no}</span>
                </Show>
              </div>
              <span class="kbd">空格 = 画笔 / 橡皮</span>
            </div>
          </Show>
        </Card>

        <Card title="合成预览" sub="规格图用于对外交付；查验图带 10cm 网格、高度刻度与地径卡尺，供质检核对">
          <Show when={preview()} fallback={<Empty text={cutting() ? '正在自动初抠…' : '调节右侧参数后自动生成预览。'} />}>
            <div class="sheet-pair">
              <figure>
                <img src={preview()!.specUrl} alt="规格图预览" />
                <figcaption>规格图 SPEC · 1200×1600</figcaption>
              </figure>
              <figure>
                <img src={preview()!.inspectUrl} alt="查验图预览" />
                <figcaption>查验图 INSPECTION · 网格 10cm</figcaption>
              </figure>
            </div>
          </Show>
        </Card>
      </div>

      <div class="ws-ctrl">
        <Card tight title="画笔修补" sub="补回被初抠切掉的枝叶，或擦掉背景杂物">
          <div class="ctrl-section">
            <div class="tool-btns">
              <button
                class="tool-btn restore"
                classList={{ active: tool() === 'restore' }}
                onClick={() => { setTool('restore'); scene()?.setTool('restore'); setHint('画笔：补回被切掉的枝叶，画到哪补到哪。'); }}
              >
                <Icon name="brush" size={15} /> 补回枝叶
              </button>
              <button
                class="tool-btn erase"
                classList={{ active: tool() === 'erase' }}
                onClick={() => { setTool('erase'); scene()?.setTool('erase'); setHint('橡皮：擦除残留背景、石块、花盆等杂物。'); }}
              >
                <Icon name="eraser" size={15} /> 擦除杂物
              </button>
            </div>
            <div class="ctrl-title"><span>画笔大小</span><span class="mono">{(brushSize() * 100).toFixed(1)}% 画面宽</span></div>
            <input
              class="slider" type="range" min="0.012" max="0.16" step="0.002" value={brushSize()}
              onInput={(e) => { const v = Number(e.currentTarget.value); setBrushSize(v); scene()?.setBrushSize(v); }}
            />
            <div class="row" style={{ gap: '6px' }}>
              <button class="btn sm grow" onClick={() => { scene()?.undo(); onStrokeChange(); }}>
                <Icon name="undo" size={13} /> 撤销一笔
              </button>
              <button class="btn sm grow" onClick={() => { scene()?.clearStrokes(); onStrokeChange(); }}>
                清空笔触
              </button>
            </div>
            <label class="row" style={{ gap: '6px', 'font-size': '12px', color: 'var(--ink-2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={maskOn()} onChange={(e) => { setMaskOn(e.currentTarget.checked); scene()?.setShowMask(e.currentTarget.checked); }} />
              显示蒙版（蓝色遮罩）
            </label>
          </div>
        </Card>

        <Card tight title="初抠参数" sub="以照片左右边缘底色建模，按色距判定前景">
          <div class="ctrl-section">
            <div class="ctrl-title"><span>色距容差</span><span class="mono">{tolerance()}</span></div>
            <input
              class="slider" type="range" min="18" max="90" step="1" value={tolerance()}
              onInput={(e) => setTolerance(Number(e.currentTarget.value))}
              onChange={() => rerunCutout()}
            />
            <span class="hint">容差小 → 保留更多枝叶；容差大 → 背景更干净但易切枝。松手后重新初抠。</span>
            <div class="ctrl-title"><span>边缘羽化</span><span class="mono">{feather().toFixed(1)} px</span></div>
            <input
              class="slider" type="range" min="0" max="4" step="0.1" value={feather()}
              onInput={(e) => { const v = Number(e.currentTarget.value); setFeather(v); scene()?.setFeather(v); schedulePreview(true); }}
            />
          </div>
        </Card>

        <Card tight title="换背景与投影" sub="场景自带色温与光位，主体同步补光">
          <div class="ctrl-section">
            <div class="bg-swatches">
              <For each={BG_PRESETS}>
                {(p) => (
                  <button
                    class="bg-swatch"
                    classList={{ active: preset() === p.id }}
                    onClick={() => {
                      setPreset(p.id);
                      scene()?.setPreset(p.id);
                      setHint(`已切换到「${p.name}」：${p.tempK}K ${p.temp}，投影向${p.shadowDx >= 0 ? '右' : '左'}。`);
                      schedulePreview(true);
                    }}
                  >
                    <span class="sw" style={{ background: swatchGradient(p.id) }} />
                    <span>
                      <div class="nm">{p.name}</div>
                      <div class="kk">{p.tempK}K · {p.temp}</div>
                    </span>
                  </button>
                )}
              </For>
            </div>
            <div class="ctrl-title"><span>投影强度</span><span class="mono">{Math.round(shadow() * 100)}%</span></div>
            <input
              class="slider" type="range" min="0" max="1" step="0.02" value={shadow()}
              onInput={(e) => { const v = Number(e.currentTarget.value); setShadow(v); scene()?.setShadow(v); schedulePreview(); }}
              onChange={() => schedulePreview(true)}
            />
            <span class="hint">{presetInfo(preset()).scene} · 色温 {presetInfo(preset()).tempK}K（{presetInfo(preset()).temp}）</span>
          </div>
        </Card>

        <Card tight title="实测尺寸（用于标尺）">
          <div class="grid cols-2" style={{ gap: '8px' }}>
            <Field label="苗高（cm）">
              <input
                class="input mono" type="number" min="0" step="1" value={heightCm()}
                onInput={(e) => { setHeightCm(Number(e.currentTarget.value)); schedulePreview(); }}
              />
            </Field>
            <Field label="地径（mm）">
              <input
                class="input mono" type="number" min="0" step="0.5" value={diameterMm()}
                onInput={(e) => { setDiameterMm(Number(e.currentTarget.value)); schedulePreview(); }}
              />
            </Field>
          </div>
          <span class="hint" style={{ 'margin-top': '6px', display: 'block' }}>
            出圃区间：地径 {batch()?.diameterMin ?? '—'}–{batch()?.diameterMax ?? '—'} cm ·
            苗高 {batch()?.heightMin ?? '—'}–{batch()?.heightMax ?? '—'} cm
          </span>
        </Card>

        <Card tight title="存版与叠加比对">
          <div class="grid" style={{ gap: '10px' }}>
            <Field label="版本说明（可选）">
              <input class="input" value={note()} onInput={(e) => setNote(e.currentTarget.value)} placeholder={describeChange()} />
            </Field>
            <label class="row" style={{ gap: '6px', 'font-size': '12px', color: 'var(--ink-2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={autoVersion()} onChange={(e) => setAutoVersion(e.currentTarget.checked)} />
              停顿 4 秒自动存版（每改一次留一版）
            </label>
            <div class="row">
              <button
                class="btn primary grow"
                onClick={() => {
                  const result = composeNow();
                  if (result) {
                    setPreview(result);
                    saveVersionWith(result);
                  }
                }}
              >
                <Icon name="save" size={15} /> 保存 V{(prevVersion()?.no ?? 0) + 1}
              </button>
              <button class="btn sm" onClick={() => props.onGo('versions')}>
                <Icon name="layers" size={13} /> 版本比对
              </button>
            </div>
            <hr class="hr" style={{ margin: '4px 0' }} />
            <div class="ctrl-title">
              <span>与上一版叠加</span>
              <span class="mono">{prevVersion() ? `V${prevVersion()!.no}` : '无'}</span>
            </div>
            <Show when={prevVersion()} fallback={<span class="hint">该照片还没有历史版本，存版后即可在画布上叠加比对。</span>}>
              <label class="row" style={{ gap: '6px', 'font-size': '12px', color: 'var(--ink-2)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={compareOn()}
                  onChange={(e) => {
                    const on = e.currentTarget.checked;
                    setCompareOn(on);
                    const overlay = on ? buildPrevOverlay() : null;
                    setMaskGuide(overlay);
                    scene()?.setCompareCanvas(overlay, compareAlpha());
                    setCompareLabel(
                      on ? `青=上一版轮廓，红=本版擦除，绿=本版补回` : '',
                    );
                  }}
                />
                叠加 {`V${prevVersion()!.no}`} 规格图（对齐画框）
              </label>
              <div class="ctrl-title"><span>叠加强度</span><span class="mono">{Math.round(compareAlpha() * 100)}%</span></div>
              <input
                class="slider" type="range" min="0.1" max="1" step="0.02" value={compareAlpha()}
                onInput={(e) => { const v = Number(e.currentTarget.value); setCompareAlpha(v); scene()?.setCompareAlpha(v); }}
              />
              <span class="hint">{fmtDateTime(prevVersion()!.createdAt)} · {prevVersion()!.note}</span>
              <Show when={compareLabel()}>
                <span class="hint" style={{ color: 'var(--blue)' }}>{compareLabel()}</span>
              </Show>
            </Show>
          </div>
        </Card>
      </div>
    </div>
  );
}

function swatchGradient(id: BgPresetId): string {
  switch (id) {
    case 'field': return 'linear-gradient(160deg,#f8e8c8 0%,#b9cfa0 52%,#6d5c3d 100%)';
    case 'cool': return 'linear-gradient(160deg,#e8eef2 0%,#adc0b4 55%,#64705f 100%)';
    case 'greenhouse': return 'linear-gradient(160deg,#f4f9e8 0%,#c6dab6 58%,#7b8a6d 100%)';
    default: return 'linear-gradient(160deg,#6a727c 0%,#34393f 55%,#171a1d 100%)';
  }
}
