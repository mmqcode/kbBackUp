var mongoose = require('mongoose');

var adminOperateLog = new mongoose.Schema({

    username:String,
    urlAddress:String,
    requestContent:String,
    describe:String,
    createTime:{type:Date, default:Date.now}

});

mongoose.model("adminOperate", adminOperateLog);