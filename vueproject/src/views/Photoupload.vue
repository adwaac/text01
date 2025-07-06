<template>
  <div class="photo-upload-container">
    <h2>选择照片</h2>
    <div class="upload-box">
      <input
        type="file"
        ref="fileInput"
        @change="handleFileChange"
        accept="image/*"
        style="display: none"
      />
      <el-button type="primary" @click="triggerFileInput">选择照片</el-button>
      
      <!-- 预览区域 -->
      <div v-if="previewUrl" class="preview-area">
        <img :src="previewUrl" alt="预览图" class="preview-image" />
      </div>

      <div v-if="selectedFile" class="file-info">
        <p>已选择文件: {{ selectedFile.name }}</p>
        <p>文件大小: {{ formatFileSize(selectedFile.size) }}</p>
      </div>

      <el-button
        type="success"
        :disabled="!selectedFile"
        @click="confirmSelection"
        style="margin-top: 20px"
      >
        确认选择
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Photoupload',
  data() {
    return {
      selectedFile: null,
      previewUrl: null
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          this.$message.error('请选择图片文件')
          return
        }
        
        this.selectedFile = file
        
        // 创建预览URL
        this.previewUrl = URL.createObjectURL(file)
      }
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    confirmSelection() {
      if (this.selectedFile) {
        this.$emit('photo-selected', {
          file: this.selectedFile,
          previewUrl: this.previewUrl
        })
      }
    }
  },
  beforeDestroy() {
    // 组件销毁前清理预览URL
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl)
    }
  }
}
</script>

<style scoped>
.photo-upload-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.upload-box {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  margin-top: 20px;
}

.preview-area {
  margin: 20px auto;
  max-width: 300px;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.file-info {
  margin-top: 20px;
  text-align: left;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.file-info p {
  margin: 5px 0;
  color: #606266;
}
</style> 