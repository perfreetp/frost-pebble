<script>
import { getProject, go, exportJSON, exportBOMCSV, projectValidation } from '../lib/store.svelte.js';
  import { EQUIP_TYPES } from '../lib/constants.js';

  let { id } = $props();
  const p = $derived(getProject(id));
  const val = $derived(projectValidation(p));

  function shedCount(shed) {
    const c = { rack: 0, tray: 0, pipe: 0, fan: 0, light: 0 };
    for (const o of shed.objects ?? []) {
      if (o.type === 'pipe') c.pipe = +(c.pipe + (o.size?.d ?? EQUIP_TYPES.pipe.d)).toFixed(1);
      else if (c[o.type] !== undefined) c[o.type] += 1;
    }
    return c;
  }
</script>

<div class="page-head">
  <button class="sm" onclick={() => go('project-detail', { id: p.id })}>← 返回项目</button>
  <h1 style="margin:0">交付包 · {p.name}</h1>
  <span class="spacer"></span>
  <button class="sm" onclick={() => exportBOMCSV(p)}>导出物料清单 CSV</button>
  <button class="primary sm" onclick={() => exportJSON(p)}>下载交付包 JSON</button>
</div>

{#if p.status !== '已交付'}
  <div class="alert warn">项目尚未通过审核打包,当前导出的是过程数据(无交付包编号)</div>
{/if}

<div class="grid" style="grid-template-columns:1fr 1fr;align-items:start">
  <div class="card">
    <h2>交付信息</h2>
    <table>
      <tbody>
        <tr><td>交付包编号</td><td><b>{p.packageId ?? '打包后生成'}</b></td></tr>
        <tr><td>项目编号</td><td>{p.code}</td></tr>
        <tr><td>版本号</td><td><b>{p.version}</b></td></tr>
        <tr><td>交付时间</td><td><b>{p.deliveredAt ?? '—'}</b></td></tr>
        <tr><td>需求交期</td><td>{p.deadline}</td></tr>
        <tr><td>客户 / 制作员 / 主管</td><td>{p.customer} / {p.maker} / {p.supervisor}</td></tr>
        <tr><td>累计返工</td><td style={p.reworkCount > 2 ? 'color:var(--red);font-weight:700' : ''}>{p.reworkCount} 次</td></tr>
        <tr><td>最终碰撞告警</td><td>{val.total} 项</td></tr>
      </tbody>
    </table>

    <h2 style="margin-top:18px">交付包内容(JSON 结构)</h2>
    <ul class="small muted">
      <li>项目信息、版本号与交付时间</li>
      <li>需求参数:菇棚数量 / 层数 / 单层承重</li>
      <li>物料清单汇总与各棚明细</li>
      <li>每个物体的编号、类型、坐标、旋转与尺寸</li>
      <li>各棚碰撞告警与完整操作时间线(含操作人)</li>
    </ul>
  </div>

  <div>
    <div class="card" style="margin-bottom:16px">
      <h2>物料清单</h2>
      <table>
        <thead><tr><th>物料</th><th>数量</th><th>单位</th></tr></thead>
        <tbody>
          {#each val.bom as b}
            <tr><td>{b.name}</td><td><b>{b.qty}</b></td><td>{b.unit}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="card" style="margin-bottom:16px">
      <h2>各棚交付明细</h2>
      {#each val.perShed as r (r.shed.id)}
        {@const c = shedCount(r.shed)}
        <div style="padding:8px 0;border-bottom:1px solid var(--line)">
          <b>{r.shed.name}</b>
          <span class="muted small">({r.shed.w}×{r.shed.d}m)</span>
          <div class="small" style="margin-top:4px">
            层架 {c.rack} 套 · 托盘 {c.tray} 个 · 管道 {c.pipe} 米 · 风机 {c.fan} 台 · 灯具 {c.light} 盏
          </div>
          <div class="small" style="color:{r.violations.length ? 'var(--red)' : 'var(--brand-dark)'}">
            {r.violations.length ? `告警 ${r.violations.length} 项` : '✔ 无告警'}
            {#if r.aisleMap.min !== null} · 最窄走道 {r.aisleMap.min}m{/if}
          </div>
        </div>
      {/each}
    </div>

    <div class="card">
      <h2>完整时间线</h2>
      <ul class="timeline" style="max-height:300px;overflow:auto">
        {#each [...p.timeline].reverse() as t (t.id)}
          <li>
            <span class="t-user">{t.user}</span>({t.role}) · {t.action}
            {#if t.detail}<div class="small muted">{t.detail}</div>{/if}
            <div class="t-time">{t.time}</div>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>
