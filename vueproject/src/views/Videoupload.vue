<template>
  <div class="upload-container">
    <el-form :model="form" label-width="120px">
      <el-form-item label="上传视频">
        <el-upload
          class="upload-demo"
          action="#"
          :auto-upload="false"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :limit="1"
          accept="video/*"
        >
          <el-button type="primary">选择视频</el-button>
          <template #tip>
            <div class="el-upload__tip">
              只能上传视频文件，且不超过100MB
            </div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="submitUpload" :disabled="!fileList.length">开始上传</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const props = defineProps({
  strategyId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['upload-success', 'upload-cancel'])

const fileList = ref([])
const form = ref({
  id: props.strategyId
})

const handleChange = (file) => {
  fileList.value = [file]
}

const handleRemove = () => {
  fileList.value = []
}

const handleCancel = () => {
  emit('upload-cancel')
}

const submitUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.error('请选择要上传的视频')
    return
  }

  const file = fileList.value[0].raw
  const isVideo = file.type.startsWith('video/')
  const isLt100M = file.size / 1024 / 1024 < 100

  if (!isVideo) {
    ElMessage.error('只能上传视频文件!')
    return
  }
  if (!isLt100M) {
    ElMessage.error('视频大小不能超过 100MB!')
    return
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('id', props.strategyId)

  try {
    const response = await axios.post('http://localhost:8080/a1/UploadController/Videoupload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data && response.data.saveName) {
      ElMessage.success('上传成功')
      emit('upload-success', response.data.saveName)
      fileList.value = []
    } else {
      ElMessage.error('上传失败：未获取到视频名称')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败: ' + error.message)
  }
}
</script>

<style scoped>
.upload-container {
  padding: 20px;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 7px;
}
</style>