<template>
    <div class="role-selector">
        <h2>角色选择</h2>
        <div class="selector-container">
            <div class="left-container">
                <h3>角色</h3>
                <transition-group name="role-transition" tag="ul">
                    <li
                        v-for="role in availableRoles"
                        :key="role.value"
                        :class="{ 'role-card': true }"
                        @click="moveToSelected(role.value)"
                    >
                        <div class="role-avatar">{{ role.label.charAt(0) }}</div>
                        <div class="role-info">
                            <div class="role-name">{{ role.label }}</div>
                            <div class="role-description">{{ role.description }}</div>
                        </div>
                    </li>
                </transition-group>
            </div>
            
            <div class="middle-actions">
                <button v-if="selectedRoles.length > 0" @click="moveAllToAvailable">
                    <i class="fas fa-undo"></i> 全部取消
                </button>
            </div>
            
            <div class="right-container">
                <h3>已选</h3>
                <transition-group name="role-transition" tag="ul">
                    <li
                        v-for="role in selectedRoles"
                        :key="role.value"
                        :class="{ 'role-card selected': true }"
                        @click="moveToAvailable(role.value)"
                    >
                        <div class="role-avatar">{{ role.label.charAt(0) }}</div>
                        <div class="role-info">
                            <div class="role-name">{{ role.label }}</div>
                            <div class="role-description">{{ role.description }}</div>
                        </div>
                        <i class="fas fa-times" @click.stop="moveToAvailable(role.value)"></i>
                    </li>
                </transition-group>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const allRoles = ref([
    { label: 'aa', value: 'a', description: 'a' },
    { label: 'bb', value: 'b', description: 'b' },
    { label: 'cc', value: 'c', description: 'c' },
    { label: 'dd', value: 'd', description: 'd' },
    { label: 'ee', value: 'e', description: 'e' }
])

// 已选
const selectedRoleValues = ref([])

// 未选
const availableRoles = computed(() => {
    return allRoles.value.filter(role => !selectedRoleValues.value.includes(role.value))
})

// 已选
const selectedRoles = computed(() => {
    return allRoles.value.filter(role => selectedRoleValues.value.includes(role.value))
})

// 移动到已选
function moveToSelected(roleValue) {
    if (!selectedRoleValues.value.includes(roleValue)) {
        selectedRoleValues.value.push(roleValue)
    }
}

// 移动到可选
function moveToAvailable(roleValue) {
    const index = selectedRoleValues.value.indexOf(roleValue)
    if (index !== -1) {
        selectedRoleValues.value.splice(index, 1)
    }
}

// 全部移动到可选
function moveAllToAvailable() {
    selectedRoleValues.value = []
}
</script>

<style scoped>
.role-selector {
    max-width: 800px;
    margin: 40px auto;
    padding: 24px;
    border: 1px solid #eee;
    border-radius: 8px;
    background: #fafbfc;
}

.selector-container {
    display: flex;
    gap: 20px;
    margin-top: 20px;
}

.left-container, .right-container {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    background: #f9f9f9;
}

h3 {
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    color: #555;
}

ul {
    list-style: none;
    padding: 0;
    margin-top: 15px;
}

.role-card {
    padding: 12px 16px;
    margin-bottom: 12px;
    border-radius: 8px;
    cursor: pointer;
    background: #fff;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
}

.role-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f0f2f5;
    color: #409eff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    flex-shrink: 0;
}

.role-info {
    flex-grow: 1;
    min-width: 0;
}

.role-name {
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
}

.role-description {
    font-size: 12px;
    color: #606266;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.role-card:hover {
    background: #f5f7fa;
    border-color: #c0c4cc;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* 角色卡片过渡动画 */
.role-transition-enter-active,
.role-transition-leave-active {
    transition: all 0.3s ease;
}

.role-transition-enter-from,
.role-transition-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
}

.role-transition-leave-active {
    position: absolute;
}

.role-card.selected {
    background: #409eff;
    color: #fff;
    border-color: #3a8ee6;
}

.role-card.selected:hover {
    background: #3a8ee6;
}

.middle-actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 15px;
}

button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #fff;
    color: #409eff;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
}

button:hover {
    background: #f0f5ff;
    transform: translateY(-2px);
}

button:active {
    transform: translateY(1px);
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

i {
    pointer-events: none;
}
</style>