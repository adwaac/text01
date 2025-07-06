<template>
    <div class="tourgroup-container">
      <div class="header">
        <h2>旅游团信息</h2>
      </div>
  
      <!-- 搜索栏 -->
      <div class="search-container">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索旅游团名称或目的地"
          class="search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="selectedDestination" placeholder="旅游目的地" clearable>
          <el-option v-for="item in destinations" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="selectedPriceRange" placeholder="价格区间" clearable>
          <el-option v-for="item in priceRanges" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
  
      <!-- 旅游团列表 -->
      <div class="tourgroup-list">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" v-for="group in filteredTourGroups" :key="group.id">
            <el-card shadow="hover" class="tourgroup-card">
              <div class="tourgroup-header">
                <img :src="`/img/${group.img}`" alt="旅游团封面" class="tourgroup-image" />
                <el-tag :type="group.statusType">{{ group.status }}</el-tag>
              </div>
              <div class="tourgroup-info">
                <h3>{{ group.name }}</h3>
                <h3>{{ group.id }}</h3>
                <div class="info-item">
                  <el-icon><Location /></el-icon>
                  <span>目的地: {{ group.mdd }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Phone /></el-icon>
                  <span>联系电话: {{ group.phone }}</span>
                </div>
                <div class="info-item">
                  <el-icon><OfficeBuilding /></el-icon>
                  <span>地址: {{ group.address }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Timer /></el-icon>
                  <span>出发日期: {{ group.time }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Calendar /></el-icon>
                  <span>行程天数: {{ group.days }}天</span>
                </div>
                <div class="info-item">
                  <el-icon><User /></el-icon>
                  <span>已报名人数: {{ group.bmnum }}/{{ group.num }}</span>
                </div>
                <div class="price-bar">
                  <span class="price">¥{{ group.price }}</span>
                  <span class="price-unit">/人</span>
                </div>
                <div class="action-buttons">
                  <el-button type="primary" @click="showDetails(group)">查看详情</el-button>
                  <el-button type="success" @click="handleSignup(group)" :disabled="!isLoggedIn || group.isFull">
                    {{ group.isFull ? '已满员' : '立即报名' }}
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
  
      <!-- 无结果提示 -->
      <el-empty v-if="filteredTourGroups.length === 0" description="未找到匹配的旅游团" />
  
      <!-- 分页 -->
      <div class="pagination" v-if="totalGroups > pageSize">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[6, 12, 18, 24]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalGroups"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
  
      <!-- 旅游团详情对话框 -->
      <el-dialog
        v-model="detailsDialogVisible"
        title="旅游团详情"
        width="70%"
      >
        <div v-if="selectedGroup" class="group-details">
          <h3>{{ selectedGroup.name }}</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="旅游团名称">{{ selectedGroup.name }}</el-descriptions-item>
            <el-descriptions-item label="目的地">{{ selectedGroup.mdd }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ selectedGroup.phone }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ selectedGroup.address }}</el-descriptions-item>
            <el-descriptions-item label="出发日期">{{ selectedGroup.time }}</el-descriptions-item>
            <el-descriptions-item label="行程天数">{{ selectedGroup.days }}天</el-descriptions-item>
            <el-descriptions-item label="价格">¥{{ selectedGroup.price }}/人</el-descriptions-item>
            <el-descriptions-item label="剩余名额">{{ parseInt(selectedGroup.num) - parseInt(selectedGroup.bmnum) }}人</el-descriptions-item>
          </el-descriptions>
  
          <h4>行程安排</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in selectedGroup.routesteps"
              :key="index"
              :type="activity[3]"
              :color="activity[3]"
              :timestamp="'第' + (index + 1) + '天'"
            >
              <h5>{{ activity[1] }}</h5>
              <p>{{ activity[2] }}</p>
            </el-timeline-item>
          </el-timeline>
  
          <div class="dialog-footer">
            <el-button @click="detailsDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleSignup(selectedGroup)" :disabled="!isLoggedIn || selectedGroup.isFull">
              {{ selectedGroup.isFull ? '已满员' : '立即报名' }}
            </el-button>
          </div>
        </div>
      </el-dialog>
  
      <!-- 报名表单对话框 -->
      <el-dialog
        v-model="signupDialogVisible"
        title="旅游团报名"
        width="50%"
      >
        <el-form :model="signupForm" label-width="100px" :rules="rules" ref="signupFormRef">
          <el-form-item label="出行人数" prop="people">
            <el-input-number v-model="signupForm.people" :min="1" :max="maxPersonCount"></el-input-number>
          </el-form-item>
          <el-form-item label="出行时间" prop="gotime">
            <el-date-picker
              v-model="signupForm.gotime"
              type="date"
              placeholder="选择出行时间"
              value-format="YYYY/MM/DD"
              :disabled-date="disabledDate"
            />
          </el-form-item>
          <el-form-item label="用户ID">
            <el-input v-model="userid" disabled />
          </el-form-item>
          <el-form-item>
            <div class="order-total">
              <span>订单总额：</span>
              <span class="price">¥{{ orderTotal }}</span>
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="signupDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitSignup">确认报名</el-button>
          </span>
        </template>
      </el-dialog> <!-- 补充结束标签 -->
  
      <!-- 未登录提示 -->
      <el-dialog
        v-model="loginPromptVisible"
        title="提示"
        width="30%"
      >
        <span>请先登录后再进行报名操作</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="loginPromptVisible = false">取消</el-button>
            <el-button type="primary" @click="goToLogin">去登录</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { useRouter, useRoute } from 'vue-router'
  import { Search, Location, Phone, OfficeBuilding, Timer, Calendar, User } from '@element-plus/icons-vue'
  import axios from 'axios'
  
  const router = useRouter()
  const route = useRoute()
  const userid = ref(route.query.userid)
  console.log('响应数据userid:', userid.value)
  // 搜索条件
  const searchKeyword = ref('')
  const selectedDestination = ref('')
  const selectedPriceRange = ref('')
  const isSearching = ref(false)
  
  // 分页
  const currentPage = ref(1)
  const pageSize = ref(6)
  
  // 对话框
  const detailsDialogVisible = ref(false)
  const signupDialogVisible = ref(false)
  const loginPromptVisible = ref(false)
  const selectedGroup = ref(null)
  const signupFormRef = ref(null)
  
  // 报名表单
  const signupForm = reactive({
    people: 1,
    gotime: ''
  })
  
  // 表单验证规则
  const rules = {
    people: [
      { required: true, message: '请选择出行人数', trigger: 'change' }
    ],
    gotime: [
      { required: true, message: '请选择出行时间', trigger: 'change' }
    ]
  }
  
  // 最大报名人数
  const maxPersonCount = computed(() => {
    if (!selectedGroup.value) return 1
    return Math.min(5, parseInt(selectedGroup.value.num) - parseInt(selectedGroup.value.bmnum))
  })
  
  // 订单总额
  const orderTotal = computed(() => {
    if (!selectedGroup.value) return 0
    return parseInt(selectedGroup.value.price) * signupForm.people
  })
  
  // 用户是否已登录 - 实际项目中应该从状态管理获取
  const isLoggedIn = ref(true)
  
  // 目的地选项
  const destinations = [
    { value: '北京', label: '北京' },
    { value: '上海', label: '上海' },
    { value: '杭州', label: '杭州' },
    { value: '西安', label: '西安' },
    { value: '成都', label: '成都' },
    { value: '三亚', label: '三亚' }
  ]
  
  // 价格区间选项
  const priceRanges = [
    { value: '0-1000', label: '1000元以下' },
    { value: '1000-3000', label: '1000-3000元' },
    { value: '3000-5000', label: '3000-5000元' },
    { value: '5000-10000', label: '5000-10000元' },
    { value: '10000-', label: '10000元以上' }
  ]
  
  // 旅游团数据
  const tourGroups = ref([])
  console.log('tourGroups:', tourGroups.value)
  // 计算属性：过滤后的旅游团列表
  const filteredTourGroups = computed(() => {
    let result = tourGroups.value
  
    if (searchKeyword.value) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        item.mdd.toLowerCase().includes(searchKeyword.value.toLowerCase())
      )
    }
  
    if (selectedDestination.value) {
      result = result.filter(item => item.mdd === selectedDestination.value)
    }
  
    if (selectedPriceRange.value) {
      const [min, max] = selectedPriceRange.value.split('-').map(Number)
      result = result.filter(item => {
        if (!max) return parseInt(item.price) >= min
        return parseInt(item.price) >= min && parseInt(item.price) <= max
      })
    }
  
    return result.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
  })
  console.log('img:', filteredTourGroups)
  
  // 计算属性：总数
  const totalGroups = computed(() => {
    let result = tourGroups.value
  
    if (searchKeyword.value) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        item.mdd.toLowerCase().includes(searchKeyword.value.toLowerCase())
      )
    }
  
    if (selectedDestination.value) {
      result = result.filter(item => item.mdd === selectedDestination.value)
    }
  
    if (selectedPriceRange.value) {
      const [min, max] = selectedPriceRange.value.split('-').map(Number)
      result = result.filter(item => {
        if (!max) return parseInt(item.price) >= min
        return parseInt(item.price) >= min && parseInt(item.price) <= max
      })
    }
  
    return result.length
  })
  
  // 方法：搜索
  const handleSearch = () => {
    isSearching.value = true
    currentPage.value = 1
  }
  
  // 方法：重置搜索
  const resetSearch = () => {
    searchKeyword.value = ''
    selectedDestination.value = ''
    selectedPriceRange.value = ''
    isSearching.value = false
    currentPage.value = 1
  }
  
  // 方法：查看详情
  const showDetails = (group) => {
    selectedGroup.value = group
    detailsDialogVisible.value = true
  }
  
  // 方法：处理报名
  const handleSignup = (group) => {
    if (!isLoggedIn.value) {
        loginPromptVisible.value = true;
        return;
    }

    if (group.isFull) {
        ElMessage.warning('该旅游团已满员');
        return;
    }

    selectedGroup.value = group;
    signupDialogVisible.value = true;
    signupForm.people = 1;
    signupForm.gotime = '';
  };
  
  // 禁用日期选择，确保 gotime 大于 ddtime
  const disabledDate = (time) => {
    const ddtime = new Date()
    return time.getTime() < ddtime.getTime()
  }
  
  // 方法：提交报名
  const submitSignup = async () => {
    try {
        await signupFormRef.value.validate();

        const ddtime = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
        const gotime = signupForm.gotime;
        const people = signupForm.people;
        const zt = 0;

        // 检查 selectedGroup.value 是否存在
        if (!selectedGroup.value) {
            ElMessage.error('未找到有效的旅游团信息，请稍后重试');
            return;
        }

        const lytiId = selectedGroup.value.id;
        const apiUrl = `http://localhost:8080/a1/DingdController/adddingd?userid=${userid.value}&gotime=${gotime}&lytid=${lytiId}&zt=0&people=${people}&ddtime=${ddtime}`;

        // 发送请求到后端
        await axios.post(apiUrl);

        // 多次调用 http://localhost:8080/a1/RouteController/down?id=lytiId
        for (let i = 0; i < people; i++) {
            await axios.post(`http://localhost:8080/a1/RouteController/down?id=${lytiId}`);
        }

        // 更新本地数据，实际项目应该通过API获取最新数据
        const groupIndex = tourGroups.value.findIndex(g => g.id === selectedGroup.value.id);
        if (groupIndex > -1) {
            tourGroups.value[groupIndex].bmnum = parseInt(tourGroups.value[groupIndex].bmnum) + people;
            if (tourGroups.value[groupIndex].bmnum >= parseInt(tourGroups.value[groupIndex].num)) {
                tourGroups.value[groupIndex].isFull = true;
                tourGroups.value[groupIndex].status = '已满员';
                tourGroups.value[groupIndex].statusType = 'info';
            }
        }

        ElMessage.success('报名成功！订单已添加到您的个人中心');
        signupDialogVisible.value = false;

        // 清空表单
        signupForm.people = 1;
        signupForm.gotime = '';

    } catch (error) {
        console.error('报名提交失败', error);
        ElMessage.error('报名失败，请稍后重试');
    }
  };
  
  // 方法：去登录
  const goToLogin = () => {
    loginPromptVisible.value = false
    // 跳转到登录页面
    router.push('/login')
  }
  
  // 方法：分页大小改变
  const handleSizeChange = (size) => {
    pageSize.value = size
    currentPage.value = 1
  }
  
  // 方法：当前页改变
  const handleCurrentChange = (page) => {
    currentPage.value = page
  }
  
  // 初始化
  onMounted(async () => {
    try {
        const response = await axios.post('http://localhost:8080/a1/RouteController/selectlyt');
        
        const RESDATA = response.data
        console.log('响应数据aaa:', RESDATA)
        tourGroups.value = response.data.map(item => ({
            ...item,
            isFull: parseInt(item.bmnum) >= parseInt(item.num),
            status: parseInt(item.bmnum) >= parseInt(item.num)? '已满员' : '招募中',
            statusType: parseInt(item.bmnum) >= parseInt(item.num)? 'info' : 'success'
        }));
        console.log('获取到的旅游团数据:', tourGroups.value); // 打印数据检查结构
    } catch (error) {
        console.error('获取旅游团数据失败:', error);
        ElMessage.error('获取旅游团数据失败');
    }
  });
  
  </script>
  
  <style scoped>
  .tourgroup-container {
    padding: 20px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .search-container {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }
  
  .search-input {
    width: 300px;
  }
  
  .tourgroup-list {
    margin-bottom: 30px;
  }
  
  .tourgroup-card {
    margin-bottom: 20px;
    transition: all 0.3s;
    height: 100%;
  }
  
  .tourgroup-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
  
  .tourgroup-header {
    position: relative;
  }
  
  .tourgroup-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
  
  .tourgroup-header .el-tag {
    position: absolute;
    top: 10px;
    right: 10px;
  }
  
  .tourgroup-info {
    padding: 15px;
  }
  
  .tourgroup-info h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    font-weight: bold;
  }
  
  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    color: #606266;
  }
  
  .info-item .el-icon {
    margin-right: 8px;
    font-size: 16px;
  }
  
  .price-bar {
    margin: 15px 0;
  }
  
  .price {
    font-size: 24px;
    color: #F56C6C;
    font-weight: bold;
  }
  
  .price-unit {
    font-size: 14px;
    color: #909399;
  }
  
  .action-buttons {
    display: flex;
    justify-content: space-between;
  }
  
  .group-details h4 {
    margin: 20px 0 10px;
    font-size: 16px;
    border-left: 3px solid #409EFF;
    padding-left: 10px;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }
  
  .order-total {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-size: 16px;
  }
  
  .order-total .price {
    margin-left: 10px;
    font-size: 24px;
    color: #F56C6C;
    font-weight: bold;
  }
  
  @media (max-width: 768px) {
    .search-container {
      flex-direction: column;
    }
    
    .search-input, .el-select {
      width: 100%;
    }
    
    .action-buttons {
      flex-direction: column;
      gap: 10px;
    }
  }
  </style>    