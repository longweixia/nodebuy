var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser'); //做cookie处理的中间价
var bodyParser = require("body-parser") //做cookie处理的中间价
var ejs = require('ejs'); //新引入
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var goodsRouter = require('./routes/goods');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, './views'));
app.engine('html', ejs.__express); //新引入
app.set('view engine', 'html'); //新引入

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 设置登录拦截
app.use(function (req, res, next) {
  // 有userid就不拦截
  if (req.cookies.userId) {
    next();
  } else {
    // 把 originalUrl当前接口的url 的登录和登出，商品列表设置为白名单，让其走下去，不拦截
    // req.path 会获取到去掉参数的路径
    // 可以把两种url打印出来对比一下
    if (req.originalUrl == '/users/login' || req.originalUrl == '/users/loginout' || req.path == '/goods/list') {
      next();
    }else{
      res.json({
        status:'10001',
        msg:"当前未登录",
        result:""
      })
    }
  }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/goods', goodsRouter);

// 捕获4040页面
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// 捕获错误页面
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
