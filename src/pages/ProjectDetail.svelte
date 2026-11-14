<script>
import { getProject, go, projectValidation, submitForReview, resubmit, exportBOMCSV, state as appState, saveProject } from '../lib/store.svelte.js';
  import { EQUIP_TYPES } from '../lib/constants.js';

  let { id } = $props();
  const p = $derived(getProject(id));
  const val = $derived(projectValidation(p));
  let msg = $state('');

  const isMaker = $derived(appState.user.role === 'maker');
  const canEdit = $derived(isMaker && ['制作中', '已退回'].includes(p.status));

  function shedBadge(r) {
    if (r.violations.length > 0) return `<span class="badge red">${r.violations.length} 项告警</span>`;
    if (r.shed.objects.filter((o) => o.type !== 'column').length === 0) return '<span class="badge gray">未布置</span>';
    return '<span class="badge 已交付">合格</span>';
  }

  function submit() {
    const r = p.status === '已退回' ? resubmit(p) : submitForReview(p);
    msg = r.ok ? '已提交主管审核' : r.msg;
    if (r.ok) setTimeout(() => (msg = ''), 2500);
  }

  function fmtDate(d) {
    return d;
  }
</script>

{#key p.id}
<div class="page-head">
  <button class="sm" onclick={() => go('project-list')}>← 返回列表</button>
  <h1 style="margin:0">{p.name}</h1>
  <span class="badge {p.status}">{p.status}</span>
  {#if p.reworkCount > 2}
    <span class="badge red">返工 {p.reworkCount} 次(超限标红)</span>
  {:else if p.reworkCount > 0}
    <span class="badge gray">返工 {p.reworkCount} 次</span>
  {/if}
  <span class="spacer"></span>
  <button class="sm" onclick={() => exportBOMCSV(p)}>导出物料清单 CSV</button>
  {#if p.status === '已交付'}
    <button class="sm primary" onclick={() => go('deliverables', { id: p.id })}>查看交付包</button>
  {/if}
</div>

{#if p.status === '已退回'}
  <div class="alert error">
    <b>整单退回原因(第 {p.reworkCount} 次返工):</b>{p.returnReason}
  </div>
{/if}
{#if msg}
  <div class="alert {msg.includes('无法') || msg.includes('违规') ? 'error' : 'ok'}">{msg}</div>
{/if}

<div class="grid" style="grid-template-columns:2fr 1fr;align-items:start">
  <div>
    <div class="card" style="margin-bottom:16px">
      <h2>需求信息</h2>
      <div class="grid" style="grid-template-columns:repeat(4,1fr)">
        <div><span class="muted small">项目编号</span><br /><b>{p.code}</b></div>
        <div><span class="muted small">菇棚数量</span><br /><b>{p.shedCount} 个</b></div>
        <div><span class="muted small">需求层数</span><br /><b>{p.layers} 层</b></div>
        <div><span class="muted small">单层承重</span><br /><b>{p.loadPerLayer} kg</b></div>
        <div><span class="muted small">客户</span><br />{p.customer}</div>
        <div><span class="muted small">制作员</span><br />{p.maker}</div>
        <div><span class="muted small">主管</span><br />{p.supervisor}</div>
        <div><span class="muted small">交期</span><br /><b style={new Date(p.deadline) < new Date() && p.status !== '已交付' ? 'color:var(--red)' : ''}>{fmtDate(p.deadline)}</b></div>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="row">
        <h2 style="margin:0">逐棚布置({p.sheds.length})</h2>
        <span class="spacer"></span>
        {#if canEdit}
          <button class="primary sm" onclick={submit}>
            {p.status === '已退回' ? '返工后重新提交' : '提交主管审核'}
          </button>
        {/if}
      </div>
      <div class="grid" style="grid-template-columns:repeat(3,1fr);margin-top:14px">
        {#each val.perShed as r (r.shed.id)}
          {@const rework = p.shedRework[r.shed.id] || 0}
          <div class="card" style="padding:14px;{rework > 2 ? 'border-color:var(--red);box-shadow:0 0 0 1px var(--red)' : ''}">
            <div class="row">
              <b>{r.shed.name}</b>
              <span class="spacer"></span>
              {#if rework > 2}<span class="badge red">返工{rework}次</span>{/if}
            </div>
            <div class="small muted" style="margin:6px 0">
              {r.shed.w}m × {r.shed.d}m ·
              设备 {r.shed.objects.filter((o) => o.type !== 'column').length} 件
            </div>
            <div style="margin-bottom:8px">{@html shedBadge(r)}</div>
            {#if r.violations.length > 0}
              <div class="small" style="color:var(--red);max-height:56px;overflow:auto">
                {#each r.violations.slice(0, 3) as v}· {v.reason}<br />{/each}
                {#if r.violations.length > 3}<span class="muted">等 {r.violations.length} 项</span>{/if}
              </div>
            {/if}
            <button class="sm primary" style="width:100%;margin-top:8px"
              onclick={() => go('shed-editor', { id: p.id, shedId: r.shed.id })}>
              {canEdit ? '进入三维布置' : '查看三维场景'}
            </button>
          </div>
        {/each}
      </div>
    </div>

    <div class="card">
      <h2>操作时间线</h2>
      <ul class="timeline">
        {#each [...p.timeline].reverse() as t (t.id)}
          <li>
            <div><span class="t-user">{t.user}</span> · {t.action}</div>
            {#if t.detail}<div class="small muted">{t.detail}</div>{/if}
            <div class="t-time">{t.time}</div>
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <div>
    <div class="card" style="margin-bottom:16px">
      <h2>物料清单(自动汇总)</h2>
      <table>
        <thead><tr><th>物料</th><th>数量</th><th>单位</th></tr></thead>
        <tbody>
          {#each val.bom as b}
            <tr><td>{b.name}</td><td><b>{b.qty}</b></td><td>{b.unit}</td></tr>
          {/each}
        </tbody>
      </table>
      <button class="sm" style="width:100%;margin-top:10px" onclick={() => exportBOMCSV(p)}>导出 CSV</button>
    </div>

    <div class="card">
      <h2>碰撞告警汇总</h2>
      {#if val.total === 0}
        <div class="alert ok">全部棚区无碰撞告警</div>
      {:else}
        {#each val.perShed.filter((r) => r.violations.length) as r}
          <div class="alert error">
            <b>{r.shed.name}({r.violations.length} 项)</b>
            <div class="small">
              {#each [...new Set(r.violations.map((v) => v.reason))].slice(0, 4) as reason}
                · {reason}<br />
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
{/key}
