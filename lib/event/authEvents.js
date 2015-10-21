/**
 * User events
 * Used to handle the events related to the current user
 */
var app = require('../main');
var User = require('../model/user').User;
var __ = require("sdk/l10n").get;

var listen = function (worker) {

    // Try to set the security token
    worker.port.on('passbolt.bootstrap.login', function () {
        // Destroy the passbolt application authentication pageMod.
        app.pageMods.passboltAuth.destroy();
        // And restart it to make it able to be initialized regarding the variables we gathered during the setup.
        var passboltAuth = new app.PassboltAuth();
        app.pageMods.passboltAuth = passboltAuth.reset();
    });

};
exports.listen = listen;
