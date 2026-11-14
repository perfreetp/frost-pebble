<script>
  import { onMount } from 'svelte';
  import * as db from '../lib/db.js';
  import { TOWNSHIP_NAMES, PHONEME_FEATURES } from '../lib/data/sampleCounty.js';

  let informants = [];
  let versions = [];
  let reports = [];

  let fZone = '';
  let fTownship = '';
  let fFeature = '';
  let fYear = '';

  let zoneNames = [];

  async function reload() {
    informants = await db.list('informants');
    versions = await db.list('versions');
    reports = await db.list('reports');
    const names = new Set();
    for (const v of versions) for (const z of v.zones || []) names.add(z.name);
    zoneNames = [...names];
  }
  onMount(reload);

  $: years = [...new Set(informants.map((i) => i.year))].sort();

  // 组合过滤:方言区(命中该区分区内的调查点所属乡镇的发音人近似关联)、乡镇、音系特征、年份
  $: filtered = informants.filter((i) => {
    if (fTownship && i.township !== fTownship) return false;
    if (fFeature && !(i.features || []).includes(fFeature)) return false;
    if (fYear && String(i.year) !== String(fYear)) return false;
    if (fZone) {
      // 发音人乡镇需落在所选方言区覆盖的乡镇中(按最新版本调查点所在乡镇近似)
      const v = [...versions].sort((a, b) => b.num - a.num).find((x) => (x.zones || []).some((z) => z.name === fZone));
      if (v) {
        const z = v.zones.find((x) => x.name === fZone);
        const towns = new Set((v.points || [])
          .filter((p) => p.township && pointInZone([p.x, p.y], z.geom))
          .map((p) => p.township));
        if (towns.size && !towns.has(i.township)) return false;
      }
    }
    return true;
  });

  function pointInZone(p, mp) {
    for (const poly of mp) {
      const ring = poly[0];
      let inside = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i], [xj, yj] = ring[j];
        if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
      }
      if (inside) return true;
    }
    return false;
  }

  $: filteredReports = reports.filter((r) => {
    if (fZone && !(r.zones || []).some((z) => z.name === fZone)) return false;
    if (fYear && String(new Date(r.createdAt).getFullYear()) !== String(fYear)) return false;
    return true;
  });
</script>

<div class="card">
  <h3>组合检索</h3>
  <div class="filters">
    <label>方言区
      <select bind:value={fZone}>
        <option value="">全部</option>
        {#each zoneNames as z}<option value={z}>{z}</option>{/each}
      </select>
    </label>
    <label>乡镇
      <select bind:value={fTownship}>
        <option value="">全部</option>
        {#each TOWNSHIP_NAMES as t}<option value={t}>{t}</option>{/each}
      </select>
    </label>
    <label>音系特征
      <select bind:value={fFeature}>
        <option value="">全部</option>
        {#each PHONEME_FEATURES as f}<option value={f}>{f}</option>{/each}
      </select>
    </label>
    <label>年份
      <select bind:value={fYear}>
        <option value="">全部</option>
        {#each years as y}<option value={y}>{y}</option>{/each}
      </select>
    </label>
    <button class="ghost" on:click={() => { fZone = fTownship = fFeature = fYear = ''; }}>清空条件</button>
  </div>
</div>

<div class="card">
  <h3>发音人结果({filtered.length})</h3>
  <table>
    <thead><tr><th>编号</th><th>姓名</th><th>年龄</th><th>乡镇</th><th>音系条目</th><th>录音条目</th><th>年份</th><th>特征</th></tr></thead>
    <tbody>
      {#each filtered as inf}
        <tr>
          <td>{inf.code}</td><td>{inf.name}</td><td>{inf.age}</td><td>{inf.township}</td>
          <td>{inf.phonemeCount}</td><td>{(inf.recordings || []).length}</td><td>{inf.year}</td>
          <td class="muted">{(inf.features || []).join('、')}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<div class="card">
  <h3>归档报告结果({filteredReports.length})</h3>
  <table>
    <thead><tr><th>报告</th><th>版本</th><th>归档时间</th><th>分区</th></tr></thead>
    <tbody>
      {#each filteredReports as r}
        <tr>
          <td>{r.title}</td><td>V{r.versionNum}</td>
          <td>{new Date(r.createdAt).toLocaleString()}</td>
          <td class="muted">{(r.zones || []).map((z) => z.name).join('、')}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .filters { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; font-size: 13px; }
  h3 { margin-top: 0; font-size: 15px; }
</style>
