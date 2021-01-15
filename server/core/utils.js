exports.removePasswordInUserInfo =(arr)=>{
   return arr.map(item=>{
       const {username,_id,avatar,likes,collects,createtime} = item
       return {username,avatar,userid:_id,likes,collects,createtime}
   })
}

exports.removeUserinfoByUserid = (userid,arr) =>{
    for(let i=0;i<arr.length;i++){
        if(userid == arr[i].userid){
            arr.splice(i,1)
        }
    }
    return arr
}
exports.ObjectId = require('mongodb').ObjectId;