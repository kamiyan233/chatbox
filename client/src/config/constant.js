const isprod = process.env.NODE_ENV === 'production'
// 业务接口域名
export const PORT = {
    //正式 http://172.17.123.65:8080/
    base:isprod ? `https://api.kamiyan.icu` : `http://localhost:4000`,
    // base:`http://api.kamiyan.icu`,
    ws:isprod?'https://api.kamiyan.icu':'ws://localhost:4000'
}  

// 接口超时时间
export const TimeoutValue = "10000"

// export const SDK = {
//     jweixin: "https://res.wx.qq.com/open/js/jweixin-1.4.0.js",
//     Alipay:"https://appx/web-view.min.js",
//     amap:"https://appx/web-view.min.js"
// }

export const SOCKET_TYPE = {
    login: 0
}