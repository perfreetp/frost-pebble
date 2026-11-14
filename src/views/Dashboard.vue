<template>
  <div class="page">
    <h2>看板</h2>

    <div class="stat-cards">
      <div class="stat-card"><div class="num">{{ totals.all }}</div><div class="lbl">工单总数</div></div>
      <div class="stat-card"><div class="num" style="color:#15803d">{{ totals.completed }}</div><div class="lbl">已完成</div></div>
      <div class="stat-card"><div class="num" style="color:#0e7490">{{ totals.active }}</div><div class="lbl">施工中</div></div>
      <div class="stat-card"><div class="num" style="color:#7c3aed">{{ totals.qc }}</div><div class="lbl">待质检</div></div>
      <div class="stat-card"><div class="num" style="color:#b91c1c">{{ totals.rejected }}</div><div class="lbl">打回整改</div></div>
      <div class="stat-card"><div class="num" style="color:#b45309">{{ overdue.length }}</div><div class="lbl">超期工单</div></div>
    </div>

    <h3>师傅绩效</h3>
    <div class="card">
      <table class="data">
        <thead>
          <tr>
            <th>师傅</th><th>手艺</th><th>在手单</th><th>完成量</th>
            <th>返工次数</th><th>返工率</th><th>平均工期</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="w in workerStats" :key="w.id">
            <td><b>{{ w.name }}</b></td>
            <td class="muted">{{ w.skills.join(' / ') }}</td>
            <td>{{ w.active }}</td>
            <td>{{ w.done }}</td>
            <td>{{ w.reworks }}</td>
            <td :style="w.reworkRate > 0.3 ? 'color:#b91c1c;font-weight:700' : ''">{{ Math.round(w.reworkRate * 100) }}%</td>
            <td>{{ w.avgDays === null ? '—' : w.avgDays.toFixed(1) + ' 天' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3>超期工单（标黄）</h3>
    <div class="card">
      <table class="data">
        <thead>
          <tr><th>工单号</th><th>家属</th><th>墓位</th><th>师傅</th><th>截止</th><th>超期</th><th>状态</th></tr>
        </thead>
        <tbody>
          <tr v-for="o in overdue" :key="o.id" class="overdue">
            <td class="mono">{{ o.id }}</td>
            <td>{{ o.familyName }}</td>
            <td>{{ areaName(o.areaId) }} {{ o.row + 1 }}排{{ o.col + 1 }}号</td>
            <td>{{ workerName(o.assignee) }}</td>
            <td>{{ fmtDate(o.deadline) }}</td>
            <td class="warn-text" style="font-weight:700">{{ overdueDays(o) }} 天</td>
            <td>{{ statusLabel(o.status) }}</td>
          </tr>
          <tr v-if="!overdue.length"><td colspan="7" class="muted">暂无超期工单</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getArea } from '../data/cemetery.js'
import { store, STATUS, WORKERS, workerById, activeOrdersOf } from '../store.js'

const DAY = 86400000

const totals = computed(() => ({
  all: store.orders.length,
  completed: store.orders.filter(o => o.status === 'completed').length,
  active: store.orders.filter(o => o.status === 'in_progress').length,
  qc: store.orders.filter(o => o.status === 'pending_qc').length,
  rejected: store.orders.filter(o => o.status === 'rejected').length
}))

const workerStats = computed(() =>
  WORKERS.map(w => {
    const mine = store.orders.filter(o => o.assignee === w.id)
    const done = mine.filter(o => o.status === 'completed')
    const reworks = mine.reduce((s, o) => s + (o.reworkCount || 0), 0)
    const durations = done
      .filter(o => o.assignedAt && o.completedAt)
      .map(o => (o.completedAt - o.assignedAt) / DAY)
    return {
      ...w,
      active: activeOrdersOf(w.id).length,
      done: done.length,
      reworks,
      reworkRate: done.length ? reworks / done.length : (reworks > 0 ? 1 : 0),
      avgDays: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null
    }
  })
)

const overdue = computed(() =>
  store.orders.filter(o =>
    ['in_progress', 'rejected', 'pending_qc'].includes(o.status) && o.deadline && o.deadline < Date.now()
  ).sort((a, b) => a.deadline - b.deadline)
)

function overdueDays(o) { return Math.ceil((Date.now() - o.deadline) / DAY) }
function areaName(id) { return getArea(id)?.name || id }
function workerName(id) { return workerById(id)?.name || '-' }
function statusLabel(s) { return STATUS[s]?.label || s }
function fmtDate(t) { return t ? new Date(t).toLocaleDateString('zh-CN') : '-' }
</script>
