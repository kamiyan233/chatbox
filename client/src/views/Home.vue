<template>
  <div class="home">
    <div v-show="false">{{allNewMsgNum}}</div>
    <van-list
    class="list"
      v-model:loading="state.loading"
      :finished="state.finished"
      @load="onLoad"
    >
      <div class="list-item" v-for="(item,index) in state.friendList" :key="index" @click="chatwithone(item,index)">
          <div :class="['avatar',{'online':item.isOnLine}]">
            <img class="avatar-img" :src="item.avatar" alt="">
            <div class="noreadnnum" v-if="item.noReadeMsg?.length>0">{{item.noReadeMsg.length>99?'99+':item.noReadeMsg.length}}</div>
          </div>
          <div class="des">
            <div class="username">{{item.username}}</div>
            <div class="latestMsg">{{item.latestMsg}}</div>
          </div>
      </div>
    </van-list>
  </div>
  <div :class="['sendmsgbox',{'show':state.sendmsgboxShow}]">
    <van-nav-bar
      :title="state.chatUser.username"
      left-text="返回"
      left-arrow
      @click-left="onClickBack"
    />
    <div class="chat-body">
      <div class="chatBox-content" ref="chatBoxContent">
          <div class="chatBox-content-box" @scroll="chatScrollEvent">
            <!-- 历史记录 -->
            <ul>
              <li v-for="(item,index) in state.last_records[state.chatUser.userid]" :key="index" :class="{'left':item.type==state.MSG_TYPE.from,'right':item.type==state.MSG_TYPE.to}">
                  <div class="chat-avatar-img">
                      <img :src="item.type==state.MSG_TYPE.from?state.friendList[state.activeFriendIndex].avatar:userinfo?.avatar" alt="">
                  </div>
                  <div class="msg">{{item.msg}}</div>
              </li>
            </ul>
            <div class="history_record_tip" v-if="state.last_records[state.chatUser.userid]">————————以上是历史记录————————</div>
            <!-- 当前 -->
            <ul class="">
              <li v-for="(item,index) in state.messageBox[state.chatUser.userid]" :key="index" :class="{'left':item.type==state.MSG_TYPE.from,'right':item.type==state.MSG_TYPE.to}">
                  <div class="chat-avatar-img">
                      <img :src="item.type==state.MSG_TYPE.from?state.friendList[state.activeFriendIndex].avatar:userinfo?.avatar" alt="">
                  </div>
                  <div class="msg">{{item.msg}}</div>
              </li>
            </ul>
          </div>
        </div>
        <div class="newMsgTip hand" v-if="state.newMsgTip" @click="chetboxScrolltoBottom">收到了新的消息~</div>
    </div>
    <div class="send-ipt">
     <van-field
        v-model="state.message"
        rows="1"
        autosize
        type="textarea"
        placeholder="说点儿什么"
      />
      <van-button type='primary' class="send-btn" size='small' @click="sendMsg">发送</van-button>
    </div>
  </div>
  <!-- <Footer></Footer> -->
</template>

<script>
// @ is an alias to /src
import {PORT} from "@/config/constant"
import WS from '@/core/socket.io'
import { reactive,getCurrentInstance,watch,computed, nextTick,onBeforeMount} from 'vue';
import {useStore} from 'vuex'
import {getAllUsers,getUserInfo} from '@/service'

export default {
  emits:['noreadnum'],
  setup(props,context) {
    const { ctx } = getCurrentInstance();
    const store = useStore()
    const userinfo = computed(() => store.state.userInfo)
    // const onLineFriend = computed(() => store.state.onLineFriend)
    const MSG_TYPE = {
      from:0,
      to:1
    }
    const state = reactive({
      friendList: [],
      activeFriendIndex:0,
      messageBox:{},
      MSG_TYPE,
      loading: false,
      finished: false,
      // onLineFriend:[],
      last_records:[],
      sendmsgboxShow:false,
      chatUser:{},
      newMsgTip:false,
      message:''
    });
    async function _getAllUsers(){
      state.loading = true
      let res = await getAllUsers()
      if(res.code==-1){
        console.log(this)
        ctx.$router.replace('/login')
        return
      }
      state.friendList = res.data
      state.loading = false
      state.finished = true
      addOnlineStatus()
      // this.addOnlineStatus()
      // console.log(res)
    }
    onBeforeMount(()=>{
      _getUserInfo()
      // const ws = new WS({
      //   url:PORT.ws,
      //   userinfo,
      // })
      // store.commit('setSocket',ws.socket)
    })
    _getAllUsers()
    // const onClickLeft = ()=>{
    //   console.log('返回')
    // }
    async function _getUserInfo(){
      try {
        let res = await getUserInfo()
        const token = res.data?.token
        // if(!token) return
        localStorage.setItem('token',token)
        if(res.code == 0){
          store.commit('setUserInfo',res.data)
          // console.log(this.userInfo,'app userinfo')
          // if(this.socket)return
          // socket连接
          const ws = new WS({
            url:PORT.ws,
            userinfo:res.data,
          })
          store.commit('setSocket',ws.socket)
          store.commit('setOnlineStatus',true) //在线
        }
        // })
      } catch (error) {
        console.log(error)
      }
    }
    // scket监听
    watch(()=>store.state.socket, (value) => {
      // console.log(value, prev, '改变')
      let socket = value
      if(socket){
        console.log('socket on listener')
        // if(!socket)return
        // 其他人上线监听
        socket.on('login',(arr)=>{
          // console.log(arr,'onlinePeople')
          // state.onLineFriend = arr
          store.commit('setOnLineFriend',arr)
          addOnlineStatus()
        })
        // 其他人下线监听
        socket.on('logout',(arr)=>{
          // console.log('logout')
          // console.log(arr,'onlinePeople')
          // state.onLineFriend = arr
          store.commit('setOnLineFriend',arr)
          addOnlineStatus()
        })
        // 收取消息
        socket.on('message', (obj) => {
            console.log(obj,'recive message')
            const {from,msg} = obj
            let msg_arr = state.messageBox?.[from] || []
            msg_arr.push({msg,type:MSG_TYPE.from})
            state.messageBox[from] = msg_arr
            // console.log(state.messageBox,'messagebox')
            noReadReceiveMsg(from,msg)
            setLatestMsg()
            // newMsgTipsShow()
        })
        // 自己发送消息成功监听
        socket.on('sendsuccess', (obj) => {
          const {to,msg} = obj
          let msg_arr = state.messageBox?.[to] || []
          msg_arr.push({msg,type:MSG_TYPE.to})
            console.log(obj)
          state.messageBox[to] = msg_arr
          chetboxScrolltoBottom()
        })
        socket.on('sendfail', (obj) => {
          alert(obj.msg)
        })
        // 聊天记录
        socket.on('records', (obj) => {
          // console.log(JSON.parse(obj),'records')
          state.last_records = JSON.parse(obj)
          // await nextTick()
          setHistoryLatestMsg()
        })
      }
    })
    const resetOnline = ()=>{
      const {friendList} = state
       for(let i=0;i<friendList.length;i++){
         friendList[i].isOnLine = false
       }
    }
    function addOnlineStatus(){
      const {friendList} = state
      // await this.$nextTick()
      resetOnline()
      const onLineFriend = store.state.onLineFriend || []
      for(let j=0;j<onLineFriend.length;j++){
        for(let i=0;i<friendList.length;i++){
          // debugger
          if(friendList[i].userid == onLineFriend[j]){
            friendList[i].isOnLine = true
            break
          }
        }
      }
    }
    function clearReadReceiveMsg(userid){
      const {friendList} = state
      for(let i=0;i<friendList.length;i++){
        if(userid == friendList[i].userid){
          friendList[i].noReadeMsg = []
          break
        }
      }
    }
    function noReadReceiveMsg(userid,msg){
      const {friendList} = state
      for(let i=0;i<friendList.length;i++){
        if(friendList[i].userid == userid){
          if(Array.isArray(friendList[i].noReadeMsg)){
            friendList[i].noReadeMsg.push({userid,msg})
          }else{
            friendList[i].noReadeMsg = [{userid,msg}]
          }
        }
      }
    }
    // 更新最新消息
    function setLatestMsg(){
      const {messageBox,friendList} = state
        for(let key in messageBox){
          for(let i=0;i<friendList.length;i++){
            if(friendList[i].userid == key){
              friendList[i].latestMsg = messageBox[key][messageBox[key].length-1].msg
            }
          }
        }
    }
    // 获取历史记录中的最新消息
    function setHistoryLatestMsg(){
      const {last_records,friendList} = state
        for(let i=0;i<friendList.length;i++){
          const list = last_records[friendList[i].userid] || []
          for(let j =list.length-1;j>=0;j--){
            if(list[j].type == MSG_TYPE.from){
              // debugger
              friendList[i].latestMsg = list[j].msg
              break
            }
          }
        }
    }
    // 显示聊天框新消息提示
    // async function newMsgTipsShow(){
    //   const {messageBox,friendList,activeFriendIndex} = state
    //   // console.log('收到新消息',messageBox,friendList,activeFriendIndex)
    //   if(messageBox[friendList[activeFriendIndex].userid].length > 3){
    //     state.newMsgTip = true
    //   }
    // }
    const chatwithone = ({userid,username},index) => {
      state.sendmsgboxShow = true
      state.activeFriendIndex = index
      state.chatUser = {
        userid,username
      }
      clearReadReceiveMsg(userid)
      chetboxScrolltoBottom()
    }
    const onClickBack = () => {
      const {chatUser} = state
       state.sendmsgboxShow = false
       clearReadReceiveMsg(chatUser.userid)
    }
    // 底部分页(demo弃用分页)
    const onLoad = () => {
    };
    // 聊天框滚动到底部
    async function chetboxScrolltoBottom(){
      await nextTick()
      state.newMsgTip = false
      const lastChatMsg = document.querySelector('.chatBox-content li:last-child')
      lastChatMsg?.scrollIntoView()
    }
     // 滚动到底部tip消失
    function chatScrollEvent(e){
      // console.log(e.target.scrollTop,e.target.clientHeight,e.target.scrollHeight)
      const {scrollTop,clientHeight,scrollHeight} = e.target
      if(scrollTop + clientHeight  >= scrollHeight - 10){
        state.newMsgTip = false
      }
    }
    // 发送消息
    function sendMsg(){
      const socket = store.state.socket
      const {message,friendList,activeFriendIndex} = state
      console.log(socket.id)
      socket&&socket.sendmsg(message,friendList[activeFriendIndex]);
      // console.log(document.querySelector('.chatBox-content li:last-child'))
      // document.querySelector('.chatBox-content li:last-child').scrollIntoView()
      // this.$refs.chatBoxContent.scrollIntoView()
      // this.socket.emit('message',{msg:this.text})
      state.message = ''
    }
    const allNewMsgNum = computed(()=>{
      const {friendList} = state
      let num = 0
      for(let i=0;i<friendList.length;i++){
        const arr = friendList[i].noReadeMsg||[]
        num += arr.length
      }
      
      // console.log(allNewMsgNum,'allNewMsgNum')
      context.emit('noreadnum',num)
      return num
    })
    return {
      state,
      onLoad,
      chatwithone,
      onClickBack,
      chetboxScrolltoBottom,
      userinfo,
      sendMsg,
      chatScrollEvent,
      allNewMsgNum
      // onClickLeft
    };
  }
}
</script>
<style lang="scss">
@import "../assets/common";
.home{
  // @extend .clearfix;
  overflow: auto;
  height: 100%;
  z-index: 1;
  position: relative;
  .list{
    // margin-top:50px;
    padding-bottom: 55px;
    &-item{
      padding:10px 0;
      & + .list-item{
        margin-top: 0px;
      }
      display: flex;
      .avatar{
        position: relative;
        flex-shrink: 0;
        margin-left:20px;
        &-img{
          filter:grayscale(1);
        }
        &.online{
          .avatar-img{
            filter:grayscale(0)
          }
        }
      }
      .des{
        margin-left:10px;
        margin-right:20px;
        border-bottom: 1px solid #eee;
        flex:1;
        .username{
          color:#232323;
          font-size: 16px;
        }
        .latestMsg{
          margin-top:5px;
          color:#666;
          font-size: 12px;
          width: 300px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
        .msg{

        }
      }
    }
  }
}
.chat-body{
  position: absolute;
  top: 46px;
  bottom: 55px;
  // overflow: auto;
  width: 100%;
}
.chatBox-content{
      position: relative;
      background: #fff;
      padding:10px  0;
      height: 100%;
      &-box{
        height: 100%;
        overflow: auto;
      }
      ul{
        overflow: auto;
        // max-height: 502px;
      }
      li{
        display: flex;
        margin:0 15px;
        margin-bottom: 20px;
        .chat-avatar-img{
          width: 24px;
          height: 24px;
          border-radius: 4px;
          flex-shrink: 0;
          overflow: hidden;
        }
        .msg{
          word-break: break-all;
          font-size: 12px;
          color:#666;
          padding:10px;
          border-radius: 4px;
          background: #eee;
          position: relative;
        }
      }
      $msg-width-margin:45px;
      // 三角
      .arrow{
        content:'';
        position: absolute;
        top:8px;
        width: 0;
        height: 0;
      }
      .right{
        margin-right: 10px;
        margin-left:$msg-width-margin;
        flex-direction: row-reverse;
        .msg{
          margin-right: 10px;
          &::before{
            @extend .arrow;
            right:-6px;
            border-top: 4px solid transparent;
            border-left: 6px solid #eee;
            border-bottom: 4px solid transparent;
          }
        }
      }
      .left{
        margin-left:10px;
        margin-right: $msg-width-margin;
        .msg{
          margin-left:10px;
          &::before{
            @extend .arrow;
            left:-6px;
            border-top: 4px solid transparent;
            border-right: 6px solid #eee;
            border-bottom: 4px solid transparent;
          }
        }
      }
    }
.sendmsgbox{
  position: fixed;
  width: 100%;
  height: 100%;
  top:0;
  z-index: 99;
  background: #fff;
  left:100%;
  transition: $transition_all;
  overflow: auto;
  .send-ipt{
    position: absolute;
    bottom:0;
    left:0;
    z-index:100;
    width: 100%;
    display: flex;
    border-top: $main-border-eee;
    align-items: center;
    background: #f7f7f7;;
    padding:5px 0;
    .van-field{
      margin:0 10px 0 10px
    }
  }
  .send-btn{
    width: 100px;
    margin-right:5px;
  }
  &.show{
    left:0;
  }
  .history_record_tip{
    font-size: 12px;
    text-align: center;
    color:#aaa;
    margin:20px 0;
  }
}
.newMsgTip{
    position: absolute;
    bottom:5px;
    left:0;
    width: 100%;
    background: rgba($color: #000000, $alpha: 0.15);
    font-size: 13px;
    text-align: center;
    color:#fff;
}
</style>
