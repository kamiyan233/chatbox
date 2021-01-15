const SOCKET_TYPE = {
    login:0
}
const MSG_TYPE = {
    from:0,
    to:1
  }
const Redis = require('../core/redis')
// var records = {
    // '_userid1':{
    //     '_userid_1':[{title:'消息1',createtime:'2020-10-19'},{title:'消息1',createtime:'2020-10-19'}],
    //     '_userid_2':[{title:'消息1',createtime:'2020-10-19'},{title:'消息1',createtime:'2020-10-19'}]
    // }

    // '_userid2':{
    //     '_userid_1':[{title:'消息1',createtime:'2020-10-19'},{title:'消息1',createtime:'2020-10-19'}],
    //     '_userid_2':[{title:'消息1',createtime:'2020-10-19'},{title:'消息1',createtime:'2020-10-19'}]
    // }
// }
class WebSocket {
    constructor(params) {
        this.server = params.server
        this.init()
    }
    // 在线的成员
    onLinePeople = {}
    // 缓存的消息 (在线人员)
    records = {}
    init() {
        const server = this.server
        const io = require('socket.io')(server, {
            cors:{
                'origin':'*',
            }
            // path: '/ws',
            // serveClient: false,
            // below are engine.IO options
            // pingInterval: 10000,
            // pingTimeout: 5000,
            // cookie: false
        });
        // this.wss = wss
        io.on('connection', (socket,req)=> {
            // console.log(socket.id,'a user connected');
            // 上线时推送当前在线用户
            socket.emit('login',this.getAllOnlieUserId());
            socket.on('message', (obj)=> {
                const {msg} = obj
                const to_userid = obj.to.userid
                const from_userid = obj.from.userid
                
                this.notice_msg_send_success(from_userid,msg,to_userid,socket) //回馈自己
                this.send_msg_to_someone(to_userid,msg,from_userid,socket) //send
            })
            // 监听用户登陆
            socket.on('login', userinfo=> {
                socket.userinfo = userinfo
                // console.log(userinfo,'userinfo')
                const {userid} = userinfo
                // 获取聊天记录 没有就创建
                // this.getAllRecoreds(userinfo)
                Redis.get(userid,(err,obj)=>{
                    if(!obj){
                        // this.records[userid] = '{}'
                        return
                    }
                    // this.records[userid] = obj
                    socket.emit('records',obj)
                })
                // let arr_onlie = []
                // arr_onlie.push(userid)
                const userScoketArr = this.onLinePeople[userid] || []
                userScoketArr.push(socket.id)
                this.onLinePeople[userid] = Array.from(new Set(userScoketArr))
                // 通知所有在线用户上线
                io.emit('login',this.getAllOnlieUserId());
            });
            socket.on("disconnect", (code,err) => {
                const {onLinePeople} = this
                if(!socket.userinfo)return
                // console.log(socket.userinfo.username+"'s server disconnect");
                const {userid} = socket.userinfo
                this.removeItemInArray(onLinePeople[userid],socket.id)
                if(onLinePeople[userid].length == 0){
                    delete onLinePeople[userid]
                }
                
                // console.log(onLinePeople,'onLinePeople[userid]')
                // 通知所有在线用户下线
                io.emit('logout',this.getAllOnlieUserId());
                // console.log('socket.id:'+ socket.id);
                // this.loginOut(data.userid)
            });

            socket.on("error", function (err) {
                console.log("server error " + err);
            });
            // this.socket = socket
        });
    }
    // 自己发送消息的回馈
    notice_msg_send_success(from_userid,msg,to_userid,socket){
        // console.log(socket.id,from_userid,to_userid,'回馈')
        // let to_socket_ids = this.getAllSocketIdByUserId(from_userid)
        let sendObj = {msg,from:from_userid,to:to_userid}
        // 遍历发送该用户的所有的socket
        // for(let i=0;i<to_socket_ids.length;i++){
        //     if(socket.id!=to_socket_ids[i]){
        //         socket.to(to_socket_ids[i]).emit('sendsuccess',sendObj)
        //     }
        // }
        socket.emit('sendsuccess',sendObj)
        // console.log(this.records[from_userid])
        // 存自己的聊天记录和留言
        this.saveOwnRecords(from_userid,to_userid,msg)
        this.saveOtherRecords(from_userid,to_userid,msg)
    }
    // 向某人发送消息
    send_msg_to_someone(to_userid,msg,from_userid,socket){
        let to_socket_ids = this.getAllSocketIdByUserId(to_userid)
        // console.log(from_userid,to_userid,'向某人发消息',socket.id,to_socket_ids)
        if(!to_socket_ids){
            socket.emit('sendfail',{msg:'暂时不能向离线人员发送消息'})
            return
        }
        let sendObj = {msg,from:from_userid}
        // 遍历发送该用户的所有的socket
        for(let i=0;i<to_socket_ids.length;i++){
            // if(socket.id!=to_socket_ids[i]){
            socket.to(to_socket_ids[i]).emit('message',sendObj)
            // }
        }
    }
    // 获取所有在线用户id
    getAllOnlieUserId(){
        return Object.keys(this.onLinePeople)
    }
    getAllSocketIdByUserId(userid){
        // console.log(this.onLinePeople)
        return this.onLinePeople[userid]
    }
    removeItemInArray(arr,item){
        let index = arr.indexOf(item)
        arr.splice(index,1)
        return arr
    }
    // 存入自己聊天记录
    saveOwnRecords(from_userid,to_userid,msg) {
        let own_records = {}
        Redis.get(from_userid,(err,obj)=>{ //获取之前
            if(obj){
                own_records = JSON.parse(obj)
            }
            const own_record_list = own_records[to_userid] || []
            own_record_list.push({msg,createtime:Date.now(),from:from_userid,to:to_userid,type:MSG_TYPE.to}) // type 为1表示发送
            own_records[to_userid] = own_record_list
            Redis.set(from_userid,JSON.stringify(own_records) ,(err,obj)=>{
                // console.log(err,obj)
            })
        })
    }
    saveOtherRecords(from_userid,to_userid,msg){
        let to_records = {}
        Redis.get(to_userid,(err,obj)=>{
            if(obj){
                to_records = JSON.parse(obj)
            }
            const to_record_list = to_records[from_userid] || []
            to_record_list.push({msg,createtime:Date.now(),from:from_userid,to:to_userid,type:MSG_TYPE.from}) // type 为0表示接收
            to_records[from_userid] = to_record_list
            Redis.set(to_userid,JSON.stringify(to_records) ,(err,obj)=>{
                // console.log(err,obj)
            })
        })
    }
    // 获取聊天记录 没有就创建
    // getAllRecoreds({userid,username}){
    //     Redis.get(userid,(err,obj)=>{
    //         console.log(userid,username,obj)
    //         if(!obj){
    //             this.records[userid] = '{}'
    //             return
    //         }
    //         this.records[userid] = obj
            
    //     })
    // }
}
module.exports = WebSocket