<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '../store'
import { mm } from '../utils/glass'

const store = useStore()
const route = useRoute()
const project = computed(() => store.projectById(route.params.id))
const allApproved = computed(() => project.value && store.projectApproved(project.value))

const allPanels = computed(() => {
  if (!project.value) return []
  return project.value.facades.flatMap(f =>
    f.panels.map(p => ({ ...p, facadeName: f.name })))
})

const totalArea = computed(() =>
  allPanels.value.reduce((s, p) => s + p.w * p.h, 0))
const totalWeight = computed(() =>
  allPanels.value.reduce((s, p) => s + p.weight, 0))
const totalEmbeds = computed(() =>
  project.value ? project.value.facades.reduce((s, f) => s + f.embeds.length, 0) : 0)

function exportCsv() {
  const header = '立面,编号,宽(mm),高(mm),面积(m2),玻璃配置,单块重量(kg),状态,返工次数\n'
  const rows = allPanels.value.map(p =>
    [p.facadeName, p.code, mm(p.w), mm(p.h), (p.w * p.h).toFixed(2), p.config, p.weight,
     { pending: '待审', approved: '通过', rejected: '退回' }[p.status], p.reworkCount
    ].join(',')).join('\n')
  const blob = new Blob(['﻿' + header + rows], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${project.value.name}-板块明细.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <div class="page" v-if="project">
    <div class="page-head">
      <h2>{{ project.name }} · {{ allApproved ? '交付包' : '进度看板' }}</h2>
      <button v-if="allApproved" class="btn primary" @click="exportCsv">导出板块明细 CSV</button>
    </div>

    <!-- 进度看板 -->
    <h3>进度看板</h3>
    <div class="dashboard">
      <div v-for="f in project.facades" :key="f.id" class="dash-card">
        <div class="dash-head">
          <b>{{ f.name }}</b>
          <span class="badge" :class="f.status">
            {{ { designing: '设计中', submitted: '审核中', approved: '已锁定' }[f.status] }}
          </span>
        </div>
        <div class="bar">
          <div class="bar-fill" :style="{
            width: (f.panels.length ? store.facadeProgress(f).approved / f.panels.length * 100 : 0) + '%'
          }"></div>
        </div>
        <div class="dash-nums">
          <span>板块 {{ f.panels.length }}</span>
          <span class="text-green">通过 {{ store.facadeProgress(f).approved }}</span>
          <span class="text-red" v-if="store.facadeProgress(f).rejected">
            退回 {{ store.facadeProgress(f).rejected }}
          </span>
          <span>埋件 {{ f.embeds.length }}</span>
        </div>
      </div>
    </div>

    <template v-if="allApproved">
      <!-- 埋件数量统计 -->
      <h3>埋件数量统计</h3>
      <table class="table">
        <thead><tr><th>立面</th><th>埋件数量</th><th>吊装分区</th></tr></thead>
        <tbody>
          <tr v-for="f in project.facades" :key="f.id">
            <td>{{ f.name }}</td>
            <td>{{ f.embeds.length }}</td>
            <td>{{ f.zones.map(z => z.name).join('、') }}</td>
          </tr>
          <tr class="sum-row"><td>合计</td><td>{{ totalEmbeds }}</td><td>—</td></tr>
        </tbody>
      </table>

      <!-- 板块明细 -->
      <h3>板块明细(共 {{ allPanels.length }} 块 · 总面积 {{ totalArea.toFixed(2) }} m² · 总重 {{ totalWeight.toFixed(1) }} kg)</h3>
      <div class="table-scroll">
        <table class="table">
          <thead>
            <tr>
              <th>立面</th><th>编号</th><th>宽(mm)</th><th>高(mm)</th>
              <th>面积(m²)</th><th>玻璃配置</th><th>重量(kg)</th><th>返工次数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in allPanels" :key="p.id">
              <td>{{ p.facadeName }}</td>
              <td>{{ p.code }}</td>
              <td>{{ mm(p.w) }}</td>
              <td>{{ mm(p.h) }}</td>
              <td>{{ (p.w * p.h).toFixed(2) }}</td>
              <td>{{ p.config }}</td>
              <td>{{ p.weight }}</td>
              <td :class="{ 'text-orange': p.reworkCount > 2 }">{{ p.reworkCount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <p v-else class="tip">全部立面审核通过后自动生成交付包(板块明细 + 埋件数量统计 + 进度看板)。</p>
  </div>
  <div class="page" v-else><p class="empty">项目不存在。</p></div>
</template>
