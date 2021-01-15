<template>
  <div class="about">
    <div class="main-content">
      <!-- <h1>This is an about page</h1> -->
      <div class="avatar" @click="showCrop = true">
        <img class="avatar-img" :src="userInfo?.avatar" alt="">
      </div>
      <div class="mt20 username">{{userInfo?.username}}</div>
      <div class="tip">只提供修改头像功能</div>
      <Cropimg v-model="showCrop" @getuserinfo="_getUserInfo"/>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import Cropimg from '@/components/cropimg'
import {getUserInfo} from '@/service'
export default {
  components:{Cropimg},
  data(){
    return{
      showCrop:false
    }
  },
  computed:{
    ...mapState(['userInfo'])
  },
  created(){
    this._getUserInfo()
  },
  // emits: ["getUserInfo"],
  methods:{
    // _getUserInfo(){
    //   this.$emit('getUserInfo')
    // },
    async _getUserInfo(){
      try {
        let res = await getUserInfo()
        const token = res.data?.token
        // if(!token) return
        localStorage.setItem('token',token)
        if(res.code == 0){
          this.$store.commit('setUserInfo',res.data)
          // console.log(this.userInfo,'app userinfo')
          // if(this.socket)return
          // socket连接
          // const ws = new WS({
          //   url:PORT.ws,
          //   userinfo:res.data,
          // })
          // this.$store.commit('setSocket',ws.socket)
          // this.$store.commit('setOnlineStatus',true) //在线
        }
        // })
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>
<style lang="scss">
@import "../assets/common";
.about{
  height: 100%;
  overflow: auto;
  .avatar{
    width: 100px;
    height: 100px;
    margin: auto;
  }
  .main-content{
    margin-top: 100px;
    text-align: center;
  }
  .username{
    font-size: 18px;
    color:#333;
    font-weight: 600;
  }
  .tip{
    margin-top:100px;
    color:#666;
    font-size: 14px;
  }
  .pl{
    position: relative;
  }
}
</style>