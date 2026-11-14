<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../store'
import { FacadeScene } from '../babylon/FacadeScene'
import { GLASS_CONFIGS, isViolation, violationReason, mm } from '../utils/glass'

const store = useStore()
const route = useRoute()
const router = useRouter()

const facade = computed(() => store.facadeById(route.params.id))
const project = computed(() => facade.value && store.projectById(facade.value.projectId))
const canEdit = computed(() =>
  store.role === 'designer' && facade.value && facade.value.status !== 'approved')

const canvasEl = ref(null)
const wrapEl = ref(null)
let scene = null

const layers = reactive({ structure: true, grid: true, embed: true, zone: true })
const layerDefs = [
  { key: 'structure', label: '结构线' },
  { key: 'grid', label: '分格线' },
  { key: 'embed', label: '埋件点位' },
  { key: 'zone', label: '吊装分区' }
]

const selected = ref([])
const boxMode = ref(false)
const showGen = ref(false)
const gen = reactive({ cols: 16, rows: 22 })
const batchConfig = ref(GLASS_CONFIGS[0].id)
const message = ref('')

const selectedPanels = computed(() => {
  if (!facade.value) return []
  const set = new Set(selected.value)
  return facade.value.panels.filter(p => set.has(p.id))
})
const single = computed(() => selectedPanels.value.length === 1 ? selectedPanels.value[0] : null)
const totalArea = computed(() =>
  selectedPanels.value.reduce((s, p) => s + p.w * p.h, 0))
const totalWeight = computed(() =>
  selectedPanels.value.reduce((s, p) => s + p.weight, 0))
const violationCount = computed(() =>
  facade.value ? facade.value.panels.filter(p => isViolation(p)).length : 0)

const statusLabel = s => ({ designing: '设计中', submitted: '审核中', approved: '已锁定' }[s] || s)

onMounted(() => {
  if (!facade.value) return
  scene = new FacadeScene(canvasEl.value, facade.value, {
    getStyle: p => isViolation(p) ? 'violation' : 'normal',
    onSelect: ids => { selected.value = ids }
  })
})

onBeforeUnmount(() => scene && scene.dispose())

function applyLayers() {
  scene && scene.setLayers({ ...layers })
}

function toggleBox() {
  boxMode.value = !boxMode.value
  scene && scene.setBoxMode(boxMode.value)
}

function generate() {
  if (!canEdit.value) return
  if (facade.value.panels.length &&
      !confirm(`将覆盖现有 ${facade.value.panels.length} 块板块,继续?`)) return
  store.generateGrid(facade.value.id, gen.cols, gen.rows)
  selected.value = []
  scene.rebuild()
  showGen.value = false
}

function deleteSelected() {
  if (!canEdit.value || !selected.value.length) return
  if (!confirm(`删除选中的 ${selected.value.length} 块板块?`)) return
  store.deletePanels(facade.value.id, selected.value)
  selected.value = []
  scene.setSelected([])
  scene.rebuild()
}

function applyConfig(configId) {
  if (!canEdit.value || !selected.value.length) return
  store.setPanelsConfig(facade.value.id, selected.value, configId)
  scene.rebuild()
  message.value = `已将 ${selected.value.length} 块板块改为 ${configId},重量与面积已重算`
}

function submit() {
  const res = store.submitFacade(facade.value.id)
  if (!res.ok) {
    alert(res.message)
  } else {
    message.value = '已提交主管审核'
    router.push(`/project/${project.value.id}`)
  }
}
</script>

<template>
  <div class="editor-page" v-if="facade">
    <div class="toolbar">
      <button class="btn small" @click="router.push(`/project/${project.id}`)">← 返回</button>
      <strong>{{ facade.name }}</strong>
      <span class="badge" :class="facade.status">{{ statusLabel(facade.status) }}</span>
      <span v-if="violationCount" class="badge violation">{{ violationCount }} 块超限</span>
      <span class="sep"></span>
      <label v-for="l in layerDefs" :key="l.key" class="layer-toggle">
        <input type="checkbox" v-model="layers[l.key]" @change="applyLayers" /> {{ l.label }}
      </label>
      <span class="sep"></span>
      <template v-if="canEdit">
        <button class="btn small" @click="showGen = true">生成分格</button>
        <button class="btn small" :class="{ active: boxMode }" @click="toggleBox">框选</button>
        <button class="btn small" :disabled="!selected.length" @click="deleteSelected">删除选中</button>
        <button class="btn small primary" @click="submit">
          {{ facade.status === 'submitted' ? '重新提交审核' : '提交审核' }}
        </button>
      </template>
      <span v-else class="readonly-tip">
        {{ facade.status === 'approved' ? '立面已锁定,只读' : '只读(仅制作员可编辑)' }}
      </span>
    </div>

    <div class="editor-body">
      <div class="canvas-wrap" ref="wrapEl">
        <canvas ref="canvasEl"></canvas>
      </div>
      <aside class="side">
        <h3>板块信息</h3>
        <template v-if="single">
          <div class="kv"><span>编号</span><b>{{ single.code }}</b></div>
          <div class="kv"><span>尺寸</span><b>{{ mm(single.w) }} × {{ mm(single.h) }} mm</b></div>
          <div class="kv"><span>面积</span><b>{{ (single.w * single.h).toFixed(2) }} m²</b></div>
          <div class="kv"><span>玻璃配置</span><b>{{ single.config }}</b></div>
          <div class="kv"><span>单块重量</span>
            <b :class="{ 'text-red': single.weight > 120 }">{{ single.weight }} kg</b>
          </div>
          <div class="kv"><span>返工次数</span>
            <b :class="{ 'text-orange': single.reworkCount > 2 }">{{ single.reworkCount }}</b>
          </div>
          <p v-if="isViolation(single)" class="warn">⚠ {{ violationReason(single) }}</p>
          <p v-if="single.status === 'rejected'" class="warn">退回原因:{{ single.rejectReason }}</p>
        </template>

        <template v-else-if="selectedPanels.length > 1">
          <div class="kv"><span>已选</span><b>{{ selectedPanels.length }} 块</b></div>
          <div class="kv"><span>总面积</span><b>{{ totalArea.toFixed(2) }} m²</b></div>
          <div class="kv"><span>总重量</span><b>{{ totalWeight.toFixed(1) }} kg</b></div>
          <div class="kv"><span>超限</span>
            <b class="text-red">{{ selectedPanels.filter(p => isViolation(p)).length }} 块</b>
          </div>
        </template>
        <p v-else class="empty">点击板块查看详情;开启"框选"可批量选择。滚轮缩放,拖动平移。</p>

        <template v-if="canEdit && selectedPanels.length">
          <h4>批量改配置</h4>
          <div class="config-row">
            <select v-model="batchConfig">
              <option v-for="c in GLASS_CONFIGS" :key="c.id" :value="c.id">
                {{ c.label }}({{ c.kgPerM2 }} kg/m²)
              </option>
            </select>
            <button class="btn small primary" @click="applyConfig(batchConfig)">应用</button>
          </div>
          <p class="tip">应用后自动重算每块重量与选中总面积。</p>
        </template>

        <p v-if="message" class="ok">{{ message }}</p>
      </aside>
    </div>

    <div v-if="showGen" class="modal-mask" @click.self="showGen = false">
      <div class="modal">
        <h3>生成分格</h3>
        <label>列数(横向)<input v-model.number="gen.cols" type="number" min="1" max="100" /></label>
        <label>行数(竖向)<input v-model.number="gen.rows" type="number" min="1" max="100" /></label>
        <p class="tip">
          板块约 {{ (facade.width / gen.cols).toFixed(2) }}m × {{ (facade.height / gen.rows).toFixed(2) }}m,
          共 {{ gen.cols * gen.rows }} 块;同时生成结构线、埋件点位与吊装分区。
        </p>
        <div class="modal-actions">
          <button class="btn" @click="showGen = false">取消</button>
          <button class="btn primary" @click="generate">生成</button>
        </div>
      </div>
    </div>
  </div>
  <div class="page" v-else><p class="empty">立面不存在。</p></div>
</template>
