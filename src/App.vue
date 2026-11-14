<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">🪦 陵园墓区布置与施工工单系统</div>
      <nav>
        <router-link to="/reception">前台接单</router-link>
        <router-link to="/editor">布置编辑器</router-link>
        <router-link to="/schedule">工单排班</router-link>
        <router-link to="/qc">质检</router-link>
        <router-link to="/dashboard">看板</router-link>
      </nav>
      <button class="btn btn-ghost btn-sm" @click="onReset">重置演示数据</button>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { resetStore } from './store.js'

function onReset() {
  if (confirm('确定清空全部数据并恢复演示初始状态？')) resetStore()
}
</script>
