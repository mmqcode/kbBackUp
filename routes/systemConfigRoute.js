var systemConfigC = require("../controller/admin/configController");



module.exports = function (app) {
    app.post("/systemConfig/systemConfig_add", systemConfigC.save_system_config);
    app.post("/systemConfig/systemConfig_load", systemConfigC.load_system_config);
}