import { createRouter, createWebHistory } from 'vue-router'
import aaaa from '../views/aaaa.vue'

const routes = [
  {path: '/', name: 'aaaa', component: aaaa},
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
