<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '../store'
import { isViolation } from '../utils/glass'

const store = useStore()
const route = useRoute()
const project = computed(() => store.projectById(route.params.id))

const statusLabel = s => ({ designing: '设计中', submitted: '审核中', approved: '已锁定' }[s] || s)

function violationCount(facade) {
  return facade.panels.filter(p => isViolation(p)).length
}
</script>

<template>
  <div class="page" v-if="project">
    <div class="page-head">
      <h2>{{ project.name }}</h2>
      <router-link
        v-if="store.projectApproved(project)"
        :to="`/project/${project.id}/delivery`"
        class="btn primary"
      >查看交付包</router-link>
      <router-link v-else :to="`/project/${project.id}/delivery`" class="btn ghost">进度看板</router-link>
    </div>
    <div class="info-grid">
      <div><span>楼栋</span><b>{{ project.building }}</b></div>
      <div><span>立面数量</span><b>{{ project.facades.length }}</b></div>
      <div><span>默认玻璃配置</span><b>{{ project.glassConfig }}</b></div>
      <div><span>交付日期</span><b>{{ project.deliveryDate }}</b></div>
      <div><span>下单日期</span><b>{{ project.createdAt }}</b></div>
    </div>

    <h3>立面清单</h3>
    <table class="table">
      <thead>
        <tr>
          <th>立面</th><th>尺寸(m)</th><th>板块数</th><th>超限板块</th>
          <th>审核进度</th><th>状态</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="f in project.facades" :key="f.id">
          <td>{{ f.name }}</td>
          <td>{{ f.width }} × {{ f.height }}</td>
          <td>{{ f.panels.length }}</td>
          <td>
            <span v-if="violationCount(f)" class="badge violation">{{ violationCount(f) }} 块超限</span>
            <span v-else>—</span>
          </td>
          <td>
            <template v-if="f.panels.length">
              {{ store.facadeProgress(f).approved }}/{{ f.panels.length }} 通过
              <span v-if="store.facadeProgress(f).rejected" class="badge rejected">
                {{ store.facadeProgress(f).rejected }} 退回
              </span>
            </template>
            <span v-else>未排布</span>
          </td>
          <td><span class="badge" :class="f.status">{{ statusLabel(f.status) }}</span></td>
          <td>
            <router-link :to="`/facade/${f.id}/edit`" class="btn small">
              {{ store.role === 'designer' && f.status !== 'approved' ? '深化设计' : '查看画布' }}
            </router-link>
            <router-link
              v-if="store.role === 'supervisor'"
              :to="`/facade/${f.id}/review`"
              class="btn small ghost"
            >审核</router-link>
          </td>
        </tr>
      </tbody>
    </table>
    <p class="tip" v-if="store.role === 'customer'">客户账号为只读,不能修改排布与审核结果。</p>
  </div>
  <div class="page" v-else><p class="empty">项目不存在。</p></div>
</template>
