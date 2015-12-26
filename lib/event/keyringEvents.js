/**
 * Keyring events
 * @TODO refactor with public and private listeners separate
 */
// Low level files chrome utilities
const {Cu} = require('chrome');
const {TextDecoder, TextEncoder, OS} = Cu.import('resource://gre/modules/osfile.jsm', {});
var filepickerController = require('../controller/filepickerController');
var Keyring = require("../model/keyring").Keyring;
var keyring = new Keyring();
var __ = require("sdk/l10n").get;
var preferences = require("sdk/preferences/service");

var listen = function (worker) {

    /* ==================================================================================
     *  Get Key info events
     * ================================================================================== */

    // Send the public key information to the content code.
    worker.port.on('passbolt.keyring.public.info', function (token, publicKeyArmored) {
        var info = keyring.keyInfo(publicKeyArmored);
        if (typeof info !== 'undefined') {
            worker.port.emit('passbolt.keyring.public.info.complete', token, 'SUCCESS', info);
        } else {
            worker.port.emit('passbolt.keyring.public.info.complete', token, 'ERROR');
        }
    });

    // Find the public key for a given user and send it to the content code
    worker.port.on('passbolt.keyring.public.get', function (token, userId) {
        var publicKey = keyring.findPublic(userId);
        if (typeof publicKey !== 'undefined') {
            worker.port.emit('passbolt.keyring.public.get.complete', token, 'SUCCESS', publicKey);
        } else {
            worker.port.emit('passbolt.keyring.public.get.complete', token, 'ERROR');
        }
    });

    // Send the private key information to the content code.
    worker.port.on('passbolt.keyring.private.get', function (token) {
        var info = keyring.findPrivate();
        if (typeof info !== 'undefined') {
            worker.port.emit('passbolt.keyring.private.get.complete', token, 'SUCCESS', info);
        } else {
            worker.port.emit('passbolt.keyring.private.get.complete', token, 'ERROR');
        }
    });

    // Find the server key
    worker.port.on('passbolt.keyring.server.get', function (token, userId) {

        var user = new (require("../model/user").User)(),
            Crypto = require('../model/crypto').Crypto,
            serverkeyid = Crypto.uuid(user.settings.getDomain()),
            serverkey = keyring.findPublic(serverkeyid);

        if (typeof serverkey !== 'undefined') {
            worker.port.emit('passbolt.keyring.server.get.complete', token, 'SUCCESS', serverkey);
        } else {
            worker.port.emit('passbolt.keyring.server.get.complete', token, 'ERROR');
        }
    });

    // Extract the public key from a private armored key.
    worker.port.on('passbolt.keyring.public.extract', function (token, privateKeyArmored) {
        var publicKeyArmored = keyring.extractPublicKey(privateKeyArmored);
        if (typeof publicKeyArmored !== 'undefined') {
            worker.port.emit('passbolt.keyring.public.extract.complete', token, 'SUCCESS', publicKeyArmored);
        } else {
            worker.port.emit('passbolt.keyring.public.extract.complete', token, 'ERROR');
        }
    });

    /* ==================================================================================
     *  Import Key & Sync' events
     * ================================================================================== */

    // Listen to import private key event.
    worker.port.on('passbolt.keyring.private.import', function (token, privateKeyArmored) {
        try {
            keyring.importPrivate(privateKeyArmored);
            worker.port.emit('passbolt.keyring.private.import.complete', token, 'SUCCESS');
        } catch(e) {
            worker.port.emit('passbolt.keyring.private.import.complete', token, 'ERROR', e.message)
        }
    });

    // Listen to import public key event.
    worker.port.on('passbolt.keyring.public.import', function (token, publicKeyArmored, userid) {
        try {
            keyring.importPublic(privateKeyArmored, userid);
            worker.port.emit('passbolt.keyring.public.import.complete', token, 'SUCCESS');
        } catch(e) {
            worker.port.emit('passbolt.keyring.public.import.complete', token, 'ERROR', e.message)
        }
    });

    // Listen to import server public key event.
    worker.port.on('passbolt.keyring.server.import', function (token, publicKeyArmored) {
        try {
            var user = new (require("../model/user").User)(),
                Crypto = require('../model/crypto').Crypto,
                serverkeyid = Crypto.uuid(user.settings.getDomain());
            keyring.importPublic(publicKeyArmored, serverkeyid);
            worker.port.emit('passbolt.keyring.server.import.complete', token, 'SUCCESS');
        } catch(e) {
            worker.port.emit('passbolt.keyring.server.import.complete', token, 'ERROR', e.message)
        }
    });

    // Synchronize the public keys with the server
    worker.port.on('passbolt.keyring.sync', function(token) {
        keyring.sync()
            .then(function(keysCount) {
                worker.port.emit('passbolt.keyring.sync.complete', token, 'SUCCESS', keysCount);
            });
    });

    worker.port.on('passbolt.keyring.private.checkpassphrase', function(token, passphrase) {
        keyring.checkPassphrase(passphrase).then(
                function() {
                    worker.port.emit('passbolt.keyring.private.checkpassphrase.complete', token, 'SUCCESS');
                },
                function(error) {
                    worker.port.emit('passbolt.keyring.private.checkpassphrase.complete', token, 'ERROR' ,
                        __('This is not a valid passphrase'));
                }
        );
    });

    /* ==================================================================================
     *  Generate and backups key events
     * ================================================================================== */

    worker.port.on('passbolt.keyring.key.backup', function (token, key, filename) {
        if (filename == undefined) {
            filename = 'passbolt.asc';
        }

        // @todo move to file controller
        let encoder = new TextEncoder();
        let array = encoder.encode(key);


        // Get path.
        var path = "";
        // In case we are running selenium tests, path is taken from preferences,
        // we don't open file selector.
        var folderList = preferences.get("browser.download.folderList");
        var downloadDir = preferences.get("browser.download.dir");
        var showFolderList = (folderList == undefined || folderList != 2);
        if ( showFolderList ) {
            path = filepickerController.saveFilePrompt(filename);
        }
        else {
            path = downloadDir + '/' + filename;
        }

        let promise = OS.File.writeAtomic(path, array);
        promise.then(function () {
            worker.port.emit('passbolt.keyring.key.backup.complete', token, 'SUCCESS');
        }, function () {
            worker.port.emit('passbolt.keyring.key.backup.complete', token, 'ERROR');
        });
    });

    // Generate a new key
    // Called by generate_keys.js in the setup process
    worker.port.on('passbolt.keyring.generateKeyPair', function(token, keyInfo) {
        // Build userId.
        // @TODO move userid build logic to keyring model & perform validation
        var userId = keyInfo.name +
            (keyInfo.comment != '' ? ' (' + keyInfo.comment + ')' : '') +
            ' <' + keyInfo.email + '>';
        keyring.generateKeyPair(userId, keyInfo.masterKey, keyInfo.lgth)
            .then(function(key) {
                worker.port.emit('passbolt.keyring.generateKeyPair.complete', token, 'SUCCESS', key);
            })
            .catch(function(error) {
                worker.port.emit('passbolt.keyring.generateKeyPair.complete', token, 'ERROR', error.message);
            });
    });

};
exports.listen = listen;