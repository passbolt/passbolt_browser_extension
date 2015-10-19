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

var get = function (token) {
    var deferred = defer(),
        attempts = 0,

        _loop = function (masterPassword) {
            var masterPassword = typeof masterPassword != 'undefined' ? masterPassword : null;

            // Only up to 3 attempts are authorized
            if (attempts > 2) {
                deferred.reject();
                app.workers['MasterPassword'].port.emit('passbolt.keyring.master.request.complete', token, 'ERROR', attempts);
                return;
            }
            var keyring = new Keyring();

            // Check the passphrase entered is correct
            if (keyring.checkPassphrase(masterPassword)) {
                // If everything went fine close the master password popup.
                app.workers['App'].port.emit('passbolt.keyring.master.request.close', token);
                deferred.resolve(masterPassword);
            } else {
                // If the user already attempt to fill the master password through the given popup.
                if (masterPassword !== null) {
                    app.workers['MasterPassword'].port.emit('passbolt.keyring.master.request.complete', token, 'ERROR', attempts);
                }
                // Launch the master password popup.
                else {
                    app.callbacks[token] = function (token, masterPassword) {
                        _loop(masterPassword);
                    };
                    app.workers['App'].port.emit('passbolt.keyring.master.request', token);
                }
            }
            attempts++;
        };

    _loop();

    return deferred.promise;
};
exports.get = get;