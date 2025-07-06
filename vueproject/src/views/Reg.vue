<template>
    <div class="register-wrapper">
        <div class="register-container">
            <!-- 选择身份 -->
            <div v-if="!statusSelected" class="input-group">
                <select v-model="status" @change="selectStatus">
                    <option value="">请选择身份</option>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                    <option value="lyuser">lyuser</option>
                </select>
            </div>
            <!-- 用户或管理员表单 -->
            <div v-else-if="status === 'user' || status === 'admin'" class="floating-form">
                <div class="input-group">
                    <input v-model="userid" required maxlength="20" />
                    <label>userid</label>
                    <span class="highlight"></span>
                </div>
                <div class="input-group">
                    <input v-model="username" required />
                    <label>username</label>
                    <span class="highlight"></span>
                </div>
                <div class="input-group verification-group">
                    <input v-model="usersex" required maxlength="6" />
                    <label>usersex</label>
                </div>
                <div class="input-group">
                    <input v-model="status" required minlength="6" maxlength="20" readonly />
                    <label>status</label>
                    <span class="highlight"></span>
                </div>
                <div class="input-group">
                    <input v-model="age" required minlength="6" maxlength="20" />
                    <label>age</label>
                    <span class="highlight"></span>
                </div>
                <div class="input-group">
                    <input v-model="address" required minlength="6" maxlength="20" />
                    <label>address</label>
                    <span class="highlight"></span>
                </div>
                <div class="input-group">
                    <input v-model="password" required minlength="6" maxlength="20" />
                    <label>password</label>
                    <span class="highlight"></span>
                </div>
                <div class="input-group">
                    <input v-model="conpass" required minlength="6" maxlength="20" />
                    <label>con_password</label>
                    <span class="highlight"></span>
                </div>
                <div class="input-group">
                    <input v-model="regtime" required minlength="6" maxlength="20" readonly />
                    <label>regtime</label>
                    <span class="highlight"></span>
                </div>
                <button class="submit-btn" @click="reg">
                    <span>立即注册</span>
                    <i class="arrow-icon"></i>
                </button>
                <div class="form-footer">
                    <span>已有账号？</span>
                    <a href="/">立即登录</a>
                </div>
            </div>
            <!-- 旅游用户表单 -->
            <div v-else-if="status === 'lyuser'" class="floating-form">
                <div class="input-group">
                    <input v-model="userid" required maxlength="20" />
                    <label>id</label>
                    <span class="highlight"></span>
                </div>
                <div class="input-group">
                    <input v-model="password" required minlength="6" maxlength="20" />
                    <label>password</label>
                    <span class="highlight"></span>
                </div>
                <div class="input-group">
                    <input v-model="username" required />
                    <label>name</label>
                    <span class="highlight"></span>
                </div>
                <div class="input-group">
                    <input v-model="status" required minlength="6" maxlength="20" readonly />
                    <label>status</label>
                    <span class="highlight"></span>
                </div>
                <div class="input-group">
                    <input v-model="phone" required minlength="6" maxlength="20" />
                    <label>phone</label>
                    <span class="highlight"></span>
                </div>
                <div class="input-group">
                    <input v-model="address" required minlength="6" maxlength="20" />
                    <label>address</label>
                    <span class="highlight"></span>
                </div>
                <div class="input-group">
                    <input v-model="regtime" required minlength="6" maxlength="20" readonly />
                    <label>regtime</label>
                    <span class="highlight"></span>
                </div>
                <button class="submit-btn" @click="reg">
                    <span>立即注册</span>
                    <i class="arrow-icon"></i>
                </button>
                <div class="form-footer">
                    <span>已有账号？</span>
                    <a href="/">立即登录</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import Qs from 'qs'

export default {
    data() {
        return {
            userid: null,
            username: null,
            usersex: null,
            password: null,
            conpass: null,
            resdata: null,
            status: '',
            age: null,
            address: null,
            phone: null,
            regtime: '',
            statusSelected: false,
            timer: null
        }
    },
    mounted() {
        this.startTimer()
    },
    beforeDestroy() {
        this.stopTimer()
    },
    methods: {
        selectStatus() {
            if (this.status) {
                this.statusSelected = true
            }
        },
        sure() {
            if ((this.status === 'user' || this.status === 'admin') && (this.userid == null || this.username == null || this.usersex == null || this.password == null || this.conpass == null)) {
                alert("输入为空")
                return
            }
            if (this.password != this.conpass) {
                alert("两次密码有误")
                return
            }
            if (this.status === 'lyuser' && (this.userid == null || this.username == null || this.password == null || this.phone == null || this.address == null)) {
                alert("输入为空")
                return
            }
        },
        time() {
            const date = new Date()
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            const seconds = String(date.getSeconds()).padStart(2, '0')
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        },
        startTimer() {
            this.timer = setInterval(() => {
                this.regtime = this.time()
            }, 1000)
        },
        stopTimer() {
            if (this.timer) {
                clearInterval(this.timer)
            }
        },
        reg() {
            this.sure()
            let apiUrl
            let params
            if (this.status === 'lyuser') {
                apiUrl = 'http://localhost:8080/a1/LyuserController/reg'
                params = {
                    userid: this.userid,
                    password: this.password,
                    username: this.username,
                    status: this.status,
                    phone: this.phone,
                    address: this.address,
                    regtime: this.regtime
                }
            } else {
                apiUrl = 'http://localhost:8080/a1/UserController/reg'
                params = {
                    userid: this.userid,
                    password: this.password,
                    username: this.username,
                    usersex: this.usersex,
                    status: this.status,
                    age: this.age,
                    address: this.address,
                    regtime: this.regtime
                }
            }

            axios.post(apiUrl, Qs.stringify(params), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(response => {
                const resultDiv = document.getElementById('result')
                //resultDiv.innerHTML = `<pre>${JSON.stringify(response.data, null, 2)}</pre>`
                if (response.data.userId == null) {
                    this.isuser = 0
                } else {
                    this.isuser = 1
                }
                this.resdata = response.data
                console.log('响应数据:', response.data)
                console.log('resdata:', this.resdata)

                if (this.resdata) {
                    this.$router.push({ path: '/' })
                }
            })
            .catch(error => {
                console.error('请求失败:', error)
                alert('u error')
            })
        }
    }
}
</script>

<style scoped>
.register-wrapper {
    min-height: 93.5vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;
}

.register-container {
    width: 100%;
    max-width: 480px;
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.form-header {
    text-align: center;
    margin-bottom: 40px;
}

.form-header h2 {
    color: #2c3e50;
    font-size: 32px;
    margin-bottom: 10px;
    font-weight: 700;
}

.form-header p {
    color: #95a5a6;
    font-size: 16px;
}

.floating-form .input-group {
    position: relative;
    margin-bottom: 30px;
}

.input-group input {
    width: 100%;
    padding: 15px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s ease;
    background: transparent;
}

.input-group label {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: white;
    padding: 0 5px;
    color: #95a5a6;
    font-size: 16px;
    transition: all 0.3s ease;
    pointer-events: none;
}

.input-group input:focus,
.input-group input:valid {
    border-color: #3498db;
}

.input-group input:focus + label,
.input-group input:valid + label {
    top: 0;
    font-size: 14px;
    color: #3498db;
}

.verification-group {
    display: flex;
    gap: 10px;
}

.verification-group input {
    flex: 1;
}

.send-code-btn {
    padding: 0 20px;
    background: #e8f5fe;
    color: #3498db;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.send-code-btn:hover {
    background: #d0e9fd;
}

.submit-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(to right, #3498db, #2980b9);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.arrow-icon {
    border: solid white;
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 3px;
    transform: rotate(-45deg);
}

.form-footer {
    text-align: center;
    margin-top: 20px;
    color: #95a5a6;
}

.form-footer a {
    color: #3498db;
    text-decoration: none;
    margin-left: 5px;
    font-weight: 600;
}

.form-footer a:hover {
    text-decoration: underline;
}

@media (max-width: 480px) {
    .register-container {
        padding: 20px;
    }

    .form-header h2 {
        font-size: 24px;
    }

    .input-group input {
        padding: 12px;
    }
}

@media (max-width: 768px) {
    .register-container {
        max-width: 400px;
        padding: 30px;
    }

    .form-header h2 {
        font-size: 28px;
    }

    .form-header p {
        font-size: 14px;
    }
}

@media (max-width: 480px) {
    .register-container {
        padding: 20px;
        margin: 10px;
        max-width: 100%;
    }

    .form-header h2 {
        font-size: 24px;
    }

    .form-header p {
        font-size: 14px;
    }

    .input-group input {
        padding: 12px;
        font-size: 14px;
    }

    .input-group label {
        font-size: 14px;
    }

    .verification-group {
        flex-direction: column;
        gap: 5px;
    }

    .send-code-btn {
        width: 100%;
        padding: 12px;
    }

    .submit-btn {
        padding: 12px;
        font-size: 16px;
    }
}

@media (max-width: 320px) {
    .register-container {
        padding: 15px;
    }

    .form-header h2 {
        font-size: 20px;
    }

    .input-group {
        margin-bottom: 20px;
    }
}
</style>    