import { createRouter, createWebHashHistory } from 'vue-router'
import Reception from './views/Reception.vue'
import LayoutEditor from './views/LayoutEditor.vue'
import Scheduling from './views/Scheduling.vue'
import Quality from './views/Quality.vue'
import Dashboard from './views/Dashboard.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/reception' },
    { path: '/reception', component: Reception },
    { path: '/editor/:orderId?', component: LayoutEditor },
    { path: '/schedule', component: Scheduling },
    { path: '/qc', component: Quality },
    { path: '/dashboard', component: Dashboard }
  ]
})
