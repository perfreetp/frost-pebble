<script lang="ts">
  import type { GlyphRecord } from '../types';
  import { studio } from '../store.svelte';
  import { paramSummary, TERMINAL_LABEL } from '../generator';

  interface Props {
    rec: GlyphRecord;
  }
  let { rec }: Props = $props();

  const cur = $derived(studio.currentVersion(rec));
  let tab = $state<'spec' | 'versions' | 'comments' | 'plate'>('spec');

  function fmt(iso?: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function fmtTime(iso: string) {
    const d = new Date(iso);
    return `${fmt(iso)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  const pending = $derived(rec.comments.filter((c) => c.status === '待处理').length);
  const done = $derived(rec.comments.filter((c) => c.status === '已处理').length);

  const statusClass: Record<string, string> = {
    草稿: 'gray',
    待审: 'amber',
    修订中: 'blue',
    已归档: 'green',
  };

  let confirmArchive = $state(false);
</script>

<div class="detail">
  <div class="dhead">
    <div class="eyebrow">RECORD FILE</div>
    <div class="idline">
      <span class="id mono">{rec.id}</span>
      <span class="chip {statusClass[rec.status]}">{rec.status}</span>
    </div>
    <div class="seqline mono">NO.{String(rec.seq).padStart(4, '0')} · 建档 {fmt(rec.createdAt)}</div>
  </div>

  <div class="tabs" role="tablist">
    {#each [{ id: 'spec', label: '规格' }, { id: 'versions', label: `版本 ${rec.versions.length}` }, { id: 'comments', label: `审稿 ${rec.comments.length}` }, { id: 'plate', label: '初版样张' }] as t (t.id)}
      <button
        class="tab"
        class:on={tab === t.id}
        role="tab"
        aria-selected={tab === t.id}
        onclick={() => (tab = t.id as typeof tab)}
      >
        {t.label}
      </button>
    {/each}
  </div>

  <div class="dbody">
    {#if tab === 'spec'}
      <dl class="spec">
        <div class="srow">
          <dt>字库</dt>
          <dd>{rec.library}</dd>
        </div>
        <div class="srow">
          <dt>字重</dt>
          <dd>{rec.weightName} <span class="sub mono">W{rec.weight}</span></dd>
        </div>
        <div class="srow">
          <dt>字面框</dt>
          <dd class="mono small">1000 × 1000 em<br /><span class="sub">基线 0 · 下伸 −200</span></dd>
        </div>
        <div class="srow">
          <dt>骨架来源</dt>
          <dd>
            <span class="skel-kind">{rec.skeletonSource.kind}</span>
            <p class="skel-ref">{rec.skeletonSource.ref}</p>
          </dd>
        </div>
        <div class="srow">
          <dt>拼音</dt>
          <dd class="mono small">{rec.pinyin}</dd>
        </div>
        <div class="srow">
          <dt>当前版本</dt>
          <dd class="mono small">v{rec.currentVersionId} · 种子 {rec.params.seed}</dd>
        </div>
        <div class="srow">
          <dt>生成参数</dt>
          <dd class="small">{paramSummary(rec.params)}</dd>
        </div>
        <div class="srow">
          <dt>最近更新</dt>
          <dd class="mono small">{fmtTime(rec.updatedAt)}</dd>
        </div>
        {#if rec.archivedAt}
          <div class="srow">
            <dt>归档时间</dt>
            <dd class="mono small">{fmt(rec.archivedAt)}</dd>
          </div>
        {/if}
      </dl>

      {#if cur}
        <div class="lockbox">
          <div class="lockhead">
            <span>手改笔画</span>
            <span class="mono">{cur.strokes.filter((s) => s.manual).length} / {cur.strokes.length}</span>
          </div>
          <div class="strokegrid">
            {#each cur.strokes as s (s.id)}
              <span class="sdot" class:locked={s.manual} title={s.id + (s.manual ? ' · 已锁定' : ' · 参数生成')}>
                {s.kind === 'heng' ? '横' : s.kind === 'shu' ? '竖' : s.kind === 'pie' ? '撇' : s.kind === 'na' ? '捺' : s.kind === 'dian' ? '点' : s.kind === 'ti' ? '提' : s.kind === 'gou' ? '钩' : '折'}
              </span>
            {/each}
          </div>
          <p class="locknote">朱色为已锁定笔画，重新生成时保持不动。</p>
        </div>
      {/if}

      <div class="zones">
        <div class="zone">
          <span class="zk">待处理意见</span>
          <span class="zv mono {pending ? 'warn' : ''}">{pending}</span>
        </div>
        <div class="zone">
          <span class="zk">已处理意见</span>
          <span class="zv mono">{done}</span>
        </div>
      </div>

      <div class="actions">
        {#if rec.status !== '已归档'}
          {#if !confirmArchive}
            <button class="btn full" onclick={() => (confirmArchive = true)} disabled={pending > 0}>
              验收并归档 · 生成字样报告
            </button>
            {#if pending > 0}
              <p class="hint warn-t">尚有 {pending} 条意见待处理，处理后才能验收归档。</p>
            {/if}
          {:else}
            <div class="confirm">
              <p>确认验收 v{rec.currentVersionId} 并归档？归档后档案进入「已归档」，同时生成字样报告。</p>
              <div class="cfrow">
                <button
                  class="btn accent sm"
                  onclick={() => {
                    studio.archive(rec);
                    confirmArchive = false;
                  }}>确认归档</button
                >
                <button class="btn ghost sm" onclick={() => (confirmArchive = false)}>取消</button>
              </div>
            </div>
          {/if}
        {:else}
          <button class="btn full" onclick={() => studio.openReport(rec)}>查看字样报告</button>
        {/if}
      </div>
    {:else if tab === 'versions'}
      <div class="vtimeline">
        {#each rec.versions.slice().reverse() as v (v.id)}
          <div class="vitem" class:current={v.id === rec.currentVersionId}>
            <div class="vrail">
              <span class="vdot"></span>
            </div>
            <div class="vcontent">
              <div class="vtop">
                <span class="vlabel mono">{v.label}</span>
                {#if v.id === rec.currentVersionId}<span class="chip red tiny">当前</span>{/if}
                <span class="vdate mono">{fmt(v.createdAt)}</span>
              </div>
              <div class="vparams mono">{TERMINAL_LABEL[v.params.terminal]} · 重{v.params.weight} · 对{Math.round(v.params.contrast * 100)}% · 倾{v.params.slant}° · 角{v.params.corner}</div>
              <p class="vnote">{v.note}</p>
              <div class="vfoot mono">
                <span>宽 {v.metrics.inkWidth.toFixed(0)}</span>
                <span>重心 {v.metrics.cogX.toFixed(0)},{v.metrics.cogY.toFixed(0)}</span>
                {#if v.lockedCount}<span class="locktag">锁定 {v.lockedCount}</span>{/if}
              </div>
              <div class="vacts">
                <button class="btn tiny" onclick={() => { studio.select(rec.id); studio.setCompare('a', v.id); studio.setCompare('b', rec.currentVersionId); studio.setScreen('compare'); }}>与当前版比对</button>
                {#if v.id !== rec.currentVersionId}
                  <button class="btn tiny" onclick={() => studio.setCompare('b', v.id)}>设为右版</button>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else if tab === 'comments'}
      {#if !rec.comments.length}
        <p class="empty-note">尚无审稿意见。审稿人可在「审稿归档」界面对着字面打点写意见。</p>
      {:else}
        <div class="csummary">
          <span class="cs-pend mono">{pending} 待处理</span>
          <span class="cs-done mono">{done} 已处理</span>
        </div>
        <div class="clist">
          {#each rec.comments as c, i (c.id)}
            <div class="citem" class:resolved={c.status === '已处理'}>
              <div class="ctop">
                <span class="cno mono">#{i + 1}</span>
                <span class="chip gray tiny">{c.tag}</span>
                <span class="chip {c.status === '已处理' ? 'green' : 'amber'} tiny">{c.status}</span>
                <span class="cpos mono">({Math.round(c.x)}, {Math.round(c.y)})</span>
              </div>
              <p class="cbody">{c.body}</p>
              <div class="cby mono">{c.author} · {fmt(c.createdAt)}</div>
              {#if c.replies.length}
                <div class="replies">
                  {#each c.replies as r, k (k)}
                    <div class="reply"><span class="rby">{r.author}</span>{r.body}</div>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    {:else}
      <div class="platebox">
        <div class="platehead">
          <span class="eyebrow">初版样张 · v1</span>
          <span class="mono tiny2">{rec.plate.createdAt.slice(0, 10)}</span>
        </div>
        <div class="plateimg">
          <svg viewBox="-120 -1030 1240 1240" aria-label="初版样张">
            <g transform="scale(1,-1)">
              <rect x="0" y="0" width="1000" height="1000" fill="#f2ecdd" />
              <path d={rec.plate.svgPath} fill="#1a1712" fill-rule="evenodd" />
              <line x1="0" y1="0" x2="1000" y2="0" stroke="#c0392b" stroke-width="5" opacity="0.7" />
            </g>
          </svg>
        </div>
        <p class="platenote">{rec.plate.note}</p>
        <div class="platefinger mono">FINGERPRINT · {rec.plate.fingerprint}</div>
        <div class="seenote">
          <span>同种子同参数复现</span>
          <span class="seed mono">SEED {rec.versions[0]?.params.seed}</span>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .detail {
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
  }
  .dhead {
    padding: 14px 15px 10px;
    border-bottom: 1px solid var(--rule-soft);
  }
  .idline {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }
  .id {
    font-size: 14px;
    letter-spacing: 0.06em;
    font-weight: 600;
  }
  .seqline {
    font-size: 9px;
    color: var(--ink-faint);
    letter-spacing: 0.08em;
    margin-top: 4px;
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid var(--rule-soft);
    padding: 0 8px;
    background: #f5f0e3;
  }
  .tab {
    flex: 1;
    padding: 8px 2px 7px;
    background: transparent;
    border: 0;
    border-bottom: 2px solid transparent;
    font-size: 10.5px;
    letter-spacing: 0.04em;
    color: var(--ink-mute);
    transition: color 0.13s, border-color 0.13s;
  }
  .tab:hover {
    color: var(--ink);
  }
  .tab.on {
    color: var(--ink);
    border-bottom-color: var(--cinnabar);
    font-weight: 500;
  }

  .dbody {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px 15px 22px;
  }

  /* 规格 */
  .spec {
    margin: 0;
  }
  .srow {
    display: grid;
    grid-template-columns: 62px 1fr;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px dotted #e2d9c6;
    align-items: baseline;
  }
  .srow:last-child {
    border-bottom: 0;
  }
  dt {
    font-size: 10px;
    color: var(--ink-faint);
    letter-spacing: 0.06em;
  }
  dd {
    margin: 0;
    font-size: 11.5px;
    color: var(--ink-soft);
    line-height: 1.5;
  }
  .small {
    font-size: 11px;
  }
  .sub {
    color: var(--ink-faint);
    font-size: 9.5px;
  }
  .skel-kind {
    font-size: 10.5px;
    color: var(--ink);
  }
  .skel-ref {
    margin: 2px 0 0;
    font-size: 10.5px;
    color: var(--ink-mute);
    line-height: 1.6;
  }

  .lockbox {
    margin-top: 12px;
    border: 1px solid var(--rule-soft);
    background: #fbf8f0;
    padding: 9px 10px;
    border-radius: 2px;
  }
  .lockhead {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    letter-spacing: 0.06em;
    color: var(--ink-mute);
  }
  .strokegrid {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 7px;
  }
  .sdot {
    width: 21px;
    height: 21px;
    display: grid;
    place-items: center;
    font-size: 10px;
    color: var(--ink-mute);
    background: #f1ebdc;
    border: 1px solid #ddd3bd;
    border-radius: 2px;
  }
  .sdot.locked {
    background: var(--cinnabar-wash);
    border-color: #deb8ae;
    color: var(--cinnabar);
    font-weight: 600;
  }
  .locknote {
    margin: 7px 0 0;
    font-size: 9.5px;
    color: var(--ink-faint);
    line-height: 1.5;
  }

  .zones {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
    margin-top: 12px;
  }
  .zone {
    border: 1px solid var(--rule-soft);
    border-radius: 2px;
    padding: 7px 9px;
    background: #fbf8f0;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .zk {
    font-size: 9.5px;
    color: var(--ink-faint);
    letter-spacing: 0.04em;
  }
  .zv {
    font-size: 15px;
  }
  .zv.warn {
    color: var(--cinnabar);
    font-weight: 600;
  }

  .actions {
    margin-top: 14px;
  }
  .hint {
    font-size: 10px;
    color: var(--ink-faint);
    margin: 6px 0 0;
    line-height: 1.6;
  }
  .hint.warn-t {
    color: #a0661f;
  }
  .confirm {
    border: 1px solid #e3c9a8;
    background: #fbf2e3;
    padding: 10px;
    border-radius: 2px;
  }
  .confirm p {
    margin: 0 0 8px;
    font-size: 10.5px;
    line-height: 1.65;
    color: var(--ink-soft);
  }
  .cfrow {
    display: flex;
    gap: 6px;
  }

  /* 版本时间线 */
  .vtimeline {
    display: flex;
    flex-direction: column;
  }
  .vitem {
    display: grid;
    grid-template-columns: 16px 1fr;
    gap: 8px;
  }
  .vrail {
    position: relative;
    display: flex;
    justify-content: center;
  }
  .vrail::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #ddd3bd;
  }
  .vitem:first-child .vrail::before {
    top: 8px;
  }
  .vitem:last-child .vrail::before {
    bottom: calc(100% - 8px);
  }
  .vdot {
    position: relative;
    z-index: 1;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #fbf8f0;
    border: 1.5px solid #c3b69c;
    margin-top: 6px;
  }
  .vitem.current .vdot {
    border-color: var(--cinnabar);
    background: var(--cinnabar);
  }
  .vcontent {
    padding: 4px 0 14px;
    min-width: 0;
  }
  .vtop {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .vlabel {
    font-size: 12px;
    font-weight: 600;
  }
  .vdate {
    margin-left: auto;
    font-size: 9px;
    color: var(--ink-faint);
  }
  .chip.tiny {
    padding: 0 4px;
    font-size: 8.5px;
  }
  .vparams {
    font-size: 9.5px;
    color: var(--ink-mute);
    margin-top: 2px;
  }
  .vnote {
    margin: 4px 0 0;
    font-size: 10.5px;
    line-height: 1.6;
    color: var(--ink-soft);
  }
  .vfoot {
    display: flex;
    gap: 9px;
    margin-top: 4px;
    font-size: 9px;
    color: var(--ink-faint);
  }
  .locktag {
    color: var(--cinnabar);
  }
  .vacts {
    display: flex;
    gap: 4px;
    margin-top: 6px;
  }

  /* 意见 */
  .csummary {
    display: flex;
    gap: 10px;
    margin-bottom: 8px;
  }
  .cs-pend {
    color: #a0661f;
    font-size: 10px;
  }
  .cs-done {
    color: var(--jade);
    font-size: 10px;
  }
  .clist {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .citem {
    border: 1px solid #e6dcc8;
    border-left: 2px solid #d9a13b;
    background: #fdfaf3;
    padding: 7px 9px;
    border-radius: 2px;
  }
  .citem.resolved {
    border-left-color: var(--jade);
    opacity: 0.85;
  }
  .ctop {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }
  .cno {
    font-size: 9px;
    color: var(--ink-faint);
  }
  .cpos {
    margin-left: auto;
    font-size: 8.5px;
    color: var(--ink-faint);
  }
  .cbody {
    margin: 5px 0 3px;
    font-size: 11px;
    line-height: 1.6;
    color: var(--ink-soft);
  }
  .cby {
    font-size: 8.5px;
    color: var(--ink-faint);
  }
  .replies {
    margin-top: 6px;
    border-top: 1px dashed #e6dcc8;
    padding-top: 5px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .reply {
    font-size: 10px;
    line-height: 1.55;
    color: var(--ink-soft);
  }
  .rby {
    color: var(--cinnabar);
    margin-right: 5px;
    font-size: 9px;
  }
  .empty-note {
    font-size: 11px;
    color: var(--ink-faint);
    line-height: 1.7;
  }

  /* 初版样张 */
  .platebox {
    border: 1px solid var(--rule-soft);
    background: #fbf8f0;
    border-radius: 2px;
    padding: 10px;
  }
  .platehead {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .tiny2 {
    font-size: 8.5px;
    color: var(--ink-faint);
  }
  .plateimg {
    margin-top: 8px;
    border: 1px solid #e2d9c6;
  }
  .plateimg svg {
    display: block;
    width: 100%;
    height: auto;
  }
  .platenote {
    margin: 8px 0 0;
    font-size: 10px;
    color: var(--ink-mute);
    line-height: 1.6;
  }
  .platefinger {
    margin-top: 6px;
    font-size: 8px;
    color: var(--ink-faint);
    letter-spacing: 0.05em;
  }
  .seenote {
    display: flex;
    justify-content: space-between;
    margin-top: 9px;
    padding-top: 7px;
    border-top: 1px dashed #e2d9c6;
    font-size: 9px;
    color: var(--ink-faint);
  }
</style>
