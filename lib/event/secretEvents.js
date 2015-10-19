/**
 * Secret Listeners
 * Used for encryption and decryption events
 */

var masterPasswordController = require('../controller/masterPasswordController');
var Keyring = require('../model/keyring').Keyring;
var Crypto = require('../model/crypto').Crypto;
var app = require('../main');

var listen = function (worker) {

    // Listen to secret decrypt request event.
    worker.port.on('passbolt.secret.decrypt', function (token, txt) {
        var decrypted = null;
        var crypto = new Crypto();

        // Master pwd is required to decrypt a secret.
        masterPasswordController.get(token)
            .then(function (masterPassword) {
                decrypted = crypto.decrypt(txt, masterPassword);
                worker.port.emit('passbolt.secret.decrypt.complete', token, 'SUCCESS', decrypted);
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
                    app.workers['App'].port.emit('passbolt.event.trigger_to_page', 'passbolt_notify', notification);
                }

                // We encrypt for each users and notify the progress
                for (var i in usersIds) {
                    var armored = crypto.encrypt(unarmored, usersIds[i]);
                    armoreds[usersIds[i]] = armored;
                    completedGoals++;
                    worker.port.emit('passbolt.secret.encrypt.progress', token, armored, usersIds[i], completedGoals);
                }
                worker.port.emit('passbolt.secret.encrypt.complete', token, 'SUCCESS', armoreds, usersIds);
            });
    });
};
exports.listen = listen;