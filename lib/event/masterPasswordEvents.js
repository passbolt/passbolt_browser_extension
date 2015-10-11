/**
 * Master password Listeners
 */
var app = require('../main');

var listen = function (worker) {
    worker.port.on('passbolt.keyring.master.request.submit', function (token, masterPassword) {
        app.callbacks[token](token, masterPassword);
    });
};
exports.listen = listen;