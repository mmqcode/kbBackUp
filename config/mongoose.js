
var mongoose=require('mongoose');
var config=require('./db_url.js');

module.exports=function(){
    mongoose.Promise = global.Promise;
    var db=mongoose.connect(config.mongodb,{
            useMongoClient: true,
    });
    require('../model/user.js');
    require('../model/customer.js');
    require('../model/chargingRecord.js');
    require('../model/apiLog.js');
    require('../model/adminLog');
    require('../model/role');
    require('../model/agentRate');
    require('../model/agentRateInUse');
    require('../model/systemConfig');
    require('../model/counter');
    require('../model/customerBindAgent');
    require('../model/agentShareDetail');
    return db;
}