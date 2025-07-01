<template>
    <div class="calculator-container">
        <input type="text" v-model="a" />
        <select v-model="ab">
            <option value="+">+</option>
            <option value="-">-</option>
            <option value="*">×</option>
            <option value="/">÷</option>
        </select>
        <input type="text" v-model="b" />
        <a>=</a>
        <input type="text" v-model="c" readonly />
    </div>
</template>

<script>
export default {
    data() {
        return {
            a: '',
            b: '',
            ab: '+',
                }
    },
    computed: {
        c() {
            let numA = parseFloat(this.a);
            let numB = parseFloat(this.b);
            if (isNaN(numA) || isNaN(numB)) {
                return '';
            }
            switch (this.ab) {
                case '+':
                    return numA + numB;
                case '-':
                    return numA - numB;
                case '*':
                    return numA * numB;
                case '/':
                    return numB !== 0 ? numA / numB : 'NaN';
                default:
                    return '';
            }
        }
    }
}
</script>

<style scoped>
.calculator-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.calculator-container > * {
  margin: 8px;
  padding: 12px 16px;
  font-size: 18px;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.3s ease;
}

input[type="text"] {
  width: 120px;
  text-align: right;
}

select {
  cursor: pointer;
  background-color: white;
}

input:focus, select:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

a {
  font-weight: bold;
  font-size: 24px;
  color: #333;
}

input:hover, select:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
</style>