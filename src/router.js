import { createRouter, createWebHashHistory } from 'vue-router'
import { useStore } from './store'
import Login from './views/Login.vue'
import ProjectList from './views/ProjectList.vue'
import OrderNew from './views/OrderNew.vue'
import ProjectDetail from './views/ProjectDetail.vue'
import FacadeEditor from './views/FacadeEditor.vue'
import FacadeReview from './views/FacadeReview.vue'
import Delivery from './views/Delivery.vue'

const routes = [
  { path: '/login', component: Login },
  { path: '/', component: ProjectList },
  { path: '/order/new', component: OrderNew, meta: { roles: ['customer'] } },
  { path: '/project/:id', component: ProjectDetail },
  { path: '/facade/:id/edit', component: FacadeEditor },
  { path: '/facade/:id/review', component: FacadeReview, meta: { roles: ['supervisor'] } },
  { path: '/project/:id/delivery', component: Delivery }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(to => {
  const store = useStore()
  if (!store.role && to.path !== '/login') return '/login'
  if (store.role && to.path === '/login') return '/'
  if (to.meta.roles && !to.meta.roles.includes(store.role)) return '/'
})
