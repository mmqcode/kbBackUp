var mongoose = require('mongoose');

//api请求日志
var apiLogSchema = new mongoose.Schema({

    //目标地址
    apiAddress:String,
    //请求的参数
    requestContent:String,

    //返回数据
    responseContent:String,

    sourceIP:String,
    createTime:{type:Date, default:Date.now}

});

mongoose.model('apiLog',apiLogSchema);