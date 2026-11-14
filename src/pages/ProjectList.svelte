<script>
import { state as appState, go, dashboardStats } from '../lib/store.svelte.js';

  const stats = $derived(dashboardStats());
  let statusFilter = $state('全部');
  let dueFilter = $state('全部');   // 全部 / 本周 / 已超期 / 本月

  const statuses = ['全部', '制作中', '待审核', '已退回', '已交付'];

  const today = new Date();
  const inRange = (p) => {
    const d = new Date(p.deadline);
    const week = new Date(); week.setDate(today.getDate() + 7);
    const month = new Date(); month.setMonth(today.getMonth() + 1);
    if (dueFilter === '本周') return d >= today && d <= week;
    if (dueFilter === '本月') return d >= today && d <= month;
    if (dueFilter === '已超期') return d < today && p.status !== '已交付';
    return true;
  };

  const list = $derived(
    stats.mine
      .filter((p) => statusFilter === '全部' || p.status === statusFilter)
      .filter(inRange)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  );

  function isOverdue(p) {
    return p.status !== '已交付' && new Date(p.deadline) < today;
  }
  function badgeClass(p) {
    if (p.status === '已退回' && p.reworkCount > 2) return 'badge red';
    return `badge ${p.status}`;
  }
</script>

<h1>{appState.user.role === 'supervisor' ? '全部项目' : '我的项目'}</h1>

<div class="card" style="border-color:#f0c9c9;margin-bottom:16px">
  <h2 style="color:var(--red)">⚠ 超期项目栏({stats.overdue.length})</h2>
  {#if stats.overdue.length === 0}
    <span class="muted small">暂无超期项目</span>
  {:else}
    <div class="row">
      {#each stats.overdue as p (p.id)}
        <button class="sm danger" onclick={() => go('project-detail', { id: p.id })}>
          {p.code} · {p.name}(交期 {p.deadline})
        </button>
      {/each}
    </div>
  {/if}
</div>

<div class="card">
  <div class="row" style="margin-bottom:14px">
    <div class="pill-tab">
      {#each statuses as s}
        <button class={statusFilter === s ? 'active' : ''} onclick={() => (statusFilter = s)}>{s}</button>
      {/each}
    </div>
    <span class="spacer"></span>
    <span class="flabel" style="margin:0">交期筛选</span>
    <select style="width:150px" bind:value={dueFilter}>
      <option>全部</option>
      <option>本周</option>
      <option>本月</option>
      <option>已超期</option>
    </select>
    {#if appState.user.role === 'customer'}
      <button class="primary sm" onclick={() => go('order-new')}>+ 下需求单</button>
    {/if}
  </div>

  {#if list.length === 0}
    <div class="empty">没有符合筛选条件的项目</div>
  {:else}
    <table>
      <thead>
        <tr>
          <th>项目编号</th><th>项目名称</th><th>菇棚</th><th>状态</th>
          <th>返工</th><th>交期</th><th>版本</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        {#each list as p (p.id)}
          <tr style={isOverdue(p) ? 'background:#fff7f7' : ''}>
            <td>{p.code}</td>
            <td>
              {p.name}
              {#if isOverdue(p)}<span class="badge red" style="margin-left:6px">超期</span>{/if}
            </td>
            <td>{p.shedCount} 个</td>
            <td><span class={badgeClass(p)}>{p.status}</span></td>
            <td style={p.reworkCount > 2 ? 'color:var(--red);font-weight:700' : ''}>
              {p.reworkCount} 次
            </td>
            <td>{p.deadline}</td>
            <td>{p.version}</td>
            <td>
              <button class="sm" onclick={() => go('project-detail', { id: p.id })}>
                {appState.user.role === 'supervisor' ? '查看' : '进入'}
              </button>
              {#if p.status === '已交付'}
                <button class="sm" onclick={() => go('deliverables', { id: p.id })}>交付包</button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
