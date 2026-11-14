<script>
import { state as appState, go, dashboardStats } from '../lib/store.svelte.js';
  import { ROLE_LABEL } from '../lib/constants.js';

  const stats = $derived(dashboardStats());
  const isSuper = $derived(appState.user.role === 'supervisor');

  const weekRange = $derived.by(() => {
    const f = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
    const end = new Date();
    end.setDate(end.getDate() + 7);
    return `${f(new Date())} - ${f(end)}`;
  });

  function statusClass(p) {
    if (p.status === '已退回' && p.reworkCount > 2) return 'badge red';
    return `badge ${p.status}`;
  }
</script>

<h1>{appState.user.name}的工作台</h1>
<p class="muted" style="margin-top:-4px">
  {ROLE_LABEL[appState.user.role]}视图 · 本周范围 {weekRange}
</p>

<div class="grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:18px">
  <div class="card stat">
    <div class="num">{stats.todo.length}</div>
    <div class="lbl">{isSuper ? '待我审核' : '我的待办'}</div>
  </div>
  <div class="card stat blue">
    <div class="num">{stats.reviewing.length}</div>
    <div class="lbl">在审数量</div>
  </div>
  <div class="card stat amber">
    <div class="num">{stats.weekDue.length}</div>
    <div class="lbl">本周交期</div>
  </div>
  <div class="card stat red">
    <div class="num">{stats.overdue.length}</div>
    <div class="lbl">超期项目</div>
  </div>
</div>

<div class="grid" style="grid-template-columns:2fr 1fr;align-items:start">
  <div class="card">
    <h2>{isSuper ? '待审核项目' : '我的待办'}</h2>
    {#if stats.todo.length === 0}
      <div class="empty">暂无待办,可以喝杯茶 🍄</div>
    {:else}
      <table>
        <thead>
          <tr><th>项目编号</th><th>项目名称</th><th>状态</th><th>交期</th><th>操作</th></tr>
        </thead>
        <tbody>
          {#each stats.todo as p (p.id)}
            <tr>
              <td>{p.code}</td>
              <td>{p.name}</td>
              <td><span class={statusClass(p)}>{p.status}{p.status === '已退回' ? ` · 返工${p.reworkCount}次` : ''}</span></td>
              <td>{p.deadline}</td>
              <td>
                {#if appState.user.role === 'supervisor'}
                  <button class="sm primary" onclick={() => go('review', { id: p.id })}>去审核</button>
                {:else if appState.user.role === 'maker'}
                  <button class="sm primary" onclick={() => go('project-detail', { id: p.id })}>去制作</button>
                {:else}
                  <button class="sm" onclick={() => go('project-detail', { id: p.id })}>查看详情</button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>

  <div class="card" style="border-color:#f0c9c9">
    <h2 style="color:var(--red)">⚠ 超期项目(单独一栏)</h2>
    {#if stats.overdue.length === 0}
      <div class="empty small">没有超期项目</div>
    {:else}
      {#each stats.overdue as p (p.id)}
        <button class="alert error alert-btn" onclick={() => go('project-detail', { id: p.id })}>
          <b>{p.code}</b> · {p.name}<br />
          交期 {p.deadline} · 当前 {p.status}
        </button>
      {/each}
    {/if}

    <h2 style="margin-top:18px">本周交期</h2>
    {#if stats.weekDue.length === 0}
      <div class="empty small">本周无到期项目</div>
    {:else}
      {#each stats.weekDue as p (p.id)}
        <button class="alert warn alert-btn" onclick={() => go('project-detail', { id: p.id })}>
          <b>{p.name}</b><br />交期 {p.deadline} · {p.status}
        </button>
      {/each}
    {/if}
  </div>
</div>
