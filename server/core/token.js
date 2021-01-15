const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs');
// const { resolve } = require('path');
class Jwt{
    constructor(){
        // this.userInfo = data
    }
    createToken(userInfo){
        // let userInfo = this.userInfo
        let createTime = Math.floor(Date.now() / 1000) + (60 * 60)
        var privateKey = fs.readFileSync(path.join(__dirname, '../key/rsa_private_key.pem'));
        let token = jwt.sign({
            data:userInfo,
            exp: createTime
        },privateKey,{ algorithm: 'RS256'})
        return token
    }
    verifyToken(token){
        var cert = fs.readFileSync(path.join(__dirname, '../key/rsa_public_key.pem'))  // get public key
        return new Promise((resolve,reject)=>{
            jwt.verify(token, cert, function(err, decoded) {
                // let success = false
                if(!err){
                    // console.log('验证成功1') // bar
                    // success = true
                    resolve(true)
                }else {
                    // console.error(err,'验证失败')
                    reject(false)
                }
                // console.log(success,'验证成功2') // bar
                // return success
            });
        })
    }
    decoded(token){
        var decoded = jwt.decode(token, {complete: true});
        return decoded
    }
    getuserinfoByToken = token =>{
        var decoded_info = this.decoded(token);
        // console.log(decoded_info.payload)
        const {data,exp} = decoded_info.payload
        // console.log(data,'tokentoken222')
        // let {username,_id} = data
        return data
    }
}
module.exports = new Jwt()