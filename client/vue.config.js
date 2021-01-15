module.exports = {
    lintOnSave: true,
    publicPath: '/chatbox/',
    productionSourceMap: false,
    css: {
        loaderOptions: {
            sass: {
                additionalData: '@import "~@/variables.scss";'
            },
            postcss: {
                // plugins: {
                //     'postcss-pxtorem': {
                //       rootValue: 37.5,
                //       propList: ['*'],
                //     },
                // }
                plugins: [
                    require('postcss-pxtorem')({
                        rootValue : 37.5, // 换算的基数
                        // selectorBlackList  : ['weui','mu'], // 忽略转换正则匹配项
                        propList   : ['*'],
                    }),
                ]
            }
        }
    },

    outputDir: undefined,
    assetsDir: undefined,
    runtimeCompiler: undefined,
    parallel: undefined
}