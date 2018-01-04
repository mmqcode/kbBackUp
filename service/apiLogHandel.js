var mongoose=require('mongoose');
var ApiLog = mongoose.model("apiLog");


/**
 * 保存api请求日志
 * @param apiAddress
 * @param requestContent
 * @param sourceIP
 */
exports.add_api_log = function (apiAddress, requestContent, sourceIP, responseContent) {

    var apiLog = new ApiLog;

    apiLog.apiAddress = apiAddress;
    apiLog.requestContent = JSON.stringify(requestContent);
    apiLog.sourceIP = sourceIP;
    apiLog.responseContent =  JSON.stringify(responseContent);

    apiLog.save(function (err) {
        if(err){
            console.log("api log save error!");
        }
    });
    
}
