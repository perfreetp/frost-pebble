<script lang="ts">
  import { studio, type Screen } from './lib/store.svelte';
  import { onMount } from 'svelte';
  import ArchiveScreen from './lib/screens/ArchiveScreen.svelte';
  import GenerateScreen from './lib/screens/GenerateScreen.svelte';
  import CompareScreen from './lib/screens/CompareScreen.svelte';
  import ReviewScreen from './lib/screens/ReviewScreen.svelte';

  onMount(() => {
    studio.load();
  });

  const NAV: { id: Screen; label: string; index: string; hint: string }[] = [
    { id: 'archive', label: '档案', index: '01', hint: '建档与检索' },
    { id: 'generate', label: '生成台', index: '02', hint: '参数生成与手改' },
    { id: 'compare', label: '版本比对', index: '03', hint: '两版并排' },
    { id: 'review', label: '审稿归档', index: '04', hint: '打点与验收' },
  ];

  let clock = $state('');
  onMount(() => {
    const tick = () => {
      const d = new Date();
      clock = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(
        d.getHours(),
      ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  });

  const pendingTotal = $derived(studio.records.reduce((n, r) => n + r.comments.filter((c) => c.status === '待处理').length, 0));
  const archived = $derived(studio.records.filter((r) => r.status === '已归档').length);

  function goto(id: Screen) {
    studio.setScreen(id);
  }
</script>

<div class="shell">
  <header class="topbar">
    <div class="brand">
      <div class="mark" aria-hidden="true">
        <svg viewBox="0 0 34 34" width="30" height="30">
          <rect x="1" y="1" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.5" />
          <path d="M7 24.5 L17 7 L27 24.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
          <line x1="11" y1="20.4" x2="23" y2="20.4" stroke="currentColor" stroke-width="1.3" />
        </svg>
      </div>
      <div class="wordmark">
        <div class="wm-zh">点画字坊</div>
        <div class="wm-en">DIANHUA · GLYPH ATELIER</div>
      </div>
    </div>

    <nav class="nav" aria-label="主导航">
      {#each NAV as item (item.id)}
        <button
          class="nav-item"
          class:active={studio.screen === item.id}
          onclick={() => goto(item.id)}
          aria-current={studio.screen === item.id ? 'page' : undefined}
        >
          <span class="idx mono">{item.index}</span>
          <span class="lbl">{item.label}</span>
          <span class="hint">{item.hint}</span>
          {#if item.id === 'review' && pendingTotal > 0}
            <span class="badge mono">{pendingTotal}</span>
          {/if}
        </button>
      {/each}
    </nav>

    <div class="statusbar">
      <div class="stat">
        <span class="k">档案</span><span class="v mono">{studio.records.length}</span>
      </div>
      <div class="stat">
        <span class="k">已归档</span><span class="v mono">{archived}</span>
      </div>
      <div class="stat">
        <span class="k">待处理</span><span class="v mono warn">{pendingTotal}</span>
      </div>
      <div class="vr"></div>
      <div class="clock mono">{clock}</div>
      <div class="who" title="当前工作席位">
        <span class="dot"></span>
        沈砚 · 设计员
      </div>
    </div>
  </header>

  <main class="body">
    {#if studio.screen === 'archive'}
      <ArchiveScreen />
    {:else if studio.screen === 'generate'}
      <GenerateScreen />
    {:else if studio.screen === 'compare'}
      <CompareScreen />
    {:else}
      <ReviewScreen />
    {/if}
  </main>

  <div class="toasts" aria-live="polite">
    {#each studio.toasts as t (t.id)}
      <div class="toast {t.kind}">
        <span class="tmark"></span>
        <span>{t.text}</span>
      </div>
    {/each}
  </div>

  {#if studio.reportHtml}
    <div class="modal" role="dialog" aria-modal="true" aria-label="字样报告预览">
      <div class="modal-head">
        <div>
          <div class="eyebrow">SPECIMEN REPORT</div>
          <div class="modal-title serif">{studio.reportTitle}</div>
        </div>
        <div class="modal-actions">
          <button class="btn sm" onclick={() => window.print()} disabled={false}>打印 / 存 PDF</button>
          <button class="btn sm" onclick={() => studio.closeReport()}>关闭</button>
        </div>
      </div>
      <iframe class="report-frame" title="字样报告" srcdoc={studio.reportHtml}></iframe>
    </div>
  {/if}
</div>

<style>
  .shell {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100vh;
    background: var(--paper);
    overflow: hidden;
  }

  /* ------------------------------ 顶栏 ------------------------------ */
  .topbar {
    display: flex;
    align-items: stretch;
    gap: 0;
    height: 56px;
    background: #f9f6ee;
    border-bottom: 1px solid var(--rule);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.7) inset, var(--shadow-sm);
    position: relative;
    z-index: 20;
  }
  .topbar::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 1px;
    background: linear-gradient(90deg, #b8443a 0%, rgba(184, 68, 58, 0.15) 22%, transparent 45%);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 18px 0 16px;
    min-width: 214px;
  }
  .mark {
    color: var(--cinnabar);
    display: flex;
  }
  .wm-zh {
    font-family: var(--serif);
    font-size: 17px;
    letter-spacing: 0.16em;
    font-weight: 600;
    line-height: 1.1;
    color: var(--ink);
  }
  .wm-en {
    font-family: var(--mono);
    font-size: 8px;
    letter-spacing: 0.16em;
    color: var(--ink-faint);
    margin-top: 2px;
  }

  .nav {
    display: flex;
    align-items: stretch;
    gap: 1px;
    flex: 1;
  }
  .nav-item {
    position: relative;
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;
    align-content: center;
    column-gap: 7px;
    padding: 0 15px;
    background: transparent;
    border: 0;
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
    color: var(--ink-mute);
    transition: background 0.15s, color 0.15s;
  }
  .nav-item:hover {
    background: rgba(26, 23, 18, 0.035);
    color: var(--ink);
  }
  .nav-item .idx {
    grid-row: 1 / span 2;
    align-self: center;
    font-size: 9.5px;
    color: var(--ink-faint);
    letter-spacing: 0.06em;
  }
  .nav-item .lbl {
    font-size: 13px;
    letter-spacing: 0.1em;
    align-self: end;
    font-weight: 500;
  }
  .nav-item .hint {
    font-size: 9.5px;
    letter-spacing: 0.06em;
    color: var(--ink-faint);
    align-self: start;
  }
  .nav-item.active {
    background: var(--ink);
    color: #f6f2e7;
    border-color: var(--ink);
  }
  .nav-item.active .idx {
    color: rgba(246, 242, 231, 0.55);
  }
  .nav-item.active .hint {
    color: rgba(246, 242, 231, 0.55);
  }
  .badge {
    position: absolute;
    top: 9px;
    right: 6px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    background: var(--cinnabar);
    color: #fff;
    font-size: 9.5px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    letter-spacing: 0;
  }
  .nav-item.active .badge {
    background: var(--cinnabar-soft);
  }

  .statusbar {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 16px;
    border-left: 1px solid var(--rule-soft);
  }
  .stat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.15;
  }
  .stat .k {
    font-size: 8.5px;
    letter-spacing: 0.12em;
    color: var(--ink-faint);
  }
  .stat .v {
    font-size: 13px;
    font-weight: 500;
  }
  .stat .v.warn {
    color: var(--cinnabar);
  }
  .clock {
    font-size: 10.5px;
    color: var(--ink-mute);
    letter-spacing: 0.05em;
  }
  .who {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10.5px;
    color: var(--ink-soft);
    padding-left: 12px;
    border-left: 1px solid var(--rule-soft);
    letter-spacing: 0.03em;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--jade);
    box-shadow: 0 0 0 2px rgba(63, 107, 81, 0.18);
  }

  .body {
    position: relative;
    min-height: 0;
    overflow: hidden;
  }

  /* ------------------------------ 提示 ------------------------------ */
  .toasts {
    position: fixed;
    right: 18px;
    bottom: 18px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 60;
    pointer-events: none;
  }
  .toast {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 14px 9px 11px;
    background: #201c15;
    color: #f4efe2;
    font-size: 12px;
    letter-spacing: 0.03em;
    border-radius: 3px;
    box-shadow: var(--shadow-lg);
    animation: toast-in 0.22s ease-out;
    max-width: 380px;
  }
  .tmark {
    width: 5px;
    align-self: stretch;
    border-radius: 1px;
    background: var(--jade);
  }
  .toast.warn .tmark {
    background: #d9a13b;
  }
  .toast.info .tmark {
    background: #7d93ae;
  }

  /* ------------------------------ 报告弹层 ------------------------------ */
  .modal {
    position: fixed;
    inset: 0;
    z-index: 80;
    background: rgba(28, 24, 17, 0.55);
    backdrop-filter: blur(2px);
    display: grid;
    grid-template-rows: auto 1fr;
    padding: 34px clamp(16px, 4vw, 56px) 28px;
    animation: rise 0.2s ease-out;
  }
  .modal-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding-bottom: 10px;
    gap: 16px;
  }
  .modal-title {
    font-size: 17px;
    letter-spacing: 0.14em;
    color: #f7f2e4;
    margin-top: 3px;
  }
  .modal-head .eyebrow {
    color: rgba(247, 242, 228, 0.5);
  }
  .modal-actions {
    display: flex;
    gap: 8px;
  }
  .report-frame {
    width: 100%;
    height: 100%;
    border: 0;
    background: #fff;
    border-radius: 3px;
    box-shadow: var(--shadow-lg);
  }
</style>
