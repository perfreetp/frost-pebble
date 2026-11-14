<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../store'
import { GLASS_CONFIGS } from '../utils/glass'

const store = useStore()
const router = useRouter()
const error = ref('')
const form = reactive({
  name: '',
  building: '',
  facadeCount: 4,
  glassConfig: GLASS_CONFIGS[0].id,
  deliveryDate: ''
})

function submit() {
  if (!form.name.trim()) { error.value = '请填写项目名称'; return }
  if (!form.building.trim()) { error.value = '请填写楼栋'; return }
  if (!form.facadeCount || form.facadeCount < 1 || form.facadeCount > 50) {
    error.value = '立面数量需在 1~50 之间'; return
  }
  if (!form.deliveryDate) { error.value = '请选择交付日期'; return }
  const p = store.createOrder({ ...form })
  router.push(`/project/${p.id}`)
}
</script>

<template>
  <div class="page narrow">
    <h2>客户下单</h2>
    <div class="form">
      <label>项目名称<input v-model="form.name" placeholder="如:滨江金融中心幕墙工程" /></label>
      <label>楼栋<input v-model="form.building" placeholder="如:T1栋" /></label>
      <label>立面数量<input v-model.number="form.facadeCount" type="number" min="1" max="50" /></label>
      <label>玻璃配置
        <select v-model="form.glassConfig">
          <option v-for="c in GLASS_CONFIGS" :key="c.id" :value="c.id">
            {{ c.label }}({{ c.kgPerM2 }} kg/m²)
          </option>
        </select>
      </label>
      <label>交付日期<input v-model="form.deliveryDate" type="date" /></label>
      <p v-if="error" class="error">{{ error }}</p>
      <button class="btn primary" @click="submit">提交订单</button>
    </div>
  </div>
</template>
