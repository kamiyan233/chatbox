const router = require('express').Router();
const multer = require('multer')
const fs = require('fs')

const {SERVER_URL,RETURN_CODE} = require('../../config/constant')
const {ObjectId} = require('../../core/utils')

const {userinfo_DB} = require("../../db")
const logger = require('../../core/log')
const upload = multer()


// 上传文件
router.post('/upload',upload.any(),(req, res) => {
    // console.log(req.files)
    let des_file = './upload/' + req.files[0].originalname
    // fs.readFile(req.files[0].path,(err,data)=>{
    //     if(err){
    //         console.log(err,'readFile error')
    //         return
    //     }
        fs.writeFile(des_file,req.files[0].buffer,err=>{
            if(err){
                // console.log(err)
                res.json({
                    code: RETURN_CODE.fail,
                    msg:'upload fail'
                })
            }else{
                res.json({
                    code: RETURN_CODE.success,
                    data:{imgURL:SERVER_URL+'/upload/'+req.files[0].originalname},
                    msg:'upload success'
                })
            }
        })
    // })
})
// 删除用户
router.post('/deluser', (req, res) => {
    const { _id } = req.body
    userinfo_DB.delete({_id:ObjectId(_id)}).then(db_res=>{
        // console.log(db_res.result)
        const {n,ok} = db_res.result
        if(n>0&&ok){
            res.json({ code: RETURN_CODE.success,data: 'success',msg:'删除成功' })
        }else{
            res.json({ code: RETURN_CODE.fail,data: 'faill',msg:'删除失败' })
        }
    })
})


module.exports = router