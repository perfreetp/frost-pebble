<script>
  import { onMount, onDestroy } from 'svelte';
  import {
    getProject, go, addObject, updateObject, removeObject,
    projectValidation, saveProject, state as appState
  } from '../lib/store.svelte.js';
  import { SceneEditor } from '../lib/SceneEditor.js';
  import { EQUIP_TYPES, MAX_LAYERS } from '../lib/constants.js';

  let { id, shedId } = $props();
  const p = $derived(getProject(id));
  const shed = $derived(p.sheds.find((s) => s.id === shedId));
  const canEdit = $derived(appState.user.role === 'maker' && ['制作中', '已退回'].includes(p.status));

  const palette = ['rack', 'tray', 'pipe', 'fan', 'light'];

  let viewport = $state(null);
  let editor = null;
  let selected = $state(null);
  let topMode = $state(false);
  let transformMode = $state('translate');
  let val = $state({ violations: [], collided: new Set(), aisleMap: { rows: [], min: null } });
  let reasonMap = $state(new Map());

  const shedResult = $derived(
    projectValidation(p).perShed.find((r) => r.shed.id === shedId)
  );

  onMount(() => {
    editor = new SceneEditor(viewport, shed, {
      layers: p.layers,
      onReady: () => runValidation(),
      onSelect: (o) => (selected = o),
      onChange: (o, finished) => {
        updateObject(p, shedId, o);
        if (finished) saveProject(p, '调整设备', `${shed.name}:${EQUIP_TYPES[o.type].name} ${o.code} 移动/旋转`);
        selected = { ...o };
        runValidation();
      }
    });
    runValidation();
    editor.refreshAisles(val.aisleMap);
    if (import.meta.env.DEV) {
      window.__editor = editor;
      // 自动化测试钩子:走应用自身数据通道移动物体并立即重算校验
      window.__moveObject = (objId, x, z) => {
        const target = shed.objects.find((o) => o.id === objId);
        if (!target) return;
        target.x = x;
        target.z = z;
        updateObject(p, shedId, target);
        editor.syncObject(objId);
        runValidation();
      };
    }

    window.addEventListener('keydown', onKey);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', onKey);
    editor?.dispose();
  });

  function onKey(e) {
    if (!canEdit || !selected) return;
    if (e.key === 'Escape') editor.select(null);
    if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
  }

  function runValidation() {
    const r = projectValidation(p).perShed.find((x) => x.shed.id === shedId);
    val = r;
    const map = new Map();
    for (const v of r.violations) {
      if (!map.has(v.objId)) map.set(v.objId, v.reason);
    }
    reasonMap = map;
    editor?.setViolations(map);
    editor?.refreshAisles(r.aisleMap);
  }

  function add(type) {
    const o = addObject(p, shedId, type);
    editor.addMesh(o);
    editor.select(o.id);
    runValidation();
  }

  function deleteSelected() {
    if (!selected) return;
    const objId = selected.id;
    removeObject(p, shedId, objId);
    editor.removeMesh(objId);
    selected = null;
    runValidation();
  }

  function setMode(m) {
    transformMode = m;
    editor?.setMode(m);
  }

  function toggleTop() {
    topMode = editor.toggleTopView();
    editor.refreshAisles(val.aisleMap);
  }

  function resetView() {
    editor?.resetView();
  }

  function shot() {
    const url = editor.screenshot();
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.code}-${shed.name}-俯视图.png`;
    a.click();
  }

  const miniBom = $derived.by(() => {
    const c = { rack: 0, tray: 0, pipe: 0, fan: 0, light: 0, column: 0 };
    for (const o of shed?.objects ?? []) {
      if (o.type === 'pipe') c.pipe = +(c.pipe + (o.size?.d ?? EQUIP_TYPES.pipe.d)).toFixed(1);
      else c[o.type]++;
    }
    return c;
  });
</script>

<div class="page-head">
  <button class="sm" onclick={() => go('project-detail', { id: p.id })}>← 返回项目</button>
  <h1 style="margin:0">{p.name} · {shed.name}</h1>
  <span class="muted small">{shed.w}m × {shed.d}m × {shed.h}m · 0.5m 网格吸附 · 90° 旋转吸附</span>
  <span class="spacer"></span>
  {#if !canEdit}<span class="badge gray">只读查看模式</span>{/if}
</div>

<div class="grid" style="grid-template-columns:200px 1fr 300px;align-items:stretch">
  <!-- 设备面板 -->
  <div class="card" style="padding:14px">
    <h2>设备库</h2>
    {#if !canEdit}
      <div class="alert warn small">当前用户无编辑权限</div>
    {/if}
    {#each palette as type}
      {@const t = EQUIP_TYPES[type]}
      <button class="sm" style="width:100%;margin-bottom:8px;text-align:left"
        disabled={!canEdit}
        onclick={() => add(type)}>
        + {t.name}
        <div class="muted" style="font-size:11px">{t.w}×{t.d}×{t.h}m · 单位{t.unit}</div>
      </button>
    {/each}

    <h2 style="margin-top:16px">本棚物料</h2>
    <table style="font-size:12px">
      <tbody>
        <tr><td>层架(套)</td><td style="text-align:right"><b>{miniBom.rack}</b></td></tr>
        <tr><td>托盘(个)</td><td style="text-align:right"><b>{miniBom.tray}</b></td></tr>
        <tr><td>管道(米)</td><td style="text-align:right"><b>{miniBom.pipe}</b></td></tr>
        <tr><td>风机(台)</td><td style="text-align:right"><b>{miniBom.fan}</b></td></tr>
        <tr><td>灯具(盏)</td><td style="text-align:right"><b>{miniBom.light}</b></td></tr>
        <tr><td>立柱(根)</td><td style="text-align:right"><b>{miniBom.column}</b></td></tr>
      </tbody>
    </table>

    <h2 style="margin-top:16px">操作说明</h2>
    <ul class="small muted" style="padding-left:16px;margin:0">
      <li>点击物体选中,出现变换手柄</li>
      <li>拖动平移自动吸附 0.5m 网格</li>
      <li>层架强制贴地,禁止 Y 向移动</li>
      <li>叠层 &gt; {MAX_LAYERS} 或压立柱立即变红</li>
      <li>Delete 删除选中,Esc 取消选择</li>
    </ul>
  </div>

  <!-- 三维视口 -->
  <div class="card" style="padding:10px;display:flex;flex-direction:column">
    <div class="row" style="margin-bottom:8px">
      <div class="pill-tab">
        <button class={transformMode === 'translate' ? 'active' : ''} onclick={() => setMode('translate')} disabled={!selected}>移动</button>
        <button class={transformMode === 'rotate' ? 'active' : ''} onclick={() => setMode('rotate')} disabled={!selected}>旋转</button>
      </div>
      <button class="sm" class:primary={topMode} onclick={toggleTop}>
        {topMode ? '退出俯视图' : '一键俯视图'}
      </button>
      <button class="sm" onclick={resetView}>复位视角</button>
      <button class="sm" onclick={shot}>导出俯视 PNG</button>
      <span class="spacer"></span>
      {#if val.aisleMap.min !== null}
        <span class="badge {val.aisleMap.min < val.aisleMap.minAisle ? 'red' : 'gray'}">
          最窄走道 {val.aisleMap.min}m(≥{val.aisleMap.minAisle}m)
        </span>
      {/if}
    </div>
    <div bind:this={viewport} style="flex:1;min-height:560px;border-radius:8px;overflow:hidden;background:#eef2f5"></div>
  </div>

  <!-- 右侧:选中信息 + 告警 -->
  <div style="display:flex;flex-direction:column;gap:16px">
    <div class="card">
      <h2>选中物体</h2>
      {#if selected}
        {@const t = EQUIP_TYPES[selected.type]}
        <div class="small">
          <div><b>{t.name}</b> · 编号 {selected.code}</div>
          <div class="muted" style="margin-top:6px">
            位置 X {selected.x.toFixed(2)} / Y {selected.y.toFixed(2)} / Z {selected.z.toFixed(2)} m<br />
            旋转 {Math.round(((selected.rotY || 0) * 180) / Math.PI)}°<br />
            尺寸 {selected.size.w} × {selected.size.d} × {selected.size.h} m
          </div>
          {#if reasonMap.has(selected.id)}
            <div class="alert error" style="margin-top:10px">
              <b>违规原因:</b><br />{reasonMap.get(selected.id)}
            </div>
          {/if}
          {#if canEdit && selected.type !== 'column'}
            <button class="danger sm" style="width:100%;margin-top:10px" onclick={deleteSelected}>删除该设备</button>
          {/if}
        </div>
      {:else}
        <div class="empty small">在场景中点击物体进行选择</div>
      {/if}
    </div>

    <div class="card" style="flex:1">
      <h2>实时碰撞告警({val.violations.length})</h2>
      {#if val.violations.length === 0}
        <div class="alert ok small">本棚无碰撞与违规</div>
      {:else}
        {#each val.violations as v, i (v.objId + i)}
          {@const o = shed.objects.find((x) => x.id === v.objId)}
          <div class="alert error small">
            <b>{o?.code ?? '物体'}</b><br />{v.reason}
          </div>
        {/each}
      {/if}

      {#if topMode && val.aisleMap.rows.length > 0}
        <h2 style="margin-top:14px">俯视标注</h2>
        {#each val.aisleMap.rows as g}
          <div class="small" style="color:{g.gap < val.aisleMap.minAisle ? 'var(--red)' : 'var(--ink-2)'}">
            第 {g.index} 条走道:净宽 {g.gap}m
            {#if g.gap < val.aisleMap.minAisle}<b>(不足 {val.aisleMap.minAisle}m)</b>{/if}
          </div>
        {/each}
        <div class="muted small" style="margin-top:6px">俯视图中显示层架编号与走道宽度</div>
      {/if}
    </div>
  </div>
</div>
