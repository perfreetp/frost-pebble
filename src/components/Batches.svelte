<script>
  import { onMount } from 'svelte';
  import * as db from '../lib/db.js';

  let batches = [];
  let informants = [];
  let form = { name: '', date: new Date().toISOString().slice(0, 10), informantIds: [], note: '' };
  let files = [];
  let expanded = null;

  async function reload() {
    batches = (await db.list('batches')).sort((a, b) => b.id - a.id);
    informants = await db.list('informants');
  }
  onMount(reload);

  function onFiles(e) {
    for (const f of e.target.files) {
      files = [...files, { name: f.name, type: f.type, size: f.size, blob: f }];
    }
    e.target.value = '';
  }

  function toggleInformant(id) {
    form.informantIds = form.informantIds.includes(id)
      ? form.informantIds.filter((x) => x !== id)
      : [...form.informantIds, id];
  }

  async function save() {
    if (!form.name.trim()) { alert('请填写批次名称'); return; }
    await db.add('batches', {
      name: form.name.trim(),
      date: form.date,
      informantIds: [...form.informantIds],
      note: form.note,
      files: files.map((f) => ({ name: f.name, type: f.type, size: f.size, blob: f.blob })),
      createdAt: Date.now()
    });
    form = { name: '', date: new Date().toISOString().slice(0, 10), informantIds: [], note: '' };
    files = [];
    await reload();
  }

  async function del(id) {
    if (!confirm('确认删除该批次及其记音表文件?')) return;
    await db.remove('batches', id);
    await reload();
  }

  function download(file) {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement('a');
    a.href = url; a.download = file.name; a.click();
    URL.revokeObjectURL(url);
  }

  function infName(id) {
    const i = informants.find((x) => x.id === id);
    return i ? `${i.code} ${i.name}` : `#${id}`;
  }
</script>

<div class="card">
  <h3>新建调查批次</h3>
  <div class="row">
    <label>批次名称 <input bind:value={form.name} placeholder="如:2024 城关片第一批" /></label>
    <label>调查日期 <input type="date" bind:value={form.date} /></label>
  </div>
  <div class="row">
    <span>关联发音人:</span>
    {#each informants as inf}
      <label class="chip" class:on={form.informantIds.includes(inf.id)}>
        <input type="checkbox" hidden on:change={() => toggleInformant(inf.id)} />{inf.code} {inf.name}
      </label>
    {/each}
  </div>
  <div class="row">
    <label>挂接原始记音表 <input type="file" multiple on:change={onFiles} /></label>
  </div>
  {#if files.length}
    <div class="muted">待上传:{files.map((f) => f.name).join('、')}</div>
  {/if}
  <div class="row"><label style="flex:1">备注 <input style="width:100%" bind:value={form.note} /></label></div>
  <button on:click={save}>创建批次</button>
</div>

<div class="card">
  <h3>批次列表({batches.length})</h3>
  {#each batches as b}
    <div class="batch">
      <div class="batch-head" on:click={() => (expanded = expanded === b.id ? null : b.id)}>
        <b>{b.name}</b> <span class="muted">{b.date} · 发音人 {b.informantIds.length} 人 · 记音表 {b.files.length} 份</span>
        <button class="danger" style="float:right" on:click|stopPropagation={() => del(b.id)}>删除</button>
      </div>
      {#if expanded === b.id}
        <div class="batch-body">
          <div>发音人:{b.informantIds.map(infName).join('、') || '无'}</div>
          <div>备注:{b.note || '无'}</div>
          <div>原始记音表:
            {#each b.files as f}
              <div class="file-row">
                📄 {f.name} <span class="muted">({(f.size / 1024).toFixed(1)} KB)</span>
                <button class="ghost" on:click={() => download(f)}>下载</button>
              </div>
            {:else}
              <span class="muted">无</span>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .row { display: flex; gap: 14px; align-items: center; margin: 8px 0; flex-wrap: wrap; font-size: 13px; }
  .chip { display: inline-block; padding: 2px 10px; margin: 2px; border-radius: 12px; background: #222d3d; cursor: pointer; font-size: 12px; }
  .chip.on { background: #2f6db3; color: #fff; }
  .batch { border: 1px solid #2a3646; border-radius: 5px; margin: 6px 0; }
  .batch-head { padding: 8px 12px; cursor: pointer; background: #1c2634; }
  .batch-body { padding: 10px 14px; font-size: 13px; display: grid; gap: 6px; }
  .file-row { display: flex; gap: 8px; align-items: center; margin: 3px 0; }
  h3 { margin-top: 0; font-size: 15px; }
</style>
