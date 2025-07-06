<template>
    <div class="tourproject-container">
        <!-- 添加筛选按钮和发布按钮 -->
        <div class="filter-container">
            <el-button type="primary" @click="showPublishDialog">发布项目</el-button>
            <el-button 
                type="primary" 
                :type="showOnlyMine ? 'success' : 'primary'"
                @click="toggleShowOnlyMine"
            >
                {{ showOnlyMine ? '显示全部' : '只看自己' }}
            </el-button>
        </div>

        <el-table :data="filteredTourList" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="名称" width="180" />
            <el-table-column prop="tepid" label="供应商" width="120" />
            <el-table-column label="封面图片" width="60">
                <template #default="scope">
                    <el-image 
                        :src="'/img/' + scope.row.img" 
                        :preview-src-list="['/img/' + scope.row.img]"
                        fit="cover"
                        style="width: 20px; height: 20px"
                    >
                        <template #error>
                            <div class="image-error">
                                <el-icon><picture-filled /></el-icon>
                            </div>
                        </template>
                    </el-image>
                </template>
            </el-table-column>
            <el-table-column prop="mdd" label="目的地" width="120" />
            <el-table-column prop="phone" label="联系电话" width="150" />
            <el-table-column prop="address" label="地址" width="200" />
            <el-table-column prop="time" label="出发时间" width="180" />
            <el-table-column prop="days" label="天数" width="100" />
            <el-table-column prop="price" label="价格" width="120">
                <template #default="scope">
                    ¥{{ scope.row.price }}
                </template>
            </el-table-column>
            <el-table-column prop="num" label="总名额" width="100" />
            <el-table-column prop="bmnum" label="已报名" width="100" />
            <el-table-column label="操作" fixed="right" width="150">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="viewDetails(scope.row)">查看详情</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 发布项目对话框 -->
        <el-dialog v-model="publishDialogVisible" title="发布旅游项目" width="50%">
            <el-form :model="publishForm" label-width="100px" :rules="rules" ref="publishFormRef">
                <el-form-item label="项目名称" prop="name">
                    <el-input v-model="publishForm.name" />
                </el-form-item>
                <el-form-item label="封面图片" prop="img">
                    <el-upload
                        class="upload-demo"
                        drag
                        :action="'http://localhost:8080/a1/UploadController/Photoupload'"
                        :on-success="handleUploadSuccess"
                        :on-error="handleUploadError"
                        :before-upload="beforeUpload"
                        :auto-upload="false"
                        :http-request="customUpload"
                        :on-change="handleFileChange"
                        name="file"
                        ref="uploadRef"
                    >
                        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                        <div class="el-upload__text">
                            拖拽文件到此处或 <em>点击上传</em>
                        </div>
                        <template #tip>
                            <div class="el-upload__tip">
                                只能上传jpg/png文件
                            </div>
                        </template>
                    </el-upload>
                    <div v-if="selectedFile" class="image-preview">
                        <span>待上传图片：{{ selectedFile.name }}</span>
                    </div>
                </el-form-item>
                <el-form-item label="目的地" prop="mdd">
                    <el-input v-model="publishForm.mdd" />
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="publishForm.phone" />
                </el-form-item>
                <el-form-item label="地址" prop="address">
                    <el-input v-model="publishForm.address" />
                </el-form-item>
                <el-form-item label="行程天数" prop="days">
                    <el-input-number v-model="publishForm.days" :min="1" />
                </el-form-item>
                <el-form-item label="总名额" prop="num">
                    <el-input-number v-model="publishForm.num" :min="1" />
                </el-form-item>
                <el-form-item label="价格" prop="price">
                    <el-input-number v-model="publishForm.price" :min="0" :precision="2" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="publishDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handlePublish">发布</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 详情对话框 -->
        <el-dialog v-model="detailsDialogVisible" title="旅游项目详情" width="70%">
            <div v-if="selectedTour" class="tour-details">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="项目名称">{{ selectedTour.name }}</el-descriptions-item>
                    <el-descriptions-item label="目的地">{{ selectedTour.mdd }}</el-descriptions-item>
                    <el-descriptions-item label="联系电话">{{ selectedTour.phone }}</el-descriptions-item>
                    <el-descriptions-item label="地址">{{ selectedTour.address }}</el-descriptions-item>
                    <el-descriptions-item label="出发日期">{{ selectedTour.time }}</el-descriptions-item>
                    <el-descriptions-item label="行程天数">{{ selectedTour.days }}天</el-descriptions-item>
                    <el-descriptions-item label="价格">¥{{ selectedTour.price }}/人</el-descriptions-item>
                    <el-descriptions-item label="剩余名额">{{ parseInt(selectedTour.num) - parseInt(selectedTour.bmnum) }}人</el-descriptions-item>
                </el-descriptions>

                <h4 class="mt-4">行程安排</h4>
                <el-timeline>
                    <el-timeline-item
                        v-for="(step, index) in selectedTour.routesteps"
                        :key="index"
                        :timestamp="'第' + (index + 1) + '天'"
                    >
                        <h5>{{ step[1] }}</h5>
                        <p>{{ step[2] }}</p>
                    </el-timeline-item>
                </el-timeline>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { UploadFilled, PictureFilled } from '@element-plus/icons-vue'

// 获取路由参数
const route = useRoute()
const userId = ref('')
const showOnlyMine = ref(false)

// 数据列表
const tourList = ref([])
const loading = ref(false)
const detailsDialogVisible = ref(false)
const selectedTour = ref(null)

// 发布相关
const publishDialogVisible = ref(false)
const publishFormRef = ref(null)
const publishForm = ref({
    id: '',
    name: '',
    img: '',
    mdd: '',
    phone: '',
    time: '',
    days: 1,
    num: 1,
    price: 0,
    bmnum: 0,
    tepid: '',
    address: ''
})

const uploadRef = ref(null)
const selectedFile = ref(null)

// 表单验证规则
const rules = {
    name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
    mdd: [{ required: true, message: '请输入目的地', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
    address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
    days: [{ required: true, message: '请输入行程天数', trigger: 'blur' }],
    num: [{ required: true, message: '请输入总名额', trigger: 'blur' }],
    price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

// 计算属性：根据筛选条件过滤数据
const filteredTourList = computed(() => {
    if (!showOnlyMine.value) {
        return tourList.value
    }
    return tourList.value.filter(tour => tour.tepid === 'ly' + userId.value)
})

// 切换显示模式
const toggleShowOnlyMine = () => {
    showOnlyMine.value = !showOnlyMine.value
}

// 获取旅游项目列表
const fetchTourList = async () => {
    loading.value = true
    try {
        const response = await axios.post('http://localhost:8080/a1/RouteController/selectlyt')
        console.log('后端返回的旅游项目数据:', response.data)
        tourList.value = response.data
    } catch (error) {
        console.error('获取旅游项目列表失败:', error)
        ElMessage.error('获取旅游项目列表失败')
    } finally {
        loading.value = false
    }
}

// 查看详情
const viewDetails = (tour) => {
    selectedTour.value = tour
    detailsDialogVisible.value = true
}

// 处理文件选择变化
const handleFileChange = (file) => {
    selectedFile.value = file.raw
}

// 上传前验证
const beforeUpload = (file) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isImage) {
        ElMessage.error('只能上传JPG/PNG格式的图片！')
        return false
    }
    return false // 阻止自动上传
}

// 自定义上传方法
const customUpload = (options) => {
    // 这个方法不会被调用，因为我们设置了auto-upload为false
    return Promise.resolve()
}

// 处理上传成功
const handleUploadSuccess = (response) => {
    console.log('图片上传成功，后端返回值:', response)
    if (response && response.saveName) {
        publishForm.value.img = response.saveName
        ElMessage.success('图片上传成功')
    } else {
        ElMessage.error('图片上传失败：未获取到保存的文件名')
    }
}

// 处理上传失败
const handleUploadError = (error) => {
    console.error('图片上传失败，错误信息:', error)
    ElMessage.error('图片上传失败')
}

// 处理发布
const handlePublish = async () => {
    if (!publishFormRef.value) return
    
    try {
        await publishFormRef.value.validate()
        
        // 先上传图片
        if (selectedFile.value) {
            const formData = new FormData()
            formData.append('file', selectedFile.value)
            
            try {
                const uploadResponse = await axios.post('http://localhost:8080/a1/UploadController/Photoupload', formData)
                console.log('图片上传响应:', uploadResponse.data)
                if (uploadResponse.data && uploadResponse.data.saveName) {
                    publishForm.value.img = uploadResponse.data.saveName
                } else {
                    throw new Error('图片上传失败')
                }
            } catch (error) {
                console.error('图片上传失败:', error)
                ElMessage.error('图片上传失败')
                return
            }
        } else {
            ElMessage.error('请选择要上传的图片')
            return
        }

        // 构建URL参数
        const params = new URLSearchParams()
        params.append('id', publishForm.value.id)
        params.append('name', publishForm.value.name)
        params.append('img', publishForm.value.img)
        params.append('mdd', publishForm.value.mdd)
        params.append('phone', publishForm.value.phone)
        params.append('time', publishForm.value.time)
        params.append('days', publishForm.value.days)
        params.append('num', publishForm.value.num)
        params.append('price', publishForm.value.price)
        params.append('bmnum', publishForm.value.bmnum)
        params.append('tepid', publishForm.value.tepid)
        params.append('address', publishForm.value.address)

        // 发送请求到后端
        const response = await axios.post(`http://localhost:8080/a1/LyuserController/lyfabu?${params.toString()}`)
        
        if (response.data) {
            ElMessage.success('发布成功')
            publishDialogVisible.value = false
            // 刷新列表
            fetchTourList()
        } else {
            ElMessage.error('发布失败')
        }
    } catch (error) {
        console.error('发布失败:', error)
        ElMessage.error('发布失败，请检查表单')
    }
}

// 显示发布对话框
const showPublishDialog = () => {
    // 设置默认值
    const maxId = Math.max(...tourList.value.map(item => parseInt(item.id)), 0)
    publishForm.value = {
        id: (maxId + 1).toString(),
        name: '',
        img: '',
        mdd: '',
        phone: '',
        time: new Date().toLocaleString(),
        days: 1,
        num: 1,
        price: 0,
        bmnum: 0,
        tepid: 'ly' + userId.value,
        address: ''
    }
    selectedFile.value = null
    if (uploadRef.value) {
        uploadRef.value.clearFiles()
    }
    publishDialogVisible.value = true
}

// 组件挂载时获取数据
onMounted(() => {
    // 从路由query中获取userid
    if (route.query.userid) {
        userId.value = route.query.userid
        console.log('Tourproject页面接收到的用户ID:', userId.value)
    } else {
        console.warn('Tourproject页面未接收到用户ID')
    }
    fetchTourList()
})
</script>

<style scoped>
.tourproject-container {
    padding: 20px;
}

.filter-container {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.tour-details {
    padding: 20px;
}

.mt-4 {
    margin-top: 1.5rem;
}

.el-timeline {
    margin-top: 1rem;
}

.el-timeline-item__content h5 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    color: #303133;
}

.el-timeline-item__content p {
    margin: 0;
    color: #606266;
    font-size: 0.9rem;
}

.upload-demo {
    width: 100%;
}

.el-upload {
    width: 100%;
}

.el-upload-dragger {
    width: 100%;
}

.image-preview {
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.preview-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
}

.image-error {
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
    color: #909399;
    font-size: 12px;
}
</style>