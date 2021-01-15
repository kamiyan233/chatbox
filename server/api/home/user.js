// import {DB_URL} from '../config/constant'
// var DB_collect = require('../../db/db')
var express = require('express')
const router = express.Router();
const jwt = require('../../core/token')
const { RETURN_CODE } = require('../../config/constant')
const {removePasswordInUserInfo,removeUserinfoByUserid} = require('../../core/utils')
// const jwt = new JWT()
const { ObjectId } = require('mongodb');
// const userInfo_db = new DB_collect('user_info')
const {userinfo_DB} = require("../../db")
/**
 * 登录
 */
router.post('/login', (req, res) => {
    const { username, password } = req.body
    
    userinfo_DB.findone({ username }).then(result => {
        if(!result){
            res.json({ code: RETURN_CODE.fail, data: null, msg: '用户不存在' })
            return
        }
        // let {_id} = result
        if (result.password == password) {
            const {_id} = result
            let token = jwt.createToken({userid:_id,username,password})
            res.json({ code: RETURN_CODE.success, data: { username,userid:_id, token } })
        } else {
            res.json({ code: RETURN_CODE.fail, data: null, msg: '用户名或密码错误' })
        }
    })
})
/**
 * 获取用户信息
 */
router.post('/getUserInfo', (req, res) => {
    const { token } = req.headers
    let {userid} = jwt.getuserinfoByToken(token)
    userinfo_DB.findone({_id:ObjectId(userid)}).then(result => {
        const {_id,username,avatar,likes,collects} = result
        res.json({ code: RETURN_CODE.success, data: { userid:_id,username,avatar,likes,collects, token } })
    })
  
})
/**
 * 获取所有用户
 */
router.post('/getAllUsers',(req,res)=>{
    const { token } = req.headers
    var decoded_info = jwt.decoded(token);
    const now_userinfo = decoded_info.payload.data
    
    userinfo_DB.find({},1,1000).then(db_res=>{
        let data = removePasswordInUserInfo(db_res.data)
        // 去掉登录用户
        let rm_info_arr =removeUserinfoByUserid(now_userinfo.userid,data)
        res.json({ code: RETURN_CODE.success, data:rm_info_arr })
    })
})
// 注册
router.post('/signup', (req, res) => {
    const { username, password } = req.body
    const baseUrl = 'https://kamiyan.icu'
    const defaultHeadImg = baseUrl+ '/resource/img/icon-default-avatar.png'
    userinfo_DB.findone({ username }).then(result => {
        // console.log(result, 'db_result')
        
        // let {_id} = result
        if (!result) {
            userinfo_DB.insert({ username, password,avatar:defaultHeadImg,likes:[],collects:[],createtime:Date.now() })
            res.json({ code: RETURN_CODE.success,data: 'success' })
            // console.log('密码正确')
            // const {_id} = result
            // let token = jwt.createToken({userid:_id,username,password})
            // res.json({ code: RETURN_CODE.success, data: { username,userid:_id, token } })
        } else {
            res.json({ code: RETURN_CODE.fail, data: null, msg: '用户已存在' })
        }
    })
})

// 修改头像
router.post('/updateavatar', async (req, res) => {
    const { avatar } = req.body
    const token = req.headers.token
    const {userid} = jwt.getuserinfoByToken(token)
    // console.log(userid,avatar)
    // const defaultHeadImg = SERVER_URL+ '/resource/img/icon-default-avatar.png'
    let db_update_res = await userinfo_DB.update({_id:ObjectId(userid)},{avatar})
    // console.log(db_update_res.result)
    const {n,ok} = db_update_res.result
    if(n>0&&ok > 0){
        res.json({ code: RETURN_CODE.success,data: 'success' })
    }else {
        res.json({ code: RETURN_CODE.fail,data: 'fail' })
    }
})

module.exports = router