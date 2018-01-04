
exports.isStartWith = function (str, targetStr) {

    return str.startWith(targetStr);

}



String.prototype.startWith=function(str){
    var reg=new RegExp("^"+str);
    return reg.test(this);
}


