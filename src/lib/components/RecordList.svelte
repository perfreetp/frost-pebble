<script lang="ts">
  import type { GlyphRecord } from '../types';

  interface Props {
    records: GlyphRecord[];
    selectedId: string | null;
    onselect: (id: string) => void;
  }
  let { records, selectedId, onselect }: Props = $props();

  const statusClass: Record<string, string> = {
    草稿: 'gray',
    待审: 'amber',
    修订中: 'blue',
    已归档: 'green',
  };

  function shortDate(iso: string) {
    const d = new Date(iso);
    return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  }
</script>

<div class="list" role="listbox" aria-label="档案列表">
  {#each records as rec (rec.id)}
    {@const pending = rec.comments.filter((c) => c.status === '待处理').length}
    {@const v = rec.versions[rec.versions.length - 1]}
    <button
      class="row"
      class:on={selectedId === rec.id}
      role="option"
      aria-selected={selectedId === rec.id}
      onclick={() => onselect(rec.id)}
    >
      <div class="thumb">
        <svg viewBox="-120 -1030 1240 1240" aria-hidden="true">
          <path d={v.svgPath} fill="currentColor" fill-rule="evenodd" transform="scale(1,-1)" />
        </svg>
      </div>
      <div class="meta">
        <div class="l1">
          <span class="id mono">{rec.id}</span>
          <span class="chip {statusClass[rec.status]}">{rec.status}</span>
        </div>
        <div class="l2">
          <span class="lib">{rec.library}</span>
          <span class="sep">/</span>
          <span class="wt">{rec.weightName}</span>
        </div>
      </div>
      <div class="right">
        <div class="ver mono">{rec.currentVersionId}</div>
        {#if pending > 0}
          <div class="pend mono" title="{pending} 条意见待处理">{pending}</div>
        {:else}
          <div class="pend none mono" title="无待处理意见">—</div>
        {/if}
      </div>
    </button>
  {/each}
  {#if !records.length}
    <div class="empty">
      <div class="empty-mark">空</div>
      <p>没有符合检索条件的档案。<br />试试放宽筛选，或新建一条档案。</p>
    </div>
  {/if}
</div>

<style>
  .list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    min-height: 0;
  }
  .row {
    display: grid;
    grid-template-columns: 46px 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 7px 11px 7px 9px;
    background: transparent;
    border: 0;
    border-bottom: 1px solid #ebe3d2;
    text-align: left;
    transition: background 0.12s;
    position: relative;
  }
  .row:hover {
    background: #f3ede0;
  }
  .row.on {
    background: #fbf8f0;
    box-shadow: inset 3px 0 0 var(--cinnabar);
  }
  .thumb {
    width: 42px;
    height: 42px;
    background: #f1ebdc;
    border: 1px solid #e0d6c1;
    border-radius: 2px;
    display: grid;
    place-items: center;
    color: var(--ink);
    overflow: hidden;
  }
  .thumb svg {
    width: 38px;
    height: 38px;
  }
  .row.on .thumb {
    background: #fffdf7;
    border-color: #d3c6ab;
  }
  .meta {
    min-width: 0;
  }
  .l1 {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .id {
    font-size: 10px;
    color: var(--ink-mute);
    letter-spacing: 0.03em;
  }
  .l2 {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 3px;
    font-size: 11px;
    color: var(--ink-soft);
  }
  .lib {
    font-weight: 500;
  }
  .sep {
    color: #c1b69f;
  }
  .wt {
    color: var(--ink-mute);
  }
  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
  }
  .ver {
    font-size: 10px;
    color: var(--ink-faint);
    letter-spacing: 0.04em;
  }
  .ver::before {
    content: 'v';
    opacity: 0.55;
  }
  .pend {
    min-width: 15px;
    height: 15px;
    padding: 0 4px;
    border-radius: 2px;
    background: var(--cinnabar-wash);
    color: var(--cinnabar);
    font-size: 9.5px;
    display: grid;
    place-items: center;
    border: 1px solid #e8c9c1;
    font-weight: 600;
  }
  .pend.none {
    background: transparent;
    border-color: transparent;
    color: #c3b8a2;
    font-weight: 400;
  }
  .empty {
    padding: 34px 20px;
    text-align: center;
    color: var(--ink-faint);
  }
  .empty-mark {
    font-family: var(--serif);
    font-size: 30px;
    color: #d3c8b2;
    border: 1px dashed #d3c8b2;
    width: 54px;
    height: 54px;
    display: grid;
    place-items: center;
    margin: 0 auto 12px;
    border-radius: 2px;
  }
  .empty p {
    margin: 0;
    font-size: 11px;
    line-height: 1.7;
  }
</style>
