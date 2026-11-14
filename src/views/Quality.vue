<template>
  <div class="page">
    <h2>质检</h2>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="num">{{ qcStats.total }}</div>
        <div class="lbl">累计提交质检</div>
      </div>
      <div class="stat-card">
        <div class="num">{{ qcStats.inspected }}</div>
        <div class="lbl">已抽查</div>
      </div>
      <div class="stat-card">
        <div class="num" :style="{ color: qcStats.rateOk ? '#15803d' : '#b91c1c' }">{{ qcStats.rateText }}</div>
        <div class="lbl">抽查率（要求 ≥ {{ Math.round(store.qcTarget * 100) }}%）</div>
      </div>
      <div class="stat-card">
        <div class="num">{{ qcStats.pending }}</div>
        <div class="lbl">待质检</div>
      </div>
    </div>
    <div v-if="!qcStats.rateOk" class="card error-text">
      ⚠ 当前抽查率低于 {{ Math.round(store.qcTarget * 100) }}%，请对提交工单执行抽查（合格 / 不合格），不要使用免检放行。
    </div>

    <h3>待质检工单</h3>
    <div class="card" v-for="o in pendingQc" :key="o.id">
      <div style="display:flex;gap:18px;flex-wrap:wrap">
        <div style="flex:0 0 240px">
          <div class="muted" style="margin-bottom:4px">布置俯视图</div>
          <img v-if="o.layoutPreview" :src="o.layoutPreview" style="width:240px;border:1px solid #ddd;border-radius:6px" />
          <div v-else class="muted">无</div>
        </div>
        <div style="flex:1;min-width:220px">
          <div><b class="mono">{{ o.id }}</b> · {{ o.familyName }} · {{ areaName(o.areaId) }} {{ o.row + 1 }}排{{ o.col + 1 }}号</div>
          <div class="muted" style="margin:4px 0">
            师傅：{{ workerName(o.assignee) }} · 碑型：{{ steleName(o.steleType) }} · 返工 {{ o.reworkCount }} 次
          </div>
          <div v-if="o.materials" class="muted">
            物料：石材 {{ o.materials.stone }} 块 · 绿植 {{ o.materials.plants }} 棵 · 刻字 {{ o.materials.chars }} 字
          </div>
          <div style="margin-top:8px">
            <div class="muted" style="margin-bottom:4px">完工照片（{{ o.photos.length }}）</div>
            <img v-for="(p, i) in o.photos" :key="i" :src="p" class="thumb" style="margin-right:6px" @click="preview = p" />
          </div>
          <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" @click="pass(o)">抽查合格</button>
            <button class="btn btn-danger btn-sm" @click="openFail(o)">抽查不合格</button>
            <button class="btn btn-sm" @click="exempt(o)">免检放行</button>
          </div>
        </div>
      </div>
    </div>
    <div class="card" v-if="!pendingQc.length"><span class="muted">暂无待质检工单</span></div>

    <h3>打回整改中</h3>
    <div class="card">
      <table class="data">
        <thead>
          <tr><th>工单号</th><th>家属</th><th>师傅</th><th>整改项</th><th>返工次数</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="o in rejected" :key="o.id">
            <td class="mono">{{ o.id }}</td>
            <td>{{ o.familyName }}</td>
            <td>{{ workerName(o.assignee) }}</td>
            <td class="error-text">{{ lastFailItems(o) }}</td>
            <td>{{ o.reworkCount }}</td>
            <td><router-link class="btn btn-sm btn-warn" :to="'/editor/' + o.id">修改布置图</router-link></td>
          </tr>
          <tr v-if="!rejected.length"><td colspan="6" class="muted">暂无</td></tr>
        </tbody>
      </table>
      <div class="hint">打回后可在布置编辑器中修改布置图，改完需重新定稿并在排班页重新提交审核。</div>
    </div>

    <h3>质检记录</h3>
    <div class="card">
      <table class="data">
        <thead>
          <tr><th>时间</th><th>工单号</th><th>师傅</th><th>结果</th><th>整改项 / 备注</th></tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in allRecords" :key="i">
            <td class="muted">{{ fmtTime(r.time) }}</td>
            <td class="mono">{{ r.orderId }}</td>
            <td>{{ workerName(r.worker) }}</td>
            <td>
              <span v-if="r.result === 'pass'" class="ok-text">合格</span>
              <span v-else-if="r.result === 'fail'" class="error-text">不合格（打回）</span>
              <span v-else class="muted">免检</span>
            </td>
            <td>{{ r.items || '—' }}</td>
          </tr>
          <tr v-if="!allRecords.length"><td colspan="5" class="muted">暂无记录</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 不合格：填整改项 -->
    <div v-if="failModal" class="modal-mask" @click.self="failModal = null">
      <div class="modal">
        <h3>抽查不合格 — {{ failModal.id }}</h3>
        <label class="field">整改项（必填，打回后师傅按此整改）
          <textarea v-model.trim="failItems" rows="4" placeholder="如：石栏未对齐墓位边界，供桌压住通道，需调整后重新施工"></textarea>
        </label>
        <div style="margin-top:14px;text-align:right;display:flex;gap:8px;justify-content:flex-end">
          <button class="btn" @click="failModal = null">取消</button>
          <button class="btn btn-danger" :disabled="!failItems" @click="confirmFail">打回并计一次返工</button>
        </div>
      </div>
    </div>

    <div v-if="preview" class="modal-mask" @click="preview = null">
      <div class="modal" style="width:auto"><img :src="preview" style="max-width:80vw;max-height:80vh" /></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getArea } from '../data/cemetery.js'
import { store, STELE_TYPES, workerById } from '../store.js'

const preview = ref(null)
const failModal = ref(null)
const failItems = ref('')

const pendingQc = computed(() => store.orders.filter(o => o.status === 'pending_qc'))
const rejected = computed(() => store.orders.filter(o => o.status === 'rejected'))

const allRecords = computed(() => {
  const list = []
  for (const o of store.orders) {
    for (const r of o.qcRecords) list.push({ ...r, orderId: o.id, worker: o.assignee })
  }
  return list.sort((a, b) => b.time - a.time)
})

const qcStats = computed(() => {
  // 提交过质检的工单：当前待质检 + 已有质检记录（含完成后）
  const submitted = store.orders.filter(o => o.status === 'pending_qc' || o.qcRecords.length > 0)
  const total = submitted.length
  const inspected = submitted.filter(o => o.qcRecords.some(r => r.result === 'pass' || r.result === 'fail')).length
  const rate = total ? inspected / total : 1
  return {
    total,
    inspected,
    pending: pendingQc.value.length,
    rateOk: rate >= store.qcTarget,
    rateText: Math.round(rate * 100) + '%'
  }
})

function pass(o) {
  o.qcRecords.push({ time: Date.now(), result: 'pass', items: '', inspector: '质检员' })
  o.status = 'completed'
  o.completedAt = Date.now()
}

function openFail(o) {
  failModal.value = o
  failItems.value = ''
}

function confirmFail() {
  const o = failModal.value
  o.qcRecords.push({ time: Date.now(), result: 'fail', items: failItems.value, inspector: '质检员' })
  o.reworkCount++
  o.status = 'rejected'
  failModal.value = null
}

function exempt(o) {
  o.qcRecords.push({ time: Date.now(), result: 'exempt', items: '', inspector: '' })
  o.status = 'completed'
  o.completedAt = Date.now()
}

function areaName(id) { return getArea(id)?.name || id }
function steleName(id) { return STELE_TYPES.find(s => s.id === id)?.name || id }
function workerName(id) { return workerById(id)?.name || '-' }
function fmtTime(t) { return new Date(t).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
function lastFailItems(o) {
  const fails = o.qcRecords.filter(r => r.result === 'fail')
  return fails.length ? fails[fails.length - 1].items : ''
}
</script>
