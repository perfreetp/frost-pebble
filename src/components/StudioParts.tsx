import { For, Show, createSignal, onCleanup, onMount } from 'solid-js';
import type { BackgroundRecord, CompositeParams, CutParams, Item, Stroke } from '../lib/types';
import { IconBrush, IconEraser, IconEye, IconImage, IconPlus, IconSun, IconUpload } from './icons';
import type { ChannelStats } from '../lib/color';
import { balanceGains, cctLabel, formatCct } from '../lib/color';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  fmt?: (v: number) => string;
  disabled?: boolean;
  onInput: (v: number) => void;
  hint?: string;
}

export function Slider(p: SliderProps) {
  const pct = () => `${((p.value - p.min) / (p.max - p.min)) * 100}%`;
  return (
    <label class="field">
      <span class="field-label">
        <span>{p.label}</span>
        <b>{p.fmt ? p.fmt(p.value) : `${p.value.toFixed(p.step && p.step < 0.1 ? 2 : 1)}${p.unit ?? ''}`}</b>
      </span>
      <input
        type="range"
        min={p.min}
        max={p.max}
        step={p.step ?? 0.01}
        value={p.value}
        disabled={p.disabled}
        style={{ '--pct': pct() }}
        onInput={(e) => p.onInput(Number(e.currentTarget.value))}
      />
      <Show when={p.hint}>
        <span class="muted" style={{ 'font-size': '10.5px', 'line-height': '1.4' }}>{p.hint}</span>
      </Show>
    </label>
  );
}

export interface BrushState {
  mode: 'add' | 'erase';
  radius: number;
  hardness: number;
  strength: number;
}

export function CutPanel(p: {
  cut: CutParams;
  locked: boolean;
  backdrop: { mean: [number, number, number]; coverage: number; stats: ChannelStats } | null;
  onChange: (patch: Partial<CutParams>) => void;
  onReset: () => void;
}) {
  return (
    <div class="section">
      <div class="section-title">
        <IconEye size={13} />
        初抠 · 主体蒙版
        <span class="rule" />
      </div>
      <Show when={p.backdrop} fallback={<div class="muted" style={{ 'font-size': '11.5px' }}>正在估计背景色…</div>}>
        <div class="dq-row" style={{ 'margin-bottom': '2px' }}>
          <span class="k">背景估计</span>
          <span class="v" style={{ display: 'flex', 'align-items': 'center', gap: '6px' }}>
            <i
              style={{
                width: '11px',
                height: '11px',
                'border-radius': '3px',
                background: `rgb(${p.backdrop!.mean.map((c) => Math.round(c * 255)).join(',')})`,
                border: '1px solid rgba(255,255,255,0.25)',
                'flex-shrink': 0,
              }}
            />
            {formatCct(p.backdrop!.stats.cct)} · {cctLabel(p.backdrop!.stats.cct)}
          </span>
        </div>
        <div class="dq-row" style={{ 'margin-bottom': '4px' }}>
          <span class="k">覆盖</span>
          <span class="v">{(p.backdrop!.coverage * 100).toFixed(1)}%</span>
        </div>
      </Show>
      <Slider
        label="背景色容差"
        value={p.cut.bgTolerance}
        min={0.3}
        max={2.2}
        step={0.01}
        disabled={p.locked}
        fmt={(v) => `${v.toFixed(2)}σ`}
        onInput={(v) => p.onChange({ bgTolerance: v })}
        hint="低于此距离判为背景。白底塑料与白棚接近时调低。"
      />
      <Slider
        label="边缘收敛"
        value={p.cut.edgeSnap}
        min={0}
        max={1}
        step={0.01}
        disabled={p.locked}
        fmt={(v) => `${Math.round(v * 100)}%`}
        onInput={(v) => p.onChange({ edgeSnap: v })}
        hint="把蒙版边缘往外推，找回细杆、辐条和线缆。"
      />
      <Slider
        label="羽化半径"
        value={p.cut.feather}
        min={0}
        max={12}
        step={0.1}
        disabled={p.locked}
        fmt={(v) => `${v.toFixed(1)} px`}
        onInput={(v) => p.onChange({ feather: v })}
      />
      <Slider
        label="边缘硬度"
        value={p.cut.hardness}
        min={0}
        max={1}
        step={0.01}
        disabled={p.locked}
        fmt={(v) => `${Math.round(v * 100)}%`}
        onInput={(v) => p.onChange({ hardness: v })}
        hint="高硬度适合目录图；低硬度适合柔和的电商主图。"
      />
      <button class="btn sm wide" disabled={p.locked} onClick={p.onReset}>
        恢复初抠参数
      </button>
    </div>
  );
}

export function BrushPanel(p: {
  brush: BrushState;
  locked: boolean;
  strokeCount: number;
  onChange: (patch: Partial<BrushState>) => void;
  onUndo: () => void;
  onClear: () => void;
}) {
  return (
    <div class="section">
      <div class="section-title">
        <IconBrush size={13} />
        画笔修边
        <span class="rule" />
      </div>
      <div class="seg">
        <button class={p.brush.mode === 'add' ? 'on' : ''} disabled={p.locked} onClick={() => p.onChange({ mode: 'add' })}>
          <IconPlus size={12} /> 加选
        </button>
        <button class={p.brush.mode === 'erase' ? 'on' : ''} disabled={p.locked} onClick={() => p.onChange({ mode: 'erase' })}>
          <IconEraser size={12} /> 减选
        </button>
      </div>
      <Slider
        label="笔刷大小"
        value={p.brush.radius}
        min={4}
        max={220}
        step={1}
        disabled={p.locked}
        fmt={(v) => `${v.toFixed(0)} px`}
        onInput={(v) => p.onChange({ radius: v })}
      />
      <Slider
        label="笔刷硬度"
        value={p.brush.hardness}
        min={0}
        max={0.98}
        step={0.01}
        disabled={p.locked}
        fmt={(v) => `${Math.round(v * 100)}%`}
        onInput={(v) => p.onChange({ hardness: v })}
      />
      <Slider
        label="单笔浓度"
        value={p.brush.strength}
        min={0.05}
        max={1}
        step={0.01}
        disabled={p.locked}
        fmt={(v) => `${Math.round(v * 100)}%`}
        onInput={(v) => p.onChange({ strength: v })}
      />
      <div style={{ display: 'flex', gap: '6px' }}>
        <button class="btn sm" style={{ flex: 1 }} disabled={p.locked || p.strokeCount === 0} onClick={p.onUndo}>
          撤销一笔
        </button>
        <button class="btn sm" style={{ flex: 1 }} disabled={p.locked || p.strokeCount === 0} onClick={p.onClear}>
          清空笔迹
        </button>
      </div>
      <div class="muted" style={{ 'font-size': '10.5px' }}>已记录 {p.strokeCount} 笔 · 可随条目保存与回放</div>
    </div>
  );
}

export function BackgroundPanel(p: {
  backgrounds: BackgroundRecord[];
  chosenId: string | null;
  locked: boolean;
  onPick: (bg: BackgroundRecord) => void;
  onUpload: (file: File) => void;
  onLockedAttempt: () => void;
}) {
  let inputRef: HTMLInputElement | undefined;
  const tryPick = (bg: BackgroundRecord) => {
    if (p.locked) { p.onLockedAttempt(); return; }
    p.onPick(bg);
  };
  return (
    <div class="section">
      <div class="section-title">
        <IconImage size={13} />
        背景库
        <span class="rule" />
      </div>
      <div class="bg-strip">
        <For each={p.backgrounds}>
          {(bg) => (
            <div
              class={`bg-thumb ${p.chosenId === bg.id ? 'on' : ''}`}
              style={{ 'background-image': `url(${bg.thumb})` }}
              title={`${bg.name} · ${bg.tags.join(' / ')}`}
              onClick={() => tryPick(bg)}
            >
              <span>{bg.name}</span>
            </div>
          )}
        </For>
        <div class="bg-thumb add" onClick={() => (p.locked ? p.onLockedAttempt() : inputRef?.click())}>
          <IconUpload size={17} />
          <span style={{ position: 'static', background: 'none', padding: 0 }}>上传背景</span>
        </div>
      </div>
      <input
        ref={inputRef}
        class="hidden-input"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f) p.onUpload(f);
          e.currentTarget.value = '';
        }}
      />
      <Show when={p.chosenId === null}>
        <div class="hint">未选背景时，合成预览显示为透明底。选一张背景即可得到电商图。</div>
      </Show>
    </div>
  );
}

export function CompositePanel(p: {
  comp: CompositeParams;
  locked: boolean;
  subjectCct: number | null;
  bgCct: number | null;
  onChange: (patch: Partial<CompositeParams>) => void;
  hasBackground: boolean;
}) {
  const deviation = () =>
    p.subjectCct && p.bgCct ? Math.abs(p.subjectCct - p.bgCct) : null;
  return (
    <div class="section">
      <div class="section-title">
        <IconSun size={13} />
        合成 · 光影与色温
        <span class="rule" />
      </div>
      <Show
        when={p.hasBackground}
        fallback={<div class="hint">先在背景库选一张背景，合成面板才会生效。</div>}
      >
        <div class="dq-panel">
          <div class="dq-row">
            <span class="k">主体色温</span>
            <span class="v">{p.subjectCct ? formatCct(p.subjectCct) : '—'}</span>
          </div>
          <div class="dq-row">
            <span class="k">背景色温</span>
            <span class="v">{p.bgCct ? formatCct(p.bgCct) : '—'}</span>
          </div>
          <div class="dq-row">
            <span class="k">偏差</span>
            <span
              class="v"
              style={{
                color:
                  deviation() === null
                    ? 'var(--text-2)'
                    : deviation()! < 600
                      ? '#6ed7a6'
                      : deviation()! < 1400
                        ? '#e5b467'
                        : '#f0908f',
              }}
            >
              {deviation() === null ? '—' : `${Math.round(deviation()!)}K`}
            </span>
          </div>
          <Show when={p.subjectCct && p.bgCct}>
            <div class="dq-note">
              自动校正增益 R×{balanceGains(p.subjectCct!, p.bgCct!, p.comp.tempStrength)[0].toFixed(2)} · G×
              {balanceGains(p.subjectCct!, p.bgCct!, p.comp.tempStrength)[1].toFixed(2)} · B×
              {balanceGains(p.subjectCct!, p.bgCct!, p.comp.tempStrength)[2].toFixed(2)}
            </div>
          </Show>
        </div>

        <Slider
          label="色温校正强度"
          value={p.comp.tempStrength}
          min={0}
          max={1}
          step={0.01}
          disabled={p.locked}
          fmt={(v) => `${Math.round(v * 100)}%`}
          onInput={(v) => p.onChange({ tempStrength: v })}
          hint="按背景色温重打主体的白平衡，保留明度。"
        />
        <Slider
          label="背景缩放"
          value={p.comp.bgScale}
          min={1}
          max={2.4}
          step={0.01}
          disabled={p.locked}
          fmt={(v) => `${v.toFixed(2)}×`}
          onInput={(v) => p.onChange({ bgScale: v })}
        />
        <Slider
          label="背景左右"
          value={p.comp.bgOffsetX}
          min={-0.4}
          max={0.4}
          step={0.005}
          disabled={p.locked}
          fmt={(v) => `${(v * 100).toFixed(0)}%`}
          onInput={(v) => p.onChange({ bgOffsetX: v })}
        />
        <Slider
          label="背景上下"
          value={p.comp.bgOffsetY}
          min={-0.4}
          max={0.4}
          step={0.005}
          disabled={p.locked}
          fmt={(v) => `${(v * 100).toFixed(0)}%`}
          onInput={(v) => p.onChange({ bgOffsetY: v })}
        />
        <div class="section-title" style={{ 'margin-top': '4px' }}>
          投影
          <span class="rule" />
        </div>
        <Slider
          label="投影方向"
          value={p.comp.shadowAngle}
          min={0}
          max={360}
          step={1}
          disabled={p.locked}
          fmt={(v) => `${v.toFixed(0)}°`}
          onInput={(v) => p.onChange({ shadowAngle: v })}
        />
        <Slider
          label="投影柔和度"
          value={p.comp.shadowSoftness}
          min={0}
          max={40}
          step={0.5}
          disabled={p.locked}
          fmt={(v) => `${v.toFixed(0)}`}
          onInput={(v) => p.onChange({ shadowSoftness: v })}
          hint="柔和度越高，产品与地面的接触感越弱。"
        />
        <Slider
          label="投影不透明度"
          value={p.comp.shadowOpacity}
          min={0}
          max={1}
          step={0.01}
          disabled={p.locked}
          fmt={(v) => `${Math.round(v * 100)}%`}
          onInput={(v) => p.onChange({ shadowOpacity: v })}
        />
      </Show>
    </div>
  );
}

/** Draws the live WebGPU canvas with pointer capture for the brush. */
export function StageCanvas(p: {
  item: Item;
  viewMode: 'matte' | 'mask' | 'scene';
  brush: BrushState;
  locked: boolean;
  onStrokePreview: (stroke: Stroke) => void;
  onStrokeCommit: (stroke: Stroke) => void;
  onStrokeStart: () => void;
  onStrokeEnd: () => void;
  onEngineReady: (canvas: HTMLCanvasElement) => void;
}) {
  let canvasRef: HTMLCanvasElement | undefined;
  let overlayRef: HTMLDivElement | undefined;
  const [cursor, setCursor] = createSignal<{ x: number; y: number } | null>(null);
  const [drawing, setDrawing] = createSignal(false);
  const [overlayW, setOverlayW] = createSignal(1);

  onMount(() => {
    if (canvasRef) p.onEngineReady(canvasRef);
    const update = () => setOverlayW(overlayRef?.clientWidth ?? 1);
    update();
    const ro = new ResizeObserver(update);
    if (overlayRef) ro.observe(overlayRef);
    onCleanup(() => ro.disconnect());
  });

  const toImage = (e: PointerEvent) => {
    const rect = overlayRef!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * p.item.width;
    const y = ((e.clientY - rect.top) / rect.height) * p.item.height;
    return { x: Math.max(0, Math.min(p.item.width, x)), y: Math.max(0, Math.min(p.item.height, y)) };
  };

  let points: { x: number; y: number }[] = [];
  let strokeId = '';

  const makeStroke = (): Stroke => ({
    id: strokeId,
    mode: p.brush.mode,
    points: points.slice(),
    radius: p.brush.radius,
    hardness: p.brush.hardness,
    strength: p.brush.strength,
  });

  const onDown = (e: PointerEvent) => {
    if (p.locked) {
      if (e.button === 0) p.onStrokeStart(); // surfaces the locked notice
      return;
    }
    if (e.button !== 0) return;
    overlayRef!.setPointerCapture(e.pointerId);
    setDrawing(true);
    strokeId = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    points = [toImage(e)];
    p.onStrokeStart();
    p.onStrokePreview(makeStroke());
  };

  const onMove = (e: PointerEvent) => {
    const rect = overlayRef!.getBoundingClientRect();
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (!drawing()) return;
    const pt = toImage(e);
    const last = points[points.length - 1];
    // Sub-pixel moves add nothing and cost a dispatch per event.
    if (last && Math.hypot(pt.x - last.x, pt.y - last.y) < 1.5) return;
    points.push(pt);
    p.onStrokePreview(makeStroke());
  };

  const finish = () => {
    if (!drawing()) return;
    setDrawing(false);
    p.onStrokeEnd();
    if (points.length > 0) p.onStrokeCommit(makeStroke());
    points = [];
  };

  const brushCss = () => (p.brush.radius * 2 * overlayW()) / p.item.width;

  return (
    <div class="canvas-frame" style={{ width: '100%', height: '100%', display: 'grid', 'place-items': 'center' }}>
      <div
        style={{
          position: 'relative',
          'aspect-ratio': `${p.item.width} / ${p.item.height}`,
          'max-width': '100%',
          'max-height': '100%',
          height: '100%',
          width: 'auto',
        }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        <div
          ref={overlayRef}
          class="canvas-overlay"
          style={{ cursor: p.locked ? 'default' : 'crosshair' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={finish}
          onPointerCancel={finish}
          onPointerLeave={() => setCursor(null)}
        />
        <Show when={cursor() && !p.locked}>
          <div
            class="brush-cursor"
            style={{ left: `${cursor()!.x}px`, top: `${cursor()!.y}px`, width: `${brushCss()}px`, height: `${brushCss()}px` }}
          />
        </Show>
      </div>
    </div>
  );
}
