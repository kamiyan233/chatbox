var express = require('express');
var app = express();

const jwt = require('./core/token')
const {RETURN_CODE} = require('./config/constant')

app.use(require("body-parser").json());
app.use(require("body-parser").urlencoded({
  extended: false
}));
//设置允许跨域访问该服务.
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,token,origin, x-requested-with');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  // res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

// 校验token
// 需要校验token的接口
const NEED_VERIFY_TOKEN_ROUTER = ['/user/getAllUsers', '/user/getUserInfo']
app.use((req, res, next) => {
  // console.log(req.url)  req.url != '/user/login' && req.url != '/user/register'
  if (NEED_VERIFY_TOKEN_ROUTER.includes(req.url)) {
    let token = req.headers.token;
    jwt.verifyToken(token).then(() => {
      next();
    }).catch(err => {
      res.send({
        code: RETURN_CODE.fail,
        data: null,
        msg: '登录已过期,请重新登录'
      })
    })
  } else {
    next();
  }
})
// 静态资源访问
app.use('/upload',express.static('upload'))
// 客户端接口
app.use('/user', require('./api/home/user'));
// 上传接口和后台接口
app.use('/api', require('./api/back/api'));

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });


module.exports = app;