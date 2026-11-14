<script>
  import { onMount } from 'svelte';
  import * as db from '../lib/db.js';
  import { TOWNSHIPS } from '../lib/data/sampleCounty.js';

  let custom = null;
  let msg = '';

  onMount(async () => {
    custom = await db.kvGet('townships');
  });

  // 导入 GeoJSON 替换乡镇界:支持 Polygon/MultiPolygon Feature,名称取 properties.name
  async function importGeoJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const gj = JSON.parse(await file.text());
      const feats = gj.type === 'FeatureCollection' ? gj.features : [gj];
      const towns = [];
      for (const f of feats) {
        const name = (f.properties && (f.properties.name || f.properties.NAME)) || `乡镇${towns.length + 1}`;
        const g = f.geometry;
        if (!g) continue;
        const ring = g.type === 'Polygon' ? g.coordinates[0]
          : g.type === 'MultiPolygon' ? g.coordinates[0][0] : null;
        if (ring && ring.length >= 4) towns.push({ name, ring });
      }
      if (!towns.length) { msg = '未在文件中找到有效的面要素'; return; }
      await db.kvSet('townships', towns);
      custom = towns;
      msg = `已导入 ${towns.length} 个乡镇界,刷新加工台后生效`;
    } catch (err) {
      msg = '解析失败:' + err.message;
    }
    e.target.value = '';
  }

  async function resetDefault() {
    await db.kvSet('townships', null);
    custom = null;
    msg = '已恢复内置模拟乡镇界';
  }

  async function clearAll() {
    if (!confirm('将清空全部档案、批次、版本与报告,确认?')) return;
    for (const s of ['informants', 'batches', 'versions', 'reports']) {
      const rows = await db.list(s);
      for (const r of rows) await db.remove(s, r.id);
    }
    await db.kvSet('workDraft', null);
    await db.kvSet('seeded', null);
    msg = '已清空全部数据,刷新页面后重新播种示例数据';
  }
</script>

<div class="card">
  <h3>底图数据</h3>
  <p>当前乡镇界:{custom ? `自定义 GeoJSON(${custom.length} 个乡镇)` : `内置模拟县域(${TOWNSHIPS.length} 个乡镇)`}</p>
  <label>导入乡镇界 GeoJSON <input type="file" accept=".json,.geojson" on:change={importGeoJSON} /></label>
  <button class="ghost" on:click={resetDefault} disabled={!custom}>恢复内置数据</button>
  {#if msg}<p style="color:#7ec8ff">{msg}</p>{/if}
  <p class="muted">说明:坐标需为 0–100 范围内的平面公里坐标,与内置县域坐标系一致。</p>
</div>

<div class="card">
  <h3>危险操作</h3>
  <button class="danger" on:click={clearAll}>清空全部数据</button>
</div>

<style>
  h3 { margin-top: 0; font-size: 15px; }
  label { display: block; margin: 10px 0; font-size: 13px; }
</style>
