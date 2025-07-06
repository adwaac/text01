<template>
  <div class="container">
    <h1 class="title">学生成绩管理</h1>
    <!-- 搜索和操作区域 -->
    <div class="action-bar">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          placeholder="输入学生ID或姓名搜索" 
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button class="btn search-btn" @click="handleSearch">搜索</button>
        <button class="btn reset-btn" @click="resetSearch">重置</button>
      </div>
      
      <div class="button-group">
        <button class="btn primary" @click="openAddModal('user')">
          <i class="icon-add"></i> 添加学生
        </button>
        <button class="btn primary" @click="openAddModal('grade')">
          <i class="icon-add"></i> 添加成绩
        </button>
      </div>
    </div>
    
    <!-- 信息提示 -->
    <div v-if="loading" class="loading-info">
      <i class="icon-loading"></i> 数据加载中...
    </div>
    <div v-else-if="error" class="error-info">
      <i class="icon-error"></i> {{ error }}
    </div>
    
    <!-- 数据表格 -->
    <div v-else class="data-container">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>学生ID</th>
              <th>姓名</th>
              <th>班级</th>
              <th>实验数量</th>
              <th>平均成绩</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in paginatedUsers" :key="user.userId" class="user-row">
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>{{ user.userId }}</td>
              <td>{{ user.userName }}</td>
              <td>{{ formatClassId(user.classId) }}</td>
              <td>{{ user.exper ? user.exper.length : 0 }}</td>
              <td>{{ calculateAverageGrade(user) }}</td>
              <td class="actions">
                <button class="btn small view-btn" @click="viewDetails(user)">
                  <i class="icon-view"></i> 详情
                </button>
                <button class="btn small edit-btn" @click="editUser(user)">
                  <i class="icon-edit"></i> 编辑
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页控件 -->
      <div class="pagination" v-if="filteredUsers.length > pageSize">
        <button 
          class="btn page-btn" 
          :disabled="currentPage === 1" 
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="page-info">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </span>
        <button 
          class="btn page-btn" 
          :disabled="currentPage === totalPages" 
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>
    
    <!-- 学生详情模态框 -->
    <div v-if="detailModalVisible" class="modal">
      <div class="modal-content large">
        <div class="modal-header">
          <h3 class="modal-title">学生详情 - {{ selectedUser.userName }}</h3>
          <button class="close-btn" @click="detailModalVisible = false">&times;</button>
        </div>
        
        <div class="user-info">
          <div class="info-item">
            <label>学生ID:</label>
            <span>{{ selectedUser.userId }}</span>
          </div>
          <div class="info-item">
            <label>姓名:</label>
            <span>{{ selectedUser.userName }}</span>
          </div>
          <div class="info-item">
            <label>班级:</label>
            <span>{{ formatClassId(selectedUser.classId) }}</span>
          </div>
        </div>
        
        <div class="experiment-list" v-if="selectedUser.exper && selectedUser.exper.length">
          <h4 class="section-title">实验成绩</h4>
          <table class="experiment-table">
            <thead>
              <tr>
                <th>实验名称</th>
                <th>实验ID</th>
                <th>类型</th>
                <th>类型ID</th>
                <th>成绩</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(exp, idx) in selectedUser.exper" :key="idx">
                <td>{{ exp[0] || '未命名' }}</td>
                <td>{{ exp[1] || '-' }}</td>
                <td>{{ exp[3] || '未分类' }}</td>
                <td>{{ exp[6] || '-' }}</td>
                <td :class="getGradeClass(exp[5])">
                  {{ exp[5] || 0 }} 分
                </td>
                <td>
                  <button class="btn small edit-btn" @click="editExperiment(exp, selectedUser.userId)">
                    <i class="icon-edit"></i> 编辑
                  </button>
                  <button class="btn small delete-btn" @click="deleteExperiment(exp[1], selectedUser.userId)">
                    <i class="icon-delete"></i> 删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="no-data">
          <i class="icon-no-data"></i> 暂无实验数据
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑模态框 -->
    <div v-if="editModalVisible" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ modalTitle }}</h3>
          <button class="close-btn" @click="closeEditModal">&times;</button>
        </div>
        
        <!-- 学生表单 -->
        <form v-if="modalType === 'user'" @submit.prevent="saveData">
          <div class="form-group">
            <label for="userId">学生ID:</label>
            <input 
              id="userId" 
              type="text" 
              v-model="currentUser.userId" 
              :disabled="isEditing"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="userName">姓名:</label>
            <input 
              id="userName" 
              type="text" 
              v-model="currentUser.userName" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="password">密码:</label>
            <input 
              id="password" 
              type="password" 
              v-model="currentUser.password" 
              :placeholder="isEditing ? '留空则不修改' : '默认123'"
            >
          </div>
          
          <div class="form-group">
            <label for="classId">班级ID:</label>
            <input 
              id="classId" 
              type="number" 
              v-model.number="currentUser.classId" 
              min="0"
              placeholder="留空则无班级"
            >
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn primary">
              <i class="icon-save"></i> 保存
            </button>
            <button type="button" class="btn secondary" @click="closeEditModal">
              <i class="icon-cancel"></i> 取消
            </button>
          </div>
        </form>
        
        <!-- 成绩表单 -->
        <form v-if="modalType === 'grade'" @submit.prevent="saveData">
          <div class="form-group">
            <label for="gradeUserId">学生ID:</label>
            <input 
              id="gradeUserId" 
              type="text" 
              v-model="currentGrade.userId" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="gradeUserName">学生姓名:</label>
            <input 
              id="gradeUserName" 
              type="text" 
              v-model="currentGrade.userName" 
              required
            >
          </div>

          <div class="form-group">
            <label for="classId">班级:</label>
            <input 
              id="classId" 
              type="text" 
              v-model="currentGrade.classId" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="experName">实验名称:</label>
            <input 
              id="experName" 
              type="text" 
              v-model="currentGrade.experName" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="experId">实验ID:</label>
            <input 
              id="experId" 
              type="number" 
              v-model.number="currentGrade.experId" 
              min="0" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="typeName">实验类型:</label>
            <input 
              id="typeName" 
              type="text" 
              v-model="currentGrade.typeName" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="typeId">类型ID:</label>
            <input 
              id="typeId" 
              type="number" 
              v-model.number="currentGrade.typeId" 
              min="0" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="experGrade">实验成绩:</label>
            <input 
              id="experGrade" 
              type="number" 
              v-model.number="currentGrade.experGrade" 
              min="0" 
              max="100" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="experContent">实验内容:</label>
            <textarea 
              id="experContent" 
              v-model="currentGrade.experContent" 
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn primary">
              <i class="icon-save"></i> 保存
            </button>
            <button type="button" class="btn secondary" @click="closeEditModal">
              <i class="icon-cancel"></i> 取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Qs from 'qs'

export default {
  data() {
    return {
      users: [],
      loading: false,
      error: null,
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      
      // 模态框相关
      detailModalVisible: false,
      editModalVisible: false,
      modalType: '', // 'user' or 'grade'
      modalTitle: '',
      isEditing: false,
      
      // 当前选中的用户
      selectedUser: {},
      
      // 表单数据
      currentUser: {
        userId: '',
        userName: '',
        password: '',
        classId: null
      },
      currentGrade: {
        userId: '',
        userName: '',
        experName: '',
        experId: 0,
        typeName: '',
        typeId: 0,
        experGrade: 0,
        experContent: '',
        classId: ''
      }
    }
  },
  
  computed: {
    // 过滤后的用户列表
    filteredUsers() {
      if (!this.searchQuery) {
        return this.users.filter(user => user.userRole === 1)
      }
      
      const query = this.searchQuery.toLowerCase()
      return this.users.filter(user => user.userRole === 1 && 
        (String(user.userId).toLowerCase().includes(query) || 
         (user.userName && user.userName.toLowerCase().includes(query))))
    },
    
    // 分页后的用户列表
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredUsers.slice(start, end)
    },
    
    // 总页数
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.pageSize)
    }
  },
  
  watch: {
    // 当搜索条件变化时重置到第一页
    searchQuery() {
      this.currentPage = 1
    },
    
    // 当过滤后的用户列表变化时检查当前页是否有效
    filteredUsers() {
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages
      }
    }
  },
  
  mounted() {
    this.fetchData()
  },
  
  methods: {
    // 获取数据
    async fetchData() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.post(
          'http://localhost:8080/a1/zh_UserController/selectall', 
          Qs.stringify({}), 
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          }
        )
        
        this.users = response.data || []
      } catch (error) {
        console.error('数据加载失败:', error)
        this.error = '数据加载失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    
    // 搜索处理
    handleSearch() {
      this.currentPage = 1
    },
    
    // 重置搜索
    resetSearch() {
      this.searchQuery = ''
      this.currentPage = 1
    },
    
    // 打开添加模态框
    openAddModal(type) {
      this.modalType = type
      this.isEditing = false
      this.modalTitle = type === 'user' ? '添加学生' : '添加实验成绩'
      this.editModalVisible = true
      
      if (type === 'user') {
        this.currentUser = {
          userId: '',
          userName: '',
          password: '',
          classId: null
        }
      } else {
        this.currentGrade = {
          userId: '',
          userName: '',
          experName: '',
          experId: 0,
          typeName: '',
          typeId: 0,
          experGrade: 0,
          experContent: '',
          classId: ''
        }
      }
    },
    
    // 查看学生详情
    viewDetails(user) {
      this.selectedUser = { ...user }
      this.detailModalVisible = true
    },
    
    // 编辑学生信息
    editUser(user) {
      this.modalType = 'user'
      this.isEditing = true
      this.modalTitle = '编辑学生信息'
      this.editModalVisible = true
      
      this.currentUser = {
        userId: user.userId,
        userName: user.userName,
        password: '',
        classId: user.classId
      }
    },
    
    // 编辑实验成绩
    editExperiment(experiment, userId) {
      this.modalType = 'grade'
      this.isEditing = true
      this.modalTitle = '编辑实验成绩'
      this.editModalVisible = true
      
      const user = this.users.find(u => u.userId === userId)
      
      this.currentGrade = {
        userId: userId,
        userName: user.userName,
        experName: experiment[0] || '',
        experId: experiment[1] || 0,
        typeName: experiment[3] || '',
        typeId: experiment[6] || 0,
        experGrade: experiment[5] || 0,
        experContent: experiment[4] || '',
        classId: user.classId || ''
      }
    },
    
    // 关闭编辑模态框
    closeEditModal() {
      this.editModalVisible = false
    },
    
    // 保存数据
    async saveData() {
      if (this.modalType === 'user') {
        await this.saveUser()
      } else {
        await this.saveGrade()
      }
    },
    
    // 保存学生信息
    async saveUser() {
      if (!this.currentUser.userId || !this.currentUser.userName) {
        alert('请填写学生ID和姓名');
        return;
      }

      // 设置默认密码
      if (!this.isEditing && !this.currentUser.password) {
        this.currentUser.password = '123';
      }

      // 设置默认班级
      if (this.currentUser.classId === null || this.currentUser.classId === '') {
        this.currentUser.classId = 99; // 表示无班级
      }

      this.loading = true;

      try {
        const url = this.isEditing
          ? 'http://localhost:8080/a1/zh_UserController/updata'
          : 'http://localhost:8080/a1/zh_UserController/saveuser';

        const data = {
          userId: this.currentUser.userId,
          password: this.currentUser.password,
          userName: this.currentUser.userName,
          classId: this.currentUser.classId
        };

        const response = await axios.post(
          url,
          Qs.stringify(data),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          }
        );

        // 检查后端返回值
        if (response.data === 0) {
          throw new Error('操作失败');
        }

        alert('操作成功');
        this.closeEditModal();
        this.fetchData();
      } catch (error) {
        console.error('操作失败:', error);
        alert(`操作失败: ${error.message || '未知错误'}`);
      } finally {
        this.loading = false;
      }
    },

    // 保存成绩信息
    async saveGrade() {
      const requiredFields = [
        'userId', 'userName', 'experName', 
        'experId', 'typeName', 'typeId', 'experGrade'
      ]
      
      for (const field of requiredFields) {
        if (!this.currentGrade[field] && this.currentGrade[field] !== 0) {
          alert(`请填写${field}`)
          return
        }
      }
      
      this.loading = true
      
      try {
        // 添加成绩参数输出到控制台
        console.log('添加成绩参数:', {
          userId: this.currentGrade.userId,
          userName: this.currentGrade.userName,
          classId: this.currentGrade.classId,
          experName: this.currentGrade.experName,
          experId: this.currentGrade.experId,
          typeName: this.currentGrade.typeName,
          typeId: this.currentGrade.typeId,
          experGrade: this.currentGrade.experGrade,
          experContent: this.currentGrade.experContent
        })
        
        const url = this.isEditing 
          ? 'http://localhost:8080/a1/zh_UserController/upcj' 
          : 'http://localhost:8080/a1/zh_UserController/save'; // 更新添加成绩API
        
        // 从当前用户数据中获取班级信息
        const user = this.users.find(u => u.userId === this.currentGrade.userId)
        if (user) {
          this.currentGrade.classId = user.classId || ''
        }
        
        const response = await axios.post(
          url,
          Qs.stringify(this.currentGrade),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          }
        )
        
        // 检查后端返回值
        if (response.data === 0) {
          throw new Error('操作失败');
        }
        
        alert('操作成功')
        this.closeEditModal()
        this.fetchData()
        this.detailModalVisible = false
      } catch (error) {
        console.error('操作失败:', error)
        alert(`操作失败: ${error.message || '未知错误'}`)
      } finally {
        this.loading = false
      }
    },
    
    // 删除实验成绩
    async deleteExperiment(experId, userId) {
      if (!confirm('确定要删除这条实验记录吗？')) return
      
      this.loading = true
      
      try {
        await axios.post(
          'http://localhost:8080/a1/zh_UserController/delcj',
          Qs.stringify({ 
            userId: userId,
            experId: experId
          }),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          }
        )
        
        alert('删除成功')
        this.fetchData()
        this.detailModalVisible = false
      } catch (error) {
        console.error('删除失败:', error)
        alert('删除失败')
      } finally {
        this.loading = false
      }
    },
    
    // 计算平均成绩
    calculateAverageGrade(user) {
      if (!user.exper || !user.exper.length) return '暂无'
      
      const grades = user.exper
        .map(exp => parseFloat(exp[5]))
        .filter(grade => !isNaN(grade))
      
      if (!grades.length) return '暂无'
      
      const sum = grades.reduce((a, b) => a + b, 0)
      const avg = sum / grades.length
      return avg.toFixed(1) + ' 分'
    },
    
    // 格式化班级显示
    formatClassId(classId) {
      return classId === 0 || classId === 99 ? '无班级' : classId
    },
    
    // 获取成绩样式
    getGradeClass(grade) {
      grade = parseFloat(grade)
      if (isNaN(grade)) return ''
      
      if (grade >= 90) return 'excellent'
      if (grade >= 80) return 'good'
      if (grade >= 60) return 'pass'
      return 'fail'
    }
  }
}
</script>

<style scoped>
/* 基础样式 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 28px;
}

/* 操作栏样式 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 10px;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.btn i {
  font-size: 14px;
}

.btn.primary {
  background-color: #3498db;
  color: white;
}

.btn.primary:hover {
  background-color: #2980b9;
}

.btn.secondary {
  background-color: #95a5a6;
  color: white;
}

.btn.secondary:hover {
  background-color: #7f8c8d;
}

.btn.search-btn {
  background-color: #2ecc71;
  color: white;
}

.btn.search-btn:hover {
  background-color: #27ae60;
}

.btn.reset-btn {
  background-color: #e74c3c;
  color: white;
}

.btn.reset-btn:hover {
  background-color: #c0392b;
}

.btn.small {
  padding: 4px 8px;
  font-size: 12px;
}

.view-btn {
  background-color: #3498db;
  color: white;
}

.edit-btn {
  background-color: #f39c12;
  color: white;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.page-btn {
  background-color: #bdc3c7;
  color: #2c3e50;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 表格样式 */
.data-container {
  margin-top: 20px;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.data-table th, 
.data-table td {
  padding: 12px 15px;
  border: 1px solid #ddd;
  text-align: left;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.user-row:hover {
  background-color: #f5f5f5;
}

.actions {
  display: flex;
  gap: 5px;
}

/* 实验表格样式 */
.experiment-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.experiment-table th, 
.experiment-table td {
  padding: 10px 12px;
  border: 1px solid #eee;
}

.experiment-table th {
  background-color: #f8f9fa;
}

.experiment-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

/* 成绩样式 */
.excellent {
  color: #27ae60;
  font-weight: bold;
}

.good {
  color: #2980b9;
}

.pass {
  color: #f39c12;
}

.fail {
  color: #e74c3c;
  font-weight: bold;
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
}

.modal-content.large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
}

/* 表单样式 */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* 用户信息样式 */
.user-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-weight: 600;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.info-item span {
  padding: 5px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.page-info {
  font-size: 14px;
  color: #7f8c8d;
}

/* 信息提示样式 */
.loading-info,
.error-info,
.no-data {
  text-align: center;
  padding: 30px;
  font-size: 16px;
  color: #7f8c8d;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.error-info {
  color: #e74c3c;
}

/* 图标样式 (使用Unicode字符作为简单图标) */
.icon-add::before {
  content: "+";
}

.icon-view::before {
  content: "👁";
}

.icon-edit::before {
  content: "✏️";
}

.icon-delete::before {
  content: "🗑";
}

.icon-save::before {
  content: "💾";
}

.icon-cancel::before {
  content: "✕";
}

.icon-loading::before {
  content: "⏳";
  animation: spin 1s linear infinite;
}

.icon-error::before {
  content: "⚠️";
}

.icon-no-data::before {
  content: "📭";
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
  
  .search-input {
    flex-grow: 1;
  }
  
  .button-group {
    justify-content: flex-start;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .user-info {
    grid-template-columns: 1fr;
  }
}
</style>