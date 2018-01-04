var express       = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

//加载ueditor 模块
//var ueditor = require("ueditor");
//图片验证码
var svgCaptcha = require('svg-captcha');

var app = express();
var mongoose=require('./config/mongoose.js');
var db=mongoose();
var mongoose1 = require('mongoose');
var stringTool = require("./tools/stringTool");
var encryptTool = require('./tools/encryptTool');
var jsonTool =   require('./tools/jsonTool');
var SystemConfig = mongoose1.model('systemConfig');
var ErrorCode = require('./tools/errorCode');
var errorMessage =  require('./tools/errorMessage');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//这里周期只设置为20秒，为了方便测试
//secret在正式用的时候务必修改
//express中间件顺序要和下面一致

app.use(session({//session持久化配置
  secret: "KingsBoom",
  key: "KingsBoom",
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//超时时间
  saveUninitialized: true,
  resave: false,
}));

app.get('/captcha', function (req, res) {
  var captcha = svgCaptcha.create({
    size: 4, // 验证码长度
    ignoreChars: '0o1i', // 验证码字符中排除 0o1i
    noise: 1, // 干扰线条的数量
    color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
    background: '#c4c4c5' // background color of the svg image
  });
  //将生成的验证码放在session中
  req.session.captcha = captcha.text;
  console.log( req.session.captcha);
  res.set('Content-Type', 'image/svg+xml');
  res.status(200).send(captcha.data);
});


/*后台登录验证*/
app.use(function(req,res,next){
  if (!req.session.user) {
    if(req.url=="/login"||req.url=="/register"){
      next();//如果请求的地址是登录以及api接口调用，则不拦截，进行下一个请求
    }else if(stringTool.isStartWith(req.url, "/api")){
      //校验接口密码
        SystemConfig.findOne({},function (err, config) {
          var pw = req.body.pw;
          var myPw = config.apiToken;
          if(pw){
              if(pw !== encryptTool.getSha256(myPw)){
                  res.json(jsonTool.get_simple_json(ErrorCode.API_REJECT, errorMessage.get_code_message(ErrorCode.API_REJECT)));
                  return;
              }else{
                next();
              }
          }else{
              res.json(jsonTool.get_simple_json(ErrorCode.API_REJECT, errorMessage.get_code_message(ErrorCode.API_REJECT)));
          }
        });
    }else{
      res.redirect('/login');
    }
  } else if (req.session.user) {
    next();
  }
});
require('./routes/admin')(app);
require('./routes/api')(app);
require('./routes/customer')(app);
require('./routes/logRoute')(app);
require('./routes/roleRoute')(app);
require('./routes/agentRoute')(app);
require('./routes/systemConfigRoute')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
      if(req.url.indexOf("/api/") > 0){
          res.json({"status":"1", "message":err.message});
      }else{
          res.render('admin/error', {
              message: err.message,
              error: {}
          });
      }
  });
}

// production error handler
// no stacktraces leaked to customer
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  if(req.url.indexOf("/api/") > 0){
    res.json({"status":"1", "message":err.message});
  }else{
      res.render('admin/error', {
          message: err.message,
          error: {}
      });
  }
});

module.exports = app;
