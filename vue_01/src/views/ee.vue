<template>
  <div class="bg-gray-100 min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- 连接状态和控制 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-800">MQTT消息测试工具</h2>
          <div class="flex items-center">
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
            >
              <span class="w-2 h-2 mr-1.5 rounded-full" :class="isConnected ? 'bg-green-500' : 'bg-gray-500'"></span>
              {{ isConnected ? '已连接' : '未连接' }}
            </span>
            <button 
              @click="toggleConnection"
              class="ml-3 px-4 py-2 text-sm font-medium rounded-md"
              :class="isConnected ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'"
            >
              {{ isConnected ? '断开连接' : '连接MQTT' }}
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">MQTT服务器</label>
            <input 
              v-model="mqttUrl" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">HTTP API地址</label>
            <input 
              v-model="httpUrl" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
        </div>
      </div>
      
      <!-- 发送消息区域 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">发送消息</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">主题</label>
            <input 
              v-model="topic" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">QoS</label>
            <select 
              v-model.number="qos" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>
          <div class="flex items-end">
            <label class="inline-flex items-center">
              <input type="checkbox" v-model="retained" class="form-checkbox h-5 w-5 text-blue-600">
              <span class="ml-2 text-sm text-gray-700">保留消息</span>
            </label>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">消息内容</label>
          <textarea 
            v-model="message" 
            rows="3" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        <button 
          @click="sendMessage" 
          :disabled="!isConnected"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
          发送消息
        </button>
      </div>
      
      <!-- 接收消息区域 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800">消息接收区</h3>
          <button 
            @click="clearMessages" 
            class="text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            清空消息
          </button>
        </div>
        <div class="bg-gray-50 rounded-md p-4 h-64 overflow-y-auto">
          <div v-if="messages.length === 0" class="text-center text-gray-400 py-8">
            <p>等待接收消息...</p>
          </div>
          <div 
            v-for="(msg, index) in messages" 
            :key="index" 
            class="mb-3 p-3 bg-white rounded-md shadow-sm"
          >
            <div class="flex justify-between items-center text-xs mb-1">
              <span class="font-medium text-blue-600">{{ msg.topic }}</span>
              <span class="text-gray-400">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <div class="text-sm break-all whitespace-pre-wrap">{{ msg.payload }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 提示框 -->
    <div 
      v-if="showToast" 
      class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 transform translate-y-20 opacity-0 transition-all duration-300 z-50 max-w-sm"
      :class="{ 'translate-y-0 opacity-100': showToast }"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0 pt-0.5">
          <i :class="toastType === 'success' ? 'fa fa-check-circle text-green-500 text-xl' : 'fa fa-exclamation-circle text-red-500 text-xl'"></i>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-gray-900">{{ toastTitle }}</h3>
          <div class="mt-1 text-sm text-gray-500">{{ toastMessage }}</div>
        </div>
        <button @click="hideToast" class="ml-auto flex-shrink-0 p-1 text-gray-400 hover:text-gray-600">
          <i class="fa fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Paho from 'paho-mqtt';

export default {
  setup() {
    // 状态变量
    const mqttUrl = ref('tcp://49.233.202.150:1883');
    const httpUrl = ref('http://localhost:8805/sendm');
    const clientId = ref(`mqtt-test-client-${Math.random().toString(36).substring(2, 8)}`);
    const username = ref('');
    const password = ref('');
    const isConnected = ref(false);
    const mqttClient = ref(null);
    
    const topic = ref('test/topic');
    const qos = ref(1);
    const retained = ref(false);
    const message = ref('Hello, MQTT!');
    
    const messages = ref([]);
    const showToast = ref(false);
    const toastTitle = ref('');
    const toastMessage = ref('');
    const toastType = ref('success');
    
    // 连接/断开MQTT服务器
    const toggleConnection = () => {
      if (isConnected.value) {
        // 断开连接
        if (mqttClient.value) {
          mqttClient.value.disconnect();
          isConnected.value = false;
          showToastMessage('断开连接', '已成功断开与MQTT服务器的连接', 'success');
        }
      } else {
        // 连接服务器
        try {
          // 解析MQTT URL
          const urlParts = mqttUrl.value.split('://');
          if (urlParts.length !== 2) {
            showToastMessage('连接失败', '无效的MQTT服务器URL格式，请使用 tcp://服务器IP:端口', 'error');
            return;
          }
          
          const protocol = urlParts[0];
          const hostAndPort = urlParts[1].split(':');
          const host = hostAndPort[0];
          let port = hostAndPort.length > 1 ? parseInt(hostAndPort[1]) : 1883;
          
          // 转换为WebSocket连接
          const wsProtocol = protocol === 'tcp' ? 'ws' : 'wss';
          const wsPort = protocol === 'tcp' ? 8083 : 8084;
          
          // 创建MQTT客户端
          mqttClient.value = new Paho.Client(
            host,
            wsPort,
            clientId.value
          );
          
          // 设置回调
          mqttClient.value.onConnectionLost = onConnectionLost;
          mqttClient.value.onMessageArrived = onMessageArrived;
          
          // 连接选项
          const options = {
            timeout: 3,
            useSSL: wsProtocol === 'wss',
            onSuccess: onConnect,
            onFailure: onConnectFailure
          };
          
          // 如果有用户名和密码，则添加到连接选项
          if (username.value) {
            options.userName = username.value;
            if (password.value) options.password = password.value;
          }
          
          // 开始连接
          mqttClient.value.connect(options);
          showToastMessage('连接中', `正在连接到MQTT服务器: ${wsProtocol}://${host}:${wsPort}`, 'success');
        } catch (error) {
          showToastMessage('连接失败', `连接MQTT服务器时发生错误: ${error.message}`, 'error');
          console.error('连接错误:', error);
        }
      }
    };
    
    // 连接成功回调
    const onConnect = () => {
      isConnected.value = true;
      showToastMessage('连接成功', '已成功连接到MQTT服务器', 'success');
      
      // 自动订阅topic2
      if (mqttClient.value) {
        mqttClient.value.subscribe('test/topic2', { qos: 1 });
        addMessage('系统消息', '已自动订阅 test/topic2');
      }
    };
    
    // 连接失败回调
    const onConnectFailure = (responseObject) => {
      isConnected.value = false;
      showToastMessage('连接失败', `连接MQTT服务器失败: ${responseObject.errorMessage}`, 'error');
      console.error('连接失败:', responseObject);
    };
    
    // 连接丢失回调
    const onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        isConnected.value = false;
        showToastMessage('连接丢失', `与MQTT服务器的连接已断开: ${responseObject.errorMessage}`, 'error');
        addMessage('系统消息', `与MQTT服务器的连接已断开: ${responseObject.errorMessage}`);
      }
    };
    
    // 消息到达回调
    const onMessageArrived = (message) => {
      addMessage(message.destinationName, message.payloadString);
    };
    
    // 添加消息
    const addMessage = (topic, payload) => {
      messages.value.push({
        topic,
        payload,
        timestamp: new Date()
      });
      
      // 限制消息数量，避免内存溢出
      if (messages.value.length > 100) {
        messages.value.shift();
      }
    };
    
    // 发送消息
    const sendMessage = async () => {
      if (!isConnected.value) {
        showToastMessage('发送失败', '请先连接到MQTT服务器', 'error');
        return;
      }
      
      if (!topic.value) {
        showToastMessage('发送失败', '主题不能为空', 'error');
        return;
      }
      
      if (!message.value) {
        showToastMessage('发送失败', '消息内容不能为空', 'error');
        return;
      }
      
      try {
        // 构建请求URL
        const queryParams = new URLSearchParams({
          qos: qos.value,
          retained: retained.value,
          topic: topic.value,
          message: message.value
        });
        
        const requestUrl = `${httpUrl.value}?${queryParams}`;
        
        // 发送请求
        const response = await fetch(requestUrl);
        const data = await response.text();
        
        if (response.ok && data.includes('成功')) {
          showToastMessage('发送成功', `消息已发送到主题: ${topic.value}`, 'success');
          addMessage(`[已发送] ${topic.value}`, message.value);
        } else {
          showToastMessage('发送失败', `服务器返回错误: ${data}`, 'error');
        }
      } catch (error) {
        showToastMessage('发送失败', `发送消息时发生错误: ${error.message}`, 'error');
        console.error('发送消息错误:', error);
      }
    };
    
    // 清空消息
    const clearMessages = () => {
      messages.value = [];
    };
    
    // 显示提示框
    const showToastMessage = (title, message, type = 'success') => {
      toastTitle.value = title;
      toastMessage.value = message;
      toastType.value = type;
      showToast.value = true;
      
      // 3秒后自动关闭
      setTimeout(hideToast, 3000);
    };
    
    // 隐藏提示框
    const hideToast = () => {
      showToast.value = false;
    };
    
    // 格式化时间
    const formatTime = (date) => {
      const d = new Date(date);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    };
    
    // 组件挂载时初始化
    onMounted(() => {
      // 自动连接
      toggleConnection();
    });
    
    // 组件卸载前清理
    onBeforeUnmount(() => {
      if (mqttClient.value && isConnected.value) {
        mqttClient.value.disconnect();
      }
    });
    
    return {
      mqttUrl,
      httpUrl,
      clientId,
      username,
      password,
      isConnected,
      topic,
      qos,
      retained,
      message,
      messages,
      showToast,
      toastTitle,
      toastMessage,
      toastType,
      toggleConnection,
      sendMessage,
      clearMessages,
      formatTime
    };
  }
};
</script>

<style scoped>
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>