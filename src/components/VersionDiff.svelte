<script>
  import { onMount, onDestroy } from 'svelte';
  import { createTerrain } from '../lib/terrain.js';
  import { createVectorLayer } from '../lib/vectorLayer.js';
  import { compareVersions } from '../lib/geo/diff.js';
  import { TOWNSHIPS } from '../lib/data/sampleCounty.js';
  import * as db from '../lib/db.js';

  let container;
  let terrain, layer;
  let workDraft = null;
  let lastVersion = null;
  let diff = null;
  let changeNote = '';
  let versions = [];
  let msg = '';

  async function reload() {
    versions = (await db.list('versions')).sort((a, b) => b.num - a.num);
    lastVersion = versions.find((v) => v.status === 'archived') || versions[0] || null;
    workDraft = await db.kvGet('workDraft');
    if (workDraft && lastVersion) {
      diff = compareVersions(lastVersion.zones, workDraft.zones);
    } else if (workDraft) {
      diff = compareVersions([], workDraft.zones);
    } else {
      diff = null;
    }
    redraw();
  }

  function redraw() {
    if (!layer) return;
    layer.draw({
      zones: workDraft ? workDraft.zones : [],
      isoglosses: workDraft ? workDraft.isoglosses : [],
      points: workDraft ? workDraft.points : [],
      diff
    });
  }

  async function submit() {
    if (!workDraft || !workDraft.zones.length) { alert('加工台还没有分区工作稿,请先在加工台绘制'); return; }
    if (diff && diff.needChangeNote && !changeNote.trim()) {
      alert(`差异面积 ${diff.diffPercent}% 超过 5%,必须填写变更说明`);
      return;
    }
    const num = (versions.length ? Math.max(...versions.map((v) => v.num)) : 0) + 1;
    await db.add('versions', {
      num,
      createdAt: Date.now(),
      year: new Date().getFullYear(),
      status: 'pending',
      zones: workDraft.zones,
      isoglosses: workDraft.isoglosses,
      points: workDraft.points,
      baseVersion: lastVersion ? lastVersion.num : null,
      diff,
      changeNote: changeNote.trim()
    });
    msg = `已提交版本 V${num},等待审核`;
    changeNote = '';
    await reload();
  }

  onMount(async () => {
    const custom = await db.kvGet('townships');
    terrain = createTerrain(container, custom && custom.length ? custom : TOWNSHIPS, () => redraw());
    layer = createVectorLayer(container, terrain);
    const loop = () => { terrain.render(); raf = requestAnimationFrame(loop); };
    let raf = requestAnimationFrame(loop);
    onDestroy(() => cancelAnimationFrame(raf));
    await reload();
  });
</script>

<div class="layout">
  <div class="left">
    <div class="card">
      <h3>提交新版本 — 与上一轮分区比对</h3>
      {#if !workDraft}
        <p class="muted">加工台暂无工作稿。请先到「区划加工台」绘制分区。</p>
      {:else}
        <p>基准版本:{lastVersion ? `V${lastVersion.num}(${lastVersion.status === 'archived' ? '已归档' : '待审'})` : '无(首个版本)'}</p>
        {#if diff}
          <table>
            <tr><th>新增面积</th><th>删除面积</th><th>差异总面积</th><th>差异占比</th></tr>
            <tr>
              <td style="color:#2ecc71">{diff.addedArea} km²</td>
              <td style="color:#e74c3c">{diff.removedArea} km²</td>
              <td>{diff.diffArea} km²</td>
              <td class:warn={diff.needChangeNote}>{diff.diffPercent}%{diff.needChangeNote ? ' ⚠ 超过 5%' : ''}</td>
            </tr>
          </table>
          {#if diff.moved.length}
            <p>移动边界:{#each diff.moved as m}<span class="tag moved">{m.name} 位移 {m.shift}km / 面积变化 {m.areaChange}%</span>{/each}</p>
          {/if}
          {#if diff.addedZones.length}<p>新增分区:{#each diff.addedZones as n}<span class="tag added">{n}</span>{/each}</p>{/if}
          {#if diff.removedZones.length}<p>删除分区:{#each diff.removedZones as n}<span class="tag removed">{n}</span>{/each}</p>{/if}
          <p class="muted">地图上:绿色=新增区域,红色=删除区域。</p>
          <label class="note">
            变更说明{#if diff.needChangeNote}<b style="color:#e74c3c">(差异超 5%,必填)</b>{/if}
            <textarea rows="3" bind:value={changeNote} placeholder="说明本轮边界调整的原因、依据的调查资料…"></textarea>
          </label>
          <button on:click={submit}>提交新版本(进入待审核)</button>
          {#if msg}<p style="color:#2ecc71">{msg}</p>{/if}
        {/if}
      {/if}
    </div>
    <div class="card">
      <h3>历史版本</h3>
      <table>
        <thead><tr><th>版本</th><th>提交时间</th><th>状态</th><th>差异占比</th><th>变更说明</th></tr></thead>
        <tbody>
          {#each versions as v}
            <tr>
              <td>V{v.num}</td>
              <td>{new Date(v.createdAt).toLocaleString()}</td>
              <td>{{ draft: '草稿', pending: '待审核', archived: '已归档', rejected: '已驳回' }[v.status]}</td>
              <td>{v.diff ? v.diff.diffPercent + '%' : '—'}</td>
              <td class="muted">{v.changeNote || '—'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
  <div class="map" bind:this={container}></div>
</div>

<style>
  .layout { display: flex; gap: 14px; height: calc(100vh - 130px); }
  .left { width: 46%; overflow-y: auto; }
  .map { flex: 1; position: relative; border: 1px solid #2a3646; border-radius: 6px; overflow: hidden; }
  .warn { color: #e74c3c; font-weight: bold; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 12px; margin: 2px; }
  .tag.added { background: #1e5c3a; }
  .tag.removed { background: #6e2b22; }
  .tag.moved { background: #7a5c14; }
  .note { display: block; margin: 10px 0; font-size: 13px; }
  .note textarea { width: 100%; margin-top: 4px; }
  h3 { margin-top: 0; font-size: 15px; }
</style>
