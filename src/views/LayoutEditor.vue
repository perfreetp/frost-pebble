<template>
  <!-- 未指定工单：选择要布置的工单 -->
  <div v-if="!order" class="page">
    <h2>布置编辑器 — 选择工单</h2>
    <div class="card">
      <table class="data">
        <thead>
          <tr><th>工单号</th><th>家属</th><th>墓位</th><th>碑型</th><th>状态</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="o in editableOrders" :key="o.id">
            <td class="mono">{{ o.id }}</td>
            <td>{{ o.familyName }}</td>
            <td>{{ areaName(o.areaId) }} {{ o.row + 1 }}排{{ o.col + 1 }}号</td>
            <td>{{ steleName(o.steleType) }}</td>
            <td><span class="chip" :style="chipStyle(o.status)">{{ statusLabel(o.status) }}</span></td>
            <td><router-link class="btn btn-sm btn-primary" :to="'/editor/' + o.id">打开布置图</router-link></td>
          </tr>
          <tr v-if="!editableOrders.length"><td colspan="6" class="muted">暂无工单，请先到「前台接单」录单</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- 编辑器主体 -->
  <div v-else class="editor-wrap">
    <aside class="palette">
      <div class="pal-title">物件</div>
      <button class="pal-btn" :disabled="hasStele" @click="addObject('stele')">🪦 墓碑</button>
      <button class="pal-btn" @click="addObject('railing')">🧱 石栏</button>
      <button class="pal-btn" @click="addObject('plant')">🌳 绿植</button>
      <button class="pal-btn" @click="addObject('table')">🪑 供桌</button>
      <div class="pal-title">视图</div>
      <button class="pal-btn" @click="fitView">⛶ 适应全图</button>
      <button class="pal-btn" @click="centerOnPlot">🎯 定位墓位</button>
      <div class="pal-title">出图</div>
      <button class="pal-btn" @click="exportPNG">🖼 导出俯视图</button>
      <div class="hint" style="padding:8px 4px">
        拖动空白处平移，滚轮缩放。<br>
        松手自动吸附 30cm 网格并对齐排距方向。<br>
        红色表示越界 / 压占相邻墓位 / 堵住通道。<br>
        Delete 键删除选中物件。
      </div>
    </aside>

    <div class="canvas-host" ref="hostRef">
      <canvas
        ref="cvRef"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
      ></canvas>
      <div class="canvas-tip mono">{{ area.name }} · 本单墓位 {{ order.row + 1 }}排{{ order.col + 1 }}号 · 网格 30cm</div>
    </div>

    <aside class="sidepanel">
      <div class="sp-section">
        <div class="sp-title">工单信息</div>
        <div class="kv"><span>工单号</span><b class="mono">{{ order.id }}</b></div>
        <div class="kv"><span>家属</span><b>{{ order.familyName }} {{ order.phone }}</b></div>
        <div class="kv"><span>逝者</span><b>{{ order.deceased }}</b></div>
        <div class="kv"><span>碑型</span><b>{{ steleName(order.steleType) }}</b></div>
        <div class="kv"><span>状态</span><span class="chip" :style="chipStyle(order.status)">{{ statusLabel(order.status) }}</span></div>
        <div class="kv" v-if="order.needs"><span>家属需求</span><b>{{ order.needs }}</b></div>
      </div>

      <div class="sp-section">
        <div class="sp-title">刻字内容（{{ liveMaterials.chars }} 字）</div>
        <textarea v-model="order.engraving" rows="2" style="width:100%"></textarea>
      </div>

      <div class="sp-section" v-if="sel">
        <div class="sp-title">选中物件：{{ objName(sel.type) }}</div>
        <div class="kv"><span>位置</span><b class="mono">{{ sel.x.toFixed(2) }}, {{ sel.y.toFixed(2) }}</b></div>
        <div class="kv"><span>尺寸</span><b class="mono">{{ sel.w.toFixed(2) }} × {{ sel.h.toFixed(2) }} m</b></div>
        <div class="kv"><span>角度</span><b class="mono">{{ degOf(sel) }}°</b></div>
        <div v-if="sel.invalid" class="error-text">⚠ {{ sel.invalid }}</div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn btn-sm" @click="rotateSel(-90)">↺ 90°</button>
          <button class="btn btn-sm" @click="rotateSel(90)">↻ 90°</button>
          <button class="btn btn-sm btn-danger" @click="removeSel">删除</button>
        </div>
      </div>
      <div class="sp-section" v-else>
        <div class="sp-title">选中物件</div>
        <div class="muted">点击画布中的物件进行选择</div>
      </div>

      <div class="sp-section">
        <div class="sp-title">物料清单（实时）</div>
        <div class="kv"><span>石材</span><b>{{ liveMaterials.stone }} 块</b></div>
        <div class="kv"><span>绿植</span><b>{{ liveMaterials.plants }} 棵</b></div>
        <div class="kv"><span>刻字</span><b>{{ liveMaterials.chars }} 字</b></div>
      </div>

      <div class="sp-section">
        <div class="sp-title">定稿</div>
        <div v-if="invalidCount" class="error-text">⚠ 有 {{ invalidCount }} 个物件越界 / 压占 / 堵通道，请调整</div>
        <div v-if="!hasStele" class="error-text">⚠ 布置图中缺少墓碑</div>
        <div v-if="order.status === 'rejected'" class="warn-text">本单被质检打回，修改布置图定稿后需重新提交审核</div>
        <button class="btn btn-primary" style="width:100%;margin-top:8px" :disabled="!canFinalize" @click="finalize">
          {{ order.status === 'rejected' ? '重新定稿（修改后待重新提交）' : '定稿并生成物料清单' }}
        </button>
        <div v-if="finalizeMsg" class="ok-text" style="margin-top:6px">{{ finalizeMsg }}</div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { AREAS, getArea, plotRect, areaSize, GRID } from '../data/cemetery.js'
import { store, STATUS, STELE_TYPES, calcMaterials, occupiedSet, takenSet, uid } from '../store.js'
import { checkCollision, pointInObj, objCorners, snap, snapRightAngle } from '../editor/geometry.js'
import { createLayer, drawBase, drawObjects, drawAnnotations, rotateHandlePos, OBJ_DEFS } from '../editor/engine.js'

const route = useRoute()
const order = computed(() => store.orders.find(o => o.id === route.params.orderId))

const editableOrders = computed(() =>
  store.orders.filter(o => ['pending_layout', 'layout_done', 'rejected', 'in_progress'].includes(o.status))
)

const area = computed(() => (order.value ? getArea(order.value.areaId) : AREAS[0]))
const ownPlot = computed(() => (order.value ? { r: order.value.row, c: order.value.col } : null))

const occSet = computed(() => {
  if (!order.value) return new Set()
  const s = occupiedSet(order.value.areaId, order.value.id)
  s.delete(order.value.row + ',' + order.value.col)
  return s
})
const tkSet = computed(() => (order.value ? takenSet(order.value.areaId, order.value.id) : new Set()))

const selectedId = ref(null)
const sel = computed(() => order.value?.layout.objects.find(o => o.id === selectedId.value) || null)
const hasStele = computed(() => !!order.value && order.value.layout.objects.some(o => o.type === 'stele'))
const invalidCount = computed(() => (order.value ? order.value.layout.objects.filter(o => o.invalid).length : 0))
const liveMaterials = computed(() => (order.value ? calcMaterials(order.value) : { stone: 0, plants: 0, chars: 0 }))
const canFinalize = computed(() => hasStele.value && !invalidCount.value && order.value?.layout.objects.length > 0)
const finalizeMsg = ref('')

// ---------- 画布与分层 ----------
const hostRef = ref(null)
const cvRef = ref(null)
const view = reactive({ x: 0, y: 0, scale: 60 })
let dpr = 1
let layers = null // { base, obj, ann }
const dirty = { base: true, obj: true, ann: true, composite: true }
let ro = null

function areaName(id) { return getArea(id)?.name || id }
function steleName(id) { return STELE_TYPES.find(s => s.id === id)?.name || id }
function statusLabel(s) { return STATUS[s]?.label || s }
function chipStyle(s) { const c = STATUS[s]; return c ? `background:${c.bg};color:${c.color}` : '' }
function objName(t) { return OBJ_DEFS[t]?.name || t }
function degOf(o) { return Math.round(((o.rot || 0) * 180) / Math.PI) }

function markAll() { dirty.base = dirty.obj = dirty.ann = true }

function resize() {
  const host = hostRef.value
  const cv = cvRef.value
  if (!host || !cv) return
  dpr = window.devicePixelRatio || 1
  const w = host.clientWidth, h = host.clientHeight
  cv.width = Math.round(w * dpr)
  cv.height = Math.round(h * dpr)
  cv.style.width = w + 'px'
  cv.style.height = h + 'px'
  layers = {
    base: createLayer(cv.width, cv.height),
    obj: createLayer(cv.width, cv.height),
    ann: createLayer(cv.width, cv.height)
  }
  markAll()
}

function prepCtx(layer) {
  const ctx = layer.getContext('2d')
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, layer.width, layer.height)
  const s = dpr * view.scale
  ctx.setTransform(s, 0, 0, s, -view.x * s, -view.y * s)
  return ctx
}

// ---------- 生命周期 ----------
let running = true

watch([occSet, tkSet], () => { dirty.base = true })
watch(order, async (n, o) => {
  if (n && n !== o) {
    selectedId.value = null
    await nextTick()
    bindCanvas()
    initOrder(n)
  }
})

function frame() {
  if (!running) return
  if (!order.value || !layers) { requestAnimationFrame(frame); return }
  if (dirty.base) {
    drawBase(prepCtx(layers.base), area.value, {
      scale: view.scale, occupied: occSet.value, ownPlot: ownPlot.value, taken: tkSet.value
    })
    dirty.base = false
    dirty.composite = true
  }
  if (dirty.obj) {
    drawObjects(prepCtx(layers.obj), order.value.layout.objects, { scale: view.scale, selectedId: selectedId.value })
    dirty.obj = false
    dirty.composite = true
  }
  if (dirty.ann) {
    drawAnnotations(prepCtx(layers.ann), sel.value, { scale: view.scale })
    dirty.ann = false
    dirty.composite = true
  }
  if (dirty.composite) {
    const cv = cvRef.value
    const ctx = cv.getContext('2d')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.drawImage(layers.base, 0, 0)
    ctx.drawImage(layers.obj, 0, 0)
    ctx.drawImage(layers.ann, 0, 0)
    dirty.composite = false
  }
  requestAnimationFrame(frame)
}

// ---------- 交互 ----------
const drag = { mode: null, offX: 0, offY: 0, startPx: null, startView: null, orig: null, corner: null }

function toWorld(e) {
  const r = cvRef.value.getBoundingClientRect()
  const px = e.clientX - r.left, py = e.clientY - r.top
  return { x: px / view.scale + view.x, y: py / view.scale + view.y, px, py }
}

function onDown(e) {
  if (!order.value) return
  cvRef.value.setPointerCapture(e.pointerId)
  const w = toWorld(e)
  const s = sel.value
  if (s) {
    const hp = rotateHandlePos(s, view.scale)
    if (Math.hypot((hp.x - w.x) * view.scale, (hp.y - w.y) * view.scale) <= 10) {
      drag.mode = 'rotate'
      return
    }
    const cs = objCorners(s)
    for (const p of cs) {
      if (Math.hypot((p.x - w.x) * view.scale, (p.y - w.y) * view.scale) <= 10) {
        drag.mode = 'scale'
        drag.orig = { x: s.x, y: s.y, w: s.w, h: s.h }
        drag.corner = p
        return
      }
    }
  }
  const objs = order.value.layout.objects
  for (let i = objs.length - 1; i >= 0; i--) {
    if (pointInObj(objs[i], w.x, w.y)) {
      selectedId.value = objs[i].id
      drag.mode = 'move'
      drag.offX = w.x - objs[i].x
      drag.offY = w.y - objs[i].y
      dirty.obj = dirty.ann = true
      return
    }
  }
  selectedId.value = null
  drag.mode = 'pan'
  drag.startPx = { x: e.clientX, y: e.clientY }
  drag.startView = { x: view.x, y: view.y }
  dirty.ann = true
}

function onMove(e) {
  if (!drag.mode || !order.value) return
  const w = toWorld(e)
  const s = sel.value
  if (drag.mode === 'pan') {
    view.x = drag.startView.x - (e.clientX - drag.startPx.x) / view.scale
    view.y = drag.startView.y - (e.clientY - drag.startPx.y) / view.scale
    markAll()
  } else if (drag.mode === 'move' && s) {
    s.x = w.x - drag.offX
    s.y = w.y - drag.offY
    s.invalid = checkCollision(s, area.value, ownPlot.value)
    dirty.obj = dirty.ann = true
  } else if (drag.mode === 'rotate' && s) {
    let rot = Math.atan2(w.y - s.y, w.x - s.x) + Math.PI / 2
    if (e.shiftKey) rot = Math.round(rot / (Math.PI / 12)) * (Math.PI / 12)
    s.rot = rot
    s.invalid = checkCollision(s, area.value, ownPlot.value)
    dirty.obj = dirty.ann = true
  } else if (drag.mode === 'scale' && s) {
    const d0 = Math.hypot(drag.corner.x - drag.orig.x, drag.corner.y - drag.orig.y) || 0.01
    const d1 = Math.hypot(w.x - drag.orig.x, w.y - drag.orig.y)
    const k = Math.min(10, Math.max(0.1, d1 / d0))
    s.w = Math.min(4, Math.max(0.15, drag.orig.w * k))
    s.h = Math.min(4, Math.max(0.1, drag.orig.h * k))
    s.invalid = checkCollision(s, area.value, ownPlot.value)
    dirty.obj = dirty.ann = true
  }
}

function onUp() {
  if (!order.value) { drag.mode = null; return }
  const s = sel.value
  if ((drag.mode === 'move' || drag.mode === 'scale') && s) {
    // 松手吸附 30cm 网格 + 对齐排距方向（90°）
    s.x = snap(s.x, GRID)
    s.y = snap(s.y, GRID)
    s.rot = snapRightAngle(s.rot || 0)
    s.invalid = checkCollision(s, area.value, ownPlot.value)
    dirty.obj = dirty.ann = true
  } else if (drag.mode === 'rotate' && s) {
    s.rot = snapRightAngle(s.rot || 0)
    s.invalid = checkCollision(s, area.value, ownPlot.value)
    dirty.obj = dirty.ann = true
  }
  drag.mode = null
}

function onWheel(e) {
  if (!order.value) return
  e.preventDefault()
  const w = toWorld(e)
  const f = e.deltaY < 0 ? 1.12 : 1 / 1.12
  const ns = Math.min(300, Math.max(6, view.scale * f))
  view.x = w.x - w.px / ns
  view.y = w.y - w.py / ns
  view.scale = ns
  markAll()
}

function onKey(e) {
  if (!order.value) return
  const tag = e.target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  if ((e.key === 'Delete' || e.key === 'Backspace') && sel.value) removeSel()
}

// ---------- 物件操作 ----------
function addObject(type) {
  const pr = plotRect(area.value, order.value.row, order.value.col)
  const def = OBJ_DEFS[type]
  let w = def.w, h = def.h
  if (type === 'stele') {
    const st = STELE_TYPES.find(s => s.id === order.value.steleType) || STELE_TYPES[0]
    w = st.w; h = st.d
  }
  const o = { id: uid(), type, x: pr.x + pr.w / 2, y: pr.y + pr.h / 2, w, h, rot: 0 }
  o.invalid = checkCollision(o, area.value, ownPlot.value)
  order.value.layout.objects.push(o)
  selectedId.value = o.id
  dirty.obj = dirty.ann = true
}

function removeSel() {
  const objs = order.value.layout.objects
  const i = objs.findIndex(o => o.id === selectedId.value)
  if (i >= 0) objs.splice(i, 1)
  selectedId.value = null
  dirty.obj = dirty.ann = true
}

function rotateSel(deg) {
  const s = sel.value
  if (!s) return
  s.rot = (s.rot || 0) + (deg * Math.PI) / 180
  s.invalid = checkCollision(s, area.value, ownPlot.value)
  dirty.obj = dirty.ann = true
}

// ---------- 视图 ----------
function fitView() {
  const host = hostRef.value
  if (!host) return
  const { w, h } = areaSize(area.value)
  const s = Math.min(host.clientWidth / (w + 2), host.clientHeight / (h + 2))
  view.scale = s
  view.x = w / 2 - host.clientWidth / 2 / s
  view.y = h / 2 - host.clientHeight / 2 / s
  markAll()
}

function centerOnPlot() {
  const host = hostRef.value
  const pr = plotRect(area.value, order.value.row, order.value.col)
  view.scale = Math.max(view.scale, 70)
  view.x = pr.x + pr.w / 2 - host.clientWidth / 2 / view.scale
  view.y = pr.y + pr.h / 2 - host.clientHeight / 2 / view.scale
  markAll()
}

// ---------- 出图与定稿 ----------
function renderScene(scale) {
  const { w, h } = areaSize(area.value)
  const c = createLayer(Math.ceil(w * scale), Math.ceil(h * scale))
  const ctx = c.getContext('2d')
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  drawBase(ctx, area.value, { scale, occupied: occSet.value, ownPlot: ownPlot.value, taken: tkSet.value })
  drawObjects(ctx, order.value.layout.objects, { scale, selectedId: null })
  return c
}

function exportPNG() {
  const c = renderScene(48)
  const out = document.createElement('canvas')
  out.width = c.width; out.height = c.height
  out.getContext('2d').drawImage(c, 0, 0)
  const a = document.createElement('a')
  a.download = `${order.value.id}-俯视图.png`
  a.href = out.toDataURL('image/png')
  a.click()
}

function finalize() {
  order.value.materials = calcMaterials(order.value)
  const prev = renderScene(Math.min(60, 560 / areaSize(area.value).w))
  const out = document.createElement('canvas')
  out.width = prev.width; out.height = prev.height
  out.getContext('2d').drawImage(prev, 0, 0)
  order.value.layoutPreview = out.toDataURL('image/jpeg', 0.75)
  if (order.value.status === 'pending_layout') {
    order.value.status = 'layout_done'
    finalizeMsg.value = '已定稿，工单进入「待派工」，请前往工单排班'
  } else if (order.value.status === 'rejected') {
    order.value.status = 'in_progress'
    finalizeMsg.value = '布置图已修改定稿，请在排班页重新提交质检审核'
  } else {
    finalizeMsg.value = '布置图与物料清单已更新'
  }
  setTimeout(() => (finalizeMsg.value = ''), 5000)
}

function bindCanvas() {
  if (!hostRef.value || !cvRef.value) return
  resize()
  ro?.disconnect()
  ro = new ResizeObserver(resize)
  ro.observe(hostRef.value)
  cvRef.value.addEventListener('wheel', onWheel, { passive: false })
}

function initOrder(o) {
  for (const ob of o.layout.objects) ob.invalid = checkCollision(ob, area.value, ownPlot.value)
  markAll()
  centerOnPlot()
}

onMounted(async () => {
  await nextTick()
  bindCanvas()
  window.addEventListener('keydown', onKey)
  if (order.value) initOrder(order.value)
  requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  running = false
  ro?.disconnect()
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.editor-wrap { display: flex; height: 100%; overflow: hidden; }
.palette {
  width: 132px; flex-shrink: 0; background: #fff; border-right: 1px solid #e0e0d6;
  padding: 10px; overflow-y: auto;
}
.pal-title { font-size: 12px; color: #888; margin: 10px 0 6px; }
.pal-btn {
  display: block; width: 100%; margin-bottom: 6px; padding: 8px 6px;
  border: 1px solid #c8cabc; border-radius: 6px; background: #f8f9f4;
  cursor: pointer; font-size: 13px; text-align: left;
}
.pal-btn:hover:not(:disabled) { background: #eef2e4; }
.pal-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.canvas-host { flex: 1; position: relative; background: #dfe2d4; overflow: hidden; }
.canvas-host canvas { display: block; touch-action: none; cursor: default; }
.canvas-tip {
  position: absolute; left: 10px; bottom: 8px; font-size: 12px;
  background: rgba(255,255,255,0.85); padding: 3px 10px; border-radius: 4px; color: #555;
}
.sidepanel {
  width: 280px; flex-shrink: 0; background: #fff; border-left: 1px solid #e0e0d6;
  overflow-y: auto; padding: 12px;
}
.sp-section { border-bottom: 1px solid #eee; padding: 10px 2px; }
.sp-section:last-child { border-bottom: none; }
.sp-title { font-weight: 700; font-size: 13px; margin-bottom: 8px; color: #3a4636; }
.kv { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; padding: 2px 0; }
.kv span { color: #888; flex-shrink: 0; }
.kv b { font-weight: 600; text-align: right; word-break: break-all; }
</style>
