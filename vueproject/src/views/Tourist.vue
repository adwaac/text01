<template>
    <div class="tourist-container">
      <div class="header">
        <h2>游客信息统计</h2>
        <el-button type="primary" @click="handleAdd">新增游客</el-button>
      </div>
      <!-- 搜索栏 -->
      <div class="search-container">
        <el-input
          v-model="searchText"
          placeholder="请输入游客姓名或ID搜索"
          class="search-input"
          clearable
          @clear="fetchTourists"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
  
      <!-- 游客信息表格 -->
      <el-table :data="touristList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="userId" label="ID" width="80" />
        <el-table-column prop="userName" label="姓名" width="120" />
        <el-table-column prop="userSex" label="性别" width="80">
          <template #default="scope">
            {{ scope.row.userSex === 1 ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="password" label="密码" width="150" />
        <el-table-column prop="userImg" label="头像" width="180">
            <template #default="scope">
                <img 
                    :src="`/img/${scope.row.userImg}`" 
                    alt="头像" 
                    style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;"
                />
            </template>
        </el-table-column>
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
        :title="isEdit ? '编辑游客信息' : '新增游客信息'"
        width="50%"
        @close="clearTimer"
      >
        <el-form :model="formData" label-width="100px" :rules="rules" ref="touristForm">
          <el-form-item label="ID" prop="userId">
            <el-input v-model="formData.userId" placeholder="请输入游客ID" />
          </el-form-item>
          <el-form-item label="姓名" prop="userName">
            <el-input v-model="formData.userName" placeholder="请输入游客姓名" />
          </el-form-item>
          <el-form-item label="性别" prop="userSex">
            <el-radio-group v-model="formData.userSex">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="0">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="年龄" prop="age">
            <el-input-number v-model="formData.age" :min="1" :max="120" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="formData.password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="头像" prop="userImg">
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :limit="1"
              @change="handleAvatarChange"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入地址" />
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
import { Plus } from '@element-plus/icons-vue'
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
    userId: '',
    userName: '',
    userSex: 1,
    age: 25,
    password: '',
    userImg: '',
    address: '',
    regtime: ''
  })
  
  const rules = {
    userName: [{ required: true, message: '请输入游客姓名', trigger: 'blur' }],
    userSex: [{ required: true, message: '请选择性别', trigger: 'change' }],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' }
    ],
    userImg: [
      { required: true, message: '请上传头像', trigger: 'change' }
    ],
    userId: [
      { required: true, message: '请输入游客ID', trigger: 'blur' }
    ]
  }
  
  // 定时器引用
  const timer = ref(null)

  // 添加selectedFile引用
  const selectedFile = ref(null)

  // 获取游客列表
  const fetchTourists = async () => {
    loading.value = true
    try {
      const res = await axios.post('http://localhost:8080/a1/UserController/selectall')
      
      touristList.value = res.data.filter(item => 
        !searchText.value || 
        item.userName.includes(searchText.value) || 
        String(item.userId).includes(searchText.value)
      ).slice((currentPage.value - 1) * pageSize.value, (currentPage.value - 1) * pageSize.value + pageSize.value)
      total.value = res.data.length
      console.log('响应数据:', touristList.value)
    } catch (error) {
      console.error('获取游客列表失败:', error)
      ElMessage.error('获取游客列表失败')
    } finally {
      loading.value = false
    }
    console.log('img:', touristList.value[1].userImg)
  }
  
  // 搜索游客
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
  
  // 新增游客
const handleAdd = () => {
  isEdit.value = false;
  // 重置表单数据
  formData.userId = '';
  formData.userName = '';
  formData.userSex = 1;
  formData.age = 25;
  formData.password = '';
  formData.userImg = 'default.jpg'; // 设置默认头像
  formData.address = '';
  formData.regtime = new Date().toLocaleString();
  
  selectedFile.value = null;
  dialogVisible.value = true;
  
  // 开启定时器
  timer.value = setInterval(() => {
    formData.regtime = new Date().toLocaleString();
  }, 1000);
}
  
// 编辑游客
const handleEdit = (row) => {
  isEdit.value = true;
  // 深拷贝确保数据独立
  Object.assign(formData, JSON.parse(JSON.stringify(row)));
  dialogVisible.value = true;
};

const editTourist = async () => {
    // 构建URL参数
    const params = new URLSearchParams();
    params.append('userid', formData.userId);
    params.append('username', formData.userName);
    params.append('usersex', formData.userSex);
    params.append('age', formData.age);
    params.append('password', formData.password);
    params.append('userimg', formData.userImg);
    params.append('address', formData.address);
    params.append('regtime', formData.regtime);
    params.append('status', 'user');

    console.log("前端参数：", params.toString());

    try {
        const response = await axios.post(`http://localhost:8080/a1/UserController/update?${params.toString()}`);
        console.log('更新响应:', response.data);
        ElMessage.success('编辑成功');
        dialogVisible.value = false;
        fetchTourists();
    } catch (error) {
        console.error('编辑失败:', error.response?.data || error.message);
        ElMessage.error('编辑失败，请重试');
    }
};
  
// 删除游客
const handleDelete = async (row) => {
    try {
        const confirmResult = await ElMessageBox.confirm(
            `确定要删除游客 ${row.userName} 的信息吗？`,
            '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        );
        if (confirmResult === 'confirm') {
            console.log('即将删除的用户 ID:', row.userId); // 打印 userid 进行确认
            if (typeof row.userId!== 'string' || row.userId === '') {
                console.error('用户 ID 无效:', row.userId);
                ElMessage.error('删除失败，用户 ID 无效');
                return;
            }
            const url = `http://localhost:8080/a1/UserController/delbyid?userid=${row.userId}`;
            const response = await axios.post(url);
            if (response.status === 200) {
                ElMessage.success('删除成功');
                fetchTourists();
            } else {
                console.error('删除失败，服务器返回状态码：', response.status);
                ElMessage.error('删除失败，请重试');
            }
        }
    } catch (error) {
        console.error('删除失败:', error.response?.data || error.message);
        ElMessage.error('删除失败，请重试');
    }
};
  
// 处理头像上传
const handleAvatarChange = (file) => {
    if (file.raw) {
        selectedFile.value = file.raw;
        // 添加文件类型和大小的验证
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
        
        // 设置表单的userImg字段，用于验证
        formData.userImg = 'uploaded';
    }
}

// 修改addTourist函数
const addTourist = async () => {
    try {
        if (!selectedFile.value) {
            ElMessage.error('请上传头像');
            return;
        }

        // 1. 先上传图片
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile.value);
        
        const uploadResponse = await axios.post('http://localhost:8080/a1/UploadController/Photoupload', uploadFormData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        console.log('图片上传响应:', uploadResponse.data);
        
        if (!uploadResponse.data || !uploadResponse.data.saveName) {
            throw new Error('图片上传失败：未获取到图片名称');
        }

        // 2. 构建请求参数
        const params = new URLSearchParams();
        params.append('userid', formData.userId);
        params.append('username', formData.userName);
        params.append('usersex', formData.userSex);
        params.append('userimg', uploadResponse.data.saveName);
        params.append('password', formData.password);
        params.append('address', formData.address);
        params.append('regtime', formData.regtime);
        params.append('status', 'user');
        if (formData.age !== null) {
            params.append('age', formData.age);
        }

        console.log('发送到后端的参数:', params.toString());

        // 3. 调用注册接口
        const response = await axios.post(`http://localhost:8080/a1/UserController/reg?${params.toString()}`);
        console.log('注册响应:', response.data);
        
        ElMessage.success('新增成功')
        dialogVisible.value = false
        fetchTourists()
        
        // 4. 重置表单和文件
        selectedFile.value = null
        Object.keys(formData).forEach(key => {
            formData[key] = '';
        })
    } catch (error) {
        console.error('新增失败:', error.response?.data || error.message)
        ElMessage.error('新增失败，请重试')
    }
}

// 提交表单
const submitForm = async () => {
  if (!touristForm.value) return
  await touristForm.value.validate(async (valid) => {
    if (valid) {
      if (isEdit.value) {
        await editTourist()
      } else {
        await addTourist()
      }
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
  
  // 页面加载时获取游客列表
  onMounted(() => {
    fetchTourists()
  })

  // 修改handleImgError函数
  const handleImgError = (event) => {
    console.error('图片加载失败');
    event.target.src = '/img/default.jpg';
  };
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

  .el-upload--picture-card {
    width: 100px;
    height: 100px;
    line-height: 100px;
  }
  </style>        