var mongoose=require('mongoose');

var  userschema=new mongoose.Schema({
    username:String,
    password:String,
    realname:String,
    phone:String,
    //用户状态
    status:String,
    createTime:{type:Date, default:Date.now},
    rolecode:String,
    mysuperagentid:String,
    mysuperagentname:String
});

mongoose.model('User',userschema);