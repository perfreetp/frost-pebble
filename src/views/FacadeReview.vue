<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../store'
import { FacadeScene } from '../babylon/FacadeScene'
import { mm } from '../utils/glass'

const store = useStore()
const route = useRoute()
const router = useRouter()

const facade = computed(() => store.facadeById(route.params.id))
const project = computed(() => facade.value && store.projectById(facade.value.projectId))

const canvasEl = ref(null)
let scene = null

const layers = reactive({ structure: true, grid: true, embed: true, zone: true })
const layerDefs = [
  { key: 'structure', label: '结构线' },
  { key: 'grid', label: '分格线' },
  { key: 'embed', label: '埋件点位' },
  { key: 'zone', label: '吊装分区' }
]

const selected = ref([])
const rejectReason = ref('')
const message = ref('')

const single = computed(() => {
  if (!facade.value || selected.value.length !== 1) return null
  return facade.value.panels.find(p => p.id === selected.value[0]) || null
})
const progress = computed(() => facade.value ? store.facadeProgress(facade.value) : null)
const canLock = computed(() => facade.value && store.canLock(facade.value))

// 审核配色:通过绿 / 退回红 / 返工>2 次橙 / 待审灰蓝
function styleOf(p) {
  if (p.status === 'approved') return 'approved'
  if (p.status === 'rejected') return 'rejected'
  if (p.reworkCount > 2) return 'rework'
  return 'normal'
}

onMounted(() => {
  if (!facade.value) return
  scene = new FacadeScene(canvasEl.value, facade.value, {
    getStyle: styleOf,
    onSelect: ids => { selected.value = ids; rejectReason.value = '' }
  })
})

onBeforeUnmount(() => scene && scene.dispose())

function applyLayers() {
  scene && scene.setLayers({ ...layers })
}

function pass() {
  if (!single.value) return
  store.reviewPanel(facade.value.id, single.value.id, true)
  scene.rebuild()
  message.value = `${single.value.code} 已通过`
}

function reject() {
  if (!single.value) return
  if (!rejectReason.value.trim()) { alert('退回必须填写原因'); return }
  store.reviewPanel(facade.value.id, single.value.id, false, rejectReason.value.trim())
  message.value = `${single.value.code} 已退回(第 ${single.value.reworkCount} 次返工)`
  rejectReason.value = ''
  scene.rebuild()
}

function lock() {
  if (store.lockFacade(facade.value.id)) {
    alert('立面已全部通过并锁定,不可再修改')
    router.push(`/project/${project.value.id}`)
  }
}
</script>

<template>
  <div class="editor-page" v-if="facade">
    <div class="toolbar">
      <button class="btn small" @click="router.push(`/project/${project.id}`)">← 返回</button>
      <strong>{{ facade.name }} · 审核</strong>
      <span class="badge" :class="facade.status">
        {{ { designing: '设计中(未提交)', submitted: '审核中', approved: '已锁定' }[facade.status] }}
      </span>
      <span class="sep"></span>
      <label v-for="l in layerDefs" :key="l.key" class="layer-toggle">
        <input type="checkbox" v-model="layers[l.key]" @change="applyLayers" /> {{ l.label }}
      </label>
      <span class="sep"></span>
      <span v-if="progress" class="progress-text">
        通过 {{ progress.approved }}/{{ progress.total }}
        <template v-if="progress.rejected"> · 退回 {{ progress.rejected }}</template>
      </span>
      <button v-if="canLock" class="btn small primary" @click="lock">全部通过 · 锁定立面</button>
    </div>

    <div class="editor-body">
      <div class="canvas-wrap"><canvas ref="canvasEl"></canvas></div>
      <aside class="side">
        <h3>逐块审核</h3>
        <template v-if="facade.status === 'submitted'">
          <template v-if="single">
            <div class="kv"><span>编号</span><b>{{ single.code }}</b></div>
            <div class="kv"><span>尺寸</span><b>{{ mm(single.w) }} × {{ mm(single.h) }} mm</b></div>
            <div class="kv"><span>玻璃配置</span><b>{{ single.config }}</b></div>
            <div class="kv"><span>单块重量</span><b>{{ single.weight }} kg</b></div>
            <div class="kv"><span>状态</span>
              <b>{{ { pending: '待审', approved: '已通过', rejected: '已退回' }[single.status] }}</b>
            </div>
            <div class="kv"><span>返工次数</span>
              <b :class="{ 'text-orange': single.reworkCount > 2 }">{{ single.reworkCount }}</b>
            </div>
            <p v-if="single.reworkCount > 2" class="warn orange">⚠ 返工超过 2 次,重点关注</p>
            <p v-if="single.rejectReason" class="warn">上次退回原因:{{ single.rejectReason }}</p>

            <div class="review-actions" v-if="single.status !== 'approved'">
              <button class="btn primary" @click="pass">通过</button>
            </div>
            <div v-if="single.status !== 'approved'" class="reject-box">
              <textarea v-model="rejectReason" placeholder="退回原因(必填)" rows="2"></textarea>
              <button class="btn danger" @click="reject">退回</button>
            </div>
          </template>
          <p v-else class="empty">点击板块进行审核。绿色=已通过,红色=已退回,橙色=返工超 2 次。</p>
        </template>
        <p v-else-if="facade.status === 'approved'" class="ok">立面已锁定,不可再修改。</p>
        <p v-else class="empty">制作员尚未提交,暂不能审核。</p>
        <p v-if="message" class="ok">{{ message }}</p>
      </aside>
    </div>
  </div>
  <div class="page" v-else><p class="empty">立面不存在。</p></div>
</template>
