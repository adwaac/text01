<template>
    <div class="tourist-container">
        <div class="header">
            <h2>旅游供应商信息统计</h2>
            <el-button type="primary" @click="handleAdd">新增旅游供应商</el-button>
        </div>

        <!-- 搜索栏 -->
        <div class="search-container">
            <el-input
                v-model="searchText"
                placeholder="请输入旅游供应商名称或ID搜索"
                class="search-input"
                clearable
                @clear="fetchTourists"
            />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>

        <!-- 游客信息表格 -->
        <el-table :data="touristList" stripe style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="旅游供应商名称" width="120" />
            <el-table-column prop="phone" label="联系电话" width="150" />
            <el-table-column prop="address" label="地址" />
            <el-table-column prop="regtime" label="注册时间" width="180" />
            <el-table-column label="操作" width="180">
                <template #default="scope">
                    <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>

        <!-- 添加/编辑游客对话框 -->
        <el-dialog
            v-model="dialogVisible"
            :title="isEdit ? '编辑旅游供应商信息' : '新增旅游供应商信息'"
            width="50%"
            @close="clearTimer"
        >
            <el-form :model="formData" label-width="100px" :rules="rules" ref="touristForm">
                <el-form-item label="ID" prop="id">
                    <el-input v-model="formData.id" placeholder="请输入旅游供应商ID" />
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入旅游供应商" />
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="formData.phone" placeholder="请输入联系电话" />
                </el-form-item>
                <el-form-item label="地址" prop="address">
                    <el-input v-model="formData.address" placeholder="请输入地址" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="formData.password" placeholder="请输入密码" />
                </el-form-item>
                <el-form-item label="注册时间" prop="regtime">
                    <el-input v-model="formData.regtime" placeholder="请输入注册时间" disabled />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 游客列表数据
const touristList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchText = ref('')

// 表单数据和验证规则
const dialogVisible = ref(false)
const isEdit = ref(false)
const touristForm = ref(null)
const formData = reactive({
    id: '',
    name: '',
    phone: '',
    address: '',
    password: '',
    regtime: ''
})

const rules = {
    id: [{ required: true, message: '请输入旅游供应商ID', trigger: 'blur' }],
    name: [{ required: true, message: '请输入旅游供应商名称', trigger: 'blur' }],
    phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ]
}

// 定时器引用
const timer = ref(null)

// 获取旅游供应商列表
const fetchTourists = async () => {
    loading.value = true
    try {
        const res = await axios.post('http://localhost:8080/a1/LyuserController/selectall', {
            page: currentPage.value,
            pageSize: pageSize.value,
            keyword: searchText.value
        })

        touristList.value = res.data.filter(item =>
            !searchText.value ||
            item.name.includes(searchText.value) ||
            String(item.id).includes(searchText.value)
        )
        total.value = res.data.length
    } catch (error) {
        console.error('获取旅游供应商列表失败:', error)
        ElMessage.error('获取旅游供应商列表失败')
    } finally {
        loading.value = false
    }
}

// 搜索旅游供应商
const handleSearch = () => {
    currentPage.value = 1
    fetchTourists()
}

// 分页变化
const handleSizeChange = (val) => {
    pageSize.value = val
    fetchTourists()
}

const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchTourists()
}

// 新增旅游供应商
const handleAdd = () => {
    isEdit.value = false
    Object.assign(formData, {
        id: '',
        name: '',
        phone: '',
        address: '',
        password: '',
        regtime: new Date().toLocaleString()
    })
    dialogVisible.value = true
    // 开启定时器
    timer.value = setInterval(() => {
        formData.regtime = new Date().toLocaleString()
    }, 1000)
}

// 编辑旅游供应商
const handleEdit = (row) => {
    isEdit.value = true
    Object.assign(formData, JSON.parse(JSON.stringify(row)))
    dialogVisible.value = true
}

// 删除旅游供应商
const handleDelete = (row) => {
    ElMessageBox.confirm(
        `确定要删除旅游供应商 ${row.name} 的信息吗？`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    )
      .then(async () => {
            try {
                const apiUrl = 'http://localhost:8080/a1/LyuserController/delbyid'
                const params = {
                    id: row.id
                }
                await axios.post(apiUrl, null, {
                    params: params
                })
                ElMessage.success('删除成功')
                fetchTourists()
            } catch (error) {
                console.error('删除旅游供应商失败:', error)
                ElMessage.error('删除旅游供应商失败')
            }
        })
      .catch(() => {
            ElMessage.info('已取消删除')
        })
}

// 提交表单
const submitForm = async () => {
    if (!touristForm.value) return

    await touristForm.value.validate(async (valid) => {
        if (valid) {
            try {
                if (isEdit.value) {
                    // 编辑旅游供应商
                    const apiUrl = 'http://localhost:8080/a1/LyuserController/update'
                    const params = {
                        password: formData.password,
                        address: formData.address,
                        id: formData.id,
                        name: formData.name,
                        phone: formData.phone
                    }
                    await axios.post(apiUrl, null, {
                        params: params
                    })
                    ElMessage.success('编辑成功')
                } else {
                    // 新增旅游供应商
                    const apiUrl = 'http://localhost:8080/a1/LyuserController/reg'
                    const params = {
                        password: formData.password,
                        status: 'lyuser',
                        address: formData.address,
                        id: formData.id,
                        name: formData.name,
                        phone: formData.phone,
                        regtime: formData.regtime
                    }
                    await axios.post(apiUrl, null, {
                        params: params
                    })
                    ElMessage.success('新增成功')
                }

                dialogVisible.value = false
                fetchTourists()
            } catch (error) {
                console.error('保存旅游供应商信息失败:', error)
                ElMessage.error('保存旅游供应商信息失败')
            }
        } else {
            return false
        }
    })
}

// 清除定时器
const clearTimer = () => {
    if (timer.value) {
        clearInterval(timer.value)
        timer.value = null
    }
}

// 页面卸载时清除定时器
onUnmounted(() => {
    clearTimer()
})

// 页面加载时获取旅游供应商列表
onMounted(() => {
    fetchTourists()
})
</script>

<style scoped>
.tourist-container {
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
    margin-bottom: 20px;
}

.search-input {
    width: 300px;
    margin-right: 10px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>    