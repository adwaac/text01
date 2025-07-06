<template>
  <div class="login-container">
    <div class="login-box">
      <h3 class="text-center mb-4">用户登录</h3>
      
      <!-- 错误提示 -->
      <div v-if="errorMessage" class="alert alert-danger mb-3">
        {{ errorMessage }}
      </div>
      
      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label">用户名</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="userid" 
            placeholder="请输入用户id"
          >
        </div>
        
        <div class="mb-3">
          <label class="form-label">密码</label>
          <input 
            type="password" 
            class="form-control" 
            v-model="password" 
            placeholder="请输入密码"
          >
        </div>
        
        <button type="submit" class="btn btn-primary w-100">登录</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userid: '',
      password: '',
      errorMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      // 简单表单验证
      if (!this.userid || !this.password) {
        this.errorMessage = '用户名和密码不能为空';
        return;
      }
      
      try {
        // 调用登录API
        const response = await fetch('http://localhost:8080/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userid: this.userid,
            password: this.password
          })
        });
        
        if (!response.ok) {
          throw new Error('登录失败，请检查用户名和密码');
        }
        
        const user = await response.json();
        
        // 登录成功后保存用户信息（示例使用localStorage）
        localStorage.setItem('user', JSON.stringify(user));
        console.log('登录成功:', this.userid);
        
        // 跳转到text页面并传递userid
        this.$router.push({ name: 'text', query:{userid:this.userid}});
      } catch (error) {
        this.errorMessage = error.message;
        console.error('登录错误:', error);
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  width: 300px;
  padding: 20px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>