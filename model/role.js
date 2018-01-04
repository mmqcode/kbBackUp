var mongoose = require('mongoose');

var roleschema = new mongoose.Schema({

    rolename:String,
    rolecode:String,
    createTime:{type:Date, default:Date.now}

});

mongoose.model("role", roleschema);