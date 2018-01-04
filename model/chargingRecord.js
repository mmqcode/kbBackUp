var mongoose=require('mongoose');

var chargingRecordSchema = new mongoose.Schema({

    customerUUID:String,
    customerName:String,
    //充值金额
    amount:Number,
    //充值后总金额
    total:Number,
    createTime:{type:Date, default:Date.now}
});

mongoose.model('chargingRecord',chargingRecordSchema);