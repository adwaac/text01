<template>
  <div class="sysadmin-container">
    <div class="header">
      <h2>系统管理员信息</h2>
      <el-button type="primary" @click="handleAdd">新增系统管理员</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-container">
      <el-input
        v-model="searchText"
        placeholder="请输入系统管理员用户名搜索"
        class="search-input"
        clearable
        @clear="fetchAdmins"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <!-- 管理员信息表格 -->
    <el-table :data="adminList" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column prop="phone" label="联系电话" width="120" />
      <el-table-column prop="role" label="角色" width="100">
        <template #default="scope">
          <el-tag type="success">{{ scope.row.role }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="lastLoginTime" label="上次登录时间" width="180" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="warning" link @click="handleResetPassword(scope.row)">重置密码</el-button>
          <el-button 
            :type="scope.row.status === 1 ? 'danger' : 'success'" 
            link 
            @click="handleToggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
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

    <!-- 添加/编辑管理员对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑系统管理员信息' : '新增系统管理员'"
      width="40%"
    >
      <el-form :model="formData" label-width="100px" :rules="rules" ref="adminForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色">
            <el-option label="超级管理员" value="超级管理员" />
            <el-option label="系统管理员" value="系统管理员" />
            <el-option label="安全管理员" value="安全管理员" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="formData.password" placeholder="请输入密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
          <el-input 
            v-model="formData.confirmPassword" 
            placeholder="请再次输入密码" 
            type="password"
            show-password 
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
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

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordVisible"
      title="重置密码"
      width="40%"
    >
      <el-form :model="resetForm" label-width="100px" :rules="resetRules" ref="resetPasswordForm">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetForm.newPassword" placeholder="请输入新密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="resetForm.confirmPassword" 
            placeholder="请再次输入密码" 
            type="password"
            show-password 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPasswordVisible = false">取消</el-button>
          <el-button type="primary" @click="submitResetPassword">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 管理员列表数据
const adminList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchText = ref('')

// 表单数据和验证规则
const dialogVisible = ref(false)
const isEdit = ref(false)
const adminForm = ref(null)
const formData = reactive({
  id: '',
  username: '',
  email: '',
  phone: '',
  role: '系统管理员',
  password: '',
  confirmPassword: '',
  status: 1,
  createTime: '',
  lastLoginTime: ''
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (formData.confirmPassword !== '') {
      adminForm.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== formData.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (value && !emailRegex.test(value)) {
    callback(new Error('请输入有效的邮箱地址'))
  } else {
    callback()
  }
}

const validatePhone = (rule, value, callback) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (value && !phoneRegex.test(value)) {
    callback(new Error('请输入有效的手机号码'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { validator: validatePhone, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPass, trigger: 'blur' }
  ]
}

// 重置密码相关
const resetPasswordVisible = ref(false)
const resetPasswordForm = ref(null)
const currentAdminId = ref('')
const resetForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const validateResetPass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入新密码'))
  } else {
    if (resetForm.confirmPassword !== '') {
      resetPasswordForm.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateResetConfirmPass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== resetForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const resetRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    { validator: validateResetPass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateResetConfirmPass, trigger: 'blur' }
  ]
}

// 获取管理员列表
const fetchAdmins = async () => {
  loading.value = true
  try {
    // 实际项目中替换为真实API请求
    // const res = await axios.get('/api/admin/sysAdmin', {
    //   params: {
    //     page: currentPage.value,
    //     pageSize: pageSize.value,
    //     keyword: searchText.value
    //   }
    // })
    
    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    const mockData = []
    const roles = ['超级管理员', '系统管理员', '安全管理员']
    for (let i = 1; i <= 20; i++) {
      mockData.push({
        id: i,
        username: `sysadmin${i}`,
        email: `admin${i}@example.com`,
        phone: `1380000${String(i).padStart(4, '0')}`,
        role: roles[i % 3],
        status: i % 4 === 0 ? 0 : 1,
        createTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleString(),
        lastLoginTime: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toLocaleString()
      })
    }
    
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    adminList.value = mockData.filter(item => 
      !searchText.value || 
      item.username.includes(searchText.value) ||
      item.email.includes(searchText.value)
    ).slice(start, end)
    total.value = mockData.length
    
    // 实际API请求时使用下面的代码
    // adminList.value = res.data.records
    // total.value = res.data.total
  } catch (error) {
    console.error('获取系统管理员列表失败:', error)
    ElMessage.error('获取系统管理员列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索管理员
const handleSearch = () => {
  currentPage.value = 1
  fetchAdmins()
}

// 分页变化
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchAdmins()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchAdmins()
}

// 新增管理员
const handleAdd = () => {
  isEdit.value = false
  resetFormData()
  dialogVisible.value = true
}

// 编辑管理员
const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, row)
  formData.password = ''
  formData.confirmPassword = ''
  dialogVisible.value = true
}

// 重置密码
const handleResetPassword = (row) => {
  currentAdminId.value = row.id
  resetForm.newPassword = ''
  resetForm.confirmPassword = ''
  resetPasswordVisible.value = true
}

// 提交重置密码
const submitResetPassword = async () => {
  try {
    await resetPasswordForm.value.validate()
    
    // 实际项目中替换为真实API请求
    // await axios.post('/api/admin/resetPassword', {
    //   id: currentAdminId.value,
    //   newPassword: resetForm.newPassword
    // })
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('密码重置成功')
    resetPasswordVisible.value = false
  } catch (error) {
    console.error('重置密码失败:', error)
  }
}

// 切换状态
const handleToggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === 1 ? '禁用' : '启用'}系统管理员 "${row.username}" 吗?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 实际项目中替换为真实API请求
    // await axios.post('/api/admin/toggleStatus', {
    //   id: row.id,
    //   status: row.status === 1 ? 0 : 1
    // })
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    row.status = row.status === 1 ? 0 : 1
    ElMessage.success(`${row.status === 1 ? '启用' : '禁用'}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 删除管理员
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除系统管理员 "${row.username}" 吗?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 实际项目中替换为真实API请求
    // await axios.delete(`/api/admin/sysAdmin/${row.id}`)
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('删除成功')
    fetchAdmins()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 重置表单数据
const resetFormData = () => {
  formData.id = ''
  formData.username = ''
  formData.email = ''
  formData.phone = ''
  formData.role = '系统管理员'
  formData.password = ''
  formData.confirmPassword = ''
  formData.status = 1
  formData.createTime = ''
  formData.lastLoginTime = ''
}

// 提交表单
const submitForm = async () => {
  try {
    await adminForm.value.validate()
    
    if (isEdit.value) {
      // 编辑管理员
      // 实际项目中替换为真实API请求
      // await axios.put('/api/admin/sysAdmin', {
      //   id: formData.id,
      //   username: formData.username,
      //   email: formData.email,
      //   phone: formData.phone,
      //   role: formData.role,
      //   status: formData.status
      // })
    } else {
      // 新增管理员
      // 实际项目中替换为真实API请求
      // await axios.post('/api/admin/sysAdmin', {
      //   username: formData.username,
      //   email: formData.email,
      //   phone: formData.phone,
      //   role: formData.role,
      //   password: formData.password,
      //   status: formData.status
      // })
    }
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
    dialogVisible.value = false
    fetchAdmins()
  } catch (error) {
    console.error('提交失败:', error)
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('提交失败')
    }
  }
}

// 初始化
onMounted(() => {
  fetchAdmins()
})
</script>

<style scoped>
.sysadmin-container {
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
