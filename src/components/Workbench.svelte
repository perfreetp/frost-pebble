<script>
  import { onMount, onDestroy } from 'svelte';
  import { createTerrain } from '../lib/terrain.js';
  import { createVectorLayer } from '../lib/vectorLayer.js';
  import { createHistory } from '../lib/history.js';
  import { snapPoint } from '../lib/geo/snap.js';
  import { union, intersect, difference } from '../lib/geo/boolean.js';
  import { multiPolygonArea } from '../lib/geo/area.js';
  import { TOWNSHIPS, GRID_SIZE } from '../lib/data/sampleCounty.js';
  import * as db from '../lib/db.js';

  const PALETTE = ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#e67e22', '#95a5a6'];
  const SNAP_KM = 2.5;

  let container;
  let terrain, layer, overlay;
  let tool = 'pan'; // pan | line | polygon | point
  let zones = [];
  let isoglosses = [];
  let points = [];
  let draft = [];
  let snapTarget = null;
  let selected = new Set();
  let boolOp = 'union';
  let zoneName = '';
  let lineName = '';
  let status = '工具:平移(拖拽地图,滚轮缩放)';
  let canUndo = false, canRedo = false;
  let nextId = 1;
  let saveTimer = null;

  const history = createHistory();
  let townships = TOWNSHIPS;
  let townshipRings = townships.map((t) => t.ring);

  function snapshot() {
    return { zones: JSON.parse(JSON.stringify(zones)), isoglosses: JSON.parse(JSON.stringify(isoglosses)), points: JSON.parse(JSON.stringify(points)) };
  }

  function pushHistory() {
    history.push(snapshot());
    syncHistoryFlags();
  }

  function syncHistoryFlags() {
    canUndo = history.canUndo();
    canRedo = history.canRedo();
  }

  function redraw() {
    layer.draw({ zones, isoglosses, points, draft, snapTarget });
    scheduleSave();
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      db.kvSet('workDraft', { zones, isoglosses, points, savedAt: Date.now() });
    }, 500);
  }

  function undo() {
    const s = history.undo(snapshot());
    if (!s) return;
    ({ zones, isoglosses, points } = s);
    syncHistoryFlags(); redraw();
  }
  function redo() {
    const s = history.redo(snapshot());
    if (!s) return;
    ({ zones, isoglosses, points } = s);
    syncHistoryFlags(); redraw();
  }

  function onKey(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault(); redo();
    } else if (e.key === 'Escape') {
      draft = []; redraw();
    } else if (e.key === 'Enter' && (tool === 'polygon' || tool === 'line')) {
      finishDraft();
    }
  }

  function setTool(t) {
    tool = t; draft = []; snapTarget = null;
    status = {
      pan: '工具:平移(拖拽地图,滚轮缩放)',
      line: '工具:画同音线 — 单击加点,回车或双击完成,Esc 取消',
      polygon: '工具:画分区路径 — 单击加点,回车或双击完成,Esc 取消',
      point: '工具:调查点 — 单击空白放点(自动吸附乡镇界/网格),拖动已有点移动'
    }[t];
    redraw();
  }

  function toWorld(e) {
    const r = overlay.getBoundingClientRect();
    return terrain.screenToWorld(e.clientX - r.left, e.clientY - r.top);
  }

  function finishDraft() {
    if (tool === 'polygon' && draft.length >= 3) {
      pushHistory();
      const ring = [...draft, draft[0]];
      const name = zoneName.trim() || `分区${String(nextId).padStart(2, '0')}`;
      zones = [...zones, { id: nextId, name, color: PALETTE[(nextId - 1) % PALETTE.length], geom: [[ring]] }];
      nextId++;
      zoneName = '';
    } else if (tool === 'line' && draft.length >= 2) {
      pushHistory();
      isoglosses = [...isoglosses, { id: nextId++, name: lineName.trim() || `同音线${isoglosses.length + 1}`, points: [...draft] }];
      lineName = '';
    }
    draft = [];
    redraw();
  }

  // 调查点拖动
  let dragPoint = null;
  function nearestPoint(wx, wy, tolKm) {
    let best = null, bestD = tolKm;
    for (const p of points) {
      const d = Math.hypot(p.x - wx, p.y - wy);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best;
  }

  function onDown(e) {
    const [wx, wy] = toWorld(e);
    if (tool === 'point') {
      const hit = nearestPoint(wx, wy, 6 / terrain.view.k * 2);
      if (hit) {
        pushHistory();
        dragPoint = hit;
      }
    }
  }

  function onMove(e) {
    const [wx, wy] = toWorld(e);
    if (tool === 'point') {
      const s = snapPoint([wx, wy], townshipRings, GRID_SIZE, SNAP_KM);
      if (s.snapped) {
        const pt = [s.point[0], s.point[1]];
        pt.kind = s.kind;
        snapTarget = pt;
      } else {
        snapTarget = null;
      }
      if (dragPoint) {
        dragPoint.x = s.point[0]; dragPoint.y = s.point[1];
        points = points;
      }
      redraw();
    }
  }

  function onUp(e) {
    if (dragPoint) { dragPoint = null; redraw(); return; }
    if (e.detail === 2) { finishDraft(); return; } // 双击完成
    const [wx, wy] = toWorld(e);
    if (tool === 'polygon' || tool === 'line') {
      draft = [...draft, [+wx.toFixed(2), +wy.toFixed(2)]];
      redraw();
    } else if (tool === 'point') {
      pushHistory();
      const s = snapPoint([wx, wy], townshipRings, GRID_SIZE, SNAP_KM);
      const [x, y] = s.point;
      // 所在乡镇(简单包含判断)
      const tw = townships.find((t) => pointInRing([x, y], t.ring));
      points = [...points, { id: nextId++, name: `调查点${points.length + 1}`, x: +x.toFixed(2), y: +y.toFixed(2), township: tw ? tw.name : '' }];
      snapTarget = null;
      redraw();
    }
  }

  function pointInRing(p, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  // 布尔运算:对选中分区执行 并/交/差,合并为一个完整分区
  function applyBoolean() {
    const sel = zones.filter((z) => selected.has(z.id));
    if (sel.length < 2) { alert('请先在列表中勾选至少两个分区'); return; }
    pushHistory();
    let result;
    if (boolOp === 'union') {
      result = sel.reduce((acc, z) => union(acc, z.geom), []);
    } else if (boolOp === 'intersect') {
      result = sel.reduce((acc, z) => intersect(acc, z.geom), sel[0].geom);
    } else {
      result = sel.reduce((acc, z) => difference(acc, z.geom), sel[0].geom);
    }
    if (!result.length || multiPolygonArea(result) < 0.01) {
      alert('运算结果为空,未合并');
      return;
    }
    const base = sel[0];
    const merged = { id: nextId++, name: `${base.name}(合并)`, color: base.color, geom: result };
    zones = [...zones.filter((z) => !selected.has(z.id)), merged];
    selected = new Set();
    redraw();
  }

  function deleteSelected() {
    if (!selected.size) return;
    pushHistory();
    zones = zones.filter((z) => !selected.has(z.id));
    isoglosses = isoglosses.filter((l) => !selected.has(l.id));
    selected = new Set();
    redraw();
  }

  function toggleSelect(id) {
    selected.has(id) ? selected.delete(id) : selected.add(id);
    selected = selected;
  }

  function removePoint(id) {
    pushHistory();
    points = points.filter((p) => p.id !== id);
    redraw();
  }

  onMount(async () => {
    // 自定义乡镇界优先
    const custom = await db.kvGet('townships');
    if (custom && custom.length) {
      townships = custom;
      townshipRings = custom.map((t) => t.ring);
    }
    terrain = createTerrain(container, townships, () => redraw());
    layer = createVectorLayer(container, terrain);
    // 恢复工作稿
    const draftData = await db.kvGet('workDraft');
    if (draftData) {
      ({ zones = [], isoglosses = [], points = [] } = draftData);
      nextId = 1 + Math.max(0, ...zones.map((z) => z.id), ...isoglosses.map((l) => l.id), ...points.map((p) => p.id));
    }
    const loop = () => { terrain.render(); raf = requestAnimationFrame(loop); };
    let raf = requestAnimationFrame(loop);
    onDestroy(() => cancelAnimationFrame(raf));
    redraw();
    window.addEventListener('keydown', onKey);
    onDestroy(() => window.removeEventListener('keydown', onKey));
  });
</script>

<div class="workbench">
  <div class="toolbar">
    {#each [['pan', '平移'], ['line', '画同音线'], ['polygon', '画分区路径'], ['point', '调查点']] as [t, label]}
      <button class:ghost={tool !== t} on:click={() => setTool(t)}>{label}</button>
    {/each}
    <span class="sep"></span>
    <button on:click={undo} disabled={!canUndo}>↩ 撤销</button>
    <button on:click={redo} disabled={!canRedo}>↪ 重做</button>
    <span class="sep"></span>
    {#if tool === 'polygon'}<input bind:value={zoneName} placeholder="分区名称(可选)" />{/if}
    {#if tool === 'line'}<input bind:value={lineName} placeholder="同音线名称(可选)" />{/if}
    {#if draft.length}<button class="ghost" on:click={finishDraft}>完成绘制</button>{/if}
  </div>
  <div class="status">{status} <span class="muted">吸附阈值 {SNAP_KM}km · Ctrl+Z 撤销 / Ctrl+Shift+Z 重做</span></div>
  <div class="body">
    <div class="viewport" bind:this={container}>
      <div
        class="overlay"
        bind:this={overlay}
        style="pointer-events:{tool === 'pan' ? 'none' : 'auto'}"
        on:pointerdown={onDown}
        on:pointermove={onMove}
        on:pointerup={onUp}
      ></div>
    </div>
    <div class="side">
      <div class="panel">
        <h4>方言分区({zones.length})</h4>
        {#each zones as z}
          <label class="item">
            <input type="checkbox" checked={selected.has(z.id)} on:change={() => toggleSelect(z.id)} />
            <span class="swatch" style="background:{z.color}"></span>
            {z.name} <span class="muted">{multiPolygonArea(z.geom).toFixed(1)} km²</span>
          </label>
        {/each}
        <div class="boolrow">
          <select bind:value={boolOp}>
            <option value="union">并集</option>
            <option value="difference">差集(首个−其余)</option>
            <option value="intersect">交集</option>
          </select>
          <button on:click={applyBoolean}>运算并合并</button>
        </div>
        <button class="danger" on:click={deleteSelected} disabled={!selected.size}>删除选中</button>
      </div>
      <div class="panel">
        <h4>同音线({isoglosses.length})</h4>
        {#each isoglosses as l}
          <label class="item">
            <input type="checkbox" checked={selected.has(l.id)} on:change={() => toggleSelect(l.id)} />
            {l.name} <span class="muted">{l.points.length} 点</span>
          </label>
        {/each}
      </div>
      <div class="panel">
        <h4>调查点({points.length})</h4>
        {#each points as p}
          <div class="item">
            📍 {p.name} <span class="muted">({p.x}, {p.y}) {p.township}</span>
            <button class="danger mini" on:click={() => removePoint(p.id)}>删</button>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .workbench { display: flex; flex-direction: column; height: calc(100vh - 130px); }
  .toolbar { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; flex-wrap: wrap; }
  .sep { width: 1px; height: 20px; background: #33445c; margin: 0 4px; }
  .status { font-size: 12px; color: #9fb2c8; margin-bottom: 6px; }
  .body { flex: 1; display: flex; gap: 10px; min-height: 0; }
  .viewport { flex: 1; position: relative; border: 1px solid #2a3646; border-radius: 6px; overflow: hidden; min-width: 0; }
  .overlay { position: absolute; inset: 0; z-index: 10; cursor: crosshair; }
  .side { width: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
  .panel { background: #18202c; border: 1px solid #2a3646; border-radius: 6px; padding: 10px; }
  .panel h4 { margin: 0 0 8px; font-size: 13px; color: #8fb8e8; }
  .item { display: flex; align-items: center; gap: 6px; font-size: 12px; margin: 4px 0; }
  .swatch { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
  .boolrow { display: flex; gap: 6px; margin: 8px 0; }
  .boolrow select { flex: 1; }
  .mini { padding: 1px 6px; font-size: 11px; margin-left: auto; }
</style>
