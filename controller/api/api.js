var mongoose=require('mongoose');
var Customer = mongoose.model('customer');
var jsonTool = require("../../tools/jsonTool");
var ChargingRecord = mongoose.model('chargingRecord');
var apiLogHandel = require("../../service/apiLogHandel");
var User = mongoose.model('User');
var CustomerBindAgent = mongoose.model('customerBindAgent');
var async = require('async');
var AgentShareDetail = mongoose.model('agentShareDetail');
var AgentRateInUse = mongoose.model("agentRateInUse");
var ErrorCode = require('../../tools/errorCode');
var ErrorMessage =  require('../../tools/errorMessage')

/**
 * 写入用户数据
 */
exports.write_customer = function (req, rsp) {

    var id = req.body.id;
    var name = req.body.name;
    var gender = req.body.gender;
    var accountbalance = req.body.accountBalance;
    var phone = req.body.phone;

    var obj = new Customer({
        id:id,
        name:name,
        gender:gender,
        accountBalance:accountbalance,
        phone:phone
    });
    Customer.findOne({id:obj.id},function(err, doc){
        if(err){
            rsp.json({'status':'error access database!', "code":"1"});
        }else if(doc){
            rsp.json({'status':'用户信息已经存在', "code":"1"});
        }else{
            Customer.create(obj, function (err, doc) {
                if(err){
                    rsp.json({'status':'error access database!', "code":"1"});
                }else{
                    rsp.json({'status':'write success!', "code":"0"});
                }
            });
        }
    })
};

/**
 * 注册或查询用户信息
 * @param req
 * @param res
 */
exports.find_or_add = function(req, res){

    var nickName = req.body.nickName
    var avatar = req.body.avatar;;
    var token = req.body.token;
    var uuid = req.body.token;
    var responseJson;
    if(!token){
        responseJson = jsonTool.get_simple_json(ErrorCode.LACK_TOKEN, ErrorMessage.get_code_message(ErrorCode.LACK_TOKEN));
        apiLogHandel.add_api_log(req.url, req.body, req.ip, responseJson);
        res.json(responseJson);
        return;
    }
    Customer.findOne({uuid:uuid}, function(err, customer){
        if(err){
            responseJson =  jsonTool.get_simple_json(ErrorCode.DATABASE_ACCESS_ERROR, ErrorMessage.get_code_message(ErrorCode.DATABASE_ACCESS_ERROR));
        }else if(customer == null){
            var gender = req.body.gender;
            // var cusotmer = new Customer({
            //     uuid:uuid,
            //     nickName:nickName,
            //     gender:gender,
            //     phone:phone,
            //     accountBalance:0,
            //     customerClass:"A",
            //     createTime:new Date()
            // });
            var cusotmerEntity = new Customer;
            cusotmerEntity.uuid = uuid;
            if(nickName){
                cusotmerEntity.nickName = nickName;
            }
            if(avatar){
                cusotmerEntity.avatar = avatar;
            }
            cusotmerEntity.gender = gender;
            cusotmerEntity.money = 0;
            cusotmerEntity.customerClass = "A";
            cusotmerEntity.createTime = new Date();
            cusotmerEntity.token = token;

            cusotmerEntity.save(function (err) {
                if(err){
                    responseJson =  jsonTool.get_simple_json(ErrorCode.DATABASE_ACCESS_ERROR, ErrorMessage.get_code_message(ErrorCode.DATABASE_ACCESS_ERROR));
                }else{
                    responseJson = {"code":ErrorCode.SUCCESS, "message":ErrorMessage.get_code_message(ErrorCode.SUCCESS),"customer":cusotmerEntity};
                }
                apiLogHandel.add_api_log(req.url, req.body, req.ip, responseJson);
                res.json(responseJson);
            });
        }else{
            responseJson = {"code":ErrorCode.SUCCESS, "message":ErrorMessage.get_code_message(ErrorCode.SUCCESS),"customer":customer};
            res.json(responseJson);
        }
    });

}

/**
 * 更新用户余额信息
 * @param req
 * @param res
 */
exports.update_accountBalance = function (req ,res) {
    apiLogHandel.add_api_log(req.url, req.body, req.ip);
    var uuid = req.body.token;
    var amount =  Number(req.body.amount);

    if(!uuid || !amount){
        res.json(jsonTool.get_simple_json(ErrorCode.LACK_TOKEN_OR_AMOUNT, ErrorMessage.get_code_message(ErrorCode.LACK_TOKEN_OR_AMOUNT)));
        return;
    }
    Customer.findOne({uuid:uuid}, function (err, customer) {
        if(err){
            res.json(jsonTool.get_simple_json(ErrorCode.DATABASE_ACCESS_ERROR,  ErrorMessage.get_code_message(ErrorCode.DATABASE_ACCESS_ERROR)));
        }else if(customer == null){
            res.json(jsonTool.get_simple_json(ErrorCode.CUSTOMER_NOT_FOUND, ErrorMessage.get_code_message(ErrorCode.CUSTOMER_NOT_FOUND)));
        }else{
            CustomerBindAgent.findOne({customerUUID:customer.uuid}, function (err, bindInfo) {
                if(err){

                }else if(bindInfo){
                    //修改用户余额
                    customer.money += amount;
                    customer.updateTime = new Date();
                    customer.save(function (err) {
                        if(err){
                            res.json(jsonTool.get_simple_json(ErrorCode.DATABASE_ACCESS_ERROR, ErrorMessage.get_code_message(ErrorCode.DATABASE_ACCESS_ERROR)));
                        }else{
                            //插入一条充值记录
                            var chargingRecord = new ChargingRecord;
                            chargingRecord.uuid = customer.uuid;
                            chargingRecord.customerName = customer.nickName;
                            chargingRecord.amount = amount;
                            chargingRecord.total = customer.money;
                            chargingRecord.createTime = new Date();
                            chargingRecord.save(function (err) {
                                if(err){
                                    console.log("充值记录写入失败!uuid"+uuid);
                                }else{
                                    //用户充值后计算分配各个代理员的share
                                    if(amount > 0){
                                        var superAgentId;
                                        var ssuperAgentId;
                                        async.waterfall([
                                            function (callBack) {
                                                callBack(null, bindInfo.agentId);
                                            },
                                            function(agentId,callBack){
                                                User.findOne({_id:agentId}, function (err,agent) {
                                                    if(err){
                                                    }else if(agent){
                                                        superAgentId = agent.mysuperagentid;
                                                        callBack(null,agent.mysuperagentid)
                                                    }else{
                                                        callBack(null,"")
                                                    }
                                                });
                                            },
                                            function(mysuperagentid,callBack){
                                                User.findOne({_id:mysuperagentid}, function (err,agent) {
                                                    if(err){
                                                    }else if(agent){
                                                        ssuperAgentId = agent.mysuperagentid;
                                                        callBack(null,agent.mysuperagentid)
                                                    }else{
                                                        callBack(null,"")
                                                    }
                                                });
                                            },
                                        ], function (err, result) {
                                            //console.log(agentId+"!!!!!!"+superAgentId+"!!!!"+ssuperAgentId);
                                            calcMyAgentShare(bindInfo.agentId, amount ,0, customer.nickName, amount);
                                            if(superAgentId && superAgentId !== "" && superAgentId !== "-1"){
                                                calcMyAgentShare(superAgentId, amount ,1, customer.nickName, amount);
                                            }
                                            if(ssuperAgentId && ssuperAgentId !== "" && ssuperAgentId !== "-1"){
                                                calcMyAgentShare(superAgentId, amount ,2, customer.nickName, amount);
                                            }
                                            //异步返回充值成功信息!
                                            res.json(jsonTool.get_simple_json(ErrorCode.SUCCESS,  ErrorMessage.get_code_message(ErrorCode.SUCCESS)));
                                        });
                                    }
                                }
                            });
                        }
                    });
                }else{
                    res.json(jsonTool.get_simple_json(ErrorCode.CUSTOMER_NOT_BIND, ErrorMessage.get_code_message(ErrorCode.CUSTOMER_NOT_BIND)));
                }
            });
        }
    });
}

var calcMyAgentShare = function (agentId, amount, agentClass, CustomerName, amount) {
    //无论是哪个层级的代理，先查询代理分层比例
    AgentRateInUse.findOne({agentid:agentId}, function (err, agentRateInUse) {
        if(err){

        }else if(agentRateInUse){
            if(0 === agentClass){
                //直接代理人
                var rate = parseFloat(agentRateInUse.selfRate);
                var share = amount * rate * agentRateInUse.rateFactor;
                saveAgentShareDetails(agentId, agentRateInUse.agentName, share, "S1", CustomerName, amount);

            }else if(1 === agentClass){
                //上级代理人
                var rate = parseFloat(agentRateInUse.firstRate);
                var share = amount * rate * agentRateInUse.rateFactor;
                saveAgentShareDetails(agentId, agentRateInUse.agentName, share, "S2", CustomerName, amount);
            }else if(2 === agentClass){
                //上上级代理人
                var rate = parseFloat(agentRateInUse.secondRate);
                var share = amount * rate * agentRateInUse.rateFactor;
                saveAgentShareDetails(agentId, agentRateInUse.agentName, share, "S3", CustomerName,amount);
            }

        }else{
            console.log("id为"+agentId+"的代理员无分成信息!");
        }
    });
}

var saveAgentShareDetails = function (agentid, agentName, share, source, customerName, amount) {
    var agentShareDetails = new AgentShareDetail;
    agentShareDetails.agentId = agentid;
    agentShareDetails.agentName = agentName;
    agentShareDetails.amount = share;
    agentShareDetails.source = source;
    agentShareDetails.customerName = customerName;
    agentShareDetails.customerChargeAmount = amount;
    agentShareDetails.save(function (err) {

    });
}

/**
 * 客户绑定代理员
 * @param req
 * @param res
 */
exports.bind_agent = function (req, res) {
    var agentId = req.body.agentId;
    var customerUUID= req.body.token;

    if(!customerUUID || !agentId){
        res.json(jsonTool.get_simple_json(ErrorCode.LACK_TOKEN_OR_AGENTID_WHEN_BIND, ErrorMessage.get_code_message(ErrorCode.LACK_TOKEN_OR_AGENTID_WHEN_BIND)));
        return;
    }
    Customer.findOne({uuid:customerUUID}, function (err, customer) {
        if(err){
            res.json(jsonTool.get_simple_json(ErrorCode.DATABASE_ACCESS_ERROR, ErrorMessage.get_code_message(ErrorCode.DATABASE_ACCESS_ERROR)));
        }else if(null == customer){
            res.json(jsonTool.get_simple_json(ErrorCode.CUSTOMER_NOT_FOUND, ErrorMessage.get_code_message(ErrorCode.CUSTOMER_NOT_FOUND)));
        }else{
            User.findOne({_id:agentId},function (err, user) {
                if(err){
                    res.json(jsonTool.get_simple_json(ErrorCode.DATABASE_ACCESS_ERROR, ErrorMessage.get_code_message(ErrorCode.DATABASE_ACCESS_ERROR)));
                }else if(null == user){
                    res.json(jsonTool.get_simple_json(ErrorCode.AGENT_ID_NOT_FOUND, ErrorMessage.get_code_message(ErrorCode.AGENT_ID_NOT_FOUND)));
                }else{
                    CustomerBindAgent.findOne({customerUUID:customerUUID},function (err, bindInfo) {
                        if(err){

                        }else if(bindInfo){
                            res.json(jsonTool.get_simple_json(ErrorCode.CUSTOMER_ALREADY_BIND, ErrorMessage.get_code_message(ErrorCode.CUSTOMER_ALREADY_BIND)));
                        }else{
                            var bindInfoToAdd = new CustomerBindAgent;
                            bindInfoToAdd.customerUUID = customerUUID;
                            bindInfoToAdd.customerNickname = customer.nickName;
                            bindInfoToAdd.agentId = agentId;
                            bindInfoToAdd.agentName = user.realname;
                            bindInfoToAdd.save(function (err) {
                                if(err){
                                    res.json(jsonTool.get_simple_json(ErrorCode.BIND_INFO_SAVE_ERROR, ErrorMessage.get_code_message(ErrorCode.BIND_INFO_SAVE_ERROR)));
                                }else{
                                    res.json(jsonTool.get_simple_json(ErrorCode.SUCCESS, ErrorMessage.get_code_message(ErrorCode.SUCCESS)));
                                }
                                
                            });
                        }
                    });
                }
            });

        }
        
    });



    
}