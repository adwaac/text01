<template>
  <div class="bj">
    <div class="header">
      <div class="image-container">
        <img src="../assets/head.png" class="head" />
        <div class="image-text">· 棋谱设置 ·</div>
      </div>
    </div>
     
    <div class="content-container">
        <div class="separator-bar"></div>
      <div class="match-list-container">
        <div v-if="data" class="match-list">
          <div v-for="match in data" :key="match.id" class="match-item" @click="this.$router.push({ path: '/dd', query: { id: match.id } })">
            <div class="match-bg-left"></div>
            <div class="match-content">
              <div class="match-id">棋局ID: {{ match.id }}</div>
              <div class="match-players">
                <div class="player-info red-player">
                  <img v-if="match.redFlagAvatar" :src="match.redFlagAvatar" class="avatar" />
                  <img v-else src="../assets/mrtx.png" class="avatar" />
                  <span class="player-name">{{ match.redFlagName || '红方' }}</span>
                </div>
                <div class="vs">VS</div>
                <div class="player-info black-player">
                  <span class="player-name">{{ match.blackFlagName || '黑方' }}</span>
                  <img v-if="match.blackFlagAvatar" :src="match.blackFlagAvatar" class="avatar" />
                  <img v-else src="../assets/mrtx.png" class="avatar" />
                </div>
              </div>
              <div class="match-status">
                状态: {{ getStatusText(match.status) }}
              </div>
            </div>
            <div class="match-bg-right"></div>
          </div>
        </div>
        <div v-else class="no-data">
          暂无棋局数据
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      data: null
    };
  },
  created() {
    this.axiosGet();
  },
  methods: {
    getStatusText(status) {
      const statusMap = {
        0: '未开始',
        1: '对局中',
        2: '已结束',
        3: '异常',
        4: '未知',
      };
      return statusMap[status] || '未知状态';
    },
    getVictoryText(party) {
      const victoryMap = {
        0: '红方胜',
        1: '黑方胜',
        2: '和棋',
        4: '红方弃权',
      };
      return victoryMap[party] || '未知结果';
    },//params: {lobbyDisplay: 1,round: 10,unfinished: 0, top: 1,pageSize: 30,pageNum: 1,}
    axiosGet() {//https://wisdomchess.chandakeji.com/api/work/record/playerList
      axios.get('http://localhost:8080/Wc/getr')
      .then((response) => {
        console.log('ccList数据请求成功');
        console.log(response.data);
        this.data = response.data;
        console.log('this.data');
        console.log(this.data);
      })
      .catch((error) => {
        console.error('数据请求失败，使用本地默认数据', error);
      });
    },
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
}

.bj {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('../assets/bj.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 20px;
  text-align: center;
  flex-shrink: 0;
}

.image-container {
  position: relative;
  display: inline-block;
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

.head {
  background-image: url('../assets/head.png');  
  object-fit: cover;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 20px 20px;
  overflow: hidden;
}


.match-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.match-item {
  display: flex;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.match-bg-left {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-image: url('../assets/bj.png');
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.match-bg-right {
  position: absolute;
  right: 0;
  top: 0;
  width: 100px;
  height: 100%;
  background-image: url('../assets/jsbj_s.png');
  background-size: cover;
  background-position: center;
  z-index: 2;
}

.match-content {
  position: relative;
  z-index: 3;
  width: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.match-id {
  font-weight: bold;
  margin-bottom: 5px;
  color: #fff;
  font-size: 14px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.match-players {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}

.player-info {
  display: flex;
  align-items: center;
  max-width: 45%;
}

.red-player {
  color: #ff4d4f;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.black-player {
  color: #333;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
}

.player-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
  font-weight: bold;
}

.vs {
  margin: 0 10px;
  font-weight: bold;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin: 0 8px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.avatar-placeholder {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.red-player .avatar-placeholder {
  background-color: #ff4d4f;
  color: white;
}

.black-player .avatar-placeholder {
  background-color: #333;
  color: white;
}

.match-status {
  font-size: 14px;
  color: #fff;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.no-data {
  text-align: center;
  color: #fff;
  padding: 20px;
  font-size: 16px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}


/* 棕色横条样式（覆盖背景图） */
.separator-bar {
  width: 90%; /* 与 match-list-container 同宽 */
  height: 20px;
  background-color: #8B4513; /* 棕色 */
  border-radius: 5px 5px 0 0; /* 顶部圆角 */
  margin: 0 auto; /* 水平居中 */
  position: relative;
  z-index: 2; /* 确保横条在背景图之上 */
  top: 5px; /* 向下偏移 5px，覆盖背景图 */
}

/* 调整 match-list-container 的样式 */
.match-list-container {
  background-image: url('../assets/bj.png');
  border-radius: 0 0 5px 5px; /* 仅底部圆角 */
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  margin: -5px auto 0; /* 上移 5px，与横条贴合 */
  width: 90%;
  max-width: 900px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  position: relative;
  z-index: 1; /* 确保背景图在横条下方 */
}

.match-list-container::-webkit-scrollbar {
  display: none;
}
</style>