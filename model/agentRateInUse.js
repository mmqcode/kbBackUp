var mongoose = require('mongoose');

//代理分成信息设置
var agentRateInUseSchema = new mongoose.Schema({

    //代理人id
    agentid:String,
    //代理人姓名
    agentName:String,
    //自有客户分成
    selfRate:String,
    //一级代理客户分成
    firstRate:String,
    //二级代理客户分成
    secondRate:String,
    createTime:{type:Date, default:Date.now},
    rateFactor:{type:Number, default:1}

});

mongoose.model('agentRateInUse',agentRateInUseSchema);