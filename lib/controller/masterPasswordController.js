/**
 * Master password controller.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/* ==========================================================================
 *  Master password dialog management
 * ==========================================================================
 */
/**
 * This utility function allows to manage several password attempts
 * Currently it is used only when decrypting content but this system
 * can be reusable for other features in the future like authentication
 */
var app = require('../main');
const {defer} = require('sdk/core/promise');
var Keyring = require('../model/keyring').Keyring;
var Worker = require('../model/worker');

var get = function (token) {
    var attempts = 0;
    var deferred = defer(),

        _loop = function (masterPassword) {

            if (typeof masterPassword == 'undefined') {
                app.callbacks[token] = function (token, masterPassword) {
                    _loop(masterPassword);
                };
                Worker.get('App').port.emit('passbolt.keyring.master.request', token);
            }
            else {
                // Only up to 3 attempts are authorized
                if (attempts > 2) {
                    deferred.reject();
                    Worker.get('MasterPassword').port.emit('passbolt.keyring.master.request.complete', token, 'ERROR', attempts);
                    return;
                }
                var keyring = new Keyring();

                // Check the passphrase entered is correct
                keyring.checkPassphrase(masterPassword).then(
                    function() {
                        // If everything went fine close the master password popup.
                        Worker.get('App').port.emit('passbolt.keyring.master.request.close', token);
                        deferred.resolve(masterPassword);
                    },
                    function() {
                        Worker.get('MasterPassword').port.emit('passbolt.keyring.master.request.complete', token, 'ERROR', attempts);
                        attempts++;
                    });
            }
        };

    _loop();

    return deferred.promise;
};
exports.get = get;