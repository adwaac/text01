<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold">用户列表</h1>
      <button
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        @click="showAddModal = true"
      >
        添加用户
      </button>
    </div>
    <div v-if="users.length > 0" class="overflow-x-auto">
      <table class="min-w-full border-collapse border border-gray-300 divide-y divide-gray-300 rounded-md shadow-md">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-6 py-3">#</th>
            <th v-for="key in headerKeys" :key="key" class="border border-gray-300 px-6 py-3">
              {{ key }}
            </th>
            <th class="border border-gray-300 px-6 py-3">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in users" :key="user.userId" class="hover:bg-gray-50 transition-colors duration-200">
            <td class="border border-gray-300 px-6 py-3 text-center">{{ index + 1 }}</td>
            <td v-for="(value, key) in user" :key="key" class="border border-gray-300 px-6 py-3">
              <template v-if="editableFields[user.userId] && ['password', 'userName', 'userImg'].includes(key)">
                <input
                  type="text"
                  :value="value"
                  @input="handleInputChange(user.userId, key, $event.target.value)"
                  class="border border-gray-300 px-2 py-1 w-full rounded-md"
                />
              </template>
              <template v-else>
                <span @click="toggleEdit(user.userId, key)">{{ value }}</span>
              </template>
            </td>
            <td class="border border-gray-300 px-6 py-3">
              <template v-if="editableFields[user.userId]">
                <button
                  class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
                  @click="saveChanges(user.userId)"
                >
                  保存
                </button>
                <button
                  class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                  @click="cancelEdit(user.userId)"
                >
                  取消
                </button>
              </template>
              <template v-else>
                <button
                  class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  @click="deleteUser(user.userId)"
                >
                  删除
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="text-gray-500">暂无数据</p>
    <div v-if="deleteError" class="text-red-500 mt-4">删除失败，请稍后重试。</div>

    <!-- 添加用户弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
      <div class="bg-white p-8 rounded-md shadow-md w-96">
        <h2 class="text-2xl font-bold mb-4">添加用户</h2>
        <div class="mb-4">
          <label for="userid" class="block text-gray-700 font-bold mb-2">用户 ID</label>
          <input
            type="text"
            id="userid"
            v-model="newUser.userid"
            class="border border-gray-300 px-4 py-2 w-full rounded-md"
          />
        </div>
        <div class="mb-4">
          <label for="username" class="block text-gray-700 font-bold mb-2">用户名</label>
          <input
            type="text"
            id="username"
            v-model="newUser.username"
            class="border border-gray-300 px-4 py-2 w-full rounded-md"
          />
        </div>
        <div class="mb-4">
          <label for="password" class="block text-gray-700 font-bold mb-2">密码</label>
          <input
            type="password"
            id="password"
            v-model="newUser.password"
            class="border border-gray-300 px-4 py-2 w-full rounded-md"
          />
        </div>
        <div class="mb-4">
          <label for="usersex" class="block text-gray-700 font-bold mb-2">性别</label>
          <input
            type="text"
            id="usersex"
            v-model="newUser.usersex"
            class="border border-gray-300 px-4 py-2 w-full rounded-md"
          />
        </div>
        <div class="mb-4">
          <label for="status" class="block text-gray-700 font-bold mb-2">状态</label>
          <input
            type="text"
            id="status"
            v-model="newUser.status"
            class="border border-gray-300 px-4 py-2 w-full rounded-md"
          />
        </div>
        <div class="flex justify-end">
          <button
            class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2"
            @click="showAddModal = false"
          >
            取消
          </button>
          <button
            class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            @click="addUser"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const users = ref([]);
const headerKeys = ref([]);
const deleteError = ref(false);
const showAddModal = ref(false);
const newUser = ref({
  userid: '',
  username: '',
  password: '',
  usersex: '',
  status: ''
});
const editableFields = ref({});
const tempUserValues = ref({});

const fetchUsers = async () => {
  try {
    const response = await axios.post('http://localhost:8080/a1/UserController/selectall', {});
    console.log('响应数据:', response.data);
    if (Array.isArray(response.data)) {
      const validUsers = response.data.filter(user => {
        const hasId = user.userId;
        const hasName = user.userName;
        if (!hasId || !hasName) {
          console.warn('数据对象缺少必要属性:', user);
        }
        return hasId && hasName;
      });
      users.value = validUsers;
      if (validUsers.length > 0) {
        headerKeys.value = Object.keys(validUsers[0]);
      }
    } else {
      console.error('响应数据不是数组类型:', response.data);
    }
    console.log('赋值后的 users:', users.value);
  } catch (error) {
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('没有收到响应:', error.request);
    } else {
      console.error('设置请求时出错:', error.message);
    }
    console.error('获取用户数据时出错:', error.config);
  }
};

const deleteUser = async (userId) => {
  console.log('准备删除用户，userId:', userId);
  try {
    const url = `http://localhost:8080/a1/UserController/delbyid?userid=${userId}`;
    const response = await axios.post(url);
    console.log('删除用户响应状态:', response.status);
    console.log('删除用户响应数据:', response.data);
    if (response.data === 0) {
      deleteError.value = true;
    } else {
      deleteError.value = false;
      // 从本地数据中移除已删除的用户
      users.value = users.value.filter(user => user.userId !== userId);
    }
  } catch (error) {
    deleteError.value = true;
    if (error.response) {
      console.error('删除用户时响应状态:', error.response.status);
      console.error('删除用户时响应数据:', error.response.data);
    } else if (error.request) {
      console.error('删除用户时没有收到响应:', error.request);
    } else {
      console.error('删除用户时设置请求出错:', error.message);
    }
    console.error('删除用户时出错:', error.config);
  }
};

const addUser = async () => {
  console.log('准备添加用户，请求参数:', newUser.value);
  try {
    const queryParams = new URLSearchParams(newUser.value).toString();
    const url = `http://localhost:8080/a1/UserController/useadd?${queryParams}`;
    const response = await axios.post(url);
    console.log('添加用户响应状态:', response.status);
    console.log('添加用户响应数据:', response.data);
    if (response.data) {
      showAddModal.value = false;
      // 清空输入框
      newUser.value = {
        userid: '',
        username: '',
        password: '',
        usersex: '',
        status: ''
      };
      // 重新获取用户列表
      await fetchUsers();
    }
  } catch (error) {
    console.error('添加用户时出错:', error);
    console.error('添加用户时响应状态:', error.response?.status);
    console.error('添加用户时响应数据:', error.response?.data);
  }
};

const toggleEdit = (userId, key) => {
  if (!editableFields.value[userId]) {
    tempUserValues.value[userId] = { ...users.value.find(user => user.userId === userId) };
  }
  editableFields.value[userId] = true;
};

const handleInputChange = (userId, key, value) => {
  tempUserValues.value[userId][key] = value;
};

const saveChanges = async (userId) => {
  try {
    const userToUpdate = tempUserValues.value[userId];
    const queryParams = new URLSearchParams({
      userid: userToUpdate.userId,
      password: userToUpdate.password,
      username: userToUpdate.userName,
      userimg: userToUpdate.userImg
    }).toString();
    const url = `http://localhost:8080/a1/UserController/update?${queryParams}`;
    const response = await axios.post(url);
    console.log('更新用户响应状态:', response.status);
    console.log('更新用户响应数据:', response.data);
    if (response.data) {
      const index = users.value.findIndex(user => user.userId === userId);
      users.value[index] = { ...userToUpdate };
      cancelEdit(userId);
      // 重新获取用户列表
      await fetchUsers();
    }
  } catch (error) {
    console.error('更新用户时出错:', error);
    console.error('更新用户时响应状态:', error.response?.status);
    console.error('更新用户时响应数据:', error.response?.data);
  }
};

const cancelEdit = (userId) => {
  delete editableFields.value[userId];
  delete tempUserValues.value[userId];
};

onMounted(() => {
  fetchUsers();
});
</script>   