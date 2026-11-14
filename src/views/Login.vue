<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../store'

const store = useStore()
const router = useRouter()
const name = ref('')

function enter(role) {
  store.login(role, name.value.trim())
  router.push('/')
}
</script>

<template>
  <div class="login-page">
    <h1>幕墙立面板块排布与交付审核系统</h1>
    <p class="sub">深化设计组 · 立面排布 / 审核 / 交付</p>
    <input v-model="name" placeholder="姓名(可选)" class="name-input" />
    <div class="role-cards">
      <div class="role-card" @click="enter('customer')">
        <h3>客户</h3>
        <p>下单填楼栋、立面数量、玻璃配置与交付日期;查看进度与交付包(只读)</p>
      </div>
      <div class="role-card" @click="enter('designer')">
        <h3>制作员</h3>
        <p>在画布上排板块、批量改配置、提交审核、处理退回返工</p>
      </div>
      <div class="role-card" @click="enter('supervisor')">
        <h3>主管</h3>
        <p>逐块审核、退回填原因、全部通过后锁定立面</p>
      </div>
    </div>
  </div>
</template>
