<script>
  import { onMount } from 'svelte';
  import * as db from '../lib/db.js';
  import { multiPolygonArea } from '../lib/geo/area.js';

  let pending = [];
  let reports = [];
  let informants = [];
  let viewing = null; // 正在预览报告的版本

  async function reload() {
    const versions = await db.list('versions');
    pending = versions.filter((v) => v.status === 'pending').sort((a, b) => b.num - a.num);
    reports = (await db.list('reports')).sort((a, b) => b.id - a.id);
    informants = await db.list('informants');
  }
  onMount(reload);

  function buildReport(v) {
    const year = v.year;
    const infs = informants.filter((i) => !year || i.year <= year);
    const totalPhoneme = infs.reduce((s, i) => s + (i.phonemeCount || 0), 0);
    const totalRec = infs.reduce((s, i) => s + (i.recordings || []).length, 0);
    return {
      title: `方言区划调查成果报告(V${v.num})`,
      date: new Date().toLocaleString(),
      zoneCount: v.zones.length,
      zones: v.zones.map((z) => ({ name: z.name, area: +multiPolygonArea(z.geom).toFixed(1) })),
      isoglossCount: (v.isoglosses || []).length,
      pointCount: (v.points || []).length,
      informantCount: infs.length,
      totalPhoneme,
      totalRec,
      diff: v.diff,
      changeNote: v.changeNote
    };
  }

  async function approve(v) {
    const report = buildReport(v);
    await db.put('versions', { ...v, status: 'archived', reviewedAt: Date.now() });
    await db.add('reports', { versionNum: v.num, createdAt: Date.now(), ...report });
    viewing = null;
    await reload();
    alert(`V${v.num} 审核通过,成果报告已生成并归档`);
  }

  async function reject(v) {
    const reason = prompt('驳回原因:');
    if (reason === null) return;
    await db.put('versions', { ...v, status: 'rejected', rejectReason: reason });
    await reload();
  }

  function printReport() {
    window.print();
  }
</script>

<div class="card">
  <h3>待审核版本({pending.length})</h3>
  {#if !pending.length}<p class="muted">暂无待审核版本,请在「版本比对」页提交。</p>{/if}
  {#each pending as v}
    <div class="ver">
      <b>V{v.num}</b>
      <span class="muted">{new Date(v.createdAt).toLocaleString()} · 分区 {v.zones.length} 个 · 差异 {v.diff ? v.diff.diffPercent + '%' : '—'}</span>
      <span class="muted">变更说明:{v.changeNote || '无'}</span>
      <div>
        <button on:click={() => (viewing = buildReport(v))}>预览成果报告</button>
        <button on:click={() => approve(v)}>✔ 审核通过并归档</button>
        <button class="danger" on:click={() => reject(v)}>✘ 驳回</button>
      </div>
    </div>
  {/each}
</div>

{#if viewing}
  <div class="card report" id="report">
    <h2>{viewing.title}</h2>
    <p class="muted">生成时间:{viewing.date}</p>
    <h4>一、方言分区({viewing.zoneCount} 个)</h4>
    <table>
      <tr><th>分区名称</th><th>面积(km²)</th></tr>
      {#each viewing.zones as z}<tr><td>{z.name}</td><td>{z.area}</td></tr>{/each}
    </table>
    <h4>二、调查规模</h4>
    <p>发音人 {viewing.informantCount} 人;音系条目累计 {viewing.totalPhoneme} 条;录音条目 {viewing.totalRec} 条;同音线 {viewing.isoglossCount} 条;调查点 {viewing.pointCount} 个。</p>
    {#if viewing.diff}
      <h4>三、本轮区划变更</h4>
      <p>新增 {viewing.diff.addedArea} km²,删除 {viewing.diff.removedArea} km²,差异占比 {viewing.diff.diffPercent}%。</p>
      {#if viewing.diff.moved.length}
        <p>移动边界:{viewing.diff.moved.map((m) => `${m.name}(位移 ${m.shift}km)`).join('、')}</p>
      {/if}
      <p>变更说明:{viewing.changeNote || '无'}</p>
    {/if}
    <div class="noprint">
      <button on:click={printReport}>打印 / 导出 PDF</button>
      <button class="ghost" on:click={() => (viewing = null)}>关闭预览</button>
    </div>
  </div>
{/if}

<div class="card">
  <h3>已归档成果报告({reports.length})</h3>
  <table>
    <thead><tr><th>报告</th><th>对应版本</th><th>归档时间</th><th>分区数</th><th>发音人</th></tr></thead>
    <tbody>
      {#each reports as r}
        <tr>
          <td>{r.title}</td><td>V{r.versionNum}</td>
          <td>{new Date(r.createdAt).toLocaleString()}</td>
          <td>{r.zoneCount}</td><td>{r.informantCount}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .ver { display: grid; gap: 4px; padding: 10px; border: 1px solid #2a3646; border-radius: 5px; margin: 8px 0; font-size: 13px; }
  .report { background: #f5f2ea; color: #222; }
  .report h2 { font-size: 18px; }
  .report h4 { margin: 12px 0 6px; }
  .report table { background: #fff; }
  .report th, .report td { border-color: #ccc; color: #222; }
  .report th { background: #e8e2d4; color: #333; }
  .report .muted { color: #777; }
  @media print {
    .noprint { display: none; }
  }
  h3 { margin-top: 0; font-size: 15px; }
</style>
