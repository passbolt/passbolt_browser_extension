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

var get = function (func, token) {
    var deferred = defer(),
        funcArgs = Array.slice(arguments, 2),
        funcResult = null,
        attempts = 0,

        _loop = function (masterPassword) {
            var masterPassword = typeof masterPassword != 'undefined' ? masterPassword : null;

            // Only up to 3 attempts are authorized
            if (attempts > 2) {
                deferred.reject();
                app.workers['MasterPassword'].port.emit('passbolt.keyring.master.request.complete', token, 'ERROR', attempts);
                return;
            }

            // Try to launch the function given in parameter with the master password given by the password dialog.
            // The function should throw a REQUEST_MASTER_PASSWORD exception if the given master password is wrong.
            try {
                // Add to the master password to the arguments the function is expected
                var funcArgsWithMp = Array.slice(funcArgs);
                funcArgsWithMp.push(masterPassword);

                // Try to launch the function
                funcResult = func.apply(null, funcArgsWithMp);

                // If everything went fine close the master password popup.
                app.workers['App'].port.emit('passbolt.keyring.master.request.close', token);
                deferred.resolve(funcResult);
            }
            catch (exception) {

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