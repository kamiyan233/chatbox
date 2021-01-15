import axios from 'axios'
// import Vue from 'vue'
// import router from '@/router'

import { PORT } from '@/config/constant'


const baseApi = axios.create({
    baseURL: PORT.base,
    // timeout: 1000,
    // headers: {'X-Custom-Header': 'foobar'}
});


// 请求拦截
const request = {
    resolve: config => {
        return config
    },
    reject: error => {
        return Promise.reject(error)
    }
}
//   响应拦截
const response = {
    resolve: response => {
        return response.data
    },
    reject: error => {
        //   const data = error.response && error.response.data ? error.response.data : {}
        //   if (error && error.response && error.response.status === 400) {
        //   }
        //   if (error && error.response && error.response.status === 401) {
        //   }
        //   if (error && error.response && error.response.status === 403) { // 管理端token失效
        //   }
        return Promise.reject(error)
    }
}
// 请求拦截
baseApi.interceptors.request.use(request.resolve, request.reject)
// 响应拦截
baseApi.interceptors.response.use(response.resolve, response.reject)
const setToken = token =>{
    baseApi.defaults.headers.common.token = token
}
export { baseApi, setToken }