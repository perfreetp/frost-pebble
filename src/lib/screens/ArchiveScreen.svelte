<script lang="ts">
  import { studio, EMPTY_FILTERS } from '../store.svelte';
  import RecordList from '../components/RecordList.svelte';
  import GlyphCanvas from '../components/GlyphCanvas.svelte';
  import { ringsToPath } from '../geometry';
  import { INK_STYLE } from '../render/index';
  import DetailPanel from '../components/DetailPanel.svelte';
  import CreateDialog from '../components/CreateDialog.svelte';

  let showCreate = $state(false);

  const filtered = $derived(studio.filtered);
  const selected = $derived(studio.selected);
  const current = $derived(studio.currentVersion(selected));

  const layers = $derived.by(() => {
    if (!current) return [];
    return [{ polys: current.polys, style: INK_STYLE }];
  });

  /** 已锁定的手改笔画，用朱色轮廓标出 */
  const manualOutlines = $derived.by(() => {
    if (!current) return [] as string[];
    return current.strokes
      .filter((s) => s.manual && s.poly && s.poly.length >= 3)
      .map((s) => ringsToPath([[s.poly!]]));
  });

  function fpatch(p: Partial<typeof studio.filters>) {
    studio.filters = { ...studio.filters, ...p };
    studio.saveUi();
  }

  function resetFilters() {
    studio.filters = { ...EMPTY_FILTERS };
    studio.saveUi();
  }

  const dateBounds = $derived.by(() => {
    const dates = studio.records.map((r) => r.createdAt).sort();
    if (!dates.length) return { min: '', max: '' };
    return { min: dates[0].slice(0, 10), max: dates[dates.length - 1].slice(0, 10) };
  });

  const stats = $derived.by(() => {
    const libs = new Map<string, number>();
    const wts = new Map<string, number>();
    const sts = new Map<string, number>();
    for (const r of studio.records) {
      libs.set(r.library, (libs.get(r.library) ?? 0) + 1);
      wts.set(r.weightName, (wts.get(r.weightName) ?? 0) + 1);
      sts.set(r.status, (sts.get(r.status) ?? 0) + 1);
    }
    return { libs, wts, sts };
  });

  const LIBRARIES = ['点画宋', '玄墨黑', '朱记手楷'];
  const WEIGHTS = ['细体 300', '常规 400', '中黑 500', '粗黑 700'];
  const STATUSES = ['草稿', '修订中', '待审', '已归档'];

  const statusClass: Record<string, string> = {
    草稿: 'gray',
    待审: 'amber',
    修订中: 'blue',
    已归档: 'green',
  };

  function fmt(iso?: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
</script>

<div class="archive">
  <!-- 左：检索 -->
  <aside class="left">
    <div class="lhead">
      <div>
        <div class="eyebrow">ARCHIVE · 检索</div>
        <h2 class="serif h">字形档案</h2>
      </div>
      <button class="btn primary sm" onclick={() => (showCreate = true)}>
        <span class="plus">＋</span> 建档
      </button>
    </div>

    <div class="search">
      <svg viewBox="0 0 16 16" width="13" height="13" class="sic" aria-hidden="true">
        <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.4" />
        <line x1="10.4" y1="10.4" x2="14" y2="14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
      </svg>
      <input
        class="field"
        placeholder="编号 / 汉字 / 拼音 / 骨架来源"
        value={studio.filters.query}
        oninput={(e) => fpatch({ query: e.currentTarget.value })}
        aria-label="关键词检索"
      />
      {#if studio.filters.query}
        <button class="clr" onclick={() => fpatch({ query: '' })} aria-label="清空关键词">×</button>
      {/if}
    </div>

    <div class="filters">
      <div class="fgrid">
        <div class="f">
          <label class="lbl" for="f-lib">字库</label>
          <select id="f-lib" class="field" value={studio.filters.library} onchange={(e) => fpatch({ library: e.currentTarget.value })}>
            <option value="">全部字库</option>
            {#each LIBRARIES as lib (lib)}
              <option value={lib}>{lib}（{stats.libs.get(lib) ?? 0}）</option>
            {/each}
          </select>
        </div>
        <div class="f">
          <label class="lbl" for="f-wt">字重</label>
          <select id="f-wt" class="field" value={studio.filters.weightName} onchange={(e) => fpatch({ weightName: e.currentTarget.value })}>
            <option value="">全部字重</option>
            {#each WEIGHTS as w (w)}
              <option value={w}>{w}（{stats.wts.get(w) ?? 0}）</option>
            {/each}
          </select>
        </div>
        <div class="f">
          <label class="lbl" for="f-st">状态</label>
          <select id="f-st" class="field" value={studio.filters.status} onchange={(e) => fpatch({ status: e.currentTarget.value })}>
            <option value="">全部状态</option>
            {#each STATUSES as s (s)}
              <option value={s}>{s}（{stats.sts.get(s) ?? 0}）</option>
            {/each}
          </select>
        </div>
      </div>
      <div class="f dates">
        <label class="lbl" for="f-from">建档日期</label>
        <div class="drange">
          <input
            id="f-from"
            type="date"
            class="field mono"
            value={studio.filters.dateFrom}
            min={dateBounds.min || undefined}
            max={dateBounds.max || undefined}
            onchange={(e) => fpatch({ dateFrom: e.currentTarget.value })}
          />
          <span class="dash">—</span>
          <input
            type="date"
            class="field mono"
            value={studio.filters.dateTo}
            min={dateBounds.min || undefined}
            max={dateBounds.max || undefined}
            onchange={(e) => fpatch({ dateTo: e.currentTarget.value })}
            aria-label="建档日期止"
          />
        </div>
      </div>
      <div class="frow">
        <div class="count mono">
          命中 <strong>{filtered.length}</strong> / {studio.records.length}
        </div>
        {#if studio.activeFilterCount > 0}
          <button class="btn ghost tiny" onclick={resetFilters}>清除 {studio.activeFilterCount} 项筛选</button>
        {/if}
      </div>
    </div>

    <div class="listwrap">
      <RecordList records={filtered} selectedId={studio.selectedId} onselect={(id) => studio.select(id)} />
    </div>
  </aside>

  <!-- 中：大图 -->
  <section class="center">
    {#if selected && current}
      <div class="chead">
        <div class="chead-l">
          <div class="eyebrow">SPECIMEN · {selected.id}</div>
          <div class="chline">
            <h1 class="bigchar serif">{selected.char}</h1>
            <div class="chmeta">
              <div class="pinyin mono">{selected.pinyin}</div>
              <div class="chips">
                <span class="chip {statusClass[selected.status]}">{selected.status}</span>
                <span class="chip gray">{selected.library}</span>
                <span class="chip gray">{selected.weightName}</span>
                <span class="chip gray">v{selected.currentVersionId} / 共 {selected.versions.length} 版</span>
              </div>
            </div>
          </div>
        </div>
        <div class="chead-r">
          <button class="btn sm" onclick={() => { studio.editorId = selected.id; studio.setScreen('generate'); }}>进生成台</button>
          <button class="btn sm" onclick={() => { studio.select(selected.id); studio.setScreen('compare'); }}>版本比对</button>
          <button class="btn sm" onclick={() => { studio.select(selected.id); studio.setScreen('review'); }}>审稿</button>
          {#if selected.report}
            <button class="btn sm" onclick={() => studio.openReport(selected)}>字样报告</button>
          {/if}
        </div>
      </div>

      <div class="stage-wrap">
        <GlyphCanvas layers={layers} guides={true}>
          {#if manualOutlines.length}
            <svg class="lock-overlay" viewBox="-120 -1030 1240 1240" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <g transform="scale(1,-1)">
                {#each manualOutlines as d, i (i)}
                  <path {d} fill="none" stroke="#b23a2b" stroke-width="3.2" stroke-opacity="0.8" stroke-linejoin="round" />
                {/each}
              </g>
            </svg>
          {/if}
        </GlyphCanvas>
        <div class="stage-corner tl mono">EM 1000 · 字面框 1000×1000</div>
        <div class="stage-corner br mono">UPM 1000 · y↑</div>
        <div class="stage-legend">
          <span><i class="lg-ink"></i>字形轮廓</span>
          <span><i class="lg-base"></i>基线</span>
          <span><i class="lg-cap"></i>字面上下缘</span>
          {#if manualOutlines.length}<span><i class="lg-lock"></i>手改笔画</span>{/if}
        </div>
      </div>

      <div class="stage-foot">
        <div class="mstrip">
          <div class="ms"><span class="k">字面宽度</span><strong class="mono">{current.metrics.inkWidth.toFixed(1)}</strong><em>em</em></div>
          <div class="ms"><span class="k">字面高度</span><strong class="mono">{current.metrics.inkHeight.toFixed(1)}</strong><em>em</em></div>
          <div class="ms"><span class="k">重心 X</span><strong class="mono">{current.metrics.cogX.toFixed(1)}</strong><em>em</em></div>
          <div class="ms"><span class="k">重心 Y</span><strong class="mono">{current.metrics.cogY.toFixed(1)}</strong><em>em</em></div>
          <div class="ms"><span class="k">着墨率</span><strong class="mono">{Math.round(current.metrics.inkRatio * 100)}</strong><em>%</em></div>
          <div class="ms"><span class="k">锁定笔画</span><strong class="mono">{current.strokes.filter((s) => s.manual).length}</strong><em>/ {current.strokes.length}</em></div>
        </div>
      </div>
    {:else}
      <div class="no-sel">
        <div class="ns-mark serif">档</div>
        <p>从左侧选择一条字形档案查看样张与规格。</p>
        <button class="btn" onclick={() => (showCreate = true)}>新建档案</button>
      </div>
    {/if}
  </section>

  <!-- 右：档案详情 -->
  <aside class="right">
    {#if selected}
      <DetailPanel rec={selected} />
    {:else}
      <div class="rph">
        <div class="eyebrow">RECORD</div>
        <p>未选择档案。<br />档案编号规则：<span class="mono">GF-YYMM-NNNN</span></p>
      </div>
    {/if}
  </aside>
</div>

{#if showCreate}
  <CreateDialog onclose={() => (showCreate = false)} />
{/if}

<style>
  .archive {
    display: grid;
    grid-template-columns: 316px minmax(0, 1fr) 336px;
    height: 100%;
    min-height: 0;
    background: var(--paper);
  }

  /* ----------------------- 左栏 ----------------------- */
  .left {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-right: 1px solid var(--rule);
    background: #f8f4ea;
  }
  .lhead {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 15px 14px 11px;
    border-bottom: 1px solid var(--rule-soft);
  }
  .h {
    margin: 3px 0 0;
    font-size: 19px;
    letter-spacing: 0.14em;
    font-weight: 600;
  }
  .plus {
    font-size: 13px;
    margin-right: -2px;
  }
  .search {
    position: relative;
    padding: 10px 12px 8px;
  }
  .search .field {
    padding-left: 28px;
    padding-right: 24px;
  }
  .sic {
    position: absolute;
    left: 22px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ink-faint);
    pointer-events: none;
  }
  .clr {
    position: absolute;
    right: 19px;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    background: transparent;
    color: var(--ink-faint);
    font-size: 15px;
    line-height: 1;
    padding: 2px 4px;
  }
  .clr:hover {
    color: var(--ink);
  }

  .filters {
    padding: 2px 12px 9px;
    border-bottom: 1px solid var(--rule-soft);
  }
  .fgrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px 8px;
  }
  .fgrid .f:last-child {
    grid-column: span 2;
  }
  .f.dates {
    margin-top: 7px;
  }
  .drange {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .drange .field {
    flex: 1;
    min-width: 0;
    font-size: 10.5px;
    padding: 5px 4px;
    text-align: center;
  }
  .dash {
    color: var(--ink-faint);
    font-size: 10px;
  }
  .frow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 9px;
    gap: 8px;
  }
  .count {
    font-size: 10.5px;
    color: var(--ink-mute);
  }
  .count strong {
    color: var(--cinnabar);
    font-weight: 600;
    font-size: 12px;
  }
  .listwrap {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  /* ----------------------- 中栏 ----------------------- */
  .center {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    background: var(--paper-2);
  }
  .chead {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 13px 18px 10px;
    border-bottom: 1px solid var(--rule);
    background: #f8f4ea;
  }
  .chline {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 4px;
  }
  .bigchar {
    font-size: 38px;
    line-height: 1;
    margin: 0;
    letter-spacing: 0.02em;
    font-weight: 600;
  }
  .chmeta {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .pinyin {
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.16em;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .chead-r {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    justify-content: flex-end;
    max-width: 330px;
  }
  .stage-wrap {
    flex: 1;
    min-height: 0;
    margin: 14px 18px 0;
    border: 1px solid var(--rule);
    border-radius: 3px;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow);
    background: var(--card-raised);
  }
  .stage-corner {
    position: absolute;
    font-size: 8.5px;
    color: var(--ink-faint);
    letter-spacing: 0.08em;
    pointer-events: none;
  }
  .stage-corner.tl {
    top: 7px;
    left: 9px;
  }
  .stage-corner.br {
    bottom: 7px;
    right: 9px;
  }
  .lock-overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
  }
  .stage-legend {
    position: absolute;
    bottom: 6px;
    left: 9px;
    display: flex;
    gap: 12px;
    font-size: 9px;
    color: var(--ink-faint);
    pointer-events: none;
  }
  .stage-legend span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .stage-legend i {
    width: 12px;
    height: 2px;
    display: block;
  }
  .lg-ink {
    background: var(--ink);
    height: 6px !important;
    width: 7px !important;
    border-radius: 1px;
  }
  .lg-base {
    background: #b8443a;
  }
  .lg-cap {
    background: repeating-linear-gradient(90deg, #a99e88 0 3px, transparent 3px 6px);
  }
  .lg-lock {
    background: #b23a2b;
  }
  .stage-foot {
    padding: 11px 18px 14px;
  }
  .mstrip {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1px;
    background: var(--rule-soft);
    border: 1px solid var(--rule-soft);
    border-radius: 2px;
    overflow: hidden;
  }
  .ms {
    background: #fbf8f0;
    padding: 6px 9px;
    display: flex;
    align-items: baseline;
    gap: 4px;
    flex-wrap: wrap;
  }
  .ms .k {
    width: 100%;
    font-size: 8.5px;
    letter-spacing: 0.1em;
    color: var(--ink-faint);
  }
  .ms strong {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
  }
  .ms em {
    font-style: normal;
    font-size: 9px;
    color: var(--ink-faint);
  }

  .no-sel {
    margin: auto;
    text-align: center;
    color: var(--ink-mute);
  }
  .ns-mark {
    font-size: 46px;
    color: #d8cdb6;
    border: 1px dashed #d0c5ad;
    width: 84px;
    height: 84px;
    display: grid;
    place-items: center;
    margin: 0 auto 14px;
    border-radius: 2px;
  }
  .no-sel p {
    font-size: 12px;
    margin: 0 0 14px;
  }

  /* ----------------------- 右栏 ----------------------- */
  .right {
    border-left: 1px solid var(--rule);
    background: #f8f4ea;
    min-height: 0;
    overflow-y: auto;
  }
  .rph {
    padding: 22px 18px;
    color: var(--ink-faint);
    font-size: 11.5px;
    line-height: 1.8;
  }
</style>
