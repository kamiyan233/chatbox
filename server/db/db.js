const {DB_URL} = require('../config/constant')
const myClient = require('mongodb').MongoClient

module.exports = class DBCollect{
    constructor(collectName){
        myClient.connect(DB_URL,{useNewUrlParser:true, useUnifiedTopology: true},(err,client)=>{
            if(err) throw 'db connect error'

            const dbbase = client.db('mine')
            this.collObj = dbbase.collection(collectName)
        })
    }
    /**
     * 分页查询
     * @param {*} params 查询条件
     * @param {*} page 当前页
     * @param {*} limit 每页数量
     * @param {Object} sort 排序
     */
    async find(params={},page=1,limit=10,sort){
            const query = this.collObj.find(params).sort(sort).limit(limit*1).skip((page-1)*limit)
            try {
                const [data,count] = await Promise.all([await query.toArray(),await query.count()])
                return {data,paging:{page,limit,count}}
                
            } catch (error) {
                console.log(error)
            }
    }
    async findAll(params={}){
        return new Promise((resolve,reject)=>{
            this.collObj.find(params).toArray((err,db_res)=>{
                if(err){
                    reject(err)
                    return
                }
                resolve(db_res)
            })

        })
    }
    // 查询 one
    findone(data={}){
        return this.collObj.findOne(data)
    }
    // 插入
    insert(data){
        let insertParam = []
        if(!Array.isArray(data)){
            insertParam = [data]
        }else{
            insertParam = data
        }
        return new Promise((resolve,reject)=>{
            this.collObj.insertMany(insertParam,(err,res)=>{
                if (err) {
                    reject(err)
                }else{
                    resolve(res)
                }
            })
        })
    }
    // 更新
    update(whereData,updateData){
        
        return new Promise((resolve,reject)=>{
            this.collObj.updateMany(whereData,{$set:updateData},(err,res)=>{
                if (err) {
                    reject(err)
                }else{
                    resolve(res)
                }
            })
        })
    }
    // 删除
    delete(data){
        return new Promise((resolve,reject)=>{
            this.collObj.deleteMany(data,(err,res)=>{
                if (err) {
                    reject(err)
                }else{
                    resolve(res)
                }
            })
        })
    }
}