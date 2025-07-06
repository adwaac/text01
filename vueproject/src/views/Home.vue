<template>
    <div>
    <div style="margin: 10px ;text-align: center">
      <el-button size="small">首页</el-button>
      <el-button  size="small" type="success" color="#626aef" style="color: black" @click="goToGuidelines">攻略</el-button>
      <el-button  size="small" type="info"  @click="router.push('/route')">景点</el-button>
      <el-button  size="small" type="warning" @click="tojd">旅游供应商</el-button>
      
      <el-dropdown>
    <span class="el-dropdown-link"  style="margin-left: 10px;">
      个人中心
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="turn" :icon="Star">收藏</el-dropdown-item>
            <el-dropdown-item :icon="Collection" @click="toOrder">查看订单</el-dropdown-item>
            <el-dropdown-item  @click="router.push('/login')" divided>登录/注册</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="el-carousel">
      <el-carousel height="400px" :interval="3000" arrow="always" indicator-position="none">
        <el-carousel-item v-for="item in data.images" :key="item">
          <img style="width:100%" :src=" item" alt="">
        </el-carousel-item>
      </el-carousel>
      </div>
  
  <div>
      <!-- 特色旅游推荐 -->
      <section class="featured-tours">
        <h2>特色旅游推荐</h2>
        <div class="tour-cards">
          <div class="tour-card">
            <img src="@/assets/tower.png" alt="巴黎之旅">
            <h3>浪漫巴黎</h3>
            <p>探索巴黎的浪漫与艺术</p>
            <span class="price">¥12,999起</span>
          </div>
          <div class="tour-card">
            <img src="@/assets/logo.png" alt="马尔代夫">
            <h3>马尔代夫</h3>
            <p>享受天堂般的海岛假期</p>
            <span class="price">¥15,999起</span>
          </div>
          <div class="tour-card">
            <img src="@/assets/yinhua.jpg" alt="日本">
            <h3>日本文化之旅</h3>
            <p>体验传统与现代的完美融合</p>
            <span class="price">¥9,999起</span>
          </div>
        </div>
      </section>
       </div>
    
      <!-- 用户评价 -->
      <section class="testimonials">
        <h2>用户评价</h2>
        <div class="testimonial-cards">
          <div class="testimonial-card">
            <p>"这次旅行体验太棒了！导游专业，行程安排合理，强烈推荐！"</p>
            <div class="user-info">
              <img src="@/assets/gugong.jpg" alt="用户头像" width="300" height="200">
              <div>
                <h4>张先生</h4>
                <p>巴黎之旅</p>
              </div>
            </div>
          </div>
          <div class="testimonial-card">
            <p>"马尔代夫的海景太美了，服务也很周到，下次还会选择这里！"</p>
            <div class="user-info">
              <img src="@/assets/lun1.png" alt="用户头像" width="300" height="200">
              <div>
                <h4>李女士</h4>
                <p>马尔代夫之旅</p>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- 页脚 -->
      <footer class="footer">
        <div class="footer-content">
          <div class="footer-section">
            <h3>关于我们</h3>
            <p>TravelWorld致力于为您提供最优质的旅行体验</p>
          </div>
          <div class="footer-section">
            <h3>联系方式</h3>
            <p>电话：400-123-4567</p>
            <p>邮箱：info@travelworld.com</p>
          </div>
          <div class="footer-section">
            <h3>关注我们</h3>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 TravelWorld. All rights reserved.</p>
        </div>
      </footer>
    </div>
  </template>
  
<script setup>
  import {reactive, ref, onMounted} from "vue"
  import { useRoute, useRouter } from 'vue-router'
  import lun1 from "@/assets/lun1.png"
  import lun2 from "@/assets/lun2.png"
  import lun3 from "@/assets/lun3.png"
  import { ElMessage } from 'element-plus'

  const route = useRoute()
  const router = useRouter()
  const input = ref('123')
  const data = reactive({
    a: 123,
    value: '',
    input: null,
    box: {
      width: '100px',
      height: '100px',
      background: 'red',
    },
    images: [lun1, lun2, lun3],
  });

  const userId = ref('');

  onMounted(() => {
    // 从路由query中获取userid
    if (route.query.userid) {
      userId.value = route.query.userid;
      console.log('接收到的用户ID:', userId.value);
    } else {
      console.warn('未接收到用户ID');
    }
  });

  const toOrder = () => {
    console.log('前往订单页面，用户ID:', userId.value);
    console.log('前往订单页面，用户身份:', route.query.status);
    router.push({
      path: '/manager/order',
      query: {
        userid: userId.value,
        status: route.query.status
      }
    });
  }

  const tojd = () => {
    console.log('前往旅游供应商页面，用户ID:', userId.value);
    router.push({
      path: '/tourgroup',
      query: {
        userid: userId.value
      }
    });
  }

  const goToGuidelines = () => {
    router.push({
      name: 'guidelines',
      query: {
        userid: userId.value
      }
    });
  };
</script>

<style scoped>
  .el-carousel {
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    width: 100%;
    max-width: 1200px;
  }

  .el-carousel .el-carousel__container {
    width: 100%;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2c3e50;
  }
  
  .nav-links a {
    margin-left: 2rem;
    text-decoration: none;
    color: #2c3e50;
    transition: color 0.3s;
  }
  
  .nav-links a:hover {
    color: #3498db;
  }
  
  .nav-links a.active {
    color: #3498db;
  }
  
  /* 英雄区域样式 */
  .hero {
    height: 100vh;
    background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://via.placeholder.com/1920x1080');
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    margin-top: 60px;
  }
  
  .hero-content {
    max-width: 800px;
    padding: 2rem;
  }
  
  .hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .hero p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
  
  .cta-button {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .cta-button:hover {
    background-color: #2980b9;
  }
  
  /* 特色旅游推荐样式 */
  .featured-tours {
    padding: 4rem 2rem;
    background-color: #f9f9f9;
  }
  
  .featured-tours h2 {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .tour-cards {
    display: flex;
    justify-content: center;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .tour-card {
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: transform 0.3s;
  }
  
  .tour-card:hover {
    transform: translateY(-5px);
  }
  
  .tour-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .tour-card h3 {
    padding: 1rem;
    margin: 0;
  }
  
  .tour-card p {
    padding: 0 1rem;
    color: #666;
  }
  
  .price {
    display: block;
    padding: 1rem;
    color: #e74c3c;
    font-weight: bold;
  }
  
  /* 热门目的地样式 */
  .popular-destinations {
    padding: 4rem 2rem;
  }
  
  .popular-destinations h2 {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .destination-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .destination-item {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .destination-item img {
    width: 100%;
    height: 300px;
    object-fit: cover;
  }
  
  .destination-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    color: white;
  }
  
  /* 用户评价样式 */
  .testimonials {
    padding: 4rem 2rem;
    background-color: #f9f9f9;
  }
  
  .testimonials h2 {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .testimonial-cards {
    display: flex;
    justify-content: center;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .testimonial-card {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .user-info {
    display: flex;
    align-items: center;
    margin-top: 1rem;
  }
  
  .user-info img {
    border-radius: 50%;
    margin-right: 1rem;
  }
  
  /* 页脚样式 */
  .footer {
    background-color: #2c3e50;
    color: white;
    padding: 4rem 2rem 2rem;
  }
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }
  
  .footer-section {
    margin-bottom: 1rem;
    padding: 15px;
    border-radius: 8px;
    background-color: rgba(255,255,255,0.05);
  }
  
  .footer-section h3 {
    margin-bottom: 1rem;
  }
  
  .social-links a {
    color: white;
    margin-right: 1rem;
    text-decoration: none;
  }
  
  .footer-bottom {
    text-align: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  
  @media (max-width: 768px) {
    .nav-links {
      display: none;
    }
    
    .hero h1 {
      font-size: 2rem;
    }
    
    .tour-cards {
      flex-direction: column;
    }
    
    .testimonial-cards {
      flex-direction: column;
    }
  }
  </style>    