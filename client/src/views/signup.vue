<template>
  <div class="signupEl">
    <div class="dialog">
        <div class="title">简单注册</div>
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
                <van-button round block type="primary" native-type="submit">注册</van-button>
                <van-button round block type="primary" class="mt20" plain @click="$router.push('/login')">返回登录</van-button>
            </div>
            </van-form>
    </div>
  </div>
</template>

<script>
import {createAccount} from '@/service'
export default {
    data(){
        return{
            username:'',
            password:'',
        }
    },
    methods:{
        // 登录
        async onSubmit(){
           const {username,password} = this
            const loading = this.$toast.loading({
                duration: 0,
                forbidClick: true,
            });
            try {
                let res = await createAccount({username,password})
                loading.clear()
                if(res.code==0){
                    const {token} = res.data
                    localStorage.setItem('token',token)
                    // console.log(res.data,'signup')
                    // this.$store.commit('setOnlineStatus',true)
                    // this.$store.commit('setUserInfo',res.data)
                    // this.show = false
                    this.$toast('注册成功')
                    this.$router.push('/login')
                    
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
        }
    }
};
</script>

<style lang='scss'>
.signupEl {
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