<template>
  <div class="manager-container">
    <!-- 侧边栏 -->
    <el-container class="main-container">
      <el-aside width="200px">
        <div class="logo">旅游管理系统</div>
        <el-menu
          router
          :default-active="activeMenu"
          class="el-menu-vertical"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <!-- 只有status为admin时显示用户管理 -->
          <el-sub-menu index="1" v-if="status === 'admin'">
            <template #title>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/manager/tourist">
              <el-icon><User /></el-icon>
              <span>游客管理</span>
            </el-menu-item>
            <el-menu-item index="/manager/touroffer">
              <el-icon><ShoppingBag /></el-icon>
              <span>供应商管理</span>
            </el-menu-item>
            
            <!--<el-menu-item index="/manager/touradmin">
              <el-icon><UserFilled /></el-icon> <span>旅游管理员</span>
            </el-menu-item>
            <el-menu-item index="/manager/sysadmin">
              <el-icon><Avatar /></el-icon><span>系统管理员</span>
            </el-menu-item>-->
          </el-sub-menu>
          <!-- 只有status为lyuser时显示旅游项目 -->
          <el-menu-item index="/manager/tourproject" v-if="status === 'lyuser'" @click="goToTourProject">
            <el-icon><Setting /></el-icon>
            <span>旅游项目</span>
          </el-menu-item>
          <el-menu-item @click="goToNoticePage">
            <el-icon><ChatDotRound /></el-icon>
            <span>公告</span>
          </el-menu-item>
          <el-menu-item @click="goToComment">
            <el-icon><Comment /></el-icon>
            <span>攻略评价</span>
          </el-menu-item>
          <el-menu-item @click="goToOrderDetail">
              <el-icon><UserFilled /></el-icon> <span>订单详情</span>
            </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header>
          <div class="header-container">
            <div class="breadcrumb">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/manager' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-if="activeMenu === '/manager/tourist'">游客管理</el-breadcrumb-item>
                <el-breadcrumb-item v-if="activeMenu === '/manager/touroffer'">供应商管理</el-breadcrumb-item>
                <el-breadcrumb-item v-if="activeMenu === '/manager/test'">测试页面</el-breadcrumb-item>
                <el-breadcrumb-item v-if="activeMenu === '/manager/tourproject'">旅游项目</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="user-info">
              <span>{{ status }}{{ userid }}</span>
              <el-dropdown>
                <span class="el-dropdown-link">
                  操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  User, 
  ShoppingBag, 
  Setting, 
  ArrowDown,
  UserFilled,
  Avatar
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => {
  return route.path
})

// 获取status参数，先从sessionStorage中获取，如果没有再从路由参数中获取
const status = ref(sessionStorage.getItem('status') || route.query.status || '未知状态')
console.log('响应数据:', status.value)

// 页面加载时将status存储到sessionStorage
onMounted(() => {
  if (route.query.status) {
    sessionStorage.setItem('status', route.query.status)
  }
})

const userid = ref(sessionStorage.getItem('userid') || route.query.userid || '未知状态')

// 页面加载时将userid存储到sessionStorage
onMounted(() => {
  if (route.query.userid) {
    sessionStorage.setItem('userid', route.query.userid)
  }
})

console.log('响应数据userid:', userid.value)

const goToNoticePage = () => {
  router.push({
    path: '/manager/notice',
    query: {
      userid: userid.value,
      status: status.value
    }
  });
}

const goToComment = () => {
  router.push({
    path: '/manager/comment',
    query: {
      userid: userid.value,
      status: status.value
    }
  });
}

const goToOrderDetail = () => {
  router.push({
    path: '/manager/order',
    query: {
      userid: userid.value,
      status: status.value
    }
  });
}

const goToTourProject = () => {
  router.push({
    path: '/manager/tourproject',
    query: {
      userid: userid.value,
      status: status.value
    }
  });
}

const logout = () => {
  // 清除 sessionStorage 中的 userId 和 status
  sessionStorage.removeItem('userid');
  sessionStorage.removeItem('status');
  // 这里可以添加登出逻辑
  router.push('/')
}
</script>

<style scoped>
.manager-container {
  height: 100vh;
  width: 100%;
}

.main-container {
  height: 100%;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background-color: #263445;
}

.el-aside {
  background-color: #304156;
  color: #bfcbd9;
}

.el-menu {
  border-right: none;
}

.el-header {
  background-color: #fff;
  color: #333;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
}

.header-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info span {
  margin-right: 10px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}
</style>    