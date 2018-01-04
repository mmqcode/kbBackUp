var mongoose=require('mongoose');
var User = mongoose.model('User');

var SystemConfig = mongoose.model('systemConfig');




//进入页面加载配置
exports.load_system_config = function (req, res) {

    var sessionUser = req.session.user;
    if(!sessionUser){
        res.json({"code":"1", "message":"用户登录信息超时!"});
        return;
    }

    SystemConfig.findOne({}, function (err, systemConfig) {
        if(err){

        }else{
            res.json({"code":"0", "message":"查询成功", "systemConfig":systemConfig});
            return;
        }
    });

}

exports.save_system_config = function (req, res) {

    var apiToken = req.body.apiToken;
    var sessionUser = req.session.user;
    if(!sessionUser){
        res.json({"code":"1", "message":"用户登录信息超时!"});
        return;
    }

    SystemConfig.findOne({}, function (err, systemConfig) {
        if(err){

        }else{
            if(systemConfig){

            }else{
                systemConfig = new SystemConfig;
            }
            systemConfig.apiToken = apiToken;
            systemConfig.save(function (err) {
                if(err){
                    res.json({"code":"0", "message":"操作成功!"});
                    return;
                }else{
                    res.json({"code":"0", "message":"操作成功!"});
                    return;
                }
                
            });

        }
    });

}