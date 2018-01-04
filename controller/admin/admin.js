// index page

var mongoose=require('mongoose');

var User=mongoose.model('User');

var Customer = mongoose.model('customer');

var  encryptTool = require('../../tools/encryptTool');

// 首页
exports.admin = function(req, res) {
    var isSuper='普通管理员'
    if(req.session.user.status==='2'){
        isSuper='超级管理员'
    }
    res.render('admin/index',{username:req.session.user.username,isSuper:isSuper});
};

// 进入登录页面
exports.login = function(req, res) {
    res.render('admin/login');
};
// 进入注册
exports.register = function(req, res) {
    //暂不提供注册功能
    res.render('admin/login');
    //res.render('admin/register');
};

// post登录信息，校验
exports.checkUser = function(req, res) {
    var username=req.body.username;
    var password=req.body.password;
    var captcha=req.body.captcha;

    if(captcha.toUpperCase() != req.session.captcha.toUpperCase()){
        console.log('captcha error');
        res.json({'status':'captcha error'});
    }else{ //验证码正确
        User.findOne({username:username},function(err,doc){
            password = encryptTool.getSha1(password);
            if(err){
                res.json({'status':'error'});
            }
            else if(doc==null){
                console.log('not exist');
                res.json({'status':'not exist'});
            }else if(doc.status==='0'){
                //如果是刚注册的用户，还未授权无法登陆。
                console.log('unchecked');
                res.json({'status':'unchecked'});
            }else if(doc.password===password){
                console.log('success');
                //登录成功，将user保存到session中
                req.session.user = doc;
                res.json({'status':'success'});
            }else{
                console.log('password error');
                res.json({'status':'password error'});
            }
        });
    }
};

exports.change_password = function (req, res) {
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    var username = req.session.user.username;
    User.findOne({username:username},function (err, doc) {
        oldPassword = encryptTool.getSha1(oldPassword);
        if(err){
            res.json({'status':'error access database!','code':'1'});
        }else{
            if(oldPassword == doc.password){
                doc.password = encryptTool.getSha1(newPassword);
                User.update(doc, function (err, doc) {
                    if(err){
                        res.json({'status':'update error','code':'1'});
                    }else{
                        res.json({'status':'update success','code':'0'});
                    }
                })
            }else{
                res.json({'status':'password incorrect!','code':'1'});
            }
        }
        
    });


    
}

//用户登出操作
exports.logout = function(req, res) {
    req.session.user = null;
    res.redirect('/login');
};


//添加账户
exports.post_register = function(req, res) {
    var username=req.body.username;
    var password=req.body.password;
    var realname=req.body.realname;
    var phone=req.body.phone;
    var captcha=req.body.captcha;

    if(captcha!=req.session.captcha){
        console.log('captcha error');
        res.json({'status':'captcha error'});
    }else{//验证码正确
        var user=new User(
            {
                username:username,
                password:password,
                realname:realname,
                phone:phone,
                status:'0'
            }
        );
        User.findOne({username:username},function(err,doc){
            if(err){
                res.json({'status':'error'});
            }
            else if(doc){
                res.json({'status':'customer exist'});
            }else{
                User.create(user,function(err,doc){
                    if(err){
                        res.json({'status':'add error','code':'1'});
                    }
                    res.json({'status':'add success', 'code':'0'});
                });
            }
        });
    }
};

exports.user_edit = function(req, res){
    var username = req.body.username;
    var realname = req.body.realname;
    var phone = req.body.phone;
    User.findOne({username:username}, function (err, doc) {
        if(err){
            res.json({'message':'error access data', 'code':'1'});
        }else{
            doc.realname = realname;
            doc.phone = phone;
            doc.save(function (err) {
                if(err){
                    res.json({'message':'error access data','code':'1'});
                }else{
                    res.json({'message':'更新成功','code':'0'});
                }
            });
        }
    });

}


//确定授权
exports.authorize= function(req, res) {

    if(req.session.user.status!='2'){
        //0表示普通用户，1表示已授权普通用户，2表示高级用户
        res.json({"status":"noRight"});
    }else{
        var id=req.body.id;
        User.findOne({_id:id},function(err,doc){
            if(err){
                res.json({"status":"error"});
            }else {
                doc.status='1';
                //修改后必须的保存
                doc.save(function(err){
                    if(err){
                        res.json({"status":"error"})
                    }else{
                        res.json({"status":"success"});
                    }
                })
            }
        });
    }
};



exports.add_admin = function(req, res) {
    if(req.session.user.status!='2'){
        //0表示普通账户，1表示已授权普通账户，2表示高级账户
        res.json({"status":"noRight"});
    }else{
        //超级管理员有权利删除操作
        var username=req.body.username;
        var password=req.body.password;
        var realname=req.body.realname;
        var phone=req.body.phone;
        var rolecode = req.body.rolecode;
        var user=new User(
            {
                username:username,
                password:password,
                realname:realname,
                phone:phone,
                status:"0",
                rolecode:rolecode,
                createTime:new Date()
            }
        );
        User.findOne({username:username},function(err,doc){
            if(err){
                res.json({'status':'error'});
            }
            else if(doc){
                res.json({'status':'user_exist'});
            }else{
                User.create(user,function(err,doc){
                    if(err){
                        res.json({'status':'error'});
                    }
                    res.json({'status':'success'});
                });
            }
        });
    }
};
// 分页获取账户
exports.get_users = function(req, res) {
    var curr=req.body.curr;
    //每页大小为10
    var condition = {rolecode:{"$in":["0","1"]}};
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
            User.find(function(err,result){
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
//删除一个账户
exports.user_del = function(req, res) {

    if(req.session.user.status!='2'){
        //0表示普通账户，1表示已授权普通账户，2表示高级账户
        res.json({"status":"noRight"});
    }else{
        var id=req.body.id;
        User.remove({_id:id},function(err,doc){
            if(err){
                res.json({"status":"error"});
            }else{
                res.json({"status":"success"})
            }
        });
    }
};

exports.user_get = function(req, res){
    var username = req.body.username;
    User.find({username:username}, function (err, user) {
        if(err){
            res.json({"status":"error access database", "code":"1"});
        }else{
            res.json({"status":"ok", "code":"1", "user":user});
        }
    })


}