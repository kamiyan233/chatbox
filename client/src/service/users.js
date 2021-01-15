import {baseApi} from '@/core/apis'

/**
 * 登录
 * @param {*} params 
 */
export const login = params => baseApi.post(`/user/login`, params)
/**
 * 获取用户
 * @param {*} params 
 */
export const getUserInfo = params => baseApi.post(`/user/getUserInfo`, params)

// 检查token有效 （测试）
export const verifyToken = ()=> baseApi.post('/user/verify')

export const getAllUsers = () => baseApi.post('/user/getAllUsers')
// signup
export const createAccount = params => baseApi.post('/user/signup',params)

// updateavatar
export const updateavatar = params => baseApi.post('/user/updateavatar',params)

// upload
export const uploadfile = params => baseApi.post('https://api.kamiyan.icu/api/upload',params)