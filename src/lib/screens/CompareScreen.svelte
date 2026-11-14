<script lang="ts">
  import { studio } from '../store.svelte';
  import GlyphCanvas from '../components/GlyphCanvas.svelte';
  import { INK_STYLE, GHOST_STYLE, type Layer } from '../render/index';
  import { diffVersions, fmtNum } from '../compare';
  import { TERMINAL_LABEL } from '../generator';
  import type { GlyphVersion } from '../types';

  const rec = $derived(studio.selected);
  const versions = $derived(rec?.versions ?? []);
  const A = $derived(versions.find((v) => v.id === studio.compareA) ?? versions[0]);
  const B = $derived(versions.find((v) => v.id === studio.compareB) ?? versions[versions.length - 1]);
  const rows = $derived(A && B ? diffVersions(A, B) : []);
  const flagged = $derived(rows.filter((r) => r.flagged));

  let overlay = $state(true);
  let showDiff = $state(true);

  const layerA = $derived.by<Layer[]>(() => (A ? [{ polys: A.polys, style: INK_STYLE }] : []));
  const layerB = $derived.by<Layer[]>(() => (B ? [{ polys: B.polys, style: INK_STYLE }] : []));
  const overlayLayers = $derived.by<Layer[]>(() => {
    if (!A || !B) return [];
    return [
      { polys: A.polys, style: GHOST_STYLE },
      { polys: B.polys, style: INK_STYLE },
    ];
  });

  function fmtDate(iso: string) {
    return iso.slice(0, 10);
  }

  function ensureSel() {
    if (!rec) return;
    if (!versions.some((v) => v.id === studio.compareA)) studio.compareA = versions[0]?.id ?? null;
    if (!versions.some((v) => v.id === studio.compareB)) studio.compareB = versions[versions.length - 1]?.id ?? null;
  }
  $effect(() => {
    rec;
    ensureSel();
  });

  function swap() {
    const a = studio.compareA;
    studio.compareA = studio.compareB;
    studio.compareB = a;
  }

  const recs = $derived(studio.records.filter((r) => r.versions.length >= 1));
  const skelKind = $derived(rec?.skeletonSource.kind ?? '');
</script>

<div class="cmp">
  <!-- 顶部控制 -->
  <header class="cmp-head">
    <div class="hl">
      <div class="eyebrow">COMPARE · 版本比对</div>
      <div class="hrow">
        <select
          class="field pickrec"
          value={studio.selectedId ?? ''}
          onchange={(e) => {
            studio.select(e.currentTarget.value);
            studio.setScreen('compare');
          }}
          aria-label="选择档案"
        >
          {#each recs as r (r.id)}
            <option value={r.id}>{r.id} ·「{r.char}」{r.library} {r.weightName} · {r.versions.length} 版</option>
          {/each}
        </select>
        {#if rec}
          <div class="title">
            <span class="big serif">{rec.char}</span>
            <span class="sub mono">{rec.pinyin} · {skelKind}</span>
          </div>
        {/if}
      </div>
    </div>

    <div class="vs-pick">
      <div class="vp">
        <label class="lbl" for="vp-a">左版 A</label>
        <select id="vp-a" class="field" value={A?.id ?? ''} onchange={(e) => studio.setCompare('a', +e.currentTarget.value)}>
          {#each versions as v (v.id)}
            <option value={v.id}>{v.label} · {fmtDate(v.createdAt)}{v.lockedCount ? ` · 锁${v.lockedCount}` : ''}</option>
          {/each}
        </select>
      </div>
      <button class="btn ghost sm swap" onclick={swap} title="交换左右">⇄</button>
      <div class="vp">
        <label class="lbl" for="vp-b">右版 B</label>
        <select id="vp-b" class="field" value={B?.id ?? ''} onchange={(e) => studio.setCompare('b', +e.currentTarget.value)}>
          {#each versions as v (v.id)}
            <option value={v.id}>{v.label} · {fmtDate(v.createdAt)}{v.lockedCount ? ` · 锁${v.lockedCount}` : ''}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="controls">
      <label class="chk"><input type="checkbox" bind:checked={showDiff} /> 差异标注</label>
      <label class="chk"><input type="checkbox" bind:checked={overlay} /> 叠加</label>
    </div>
  </header>

  <!-- 三栏：A | 叠加 | B -->
  <div class="cmp-body">
    {#if !rec || !A || !B}
      <div class="empty">选择一条至少有两版的档案进行比对。</div>
    {:else}
      <div class="panes">
        <div class="pane">
          <div class="pane-h">
            <span class="pl mono">{A.label}</span>
            <span class="pd mono">{fmtDate(A.createdAt)}</span>
          </div>
          <div class="pane-canvas">
            <GlyphCanvas layers={layerA} guides={true} />
          </div>
          <div class="pane-f">
            <div class="pf"><span>字面宽</span><b class="mono">{fmtNum(A.metrics.inkWidth, 1)}</b></div>
            <div class="pf"><span>重心</span><b class="mono">{fmtNum(A.metrics.cogX, 0)},{fmtNum(A.metrics.cogY, 0)}</b></div>
            <div class="pf"><span>锁定</span><b class="mono">{A.lockedCount}</b></div>
          </div>
        </div>

        <div class="pane mid">
          <div class="pane-h">
            <span class="pl mono">叠加对照</span>
            <span class="pd mono">A 幽灵 / B 实墨</span>
          </div>
          <div class="pane-canvas">
            {#if overlay}
              <GlyphCanvas layers={overlayLayers} guides={true} />
            {:else}
              <div class="halves">
                <div class="half"><GlyphCanvas layers={layerA} guides={false} /></div>
                <div class="half"><GlyphCanvas layers={layerB} guides={false} /></div>
              </div>
            {/if}
            {#if showDiff && flagged.length}
              <div class="diff-note">
                <span class="dn-tag">超差 {flagged.length} 项</span>
                <span class="mono">|Δ| &gt; 3%：{flagged.map((f) => f.label).join('、')}</span>
              </div>
            {/if}
          </div>
          <div class="pane-f mid-f">
            <span class="mono legend"><i class="sw a"></i>A {A.label}</span>
            <span class="mono legend"><i class="sw b"></i>B {B.label}</span>
          </div>
        </div>

        <div class="pane">
          <div class="pane-h">
            <span class="pl mono">{B.label}</span>
            <span class="pd mono">{fmtDate(B.createdAt)}</span>
          </div>
          <div class="pane-canvas">
            <GlyphCanvas layers={layerB} guides={true} />
          </div>
          <div class="pane-f">
            <div class="pf"><span>字面宽</span><b class="mono">{fmtNum(B.metrics.inkWidth, 1)}</b></div>
            <div class="pf"><span>重心</span><b class="mono">{fmtNum(B.metrics.cogX, 0)},{fmtNum(B.metrics.cogY, 0)}</b></div>
            <div class="pf"><span>锁定</span><b class="mono">{B.lockedCount}</b></div>
          </div>
        </div>
      </div>

      <!-- 指标表 -->
      <div class="tables">
        <div class="tbl-main">
          <div class="tbl-h">
            <span>指标对比</span>
            <span class="tbl-note mono">偏差 = (B−A)/|A| · &gt;3% 标红</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>指标</th>
                <th class="r">{A.label}</th>
                <th class="r">{B.label}</th>
                <th class="r">Δ</th>
                <th class="r">偏差</th>
                <th class="bar-col"></th>
              </tr>
            </thead>
            <tbody>
              {#each rows as r (r.key)}
                <tr class:flagged={r.flagged && showDiff} class:meta={r.meta}>
                  <td class="k">{r.label}<span class="u mono">{r.unit}</span></td>
                  <td class="r mono">{fmtNum(r.a, r.digits)}</td>
                  <td class="r mono">{fmtNum(r.b, r.digits)}</td>
                  <td class="r mono delta {r.delta > 0 ? 'pos' : r.delta < 0 ? 'neg' : ''}">{r.delta > 0 ? '+' : ''}{fmtNum(r.delta, r.digits)}</td>
                  <td class="r mono pct" class:over={r.flagged && showDiff}>{r.pct > 0 ? '+' : ''}{r.pct.toFixed(1)}%</td>
                  <td class="bar-col">
                    <div class="bar">
                      <span class="bzero"></span>
                      <span
                        class="bfill {r.pct > 0 ? 'pos' : 'neg'}"
                        class:over={r.flagged && showDiff}
                        style:width={`${Math.min(50, Math.abs(r.pct) * 4)}%`}
                        style:left={r.pct > 0 ? '50%' : `${50 - Math.min(50, Math.abs(r.pct) * 4)}%`}
                      ></span>
                      <span class="b3 l"></span>
                      <span class="b3 r"></span>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="tbl-side">
          <div class="devbox" class:has={flagged.length}>
            <div class="dev-h">
              <span class="dev-t">超差项（&gt;3%）</span>
              <span class="dev-n mono">{flagged.length}</span>
            </div>
            {#if flagged.length}
              <ul class="dev-list">
                {#each flagged as f (f.key)}
                  <li>
                    <span class="dl-k">{f.label}</span>
                    <span class="dl-v mono">{f.pct > 0 ? '+' : ''}{f.pct.toFixed(1)}%</span>
                  </li>
                {/each}
              </ul>
              <p class="dev-note">字面宽度或重心偏移超过 3%，需复核字形比例与基线定位。</p>
            {:else}
              <p class="dev-ok">✓ 所有指标偏差均在 3% 以内，两版比例稳定。</p>
            {/if}
          </div>

          <div class="vbox">
            <div class="vb-h">版本参数</div>
            <div class="vb-cols">
              <div class="vb-col">
                <div class="vb-l mono">{A.label}</div>
                <dl>
                  <div><dt>字重</dt><dd class="mono">{A.params.weight}</dd></div>
                  <div><dt>对比</dt><dd class="mono">{Math.round(A.params.contrast * 100)}%</dd></div>
                  <div><dt>倾斜</dt><dd class="mono">{A.params.slant}°</dd></div>
                  <div><dt>圆角</dt><dd class="mono">{A.params.corner}</dd></div>
                  <div><dt>收笔</dt><dd>{TERMINAL_LABEL[A.params.terminal]}</dd></div>
                  <div><dt>种子</dt><dd class="mono">{A.params.seed}</dd></div>
                </dl>
              </div>
              <div class="vb-col">
                <div class="vb-l mono">{B.label}</div>
                <dl>
                  <div><dt>字重</dt><dd class="mono">{B.params.weight}</dd></div>
                  <div><dt>对比</dt><dd class="mono">{Math.round(B.params.contrast * 100)}%</dd></div>
                  <div><dt>倾斜</dt><dd class="mono">{B.params.slant}°</dd></div>
                  <div><dt>圆角</dt><dd class="mono">{B.params.corner}</dd></div>
                  <div><dt>收笔</dt><dd>{TERMINAL_LABEL[B.params.terminal]}</dd></div>
                  <div><dt>种子</dt><dd class="mono">{B.params.seed}</dd></div>
                </dl>
              </div>
            </div>
          </div>

          <div class="notesbox">
            <div class="nb-l">{A.label}</div>
            <p>{A.note}</p>
            <div class="nb-l" style="margin-top:8px">{B.label}</div>
            <p>{B.note}</p>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .cmp {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: var(--paper);
  }

  .cmp-head {
    display: flex;
    align-items: flex-end;
    gap: 20px;
    padding: 11px 18px;
    background: #f8f4ea;
    border-bottom: 1px solid var(--rule);
    flex-wrap: wrap;
  }
  .hrow {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 4px;
  }
  .pickrec {
    width: 300px;
    font-size: 11px;
  }
  .title {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .big {
    font-size: 26px;
    line-height: 1;
    font-weight: 600;
  }
  .sub {
    font-size: 9px;
    color: var(--ink-faint);
    letter-spacing: 0.06em;
  }
  .vs-pick {
    display: flex;
    align-items: flex-end;
    gap: 6px;
  }
  .vp {
    min-width: 148px;
  }
  .vp .field {
    font-size: 11px;
    padding: 5px 22px 5px 8px;
  }
  .swap {
    margin-bottom: 1px;
    font-size: 13px;
  }
  .controls {
    display: flex;
    gap: 14px;
    align-items: center;
    margin-left: auto;
    padding-bottom: 4px;
  }
  .chk {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10.5px;
    color: var(--ink-mute);
    white-space: nowrap;
  }
  .chk input {
    accent-color: var(--cinnabar);
  }

  .cmp-body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 12px 16px 14px;
    gap: 11px;
    overflow-y: auto;
  }

  .panes {
    display: grid;
    grid-template-columns: 1fr 1.16fr 1fr;
    gap: 10px;
    min-height: 320px;
    max-height: 46vh;
  }
  .pane {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border: 1px solid var(--rule);
    border-radius: 3px;
    background: var(--card-raised);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
  .pane.mid {
    border-color: #c9bda2;
    box-shadow: var(--shadow);
  }
  .pane-h {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 5px 10px;
    background: #f6f1e4;
    border-bottom: 1px solid var(--rule-soft);
  }
  .pl {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .pd {
    font-size: 8.5px;
    color: var(--ink-faint);
  }
  .pane-canvas {
    flex: 1;
    min-height: 0;
    position: relative;
  }
  .halves {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .half {
    position: relative;
    min-width: 0;
  }
  .half:first-child {
    border-right: 1px dashed var(--rule);
  }
  .pane-f {
    display: flex;
    gap: 12px;
    padding: 5px 10px;
    background: #f6f1e4;
    border-top: 1px solid var(--rule-soft);
  }
  .pf {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
  .pf span {
    font-size: 8px;
    color: var(--ink-faint);
    letter-spacing: 0.04em;
  }
  .pf b {
    font-size: 10.5px;
    font-weight: 500;
  }
  .mid-f {
    justify-content: center;
    gap: 22px;
  }
  .legend {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 9px;
    color: var(--ink-mute);
  }
  .sw {
    width: 9px;
    height: 9px;
    border-radius: 1px;
    display: block;
  }
  .sw.a {
    background: rgba(180, 68, 48, 0.4);
    border: 1px solid #b44430;
  }
  .sw.b {
    background: #1a1712;
  }
  .diff-note {
    position: absolute;
    bottom: 7px;
    left: 50%;
    transform: translateX(-50%);
    background: #fdf3e6;
    border: 1px solid #dfc39a;
    padding: 3px 9px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    gap: 7px;
    z-index: 4;
    max-width: 96%;
  }
  .dn-tag {
    font-size: 8.5px;
    color: #964d17;
    background: #f3dfc0;
    padding: 0 4px;
    border-radius: 2px;
    white-space: nowrap;
  }
  .diff-note .mono {
    font-size: 8.5px;
    color: #7a5a2b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 表格区 */
  .tables {
    display: grid;
    grid-template-columns: 1.55fr 1fr;
    gap: 12px;
    align-items: start;
  }
  .tbl-main {
    border: 1px solid var(--rule);
    border-radius: 3px;
    background: var(--card-raised);
    overflow: hidden;
  }
  .tbl-h {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 7px 12px;
    background: #f6f1e4;
    border-bottom: 1px solid var(--rule-soft);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .tbl-note {
    font-size: 8.5px;
    color: var(--ink-faint);
    letter-spacing: 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th {
    font-size: 8.5px;
    letter-spacing: 0.09em;
    color: var(--ink-faint);
    font-weight: 500;
    text-align: left;
    padding: 5px 12px;
    border-bottom: 1px solid var(--rule-soft);
    text-transform: uppercase;
  }
  th.r {
    text-align: right;
  }
  td {
    padding: 5px 12px;
    font-size: 11px;
    border-bottom: 1px dotted #eae1cf;
  }
  tr:last-child td {
    border-bottom: 0;
  }
  td.r {
    text-align: right;
  }
  td .u {
    font-size: 8px;
    color: var(--ink-faint);
    margin-left: 5px;
  }
  td .u:empty {
    display: none;
  }
  tr.flagged {
    background: #fdf4ef;
  }
  tr.meta {
    background: #f7f4ec;
  }
  tr.meta td {
    color: var(--ink-mute);
  }
  tr.meta td.k::after {
    content: '参考';
    font-size: 8px;
    color: var(--ink-faint);
    margin-left: 5px;
    border: 1px solid #ddd3bd;
    padding: 0 3px;
    border-radius: 1px;
    vertical-align: 1px;
  }
  td.pct {
    color: var(--ink-soft);
  }
  td.pct.over {
    color: var(--cinnabar);
    font-weight: 600;
    background: #f7e3dd;
  }
  .delta.pos {
    color: var(--jade);
  }
  .delta.neg {
    color: #8a5a2d;
  }
  .bar-col {
    width: 108px;
  }
  .bar {
    position: relative;
    height: 9px;
    width: 100%;
    background: #f2ecdd;
    border-radius: 1px;
  }
  .bzero {
    position: absolute;
    left: 50%;
    top: -1px;
    bottom: -1px;
    width: 1px;
    background: #c3b69c;
  }
  .bfill {
    position: absolute;
    top: 1px;
    bottom: 1px;
    background: #6f8a74;
    border-radius: 1px;
  }
  .bfill.neg {
    background: #b08a58;
  }
  .bfill.over {
    background: var(--cinnabar);
  }
  .b3 {
    position: absolute;
    top: -2px;
    bottom: -2px;
    width: 1px;
    background: #d3c8b2;
  }
  .b3.l {
    left: 38%;
  }
  .b3.r {
    left: 62%;
  }

  .tbl-side {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .devbox {
    border: 1px solid var(--rule);
    border-radius: 3px;
    background: var(--card-raised);
    padding: 9px 11px;
  }
  .devbox.has {
    border-color: #e2c5a1;
    background: #fdf8ef;
  }
  .dev-h {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .dev-t {
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .dev-n {
    font-size: 16px;
    color: var(--ink-faint);
  }
  .devbox.has .dev-n {
    color: var(--cinnabar);
    font-weight: 600;
  }
  .dev-list {
    list-style: none;
    margin: 7px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .dev-list li {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 4px 7px;
    background: #f8e8e0;
    border-left: 2px solid var(--cinnabar);
    border-radius: 1px;
  }
  .dl-k {
    font-size: 10.5px;
    color: var(--ink-soft);
  }
  .dl-v {
    font-size: 11px;
    color: var(--cinnabar);
    font-weight: 600;
  }
  .dev-note {
    margin: 7px 0 0;
    font-size: 9.5px;
    line-height: 1.6;
    color: #8a5a2d;
  }
  .dev-ok {
    margin: 7px 0 0;
    font-size: 10.5px;
    color: var(--jade);
    line-height: 1.6;
  }

  .vbox {
    border: 1px solid var(--rule);
    border-radius: 3px;
    background: var(--card-raised);
    overflow: hidden;
  }
  .vb-h {
    padding: 6px 11px;
    background: #f6f1e4;
    border-bottom: 1px solid var(--rule-soft);
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .vb-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .vb-col {
    padding: 8px 11px;
  }
  .vb-col + .vb-col {
    border-left: 1px solid var(--rule-soft);
  }
  .vb-l {
    font-size: 10px;
    font-weight: 600;
    color: var(--cinnabar);
    margin-bottom: 4px;
  }
  .vb-col dl {
    margin: 0;
  }
  .vb-col dl div {
    display: flex;
    justify-content: space-between;
    padding: 1.5px 0;
  }
  .vb-col dt {
    font-size: 9px;
    color: var(--ink-faint);
  }
  .vb-col dd {
    margin: 0;
    font-size: 9.5px;
    color: var(--ink-soft);
  }

  .notesbox {
    border: 1px solid var(--rule);
    border-radius: 3px;
    background: var(--card-raised);
    padding: 9px 11px;
  }
  .nb-l {
    font-size: 9px;
    font-weight: 600;
    color: var(--cinnabar);
  }
  .notesbox p {
    margin: 2px 0 0;
    font-size: 10px;
    line-height: 1.6;
    color: var(--ink-mute);
  }

  .empty {
    margin: auto;
    color: var(--ink-faint);
    font-size: 12px;
    padding: 40px;
  }
</style>
