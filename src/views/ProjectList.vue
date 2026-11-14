<script setup>
import { useStore } from '../store'

const store = useStore()

function projectProgress(project) {
  const approved = project.facades.filter(f => f.status === 'approved').length
  return `${approved}/${project.facades.length}`
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h2>项目列表</h2>
      <router-link v-if="store.role === 'customer'" to="/order/new" class="btn primary">+ 客户下单</router-link>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>项目名称</th><th>楼栋</th><th>立面数</th><th>默认玻璃配置</th>
          <th>交付日期</th><th>立面通过</th><th>状态</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in store.projects" :key="p.id">
          <td>{{ p.name }}</td>
          <td>{{ p.building }}</td>
          <td>{{ p.facades.length }}</td>
          <td>{{ p.glassConfig }}</td>
          <td>{{ p.deliveryDate }}</td>
          <td>{{ projectProgress(p) }}</td>
          <td>
            <span class="badge" :class="store.projectApproved(p) ? 'approved' : 'submitted'">
              {{ store.projectApproved(p) ? '已交付' : '进行中' }}
            </span>
          </td>
          <td>
            <router-link :to="`/project/${p.id}`" class="btn small">查看</router-link>
            <router-link :to="`/project/${p.id}/delivery`" class="btn small ghost">交付包/看板</router-link>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="!store.projects.length" class="empty">暂无项目,客户请先下单。</p>
  </div>
</template>
