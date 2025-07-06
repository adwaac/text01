<template>
    <div class="hello">
        <h1>欢迎来到 Vue 组件！</h1>
        <p>这是一个简单的 Vue 模板示例。</p>
        <button @click="count++">点击次数：{{ count }}</button>
    </div>
    aaaaaaaaaaa
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<style scoped>
.hello {
    text-align: center;
    margin-top: 40px;
}
button {
    margin-top: 20px;
    padding: 8px 16px;
    font-size: 16px;
}
</style>