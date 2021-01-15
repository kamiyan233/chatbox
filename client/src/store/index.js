import { createStore } from 'vuex'

export default createStore({
  state: {
    isOnline:false,
    userInfo:null,
    onLineFriend:[],
    socket:null
  },
  mutations: {
    // 登录状态
    setOnlineStatus (state, status) {
      state.isOnline = status
    },
    // 用户信息
    setUserInfo (state, data) {
      state.userInfo = data
    },
    setOnLineFriend(state,list){
      state.onLineFriend = list
    },
    // socket
    setSocket (state, data) {
      // console.log('setsocket')
      state.socket = data
    }
  },
  actions: {
  },
  modules: {
  }
})
