<template>
    <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div class="strategy-container">
        <div class="strategy-actions">
          <el-button type="primary" size="large" @click="openCreateDialog" class="create-btn">
            <el-icon><Edit /></el-icon>
            创建新攻略
          </el-button>
        </div>
  
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-10">
          <el-loading text="加载中..."></el-loading>
        </div>
  
        <!-- 空状态 -->
        <div v-else-if="strategyList.length === 0" class="text-center py-10">
          <div class="text-gray-500">暂无攻略数据</div>
        </div>
  
        <div v-else class="strategy-list">
          <div v-for="item in strategyList" :key="item.id" class="strategy-card">
            <div class="strategy-image" @click="viewStrategy(item.id)">
              <img 
                :src="`/img/${item.img}`" 
                :alt="item.title"
                @error="handleImgError($event, item)"
              >
              <div class="image-overlay" v-if="item.destination">
                <span class="destination-tag">{{ getDestinationName(item.destination) }}</span>
              </div>
            </div>
            <div class="strategy-content">
              <h3 @click="viewStrategy(item.id)">{{ item.title }}</h3>
              <div class="strategy-info">
                <span class="author"><el-icon><User /></el-icon> {{ item.username }}</span>
                <span class="date"><el-icon><Calendar /></el-icon> {{ formatDate(item.time) }}</span>
              </div>
              <p class="summary" @click="viewStrategy(item.id)">{{ item.glnr }}</p>
              <div class="strategy-stats">
                <span><el-icon><View /></el-icon> {{ item.seenum }}</span>
                <span class="collect-btn" @click.stop="handleCollect(item)">
                  <el-icon :class="{ 'is-collected': item.isCollected }"><Star /></el-icon> 
                  {{ item.scnum }}
                </span>
                <span><el-icon><Comment /></el-icon> {{ item.saynum }}</span>
              </div>
            </div>
          </div>
        </div>
  
        <el-dialog
          title="创建旅游攻略"
          v-model="dialogVisible"
          width="650px"
          :append-to-body="true"
          destroy-on-close
          class="strategy-dialog"
        >
          <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
            <el-form-item label="用户 ID" prop="userid">
              <el-input v-model="form.userid" placeholder="请输入用户 ID" />
            </el-form-item>
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="攻略标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入攻略标题" />
            </el-form-item>
            <el-form-item label="攻略内容" prop="glnr">
              <el-input v-model="form.glnr" type="textarea" rows="6" placeholder="请分享您的旅行体验、景点推荐、美食推荐等" />
            </el-form-item>
            <el-form-item label="封面图片" prop="coverImage">
              <el-upload
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :limit="1"
                @change="handleCoverChange"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm">发布攻略</el-button>
              <el-button @click="dialogVisible = false">取消</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { Edit, View, Star, Comment, Plus, Calendar, User } from '@element-plus/icons-vue';
  import router from '@/router';
  import { ElMessage } from 'element-plus';
  import axios from 'axios';
  import { useRoute } from 'vue-router';
  
  // 状态管理
  const dialogVisible = ref(false);
  const formRef = ref(null);
  const loading = ref(false);
  const errorMessage = ref('');
  const userId = ref('');
  
  // 获取路由参数
  const route = useRoute();
  
  onMounted(() => {
    // 从路由query中获取userid
    if (route.query.userid) {
      userId.value = route.query.userid;
      console.log('Guidelines页面接收到的用户ID:', userId.value);
    } else {
      console.warn('Guidelines页面未接收到用户ID');
    }
  });
  
  // 表单验证
  const rules = {
      userid: [{ required: true, message: '请输入用户 ID', trigger: 'blur' }],
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      title: [{ required: true, message: '请输入攻略标题', trigger: 'blur' }],
      glnr: [{ required: true, message: '请输入攻略内容', trigger: 'blur' }],
  };
  
  // 表单数据
  const form = reactive({
      userid: '',
      username: '',
      title: '',
      glnr: '',
      coverImage: '',
  });
  
  // 目的地列表
  const destinations = [
      { value: 'paris', label: '巴黎' },
      { value: 'tokyo', label: '东京' },
      { value: 'bali', label: '巴厘岛' },
      { value: 'newyork', label: '纽约' },
      { value: 'sydney', label: '悉尼' },
  ];
  
  const selectedFile = ref(null);
  
  // 处理封面图片上传
  const handleCoverChange = (file) => {
      if (file.raw) {
          selectedFile.value = file.raw;
          // 可以在这里添加文件类型和大小的验证
          const isImage = file.raw.type.startsWith('image/');
          const isLt2M = file.raw.size / 1024 / 1024 < 2;

          if (!isImage) {
              ElMessage.error('只能上传图片文件!');
              return false;
          }
          if (!isLt2M) {
              ElMessage.error('图片大小不能超过 2MB!');
              return false;
          }
      }
  };
  
  // 打开对话框
  const openCreateDialog = () => {
      dialogVisible.value = true;
  };
  
  // 获取最大ID
  const getMaxId = () => {
      if (strategyList.value.length === 0) return 0;
      return Math.max(...strategyList.value.map(item => parseInt(item.id) || 0));
  };
  
  // 提交表单
  const submitForm = () => {
      formRef.value?.validate(async (valid) => {
          if (valid) {
              try {
                  // 1. 先上传图片
                  if (selectedFile.value) {
                      const formData = new FormData();
                      formData.append('file', selectedFile.value);
                      
                      const uploadResponse = await axios.post('http://localhost:8080/a1/UploadController/Photoupload', formData, {
                          headers: {
                              'Content-Type': 'multipart/form-data'
                          }
                      });
                      
                      console.log('图片上传响应:', uploadResponse.data);
                      
                      if (uploadResponse.data && uploadResponse.data.saveName) {
                          form.coverImage = uploadResponse.data.saveName;
                      } else {
                          throw new Error('图片上传失败：未获取到图片名称');
                      }
                  }

                  // 2. 创建攻略
                  const time = new Date().toISOString().split('T')[0].replace(/-/g, '/');
                  const newId = (getMaxId() + 1).toString();
                  const newStrategy = {
                      id: newId,
                      userid: form.userid,
                      username: form.username,
                      title: form.title,
                      time,
                      img: form.coverImage || 'default.jpg',
                      seenum: 0,
                      scnum: 0,
                      saynum: 0,
                      glnr: form.glnr,
                  };

                  // 3. 构建URL编码的查询参数
                  const params = new URLSearchParams();
                  Object.entries(newStrategy).forEach(([key, value]) => {
                      params.append(key, value);
                  });

                  const apiUrl = `http://localhost:8080/a1/RouteController/addgl?${params.toString()}`;
                  await axios.post(apiUrl);

                  // 4. 更新列表（添加到顶部）
                  strategyList.value.unshift(newStrategy);
                  ElMessage.success('攻略发布成功！');
                  dialogVisible.value = false;
                  
                  // 5. 重置表单
                  Object.keys(form).forEach(key => {
                      form[key] = '';
                  });
                  selectedFile.value = null;
              } catch (error) {
                  console.error('发布攻略失败:', error);
                  ElMessage.error('发布攻略失败: ' + error.message);
              }
          } else {
              ElMessage.error('请填写必填项');
          }
      });
  };
  
  // 攻略列表数据
  const strategyList = ref([]);
  
  // 导航到详情页
  const viewStrategy = async (id) => {
      const item = strategyList.value.find(item => item.id === id);
      if (item) {
          try {
              // 调用see_sc_say API，使用URL参数
              const params = new URLSearchParams();
              params.append('id', id);
              params.append('wt', 'seenum');
              params.append('yn', '1');
              
              await axios.post(`http://localhost:8080/a1/RouteController/see_sc_say?${params.toString()}`);
              
              // 更新浏览量
              item.seenum = (parseInt(item.seenum) || 0) + 1;
              
              // 获取收藏数据
              const selscn = new URLSearchParams();
              selscn.append('userid', userId.value);
              const selsc = await axios.post(`http://localhost:8080/a1/RouteController/selsc?${selscn.toString()}`);
              console.log('当前攻略ID:', id);
              console.log('用户收藏的攻略列表:', selsc.data);
              
              router.push({
                  name: 'strategy-detail',
                  params: { id: id },
                  query: {
                      title: item.title,
                      username: item.username,
                      time: item.time,
                      img: item.img,
                      video: item.video || '',
                      glnr: item.glnr,
                      seenum: item.seenum,
                      scnum: item.scnum,
                      saynum: item.saynum,
                      userid: userId.value
                  }
              });
          } catch (error) {
              console.error('更新浏览量失败:', error);
              ElMessage.error('更新浏览量失败');
          }
      }
  };
  
  // 获取目的地名称
  const getDestinationName = (value) => {
      if (!value) return '';
      const destination = destinations.find((d) => d.value === value);
      return destination ? destination.label : '';
  };
  
  // 格式化日期
  const formatDate = (dateStr) => {
      if (!dateStr) return '';
      
      try {
          // 处理可能的日期格式
          if (dateStr.includes('-')) {
              return dateStr.replace(/-/g, '/');
          }
          return new Date(dateStr).toLocaleDateString('zh-CN');
      } catch (error) {
          console.warn('日期格式化失败:', dateStr);
          return dateStr;
      }
  };
  
  // 处理图片加载错误
  const handleImgError = (event, item) => {
      console.error('图片加载失败:', item.img);
      event.target.src = require('@/assets/default.jpg');
  };
  
  // 处理收藏
  const handleCollect = async (item) => {
    try {
      const params = new URLSearchParams();
      params.append('id', item.id);
      params.append('wt', 'scnum');
      params.append('yn', item.isCollected ? '0' : '1');
      
      await axios.post(`http://localhost:8080/a1/RouteController/see_sc_say?${params.toString()}`);
      
      if (item.isCollected) {
        // 取消收藏时调用delsc API
        const delscParams = new URLSearchParams();
        delscParams.append('glid', item.id);
        delscParams.append('userid', userId.value);
        await axios.post(`http://localhost:8080/a1/RouteController/delsc?${delscParams.toString()}`);
      } else {
        // 添加收藏时调用sscc API
        const ssccParams = new URLSearchParams();
        ssccParams.append('glid', item.id);
        ssccParams.append('userid', userId.value);
        await axios.post(`http://localhost:8080/a1/RouteController/sscc?${ssccParams.toString()}`);
      }
      
      // 更新收藏状态和数量
      item.isCollected = !item.isCollected;
      item.scnum = (parseInt(item.scnum) || 0) + (item.isCollected ? 1 : -1);
      
      ElMessage.success(item.isCollected ? '收藏成功' : '取消收藏');
    } catch (error) {
      console.error('收藏操作失败:', error);
      ElMessage.error('收藏操作失败');
    }
  };
  
  // 生命周期钩子
  onMounted(async () => {
      loading.value = true;
      errorMessage.value = '';
      
      try {
          const response = await axios.post('http://localhost:8080/a1/RouteController/selectgl');
          console.log('后端返回的原始数据:', response.data);

          // 获取收藏数据
          const selscn = new URLSearchParams();
          selscn.append('userid', userId.value);
          const selsc = await axios.post(`http://localhost:8080/a1/RouteController/selsc?${selscn.toString()}`);
          console.log('搜索到收藏的:', selsc.data);

          if (!response.data) {
              throw new Error('获取的数据为空');
          }
          
          const dataArray = Array.isArray(response.data) ? response.data : [response.data];
          // 确保收藏列表中的ID都是字符串类型
          const collectedIds = Array.isArray(selsc.data) 
              ? selsc.data.map(id => String(id))
              : [String(selsc.data)];
          
          strategyList.value = dataArray.map((item) => {
              // 确保比较的ID都是字符串类型
              const itemId = String(item.id);
              const isCollected = collectedIds.includes(itemId);
              console.log(`攻略ID: ${itemId}, 是否已收藏: ${isCollected}`);
              return {
                  id: itemId,
                  userid: item.userid || '',
                  username: item.username || '未知用户',
                  img: item.img || 'default.jpg',
                  video: item.video || '',
                  title: item.title || '未命名攻略',
                  time: item.time || new Date().toLocaleDateString(),
                  seenum: parseInt(item.seenum) || 0,
                  scnum: parseInt(item.scnum) || 0,
                  saynum: parseInt(item.saynum) || 0,
                  glnr: item.glnr || '暂无内容',
                  destination: item.destination || '',
                  isCollected: isCollected
              };
          });
          
          console.log('处理后的数据列表:', strategyList.value);
          
          if (strategyList.value.length === 0) {
              ElMessage.info('暂无攻略数据');
          }
      } catch (error) {
          console.error('获取攻略列表失败:', error);
          errorMessage.value = '获取攻略列表失败: ' + error.message;
          ElMessage.error(errorMessage.value);
      } finally {
          loading.value = false;
      }
  });
  </script>
  
  <style scoped>
  .strategy-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background-color: #f9f9f9;
      min-height: 100vh;
  }
  
  .strategy-header {
      text-align: center;
      margin-bottom: 2.5rem;
      position: relative;
  }
  
  h2 {
      font-size: 2.2rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-weight: 600;
  }
  
  .strategy-subtitle {
      color: #7f8c8d;
      font-size: 1.1rem;
      margin-top: 0;
  }
  
  .strategy-actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 2rem;
  }
  
  .create-btn {
      padding: 12px 25px;
      font-weight: 500;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
      transition: all 0.3s;
  }
  
  .create-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
  }
  
  .strategy-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
  }
  
  .strategy-card {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
      background-color: #fff;
      border: 1px solid #f0f0f0;
  }
  
  .strategy-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  .strategy-image {
      position: relative;
      overflow: hidden;
  }
  
  .strategy-image img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      transition: transform 0.5s;
  }
  
  .strategy-card:hover .strategy-image img {
      transform: scale(1.05);
  }
  
  .image-overlay {
      position: absolute;
      top: 1rem;
      right: 1rem;
  }
  
  .destination-tag {
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 4px 10px;
      border-radius: 15px;
      font-size: 0.75rem;
      font-weight: 500;
  }
  
  .strategy-content {
      padding: 1.5rem;
  }
  
  .strategy-content h3 {
      margin: 0 0 0.75rem;
      font-size: 1.4rem;
      color: #2c3e50;
      font-weight: 600;
      line-height: 1.3;
  }
  
  .strategy-info {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 0.75rem;
      color: #7f8c8d;
      font-size: 0.9rem;
  }
  
  .strategy-info span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
  }
  
  .summary {
      margin: 0.75rem 0;
      font-size: 1rem;
      color: #34495e;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.5;
  }
  
  .strategy-stats {
      display: flex;
      gap: 1.5rem;
      margin-top: 1rem;
      color: #7f8c8d;
      font-size: 0.9rem;
      border-top: 1px solid #eaeaea;
      padding-top: 1rem;
  }
  
  .strategy-stats span {
      display: flex;
      align-items: center;
      gap: 0.4rem;
  }
  
  /* Form styling */
  .strategy-dialog :deep(.el-dialog__header) {
      padding: 20px 24px;
      background-color: #f0f7ff;
      margin-right: 0;
      border-bottom: 1px solid #e0e7ff;
  }
  
  .strategy-dialog :deep(.el-dialog__title) {
      color: #3b82f6;
      font-weight: 600;
  }
  
  .strategy-dialog :deep(.el-dialog__body) {
      padding: 24px;
  }
  
  .strategy-dialog :deep(.el-form-item__label) {
      font-weight: 500;
      color: #333;
  }
  
  .strategy-dialog :deep(.el-textarea__inner) {
      font-family: inherit;
      border-radius: 8px;
  }
  
  .strategy-dialog :deep(.el-input__inner) {
      border-radius: 8px;
  }
  
  .text-center {
      text-align: center;
      line-height: 32px;
  }
  
  .collect-btn {
    cursor: pointer;
    transition: color 0.3s;
  }
  
  .collect-btn:hover {
    color: #f0c14b;
  }
  
  .is-collected {
    color: #f0c14b;
  }
  </style>    