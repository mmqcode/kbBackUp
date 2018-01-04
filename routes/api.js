//api接口路由

var api = require('../controller/api/api');
module.exports = function(app) {

    //app.post("/api/create_customer", api.write_customer);
    app.post("/api/u/get", api.find_or_add);
    app.post("/api/u/charge", api.update_accountBalance);
    app.post("/api/u/bind", api.bind_agent);
}