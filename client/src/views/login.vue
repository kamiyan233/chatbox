<template>
  <div class="loginEl">
    <div class="dialog">
        <div class="title">Member Login</div>
        <van-form class="form" @submit="onSubmit">
            <van-field
                v-model="username"
                name="用户名"
                label="用户名"
                placeholder="用户名"
                :rules="[{ required: true, message: '请填写用户名' }]"
            />
            <van-field
                v-model="password"
                type="password"
                name="密码"
                label="密码"
                placeholder="密码"
                :rules="[{ required: true, message: '请填写密码' }]"
            />
            <div style="margin: 16px;">
                <van-button round block type="primary" native-type="submit">登录</van-button>
                <van-button @click="$router.push('/signup')" class="mt20" round block plain type="primary">注册</van-button>
            </div>
            </van-form>
    </div>
  </div>
</template>

<script>
import {login} from '@/service'
import {setToken} from '@/core/apis'
export default {
    data(){
        return{
            username:'',
            password:'',
            longLoginChecked:false
        }
    },
    methods:{
        // 登录
        async onSubmit(){
            // this.$socket.emit('msg',{a:1})// 发送
            const {username,password} = this
            try {
                let res = await login({username,password})
                if(res.code==0){
                    const {token} = res.data
                    localStorage.setItem('token',token)
                    console.log(res.data,'login')
                    this.$store.commit('setOnlineStatus',true)
                    this.$store.commit('setUserInfo',res.data)
                    setToken(token)
                    this.$router.push('/home')
                } else {
                    // console.log(res.msg)
                    this.$toast(res.msg)
                }
            } catch (error){
                console.log(error)
            }
        },
        async updatePassword(){
            console.log('修改密码~')
        },
        handleChecked(){
            this.longLoginChecked = !this.longLoginChecked
        }
    }
};
</script>

<style lang='scss'>
.loginEl {
  .dialog {
    margin-top:200px;
    text-align: center;
  }
  .title{
      color: #232323;
      font-size: 16px;
      font-weight: 900;
      text-shadow: 0 0 4px #eee;
  }
  .form{
      margin-top: 20px;
      &-item{
        //   background: #f0eff4;
          margin-top: 10px;
          padding:0 10px;
          input{
            background: transparent;
            margin-left:10px;
            font-size: 12px;
            width: 200px;
          }
          $iconWidth:18px;
      }
  }
}
</style>