<script>
  import { onMount } from 'svelte';
  import * as db from '../lib/db.js';
  import { TOWNSHIP_NAMES, PHONEME_FEATURES } from '../lib/data/sampleCounty.js';

  let informants = [];
  let form = { name: '', age: '', township: TOWNSHIP_NAMES[0], phonemeCount: 0, year: new Date().getFullYear(), features: [] };
  let recordingText = '';
  let recordings = [];
  let editingId = null;

  async function reload() { informants = await db.list('informants'); }
  onMount(reload);

  function nextCode() {
    const y = form.year;
    const n = informants.filter((i) => i.code && i.code.startsWith(`F${y}`)).length + 1;
    return `F${y}-${String(n).padStart(3, '0')}`;
  }

  function addRecording() {
    if (!recordingText.trim()) return;
    recordings = [...recordings, { name: recordingText.trim(), note: '' }];
    recordingText = '';
  }

  function toggleFeature(f) {
    form.features = form.features.includes(f)
      ? form.features.filter((x) => x !== f)
      : [...form.features, f];
  }

  async function save() {
    if (!form.name.trim()) { alert('请填写姓名'); return; }
    const rec = {
      code: editingId ? informants.find((i) => i.id === editingId).code : nextCode(),
      name: form.name.trim(),
      age: +form.age || 0,
      township: form.township,
      phonemeCount: +form.phonemeCount || 0,
      year: +form.year,
      features: [...form.features],
      recordings,
      createdAt: Date.now()
    };
    if (editingId) { rec.id = editingId; await db.put('informants', rec); }
    else await db.add('informants', rec);
    reset();
    await reload();
  }

  function edit(inf) {
    editingId = inf.id;
    form = { name: inf.name, age: inf.age, township: inf.township, phonemeCount: inf.phonemeCount, year: inf.year, features: [...(inf.features || [])] };
    recordings = (inf.recordings || []).map((r) => ({ ...r }));
  }

  async function del(id) {
    if (!confirm('确认删除该发音人档案?')) return;
    await db.remove('informants', id);
    await reload();
  }

  function reset() {
    editingId = null;
    form = { name: '', age: '', township: TOWNSHIP_NAMES[0], phonemeCount: 0, year: new Date().getFullYear(), features: [] };
    recordings = [];
  }
</script>

<div class="card">
  <h3>{editingId ? '编辑档案' : '新建发音人档案'} <span class="muted">编号:{editingId ? informants.find(i=>i.id===editingId)?.code : nextCode()}</span></h3>
  <div class="grid">
    <label>姓名 <input bind:value={form.name} /></label>
    <label>年龄 <input type="number" bind:value={form.age} min="0" max="120" /></label>
    <label>乡镇
      <select bind:value={form.township}>
        {#each TOWNSHIP_NAMES as t}<option value={t}>{t}</option>{/each}
      </select>
    </label>
    <label>音系条目数 <input type="number" bind:value={form.phonemeCount} min="0" /></label>
    <label>调查年份 <input type="number" bind:value={form.year} min="1950" max="2100" /></label>
  </div>
  <div class="features">
    音系特征:
    {#each PHONEME_FEATURES as f}
      <label class="chip" class:on={form.features.includes(f)}>
        <input type="checkbox" hidden checked={form.features.includes(f)} on:change={() => toggleFeature(f)} />{f}
      </label>
    {/each}
  </div>
  <div class="recordings">
    <b>录音条目({recordings.length})</b>
    {#each recordings as r, i}
      <div class="rec-row">
        <input bind:value={r.name} placeholder="录音名称" />
        <input bind:value={r.note} placeholder="备注" />
        <button class="danger" on:click={() => (recordings = recordings.filter((_, j) => j !== i))}>删</button>
      </div>
    {/each}
    <div class="rec-row">
      <input bind:value={recordingText} placeholder="新录音条目名称,回车添加" on:keydown={(e) => e.key === 'Enter' && addRecording()} />
      <button class="ghost" on:click={addRecording}>添加录音</button>
    </div>
  </div>
  <div style="margin-top:10px">
    <button on:click={save}>{editingId ? '保存修改' : '建档'}</button>
    {#if editingId}<button class="ghost" on:click={reset}>取消编辑</button>{/if}
  </div>
</div>

<div class="card">
  <h3>发音人档案库({informants.length})</h3>
  <table>
    <thead><tr><th>编号</th><th>姓名</th><th>年龄</th><th>乡镇</th><th>音系条目</th><th>录音条目</th><th>年份</th><th>特征</th><th></th></tr></thead>
    <tbody>
      {#each informants as inf}
        <tr>
          <td>{inf.code}</td><td>{inf.name}</td><td>{inf.age}</td><td>{inf.township}</td>
          <td>{inf.phonemeCount}</td><td>{(inf.recordings || []).length}</td><td>{inf.year}</td>
          <td class="muted">{(inf.features || []).join('、')}</td>
          <td>
            <button class="ghost" on:click={() => edit(inf)}>编辑</button>
            <button class="danger" on:click={() => del(inf.id)}>删除</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .grid { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
  .grid label { display: flex; align-items: center; gap: 6px; font-size: 13px; }
  .grid input { width: 110px; }
  .features { margin: 8px 0; font-size: 13px; }
  .chip { display: inline-block; padding: 2px 10px; margin: 2px; border-radius: 12px; background: #222d3d; cursor: pointer; font-size: 12px; }
  .chip.on { background: #2f6db3; color: #fff; }
  .rec-row { display: flex; gap: 6px; margin: 4px 0; }
  .rec-row input { flex: 1; }
  h3 { margin-top: 0; font-size: 15px; }
</style>
