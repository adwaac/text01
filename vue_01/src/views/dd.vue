<script setup>
import axios from 'axios';
import { useRoute } from 'vue-router';
import { ref, onMounted, computed, watch } from 'vue';

const route = useRoute();
const rowarr = Array.from({ length: 10 }, (_, i) => i).reverse();
const colarr = Array.from({ length: 9 }, (_, i) => i);
const list = ref([]);
const act = ref(0);

// 计算当前步骤的棋谱项，处理chessboardContent的解析
const actItem = computed(() => {
  if (act.value >= list.value.length) {
    return null;
  }
  
  const item = list.value[act.value];
  if (!item) return null;
  
  // 解析chessboardContent字符串为JSON数组
  try {
    if (typeof item.chessboardContent === 'string') {
      item.parsedChessboardContent = JSON.parse(item.chessboardContent);
    }
    return item;
  } catch (error) {
    console.error('解析chessboardContent失败', error);
    ElMessage.error('棋谱数据解析失败');
    return null;
  }
});

onMounted(() => {
  axios.get('http://localhost:8080/Wc/getd', {
    params: {
      battleRecordId: route.query.id,
    }
  }).then(res => {
    console.log('battleRecordId:', route.query.id);
    console.log('dd获取棋谱数据成功');
    console.log(res.data);
    
    // 处理获取到的列表数据，提前解析chessboardContent
    if (Array.isArray(res.data)) {
      list.value = res.data.map(item => {
        if (item && typeof item.chessboardContent === 'string') {
          try {
            item.parsedChessboardContent = JSON.parse(item.chessboardContent);
          } catch (error) {
            console.error('解析棋谱数据失败', error);
            ElMessage.error('棋谱数据解析失败');
          }
        }
        return item;
      });
    } else {
      list.value = [res.data]; // 如果返回的不是数组，包装成数组
    }
    
    console.log('棋谱数据:', list.value);
  }).catch(error => {
    console.error('获取棋谱数据失败', error);
    ElMessage.error('获取棋谱数据失败');
  });
});

// 修改getChess方法，使用解析后的parsedChessboardContent
const getChess = (row, col) => {
  if (!actItem.value || !actItem.value.parsedChessboardContent) {
    return null;
  }
  
  const chessInfo = actItem.value.parsedChessboardContent.find(item => 
    item.endPosition && item.endPosition[0] == col && item.endPosition[1] == row
  );
  return chessInfo;
};

function getImg(chess) {
  if (!chess) return '';
  const imgurl = chess.pieces.replace(/\d+/g, '') + '.png';
  return `/${imgurl}`;
}

// 监听list变化，重置act
watch(() => list.value, () => {
  act.value = 0;
});

// 自动播放棋谱
let intervalId = null;
onMounted(() => {
  startAutoPlay();
});

// 组件卸载时清除定时器
const beforeUnmount = () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};

function startAutoPlay() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(() => {
    if (act.value < list.value.length - 1) {
      act.value++;
    }
  }, 1000);
}

// 暂停自动播放
function pauseAutoPlay() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
</script>

<template>
  <div class="header">
    <div class="image-container">
      <img src="/head.png" class="head" />
      <div class="image-text">· 棋谱设置 ·</div>
    </div>
  </div>

  <div class="play-chess-container">
    <div class="chess-chessboard-container">
      <div class="chess-chess-grid-container">
        <div class="chess-row-container" v-for="row in rowarr" :key="row">
          <div class="chess-col-container" v-for="col in colarr" :key="col">
            <div class="chess-info" v-if="getChess(row, col)">
              <img :src="getImg(getChess(row, col))" style="" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chess-history-container">
      <div v-for="(item, index) in list" :key="index" 
           class="move-item" 
           :class="{ 'act-move': index === act }"
           @click="() => { act.value = index; pauseAutoPlay(); }">
        {{ item.chessPieceTrend || '第' + (index + 1) + '步' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-container {
  position: relative;
  display: inline-block;
}
.header {
  padding: 20px;
  text-align: center;
  flex-shrink: 0;
  z-index: 10;
  position: relative;
}
.image-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgb(23, 1, 1);
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
.play-chess-container{
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  background-image: url('/bj.png');
  background-size: cover;
  justify-content: center;
  align-items: center;
}
.chess-chessboard-container {
  position: relative;
  top: 50px;
  width: 476px;
  height: 572px;
  background-image: url('/qpbj.jpg');
  background-size: 100% 100%;
}
.chess-chess-grid-container{
  background-image: url('/qp_x.jpg');
  background-size: 450px 545px;
  background-repeat: no-repeat;
  height: 100%;
  width: 100%;
  background-position: center;
  display: flex;
  flex-direction: column;
}
.chess-row-container {
  flex-grow: 1;
  display: flex;
  height: 50px;
}
.chess-col-container {
  flex-grow: 1;
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.chess-info{
  height: 100%;
  width: 100%;
  
  display: flex;
  justify-content: center;
  align-items: center;
}
.chess-info img {
  width: 70%;
  height: 70%;
}
.chess-history-container {
  position: relative;
  top: 50px;
  width: 308px;
  height: 572px;
  background-image: url('/his.png');
  margin-left: 30px;
  background-size: 100% 100%;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.chess-history-container::-webkit-scrollbar {
  display: none;
}
.move-item {
  color: white;
  font-size: 14px;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;
}
.act-move {
  background-color: rgba(255, 215, 0, 0.5);
  font-weight: bold;
  transform: scale(1.02);
}
</style>