import { createRouter, createWebHistory } from 'vue-router'
import Aa from '../views/aa.vue'
import Bb from '../views/bb.vue'
import Cc from '../views/cc.vue'
import Dd from '../views/dd.vue'
import Ee from '../views/ee.vue'

const routes = [
    {
        path: '/aa',
        name: 'aa',
        component: Aa
    },
    {
        path: '/bb',
        name: 'bb',
        component:Bb
    },
    {
        path: '/cc',
        name: 'cc',
        component:Cc
    },
    {
        path: '/dd',
        name: 'dd',
        component:Dd
    },
    {
        path: '/ee',
        name: 'ee',
        component:Ee
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router