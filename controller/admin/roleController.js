//角色操作类
var mongoose = require('mongoose');
var Role = mongoose.model("role");

//分页获取角色信息
exports.roles_get = function (req, res) {
    var curr=req.body.curr;
    //每页大小为10
    var query = Role.find({});
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
            Role.find(function(err,result){
                if(result.length%10>0){
                    pages = result.length/10+1;
                }else{
                    pages = result.length/10;
                }
                jsonArray = {data:rs,pages:pages};
                res.json(jsonArray);
            });
        }
    });
}

exports.role_add = function (req, res) {

    var rolename = req.body.rolename;
    var rolecode = req.body.rolecode;
    if(!(rolename) || !(rolecode)){
        res.json({"code":"1", "message":"参数不完整。"});
        return;
    }

    Role.findOne({rolecode:rolecode}, function (err, role) {

        if(err){
            res.json({"code":"1", "message":"access data error"});
            return;
        }
        if(role){
            console.log(role)
            res.json({"code":"1", "message":"rolecode already exists."});
            return;
        }
       var roleEntity = new Role;
        roleEntity.rolename = rolename;
        roleEntity.rolecode = rolecode;
        roleEntity.createTime = new Date();
        roleEntity.save(function (err) {
            if(err){
                res.json({"code":"1", "message":"error occur while adding"});
            }else{
                res.json({"code":"0", "message":"success"});
            }
        });
    });
    
}
//删除一个角色
exports.role_delete = function (req, res) {

    var id = req.body.id;
    if(!(id)){
        res.json({"code":"1", "message":"缺少必要数据"});
        return;
    }
    Role.remove({_id:id}, function (err, doc) {
        if(err){

            res.json({"code":"1", "message":"delete err:"+err});

        }else{
            res.json({"code":"0", "message":"删除成功!"});
        }
    });
    
}