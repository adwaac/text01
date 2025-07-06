import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Map from '../components/Map.vue'
import Reg from '../views/Reg.vue'
import Manager from '../views/Manager.vue'
import Comment from '../views/Comment.vue'
import guidelines from '../views/guidelines.vue'
import Home from '../views/Home.vue'
import Notice from '../views/Notice.vue'
import Route from '../views/Route.vue'
import Sysadmin from '../views/Sysadmin.vue'
import Touradmin from '../views/Touradmin.vue'
import Tourgroup from '../views/Tourgroup.vue'
import Tourist from '../views/Tourist.vue'
import Order from '../views/Order.vue'
import Touroffer from '../views/Touroffer.vue'
import Tourproject from '../views/Tourproject.vue'
import Videoupload from '../views/Videoupload.vue'
import Photoupload from '../views/Photoupload.vue'
import Guidelines from '../views/guidelines.vue'
import StrategyDetail from '../views/StrategyDetail.vue'
import text from '../views/text.vue'
import login2 from '../views/Login2.vue'

const routes = [
  {path: '/map',name:"Map",component:Map },
  {path: '/videoupload',name:"Videoupload",component:Videoupload },
  {path: '/photoupload',name:"Photoupload",component:Photoupload },
  //{path: '/',name:"Login",component:Login },
  //{path: '/',name:"login2",component:login2 },
  {path: '/',name:"text",component:text },
  {path: '/reg',name: 'Reg',component: Reg},
  {path: '/guidelines',name: 'guidelines',component: Guidelines},
  {path: '/route',name: 'route',component: Route},
  {path: '/tourgroup',name: 'tourgroup',component: Tourgroup},
  {path: '/home',name: 'home',component: Home},
  {path: '/order',name: 'order',component: Order},

  {path: '/manager', name: 'manager', component: Manager , children:[
    {path: 'notice',name: 'notice',component: Notice},
    {path: 'tourist',name: 'tourist',component: Tourist},
    {path: 'touroffer',name: 'touroffer',component: Touroffer},
    {path: 'sysadmin',name: 'sysadmin',component: Sysadmin},
    {path: 'touradmin',name: 'touradmin',component: Touradmin},
    {path: 'comment',name: 'comment',component: Comment},
    {path: 'tourproject',name: 'tourproject',component: Tourproject},
    {path: 'order',name: 'order',component: Order},
    ]},
  {
    path: '/strategy/:id',
    name: 'strategy-detail',
    component: StrategyDetail
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
