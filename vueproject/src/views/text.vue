<template>
  <div class="test-container">
    <h3>WebSocket 控制器测试</h3>
    
    <div class="connection">
      <label>用户 ID: <input v-model.number="userId" type="number"></label>
      <button @click="connect" :disabled="isConnected">连接</button>
      <button @click="disconnect" :disabled="!isConnected">断开</button>
      <span v-if="isConnected" class="status connected">已连接</span>
      <span v-else class="status disconnected">已断开</span>
    </div>
    
    <div class="actions">
      <button @click="sendPing" :disabled="!isConnected">发送匹配请求 (pp)</button>
      <button @click="sendLink" :disabled="!isConnected || !selectedUserId">
        连接用户 {{ selectedUserId }}
      </button>
      <select v-model.number="selectedUserId" :disabled="!isConnected || availableUsers.length === 0">
        <option value="">选择用户</option>
        <option v-for="user in availableUsers" :key="user" :value="user">
          用户 {{ user }}
        </option>
      </select>
      <div>
        <input v-model="message" placeholder="输入消息">
        <button @click="sendMessage" :disabled="!isConnected">发送消息</button>
      </div>
    </div>
    
    <div class="logs">
      <h4>日志</h4>
      <div class="log-item" v-for="(log, index) in logs" :key="index">
        {{ log }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userId: null,
      socket: null,
      isConnected: false,
      logs: [],
      message: '',
      availableUsers: [],
      selectedUserId: null
    }
  },
  methods: {
    // 连接 WebSocket
    connect() {
      if (!this.userId) {
        this.addLog('请输入用户 ID');
        return;
      }
      
      try {
        // 连接到 WebSocket 服务器
        this.socket = new WebSocket(`ws://localhost:8080/wsapi/sock/${this.userId}`);
        
        // 监听连接打开事件
        this.socket.onopen = () => {
          this.isConnected = true;
          this.addLog(`已连接到服务器，用户 ID: ${this.userId}`);
          // 连接成功后清空可用用户列表
          this.availableUsers = [];
        };
        
        // 监听消息接收事件
        this.socket.onmessage = (event) => {
          const message = event.data;
          this.addLog(`收到消息: ${message}`);
          console.log(`收到消息: ${message}`);
          
          // 解析可用用户列表
          if (message.includes('<UNK>')) {
            this.parseAvailableUsers(message);
          }
        };
        
        // 监听连接关闭事件
        this.socket.onclose = () => {
          this.isConnected = false;
          this.addLog('连接已关闭');
          this.socket = null;
          // 连接关闭后清空可用用户列表
          this.availableUsers = [];
        };
        
        // 监听错误事件
        this.socket.onerror = (error) => {
          this.addLog(`WebSocket 错误: ${error}`);
        };
      } catch (error) {
        this.addLog(`连接失败: ${error}`);
      }
    },
    
    // 断开 WebSocket 连接
    disconnect() {
      if (this.socket) {
        this.socket.close();
      }
    },
    
    // 发送匹配请求
    sendPing() {
      if (this.socket) {
        this.socket.send('pp');
        this.addLog('发送匹配请求 (pp)');
      }
    },
    
    // 发送连接请求
    sendLink() {
      if (this.socket && this.selectedUserId) {
        this.socket.send(`link***********${this.selectedUserId}`);
        this.addLog(`发送连接请求到用户 ${this.selectedUserId}`);
      }
    },
    
    // 发送普通消息
    sendMessage() {
      if (this.socket && this.message) {
        this.socket.send(this.message);
        this.addLog(`发送消息: ${this.message}`);
        this.message = '';
      }
    },
    
    // 解析可用用户列表
    parseAvailableUsers(message) {
      try {
        // 提取用户 ID
        const newUsers = message.split('<UNK>')
          .map(user => user.trim())
          .filter(user => user && !isNaN(user))
          .map(Number)
          // 过滤掉自身ID
          .filter(user => user !== this.userId);
        
        // 合并新用户到现有列表中，确保唯一性
        this.availableUsers = [...new Set([...this.availableUsers, ...newUsers])];
        
        this.addLog(`新增可用用户: ${newUsers.join(', ')}`);
        this.addLog(`当前可用用户: ${this.availableUsers.join(', ')}`);
      } catch (error) {
        this.addLog(`解析用户列表失败: ${error}`);
      }
    },
    
    // 添加日志
    addLog(message) {
      const timestamp = new Date().toLocaleTimeString();
      this.logs.unshift(`[${timestamp}] ${message}`);
      
      // 限制日志数量
      if (this.logs.length > 50) {
        this.logs.pop();
      }
    }
  },
  
  // 组件销毁时关闭 WebSocket 连接
  beforeDestroy() {
    this.disconnect();
  }
}
</script>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.connection, .actions {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.status {
  margin-left: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.connected {
  background-color: #d4edda;
  color: #155724;
}

.disconnected {
  background-color: #f8d7da;
  color: #721c24;
}

.logs {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
}

.log-item {
  margin-bottom: 5px;
  padding: 5px;
  border-bottom: 1px solid #eee;
}
</style>    