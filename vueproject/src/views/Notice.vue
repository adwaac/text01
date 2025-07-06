<template>
  <div class="notice-container">
    <div class="header">
      <h2>公告管理</h2>
      <!-- 根据 status 判断是否显示添加按钮 -->
      <el-button v-if="status!== 'user'" type="primary" @click="openDialog(false)">添加公告</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索公告内容"
        class="search-input"
        clearable
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 公告列表 -->
    <el-table :data="filteredNotices" style="width: 100%" border>
      <el-table-column prop="id" label="序号" width="70" />
      <el-table-column prop="adminName" label="账号" width="150" />
      <el-table-column prop="publishDate" label="发布日期" width="150" />
      <el-table-column prop="content" label="公告内容" show-overflow-tooltip />
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <!-- 根据 status 判断是否显示删除按钮 -->
          <el-popconfirm
            v-if="status!== 'user'"
            title="确定删除该公告吗？"
            @confirm="handleDelete(scope.row.id)"
          >
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalNotices"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑公告对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑公告' : '添加公告'"
      width="50%"
    >
      <el-form :model="formData" label-width="100px" :rules="rules" ref="noticeForm">
        <!-- 去掉账号输入 -->
        <el-form-item label="发布日期" prop="publishDate">
          <el-date-picker
            v-model="formData.publishDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY/MM/DD"
          />
        </el-form-item>
        <el-form-item label="公告内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="5"
            placeholder="请输入公告内容"
          />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRoute } from 'vue-router'

// 获取路由对象
const route = useRoute()

// 公告列表数据
const notices = ref([])

// 搜索和分页
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 表单数据
const dialogVisible = ref(false)
const isEdit = ref(false)
const noticeForm = ref(null)
const formData = reactive({
  id: '',
  // 去掉 adminName
  publishDate: '',
  content: ''
})

// 表单验证规则
const rules = {
  // 去掉 adminName 验证规则
  publishDate: [
    { required: true, message: '请选择发布日期', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' }
  ]
}

// 计算属性：过滤后的公告列表
const filteredNotices = computed(() => {
  let result = notices.value
  if (searchKeyword.value) {
    result = result.filter(notice => 
      notice.content.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  return result.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

// 计算属性：公告总数
const totalNotices = computed(() => {
  if (searchKeyword.value) {
    return notices.value.filter(notice => 
      notice.content.toLowerCase().includes(searchKeyword.value.toLowerCase())
    ).length
  }
  return notices.value.length
})

// 方法：打开对话框
const openDialog = (edit, row) => {
  isEdit.value = edit
  dialogVisible.value = true
  
  if (edit && row) {
    // 编辑模式 - 填充表单
    Object.keys(formData).forEach(key => {
      formData[key] = row[key]
    })
  } else {
    // 添加模式 - 重置表单
    Object.keys(formData).forEach(key => {
      formData[key] = ''
    })
    // 设置今天的日期为默认发布日期
    formData.publishDate = new Date().toISOString().split('T')[0].replace(/-/g, '/')
  }
}

// 方法：提交表单
const userid = ref(route.query.userid)
console.log('响应数据aaa:', userid.value)
const status = ref(route.query.status)
console.log('响应数据aaa:', status.value)
const submitForm = async () => {
  try {
    await noticeForm.value.validate()
    
    if (isEdit.value) {
      // 编辑公告
      const index = notices.value.findIndex(item => item.id === formData.id)
      if (index!== -1) {
        notices.value[index] = { 
          ...formData,
          adminName: userid.value // 编辑时使用 userid 作为账号
        }
      }
      ElMessage.success('修改成功')
    } else {
      // 添加公告
      const newId = notices.value.length > 0 
        ? Math.max(...notices.value.map(item => item.id)) + 1 
        : 1
      const apiUrl = `http://localhost:8080/a1/UserController/addnotice?id=${newId}&userid=${userid.value}&time=${formData.publishDate}&aa=${encodeURIComponent(formData.content)}`
      const response = await axios.get(apiUrl)
      if (response.status === 200) {
        notices.value.push({
          id: newId,
          adminName: userid.value, // 添加时使用 userid 作为账号
          publishDate: formData.publishDate,
          content: formData.content
        })
        ElMessage.success('添加成功')
      } else {
        ElMessage.error('添加失败')
      }
    }
    
    dialogVisible.value = false
  } catch (error) {
    console.error('提交失败:', error)
  }
}

// 方法：删除公告
const handleDelete = async (id) => {
  try {
    const response = await axios.get(`http://localhost:8080/a1/UserController/delnoticebyid?id=${id}`);
    if (response.status === 200) {
      const index = notices.value.findIndex(item => item.id === id);
      if (index!== -1) {
        notices.value.splice(index, 1);
        ElMessage.success('删除成功');
      }
    } else {
      ElMessage.error('删除失败');
    }
  } catch (error) {
    console.error('删除公告时出错:', error);
    ElMessage.error('删除失败');
  }
}

// 方法：搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 方法：重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  currentPage.value = 1
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
    const response = await axios.post('http://localhost:8080/a1/UserController/selectallnotice')
    notices.value = response.data.map(item => ({
      id: parseInt(item[0]),
      adminName: item[1],
      publishDate: item[2],
      content: item[3]
    }))
  } catch (error) {
    console.error('获取公告数据失败:', error)
    ElMessage.error('获取公告数据失败')
  }
})
</script>

<style scoped>
.notice-container {
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