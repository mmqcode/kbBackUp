var roleC = require("../controller/admin/roleController");



module.exports = function (app) {

    app.post("/role/role_add", roleC.role_add);
    app.post("/role/roles_get", roleC.roles_get);
    app.post("/role/role_delete", roleC.role_delete);
}