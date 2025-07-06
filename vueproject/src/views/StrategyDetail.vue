<template>
  <div class="strategy-detail">
    <div class="strategy-header">
      <h1>{{ strategy.title || '未命名攻略' }}</h1>
      <div class="strategy-meta">
        <span class="author"><el-icon><User /></el-icon> {{ strategy.username || '未知用户' }}</span>
        <span class="date"><el-icon><Calendar /></el-icon> {{ formatDate(strategy.time) }}</span>
      </div>
    </div>

    <div class="strategy-content">
      <!-- 视频部分 -->
      <div class="video-section">
        <div v-if="strategy.video" class="video-container">
          <video 
            :src="`/img/${strategy.video}`" 
            controls
            preload="auto"
            @error="handleVideoError"
            @loadeddata="handleVideoLoaded"
            @loadstart="handleVideoLoadStart"
            crossorigin="anonymous"
          >
            <source :src="`/img/${strategy.video}`" type="video/mp4">
            您的浏览器不支持视频播放
          </video>
          <div v-if="videoError" class="video-error">
            {{ videoError }}
          </div>
        </div>
        <div v-else class="upload-video">
          <el-button type="primary" :icon="Plus" @click="showUploadDialog">添加宣传视频</el-button>
        </div>
      </div>

      <!-- 图片部分 -->
      <div class="image-section" v-if="strategy.img">
        <img :src="`/img/${strategy.img}`" :alt="strategy.title || '攻略图片'">
      </div>

      <!-- 内容部分 -->
      <div class="content-section">
        <p>{{ strategy.glnr || '暂无内容' }}</p>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <span><el-icon><View /></el-icon> {{ strategy.seenum || 0 }}</span>
        <span class="collect-btn" @click="handleCollect" v-if="route.query.userid">
          <el-icon :class="{ 'is-collected': isCollected }"><Star /></el-icon> 
          {{ strategy.scnum || 0 }}
        </span>
        <span v-else class="collect-btn disabled">
          <el-icon><Star /></el-icon> 
          {{ strategy.scnum || 0 }}
        </span>
        <span class="comment-btn" @click="showComments">
          <el-icon><Comment /></el-icon> {{ strategy.saynum || 0 }}
        </span>
      </div>
    </div>

    <!-- 添加视频上传弹窗 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传宣传视频"
      width="500px"
      :close-on-click-modal="false"
    >
      <Videoupload
        :strategy-id="strategy.id"
        @upload-success="handleUploadSuccess"
        @upload-cancel="uploadDialogVisible = false"
      />
    </el-dialog>

    <!-- 评论弹窗 -->
    <el-dialog
      v-model="commentDialogVisible"
      title="评论列表"
      width="500px"
      :close-on-click-modal="false"
    >
      <!-- 评论输入框 -->
      <div class="comment-input">
        <el-input
          v-model="newComment"
          type="textarea"
          :rows="3"
          placeholder="请输入您的评论..."
          maxlength="200"
          show-word-limit
        />
        <div class="comment-actions">
          <el-button type="primary" @click="submitComment" :loading="submitting">
            发表评论
          </el-button>
        </div>
      </div>

      <el-divider />

      <div class="comments-list">
        <div v-if="loading" class="text-center py-4">
          <el-loading text="加载中..."></el-loading>
        </div>
        <div v-else-if="comments.length === 0" class="text-center py-4 text-gray-500">
          暂无评论
        </div>
        <div v-else class="comment-items">
          <div v-for="comment in comments" :key="comment[0]" class="comment-item">
            <div class="comment-header">
              <span class="comment-user">{{ comment[1] }}</span>
              <span class="comment-date">{{ formatDate(comment[2]) }}</span>
            </div>
            <div class="comment-content">{{ comment[3] }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Calendar, View, Star, Comment, Plus } from '@element-plus/icons-vue';
import axios from 'axios';
import Videoupload from './Videoupload.vue';

const route = useRoute();
const router = useRouter();
const strategy = ref({});
const uploadDialogVisible = ref(false);
const videoError = ref('');
const videoDebug = ref(true);
const videoLoadStatus = ref('');
const commentDialogVisible = ref(false);
const comments = ref([]);
const loading = ref(false);
const newComment = ref('');
const submitting = ref(false);
const isCollected = ref(false);

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    if (dateStr.includes('-')) {
      return dateStr.replace(/-/g, '/');
    }
    return new Date(dateStr).toLocaleDateString('zh-CN');
  } catch (error) {
    console.warn('日期格式化失败:', dateStr);
    return dateStr;
  }
};

// 显示上传弹窗
const showUploadDialog = () => {
  uploadDialogVisible.value = true;
};

// 处理上传成功
const handleUploadSuccess = (videoName) => {
  strategy.value.video = videoName;
  uploadDialogVisible.value = false;
  ElMessage.success('视频上传成功！');
};

const handleVideoError = (e) => {
  console.error('视频加载错误:', e);
  videoError.value = `视频加载失败: ${e.target.error?.message || '未知错误'}`;
  videoLoadStatus.value = '加载失败';
};

const handleVideoLoaded = (e) => {
  console.log('视频加载成功:', e);
  videoLoadStatus.value = '加载成功';
};

const handleVideoLoadStart = (e) => {
  console.log('开始加载视频:', e);
  videoLoadStatus.value = '加载中...';
};

// 显示评论
const showComments = async () => {
  commentDialogVisible.value = true;
  loading.value = true;
  try {
    const params = new URLSearchParams();
    params.append('glid', route.params.id);
    
    const response = await axios.post(`http://localhost:8080/a1/UserController/selectallsay?${params.toString()}`);
    comments.value = response.data;
  } catch (error) {
    console.error('获取评论失败:', error);
    ElMessage.error('获取评论失败');
  } finally {
    loading.value = false;
  }
};

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容');
    return;
  }

  submitting.value = true;
  try {
    const params = new URLSearchParams();
    params.append('time', new Date().toLocaleDateString('zh-CN').replace(/-/g, '/'));
    params.append('aa', newComment.value.trim());
    params.append('glid', route.params.id);
    params.append('userid', route.query.userid);

    await axios.post(`http://localhost:8080/a1/UserController/addsay?${params.toString()}`);
    
    // 评论成功后，调用see_sc_say API更新评论数
    const updateParams = new URLSearchParams();
    updateParams.append('id', route.params.id);
    updateParams.append('wt', 'saynum');
    updateParams.append('yn', '1');
    
    await axios.post(`http://localhost:8080/a1/RouteController/see_sc_say?${updateParams.toString()}`);
    
    // 更新本地评论数
    strategy.value.saynum = (parseInt(strategy.value.saynum) || 0) + 1;
    
    ElMessage.success('评论发表成功');
    newComment.value = ''; // 清空输入框
    
    // 重新加载评论列表
    await showComments();
  } catch (error) {
    console.error('发表评论失败:', error);
    ElMessage.error('发表评论失败');
  } finally {
    submitting.value = false;
  }
};

// 处理收藏
const handleCollect = async () => {
  try {
    const params = new URLSearchParams();
    params.append('id', route.params.id);
    params.append('wt', 'scnum');
    params.append('yn', isCollected.value ? '0' : '1');
    
    await axios.post(`http://localhost:8080/a1/RouteController/see_sc_say?${params.toString()}`);
    
    if (isCollected.value) {
      // 取消收藏时调用delsc API
      const delscParams = new URLSearchParams();
      delscParams.append('glid', route.params.id);
      delscParams.append('userid', route.query.userid);
      await axios.post(`http://localhost:8080/a1/RouteController/delsc?${delscParams.toString()}`);
    } else {
      // 添加收藏时调用sscc API
      const ssccParams = new URLSearchParams();
      ssccParams.append('glid', route.params.id);
      ssccParams.append('userid', route.query.userid);
      await axios.post(`http://localhost:8080/a1/RouteController/sscc?${ssccParams.toString()}`);
    }
    
    // 更新收藏状态和数量
    isCollected.value = !isCollected.value;
    strategy.value.scnum = (parseInt(strategy.value.scnum) || 0) + (isCollected.value ? 1 : -1);
    
    ElMessage.success(isCollected.value ? '收藏成功' : '取消收藏');
  } catch (error) {
    console.error('收藏操作失败:', error);
    ElMessage.error('收藏操作失败');
  }
};

onMounted(async () => {
  // 从路由query中获取传递的数据
  const query = route.query;
  if (query && query.title) {
    try {
      // 获取最新的攻略数据
      const response = await axios.post('http://localhost:8080/a1/RouteController/selectgl');
      const allStrategies = Array.isArray(response.data) ? response.data : [response.data];
      const currentStrategy = allStrategies.find(item => String(item.id) === String(route.params.id));
      
      if (currentStrategy) {
        strategy.value = {
          id: currentStrategy.id,
          title: currentStrategy.title,
          username: currentStrategy.username,
          time: currentStrategy.time,
          img: currentStrategy.img,
          video: currentStrategy.video || '',
          glnr: currentStrategy.glnr,
          seenum: parseInt(currentStrategy.seenum) || 0,
          scnum: parseInt(currentStrategy.scnum) || 0,
          saynum: parseInt(currentStrategy.saynum) || 0
        };
      } else {
        // 如果找不到最新数据，使用路由传递的数据
        strategy.value = {
          id: route.params.id,
          title: query.title,
          username: query.username,
          time: query.time,
          img: query.img,
          video: query.video || '',
          glnr: query.glnr,
          seenum: parseInt(query.seenum) || 0,
          scnum: parseInt(query.scnum) || 0,
          saynum: parseInt(query.saynum) || 0
        };
      }
      
      // 获取收藏状态
      if (query.userid) {
        try {
          const selscn = new URLSearchParams();
          selscn.append('userid', query.userid);
          const selsc = await axios.post(`http://localhost:8080/a1/RouteController/selsc?${selscn.toString()}`);
          console.log('详情页获取到的收藏数据:', selsc.data);
          
          // 确保收藏列表中的ID都是字符串类型
          const collectedIds = Array.isArray(selsc.data) 
            ? selsc.data.map(id => String(id))
            : [String(selsc.data)];
          
          // 确保当前攻略ID也是字符串类型
          const currentId = String(route.params.id);
          isCollected.value = collectedIds.includes(currentId);
          console.log(`详情页攻略ID: ${currentId}, 是否已收藏: ${isCollected.value}`);
        } catch (error) {
          console.error('获取收藏状态失败:', error);
        }
      }
      
      // 只有当视频存在时才进行测试
      if (strategy.value.video) {
        console.log('视频文件名:', strategy.value.video);
        console.log('完整视频路径:', `/img/${strategy.value.video}`);
        
        // 测试视频文件是否存在
        fetch(`/img/${strategy.value.video}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log('视频文件可以访问');
          })
          .catch(error => {
            console.error('视频文件访问失败:', error);
            videoError.value = '视频文件无法访问';
          });
      }
    } catch (error) {
      console.error('获取攻略数据失败:', error);
      ElMessage.error('获取攻略数据失败');
      router.push('/guidelines');
    }
  } else {
    ElMessage.error('未找到攻略数据');
    router.push('/guidelines');
  }
});
</script>

<style scoped>
.strategy-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.strategy-header {
  text-align: center;
  margin-bottom: 2rem;
}

.strategy-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.strategy-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  color: #7f8c8d;
}

.strategy-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.strategy-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.video-section {
  margin-bottom: 2rem;
}

.video-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.video-container video {
  width: 100%;
  border-radius: 8px;
  background-color: #000;
  min-height: 300px;
}

.video-error {
  color: red;
  margin-top: 10px;
  text-align: center;
}

.video-debug {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
}

.video-debug p {
  margin: 5px 0;
}

.upload-video {
  text-align: center;
  padding: 2rem;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
}

.image-section {
  margin-bottom: 2rem;
}

.image-section img {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  border-radius: 8px;
}

.content-section {
  margin-bottom: 2rem;
  line-height: 1.8;
  color: #2c3e50;
}

.stats-section {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
  color: #7f8c8d;
}

.stats-section span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.collect-btn {
  cursor: pointer;
  transition: color 0.3s;
}

.collect-btn:hover {
  color: #f0c14b;
}

.collect-btn.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.collect-btn.disabled:hover {
  color: inherit;
}

.is-collected {
  color: #f0c14b;
}

.comment-btn {
  cursor: pointer;
  transition: color 0.3s;
}

.comment-btn:hover {
  color: #409EFF;
}

.comments-list {
  max-height: 400px;
  overflow-y: auto;
}

.comment-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.comment-user {
  font-weight: 500;
  color: #2c3e50;
}

.comment-date {
  color: #6c757d;
}

.comment-content {
  color: #495057;
  line-height: 1.5;
}

.comment-input {
  margin-bottom: 1rem;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.el-divider {
  margin: 1rem 0;
}
</style> 