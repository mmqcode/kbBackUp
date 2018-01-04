
//用户操作controller

var mongoose = require('mongoose');
var Customer = mongoose.model('customer');
var ChargingRecord = mongoose.model('chargingRecord');
var CustomerBindAgent = mongoose.model('customerBindAgent');

// 分页获取用户信息
exports.customers_get = function(req, res) {
    var curr=req.body.curr;
    var nickName = req.body.nickName;
    var startDate = req.body.startDate;
    var endDate = req.endDate;
    var findCondiction = {};
    if(nickName){
        findCondiction.nickName = nickName
    }
    if(startDate){
        findCondiction.startDate = startDate;
    }
    console.log(findCondiction);
    //每页大小为10
    var query = Customer.find({});
    query.skip((curr-1)*10);;
    query.limit(10)
    //按照id添加的顺序倒序排列
    query.sort({'_id': -1});
    //计算分页数据
    query.exec(function(err,rs){
        if(err){
            res.send(err);
        }else{
            //计算数据总数
            Customer.find(function(err,result){
                if(result.length%10>0){
                    pages=result.length/10+1;
                }else{
                    pages=result.length/10;
                }
                for(var i = 0; i < rs.length; i++){
                    (function(num){
                        CustomerBindAgent.findOne({customerUUID:rs[num].uuid}, function (err,bindInfo) {
                            if(err){

                            }else if(bindInfo){
                                rs[num]._doc.myAgent = bindInfo.agentName;
                                if((num+1) === rs.length){
                                    jsonArray={data:rs,pages:pages};
                                    res.json(jsonArray);
                                }
                            }else{
                                if((num+1) === rs.length){
                                    jsonArray={data:rs,pages:pages};
                                    res.json(jsonArray);
                                }
                            }
                        });
                    })(i);
                }
            });
        }
    });
};

// 分页获取充值记录
exports.changingRecords_get = function(req, res) {
    var curr=req.body.curr;
    //每页大小为10
    var nickName = req.body.nickName;
    var startDate = req.body.startDate;
    var endDate = req.endDate;
    var findCondiction = {};
    if(nickName){
        eval("findCondiction.nickName="+nickName);
    }
    if(startDate){
        eval("findCondiction.startDate="+startDate);
    }
    console.log(findCondiction);
    var query = ChargingRecord.find({});
    query.skip((curr-1)*10);;
    query.limit(10)
    //按照id添加的顺序倒序排列
    query.sort({'_id': -1});
    //计算分页数据
    query.exec(function(err,rs){
        if(err){
            res.send(err);
        }else{
            //计算数据总数
            ChargingRecord.find(function(err,result){
                if(result.length%10>0){
                    pages=result.length/10+1;
                }else{
                    pages=result.length/10;
                }
                jsonArray={data:rs,pages:pages};
                res.json(jsonArray);
            });
        }
    });
};
