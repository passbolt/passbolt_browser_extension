/**
 * Auth events.
 *
 * Used to handle the events related to authentication.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Auth = require('../model/auth').Auth;
var auth = new Auth();
var app = require('../main');
var __ = require("sdk/l10n").get;
var Worker = require('../model/worker');

var listen = function (worker) {
    var workerContext = Worker.getContext(worker);

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

    // Listen to the request to get the server key.
    worker.port.on('passbolt.auth.getServerKey', function (token, domain) {
        auth.getServerKey(domain).then(
            function success(msg) {
                worker.port.emit('passbolt.auth.getServerKey.complete', token, 'SUCCESS', msg);
            },
            function error(msg) {
                worker.port.emit('passbolt.auth.getServerKey.complete', token, 'ERROR', msg);
            }
        );
    });

    // Listen to event to perform the login
    worker.port.on('passbolt.auth.login', function (token, masterpassword) {
        Worker.get('Auth', workerContext).port.emit('passbolt.auth.login.start', token, 'SUCCESS', __('Logging in'));
        auth.login(masterpassword).then(
            function success(referrer) {
                // redirect
                var msg = __('You are now logged in!');
                Worker.get('Auth', workerContext).port.emit('passbolt.auth.login.complete', token, 'SUCCESS', msg, referrer);
            },
            function error(msg) {
                Worker.get('Auth', workerContext).port.emit('passbolt.auth.login.complete', token, 'ERROR', msg);
            }
        );
    });

};

exports.listen = listen;
