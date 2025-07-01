import { createRouter, createWebHistory } from 'vue-router'
import Aa from '../views/aa.vue'
import Bb from '../views/bb.vue'

const routes = [
    {
        path: '/',
        name: 'aa',
        component: Aa
    },
    {
        path: '/bb',
        name: 'bb',
        component:Bb
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router