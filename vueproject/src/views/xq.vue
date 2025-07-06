<template>
  <div class="chess-board-container">
    <div class="chess-board" @click="handleClick">
      <div 
        v-for="(row, rowIndex) in 10" 
        :key="`row-${rowIndex}`" 
        class="chess-row"
      >
        <div 
          v-for="(col, colIndex) in 9" 
          :key="`col-${colIndex}`" 
          class="chess-cell"
          :class="{ 'red-turn': currentPlayer === 'red', 'black-turn': currentPlayer === 'black' }"
          :style="{ 
            left: `${colIndex * cellSize}px`, 
            top: `${rowIndex * cellSize}px`,
            width: `${cellSize}px`,
            height: `${cellSize}px`
          }"
        >
          <!-- 绘制棋盘线条 -->
          <div class="cell-lines" :style="{ width: `${cellSize}px`, height: `${cellSize}px` }">
            <!-- 横线和竖线由CSS处理 -->
          </div>
          
          <!-- 绘制棋子 -->
          <div 
            v-if="board[rowIndex][colIndex]" 
            class="chess-piece"
            :class="[
              board[rowIndex][colIndex].color === 'red' ? 'red-piece' : 'black-piece',
              board[rowIndex][colIndex].selected ? 'selected-piece' : ''
            ]"
            :style="{
              transform: `translate(${-cellSize/2}px, ${-cellSize/2}px)`,
              width: `${cellSize * 0.8}px`,
              height: `${cellSize * 0.8}px`,
              lineHeight: `${cellSize * 0.8}px`,
              fontSize: `${cellSize * 0.4}px`
            }"
            @click.stop="selectPiece(rowIndex, colIndex)"
          >
            {{ board[rowIndex][colIndex].name }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 游戏信息和控制 -->
    <div class="game-info">
      <div class="turn-indicator">
        当前回合: <span :class="currentPlayer === 'red' ? 'text-red-600' : 'text-black'">{{ currentPlayer === 'red' ? '红方' : '黑方' }}</span>
      </div>
      <button class="restart-button" @click="restartGame">重新开始</button>
    </div>
    
    <!-- 游戏结果 -->
    <div v-if="gameOver" class="game-result">
      <div class="result-message">
        {{ winner === 'red' ? '红方胜利!' : '黑方胜利!' }}
      </div>
      <button class="play-again-button" @click="restartGame">再来一局</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChessBoard',
  data() {
    return {
      board: [],
      cellSize: 60, // 单元格大小（像素）
      selectedPiece: null,
      currentPlayer: 'red', // 红方先行
      gameOver: false,
      winner: null,
      // 记录每个棋子的移动规则
      pieceRules: {
        '帅': (fromRow, fromCol, toRow, toCol, board) => {
          // 帅/将只能在九宫格内移动，且每次只能移动一格
          const isInPalace = (row, col) => {
            if (board[fromRow][fromCol].color === 'red') {
              return row >= 7 && row <= 9 && col >= 3 && col <= 5;
            } else {
              return row >= 0 && row <= 2 && col >= 3 && col <= 5;
            }
          };
          
          const rowDiff = Math.abs(toRow - fromRow);
          const colDiff = Math.abs(toCol - fromCol);
          
          return isInPalace(toRow, toCol) && 
                 ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1));
        },
        '仕': (fromRow, fromCol, toRow, toCol, board) => {
          // 仕/士只能在九宫格内斜着走一格
          const isInPalace = (row, col) => {
            if (board[fromRow][fromCol].color === 'red') {
              return row >= 7 && row <= 9 && col >= 3 && col <= 5;
            } else {
              return row >= 0 && row <= 2 && col >= 3 && col <= 5;
            }
          };
          
          const rowDiff = Math.abs(toRow - fromRow);
          const colDiff = Math.abs(toCol - fromCol);
          
          return isInPalace(toRow, toCol) && rowDiff === 1 && colDiff === 1;
        },
        '相': (fromRow, fromCol, toRow, toCol, board) => {
          // 相/象走田字格，不能过河
          const rowDiff = Math.abs(toRow - fromRow);
          const colDiff = Math.abs(toCol - fromCol);
          
          // 检查是否走田字
          if (rowDiff !== 2 || colDiff !== 2) return false;
          
          // 检查是否过河
          if (board[fromRow][fromCol].color === 'red' && toRow < 5) return false;
          if (board[fromRow][fromCol].color === 'black' && toRow > 4) return false;
          
          // 检查绊象腿
          const legRow = (fromRow + toRow) / 2;
          const legCol = (fromCol + toCol) / 2;
          return !board[legRow][legCol];
        },
        '马': (fromRow, fromCol, toRow, toCol, board) => {
          // 马走日字，注意别马腿
          const rowDiff = Math.abs(toRow - fromRow);
          const colDiff = Math.abs(toCol - fromCol);
          
          // 检查是否走日字
          if (!((rowDiff === 1 && colDiff === 2) || (rowDiff === 2 && colDiff === 1))) return false;
          
          // 检查别马腿
          let legRow, legCol;
          if (rowDiff === 2) {
            legRow = fromRow + (toRow > fromRow ? 1 : -1);
            legCol = fromCol;
          } else {
            legRow = fromRow;
            legCol = fromCol + (toCol > fromCol ? 1 : -1);
          }
          
          return !board[legRow][legCol];
        },
        '车': (fromRow, fromCol, toRow, toCol, board) => {
          // 车走直线，不能跨越棋子
          if (fromRow !== toRow && fromCol !== toCol) return false;
          
          // 检查路径上是否有棋子
          if (fromRow === toRow) {
            // 水平移动
            const startCol = Math.min(fromCol, toCol) + 1;
            const endCol = Math.max(fromCol, toCol);
            for (let col = startCol; col < endCol; col++) {
              if (board[fromRow][col]) return false;
            }
          } else {
            // 垂直移动
            const startRow = Math.min(fromRow, toRow) + 1;
            const endRow = Math.max(fromRow, toRow);
            for (let row = startRow; row < endRow; row++) {
              if (board[row][fromCol]) return false;
            }
          }
          
          return true;
        },
        '炮': (fromRow, fromCol, toRow, toCol, board) => {
          // 炮的移动规则：无子时和车一样，吃子时需要一个炮架
          if (fromRow !== toRow && fromCol !== toCol) return false;
          
          const targetPiece = board[toRow][toCol];
          const hasPieceBetween = () => {
            let count = 0;
            
            if (fromRow === toRow) {
              // 水平移动
              const startCol = Math.min(fromCol, toCol) + 1;
              const endCol = Math.max(fromCol, toCol) - 1;
              for (let col = startCol; col <= endCol; col++) {
                if (board[fromRow][col]) count++;
              }
            } else {
              // 垂直移动
              const startRow = Math.min(fromRow, toRow) + 1;
              const endRow = Math.max(fromRow, toRow) - 1;
              for (let row = startRow; row <= endRow; row++) {
                if (board[row][fromCol]) count++;
              }
            }
            
            return count;
          };
          
          if (!targetPiece) {
            // 无子时移动规则和车一样
            return hasPieceBetween() === 0;
          } else {
            // 吃子时需要一个炮架
            return hasPieceBetween() === 1;
          }
        },
        '兵': (fromRow, fromCol, toRow, toCol, board) => {
          // 兵/卒过河前只能前进，过河后可以左右移动
          const rowDiff = toRow - fromRow;
          const colDiff = Math.abs(toCol - fromCol);
          const isRed = board[fromRow][fromCol].color === 'red';
          
          // 只能移动一格
          if (colDiff > 1 || Math.abs(rowDiff) > 1) return false;
          
          // 不能后退
          if (isRed && rowDiff > 0) return false;
          if (!isRed && rowDiff < 0) return false;
          
          // 未过河时只能前进
          if ((isRed && fromRow >= 5) || (!isRed && fromRow <= 4)) {
            return colDiff === 0 && rowDiff !== 0;
          }
          
          // 过河后可以左右移动
          return colDiff === 1 || rowDiff !== 0;
        }
      }
    };
  },
  mounted() {
    this.initializeBoard();
  },
  methods: {
    initializeBoard() {
      // 初始化棋盘
      this.board = Array(10).fill().map(() => Array(9).fill(null));
      
      // 设置黑方棋子
      this.board[0][0] = { name: '車', color: 'black', selected: false };
      this.board[0][1] = { name: '馬', color: 'black', selected: false };
      this.board[0][2] = { name: '象', color: 'black', selected: false };
      this.board[0][3] = { name: '仕', color: 'black', selected: false };
      this.board[0][4] = { name: '将', color: 'black', selected: false };
      this.board[0][5] = { name: '仕', color: 'black', selected: false };
      this.board[0][6] = { name: '象', color: 'black', selected: false };
      this.board[0][7] = { name: '馬', color: 'black', selected: false };
      this.board[0][8] = { name: '車', color: 'black', selected: false };
      this.board[2][1] = { name: '炮', color: 'black', selected: false };
      this.board[2][7] = { name: '炮', color: 'black', selected: false };
      this.board[3][0] = { name: '卒', color: 'black', selected: false };
      this.board[3][2] = { name: '卒', color: 'black', selected: false };
      this.board[3][4] = { name: '卒', color: 'black', selected: false };
      this.board[3][6] = { name: '卒', color: 'black', selected: false };
      this.board[3][8] = { name: '卒', color: 'black', selected: false };
      
      // 设置红方棋子
      this.board[9][0] = { name: '車', color: 'red', selected: false };
      this.board[9][1] = { name: '馬', color: 'red', selected: false };
      this.board[9][2] = { name: '相', color: 'red', selected: false };
      this.board[9][3] = { name: '仕', color: 'red', selected: false };
      this.board[9][4] = { name: '帅', color: 'red', selected: false };
      this.board[9][5] = { name: '仕', color: 'red', selected: false };
      this.board[9][6] = { name: '相', color: 'red', selected: false };
      this.board[9][7] = { name: '馬', color: 'red', selected: false };
      this.board[9][8] = { name: '車', color: 'red', selected: false };
      this.board[7][1] = { name: '炮', color: 'red', selected: false };
      this.board[7][7] = { name: '炮', color: 'red', selected: false };
      this.board[6][0] = { name: '兵', color: 'red', selected: false };
      this.board[6][2] = { name: '兵', color: 'red', selected: false };
      this.board[6][4] = { name: '兵', color: 'red', selected: false };
      this.board[6][6] = { name: '兵', color: 'red', selected: false };
      this.board[6][8] = { name: '兵', color: 'red', selected: false };
      
      // 重置游戏状态
      this.selectedPiece = null;
      this.currentPlayer = 'red';
      this.gameOver = false;
      this.winner = null;
    },
    
    selectPiece(row, col) {
      const piece = this.board[row][col];
      
      // 如果没有选中的棋子，且点击的是当前玩家的棋子，则选中它
      if (!this.selectedPiece && piece && piece.color === this.currentPlayer) {
        // 取消之前所有选中的棋子
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 9; j++) {
            if (this.board[i][j]) {
              this.board[i][j].selected = false;
            }
          }
        }
        
        // 选中当前棋子
        piece.selected = true;
        this.selectedPiece = { row, col };
      } 
      // 如果已经有选中的棋子，且点击的是当前玩家的另一个棋子，则切换选中
      else if (this.selectedPiece && piece && piece.color === this.currentPlayer) {
        // 取消之前所有选中的棋子
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 9; j++) {
            if (this.board[i][j]) {
              this.board[i][j].selected = false;
            }
          }
        }
        
        // 选中新的棋子
        piece.selected = true;
        this.selectedPiece = { row, col };
      }
      // 如果已经有选中的棋子，且点击的是空位置或对方棋子，则尝试移动
      else if (this.selectedPiece) {
        this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
      }
    },
    
    movePiece(fromRow, fromCol, toRow, toCol) {
      const piece = this.board[fromRow][fromCol];
      const targetPiece = this.board[toRow][toCol];
      
      // 不能移动到自己的棋子上
      if (targetPiece && targetPiece.color === piece.color) {
        return;
      }
      
      // 检查移动是否符合规则
      const isValidMove = this.pieceRules[piece.name](fromRow, fromCol, toRow, toCol, this.board);
      
      if (isValidMove) {
        // 执行移动
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // 取消选中状态
        piece.selected = false;
        this.selectedPiece = null;
        
        // 检查游戏是否结束（将/帅被吃）
        if (targetPiece && (targetPiece.name === '将' || targetPiece.name === '帅')) {
          this.gameOver = true;
          this.winner = piece.color;
          return;
        }
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
      }
    },
    
    handleClick(event) {
      // 阻止事件冒泡，防止触发棋盘的点击事件
    },
    
    restartGame() {
      this.initializeBoard();
    }
  }
};
</script>

<style scoped>
.chess-board-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.chess-board {
  position: relative;
  width: 540px; /* 9 * cellSize */
  height: 600px; /* 10 * cellSize */
  background-color: #FFE4B5;
  border: 2px solid #8B4513;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.chess-row {
  position: relative;
}

.chess-cell {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-lines {
  position: relative;
}

/* 绘制棋盘线条 */
.cell-lines::before,
.cell-lines::after {
  content: '';
  position: absolute;
  background-color: #000;
}

/* 横线 */
.cell-lines::before {
  width: 100%;
  height: 1px;
  top: 50%;
  left: 0;
}

/* 竖线 */
.cell-lines::after {
  height: 100%;
  width: 1px;
  top: 0;
  left: 50%;
}

/* 河界 */
.chess-cell:nth-child(5) .cell-lines::before {
  content: '楚河         汉界';
  background: none;
  color: #8B4513;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  line-height: 60px;
  letter-spacing: 20px;
  padding-left: 10px;
}

/* 九宫格斜线 */
.chess-cell:nth-child(4):nth-of-type(1) .cell-lines::after,
.chess-cell:nth-child(6):nth-of-type(1) .cell-lines::after,
.chess-cell:nth-child(4):nth-of-type(3) .cell-lines::after,
.chess-cell:nth-child(6):nth-of-type(3) .cell-lines::after,
.chess-cell:nth-child(4):nth-of-type(8) .cell-lines::after,
.chess-cell:nth-child(6):nth-of-type(8) .cell-lines::after,
.chess-cell:nth-child(4):nth-of-type(10) .cell-lines::after,
.chess-cell:nth-child(6):nth-of-type(10) .cell-lines::after {
  content: '';
  position: absolute;
  width: 1px;
  height: 1px;
  background: none;
  border-top: 1px solid #000;
  border-right: 1px solid #000;
  transform-origin: top left;
}

.chess-cell:nth-child(4):nth-of-type(1) .cell-lines::after,
.chess-cell:nth-child(6):nth-of-type(3) .cell-lines::after {
  transform: rotate(45deg);
  width: 85px;
  height: 85px;
  top: 0;
  left: 0;
}

.chess-cell:nth-child(6):nth-of-type(1) .cell-lines::after,
.chess-cell:nth-child(4):nth-of-type(3) .cell-lines::after {
  transform: rotate(135deg);
  width: 85px;
  height: 85px;
  top: 0;
  right: 0;
}

.chess-cell:nth-child(4):nth-of-type(8) .cell-lines::after,
.chess-cell:nth-child(6):nth-of-type(10) .cell-lines::after {
  transform: rotate(135deg);
  width: 85px;
  height: 85px;
  bottom: 0;
  left: 0;
}

.chess-cell:nth-child(6):nth-of-type(8) .cell-lines::after,
.chess-cell:nth-child(4):nth-of-type(10) .cell-lines::after {
  transform: rotate(45deg);
  width: 85px;
  height: 85px;
  bottom: 0;
  right: 0;
}

/* 兵/卒位置标记 */
.chess-cell:nth-child(1):nth-of-type(4) .cell-lines::before,
.chess-cell:nth-child(3):nth-of-type(4) .cell-lines::before,
.chess-cell:nth-child(5):nth-of-type(4) .cell-lines::before,
.chess-cell:nth-child(7):nth-of-type(4) .cell-lines::before,
.chess-cell:nth-child(9):nth-of-type(4) .cell-lines::before,
.chess-cell:nth-child(1):nth-of-type(7) .cell-lines::before,
.chess-cell:nth-child(3):nth-of-type(7) .cell-lines::before,
.chess-cell:nth-child(5):nth-of-type(7) .cell-lines::before,
.chess-cell:nth-child(7):nth-of-type(7) .cell-lines::before,
.chess-cell:nth-child(9):nth-of-type(7) .cell-lines::before {
  content: '';
  position: absolute;
  background: none;
  width: 10px;
  height: 10px;
  border: 1px solid #000;
}

.chess-cell:nth-child(1):nth-of-type(4) .cell-lines::before,
.chess-cell:nth-child(3):nth-of-type(4) .cell-lines::before,
.chess-cell:nth-child(7):nth-of-type(4) .cell-lines::before,
.chess-cell:nth-child(9):nth-of-type(4) .cell-lines::before,
.chess-cell:nth-child(1):nth-of-type(7) .cell-lines::before,
.chess-cell:nth-child(3):nth-of-type(7) .cell-lines::before,
.chess-cell:nth-child(7):nth-of-type(7) .cell-lines::before,
.chess-cell:nth-child(9):nth-of-type(7) .cell-lines::before {
  border-left: none;
  border-top: none;
  top: 0;
  right: 0;
}

.chess-cell:nth-child(1):nth-of-type(4) .cell-lines::after,
.chess-cell:nth-child(3):nth-of-type(4) .cell-lines::after,
.chess-cell:nth-child(7):nth-of-type(4) .cell-lines::after,
.chess-cell:nth-child(9):nth-of-type(4) .cell-lines::after,
.chess-cell:nth-child(1):nth-of-type(7) .cell-lines::after,
.chess-cell:nth-child(3):nth-of-type(7) .cell-lines::after,
.chess-cell:nth-child(7):nth-of-type(7) .cell-lines::after,
.chess-cell:nth-child(9):nth-of-type(7) .cell-lines::after {
  content: '';
  position: absolute;
  background: none;
  width: 10px;
  height: 10px;
  border: 1px solid #000;
  border-right: none;
  border-bottom: none;
  bottom: 0;
  left: 0;
}

/* 炮位置标记 */
.chess-cell:nth-child(2):nth-of-type(3) .cell-lines::before,
.chess-cell:nth-child(8):nth-of-type(3) .cell-lines::before,
.chess-cell:nth-child(2):nth-of-type(8) .cell-lines::before,
.chess-cell:nth-child(8):nth-of-type(8) .cell-lines::before {
  content: '';
  position: absolute;
  background: none;
  width: 10px;
  height: 10px;
  border: 1px solid #000;
}

.chess-cell:nth-child(2):nth-of-type(3) .cell-lines::before,
.chess-cell:nth-child(8):nth-of-type(3) .cell-lines::before,
.chess-cell:nth-child(2):nth-of-type(8) .cell-lines::before,
.chess-cell:nth-child(8):nth-of-type(8) .cell-lines::before {
  border-left: none;
  border-top: none;
  top: 0;
  right: 0;
}

.chess-cell:nth-child(2):nth-of-type(3) .cell-lines::after,
.chess-cell:nth-child(8):nth-of-type(3) .cell-lines::after,
.chess-cell:nth-child(2):nth-of-type(8) .cell-lines::after,
.chess-cell:nth-child(8):nth-of-type(8) .cell-lines::after {
  content: '';
  position: absolute;
  background: none;
  width: 10px;
  height: 10px;
  border: 1px solid #000;
  border-right: none;
  border-bottom: none;
  bottom: 0;
  left: 0;
}

.chess-piece {
  position: absolute;
  border-radius: 50%;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.red-piece {
  background-color: #FF4500;
  color: #fff;
  border: 2px solid #8B0000;
}

.black-piece {
  background-color: #000;
  color: #fff;
  border: 2px solid #696969;
}

.selected-piece {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 0 15px #FFD700;
  z-index: 10;
}

.game-info {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.turn-indicator {
  font-size: 18px;
  margin-bottom: 10px;
}

.restart-button,
.play-again-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.restart-button:hover,
.play-again-button:hover {
  background-color: #45a049;
}

.game-result {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.result-message {
  font-size: 36px;
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.text-red-600 {
  color: #FF4500;
}

.text-black {
  color: #000;
}

.red-turn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 69, 0, 0.05);
  pointer-events: none;
}

.black-turn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  pointer-events: none;
}
</style>    