<script>
import { createProject, go, state as appState } from '../lib/store.svelte.js';

  const makers = ['制作员·李工', '制作员·赵工'];
  const supers = ['主管·王主任'];

  let form = $state({
    name: '',
    customer: appState.user?.role === 'customer' ? appState.user.name : '客户·张社长',
    maker: makers[0],
    supervisor: supers[0],
    shedCount: 3,
    layers: 4,
    loadPerLayer: 120,
    deadline: defaultDeadline()
  });
  let err = $state('');

  function defaultDeadline() {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  }

  function submit() {
    if (!form.name.trim()) { err = '请填写项目名称'; return; }
    if (form.shedCount < 1 || form.shedCount > 20) { err = '菇棚数量需在 1-20 之间'; return; }
    if (form.layers < 1 || form.layers > 6) { err = '层数需在 1-6 之间(摆放时超过 4 层会告警)'; return; }
    if (form.loadPerLayer <= 0) { err = '单层承重需大于 0'; return; }
    const p = createProject(form);
    go('project-detail', { id: p.id });
  }
</script>

<h1>下需求单</h1>
<p class="muted" style="margin-top:-4px">客户在棚区图纸上下单,制作员收到后逐棚进行三维布置</p>

<div class="card" style="max-width:680px">
  <div class="field">
    <span class="flabel">项目名称</span>
    <input bind:value={form.name} placeholder="例:东区双孢菇基地一期菇棚" />
  </div>
  <div class="grid" style="grid-template-columns:1fr 1fr">
    <div class="field">
      <span class="flabel">客户单位/联系人</span>
      <input bind:value={form.customer} />
    </div>
    <div class="field">
      <span class="flabel">期望交期</span>
      <input type="date" bind:value={form.deadline} />
    </div>
  </div>
  <div class="grid" style="grid-template-columns:1fr 1fr 1fr">
    <div class="field">
      <span class="flabel">菇棚数量(个)</span>
      <input type="number" min="1" max="20" bind:value={form.shedCount} />
    </div>
    <div class="field">
      <span class="flabel">层数(层/架)</span>
      <input type="number" min="1" max="6" bind:value={form.layers} />
    </div>
    <div class="field">
      <span class="flabel">单层承重(kg)</span>
      <input type="number" min="1" bind:value={form.loadPerLayer} />
    </div>
  </div>
  <div class="grid" style="grid-template-columns:1fr 1fr">
    <div class="field">
      <span class="flabel">指派制作员</span>
      <select bind:value={form.maker}>
        {#each makers as m}<option>{m}</option>{/each}
      </select>
    </div>
    <div class="field">
      <span class="flabel">审核主管</span>
      <select bind:value={form.supervisor}>
        {#each supers as s}<option>{s}</option>{/each}
      </select>
    </div>
  </div>

  {#if err}<div class="alert error">{err}</div>{/if}

  <div class="row" style="margin-top:8px">
    <button class="primary" onclick={submit}>提交需求单并生成棚区</button>
    <button onclick={() => go('dashboard')}>取消</button>
    <span class="spacer"></span>
    <span class="muted small">提交后自动按棚数量生成空白棚区(含默认立柱),进入制作环节</span>
  </div>
</div>
