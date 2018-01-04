
var mongoose=require('mongoose');

var  customerschema=new mongoose.Schema({
    uid:Number,
    uuid:String,
    nickName:{type:String,default:"游客"},
    avatar:{type:String, default:"http://q1.qlogo.cn/g?b=qq&nk=10000&s=160"},
    gender:String,
    money:Number,//余额
    customerClass:String,
    createTime:{type:Date, default:Date.now},
    updateTime:{type:Date, default:Date.now},
    token:String,
    agentid:String
});

customerschema.pre('save', function(next) {
    var doc = this;
    var counter = mongoose.model('counter');
    counter.findByIdAndUpdate({_id: '1eefdeb04a604ce6b829321c65d57c41'}, {$inc: { seq: 1} }, function(error, counter) {
        if(error)
            return next(error);
        doc.uid = counter.seq;
        next();
    });
});
mongoose.model('customer',customerschema);