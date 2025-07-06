<template>
    <div class="route-container">
        <div class="header">
            <h2>景点路线查询</h2>
        </div>

        <!-- 搜索栏 -->
        <div class="search-container">
            <el-input
                    v-model="searchKeyword"
                    placeholder="搜索景点名称、地址或关键词"
                    class="search-input"
                    clearable
            >
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
            </el-input>
            <el-select v-model="selectedCategory" placeholder="景点类别" clearable>
                <el-option v-for="item in categories" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-select v-model="selectedCity" placeholder="城市" clearable>
                <el-option v-for="item in cities" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
        </div>

        <!-- 推荐景点标题 -->
        <div class="section-title" v-if="!isSearching">
            <h3>热门景点推荐</h3>
        </div>

        <!-- 景点列表 -->
        <div class="attractions-container">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="attraction in displayAttractions" :key="attraction.id">
                    <el-card shadow="hover" class="attraction-card">
                        <img :src="attraction.img ? require('@/assets/' + attraction.img) : require('@/assets/default.jpg')" class="attraction-image" />
                        <div class="attraction-info">
                            <h4>{{ attraction.name }}</h4>
                            <div class="rating">
                                <el-rate v-model="attraction.rating" disabled text-color="#ff9900" />
                                <span>{{ attraction.rating }}分</span>
                            </div>
                            <p class="location">
                                <el-icon><Location /></el-icon>
                                {{ attraction.city }} - {{ attraction.address }}
                            </p>
                            <p class="category">
                                <el-tag size="small">{{ attraction.category }}</el-tag>
                            </p>
                            <p class="description">{{ attraction.description }}</p>
                            <div class="action-buttons">
                                <el-button type="primary" size="small" @click="viewRoute(attraction.id)">查看路线</el-button>
                                <el-button size="small" @click="viewDetails(attraction.id)">详情</el-button>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <!-- 无结果提示 -->
        <el-empty v-if="isSearching && filteredAttractions.length === 0" description="未找到匹配的景点" />

        <!-- 分页 -->
        <div class="pagination" v-if="totalAttractions > pageSize">
            <el-pagination
                    :current-page="currentPage"
                    :page-size="pageSize"
                    :page-sizes="[8, 16, 24, 32]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="totalAttractions"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
            />
        </div>

        <!-- 路线查看对话框 -->
        <el-dialog v-model="routeDialogVisible" title="景点路线" width="70%">
            <div class="route-map-container">
                <div class="route-info">
                    <h4 v-if="selectedAttraction">{{ selectedAttraction.name }} 路线信息</h4>
                    <div class="route-steps">
                        <div v-for="(step, index) in selectedAttraction?.routesteps" :key="step.rid" class="route-step">
                            <div class="step-number">{{ index + 1 }}</div>
                            <div class="step-content">
                                <h5>{{ step.title }}</h5>
                                <p>{{ step.description }}</p>
                                <p v-if="step.duration" class="step-duration">
                                    <el-icon><Timer /></el-icon>
                                    预计时间: {{ step.duration }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>

        <!-- 地图查看对话框 -->
        <el-dialog v-model="mapDialogVisible" title="景点地图" width="80%" :destroy-on-close="true">
            <Map v-if="selectedAttraction" :attraction-name="selectedAttraction.name" />
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Location, Timer } from '@element-plus/icons-vue'
import axios from 'axios'
import gugong from '@/assets/gugong.jpg'
import Map from '@/components/Map.vue'

// 搜索条件
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedCity = ref('')
const isSearching = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(8)

// 对话框
const routeDialogVisible = ref(false)
const mapDialogVisible = ref(false)
const selectedAttraction = ref(null)

// 类别列表
const categories = [
    { value: '自然风光', label: '自然风光' },
    { value: '历史遗迹', label: '历史遗迹' },
    { value: '文化场所', label: '文化场所' },
    { value: '主题公园', label: '主题公园' },
    { value: '宗教场所', label: '宗教场所' }
]

// 城市列表
const cities = [
    { value: '北京', label: '北京' },
    { value: '上海', label: '上海' },
    { value: '广州', label: '广州' },
    { value: '深圳', label: '深圳' },
    { value: '杭州', label: '杭州' },
    { value: '成都', label: '成都' }
]

// 景点数据
const attractions = ref([])

// 计算属性：过滤后的景点
const filteredAttractions = computed(() => {
    let result = attractions.value

    if (searchKeyword.value) {
        result = result.filter(item =>
            item.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
            item.description.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
            item.address.toLowerCase().includes(searchKeyword.value.toLowerCase())
        )
    }

    if (selectedCategory.value) {
        result = result.filter(item => item.category === selectedCategory.value)
    }

    if (selectedCity.value) {
        result = result.filter(item => item.city === selectedCity.value)
    }

    return result
})

// 计算属性：分页后显示的景点
const displayAttractions = computed(() => {
    return filteredAttractions.value.slice(
        (currentPage.value - 1) * pageSize.value,
        currentPage.value * pageSize.value
    )
})

// 计算属性：景点总数
const totalAttractions = computed(() => {
    return filteredAttractions.value.length
})

// 方法：搜索
const handleSearch = () => {
    isSearching.value = true
    currentPage.value = 1
    fetchAttractions()
}

// 方法：重置搜索
const resetSearch = () => {
    searchKeyword.value = ''
    selectedCategory.value = ''
    selectedCity.value = ''
    isSearching.value = false
    currentPage.value = 1
    fetchAttractions()
}

// 方法：查看路线
const viewRoute = (id) => {
    // 从已获取的 attractions 中查找对应 id 的数据
    selectedAttraction.value = attractions.value.find(item => item.id === id)
    routeDialogVisible.value = true
}

// 方法：查看详情
const viewDetails = (id) => {
    selectedAttraction.value = attractions.value.find(item => item.id === id)
    mapDialogVisible.value = true
}

// 方法：分页大小改变
const handleSizeChange = (size) => {
    pageSize.value = size
    currentPage.value = 1
    fetchAttractions()
}

// 方法：当前页改变
const handleCurrentChange = (page) => {
    currentPage.value = page
    fetchAttractions()
}

// 方法：获取景点数据
const fetchAttractions = async () => {
    try {
        const response = await axios.post('http://localhost:8080/a1/RouteController/selectall', {
            searchKeyword: searchKeyword.value,
            selectedCategory: selectedCategory.value,
            selectedCity: selectedCity.value,
            currentPage: currentPage.value,
            pageSize: pageSize.value
        })

        // 处理 routesteps 数组为对象数组（键名自定义，如 rid、title、description、duration）
        const processedData = response.data.map(attraction => {
            return {
                ...attraction,
                routesteps: attraction.routesteps.map(step => ({
                    rid: step[0],        // 数组第1项为 rid
                    title: step[1],      // 数组第2项为标题
                    description: step[2],// 数组第3项为描述
                    duration: step[3]    // 数组第4项为时长
                }))
            }
        })
console.log('response:', response.data)
        attractions.value = processedData
    } catch (error) {
        console.error('获取景点数据失败:', error)
        ElMessage.error('获取景点数据失败')
    }
}

// 方法：获取图片地址
const getImageUrl = (imageName) => {
    console.log('imageName:', imageName)
}

// 初始化
onMounted(() => {
    fetchAttractions()
})
</script>

<style scoped>
.route-container {
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

.section-title {
    margin: 10px 0 20px;
    border-left: 4px solid #409EFF;
    padding-left: 15px;
}

.attractions-container {
    margin-bottom: 30px;
}

.attraction-card {
    margin-bottom: 20px;
    transition: transform 0.3s;
    height: 100%;
}

.attraction-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.attraction-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
}

.attraction-info {
    padding: 10px;
}

.attraction-info h4 {
    margin: 10px 0;
    font-size: 18px;
}

.rating {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.rating span {
    margin-left: 8px;
    color: #ff9900;
}

.location {
    display: flex;
    align-items: center;
    color: #666;
    font-size: 14px;
    margin-bottom: 8px;
}

.location .el-icon {
    margin-right: 5px;
}

.category {
    margin-bottom: 8px;
}

.description {
    color: #666;
    font-size: 14px;
    margin-bottom: 15px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.action-buttons {
    display: flex;
    justify-content: space-between;
}

.pagination {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}

.route-map-container {
    display: flex;
    gap: 20px;
}

.route-info {
    flex: 1;
}

.map-placeholder {
    flex: 1;
    background-color: #f5f5f5;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
}

.map-image {
    max-width: 100%;
    height: auto;
}

.route-steps {
    margin-top: 20px;
}

.route-step {
    display: flex;
    margin-bottom: 15px;
}

.step-number {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: #409EFF;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 15px;
    flex-shrink: 0;
}

.step-content {
    flex: 1;
}

.step-content h5 {
    margin: 0 0 5px;
    font-size: 16px;
}

.step-content p {
    margin: 0 0 8px;
    color: #666;
}

.step-duration {
    display: flex;
    align-items: center;
    color: #409EFF;
    font-size: 14px;
}

.step-duration .el-icon {
    margin-right: 5px;
}

@media (max-width: 768px) {
    .route-map-container {
        flex-direction: column;
    }

    .search-container {
        flex-direction: column;
    }

    .search-input, .el-select {
        width: 100%;
    }
}
</style>    