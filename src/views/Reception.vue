<template>
  <div class="page">
    <h2>前台接单</h2>
    <div class="card">
      <div class="form-grid">
        <label class="field">家属姓名 *
          <input v-model.trim="form.familyName" placeholder="联系人姓名" />
        </label>
        <label class="field">联系电话 *
          <input v-model.trim="form.phone" placeholder="手机 / 电话" />
        </label>
        <label class="field">逝者姓名 *
          <input v-model.trim="form.deceased" />
        </label>
        <label class="field">碑型 *
          <select v-model="form.steleType">
            <option v-for="s in STELE_TYPES" :key="s.id" :value="s.id">
              {{ s.name }}（{{ s.w }}×{{ s.d }}m，石材{{ s.blocks }}块）
            </option>
          </select>
        </label>
        <label class="field">墓区 *
          <select v-model="form.areaId" @change="onAreaChange">
            <option v-for="a in AREAS" :key="a.id" :value="a.id">
              {{ a.name }}（{{ a.rows }}排 × {{ a.cols }}号）
            </option>
          </select>
        </label>
        <label class="field">排 *
          <select v-model.number="form.row">
            <option v-for="r in area.rows" :key="r - 1" :value="r - 1">第 {{ r }} 排</option>
          </select>
        </label>
        <label class="field">号 *
          <select v-model.number="form.col">
            <option v-for="c in area.cols" :key="c - 1" :value="c - 1">{{ c }} 号</option>
          </select>
        </label>
        <div class="field" style="justify-content:flex-end">
          <span v-if="plotTaken" class="error-text">⚠ 该墓位已占用，请另选</span>
          <span v-else class="ok-text">✓ 该墓位可选</span>
        </div>
        <label class="field full">刻字内容
          <input v-model.trim="form.engraving" placeholder="碑文，如：先考某公某某之墓" />
        </label>
        <label class="field full">家属需求备注
          <textarea v-model.trim="form.needs" rows="2" placeholder="朝向、绿植、石栏、供桌等要求"></textarea>
        </label>
      </div>
      <div style="margin-top:14px;display:flex;gap:10px;align-items:center">
        <button class="btn btn-primary" :disabled="!canSubmit" @click="submit">录单并去布置</button>
        <button class="btn" :disabled="!canSubmit" @click="submitOnly">仅录单</button>
        <span v-if="msg" class="ok-text">{{ msg }}</span>
      </div>
    </div>

    <h3>全部工单</h3>
    <div class="card">
      <table class="data">
        <thead>
          <tr>
            <th>工单号</th><th>家属</th><th>逝者</th><th>墓位</th><th>碑型</th>
            <th>刻字</th><th>状态</th><th>录单时间</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in sortedOrders" :key="o.id">
            <td class="mono">{{ o.id }}</td>
            <td>{{ o.familyName }}</td>
            <td>{{ o.deceased }}</td>
            <td>{{ areaName(o.areaId) }} {{ o.row + 1 }}排{{ o.col + 1 }}号</td>
            <td>{{ steleName(o.steleType) }}</td>
            <td>{{ (o.engraving || '').replace(/\s/g, '').length }} 字</td>
            <td><span class="chip" :style="chipStyle(o.status)">{{ statusLabel(o.status) }}</span></td>
            <td class="muted">{{ fmtTime(o.createdAt) }}</td>
            <td>
              <router-link
                v-if="['pending_layout','rejected'].includes(o.status)"
                class="btn btn-sm btn-primary" :to="'/editor/' + o.id">去布置</router-link>
              <router-link v-else class="btn btn-sm" :to="'/editor/' + o.id">查看</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AREAS, getArea, plotKey } from '../data/cemetery.js'
import { store, STATUS, STELE_TYPES, occupiedSet, nextOrderId } from '../store.js'

const router = useRouter()
const area = computed(() => getArea(form.areaId))

const form = reactive({
  familyName: '', phone: '', deceased: '',
  steleType: 'trad', areaId: 'A', row: 0, col: 0,
  engraving: '', needs: ''
})
const msg = ref('')

const occ = computed(() => occupiedSet(form.areaId, null))
const plotTaken = computed(() => occ.value.has(plotKey(form.row, form.col)))
const canSubmit = computed(() =>
  form.familyName && form.phone && form.deceased && !plotTaken.value
)

const sortedOrders = computed(() => [...store.orders].sort((a, b) => b.createdAt - a.createdAt))

function onAreaChange() { form.row = 0; form.col = 0 }
function areaName(id) { return getArea(id)?.name || id }
function steleName(id) { return STELE_TYPES.find(s => s.id === id)?.name || id }
function statusLabel(s) { return STATUS[s]?.label || s }
function chipStyle(s) { const c = STATUS[s]; return c ? `background:${c.bg};color:${c.color}` : '' }
function fmtTime(t) { return new Date(t).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }

function createOrder() {
  const o = {
    id: nextOrderId(),
    familyName: form.familyName, phone: form.phone, deceased: form.deceased,
    needs: form.needs, areaId: form.areaId, row: form.row, col: form.col,
    steleType: form.steleType, engraving: form.engraving,
    status: 'pending_layout', createdAt: Date.now(),
    layout: { objects: [] }, materials: null, layoutPreview: null,
    assignee: null, assignDays: 0, assignedAt: null, deadline: null,
    photos: [], submittedAt: null, completedAt: null,
    reworkCount: 0, qcRecords: []
  }
  store.orders.push(o)
  return o
}

function submit() {
  const o = createOrder()
  router.push('/editor/' + o.id)
}

function submitOnly() {
  createOrder()
  msg.value = '录单成功，可在下方列表中进入布置'
  form.familyName = form.phone = form.deceased = form.engraving = form.needs = ''
  setTimeout(() => (msg.value = ''), 4000)
}
</script>
