var Customer = require('../controller/admin/customerController');


module.exports = function(app) {

    //app.post('/customer/customer_delete', Customer);
    app.post('/customer/customers_get', Customer.customers_get);
    app.post('/customer/chargingRecord_get', Customer.changingRecords_get);
}