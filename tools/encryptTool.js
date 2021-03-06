var crypto = require('crypto');
/**
 * @sha1加密模块 (加密固定,不可逆)
 * @param str string 要加密的字符串
 * @retrun string 加密后的字符串
 * */
exports.getSha1 = function(str) {
    var sha1 = crypto.createHash("sha1");//定义加密方式
    sha1.update(str);
    var res = sha1.digest("hex");  //加密后的值d
    return res;
}

/**
 * @sha1加密模块 (加密固定,不可逆)
 * @param str string 要加密的字符串
 * @retrun string 加密后的字符串
 * */
exports.getSha256 = function(str) {
    var sha1 = crypto.createHash("sha256");//定义加密方式
    sha1.update(str);
    var res = sha1.digest("hex");  //加密后的值d
    return res;
}


