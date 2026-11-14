<script>
  import { onMount, onDestroy } from 'svelte';
  import {
    state as appState, go, getProject, projectValidation,
    rejectProject, approveAndPackage
  } from '../lib/store.svelte.js';
  import { SceneEditor } from '../lib/SceneEditor.js';
  import { EQUIP_TYPES } from '../lib/constants.js';

  let { id } = $props();

  const pending = $derived(
    appState.projects
      .filter((p) => p.status === '待审核')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  );

  const p = $derived(id ? getProject(id) : null);
  const val = $derived(p ? projectValidation(p) : null);
  let activeShed = $state(0);
  let showReject = $state(false);
  let reason = $state('');
  let flash = $state('');

  let viewport = $state(null);
  let editor = null;

  $effect(() => {
    // 项目或当前棚切换时重建只读场景
    const shedNow = p?.sheds[activeShed];
    if (!viewport || !shedNow || !p) return;
    editor?.dispose();
    editor = new SceneEditor(viewport, shedNow, {
      layers: p.layers,
      onSelect: () => {},
      onChange: () => {}
    });
    const r = projectValidation(p).perShed[activeShed];
    const map = new Map();
    for (const v of r.violations) if (!map.has(v.objId)) map.set(v.objId, v.reason);
    editor.setViolations(map);
    editor.refreshAisles(r.aisleMap);
    return () => editor?.dispose();
  });

  onDestroy(() => editor?.dispose());

  function doReject() {
    if (!reason.trim()) { flash = '请填写退回原因'; return; }
    rejectProject(p, reason.trim());
    showReject = false;
    reason = '';
    flash = '已整单退回,计入一次返工';
  }

  function doApprove() {
    const r = approveAndPackage(p);
    flash = r.ok ? `已通过并打包,版本 ${p.version},交付时间已记录` : r.msg;
    if (r.ok) setTimeout(() => go('deliverables', { id: p.id }), 1200);
  }

  function pickShed(i) {
    activeShed = i;
  }
</script>

<h1>主管审核台</h1>

<div class="grid" style="grid-template-columns:260px 1fr;align-items:start">
  <div class="card">
    <h2>待审核({pending.length})</h2>
    {#if pending.length === 0}
      <div class="empty small">暂无待审核项目</div>
    {/if}
    {#each pending as prj (prj.id)}
      <button class="sm" style="width:100%;text-align:left;margin-bottom:8px;
        {prj.id === id ? 'border-color:var(--brand);background:var(--brand-soft)' : ''}"
        onclick={() => go('review', { id: prj.id })}>
        <b>{prj.code}</b> · {prj.name}<br />
        <span class="muted" style="font-size:11px">
          {prj.sheds.length}棚 · 交期 {prj.deadline} · 返工 {prj.reworkCount} 次
          {#if prj.reworkCount > 2}<span style="color:var(--red);font-weight:700">(超限)</span>{/if}
        </span>
      </button>
    {/each}
  </div>

  {#if p}
    <div>
      <div class="card" style="margin-bottom:14px">
        <div class="row">
          <h2 style="margin:0">{p.name}({p.code})</h2>
          <span class="badge {p.status}">{p.status}</span>
          {#if p.reworkCount > 2}
            <span class="badge red">同一单已返工 {p.reworkCount} 次</span>
          {/if}
          <span class="spacer"></span>
          <button class="danger" onclick={() => (showReject = true)}>整单退回</button>
          <button class="primary" onclick={doApprove} disabled={val.total > 0}>
            通过并打包交付
          </button>
        </div>
        {#if val.total > 0}
          <div class="alert error" style="margin-top:10px;margin-bottom:0">
            存在 {val.total} 项碰撞告警,无法通过审核,请整单退回
          </div>
        {/if}
        {#if flash}<div class="alert {flash.includes('退回') ? 'warn' : 'ok'}" style="margin-top:10px;margin-bottom:0">{flash}</div>{/if}
      </div>

      <div class="card" style="margin-bottom:14px">
        <div class="row" style="margin-bottom:10px">
          {#each val.perShed as r, i (r.shed.id)}
            {@const rework = p.shedRework[r.shed.id] || 0}
            <button class="sm" class:primary={i === activeShed}
              style={rework > 2 ? 'border-color:var(--red);color:var(--red);font-weight:700' : ''}
              onclick={() => pickShed(i)}>
              {r.shed.name}
              {#if r.violations.length > 0}({r.violations.length}警){/if}
              {#if rework > 2} · 返{rework}{/if}
            </button>
          {/each}
          <span class="spacer"></span>
          <button class="sm" onclick={() => editor?.toggleTopView()}>俯视图/透视</button>
          <button class="sm" onclick={() => editor?.resetView()}>复位视角</button>
        </div>
        <div bind:this={viewport} style="height:440px;border-radius:8px;overflow:hidden;background:#eef2f5"></div>
        <div class="muted small" style="margin-top:6px">只读审核视图:违规物体已标红,可旋转/缩放查看,不可移动</div>
      </div>

      <div class="grid" style="grid-template-columns:1fr 1fr">
        <div class="card">
          <h2>{p.sheds[activeShed].name} · 碰撞告警</h2>
          {#if val.perShed[activeShed].violations.length === 0}
            <div class="alert ok">本棚无告警,布置合格</div>
          {:else}
            {#each val.perShed[activeShed].violations as v, i (v.objId + i)}
              {@const o = p.sheds[activeShed].objects.find((x) => x.id === v.objId)}
              <div class="alert error small">
                <b>{o?.code}</b>({o ? EQUIP_TYPES[o.type].name : ''}):{v.reason}
              </div>
            {/each}
          {/if}
          {#if val.perShed[activeShed].aisleMap.min !== null}
            <div class="alert {val.perShed[activeShed].aisleMap.min < 1 ? 'error' : 'ok'}">
              最窄走道净宽 {val.perShed[activeShed].aisleMap.min}m
            </div>
          {/if}
        </div>

        <div class="card">
          <h2>物料清单(全项目汇总)</h2>
          <table>
            <thead><tr><th>物料</th><th>数量</th><th>单位</th></tr></thead>
            <tbody>
              {#each val.bom as b}
                <tr><td>{b.name}</td><td><b>{b.qty}</b></td><td>{b.unit}</td></tr>
              {/each}
            </tbody>
          </table>
          <h2 style="margin-top:14px">最近操作</h2>
          <ul class="timeline" style="max-height:200px;overflow:auto">
            {#each [...p.timeline].reverse().slice(0, 6) as t (t.id)}
              <li>
                <span class="t-user">{t.user}</span> · {t.action}
                <div class="t-time">{t.time}</div>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
  {:else}
    <div class="card empty">请从左侧选择一个待审核项目</div>
  {/if}
</div>

{#if showReject}
  <div
    class="modal-mask"
    role="button"
    tabindex="0"
    aria-label="点击空白处关闭"
    onclick={() => (showReject = false)}
    onkeydown={(e) => e.key === 'Escape' && (showReject = false)}
  >
    <div class="modal" role="dialog" aria-modal="true" aria-label="整单退回" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
      <h2>整单退回 · {p.code}</h2>
      <p class="muted small">
        退回后所有棚各计一次返工;同一棚返工超过 2 次将在项目中标红。当前累计返工 {p.reworkCount} 次。
      </p>
      <span class="flabel">退回原因(制作员可见)</span>
      <textarea rows="5" bind:value={reason} placeholder="例:3号棚层架压住立柱,且主走道净宽不足 1 米,请调整后重新提交"></textarea>
      {#if flash && flash.includes('原因')}<div class="alert error">{flash}</div>{/if}
      <div class="row" style="margin-top:14px">
        <span class="spacer"></span>
        <button onclick={() => (showReject = false)}>取消</button>
        <button class="danger" onclick={doReject}>确认退回</button>
      </div>
    </div>
  </div>
{/if}
