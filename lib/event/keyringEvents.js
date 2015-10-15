/**
 * Keyring events
 * @TODO refactor with public and private listeners separate
 */
// Low level files chrome utilities
const {Cu} = require('chrome');
const {TextDecoder, TextEncoder, OS} = Cu.import('resource://gre/modules/osfile.jsm', {});
var filepickerController = require('../controller/filepickerController');
var Gpgkey = require("../model/gpgkey").Gpgkey;
var gpgkey = new Gpgkey();

var listen = function (worker) {

    // Send the private key information to the content code.
    worker.port.on('passbolt.keyring.privateKeyInfo', function (token) {
        var info = gpgkey.findPrivate();
        if (typeof info != 'undefined') {
            worker.port.emit('passbolt.keyring.privateKeyInfo.complete', token, 'SUCCESS', info);
        } else {
            worker.port.emit('passbolt.keyring.privateKeyInfo.complete', token, 'ERROR');
        }
    });

    // Send the public key information to the content code.
    worker.port.on('passbolt.keyring.publicKeyInfo', function (token, publicKeyArmored) {
        var info = gpgkey.keyInfo(publicKeyArmored);
        if (typeof info != 'undefined') {
            worker.port.emit('passbolt.keyring.publicKeyInfo.complete', token, 'SUCCESS', info);
        } else {
            worker.port.emit('passbolt.keyring.publicKeyInfo.complete', token, 'ERROR');
        }
    });

    // Find the public key for a given user.
    worker.port.on('passbolt.keyring.findPublicKey', function (token, userId) {
        var publicKey = gpgkey.findPublic(userId);
        if (typeof publicKey != 'undefined') {
            worker.port.emit('passbolt.keyring.findPublicKey.complete', token, 'SUCCESS', publicKey);
        } else {
            worker.port.emit('passbolt.keyring.findPublicKey.complete', token, 'ERROR');
        }
    });

    // Extract the public key from a private armored key.
    worker.port.on('passbolt.keyring.extractPublicKey', function (token, privateKeyArmored) {
        var publicKeyArmored = gpgkey.extractPublicKey(privateKeyArmored);
        if (typeof publicKeyArmored != 'undefined') {
            worker.port.emit('passbolt.keyring.extractPublicKey.complete', token, 'SUCCESS', publicKeyArmored);
        } else {
            worker.port.emit('passbolt.keyring.extractPublicKey.complete', token, 'ERROR');
        }
    });

    // Listen to import private key event.
    worker.port.on('passbolt.keyring.private.import', function (token, privateKeyArmored) {
        var eventName = 'passbolt.keyring.private.import.complete';
        try {
            gpgkey.importPrivate(privateKeyArmored);
            worker.port.emit(eventName, token, 'SUCCESS');
        } catch(e) {
            worker.port.emit(eventName, token, 'ERROR', e.message)
        }
    });

    // Listen to import public key event.
    worker.port.on('passbolt.keyring.public.import', function (token, publicKeyArmored, userid) {
        try {
            gpgkey.importPublic(privateKeyArmored, userid);
            worker.port.emit(eventName, token, 'SUCCESS');
        } catch(e) {
            worker.port.emit(eventName, token, 'ERROR', e.message)
        }
    });

    // The user wants to save his generated key.
    worker.port.on('passbolt.setup.backup_key', function (token, key) {
        // @todo move to file controller
        let encoder = new TextEncoder();
        let array = encoder.encode(key);
        let path = filepickerController.saveFilePrompt('passbolt.asc');
        let promise = OS.File.writeAtomic(path, array);

        promise.then(function () {
            worker.port.emit('passbolt.setup.backup_key.complete', token, 'SUCCESS');
        }, function () {
            worker.port.emit('passbolt.setup.backup_key.complete', token, 'ERROR');
        });
    });
};
exports.listen = listen;