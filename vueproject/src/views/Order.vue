<template>
    <div class="order-container">
      <div class="header">
        <h2>我的订单</h2>
      </div>
  
      <!-- 搜索栏 -->
      <div class="search-container">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号或旅游团名称"
          class="search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="selectedStatus" placeholder="订单状态" clearable>
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
  
      <!-- 订单列表 -->
      <div class="order-list">
        <el-card v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">订单号: {{ order.id }}</span>
              <span class="order-date">下单时间: {{ order.ddtime }}</span>
            </div>
            <el-tag :type="getStatusType(order.zt)">{{ getStatusText(order.zt) }}</el-tag>
          </div>
  
          <el-divider />
  
          <div class="tour-info">
            <div class="tour-image">
              <img :src="order.lyt[3] ? require('@/assets/' + order.lyt[3]) : require('@/assets/default.jpg')" :alt="getTourName(order.lyt)" />
            </div>
            <div class="tour-details">
              <h3>{{ getTourName(order.lyt) }}</h3>
              <p class="tour-date">
                <el-icon><Calendar /></el-icon>
                出发日期: {{ order.gotime }}
              </p>
              <p class="tour-duration">
                <el-icon><Timer /></el-icon>
                行程天数: {{ order.lyt[2] }}天
              </p>
              <p class="tour-count">
                <el-icon><User /></el-icon>
                出行人数: {{ order.people }}人
              </p>
            </div>
            <div class="order-price">
              <p class="price-label">订单金额</p>
              <p class="price-amount">¥{{ order.lyt[6] * order.people }}</p>
            </div>
          </div>
  
          <el-divider />
  
          <div class="order-footer">
            <el-button size="small" @click="viewOrderDetail(order)">查看详情</el-button>
            <el-button 
              size="small" 
              type="danger" 
              v-if="order.zt === '0'"
              @click="handlePayment(order)"
            >
              立即支付
            </el-button>
            <el-button 
              size="small" 
              v-if="order.zt === '1'"
              @click="handleViewItinerary(order)"
            >
              查看行程
            </el-button>
            <el-button 
              size="small" 
              type="warning" 
              v-if="order.zt === '1'"
              @click="handleCancel(order)"
            >
              申请取消
            </el-button>
            <el-button 
              size="small" 
              v-if="order.zt === '2'"
              @click="handleReview(order)"
            >
              评价
            </el-button>
          </div>
        </el-card>
  
        <!-- 无订单提示 -->
        <el-empty v-if="filteredOrders.length === 0" description="暂无订单数据" />
      </div>
  
      <!-- 分页 -->
      <div class="pagination" v-if="totalOrders > pageSize">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalOrders"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
  
      <!-- 订单详情对话框 -->
      <el-dialog v-model="detailDialogVisible" title="订单详情" width="60%">
        <div v-if="selectedOrder" class="order-detail">
          <el-descriptions title="基本信息" :column="2" border>
            <el-descriptions-item label="订单号">{{ selectedOrder.id }}</el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ selectedOrder.ddtime }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getStatusType(selectedOrder.zt)">{{ getStatusText(selectedOrder.zt) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="旅游团名称">{{ getTourName(selectedOrder.lyt) }}</el-descriptions-item>
            <el-descriptions-item label="出发日期">{{ selectedOrder.gotime }}</el-descriptions-item>
            <el-descriptions-item label="行程天数">{{ selectedOrder.lyt[2] }}天</el-descriptions-item>
            <el-descriptions-item label="出行人数">{{ selectedOrder.people }}人</el-descriptions-item>
          </el-descriptions>
  
          <el-descriptions title="费用信息" :column="1" border class="mt-20">
            <el-descriptions-item label="单价">¥{{ selectedOrder.lyt[5] }}/人</el-descriptions-item>
            <el-descriptions-item label="出行人数">{{ selectedOrder.people }}人</el-descriptions-item>
            <el-descriptions-item label="订单总额">
              <span class="price-amount">¥{{ selectedOrder.lyt[5] * selectedOrder.people }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-dialog>
  
      <!-- 取消订单对话框 -->
      <el-dialog v-model="cancelDialogVisible" title="取消订单" width="40%">
        <el-form :model="cancelForm" label-width="80px">
          <el-form-item label="取消原因">
            <el-select v-model="cancelForm.reason" placeholder="请选择取消原因" style="width: 100%">
              <el-option label="行程有变，无法出行" value="行程有变，无法出行" />
              <el-option label="重复下单" value="重复下单" />
              <el-option label="计划有变，改期出行" value="计划有变，改期出行" />
              <el-option label="其他原因" value="其他原因" />
            </el-select>
          </el-form-item>
          <el-form-item label="详细说明" v-if="cancelForm.reason === '其他原因'">
            <el-input
              v-model="cancelForm.description"
              type="textarea"
              :rows="3"
              placeholder="请详细说明取消原因"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="cancelDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitCancel">确认申请</el-button>
          </span>
        </template>
      </el-dialog>
  
      <!-- 评价对话框 -->
      <el-dialog v-model="reviewDialogVisible" title="评价旅游团" width="50%">
        <el-form :model="reviewForm" label-width="80px">
          <el-form-item label="总体评分">
            <el-rate v-model="reviewForm.rating" :texts="rateTexts" show-text />
          </el-form-item>
          <el-form-item label="评价内容">
            <el-input
              v-model="reviewForm.content"
              type="textarea"
              :rows="4"
              placeholder="请分享您的旅行体验和建议"
            />
          </el-form-item>
          <el-form-item label="上传图片">
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :limit="5"
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="匿名评价">
            <el-switch v-model="reviewForm.anonymous" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="reviewDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitReview">提交评价</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { useRouter, useRoute } from 'vue-router'
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Calendar, Timer, User, Plus } from '@element-plus/icons-vue'
  import axios from 'axios'
  const router = useRouter()
  const route = useRoute()
  // 搜索条件
  const searchKeyword = ref('')
  const selectedStatus = ref('')
  const dateRange = ref([])
  
  // 分页
  const currentPage = ref(1)
  const pageSize = ref(5)
  
  // 对话框
  const detailDialogVisible = ref(false)
  const cancelDialogVisible = ref(false)
  const reviewDialogVisible = ref(false)
  const selectedOrder = ref(null)
  const USERID = ref(route.query.userid)
  console.log('响应数据1:', USERID.value)
    const STATUS = ref(route.query.status)
  console.log('响应数据2:', STATUS.value)
  // 取消表单
  const cancelForm = reactive({
    reason: '',
    description: ''
  })
  
  // 评价表单
  const reviewForm = reactive({
    rating: 5,
    content: '',
    anonymous: false
  })
  
  // 评价文本
  const rateTexts = ['很差', '较差', '一般', '不错', '很棒']
  
  // 订单状态选项
  const statusOptions = [
    { value: '全部', label: '全部' },
    { value: '0', label: '待支付' },
    { value: '1', label: '待出行' },
    { value: '2', label: '已完成' },
    { value: '3', label: '已取消' },
    { value: '4', label: '退款中' },
    { value: '5', label: '已退款' }
  ]
  
  // 订单数据
  const orders = ref([])
  
  // 计算属性：筛选后的订单
  const filteredOrders = computed(() => {
    let result = STATUS.value === 'user' ? orders.value.filter(order => order.userid === USERID.value) : orders.value;
  
    if (searchKeyword.value) {
      result = result.filter(item => 
        item.id.toString().includes(searchKeyword.value) ||
        getTourName(item.lyt).toLowerCase().includes(searchKeyword.value.toLowerCase())
      )
    }
  
    if (selectedStatus.value && selectedStatus.value !== '全部') {
      result = result.filter(item => item.zt === selectedStatus.value)
    }
  
    if (dateRange.value && dateRange.value.length === 2) {
      const startDate = new Date(dateRange.value[0]).getTime()
      const endDate = new Date(dateRange.value[1]).getTime()
      
      result = result.filter(item => {
        const orderDate = new Date(item.ddtime).getTime()
        return orderDate >= startDate && orderDate <= endDate
      })
    }
  
    return result.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
  })
  // 计算属性：总订单数
  const totalOrders = computed(() => {
    let result = STATUS.value === 'user' ? orders.value.filter(order => order.userid === USERID.value) : orders.value;
  
    if (searchKeyword.value) {
      result = result.filter(item => 
        item.id.toString().includes(searchKeyword.value) ||
        getTourName(item.lyt).toLowerCase().includes(searchKeyword.value.toLowerCase())
      )
    }
  
    if (selectedStatus.value && selectedStatus.value !== '全部') {
      result = result.filter(item => item.zt === selectedStatus.value)
    }
  
    if (dateRange.value && dateRange.value.length === 2) {
      const startDate = new Date(dateRange.value[0]).getTime()
      const endDate = new Date(dateRange.value[1]).getTime()
      
      result = result.filter(item => {
        const orderDate = new Date(item.ddtime).getTime()
        return orderDate >= startDate && orderDate <= endDate
      })
    }
  
    return result.length
  })
  
  // 方法：根据状态获取标签类型
  const getStatusType = (status) => {
    switch (status) {
      case '0':
        return 'warning'
      case '1':
        return 'primary'
      case '2':
        return ''
      case '3':
        return 'info'
      case '4':
        return 'warning'
      case '5':
        return 'info'
      default:
        return ''
    }
  }
  
  // 方法：根据状态获取文本
  const getStatusText = (status) => {
    switch (status) {
      case '0':
        return '待支付'
      case '1':
        return '待出行'
      case '2':
        return '已完成'
      case '3':
        return '已取消'
      case '4':
        return '退款中'
      case '5':
        return '已退款'
      default:
        return '未知状态'
    }
  }
  
  // 方法：根据供应商id获取旅游团名称
  const getTourName = (lyt) => {
    return lyt[1]
  }
  
  // 方法：根据供应商id获取旅游团图片
  const getTourImageUrl = (lyroutid) => {
    return `https://via.placeholder.com/150x100?text=旅游团${lyroutid}`
  }
  
  // 方法：搜索
  const handleSearch = () => {
    currentPage.value = 1
  }
  
  // 方法：重置搜索
  const resetSearch = () => {
    searchKeyword.value = ''
    selectedStatus.value = ''
    dateRange.value = []
    currentPage.value = 1
  }
  
  // 方法：查看订单详情
  const viewOrderDetail = (order) => {
    selectedOrder.value = order
    detailDialogVisible.value = true
  }
  
  // 方法：处理支付
  const handlePayment = async (order) => {
    // 实际项目中应跳转到支付页面或弹出支付对话框
    ElMessageBox.confirm(
      `确认支付订单：${order.id}，金额：¥${order.lyt[5] * order.people}？`,
      '支付确认',
      {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(async () => {
        try {
          // 发送支付请求
          await axios.post(`http://localhost:8080/a1/DingdController/update?id=${order.id}`);
          // 更新订单状态
          const index = orders.value.findIndex(item => item.id === order.id)
          if (index !== -1) {
            orders.value[index].zt = '1'
          }
          ElMessage.success('支付成功')
        } catch (error) {
          console.error('支付失败:', error);
          ElMessage.error('支付失败，请稍后重试');
        }
      })
      .catch(() => {
        ElMessage.info('已取消支付')
      })
  }
  
  // 方法：查看行程
  const handleViewItinerary = (order) => {
    // 实际项目中可能会跳转到行程页面或显示行程详情对话框
    ElMessage.info(`查看行程功能正在开发中，订单号：${order.id}`)
  }
  
  // 方法：取消订单
  const handleCancel = (order) => {
    selectedOrder.value = order
    cancelForm.reason = ''
    cancelForm.description = ''
    cancelDialogVisible.value = true
  }
  
  // 方法：提交取消申请
  const submitCancel = async () => {
    if (!cancelForm.reason) {
      ElMessage.warning('请选择取消原因')
      return
    }
  
    if (cancelForm.reason === '其他原因' && !cancelForm.description) {
      ElMessage.warning('请填写详细说明')
      return
    }
  
    try {
      const orderId = selectedOrder.value.id;
      // 发送取消订单请求
      await axios.post(`http://localhost:8080/a1/DingdController/delbyid?id=${orderId}`);
      console.log(selectedOrder.value.lyt[0])
      const lytid = selectedOrder.value.lyt[0]
      // 根据出行人数调用 up 接口
      const peopleCount = parseInt(selectedOrder.value.people);
      for (let i = 0; i < peopleCount; i++) {
        await axios.post(`http://localhost:8080/a1/RouteController/up?id=${lytid}`);
      }
  
      // 更新订单状态
      const index = orders.value.findIndex(item => item.id === selectedOrder.value.id);
      if (index !== -1) {
        orders.value[index].zt = '3';
      }
  
      ElMessage.success('取消申请已提交，将尽快处理');
      cancelDialogVisible.value = false;
    } catch (error) {
      console.error('取消订单失败:', error);
      ElMessage.error('取消订单失败，请稍后重试');
    }
  }
  
  // 方法：评价
  const handleReview = (order) => {
    selectedOrder.value = order
    reviewForm.rating = 5
    reviewForm.content = ''
    reviewForm.anonymous = false
    reviewDialogVisible.value = true
  }
  
  // 方法：提交评价
  const submitReview = () => {
    if (!reviewForm.content) {
      ElMessage.warning('请填写评价内容')
      return
    }
  
    // 实际项目中应该发送请求到后端处理评价
    // 模拟API请求
    setTimeout(() => {
      ElMessage.success('评价提交成功，感谢您的反馈')
      reviewDialogVisible.value = false
    }, 1000)
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
      const response = await axios.post('http://localhost:8080/a1/DingdController/selectall')
      orders.value = response.data
      console.log('lyt', orders.value)
      // 获取当前日期
      const today = new Date().setHours(0, 0, 0, 0);
      // 遍历订单，根据出行日期更新状态
      orders.value.forEach(order => {
        const goTime = new Date(order.gotime).setHours(0, 0, 0, 0);
        if (goTime < today) {
          order.zt = '2';
        }
      });
    } catch (error) {
      console.error('获取订单数据失败:', error)
      ElMessage.error('获取订单数据失败')
    }
  })
  </script>
  
  <style scoped>
  .order-container {
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
  
  .order-list {
    margin-bottom: 30px;
  }
  
  .order-card {
    margin-bottom: 20px;
  }
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .order-info {
    display: flex;
    gap: 20px;
  }
  
  .order-number {
    font-weight: bold;
  }
  
  .order-date {
    color: #909399;
  }
  
  .tour-info {
    display: flex;
    margin: 15px 0;
  }
  
  .tour-image {
    width: 150px;
    height: 100px;
    flex-shrink: 0;
    margin-right: 20px;
  }
  
  .tour-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .tour-details {
    flex: 1;
  }
  
  .tour-details h3 {
    margin: 0 0 10px;
    font-size: 16px;
  }
  
  .tour-date, .tour-duration, .tour-count {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    color: #606266;
    font-size: 14px;
  }
  
  .tour-details .el-icon {
    margin-right: 8px;
  }
  
  .order-price {
    text-align: right;
    min-width: 120px;
  }
  
  .price-label {
    color: #909399;
    font-size: 14px;
    margin-bottom: 5px;
  }
  
  .price-amount {
    color: #F56C6C;
    font-size: 20px;
    font-weight: bold;
  }
  
  .order-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }
  
  .mt-20 {
    margin-top: 20px;
  }
  
  @media (max-width: 768px) {
    .search-container {
      flex-direction: column;
    }
    
    .search-input, .el-select, .el-date-picker {
      width: 100%;
    }
    
    .tour-info {
      flex-direction: column;
    }
    
    .tour-image {
      width: 100%;
      height: auto;
      margin-right: 0;
      margin-bottom: 15px;
    }
    
    .order-price {
      margin-top: 15px;
      text-align: left;
    }
    
    .order-footer {
      flex-wrap: wrap;
    }
  }
  </style>    