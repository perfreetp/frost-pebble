<template>
  <div class="page">
    <h2>工单排班</h2>

    <h3>待派工（已定稿，物料清单随工单）</h3>
    <div class="card">
      <table class="data">
        <thead>
          <tr>
            <th>工单号</th><th>家属</th><th>墓位</th><th>碑型</th>
            <th>石材</th><th>绿植</th><th>刻字</th><th>派工</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in pendingAssign" :key="o.id">
            <td class="mono">{{ o.id }}</td>
            <td>{{ o.familyName }}</td>
            <td>{{ areaName(o.areaId) }} {{ o.row + 1 }}排{{ o.col + 1 }}号</td>
            <td>{{ steleName(o.steleType) }}</td>
            <td>{{ o.materials?.stone ?? '-' }} 块</td>
            <td>{{ o.materials?.plants ?? '-' }} 棵</td>
            <td>{{ o.materials?.chars ?? '-' }} 字</td>
            <td>
              <div style="display:flex;gap:6px;align-items:center">
                <select v-model="assignForm[o.id].worker" style="max-width:190px">
                  <option v-for="w in rankedWorkers" :key="w.id" :value="w.id">
                    {{ w.name }}（{{ w.skills.join('/') }}·在手{{ w.load }}单）
                  </option>
                </select>
                <input type="number" min="1" max="60" v-model.number="assignForm[o.id].days" style="width:56px" /> 天
                <button class="btn btn-sm btn-primary" @click="assign(o)">派工</button>
              </div>
            </td>
          </tr>
          <tr v-if="!pendingAssign.length"><td colspan="8" class="muted">暂无待派工工单（布置编辑器定稿后进入此列）</td></tr>
        </tbody>
      </table>
    </div>

    <h3>施工中 / 打回整改</h3>
    <div class="card">
      <table class="data">
        <thead>
          <tr>
            <th>工单号</th><th>家属</th><th>师傅</th><th>期限</th><th>剩余</th>
            <th>状态</th><th>完工照片</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in activeOrders" :key="o.id" :class="{ overdue: isOverdue(o) }">
            <td class="mono">{{ o.id }}</td>
            <td>{{ o.familyName }}</td>
            <td>{{ workerName(o.assignee) }}</td>
            <td>{{ fmtDate(o.deadline) }}</td>
            <td>
              <span v-if="isOverdue(o)" class="error-text">超期 {{ remainDays(o) }} 天</span>
              <span v-else>{{ remainDays(o) }} 天</span>
            </td>
            <td>
              <span class="chip" :style="chipStyle(o.status)">{{ statusLabel(o.status) }}</span>
              <div v-if="o.status === 'rejected' && lastFailItems(o)" class="error-text" style="max-width:200px">
                整改：{{ lastFailItems(o) }}
              </div>
            </td>
            <td>
              <img v-for="(p, i) in o.photos" :key="i" :src="p" class="thumb" @click="preview = p" />
              <span v-if="!o.photos.length" class="muted">未上传</span>
            </td>
            <td>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button class="btn btn-sm" @click="viewLayout(o)">布置图</button>
                <label class="btn btn-sm" style="margin:0">
                  传照片
                  <input type="file" accept="image/*" multiple style="display:none" @change="e => uploadPhotos(o, e)" />
                </label>
                <button class="btn btn-sm" @click="demoPhoto(o)">示例照片</button>
                <button
                  class="btn btn-sm btn-primary"
                  :disabled="!o.photos.length"
                  :title="o.photos.length ? '' : '需先上传完工照片'"
                  @click="submitQc(o)"
                >{{ o.reworkCount > 0 ? '重新提交审核' : '提交质检' }}</button>
                <router-link v-if="o.status === 'rejected'" class="btn btn-sm btn-warn" :to="'/editor/' + o.id">改布置图</router-link>
              </div>
            </td>
          </tr>
          <tr v-if="!activeOrders.length"><td colspan="8" class="muted">暂无施工中的工单</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 布置图查看 -->
    <div v-if="layoutModal" class="modal-mask" @click.self="layoutModal = null">
      <div class="modal">
        <h3>布置俯视图 — {{ layoutModal.id }}</h3>
        <img v-if="layoutModal.layoutPreview" :src="layoutModal.layoutPreview" style="width:100%;border:1px solid #ddd;border-radius:6px" />
        <div v-else class="muted">暂无定稿俯视图</div>
        <div v-if="layoutModal.materials" style="margin-top:10px">
          石材 {{ layoutModal.materials.stone }} 块 · 绿植 {{ layoutModal.materials.plants }} 棵 · 刻字 {{ layoutModal.materials.chars }} 字
        </div>
        <div style="margin-top:12px;text-align:right"><button class="btn" @click="layoutModal = null">关闭</button></div>
      </div>
    </div>

    <!-- 照片预览 -->
    <div v-if="preview" class="modal-mask" @click="preview = null">
      <div class="modal" style="width:auto"><img :src="preview" style="max-width:80vw;max-height:80vh" /></div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { getArea } from '../data/cemetery.js'
import { store, STATUS, STELE_TYPES, WORKERS, workerById, activeOrdersOf, fileToDataURL, samplePhoto } from '../store.js'

const DAY = 86400000
const layoutModal = ref(null)
const preview = ref(null)

const pendingAssign = computed(() => store.orders.filter(o => o.status === 'layout_done'))
const activeOrders = computed(() =>
  store.orders.filter(o => ['in_progress', 'rejected'].includes(o.status))
)

// 主管派工：按在手工单数排序，展示手艺（技能）
const rankedWorkers = computed(() =>
  WORKERS.map(w => ({ ...w, load: activeOrdersOf(w.id).length }))
    .sort((a, b) => a.load - b.load)
)

const assignForm = reactive({})
function ensureForm(id) {
  if (!assignForm[id]) assignForm[id] = { worker: rankedWorkers.value[0]?.id, days: 5 }
  return assignForm[id]
}
// 待派工工单变化时补齐表单（含新定稿进入的工单）
watch(pendingAssign, list => list.forEach(o => ensureForm(o.id)), { immediate: true })

function assign(o) {
  const f = ensureForm(o.id)
  if (!f.worker || !f.days || f.days < 1) return alert('请选择师傅并填写工期天数')
  o.assignee = f.worker
  o.assignDays = f.days
  o.assignedAt = Date.now()
  o.deadline = o.assignedAt + f.days * DAY
  o.status = 'in_progress'
}

async function uploadPhotos(o, e) {
  for (const f of e.target.files) {
    o.photos.push(await fileToDataURL(f))
  }
  e.target.value = ''
}

function demoPhoto(o) {
  o.photos.push(samplePhoto(o.id + ' 完工照'))
}

function submitQc(o) {
  if (!o.photos.length) return
  o.status = 'pending_qc'
  o.submittedAt = Date.now()
}

function viewLayout(o) { layoutModal.value = o }

function areaName(id) { return getArea(id)?.name || id }
function steleName(id) { return STELE_TYPES.find(s => s.id === id)?.name || id }
function workerName(id) { return workerById(id)?.name || '-' }
function statusLabel(s) { return STATUS[s]?.label || s }
function chipStyle(s) { const c = STATUS[s]; return c ? `background:${c.bg};color:${c.color}` : '' }
function fmtDate(t) { return t ? new Date(t).toLocaleDateString('zh-CN') : '-' }
function isOverdue(o) { return o.status === 'in_progress' && o.deadline && o.deadline < Date.now() }
function remainDays(o) {
  if (!o.deadline) return '-'
  return Math.abs(Math.ceil((o.deadline - Date.now()) / DAY))
}
function lastFailItems(o) {
  const fails = o.qcRecords.filter(r => r.result === 'fail')
  return fails.length ? fails[fails.length - 1].items : ''
}
</script>
