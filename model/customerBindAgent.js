var mongoose = require('mongoose');


/**
 * 客户绑定代理员信息表
 */
var customerBindAgentSchema = new mongoose.Schema({
    customerUUID:String,
    customerNickname:String,

    agentId:String,
    agentName:String,
    createTime:{type:Date, default:Date.now}

});

mongoose.model('customerBindAgent',customerBindAgentSchema);