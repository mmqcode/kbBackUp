var mongoose=require('mongoose');

var User=mongoose.model('User');

var Customer = mongoose.model('customer');

var AgentRate =  mongoose.model('agentRate');

var  encryptTool = require('../../tools/encryptTool');

var AgentRateInUse = mongoose.model('agentRateInUse');

var AgentShareDetail = mongoose.model('agentShareDetail');
var errorCode = require('../../tools/errorCode');
var errorMessage = require('../../tools/errorMessage');

// 分页获取代理人账户信息
exports.get_agents = function(req, res) {
    var curr=req.body.curr;
    var rolecode = req.body.rolecode;
    var realname = req.body.realname;
    //只查代理人信息
    var condition = {};
    //每页大小为10
    if(rolecode){
        condition.rolecode=+rolecode;
    }
    if(realname){
        condition.realname=realname;
    }
    if(!condition.hasOwnProperty('rolecode') && !condition.hasOwnProperty('realname') ){
        condition = {rolecode:{"$in":["11","12","13"]}};
    }
    var query=User.find(condition);
    query.skip((curr-1)*10);
    query.limit(10);
    //按照id添加的顺序倒序排列
    query.sort({'_id': -1});
    //计算分页数据
    query.exec(function(err,rs){
        if(err){
            res.send(err);
        }else{
            //计算数据总数
            User.find(condition,function(err,result){
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
//添加一个代理员
exports.agent_add = function (req, res){
    //var roleCode = req.body.rolecode;
    var roleCode = "11";//代理人角色
    var mysuperagentid = "";
    var mysuperagentname = "";
    var sessionUser = req.session.user;
    var username = req.body.username;
    var selfRate = req.body.selfRate;
    var firstRate = req.body.firstRate;
    var secondRate = req.body.secondRate;
    var initialAgent = req.body.initialAgent;
    if(roleCode){
        //如果当前账户是代理人，那么指定当前账户为其父级代理
        if(sessionUser.rolecode == "11"){
            mysuperagentid = sessionUser._id;
            mysuperagentname = sessionUser.realname;
        }else{
            //如果添加者为管理员，则需要在参数中指定上级代理
                //如果当前账户是管理员，管理员不能作为代理人的上级代理
                mysuperagentid = req.body.mysuperagentid;
                mysuperagentname = req.body.mysuperagentname;
                //如果是初批代理，设置上级id为"-1"
                if(initialAgent == "1"){
                    mysuperagentid = "-1";
                    mysuperagentname = "无";
                }
                if(!mysuperagentid || mysuperagentid == "" || !mysuperagentname || mysuperagentname == "" ){
                    res.json({"code":"1", "message":"缺少必要参数。"});
                    return;
                }
        }
    }else{
        res.json({"code":"1", "message":"缺少必要参数!"});
    }
    User.findOne({username:username},function (err, user) {
        if(user == null){
            var agentUser = new User;
            agentUser.username = username;
            agentUser.password = encryptTool.getSha1(req.body.password);
            agentUser.realname = req.body.realname;
            agentUser.phone = req.body.phone;
            agentUser.status = "1";
            agentUser.rolecode= roleCode;

            if(mysuperagentid && mysuperagentid != ""){
                agentUser.mysuperagentid = mysuperagentid;
                agentUser.mysuperagentname = mysuperagentname;
            }
            agentUser.save(function (err) {
                if(err){
                    res.json({"code":"1","message":"failed creating agent:"+err});
                    return;
                }else{
                    //添加其对应的分成信息
                    var agentRateInUse = new AgentRateInUse;
                    agentRateInUse.agentid = agentUser._id;
                    agentRateInUse.agentName = agentUser.realname;
                    agentRateInUse.selfRate = selfRate;
                    agentRateInUse.firstRate = firstRate;
                    agentRateInUse.secondRate = secondRate;

                    agentRateInUse.save(function (err) {
                        if(err){

                        }else{
                            res.json({"code":"0","message":"代理人添加成功!"});
                        }
                    });
                }
            });
        }else{
            res.json({"code":"1","message":"用户名已存在!"});
            return;
        }
    });
    
}

//根据角色代码加载上级管理员列表
exports.get_super_agents = function (req, res) {
    var roleCode = req.body.roleCode;
    var sessionUser = req.session.user;
    if(!sessionUser){
        res.json({"code":"1", "message":"用户登录信息超时!"});
        return;
    }
    if(!roleCode || roleCode == ""){
        res.json({"code":"1", "message":"缺少必要参数!"});
        return;
    }


    User.find({rolecode:roleCode}, function (err, users) {
        if(err){
            res.json({"code":"1", "message":"failed to execute query"});
            return;
        }else{
            res.json({"code":"0", "message":"查询成功!", "data":users});
            return;
        }
    });

}

exports.agent_rate_add_or_edit = function (req, res) {

    var selfRate = req.body.selfRate;
    var firstRate = req.body.firstRate;
    var secondRate = req.body.secondRate;

    AgentRate.find({}, function (err, data) {
        if(data && data.length != 0 ){
            //已经有数据，进行修改。
            var agentRateData = data[0];
            agentRateData.selfRate = selfRate;
            agentRateData.firstRate = firstRate;
            agentRateData.secondRate = secondRate;
            agentRateData.save(function (err) {
                if(err){
                    res.json({"code":"1","message":"failed updating agentRate:"+err});
                    return;
                }else{
                    res.json({"code":"0","message":"更新成功!"});
                    return;
                }
            });
        }else{
            //新增
            var agentRate = new AgentRate;
            agentRate.selfRate = selfRate;
            agentRate.firstRate = firstRate;
            agentRate.secondRate = secondRate;
            agentRate.createTime = new Date();
            agentRate.save(function (err) {
                if(err){
                    res.json({"code":"1","message":"failed creating agentRate:"+err});
                    return;
                }else{
                    res.json({"code":"0","message":"添加成功。"});
                }
            });
        }
    });
}

//进入页面加载分成信息
exports.load_agent_rate = function (req, res) {

    var sessionUser = req.session.user;
    if(!sessionUser){
        res.json({"code":"1", "message":"用户登录信息超时!"});
        return;
    }

    AgentRate.findOne({}, function (err, agentRate) {
        if(err){

        }else{
            res.json({"code":"0", "message":"查询成功", "agentRate":agentRate});
            return;
        }

    });
    

    
}

//进入页面加载分成信息
exports.load_agent_rateinuse = function (req, res) {
    var agentId = req.body.agentId;
    AgentRateInUse.findOne({agentid:agentId}, function (err, agentRateInUse) {
        if(err){
            res.json({"code": errorCode.DATABASE_ACCESS_ERROR,
                "message":errorMessage.get_code_message(errorCode.DATABASE_ACCESS_ERROR)});
            return;
        }else{
            res.json({"code":"0", "message":"查询成功", "agentRateInUse":agentRateInUse});
            return;
        }

    });



};

// 分页获取代理人账户信息
exports.get_agent_share_detail = function(req, res) {
    var curr=req.body.curr;
    var rolecode = req.body.rolecode;
    var realname = req.body.realname;

    var condition = {};
    //每页大小为10
    // if(rolecode){
    //     condition.rolecode=+rolecode;
    // }
    // if(realname){
    //     condition.realname=realname;
    // }
    // if(!condition.hasOwnProperty('rolecode') && !condition.hasOwnProperty('realname') ){
    //     condition = {rolecode:{"$in":["11","12","13"]}};
    // }
    var query = AgentShareDetail.find(condition);
    query.skip((curr-1)*10);
    query.limit(10);
    //按照id添加的顺序倒序排列
    query.sort({'_id': -1});
    //计算分页数据
    query.exec(function(err,rs){
        if(err){
            res.send(err);
        }else{
            //计算数据总数
            AgentShareDetail.find(condition,function(err,result){
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