/*
 * GPG Keyring events
 * Used to handle generate and synchronize key events
 * @TODO refactor with GpgKeyringListeners
 */
var gpgkeyController = require("../controller/gpgkeyController");

var listen = function (worker) {

    // Generate a new key
    // Called by generate_keys.js in the setup process
    worker.port.on("passbolt.gpgkey.generate_key_pair", function(token, keyInfo) {
        // Build userId.
        // @todo move userid build logic ot GpgKeyController
        var userId = keyInfo.name +
            (keyInfo.comment != '' ? " (" + keyInfo.comment + ")" : "") +
            " <" + keyInfo.email + ">";
        var key = gpgkeyController
            .generateKeyPair(worker, userId, keyInfo.masterKey, keyInfo.lgth);
        worker.port.emit(
            "passbolt.gpgkey.generate_key_pair.complete",
            token,
            'SUCCESS',
            key
        );
    });

    // Synchronize the public keys with the server
    worker.port.on("passbolt.gpgkeys.sync", function(token) {
        gpgkeyController.sync(worker)
            .then(function(keysCount) {
                worker.port.emit("passbolt.gpgkeys.sync.complete", token, 'SUCCESS', keysCount);
            });
    });

    // Retrieve the public key information.
    worker.port.on("passbolt.gpgkey.publicKeyInfo", function(token, publicArmoredKey) {
        var info = gpgkeyController.publicKeyInfo(worker, publicArmoredKey);
        worker.port.emit("passbolt.gpgkey.publicKeyInfo.complete", token, 'SUCCESS', info);
    });
};
exports.listen = listen;