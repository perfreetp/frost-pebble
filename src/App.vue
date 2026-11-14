<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from './store'

const store = useStore()
const router = useRouter()
const roleLabel = computed(() => ({
  customer: '客户', designer: '制作员', supervisor: '主管'
}[store.role] || ''))

function logout() {
  store.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-shell">
    <header v-if="store.role" class="topbar">
      <span class="brand">幕墙立面板块排布与交付审核系统</span>
      <nav>
        <router-link to="/">项目列表</router-link>
        <router-link v-if="store.role === 'customer'" to="/order/new">客户下单</router-link>
      </nav>
      <span class="user">
        <b>{{ roleLabel }}</b> · {{ store.userName || '未命名' }}
        <a class="logout" @click="logout">退出</a>
      </span>
    </header>
    <router-view />
  </div>
</template>
