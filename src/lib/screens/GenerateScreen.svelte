<script lang="ts">
  import { studio, strokePolygon } from '../store.svelte';
  import GlyphCanvas from '../components/GlyphCanvas.svelte';
  import ParamControls from '../components/ParamControls.svelte';
  import { INK_STYLE, LOCK_STYLE, GHOST_STYLE, type Layer } from '../render/index';
  import { generateGlyph, composeGlyph, renderStroke, TERMINAL_LABEL } from '../generator';
  import { getSkeleton } from '../skeletons';
  import type { GenParams, StrokeState } from '../types';
  import { unionRings, dedupeRing, ringsToPath, type MultiPoly, type Ring } from '../geometry';
  import { onMount } from 'svelte';

  const rec = $derived(studio.editorRecord);
  const skeleton = $derived(rec ? getSkeleton(rec.char) : undefined);

  /** 当前工作副本：参数 + 笔画 */
  let params = $state<GenParams | null>(null);
  let strokes = $state<StrokeState[]>([]);
  let dirty = $state(false);
  let note = $state('');
  let showHandles = $state(true);
  let activeStrokeId = $state<string | null>(null);
  let saveFlash = $state(false);
  let baseFingerprint = $state('');

  /** 切换档案时重置工作副本 */
  $effect(() => {
    const id = rec?.id ?? null;
    if (!id) return;
    const r = studio.records.find((x) => x.id === id);
    if (!r) return;
    const v = studio.currentVersion(r);
    if (!v) return;
    params = { ...v.params };
    strokes = v.strokes.map(cloneS);
    dirty = false;
    note = '';
    baseFingerprint = v.fingerprint;
    activeStrokeId = null;
  });

  function cloneS(s: StrokeState): StrokeState {
    return {
      ...s,
      nodes: s.nodes.map((p) => ({ ...p })),
      baseNodes: s.baseNodes.map((p) => ({ ...p })),
      poly: s.poly?.map((p) => ({ ...p })),
      centerline: s.centerline?.map((p) => ({ ...p })),
    };
  }

  /** 参数变更 → 重生成（保留锁定笔画） */
  function onParamChange(patch: Partial<GenParams>) {
    if (!params || !skeleton || !rec) return;
    const next = { ...params, ...patch };
    params = next;
    regen(next);
  }

  function regen(p: GenParams) {
    if (!skeleton || !rec) return;
    // 仅保留锁定笔画的快照；其余按新参数重建
    const prevLocked = strokes.filter((s) => s.manual);
    const gen = generateGlyph({ char: rec.char, skeleton, params: p, previous: prevLocked });
    // 锁定笔画按 id 取回
    const lockedMap = new Map(prevLocked.map((s) => [s.id, s]));
    strokes = gen.strokes.map((s) => (lockedMap.has(s.id) ? cloneS(lockedMap.get(s.id)!) : s));
    dirty = true;
  }

  /** 组合当前笔画集 */
  const composed = $derived.by(() => {
    const p = params;
    if (!p) return { polys: [] as MultiPoly, path: '', metrics: null };
    const rings: Ring[] = [];
    for (const s of strokes) {
      const r = strokePolygon(s, p);
      if (r.length >= 3) rings.push(r);
    }
    const polys = unionRings(rings)
      .map((poly) => poly.map((ring) => dedupeRing(ring)))
      .filter((poly) => poly.length > 0);
    return composeGlyph(strokes, p);
  });

  /** 手改笔画单独的高亮层 */
  const manualPolys = $derived.by(() => {
    const p = params;
    if (!p) return [] as MultiPoly;
    const rings = strokes.filter((s) => s.manual).map((s) => strokePolygon(s, p)).filter((r) => r.length >= 3);
    if (!rings.length) return [];
    return unionRings(rings);
  });

  /** 基础层（参数生成笔画）与锁定层（手改笔画）分开绘制，手改笔画以朱色标出 */
  const basePolys = $derived.by(() => {
    const p = params;
    if (!p) return [] as MultiPoly;
    const rings = strokes.filter((s) => !s.manual).map((s) => strokePolygon(s, p)).filter((r) => r.length >= 3);
    if (!rings.length) return [];
    return unionRings(rings);
  });

  const layers = $derived.by<Layer[]>(() => {
    // 全字形以墨色绘制；手改笔画另以朱色轮廓线标出（见 SVG 覆盖层）
    if (!composed.polys.length) return [];
    return [{ polys: composed.polys, style: INK_STYLE }];
  });

  /** 手改笔画的轮廓路径（朱色描边用） */
  const manualOutlines = $derived.by(() => {
    const p = params;
    if (!p) return [] as string[];
    return strokes
      .filter((s) => s.manual)
      .map((s) => {
        const ring = strokePolygon(s, p);
        return ring.length >= 3 ? ringsToPath([[ring]]) : '';
      })
      .filter(Boolean);
  });

  const manualCount = $derived(strokes.filter((s) => s.manual).length);
  const originalCount = $derived(rec ? strokes.filter((s) => s.manual && studio.currentVersion(rec)?.strokes.some((o) => o.id === s.id && o.manual)).length : 0);
  const newManual = $derived(Math.max(0, manualCount - originalCount));

  /** 当前指纹（与实际输出一致） */
  const liveFingerprint = $derived.by(() => {
    if (!params || !skeleton || !rec) return '';
    const gen = generateGlyph({ char: rec.char, skeleton, params, previous: strokes.filter((s) => s.manual) });
    return gen.fingerprint;
  });
  const changedFingerprint = $derived(liveFingerprint !== baseFingerprint);

  function save() {
    if (!rec || !params || !skeleton) return;
    studio.saveVersion(rec, params, strokes, note.trim() || defaultNote());
    // 刷新状态：保存后本副本与最新版本一致
    const r = studio.records.find((x) => x.id === rec.id);
    const v = r && studio.currentVersion(r);
    if (v) {
      baseFingerprint = v.fingerprint;
      dirty = false;
      note = '';
    }
    saveFlash = true;
    setTimeout(() => (saveFlash = false), 1400);
  }

  function resetParams() {
    if (!rec) return;
    const v = studio.currentVersion(rec);
    if (!v) return;
    params = { ...v.params };
    strokes = v.strokes.map(cloneS);
    dirty = false;
  }

  function defaultNote(): string {
    const locked = strokes.filter((s) => s.manual).length;
    if (locked && newManual) return `按新参数重新生成，新增 ${newManual} 笔手工锁定；原有手改保持。`;
    if (locked) return '参数调整后重新生成；既有手改笔画保留不动。';
    return '参数调整后重新生成。';
  }

  /** 对比视角：显示上一版本幽灵轮廓 */
  let overlayPrev = $state(false);
  const prevVersion = $derived.by(() => {
    if (!rec) return null;
    const cur = studio.currentVersion(rec);
    if (!cur) return null;
    const idx = rec.versions.findIndex((v) => v.id === cur.id);
    return idx > 0 ? rec.versions[idx - 1] : null;
  });

  /* ------------------- 拖点微调 ------------------- */
  interface HandleHit {
    strokeId: string;
    nodeIndex: number;
    sx: number;
    sy: number;
  }
  let svgLayer: SVGSVGElement | undefined = $state();
  let drag = $state<{ strokeId: string; nodeIndex: number } | null>(null);
  let hoverId = $state<string | null>(null);
  let cursorPos = $state<{ x: number; y: number } | null>(null);

  // SVG viewBox 与 GlyphCanvas 的辅助线一致：(-120,-1030) 1240×1240，
  // 内部用 scale(1,-1) 类翻转绘制，故 em(x,y) 对应 SVG(x,-y)。
  const VB = { x: -120, y: -1030, w: 1240, h: 1240 };
  function proj() {
    const r = svgLayer!.getBoundingClientRect();
    const scale = Math.min(r.width / VB.w, r.height / VB.h);
    const offX = r.left + (r.width - VB.w * scale) / 2;
    const offY = r.top + (r.height - VB.h * scale) / 2;
    return { scale, offX, offY };
  }
  /** 客户端坐标 → em（y 向上） */
  function toEm(clientX: number, clientY: number) {
    const { scale, offX, offY } = proj();
    const vx = VB.x + (clientX - offX) / scale;
    const vy = VB.y + (clientY - offY) / scale;
    return { x: vx, y: -vy };
  }
  /** em → SVG viewBox 坐标（y 向下） */
  function toSvg(x: number, y: number) {
    return { x, y: -y };
  }

  const HIT_RADIUS_CSS = 13;
  function hitHandle(clientX: number, clientY: number): HandleHit | null {
    const { scale, offX, offY } = proj();
    let best: HandleHit | null = null;
    let bestD = HIT_RADIUS_CSS;
    for (const s of strokes) {
      for (let i = 0; i < s.nodes.length; i++) {
        const p = s.nodes[i];
        const cssX = offX + (p.x - VB.x) * scale;
        const cssY = offY + (-p.y - VB.y) * scale;
        const d = Math.hypot(clientX - cssX, clientY - cssY);
        if (d < bestD) {
          bestD = d;
          best = { strokeId: s.id, nodeIndex: i, sx: cssX, sy: cssY };
        }
      }
    }
    return best;
  }

  function onPointerDown(ev: PointerEvent) {
    if (!params) return;
    const hit = hitHandle(ev.clientX, ev.clientY);
    if (!hit) {
      activeStrokeId = null;
      return;
    }
    ev.preventDefault();
    drag = { strokeId: hit.strokeId, nodeIndex: hit.nodeIndex };
    activeStrokeId = hit.strokeId;
    (ev.currentTarget as Element).setPointerCapture(ev.pointerId);
    applyDrag(ev);
  }

  function applyDrag(ev: PointerEvent) {
    if (!drag || !params) return;
    const em = toEm(ev.clientX, ev.clientY);
    const s = strokes.find((x) => x.id === drag!.strokeId);
    if (!s) return;
    const nodes = s.nodes.map((p, i) => (i === drag!.nodeIndex ? { x: em.x, y: em.y } : { ...p }));
    // 局部更新该笔：重建轮廓并锁定
    strokes = strokes.map((x) => {
      if (x.id !== s.id) return x;
      const draft: StrokeState = { ...x, nodes, manual: true, centerline: nodes.map((p) => ({ ...p })) };
      const ring = renderStroke({ ...draft, manual: false, poly: undefined }, params!);
      return { ...draft, poly: ring };
    });
    dirty = true;
  }

  function onPointerMove(ev: PointerEvent) {
    if (drag) {
      applyDrag(ev);
      return;
    }
    const em = toEm(ev.clientX, ev.clientY);
    cursorPos = em;
    const hit = hitHandle(ev.clientX, ev.clientY);
    hoverId = hit ? hit.strokeId : null;
  }

  function onPointerUp(ev: PointerEvent) {
    if (drag) {
      (ev.currentTarget as Element).releasePointerCapture?.(ev.pointerId);
      drag = null;
    }
  }

  function unlock(strokeId: string) {
    if (!params) return;
    strokes = strokes.map((s) => {
      if (s.id !== strokeId) return cloneS(s);
      return {
        ...cloneS(s),
        nodes: s.baseNodes.map((p) => ({ ...p })),
        manual: false,
        poly: undefined,
        centerline: undefined,
      };
    });
    dirty = true;
    studio.toast('info', '已撤销该笔的手工锁定，恢复参数化生成');
  }

  function unlockAll() {
    if (!params) return;
    strokes = strokes.map((s) => ({
      ...cloneS(s),
      nodes: s.baseNodes.map((p) => ({ ...p })),
      manual: false,
      poly: undefined,
      centerline: undefined,
    }));
    regen(params);
    studio.toast('info', '全部笔画已解除锁定');
  }

  const activeStroke = $derived(strokes.find((s) => s.id === activeStrokeId));

  const KIND_LABEL: Record<string, string> = {
    heng: '横', shu: '竖', pie: '撇', na: '捺', dian: '点', zhe: '折', gou: '钩', ti: '提',
  };

  const recsWithSkel = $derived(studio.records.filter((r) => getSkeleton(r.char)));
</script>

<div class="gen">
  <!-- 左：档案选择 + 参数 -->
  <aside class="left">
    <div class="lhead">
      <div>
        <div class="eyebrow">GENERATOR · 生成台</div>
        <h2 class="serif h">参数生成</h2>
      </div>
    </div>

    <div class="pick">
      <label class="lbl" for="g-pick">工作档案</label>
      <select id="g-pick" class="field" value={studio.editorId ?? ''} onchange={(e) => { studio.editorId = e.currentTarget.value; studio.saveUi(); }}>
        {#each recsWithSkel as r (r.id)}
          <option value={r.id}>{r.id} ·「{r.char}」{r.library} {r.weightName}</option>
        {/each}
      </select>
      {#if rec}
        <div class="pickmeta mono">
          <span>{rec.skeletonSource.kind}</span>
          <span>种子 {params?.seed}</span>
        </div>
      {/if}
    </div>

    <div class="scroll">
      {#if params}
        <div class="sect">
          <div class="sect-h">生成参数<button class="btn tiny" onclick={() => params && studio.records.length && resetParams()}>回到当前版本</button></div>
          <ParamControls {params} onChange={onParamChange} />
        </div>
      {/if}

      <div class="sect">
        <div class="sect-h">视图<button class="btn tiny" onclick={() => (showHandles = !showHandles)}>{showHandles ? '隐藏' : '显示'}端点</button></div>
        <label class="check">
          <input type="checkbox" bind:checked={overlayPrev} disabled={!prevVersion} />
          <span>叠加 {prevVersion?.label ?? '上一版'} 幽灵轮廓</span>
        </label>
      </div>

      {#if strokes.length}
        <div class="sect">
          <div class="sect-h">笔画 <em class="mono">{manualCount} / {strokes.length} 锁定</em></div>
          <div class="sl">
            {#each strokes as s (s.id)}
              <div
                class="srow"
                class:active={activeStrokeId === s.id}
                class:locked={s.manual}
                role="button"
                tabindex="0"
                onclick={() => (activeStrokeId = activeStrokeId === s.id ? null : s.id)}
                onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activeStrokeId = activeStrokeId === s.id ? null : s.id; } }}
                onmouseenter={() => (hoverId = s.id)}
                onmouseleave={() => (hoverId = null)}
              >
                <span class="sidx mono">{KIND_LABEL[s.kind]}</span>
                <span class="sid mono">{s.id.replace(/^\w+-/, '')}</span>
                <span class="snode mono">{s.nodes.length} 点</span>
                <span class="sflag">{s.manual ? '● 锁定' : '○ 参数'}</span>
                {#if s.manual}
                  <button
                    class="unlk"
                    onclick={(e) => { e.stopPropagation(); unlock(s.id); }}
                    title="撤销该笔手改"
                  >↺</button>
                {/if}
              </div>
            {/each}
          </div>
          {#if manualCount > 0}
            <button class="btn full sm unlockall" onclick={unlockAll}>全部解除锁定</button>
          {/if}
        </div>
      {/if}
    </div>
  </aside>

  <!-- 中：画布 -->
  <section class="stage-col">
    <div class="stbar">
      <div class="stbar-l">
        {#if rec}<span class="mono chipid">{rec.id}</span><span class="bigchar serif">{rec.char}</span>{/if}
        {#if dirty}<span class="dirty mono">● 未保存</span>{:else}<span class="clean mono">已与 {rec ? `v${rec.currentVersionId}` : ''} 一致</span>{/if}
      </div>
      <div class="stbar-r">
        {#if params}
          <span class="pmono mono">{TERMINAL_LABEL[params.terminal]} · {params.weight} · {Math.round(params.contrast * 100)}% · {params.slant}° · {params.corner}</span>
        {/if}
        {#if changedFingerprint}<span class="fpchange mono">指纹变化</span>{/if}
      </div>
    </div>

    <div class="canvas-wrap" class:dragging={!!drag}>
      <GlyphCanvas layers={layers} guides={true}>
        <svg
          class="handles"
          role="application"
          viewBox="-120 -1030 1240 1240"
          preserveAspectRatio="xMidYMid meet"
          bind:this={svgLayer}
          onpointerdown={onPointerDown}
          onpointermove={onPointerMove}
          onpointerup={onPointerUp}
          onpointercancel={onPointerUp}
          aria-label="笔画端点微调"
        >
          {#if overlayPrev && prevVersion}
            <g transform="scale(1,-1)" opacity="0.32">
              <path d={prevVersion.svgPath} fill="#a8402f" fill-rule="evenodd" />
            </g>
          {/if}
          {#if manualOutlines.length}
            <g class="lockoutlines" aria-hidden="true" transform="scale(1,-1)">
              {#each manualOutlines as d, i (i)}
                <path {d} fill="none" stroke="#b23a2b" stroke-width="3.4" stroke-opacity="0.85" stroke-linejoin="round" />
              {/each}
            </g>
          {/if}
          {#if showHandles && params}
            {#each strokes as s (s.id)}
              {@const isActive = s.id === activeStrokeId}
              {@const isHover = s.id === hoverId}
              <g class="sgrp" class:manual={s.manual} class:active={isActive} class:hover={isHover}>
                {#each s.nodes as p, i (i)}
                  {#if isActive || isHover || i === 0 || i === s.nodes.length - 1}
                    {@const q = toSvg(p.x, p.y)}
                    <circle
                      class="handle"
                      class:end={i === 0 || i === s.nodes.length - 1}
                      class:minor={!(isActive || isHover) && !(i === 0 || i === s.nodes.length - 1)}
                      cx={q.x}
                      cy={q.y}
                      r={isActive ? 10 : 7}
                    />
                  {/if}
                {/each}
                <polyline
                  class="cl"
                  points={s.nodes.map((p) => `${p.x},${-p.y}`).join(' ')}
                  fill="none"
                />
              </g>
            {/each}
          {/if}
        </svg>
        <div class="hintbar">
          {#if showHandles}
            <span class="mono">拖动端点 → 该笔自动锁定（朱色），再改参数时保持不动</span>
          {:else}
            <span class="mono">端点已隐藏</span>
          {/if}
        </div>
        {#if activeStroke}
          <div class="strokeinfo">
            <span class="mono">{activeStroke.id}</span>
            <span>{KIND_LABEL[activeStroke.kind]}</span>
            <span class="mono">{activeStroke.nodes.length} 节点</span>
            {#if activeStroke.manual}
              <span class="lockpill">已锁定</span>
              <button class="btn tiny" onclick={() => unlock(activeStroke.id)}>撤销手改</button>
            {:else}
              <span class="genpill">参数生成</span>
            {/if}
          </div>
        {/if}
      </GlyphCanvas>
    </div>

    <div class="commitbar">
      <div class="metricrow">
        <div class="m"><span>字面宽</span><strong class="mono">{composed.metrics?.inkWidth.toFixed(1) ?? '—'}</strong></div>
        <div class="m"><span>字面高</span><strong class="mono">{composed.metrics?.inkHeight.toFixed(1) ?? '—'}</strong></div>
        <div class="m"><span>重心 X</span><strong class="mono">{composed.metrics?.cogX.toFixed(1) ?? '—'}</strong></div>
        <div class="m"><span>重心 Y</span><strong class="mono">{composed.metrics?.cogY.toFixed(1) ?? '—'}</strong></div>
        <div class="m"><span>锁定</span><strong class="mono">{manualCount}/{strokes.length}</strong></div>
      </div>
      <div class="savearea">
        <input class="field notes" bind:value={note} placeholder={defaultNote()} aria-label="版本备注" />
        <button class="btn primary savebtn" class:flash={saveFlash} onclick={save} disabled={!dirty || !rec}>
          {saveFlash ? '✓ 已保存' : `保存为新版本 · v${(rec?.versions.length ?? 0) + 1}`}
        </button>
      </div>
    </div>
  </section>

  <!-- 右：实时规格 + 一致性校验 -->
  <aside class="right">
    <div class="rhead">
      <div class="eyebrow">CONSISTENCY · 一致性</div>
      <h3 class="serif">种子可复现校验</h3>
    </div>
    {#if params && skeleton && rec}
      <div class="fpbox">
        <div class="fpline"><span class="k">当前指纹</span><span class="v mono">{liveFingerprint}</span></div>
        <div class="fpline"><span class="k">基准版本</span><span class="v mono">{baseFingerprint}</span></div>
        <div class="fpstatus {changedFingerprint ? 'diff' : 'same'}">
          {#if changedFingerprint}
            <span>⚠ 与基准版本不一致</span>
          {:else}
            <span>✓ 与基准版本一致（同种子同参数）</span>
          {/if}
        </div>
      </div>

      <div class="verify">
        <button
          class="btn full sm"
          onclick={() => {
            if (!params || !skeleton || !rec) return;
            const a = generateGlyph({ char: rec.char, skeleton, params, previous: strokes.filter((s) => s.manual) });
            const b = generateGlyph({ char: rec.char, skeleton, params, previous: strokes.filter((s) => s.manual) });
            const same = a.fingerprint === b.fingerprint && a.path === b.path;
            studio.toast(same ? 'ok' : 'warn', same ? '两次生成结果完全一致（指纹与路径逐字相符）' : '检出一致性异常');
          }}
        >同种子连生两次，逐字比对</button>
        <p class="vnote">生成引擎为纯确定性：种子仅驱动 mulberry32 抖动序列，不依赖时间或随机源。</p>
      </div>
    {/if}

    {#if rec}
      <div class="rsec">
        <div class="rsec-h">版本轨迹</div>
        <div class="mini-v">
          {#each rec.versions as v (v.id)}
            <div class="mv" class:cur={v.id === rec.currentVersionId}>
              <span class="mv-l mono">{v.label}</span>
              <span class="mv-d mono">{v.createdAt.slice(5, 10)}</span>
              <span class="mv-lock mono">{v.lockedCount ? `锁${v.lockedCount}` : '—'}</span>
            </div>
          {/each}
          {#if dirty}
            <div class="mv pending"><span class="mv-l mono">v{(rec.versions.length ?? 0) + 1}</span><span class="mv-d">未保存</span></div>
          {/if}
        </div>
        <button class="btn full sm" onclick={() => { studio.select(rec.id); studio.setScreen('compare'); }}>两版并排比对</button>
      </div>
    {/if}

    <div class="rsec tip">
      <div class="rsec-h">手改保留规则</div>
      <p>
        拖动端点即锁定该笔轮廓快照（<span class="hl">poly</span>）。此后调整任何参数、换种子重新生成，锁定笔画始终按快照绘制；解锁后方回到参数化。
      </p>
    </div>
  </aside>
</div>

<style>
  .gen {
    display: grid;
    grid-template-columns: 306px minmax(0, 1fr) 286px;
    height: 100%;
    min-height: 0;
    background: var(--paper);
  }

  /* ---------- 左 ---------- */
  .left {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-right: 1px solid var(--rule);
    background: #f8f4ea;
  }
  .lhead {
    padding: 15px 15px 10px;
    border-bottom: 1px solid var(--rule-soft);
  }
  .h {
    margin: 3px 0 0;
    font-size: 19px;
    letter-spacing: 0.14em;
    font-weight: 600;
  }
  .pick {
    padding: 10px 14px;
    border-bottom: 1px solid var(--rule-soft);
  }
  .pickmeta {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 8.5px;
    color: var(--ink-faint);
    margin-top: 5px;
    letter-spacing: 0.04em;
  }
  .scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0 14px 20px;
  }
  .sect {
    padding: 12px 0 6px;
    border-bottom: 1px solid var(--rule-soft);
  }
  .sect:last-child {
    border-bottom: 0;
  }
  .sect-h {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    font-size: 10px;
    letter-spacing: 0.13em;
    color: var(--ink-faint);
    text-transform: uppercase;
    font-family: var(--mono);
    margin-bottom: 6px;
  }
  .sect-h em {
    font-style: normal;
    color: var(--cinnabar);
    letter-spacing: 0.04em;
  }
  .check {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    color: var(--ink-soft);
    padding: 3px 0;
  }
  .check input {
    accent-color: var(--cinnabar);
  }

  /* 笔画列表 */
  .sl {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .srow {
    display: grid;
    grid-template-columns: 18px 22px 1fr auto auto;
    align-items: center;
    gap: 6px;
    padding: 5px 6px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 2px;
    text-align: left;
    transition: background 0.12s;
  }
  .srow:hover {
    background: #f0ead9;
  }
  .srow.active {
    border-color: #cfc2a6;
    background: #fffdf6;
  }
  .srow.locked .sidx {
    color: var(--cinnabar);
  }
  .sidx {
    font-family: var(--serif);
    font-size: 12px;
    color: var(--ink-mute);
    text-align: center;
  }
  .sid {
    font-size: 8px;
    color: var(--ink-faint);
  }
  .snode {
    font-size: 8.5px;
    color: var(--ink-faint);
    text-align: right;
    margin-right: 2px;
  }
  .sflag {
    font-size: 8px;
    color: var(--ink-faint);
    letter-spacing: 0.03em;
  }
  .srow.locked .sflag {
    color: var(--cinnabar);
  }
  .unlk {
    border: 0;
    background: transparent;
    font-size: 11px;
    color: var(--ink-faint);
    padding: 0 2px;
    border-radius: 2px;
  }
  .unlk:hover {
    color: var(--cinnabar);
    background: var(--cinnabar-wash);
  }
  .unlockall {
    margin-top: 7px;
  }

  /* ---------- 中 ---------- */
  .stage-col {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    background: var(--paper-2);
  }
  .stbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 18px;
    border-bottom: 1px solid var(--rule);
    background: #f8f4ea;
    min-height: 42px;
  }
  .stbar-l {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .chipid {
    font-size: 9.5px;
    color: var(--ink-mute);
    background: #ece5d6;
    padding: 2px 6px;
    border-radius: 2px;
    border: 1px solid #ded4bf;
  }
  .bigchar {
    font-size: 22px;
    line-height: 1;
    font-weight: 600;
  }
  .dirty {
    font-size: 10px;
    color: var(--cinnabar);
    letter-spacing: 0.04em;
  }
  .clean {
    font-size: 10px;
    color: var(--jade);
    letter-spacing: 0.04em;
  }
  .stbar-r {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .pmono {
    font-size: 9px;
    color: var(--ink-faint);
    letter-spacing: 0.03em;
  }
  .fpchange {
    font-size: 8.5px;
    color: #a0661f;
    border: 1px solid #e0cda0;
    background: var(--ochre-wash);
    padding: 1px 5px;
    border-radius: 2px;
  }

  .canvas-wrap {
    flex: 1;
    min-height: 0;
    margin: 12px 16px 0;
    position: relative;
    border: 1px solid var(--rule);
    border-radius: 3px;
    overflow: hidden;
    box-shadow: var(--shadow);
    background: var(--card-raised);
  }
  .canvas-wrap.dragging {
    cursor: grabbing;
  }
  .handles {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
  }
  .handle {
    fill: #fdfaf1;
    stroke: #9b917c;
    stroke-width: 2.2;
    cursor: grab;
    transition: fill 0.12s, stroke 0.12s, r 0.12s;
  }
  .handle:hover,
  .sgrp.hover .handle {
    fill: #fff7e4;
    stroke: #6d6455;
  }
  .handle.minor {
    opacity: 0.55;
    r: 5;
  }
  .sgrp.active .handle.minor {
    opacity: 1;
  }
  .sgrp.manual .handle {
    stroke: var(--cinnabar);
    fill: #fbe8e2;
  }
  .sgrp.manual .handle.end {
    fill: var(--cinnabar);
    stroke: #8f2318;
  }
  .sgrp.active .handle {
    stroke: #1a1712;
    stroke-width: 2.6;
  }
  .sgrp.manual.active .handle {
    stroke: #8f2318;
  }
  .lockoutlines {
    pointer-events: none;
  }
  .cl {
    stroke: rgba(26, 23, 18, 0.16);
    stroke-width: 1.4;
    stroke-dasharray: 3 4;
    pointer-events: none;
  }
  .sgrp.manual .cl {
    stroke: rgba(173, 47, 34, 0.4);
  }
  .sgrp.active .cl {
    stroke: rgba(26, 23, 18, 0.6);
    stroke-dasharray: 2 3;
  }

  .hintbar {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(253, 249, 240, 0.92);
    border: 1px solid #e3d9c4;
    border-radius: 2px;
    padding: 3px 9px;
    z-index: 5;
    pointer-events: none;
    backdrop-filter: blur(2px);
  }
  .hintbar span {
    font-size: 9px;
    color: var(--ink-mute);
    letter-spacing: 0.02em;
  }
  .strokeinfo {
    position: absolute;
    bottom: 8px;
    left: 8px;
    display: flex;
    align-items: center;
    gap: 7px;
    background: rgba(253, 249, 240, 0.96);
    border: 1px solid #ddd3bd;
    border-radius: 2px;
    padding: 4px 8px;
    z-index: 5;
    font-size: 9.5px;
    color: var(--ink-soft);
  }
  .lockpill {
    background: var(--cinnabar-wash);
    color: var(--cinnabar);
    border: 1px solid #e2c1b8;
    padding: 0 5px;
    border-radius: 2px;
    font-size: 8.5px;
  }
  .genpill {
    background: #e8efe6;
    color: var(--jade);
    border: 1px solid #c6d6c8;
    padding: 0 5px;
    border-radius: 2px;
    font-size: 8.5px;
  }

  .commitbar {
    padding: 10px 16px 14px;
  }
  .metricrow {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1px;
    background: var(--rule-soft);
    border: 1px solid var(--rule-soft);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 9px;
  }
  .m {
    background: #fbf8f0;
    padding: 5px 9px;
  }
  .m span {
    display: block;
    font-size: 8px;
    letter-spacing: 0.09em;
    color: var(--ink-faint);
  }
  .m strong {
    font-size: 13px;
    font-weight: 500;
  }
  .savearea {
    display: flex;
    gap: 8px;
  }
  .field.notes {
    flex: 1;
    min-width: 0;
  }
  .savebtn {
    min-width: 164px;
    justify-content: center;
  }
  .savebtn.flash {
    background: var(--jade);
    border-color: var(--jade);
  }

  /* ---------- 右 ---------- */
  .right {
    border-left: 1px solid var(--rule);
    background: #f8f4ea;
    min-height: 0;
    overflow-y: auto;
    padding: 0 0 20px;
  }
  .rhead {
    padding: 15px 15px 10px;
    border-bottom: 1px solid var(--rule-soft);
  }
  .rhead h3 {
    margin: 3px 0 0;
    font-size: 15px;
    letter-spacing: 0.1em;
    font-weight: 600;
  }
  .fpbox {
    margin: 12px 14px 0;
    border: 1px solid var(--rule-soft);
    background: #fbf8f0;
    border-radius: 2px;
    padding: 9px 10px;
  }
  .fpline {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 6px;
    padding: 2px 0;
  }
  .fpline .k {
    font-size: 9px;
    color: var(--ink-faint);
    letter-spacing: 0.05em;
    white-space: nowrap;
  }
  .fpline .v {
    font-size: 10px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
  }
  .fpstatus {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px dashed #e2d9c6;
    font-size: 9.5px;
  }
  .fpstatus.same {
    color: var(--jade);
  }
  .fpstatus.diff {
    color: #a0661f;
  }
  .verify {
    margin: 10px 14px 0;
  }
  .vnote {
    margin: 7px 0 0;
    font-size: 9.5px;
    color: var(--ink-faint);
    line-height: 1.6;
  }

  .rsec {
    margin: 14px 14px 0;
    border-top: 1px solid var(--rule-soft);
    padding-top: 10px;
  }
  .rsec-h {
    font-size: 9.5px;
    letter-spacing: 0.13em;
    color: var(--ink-faint);
    font-family: var(--mono);
    text-transform: uppercase;
    margin-bottom: 7px;
  }
  .mini-v {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin-bottom: 8px;
  }
  .mv {
    display: grid;
    grid-template-columns: 26px 40px 1fr;
    align-items: center;
    padding: 3px 6px;
    border-left: 2px solid #d8ceb9;
    background: #fbf8f0;
    font-size: 9px;
    color: var(--ink-mute);
  }
  .mv.cur {
    border-left-color: var(--cinnabar);
    color: var(--ink);
  }
  .mv.pending {
    border-left-color: #d9a13b;
    color: #a0661f;
    font-style: italic;
  }
  .mv-lock {
    font-size: 8px;
    color: inherit;
    text-align: right;
  }
  .rsec.tip p {
    margin: 0;
    font-size: 10px;
    line-height: 1.75;
    color: var(--ink-mute);
  }
  .hl {
    font-family: var(--mono);
    color: var(--cinnabar);
    background: var(--cinnabar-wash);
    padding: 0 2px;
  }
</style>
