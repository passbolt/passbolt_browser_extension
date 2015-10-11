/**
 * GPG Keyring events
 * Used to handle generate and synchronize key events
 * @TODO refactor with GpgKeyringListeners
 */
var Gpgkey = require('../model/gpgkey').Gpgkey;
var gpgKey = new Gpgkey();

var listen = function (worker) {

    // Generate a new key
    // Called by generate_keys.js in the setup process
    worker.port.on('passbolt.gpgkey.generate_key_pair', function(token, keyInfo) {
        // Build userId.
        // @TODO move userid build logic to User model
        var userId = keyInfo.name +
            (keyInfo.comment != '' ? ' (' + keyInfo.comment + ')' : '') +
            ' <' + keyInfo.email + '>';
        var key = gpgKey.generateKeyPair(userId, keyInfo.masterKey, keyInfo.lgth);
        worker.port.emit(
            'passbolt.gpgkey.generate_key_pair.complete',
            token,
            'SUCCESS',
            key
        );
    });

    // Synchronize the public keys with the server
    worker.port.on('passbolt.gpgkeys.sync', function(token) {
        gpgKey.sync()
            .then(function(keysCount) {
                worker.port.emit('passbolt.gpgkeys.sync.complete', token, 'SUCCESS', keysCount);
            });
    });

    // Retrieve the public key information.
    worker.port.on('passbolt.gpgkey.publicKeyInfo', function(token, publicArmoredKey) {
        var info = gpgKey.keyInfo(publicArmoredKey);
        worker.port.emit('passbolt.gpgkey.publicKeyInfo.complete', token, 'SUCCESS', info);
    });
};
exports.listen = listen;