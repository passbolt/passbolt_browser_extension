var Config = require('./config');
var Settings = require("./settings").Settings;
var openpgp = require('../vendors/openpgp');
var storage = new (require('../vendors/node-localstorage').LocalStorage)();
var keyring = new openpgp.Keyring();
var Request = require('sdk/request').Request;
var Validator = require('../vendors/validator.js');
const { defer } = require('sdk/core/promise');
var __ = require("sdk/l10n").get;

/**
 * The class that deals with Passbolt Keyring.
 */
var Keyring = function () {
    this.keyring = new openpgp.Keyring();
    this.publicKeys = {};
    this.privateKeys = {};

    // Get the public keys from the local storage.
    var pubSerialized = storage.getItem('passbolt-public-gpgkeys');
    if (pubSerialized) {
        this.publicKeys = JSON.parse(pubSerialized);
    }

    // Get the private keys from the local storage.
    var pvtSerialized = storage.getItem('passbolt-private-gpgkeys');
    if (pvtSerialized) {
        this.privateKeys = JSON.parse(pvtSerialized);
    }
};

/**
 * Constants
 * @type {string}
 */
Keyring.PUBLIC_HEADER = '-----BEGIN PGP PUBLIC KEY BLOCK-----';
Keyring.PUBLIC_FOOTER = '-----END PGP PUBLIC KEY BLOCK-----';
Keyring.PRIVATE_HEADER = '-----BEGIN PGP PRIVATE KEY BLOCK-----';
Keyring.PRIVATE_FOOTER = '-----END PGP PRIVATE KEY BLOCK-----';
Keyring.PUBLIC = 'PUBLIC';
Keyring.PRIVATE = 'PRIVATE';
Keyring.MY_KEY_ID = 'MY_KEY_ID'; // @TODO use crypto::uuid(user.id) instead

/**
 * Store the gpgkeys in local storage.
 */
Keyring.prototype.store = function () {
    storage.setItem('passbolt-public-gpgkeys', JSON.stringify(this.publicKeys));
    storage.setItem('passbolt-private-gpgkeys', JSON.stringify(this.privateKeys));
};

/**
 * Flush the Keyring.
 * @param type The type of keys to flush (PUBLIC/PRIVATE). Default PUBLIC.
 */
Keyring.prototype.flush = function (type) {
    var type = type || Keyring.PUBLIC;

    if(typeof type === 'undefined') {
        this.privateKeys = {};
        this.publicKeys = {};
    }
    else if (type == Keyring.PUBLIC) {
        this.publicKeys = {};
    } else if (type == Keyring.PRIVATE) {
        this.privateKeys = {};
    }

    // Removed latestSync variable.
    // We consider that the keyring has never been synced.
    storage.deleteItem('latestSync');

    // Update the local storage.
    this.store();
};

/**
 * Parse an armored key and extract Public or Private sub string.
 * @param armoredKey The key to parse.
 * @param type Parse for PUBLIC or PRIVATE.
 * @returns {*|string}
 */
var parseArmoredKey = function (armoredKey, type) {
    // The type of key to parse. By default the PRIVATE.
    var type = type || Keyring.PRIVATE;
    // The parsed key. If no header found the output will be the input.
    var key = armoredKey || '';

    if (type == Keyring.PUBLIC) {
        // Check if we find the public header & footer.
        var pubHeaderPos = armoredKey.indexOf(Keyring.PUBLIC_HEADER);
        if (pubHeaderPos != -1) {
            var pubFooterPos = armoredKey.indexOf(Keyring.PUBLIC_FOOTER);
            if (pubFooterPos != -1) {
                key = armoredKey.substr(pubHeaderPos, pubFooterPos + Keyring.PUBLIC_FOOTER.length);
            }
        }
    } else if (type == Keyring.PRIVATE) {
        // Check if we find the private header & footer.
        var privHeaderPos = armoredKey.indexOf(Keyring.PRIVATE_HEADER);
        if (privHeaderPos != -1) {
            var privFooterPos = armoredKey.indexOf(Keyring.PRIVATE_FOOTER);
            if (privFooterPos != -1) {
                key = armoredKey.substr(privHeaderPos, privFooterPos + Keyring.PRIVATE_HEADER.length);
            }
        }
    }

    return key;
};

/**
 * Import a public key.
 * @param armoredPublicKey The key to import.
 * @param userid the user uuid
 * @returns {Object|string} Return the openpgp key if imported with success.
 * Otherwise return an error string message.
 */
Keyring.prototype.importPublic = function (armoredPublicKey, userid) {
    // Check user id
    if(typeof userid === 'undefined') {
        throw new Error(__('The user id is undefined'));
    }
    if(!Validator.isUUID(userid)) {
        throw new Error(__('The user id is not valid'));
    }

    // Parse the keys. If standard format given with a text containing
    // public/private. It will extract only the public.
    var armoredPublicKey = parseArmoredKey(armoredPublicKey, Keyring.PUBLIC);

    // Is the given key a valid pgp key ?
    var openpgpRes = openpgp.key.readArmored(armoredPublicKey);

    // Return the error in any case
    if (openpgpRes.err) {
        throw new Error(openpgpRes.err[0].message);
    }

    // If the key is not public, return an error.
    var key = openpgpRes.keys[0];
    if (!key.isPublic()) {
        throw new Error(__('Expected a public key but got a private key instead'));
    }

    // Update the local storage.
    var keyInfo = this.keyInfo(armoredPublicKey);
    this.publicKeys[userid] = keyInfo;
    this.publicKeys[userid].user_id = userid;
    this.store();

    return true;
};

/**
 * Import a private key into the Keyring.
 * @param armoredKey The key to import.
 * @returns {Object|string} Return the openpgp key if imported with success.
 * Otherwise return an error string message.
 */
Keyring.prototype.importPrivate = function (armoredKey) {
    // Flush any existing private key.
    this.flush(Keyring.PRIVATE);

    // Parse the keys. If standard format given with a text containing
    // public/private. It will extract only the private.
    var armoredKey = parseArmoredKey(armoredKey, Keyring.PRIVATE);

    // Is the given key a valid pgp key ?
    var openpgpRes = openpgp.key.readArmored(armoredKey);

    // Return the error in any case
    // TODO internationalization of openpgpjs messages?
    if (openpgpRes.err) {
        throw new Error(openpgpRes.err[0].message);
    }

    // If the key is not private, return an error.
    var key = openpgpRes.keys[0];
    if (!key.isPrivate()) {
        throw new Error(__('Expected a private key but got a public key instead'));
    }

    // Get the keyInfo.
    var keyInfo = this.keyInfo(armoredKey);
    this.privateKeys[Keyring.MY_KEY_ID] = keyInfo;
    this.privateKeys[Keyring.MY_KEY_ID].user_id = Keyring.MY_KEY_ID;

    // Update the local storage.
    this.store();

    return true;
};

/**
 * Get the key info.
 * @param armoredKey
 * @return {array} the key info.
 */
Keyring.prototype.keyInfo = function (armoredKey) {
    var openpgpRes = openpgp.key.readArmored(armoredKey),
        key = openpgpRes.keys[0],
        userIds = key.getUserIds(),
        userIdsSplited = [];

    // Extract name & email from key userIds.
    var myRegexp = /(.*) <(\S+@\S+)>$/g;
    for (var i in userIds) {
        var match = myRegexp.exec(userIds[i]);
        userIdsSplited.push({
            name: match[1],
            email: match[2]
        });
    }

    // seems like opengpg keys id can be longer than 8 bytes (16 default?)
    var keyid = key.primaryKey.getKeyId().toHex();
    if(keyid.length > 8) {
        var shortid = keyid.substr(keyid.length - 8);
        keyid = shortid;
    }

    var info = {
        key: armoredKey,
        keyId: keyid,
        userIds: userIdsSplited,
        fingerprint: key.primaryKey.getFingerprint(),
        algorithm: key.primaryKey.algorithm.substring(0, 3), // @TODO : proper alghorithm parsing
        created: key.primaryKey.created,
        expires: key.getExpirationTime(),
        length: key.primaryKey.getBitSize()
    };

    return info;
};

/**
 * Extract a public key from a private.
 * @param privateArmoredKey the private key armored
 * @returns {string} armored public key
 */
Keyring.prototype.extractPublicKey = function (privateArmoredKey) {
    var key = openpgp.key.readArmored(privateArmoredKey);
    var publicKey = key.keys[0].toPublic();
    return publicKey.armor();
};

/**
 * Get a public key by its fingerprint.
 * @param userId The user id of the key to get.
 * @returns {OpenPgpKey|undefined}
 */
Keyring.prototype.findPublic = function (userId) {
    // TODO no need to iterate, use property/key instead
    for (var i in this.publicKeys) {
        if (this.publicKeys[i].user_id == userId) {
            return this.publicKeys[i];
        }
    }
    return undefined;
};

/**
 * Get a private key by its fingerprint.
 * @param userId The user id of the key to get.
 * @returns {OpenPgpKey|undefined}
 */
Keyring.prototype.findPrivate = function (userId) {
    // @todo For now support only one private by people.
    userId = userId || Keyring.MY_KEY_ID;
    return this.privateKeys[userId];
};

/**
 * Generate a key pair from given parameters.
 * @param userId The user id of the key to get.
 * @param passphrase The master key.
 * @param lgth The length of the key
 * @returns {OpenPgpKey}
 */
Keyring.prototype.generateKeyPair = function (userId, passphrase, lgth) {
    var key = openpgp
        .generateKeyPair({
            numBits: lgth,
            userId: userId,
            passphrase: passphrase
        });
    return key;
};

/**
 * Check if a given passphrase drecrypt the private key
 * @param passphrase
 * @returns {.SecretKey.isDecrypted|*|SecretKey.isDecrypted|.c.isDecrypted|c.isDecrypted}
 */
Keyring.prototype.checkPassphrase = function (passphrase) {
    var keyInfo = this.findPrivate(),
        privateKey = openpgp.key.readArmored(keyInfo.key).keys[0];

    if(!privateKey.isDecrypted) {
        var result = privateKey.decrypt(passphrase);
        return result;
    } else {
        return true;
    }
};

/**
 * Sync the local keyring with the passbolt back end.
 * Retrieve the latest updated Public Keys.
 */
Keyring.prototype.sync = function () {
    var deferred = defer();

    // Attention : some latencies have been observed while operating on the opengpg keyring.
    var latestSync = storage.getItem('latestSync');

    // Get the latest keys changes from the backend.
    var settings = new Settings();
    var url = settings.getDomain() + '/gpgkeys.json';

    // If a sync has already been performed.
    if (latestSync) {
        url += '?modified_after=' + latestSync;
    }

    var self = this;

    // Get the updated public keys from passbolt.
    // TODO error / timeout on request
    Request({
        url: url,
        onComplete: function (raw) {
            var response = JSON.parse(raw.text);
            if (response.body) {
                // Store all the new keys in the keyring.
                for (var i in response.body) {
                    var meta = response.body[i];
                    self.importPublic(meta.Gpgkey.key, meta.Gpgkey.user_id);
                }
                self.store();
            }
            if (response.header) {
                // Update the latest synced time.
                storage.setItem('latestSync', response.header.servertime);
            }

            // Resolve the defer with the number of updated keys.
            deferred.resolve(response.body.length);
        }
    }).get();

    return deferred.promise;
};

// Exports the Keyring object.
exports.Keyring = Keyring;
