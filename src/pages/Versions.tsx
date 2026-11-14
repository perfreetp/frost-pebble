import { createEffect, createMemo, createSignal, For, onCleanup, Show } from 'solid-js';
import { Card, Empty, Seg } from '../components/ui';
import { Icon } from '../components/Icon';
import { pushToast, state, versionsOf } from '../lib/store';
import { BG_PRESETS, presetInfo, type Version } from '../lib/types';
import { fmtDateTime } from '../lib/utils';

type CompareMode = 'slider' | 'overlay' | 'side' | 'diff';

export default function VersionsPage(props: { onGo: (p: 'workstation') => void }) {
  const photos = createMemo(() => state.photos.filter((p) => p.batchId === state.activeBatchId));
  const [photoId, setPhotoId] = createSignal<string | null>(state.activePhotoId);
  const [aId, setAId] = createSignal<string | null>(null);
  const [bId, setBId] = createSignal<string | null>(null);
  const [mode, setMode] = createSignal<CompareMode>('slider');
  const [split, setSplit] = createSignal(0.5);
  const [overlay, setOverlay] = createSignal(0.5);
  const [diffThreshold, setDiffThreshold] = createSignal(46);
  const [diffUrl, setDiffUrl] = createSignal<string | null>(null);
  const [diffStats, setDiffStats] = createSignal<{ pixels: number; ratio: number } | null>(null);

  const list = createMemo(() => (photoId() ? versionsOf(photoId()!) : []));
  const versionA = createMemo(() => list().find((v) => v.id === aId()) ?? list()[0] ?? null);
  const versionB = createMemo(() => {
    const l = list();
    return l.find((v) => v.id === bId()) ?? (l.length > 1 ? l[l.length - 1] : l[0]) ?? null;
  });

  createEffect(() => {
    // 切换照片时重置选择
    const l = list();
    if (!l.length) {
      setAId(null);
      setBId(null);
      return;
    }
    if (!l.some((v) => v.id === aId())) setAId(l[Math.max(0, l.length - 2)].id);
    if (!l.some((v) => v.id === bId())) setBId(l[l.length - 1].id);
  });

  // 差异图：A 与 B 的像素差，突出改动区域
  createEffect(() => {
    const a = versionA();
    const b = versionB();
    if (!a || !b || a.id === b.id) {
      setDiffUrl(null);
      setDiffStats(null);
      return;
    }
    let disposed = false;
    void (async () => {
      const [ia, ib] = await Promise.all([loadImg(a.specUrl), loadImg(b.specUrl)]);
      if (disposed) return;
      const W = 600;
      const H = 800;
      const ca = document.createElement('canvas');
      ca.width = W;
      ca.height = H;
      const cactx = ca.getContext('2d', { willReadFrequently: true })!;
      cactx.drawImage(ia, 0, 0, W, H);
      const cb = document.createElement('canvas');
      cb.width = W;
      cb.height = H;
      const cbctx = cb.getContext('2d', { willReadFrequently: true })!;
      cbctx.drawImage(ib, 0, 0, W, H);

      const da = cactx.getImageData(0, 0, W, H);
      const db = cbctx.getImageData(0, 0, W, H);
      const out = cactx.createImageData(W, H);
      let changed = 0;
      const th = diffThreshold();
      for (let i = 0; i < da.data.length; i += 4) {
        const dr = da.data[i] - db.data[i];
        const dg = da.data[i + 1] - db.data[i + 1];
        const dbl = da.data[i + 2] - db.data[i + 2];
        const m = Math.sqrt(dr * dr + dg * dg + dbl * dbl);
        const g = (da.data[i] + da.data[i + 1] + da.data[i + 2]) / 3;
        // 底图用 B 的灰度，差异区域叠半透明红，仍能看清枝叶轮廓
        const base = 20 + g * 0.42;
        if (m > th) {
          changed++;
          const a = Math.min(0.92, 0.32 + m / 260);
          out.data[i] = base + (218 - base) * a;
          out.data[i + 1] = base + (66 - base) * a;
          out.data[i + 2] = base + (48 - base) * a;
          out.data[i + 3] = 255;
        } else {
          out.data[i] = base;
          out.data[i + 1] = base + 3;
          out.data[i + 2] = base + 1;
          out.data[i + 3] = 255;
        }
      }
      cactx.putImageData(out, 0, 0);
      setDiffUrl(ca.toDataURL('image/jpeg', 0.86));
      setDiffStats({ pixels: changed, ratio: changed / ((W * H) | 0) });
    })();
    onCleanup(() => { disposed = true; });
  });

  function loadImg(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('加载失败'));
      img.src = src;
    });
  }

  function diffSummary(a: Version, b: Version): string[] {
    const out: string[] = [];
    if (a.settings.background !== b.settings.background) {
      out.push(`背景 ${presetInfo(a.settings.background).name} → ${presetInfo(b.settings.background).name}`);
    }
    const ds = b.settings.shadow - a.settings.shadow;
    if (Math.abs(ds) > 0.01) out.push(`投影 ${Math.round(a.settings.shadow * 100)}% → ${Math.round(b.settings.shadow * 100)}%`);
    const df = b.settings.feather - a.settings.feather;
    if (Math.abs(df) > 0.01) out.push(`羽化 ${a.settings.feather.toFixed(1)} → ${b.settings.feather.toFixed(1)} px`);
    if (b.strokes.length !== a.strokes.length) {
      const add = b.strokes.length - a.strokes.length;
      out.push(`笔触 ${a.strokes.length} → ${b.strokes.length} 条（${add > 0 ? '+' : ''}${add}）`);
    }
    if (a.settings.measuredHeightCm !== b.settings.measuredHeightCm) {
      out.push(`苗高 ${a.settings.measuredHeightCm} → ${b.settings.measuredHeightCm} cm`);
    }
    if (a.settings.measuredDiameterMm !== b.settings.measuredDiameterMm) {
      out.push(`地径 Ø${a.settings.measuredDiameterMm} → Ø${b.settings.measuredDiameterMm} mm`);
    }
    return out;
  }

  return (
    <div class="grid" style={{ gap: '16px' }}>
      <Card
        title="版本时间线"
        sub={state.activeBatchId ? `当前批次 ${state.batches.find((b) => b.id === state.activeBatchId)?.code ?? ''}` : '请选择批次'}
        actions={
          <div class="row" style={{ gap: '8px' }}>
            <Show when={photos().length > 1}>
              <select class="input" style={{ width: '150px', padding: '6px 9px' }} value={photoId() ?? ''}
                onChange={(e) => setPhotoId(e.currentTarget.value || null)}>
                <For each={photos()}>{(p) => <option value={p.id}>{p.name}</option>}</For>
              </select>
            </Show>
            <button class="btn sm" onClick={() => props.onGo('workstation')}>
              <Icon name="wand" size={13} /> 去加工
            </button>
          </div>
        }
      >
        <Show when={list().length} fallback={<Empty text="该样苗还没有合成版本。到加工台完成初抠、补笔和换背景后存版，这里就会出现版本链。" />}>
          <div class="ver-strip">
            <For each={list()}>
              {(v) => (
                <div
                  class="ver-card"
                  classList={{ sel: v.id === versionA()?.id || v.id === versionB()?.id }}
                  onClick={() => {
                    if (v.id === versionA()?.id) return;
                    setBId(v.id);
                  }}
                  title="点击设为对比版本 B"
                >
                  <img src={v.thumbUrl} alt={`V${v.no}`} />
                  <div class="meta">
                    <div class="row between">
                      <span class="vno">V{v.no}</span>
                      <span style={{ 'font-size': '9.5px', color: 'var(--ink-3)' }}>{fmtDateTime(v.createdAt).slice(5)}</span>
                    </div>
                    <div style={{ 'font-size': '10.5px', color: 'var(--ink-3)', 'margin-top': '1px' }}>
                      {presetInfo(v.settings.background).name} · {v.strokes.length} 笔触
                    </div>
                    <div class="row" style={{ gap: '4px', 'margin-top': '6px' }}>
                      <button
                        class="btn sm"
                        style={{ padding: '2px 8px', 'font-size': '10px', flex: 1 }}
                        classList={{ primary: v.id === versionA()?.id }}
                        onClick={(e) => { e.stopPropagation(); setAId(v.id); }}
                      >基准 A</button>
                      <button
                        class="btn sm"
                        style={{ padding: '2px 8px', 'font-size': '10px', flex: 1 }}
                        classList={{ primary: v.id === versionB()?.id }}
                        onClick={(e) => { e.stopPropagation(); setBId(v.id); }}
                      >对比 B</button>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Card>

      <Show when={versionA() && versionB() && versionA()!.id !== versionB()!.id}>
        <div class="grid" style={{ 'grid-template-columns': 'minmax(0, 1fr) 300px', gap: '16px', 'align-items': 'start' }}>
          <Card
            title={`V${versionA()!.no} ↔ V${versionB()!.no} 叠加比对`}
            sub="拖动分割线或叠加滑块查看每处改动的差异"
            actions={
              <Seg<CompareMode>
                options={[
                  { value: 'slider', label: '分割' },
                  { value: 'overlay', label: '叠加' },
                  { value: 'diff', label: '差异' },
                  { value: 'side', label: '并排' },
                ]}
                value={mode()}
                onChange={setMode}
              />
            }
          >
            <Show when={mode() === 'side'}>
              <div class="sheet-pair">
                <figure>
                  <img src={versionA()!.specUrl} alt={`V${versionA()!.no}`} />
                  <figcaption>V{versionA()!.no} · 规格图</figcaption>
                </figure>
                <figure>
                  <img src={versionB()!.specUrl} alt={`V${versionB()!.no}`} />
                  <figcaption>V{versionB()!.no} · 规格图</figcaption>
                </figure>
              </div>
            </Show>

            <Show when={mode() === 'slider'}>
              <div class="compare-stage" style={{ 'user-select': 'none' }}>
                <img class="base" src={versionA()!.specUrl} alt="基准" />
                <img
                  class="over"
                  src={versionB()!.specUrl}
                  alt="对比"
                  style={{ 'clip-path': `inset(0 0 0 ${split() * 100}%)` }}
                />
                <div class="slider-line" style={{ left: `${split() * 100}%` }} />
                <input
                  type="range" min="0" max="1" step="0.005" value={split()}
                  onInput={(e) => setSplit(Number(e.currentTarget.value))}
                  style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', opacity: 0, cursor: 'ew-resize', margin: 0 }}
                />
                <div class="row between" style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px', 'pointer-events': 'none' }}>
                  <span class="tag blue">A · V{versionA()!.no}</span>
                  <span class="tag ok">B · V{versionB()!.no}</span>
                </div>
              </div>
            </Show>

            <Show when={mode() === 'overlay'}>
              <div class="compare-stage">
                <img class="base" src={versionA()!.specUrl} alt="基准" />
                <img class="over" src={versionB()!.specUrl} alt="叠加" style={{ opacity: overlay().toFixed(2) }} />
              </div>
              <div class="row" style={{ 'margin-top': '10px', gap: '12px' }}>
                <span class="hint" style={{ 'white-space': 'nowrap' }}>B 透明度</span>
                <input class="slider" type="range" min="0" max="1" step="0.02" value={overlay()}
                  onInput={(e) => setOverlay(Number(e.currentTarget.value))} />
                <span class="mono hint">{Math.round(overlay() * 100)}%</span>
              </div>
            </Show>

            <Show when={mode() === 'diff'}>
              <Show when={versionA()!.settings.background !== versionB()!.settings.background}>
                <div class="tag warn" style={{ 'margin-bottom': '8px', display: 'inline-flex' }}>
                  两版背景不同，全幅都会被标为差异；查看枝叶轮廓改动建议切到「分割」或「叠加」
                </div>
              </Show>
              <Show when={diffUrl()} fallback={<div class="empty">正在计算差异…</div>}>
                <div class="compare-stage">
                  <img class="base" src={diffUrl()!} alt="差异图" />
                </div>
                <div class="row between" style={{ 'margin-top': '10px' }}>
                  <span class="hint">
                    红色区域 = V{versionB()!.no} 相对 V{versionA()!.no} 的改动；
                    {diffStats() ? ` 变化像素占比 ${(diffStats()!.ratio * 100).toFixed(2)}%` : ''}
                  </span>
                  <div class="row" style={{ gap: '8px' }}>
                    <span class="hint">灵敏度</span>
                    <input class="slider" style={{ width: '110px' }} type="range" min="0" max="90" step="2"
                      value={diffThreshold()} onInput={(e) => setDiffThreshold(Number(e.currentTarget.value))} />
                  </div>
                </div>
              </Show>
            </Show>
          </Card>

          <div class="grid" style={{ gap: '16px' }}>
            <Card tight title="差异摘要">
              <Show when={diffSummary(versionA()!, versionB()!).length} fallback={<span class="hint">两版参数完全一致，差异主要来自笔触细节。</span>}>
                <div class="list" style={{ gap: '6px' }}>
                  <For each={diffSummary(versionA()!, versionB()!)}>
                    {(t) => <div class="row" style={{ gap: '8px', 'font-size': '12px' }}><Icon name="arrow" size={13} /><span>{t}</span></div>}
                  </For>
                </div>
              </Show>
              <hr class="hr" />
              <div class="grid" style={{ gap: '8px', 'font-size': '12px' }}>
                <div class="row between"><span style={{ color: 'var(--ink-3)' }}>A 存于</span><span>{fmtDateTime(versionA()!.createdAt)}</span></div>
                <div class="row between"><span style={{ color: 'var(--ink-3)' }}>B 存于</span><span>{fmtDateTime(versionB()!.createdAt)}</span></div>
                <div class="row between"><span style={{ color: 'var(--ink-3)' }}>A 说明</span><span style={{ 'text-align': 'right' }}>{versionA()!.note}</span></div>
                <div class="row between"><span style={{ color: 'var(--ink-3)' }}>B 说明</span><span style={{ 'text-align': 'right' }}>{versionB()!.note}</span></div>
                <div class="row between"><span style={{ color: 'var(--ink-3)' }}>B 笔触</span><span class="mono">{versionB()!.strokes.length} 条</span></div>
              </div>
            </Card>

            <Card tight title="查验图对照">
              <div style={{ display: 'grid', gap: '8px' }}>
                <figure style={{ margin: 0 }}>
                  <img src={versionA()!.inspectUrl} alt="A 查验图" style={{ width: '100%', 'border-radius': '8px', border: '1px solid var(--line)' }} />
                  <figcaption style={{ 'font-size': '10.5px', color: 'var(--ink-3)', 'text-align': 'center', 'margin-top': '4px' }}>A · V{versionA()!.no}</figcaption>
                </figure>
                <figure style={{ margin: 0 }}>
                  <img src={versionB()!.inspectUrl} alt="B 查验图" style={{ width: '100%', 'border-radius': '8px', border: '1px solid var(--line)' }} />
                  <figcaption style={{ 'font-size': '10.5px', color: 'var(--ink-3)', 'text-align': 'center', 'margin-top': '4px' }}>B · V{versionB()!.no}</figcaption>
                </figure>
              </div>
            </Card>

            <Card tight title="版本设置">
              <div style={{ display: 'grid', gap: '6px', 'font-size': '11.5px' }}>
                <For each={BG_PRESETS.filter((p) => p.id === versionB()!.settings.background)}>
                  {(p) => (
                    <div class="row between"><span style={{ color: 'var(--ink-3)' }}>背景</span><span>{p.name}</span></div>
                  )}
                </For>
                <div class="row between"><span style={{ color: 'var(--ink-3)' }}>色温</span><span class="mono">{presetInfo(versionB()!.settings.background).tempK}K</span></div>
                <div class="row between"><span style={{ color: 'var(--ink-3)' }}>羽化</span><span class="mono">{versionB()!.settings.feather.toFixed(1)} px</span></div>
                <div class="row between"><span style={{ color: 'var(--ink-3)' }}>投影</span><span class="mono">{Math.round(versionB()!.settings.shadow * 100)}%</span></div>
                <div class="row between"><span style={{ color: 'var(--ink-3)' }}>实测</span><span class="mono">{versionB()!.settings.measuredHeightCm}cm / Ø{versionB()!.settings.measuredDiameterMm}mm</span></div>
                <div class="row between"><span style={{ color: 'var(--ink-3)' }}>存版人</span><span>{versionB()!.savedBy}</span></div>
              </div>
              <hr class="hr" />
              <button class="btn sm" style={{ width: '100%' }} onClick={() => {
                const v = versionB()!;
                for (const [name, url] of [['spec', v.specUrl], ['inspect', v.inspectUrl]] as const) {
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${state.batches.find((b) => b.id === v.batchId)?.code ?? 'batch'}_V${v.no}_${name}.jpg`;
                  link.click();
                }
                pushToast('ok', `已下载 V${v.no} 规格图与查验图`);
              }}>
                <Icon name="download" size={13} /> 下载此版两张成图
              </button>
            </Card>
          </div>
        </div>
      </Show>
      <Show when={!versionA() || !versionB() || versionA()!.id === versionB()!.id}>
        <Empty text="至少需要两个不同版本才能比对。回到加工台改动参数后再次存版，或在上方时间线选择不同的基准 A 与对比 B。" />
      </Show>
    </div>
  );
}

