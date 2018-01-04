var mongoose = require('mongoose');

//代理分成
var agentRateSchema = new mongoose.Schema({

    //自有客户分成
    selfRate:String,
    //一级代理客户分成
    firstRate:String,
    //二级代理客户分成
    secondRate:String,

    createTime:{type:Date, default:Date.now}

});

mongoose.model('agentRate',agentRateSchema);