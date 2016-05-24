/**
 * Secret Listeners
 *
 * Used for encryption and decryption events
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var masterPasswordController = require('../controller/masterPasswordController');
var Keyring = require('../model/keyring').Keyring;
var Crypto = require('../model/crypto').Crypto;
var app = require('../main');
var Worker = require('../model/worker');
var Secret = require('../model/secret').Secret;
var secret = new Secret();

var listen = function (worker) {

    // Listen to secret validate request event.
    worker.port.on('passbolt.secret.validate', function (token, data) {
        try {
            var validate = secret.validate(data);
            worker.port.emit('passbolt.secret.validate.complete', token, 'SUCCESS', validate);
        } catch (e) {
            worker.port.emit('passbolt.secret.validate.complete', token, 'ERROR', e.message, e.validationErrors);
        }
    });

    // Listen to secret decrypt request event.
    worker.port.on('passbolt.secret.decrypt', function (token, txt) {
        var decrypted = null;
        var crypto = new Crypto();

        // Master pwd is required to decrypt a secret.
        masterPasswordController.get(token, worker)
            .then(function (masterPassword) {

                // Start loading bar.
                Worker.get('App', worker).port.emit('passbolt.event.trigger_to_page', 'passbolt_loading');

                crypto.decrypt(txt, masterPassword)
                    .then(
                        // Success.
                        function(decrypted) {
                            // Stop loading bar.
                            Worker.get('App', worker).port.emit('passbolt.event.trigger_to_page', 'passbolt_loading_complete');
                            // Complete process.
                            worker.port.emit('passbolt.secret.decrypt.complete', token, 'SUCCESS', decrypted);
                        },
                        // Error.
                        function(error) {
                            worker.port.emit('passbolt.secret.decrypt.complete', token, 'ERROR');
                        }
                    )
                    // Exception.
                    .catch(function(error) {
                        worker.port.emit('passbolt.secret.decrypt.complete', token, 'ERROR');
                    });

            }, function () {
                worker.port.emit('passbolt.secret.decrypt.complete', token, 'ERROR');
            });
    });

    // Listen to secret encrypt request event.
    worker.port.on('passbolt.secret.encrypt', function (token, unarmored, usersIds) {
        var keyring = new Keyring();
        var crypto = new Crypto();

        // Ensure the keyring of public keys is in sync.
        keyring.sync()
            .then(function (keysCount) {
                // The encrypted results.
                var armoreds = {},
                    completedGoals = 0;

                // @TODO notifications
                // If at least one public key has been updated, notify the application.
                if (keysCount) {
                    var keysUpdatedTxt = (keysCount > 1) ? ' keys were updated' : ' key was updated';
                    var notification = {
                        'status': 'success',
                        'title': keysCount + keysUpdatedTxt,
                        'message': ''
                    };
                    Worker.get('App', worker).port.emit('passbolt.event.trigger_to_page', 'passbolt_notify', notification);
                }

                // We encrypt for each users and notify the progress
                usersIds.forEach(function(userId) {
                    crypto.encrypt(unarmored, userId)
                        .then(
                            // Success.
                            function(armored) {
                                armoreds[userId] = armored;
                                completedGoals++;
                                worker.port.emit('passbolt.secret.encrypt.progress', token, armored, userId, completedGoals);
                                // Check if it was last.
                                if (completedGoals == usersIds.length) {
                                    worker.port.emit('passbolt.secret.encrypt.complete', token, 'SUCCESS', armoreds, usersIds);
                                }
                            },
                            // Failure.
                            function(error) {
                                worker.port.emit('passbolt.secret.encrypt.complete', token, 'ERROR', error);
                            }
                        )
                        //Exception.
                        .catch(function(error) {
                            worker.port.emit('passbolt.secret.encrypt.complete', token, 'ERROR', error.message);
                        });
                });
            });
    });
};
exports.listen = listen;