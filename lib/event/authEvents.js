/**
 * User events
 * Used to handle the events related to the current user
 */
var Auth = require('../model/auth').Auth;
var auth = new Auth();
var __ = require("sdk/l10n").get;

var listen = function (worker) {

    // Listen to the request to verify the server identity
    worker.port.on('passbolt.auth.verify', function (token) {
        auth.verify().then(
            function success(msg) {
                worker.port.emit('passbolt.auth.verify.complete', token, 'SUCCESS', msg);
            },
            function error(msg) {
                worker.port.emit('passbolt.auth.verify.complete', token, 'ERROR', msg);
            }
        );
    });

    // Listen to event to perform the login
    worker.port.on('passbolt.auth.login', function (token, masterpassword) {
        auth.login(masterpassword).then(
            function success(referrer) {
                // init the app pagemod
                var app = require('../main');
                app.pageMods.passboltApp.init();

                // redirect
                var msg = __('You are now logged in!');
                worker.port.emit('passbolt.auth.login.complete', token, 'SUCCESS', msg, referrer);
            },
            function error(msg) {
                worker.port.emit('passbolt.auth.login.complete', token, 'ERROR', msg);
            }
        );
    });

};

exports.listen = listen;
