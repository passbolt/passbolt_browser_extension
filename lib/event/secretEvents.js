/**
 * Secret Listeners
 * Used for encryption and decryption events
 */

var masterPasswordController = require('../controller/masterPasswordController');
var Gpgkey = require('../model/gpgkey').Gpgkey;
var secretController = require('../controller/secretController');
var app = require('../main');

var listen = function (worker) {

    // Listen to secret decrypt request event.
    worker.port.on('passbolt.secret.decrypt', function (token, txt) {
        var decrypted = null;

        // Master pwd is required to decrypt a secret.
        masterPasswordController.get(secretController.decrypt, token, worker, txt)
            .then(function (decrypted) {
                worker.port.emit('passbolt.secret.decrypt.complete', token, 'SUCCESS', decrypted);
            }, function () {
                worker.port.emit('passbolt.secret.decrypt.complete', token, 'ERROR');
            });
    });

    // Listen to secret encrypt request event.
    worker.port.on('passbolt.secret.encrypt', function (token, unarmored, usersIds) {
        // Ensure the keyring of public keys is in sync.
        gpgkey = new Gpgkey();
        gpgkey.sync()
            .then(function (keysCount) {
                // The encrypted results.
                var armoreds = {},
                    completedGoals = 0;

                // @TODO something generic for notifications
                // If at least one public key has been updated, notify the application.
                if (keysCount) {
                    var keysUpdatedTxt = ' key was updated';
                    if (keysCount > 1) {
                        keysUpdatedTxt = ' keys were updated';
                    }
                    var notification = {
                        'status': 'success',
                        'title': keysCount + keysUpdatedTxt,
                        'message': ''
                    };
                    app.workers['App'].port.emit('passbolt.event.trigger_to_page', 'passbolt_notify', notification);
                }

                // @TODO move to a crypto model
                // We encrypt for each users and notify the progress
                for (var i in usersIds) {
                    var armored = secretController.encrypt(worker, unarmored, usersIds[i]);
                    armoreds[usersIds[i]] = armored;
                    completedGoals++;
                    worker.port.emit('passbolt.secret.encrypt.progress', token, armored, usersIds[i], completedGoals);
                }
                worker.port.emit('passbolt.secret.encrypt.complete', token, 'SUCCESS', armoreds, usersIds);
            });
    });
};
exports.listen = listen;