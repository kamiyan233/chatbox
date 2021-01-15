<template>
  <router-view  @noreadnum="onGetnoreadnum"/>
  <van-tabbar v-model="tabindex" v-if="$route.meta.showTabbar">
    <van-tabbar-item icon="friends-o" name='home' to="/home" :badge="noreadnum===0?'':noreadnum">聊天</van-tabbar-item>
    <van-tabbar-item icon="search" name='mine' to='/mine'>我的</van-tabbar-item>
  </van-tabbar>
</template>
<script>
export default {
  data(){
    return{
      tabindex:'home',
      noreadnum:0,
    }
  },
  methods:{
    onGetnoreadnum(num){
      this.noreadnum = num
    }
  }
}
</script>
<style lang='scss'>
html,body{
  height: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  // color: #fff;
  font-size: $f14;
  height: 100%;
  // background: #282828;
  position: relative;
  // overflow: auto;
}
.van-tabbar{
  border-top:$main-border-eee;
}
</style>
