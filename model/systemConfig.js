var mongoose = require('mongoose');

//api请求日志
var systemConfigSchema = new mongoose.Schema({
    //apiToken
    apiToken:String,
    createTime:{type:Date, default:Date.now}

});

mongoose.model('systemConfig',systemConfigSchema);