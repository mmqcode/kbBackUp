
var mongoose = require('mongoose');

//代理员佣金获取细节
var agentShareDetailSchema = new mongoose.Schema({

    //代理人id
    agentId:String,
    //代理人姓名
    agentName:String,

    //本次获取佣金额
    amount:Number,
    /**
     * 佣金来源
     * S1:自有客户充值，S2:下级代理客户充值，S3:次级代理充值
     */
    source:String,

    customerName:String,

    customerChargeAmount:Number,

    //本次充值后总佣金额
    total:Number,

    createTime:{type:Date, default:Date.now}

});

mongoose.model('agentShareDetail',agentShareDetailSchema);