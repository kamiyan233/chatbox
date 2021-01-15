import io from 'socket.io-client'
class WS{
    constructor(data){
        this.url = data.url
        this.userinfo=data.userinfo
        this.token = data.token
        // this.success = data.success
        this.init()
    
    }
    // keyList = ['onLinePeople']
    funcList = []
    init(){
        const url = this.url
        // 打开一个 web socket  这里端口号和上面监听的需一致
        var socket = io(url,{
            // path:'/ws',
            query:{},
            // transportOptions: {
            // polling: {
            //   extraHeaders: {
            //     token
            //   }
            // }
            // }
        })
        // 通知登陆
        socket.emit('login',this.userinfo)
        socket.on('connect', () => {
            console.log(socket.id,'content.id')
        });
        // socket.on('message', (obj) => {
        //     console.log(obj)
        // });
        // 发送消息
        socket.sendmsg = (msg,to)=>{
            this.socket.emit('message',{from:this.userinfo,msg,to})
        }
        this.socket = socket
    }
}

export default WS