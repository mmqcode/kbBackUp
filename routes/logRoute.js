var logC = require("../controller/admin/logController");


module.exports = function(app){

    app.post("/log/apiLog_get", logC.apiLogs_get);


}