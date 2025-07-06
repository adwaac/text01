import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import qs from 'qs'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
const Vue=createApp(App);
Vue.use(router)
Vue.use(ElementPlus,{
    local:zhCn,
    })
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        Vue.component(key, component)
    }
Vue.mount('#app')
Vue.config.productionTip = false
//设置axios的基础url部分
//axios.defaults.baseURL = 'http://localhost:8080/elm/';
//将axios挂载到vue实例上，使用时就可以 this.$axios 这样使用了
//Vue.prototype.$axios = axios;
Vue.config.globalProperties.$axios = axios;  
Vue.config.globalProperties.$qs = qs; 