import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { useStore } from './store'
import './style.css'

const app = createApp(App)
app.use(createPinia())
useStore().load()
app.use(router)
app.mount('#app')
