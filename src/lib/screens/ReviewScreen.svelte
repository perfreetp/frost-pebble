<script lang="ts">
  import { studio } from '../store.svelte';
  import GlyphCanvas from '../components/GlyphCanvas.svelte';
  import { INK_STYLE, GHOST_STYLE, type Layer } from '../render/index';
  import type { GlyphRecord, ReviewComment } from '../types';
  import { TERMINAL_LABEL } from '../generator';

  const rec = $derived(studio.selected);
  const version = $derived(studio.currentVersion(rec));

  let mode = $state<'review' | 'design'>('review');
  let tag = $state('结构');
  let author = $state('审稿 · 林岫');
  let draft = $state('');
  let pendingPoint = $state<{ x: number; y: number } | null>(null);
  let activeId = $state<string | null>(null);
  let filter = $state<'all' | 'pending' | 'done'>('all');
  let replyDraft = $state<Record<string, string>>({});

  const TAGS = ['结构', '笔画', '重心', '间距', '收笔', '一致性'];

  const layers = $derived.by<Layer[]>(() => (version ? [{ polys: version.polys, style: INK_STYLE }] : []));

  const comments = $derived(
    (rec?.comments ?? []).filter((c) => (filter === 'all' ? true : filter === 'pending' ? c.status === '待处理' : c.status === '已处理')),
  );
  const pendingCount = $derived((rec?.comments ?? []).filter((c) => c.status === '待处理').length);
  const doneCount = $derived((rec?.comments ?? []).filter((c) => c.status === '已处理').length);

  let svgLayer: SVGSVGElement | undefined = $state();
  const VB = { x: -120, y: -1030, w: 1240, h: 1240 };

  function proj() {
    const r = svgLayer!.getBoundingClientRect();
    const scale = Math.min(r.width / VB.w, r.height / VB.h);
    const offX = r.left + (r.width - VB.w * scale) / 2;
    const offY = r.top + (r.height - VB.h * scale) / 2;
    return { scale, offX, offY };
  }

  function onClickCanvas(ev: PointerEvent) {
    if (!rec || mode !== 'review') return;
    const { scale, offX, offY } = proj();
    const vx = VB.x + (ev.clientX - offX) / scale;
    const vy = VB.y + (ev.clientY - offY) / scale;
    pendingPoint = { x: Math.round(vx * 10) / 10, y: Math.round(-vy * 10) / 10 };
    activeId = null;
  }

  function submitPoint() {
    if (!rec || !pendingPoint || !draft.trim()) return;
    studio.addComment(rec, { x: pendingPoint.x, y: pendingPoint.y, tag, body: draft.trim(), author });
    draft = '';
    pendingPoint = null;
  }

  function cancelPoint() {
    pendingPoint = null;
    draft = '';
  }

  function submitReply(c: ReviewComment) {
    if (!rec) return;
    const text = (replyDraft[c.id] ?? '').trim();
    if (!text) return;
    studio.replyComment(rec, c.id, text);
    replyDraft = { ...replyDraft, [c.id]: '' };
  }

  const statusCls: Record<string, string> = { 草稿: 'gray', 待审: 'amber', 修订中: 'blue', 已归档: 'green' };

  function fmt(iso: string) {
    return iso.slice(0, 16).replace('T', ' ');
  }

  const commentNumbers = $derived.by(() => {
    const m = new Map<string, number>();
    (rec?.comments ?? []).forEach((c, i) => m.set(c.id, i + 1));
    return m;
  });

  const totalInRecord = $derived((rec?.comments ?? []).length);
</script>

<div class="review">
  <!-- 顶部 -->
  <header class="rv-head">
    <div class="rv-l">
      <div class="eyebrow">REVIEW · 审稿归档</div>
      <div class="hrow">
        <select
          class="field pickrec"
          value={studio.selectedId ?? ''}
          onchange={(e) => studio.select(e.currentTarget.value)}
          aria-label="选择档案"
        >
          {#each studio.records as r (r.id)}
            <option value={r.id}>{r.id} ·「{r.char}」{r.library} {r.weightName} · {r.status}</option>
          {/each}
        </select>
        {#if rec}
          <span class="chip {statusCls[rec.status]}">{rec.status}</span>
          <span class="chip gray">v{rec.currentVersionId}</span>
        {/if}
      </div>
    </div>

    <div class="modeswitch" role="tablist" aria-label="工作模式">
      <button class="ms" class:on={mode === 'review'} role="tab" aria-selected={mode === 'review'} onclick={() => (mode = 'review')}>
        <span class="ms-i">审</span><span class="ms-t">审稿人<em>打点写意见</em></span>
      </button>
      <button class="ms" class:on={mode === 'design'} role="tab" aria-selected={mode === 'design'} onclick={() => (mode = 'design')}>
        <span class="ms-i">设</span><span class="ms-t">设计员<em>逐条回复处理</em></span>
      </button>
    </div>

    <div class="rv-r">
      <div class="mini-stats">
        <div class="mst"><span class="k mono">待处理</span><b class="v mono pend">{pendingCount}</b></div>
        <div class="mst"><span class="k mono">已处理</span><b class="v mono done">{doneCount}</b></div>
      </div>
      {#if rec}
        {#if rec.status === '已归档'}
          <button class="btn sm" onclick={() => studio.openReport(rec)}>字样报告</button>
        {:else}
          <button class="btn accent sm" disabled={pendingCount > 0} onclick={() => studio.archive(rec)}>验收归档</button>
        {/if}
      {/if}
    </div>
  </header>

  <div class="rv-body">
    {#if !rec || !version}
      <div class="empty">选择一条档案开始审稿。</div>
    {:else}
      <!-- 左：字面 + 打点 -->
      <section class="canvascol">
        <div class="cc-head">
          <div class="cch-l">
            <span class="big serif">{rec.char}</span>
            <div>
              <div class="mono rid">{rec.id} · {version.label}</div>
              <div class="mono rpp">{TERMINAL_LABEL[version.params.terminal]} · 重{version.params.weight} · 种子 {version.params.seed}</div>
            </div>
          </div>
          <div class="cch-r">
            {#if mode === 'review'}
              <span class="modehint">点击字面任意位置打点</span>
            {:else}
              <span class="modehint">点选定位标记查看意见</span>
            {/if}
          </div>
        </div>
        <div class="canvas-wrap" class:reviewable={mode === 'review'}>
          <GlyphCanvas layers={layers} guides={true}>
            <svg
              class="pins"
              role="application"
              viewBox="-120 -1030 1240 1240"
              preserveAspectRatio="xMidYMid meet"
              bind:this={svgLayer}
              onpointerdown={onClickCanvas}
              aria-label="审稿打点画布"
            >
              {#each rec.comments as c (c.id)}
                {@const isAct = c.id === activeId}
                <g
                  class="pin"
                  class:done={c.status === '已处理'}
                  class:act={isAct}
                  role="button"
                  tabindex="0"
                  transform={`translate(${c.x},${-c.y})`}
                  onpointerdown={(e) => { e.stopPropagation(); activeId = c.id; pendingPoint = null; }}
                  onkeydown={(e) => { if (e.key === 'Enter') { activeId = c.id; pendingPoint = null; } }}
                >
                  <circle r="19" class="pin-halo" />
                  <circle r="14" class="pin-dot" />
                  <text class="pin-n" text-anchor="middle" y="5.2">{commentNumbers.get(c.id)}</text>
                </g>
              {/each}
              {#if pendingPoint}
                <g class="pin draft" transform={`translate(${pendingPoint.x},${-pendingPoint.y})`}>
                  <circle r="20" class="pin-halo" />
                  <circle r="15" class="pin-dot" />
                  <text class="pin-n" text-anchor="middle" y="5.5">+</text>
                </g>
              {/if}
            </svg>
          </GlyphCanvas>
          {#if activeId}
            {@const act = rec.comments.find((c) => c.id === activeId)}
            {#if act}
              <div class="callout">
                <div class="co-top">
                  <span class="co-n mono">#{commentNumbers.get(act.id)}</span>
                  <span class="chip gray tiny">{act.tag}</span>
                  <span class="chip {act.status === '已处理' ? 'green' : 'amber'} tiny">{act.status}</span>
                  <span class="co-pos mono">({Math.round(act.x)}, {Math.round(act.y)})</span>
                  <button class="co-x" onclick={() => (activeId = null)} aria-label="关闭">×</button>
                </div>
                <p class="co-body">{act.body}</p>
                <div class="co-by mono">{act.author} · {fmt(act.createdAt)}</div>
                {#if act.replies.length}
                  <div class="co-replies">
                    {#each act.replies as r, k (k)}
                      <div class="co-reply"><span class="cby">{r.author}</span>{r.body}</div>
                    {/each}
                  </div>
                {/if}
                {#if act.status === '待处理' && mode === 'design'}
                  <div class="co-act">
                    <input class="field" placeholder="回复该条意见…" bind:value={replyDraft[act.id]} />
                    <button class="btn sm" onclick={() => submitReply(act)}>回复</button>
                  </div>
                {/if}
                <div class="co-act">
                  {#if act.status === '待处理' && mode === 'design'}
                    <button class="btn sm primary" onclick={() => studio.resolveComment(rec, act.id)}>标记已处理</button>
                  {:else if act.status === '已处理' && mode === 'design'}
                    <button class="btn sm ghost" onclick={() => studio.reopenComment(rec, act.id)}>重新打开</button>
                  {/if}
                </div>
              </div>
            {/if}
          {/if}
          {#if mode === 'review'}
            <div class="pin-count mono">{totalInRecord} 条意见 · {pendingCount} 待处理</div>
          {/if}
        </div>
      </section>

      <!-- 中/右：意见列表 + 输入 -->
      <section class="sidecol">
        {#if mode === 'review'}
          <div class="compose card">
            <div class="cmp-h">
              <span class="eyebrow">NEW COMMENT</span>
              <span class="mono pt">{pendingPoint ? `定位 (${Math.round(pendingPoint.x)}, ${Math.round(pendingPoint.y)})` : '未定位'}</span>
            </div>
            <div class="tagrow">
              {#each TAGS as t (t)}
                <button class="tagbtn" class:on={tag === t} onclick={() => (tag = t)}>{t}</button>
              {/each}
            </div>
            <div class="tagrow">
              <input class="field" bind:value={author} aria-label="署名" />
            </div>
            <textarea
              class="field"
              rows="3"
              placeholder={pendingPoint ? '在此写下对该处字面的意见…' : '先在左侧字面上点击打点，再写意见。'}
              bind:value={draft}
              disabled={!pendingPoint}
            ></textarea>
            <div class="cp-actions">
              {#if pendingPoint}
                <button class="btn ghost sm" onclick={cancelPoint}>取消定位</button>
                <button class="btn primary sm" onclick={submitPoint} disabled={!draft.trim()}>记录意见</button>
              {:else}
                <span class="cp-hint mono">在字面上点击即可定位</span>
              {/if}
            </div>
          </div>
        {:else}
          <div class="compose card designhint">
            <div class="cmp-h"><span class="eyebrow">DESIGNER VIEW</span></div>
            <p>逐条查看下方意见，在意见里填写处理说明后点「标记已处理」。全部处理后即可验收归档并生成字样报告。</p>
            <div class="prog">
              <div class="prog-bar"><span style:width={`${doneCount + pendingCount === 0 ? 0 : (doneCount / (doneCount + pendingCount)) * 100}%`}></span></div>
              <span class="mono">{doneCount} / {doneCount + pendingCount} 已处理</span>
            </div>
          </div>
        {/if}

        <div class="listhead">
          <span class="lh-t">意见清单</span>
          <div class="lfilter">
            <button class:on={filter === 'all'} onclick={() => (filter = 'all')}>全部 {totalInRecord}</button>
            <button class:on={filter === 'pending'} onclick={() => (filter = 'pending')}>待处理 {pendingCount}</button>
            <button class:on={filter === 'done'} onclick={() => (filter = 'done')}>已处理 {doneCount}</button>
          </div>
        </div>

        <div class="clist">
          {#each comments as c (c.id)}
            {@const n = commentNumbers.get(c.id)}
            <div
              class="ccard"
              class:sel={activeId === c.id}
              class:done={c.status === '已处理'}
              role="button"
              tabindex="0"
              onclick={() => { activeId = activeId === c.id ? null : c.id; pendingPoint = null; }}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activeId = activeId === c.id ? null : c.id; pendingPoint = null; } }}
            >
              <div class="cc-top">
                <span class="cc-n mono">{n}</span>
                <span class="chip gray tiny">{c.tag}</span>
                <span class="chip {c.status === '已处理' ? 'green' : 'amber'} tiny">{c.status}</span>
                <span class="cc-pos mono">{Math.round(c.x)}, {Math.round(c.y)}</span>
              </div>
              <p class="cc-body">{c.body}</p>
              <div class="cc-by mono">{c.author} · {fmt(c.createdAt).slice(0, 10)}</div>
              {#if c.replies.length}
                <div class="cc-rnum mono">↳ {c.replies.length} 条回复</div>
              {/if}
              {#if mode === 'design' && c.status === '待处理'}
                <div class="cc-quick">
                  <input
                    class="field quick"
                    placeholder="填写处理说明…"
                    value={replyDraft[c.id] ?? ''}
                    oninput={(e) => (replyDraft = { ...replyDraft, [c.id]: e.currentTarget.value })}
                    onclick={(e) => e.stopPropagation()}
                  />
                  <button
                    class="btn tiny"
                    onclick={(e) => {
                      e.stopPropagation();
                      const txt = (replyDraft[c.id] ?? '').trim();
                      if (!txt) return;
                      studio.replyComment(rec, c.id, txt);
                      replyDraft = { ...replyDraft, [c.id]: '' };
                    }}
                  >回复</button>
                </div>
              {/if}
            </div>
          {/each}
          {#if !comments.length}
            <div class="no-c">该筛选下暂无意见。</div>
          {/if}
        </div>

        {#if mode === 'design' && pendingCount === 0 && rec.comments.length > 0 && rec.status !== '已归档'}
          <div class="archive-ready">
            <span class="mono">✓ 全部意见已处理</span>
            <button class="btn accent sm" onclick={() => studio.archive(rec)}>验收归档 · 生成字样报告</button>
          </div>
        {/if}
        {#if rec.status === '已归档'}
          <div class="archived-note">
            <span class="mono">已归档 · {rec.archivedAt?.slice(0, 10)}</span>
            <button class="btn sm" onclick={() => studio.openReport(rec)}>查看字样报告</button>
          </div>
        {/if}
      </section>
    {/if}
  </div>
</div>

<style>
  .review {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: var(--paper);
  }

  .rv-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 18px;
    background: #f8f4ea;
    border-bottom: 1px solid var(--rule);
    flex-wrap: wrap;
  }
  .hrow {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 4px;
  }
  .pickrec {
    width: 290px;
    font-size: 11px;
  }

  .modeswitch {
    display: flex;
    border: 1px solid var(--rule);
    border-radius: 3px;
    overflow: hidden;
    background: #fffdf6;
  }
  .ms {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 13px 5px 9px;
    background: transparent;
    border: 0;
    border-right: 1px solid var(--rule-soft);
    transition: background 0.14s;
  }
  .ms:last-child {
    border-right: 0;
  }
  .ms-i {
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border-radius: 2px;
    background: #ece5d6;
    font-family: var(--serif);
    font-size: 13px;
    color: var(--ink-mute);
  }
  .ms.on {
    background: var(--ink);
  }
  .ms.on .ms-i {
    background: rgba(255, 255, 255, 0.14);
    color: #f6f1e3;
  }
  .ms-t {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-size: 11.5px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
  }
  .ms.on .ms-t {
    color: #f6f1e3;
  }
  .ms-t em {
    font-style: normal;
    font-size: 8.5px;
    color: var(--ink-faint);
    letter-spacing: 0.04em;
  }
  .ms.on .ms-t em {
    color: rgba(246, 241, 227, 0.55);
  }

  .rv-r {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .mini-stats {
    display: flex;
    gap: 12px;
  }
  .mst {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .mst .k {
    font-size: 8px;
    letter-spacing: 0.1em;
    color: var(--ink-faint);
  }
  .mst .v {
    font-size: 16px;
    line-height: 1;
  }
  .mst .v.pend {
    color: var(--cinnabar);
  }
  .mst .v.done {
    color: var(--jade);
  }

  .rv-body {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(330px, 1fr);
    gap: 0;
  }

  /* 左 */
  .canvascol {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 12px 14px 14px 16px;
    background: var(--paper-2);
  }
  .cc-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 9px;
  }
  .cch-l {
    display: flex;
    align-items: center;
    gap: 11px;
  }
  .big {
    font-size: 26px;
    line-height: 1;
    font-weight: 600;
  }
  .rid {
    font-size: 9.5px;
    color: var(--ink-mute);
  }
  .rpp {
    font-size: 8.5px;
    color: var(--ink-faint);
    margin-top: 2px;
  }
  .modehint {
    font-size: 9.5px;
    color: var(--ink-mute);
  }
  .canvas-wrap {
    flex: 1;
    min-height: 0;
    position: relative;
    border: 1px solid var(--rule);
    border-radius: 3px;
    overflow: hidden;
    box-shadow: var(--shadow);
    background: var(--card-raised);
  }
  .canvas-wrap.reviewable {
    cursor: crosshair;
  }
  .pins {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
  }
  .pin {
    cursor: pointer;
  }
  .pin-halo {
    fill: rgba(217, 161, 59, 0.14);
    stroke: rgba(200, 138, 40, 0.4);
    stroke-width: 1.5;
    transition: fill 0.14s;
  }
  .pin-dot {
    fill: #fdfaf2;
    stroke: #b47a18;
    stroke-width: 2.4;
    transition: r 0.14s;
  }
  .pin-n {
    fill: #96611a;
    font-family: var(--mono);
    font-size: 16px;
    font-weight: 700;
    pointer-events: none;
  }
  .pin.done .pin-dot {
    fill: #eef4ee;
    stroke: var(--jade);
  }
  .pin.done .pin-n {
    fill: var(--jade);
  }
  .pin.done .pin-halo {
    fill: rgba(63, 107, 81, 0.14);
    stroke: rgba(63, 107, 81, 0.45);
  }
  .pin.act .pin-dot {
    fill: #fff4ef;
    stroke: var(--cinnabar);
    stroke-width: 3;
  }
  .pin.act .pin-n {
    fill: var(--cinnabar);
  }
  .pin.act .pin-halo {
    fill: rgba(173, 47, 34, 0.16);
    stroke: rgba(173, 47, 34, 0.8);
  }
  .pin:hover .pin-dot {
    stroke: #7d5210;
    stroke-width: 3;
  }
  .pin.draft .pin-dot {
    fill: #f3e2c4;
    stroke: #a0661f;
    stroke-dasharray: 4 3;
  }
  .pin.draft .pin-n {
    fill: #a0661f;
  }
  .pin-count {
    position: absolute;
    left: 9px;
    bottom: 8px;
    font-size: 8.5px;
    color: var(--ink-faint);
    z-index: 4;
    pointer-events: none;
    background: rgba(253, 249, 240, 0.9);
    padding: 2px 6px;
    border-radius: 2px;
    border: 1px solid #e5dcc9;
  }

  .callout {
    position: absolute;
    z-index: 8;
    right: 10px;
    top: 10px;
    width: 250px;
    background: #fdfaf2;
    border: 1px solid #d8c9ab;
    border-radius: 3px;
    box-shadow: var(--shadow-lg);
    padding: 8px 10px;
    animation: rise 0.16s ease-out;
  }
  .co-top {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }
  .co-n {
    font-size: 11px;
    font-weight: 700;
    color: var(--cinnabar);
  }
  .co-pos {
    margin-left: auto;
    font-size: 8px;
    color: var(--ink-faint);
  }
  .co-x {
    border: 0;
    background: transparent;
    font-size: 14px;
    line-height: 1;
    color: var(--ink-faint);
    padding: 0 2px;
  }
  .co-x:hover {
    color: var(--ink);
  }
  .co-body {
    margin: 6px 0 4px;
    font-size: 11px;
    line-height: 1.65;
    color: var(--ink-soft);
  }
  .co-by {
    font-size: 8.5px;
    color: var(--ink-faint);
  }
  .co-replies {
    margin-top: 6px;
    border-top: 1px dashed #e2d9c6;
    padding-top: 5px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .co-reply {
    font-size: 10px;
    line-height: 1.55;
    color: var(--ink-soft);
  }
  .cby {
    color: var(--cinnabar);
    font-size: 9px;
    margin-right: 5px;
  }
  .co-act {
    display: flex;
    gap: 4px;
    margin-top: 6px;
  }
  .co-act .field {
    flex: 1;
    min-width: 0;
    font-size: 10.5px;
    padding: 4px 7px;
  }

  /* 右 */
  .sidecol {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-left: 1px solid var(--rule);
    background: #f8f4ea;
    padding: 12px 14px 14px;
    gap: 9px;
  }
  .compose {
    padding: 10px 11px;
    background: #fbf8f0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .cmp-h {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .pt {
    font-size: 8.5px;
    color: var(--ink-faint);
  }
  .tagrow {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  .tagbtn {
    padding: 2px 8px;
    border: 1px solid var(--rule-soft);
    background: #fffdf6;
    border-radius: 2px;
    font-size: 10px;
    color: var(--ink-mute);
  }
  .tagbtn:hover {
    border-color: #bfb299;
    color: var(--ink);
  }
  .tagbtn.on {
    background: var(--ink);
    border-color: var(--ink);
    color: #f6f1e3;
  }
  .tagrow .field {
    font-size: 10.5px;
    padding: 4px 8px;
  }
  textarea.field {
    font-size: 11px;
    min-height: 66px;
  }
  .cp-actions {
    display: flex;
    justify-content: flex-end;
    gap: 5px;
    align-items: center;
  }
  .cp-hint {
    font-size: 9px;
    color: var(--ink-faint);
    margin-right: auto;
  }
  .designhint p {
    margin: 0;
    font-size: 10.5px;
    line-height: 1.7;
    color: var(--ink-mute);
  }
  .prog {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .prog-bar {
    flex: 1;
    height: 4px;
    background: #e3dac6;
    border-radius: 2px;
    overflow: hidden;
  }
  .prog-bar span {
    display: block;
    height: 100%;
    background: var(--jade);
    transition: width 0.3s;
  }
  .prog .mono {
    font-size: 9px;
    color: var(--ink-mute);
    white-space: nowrap;
  }

  .listhead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 2px;
    gap: 6px;
    flex-wrap: wrap;
  }
  .lh-t {
    font-size: 10px;
    letter-spacing: 0.12em;
    font-family: var(--mono);
    color: var(--ink-faint);
    text-transform: uppercase;
  }
  .lfilter {
    display: flex;
    gap: 2px;
  }
  .lfilter button {
    padding: 2px 7px;
    border: 1px solid transparent;
    background: transparent;
    font-size: 9.5px;
    color: var(--ink-mute);
    border-radius: 2px;
  }
  .lfilter button:hover {
    background: rgba(26, 23, 18, 0.05);
  }
  .lfilter button.on {
    border-color: var(--rule);
    background: #fffdf6;
    color: var(--ink);
    font-weight: 500;
  }

  .clist {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-right: 2px;
  }
  .ccard {
    display: block;
    width: 100%;
    text-align: left;
    background: #fdfaf3;
    border: 1px solid #e6dcc8;
    border-left: 2px solid #d9a13b;
    border-radius: 2px;
    padding: 7px 9px;
    transition: all 0.12s;
  }
  .ccard:hover {
    background: #fffdf6;
    border-color: #d3c5a9;
  }
  .ccard.sel {
    box-shadow: 0 0 0 2px rgba(173, 47, 34, 0.16);
    border-color: #d3b9a2;
  }
  .ccard.done {
    border-left-color: var(--jade);
    opacity: 0.9;
  }
  .cc-top {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }
  .cc-n {
    font-size: 10px;
    font-weight: 700;
    color: var(--cinnabar);
    min-width: 14px;
  }
  .ccard.done .cc-n {
    color: var(--jade);
  }
  .cc-pos {
    margin-left: auto;
    font-size: 8px;
    color: var(--ink-faint);
  }
  .cc-body {
    margin: 5px 0 3px;
    font-size: 10.5px;
    line-height: 1.6;
    color: var(--ink-soft);
  }
  .cc-by {
    font-size: 8px;
    color: var(--ink-faint);
  }
  .cc-rnum {
    margin-top: 3px;
    font-size: 8.5px;
    color: var(--jade);
  }
  .cc-quick {
    display: flex;
    gap: 4px;
    margin-top: 6px;
  }
  .field.quick {
    flex: 1;
    min-width: 0;
    padding: 3px 7px;
    font-size: 10px;
  }
  .no-c {
    font-size: 10.5px;
    color: var(--ink-faint);
    padding: 14px 4px;
  }

  .archive-ready,
  .archived-note {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 2px;
    border: 1px solid #c7d8c9;
    background: #f0f6ef;
  }
  .archive-ready .mono {
    font-size: 9.5px;
    color: var(--jade);
  }
  .archived-note {
    border-color: #cdd8c4;
    background: #eef3ea;
  }
  .archived-note .mono {
    font-size: 9.5px;
    color: var(--jade);
  }

  .empty {
    margin: auto;
    color: var(--ink-faint);
    font-size: 12px;
  }
</style>
