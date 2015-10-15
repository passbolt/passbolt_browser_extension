var Config = require('./config');
var openpgp = require('../vendors/openpgp');
var storage = new (require('../vendors/node-localstorage').LocalStorage)();
var keyring = new openpgp.Keyring();
var Request = require('sdk/request').Request;
var Validator = require('../vendors/validator.js');
const { defer } = require('sdk/core/promise');

/**
 * The class that deals with Passbolt GPGkey.
 */
var Gpgkey = function () {
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
Gpgkey.PUBLIC_HEADER = '-----BEGIN PGP PUBLIC KEY BLOCK-----';
Gpgkey.PUBLIC_FOOTER = '-----END PGP PUBLIC KEY BLOCK-----';
Gpgkey.PRIVATE_HEADER = '-----BEGIN PGP PRIVATE KEY BLOCK-----';
Gpgkey.PRIVATE_FOOTER = '-----END PGP PRIVATE KEY BLOCK-----';
Gpgkey.PUBLIC = 'PUBLIC';
Gpgkey.PRIVATE = 'PRIVATE';
Gpgkey.MY_KEY_ID = 'MY_KEY_ID';

/**
 * Store the gpgkeys in local storage.
 */
Gpgkey.prototype.store = function () {
    storage.setItem('passbolt-public-gpgkeys', JSON.stringify(this.publicKeys));
    storage.setItem('passbolt-private-gpgkeys', JSON.stringify(this.privateKeys));
};

/**
 * Flush the Keyring.
 * @param type The type of keys to flush (PUBLIC/PRIVATE). Default PUBLIC.
 */
Gpgkey.prototype.flush = function (type) {
    var type = type || Gpgkey.PUBLIC;

    if (type == Gpgkey.PUBLIC) {
        this.publicKeys = {};
    } else if (type == Gpgkey.PRIVATE) {
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
    var type = type || Gpgkey.PRIVATE;
    // The parsed key. If no header found the output will be the input.
    var key = armoredKey || '';

    if (type == Gpgkey.PUBLIC) {
        // Check if we find the public header & footer.
        var pubHeaderPos = armoredKey.indexOf(Gpgkey.PUBLIC_HEADER);
        if (pubHeaderPos != -1) {
            var pubFooterPos = armoredKey.indexOf(Gpgkey.PUBLIC_FOOTER);
            if (pubFooterPos != -1) {
                key = armoredKey.substr(pubHeaderPos, pubFooterPos + Gpgkey.PUBLIC_FOOTER.length);
            }
        }
    } else if (type == Gpgkey.PRIVATE) {
        // Check if we find the private header & footer.
        var privHeaderPos = armoredKey.indexOf(Gpgkey.PRIVATE_HEADER);
        if (privHeaderPos != -1) {
            var privFooterPos = armoredKey.indexOf(Gpgkey.PRIVATE_FOOTER);
            if (privFooterPos != -1) {
                key = armoredKey.substr(privHeaderPos, privFooterPos + Gpgkey.PRIVATE_HEADER.length);
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
Gpgkey.prototype.importPublic = function (armoredPublicKey, userid) {
    // Check user id
    if(typeof userid === 'undefined' || !Validator.isUUID(userid)) {
        console.log('Wrong user id: ' + userid);
        throw new Error('User id is not valid');
    }

    // Parse the keys. If standard format given with a text containing
    // public/private. It will extract only the public.
    var armoredPublicKey = parseArmoredKey(armoredPublicKey, Gpgkey.PUBLIC);

    // Is the given key a valid pgp key ?
    var openpgpRes = openpgp.key.readArmored(armoredPublicKey);

    // Return the error in any case
    if (openpgpRes.err) {
        throw new Error(openpgpRes.err[0].message);
    }

    // If the key is not public, return an error.
    var key = openpgpRes.keys[0];
    if (!key.isPublic()) {
        throw new Error('Expected a public key found private key instead');
    }

    // Update the local storage.
    this.publicKeys[userid] = {
        user_id : userid,
        key : armoredPublicKey
    };
    this.store();

    return true;
};

/**
 * Import a private key into the Keyring.
 * @param armoredKey The key to import.
 * @returns {Object|string} Return the openpgp key if imported with success.
 * Otherwise return an error string message.
 */
Gpgkey.prototype.importPrivate = function (armoredKey) {
    // Flush any existing private key.
    // @todo Less violence.
    this.flush(Gpgkey.PRIVATE);

    // Parse the keys. If standard format given with a text containing
    // public/private. It will extract only the private.
    var armoredKey = parseArmoredKey(armoredKey, Gpgkey.PRIVATE);

    // Is the given key a valid pgp key ?
    var openpgpRes = openpgp.key.readArmored(armoredKey);

    // Return the error in any case
    if (openpgpRes.err) {
        throw new Error(openpgpRes.err[0].message);
    }

    // If the key is not private, return an error.
    var key = openpgpRes.keys[0];
    if (!key.isPrivate()) {
        throw new Error('Expected a private key found public key instead');
    }

    // Get the keyInfo.
    var keyInfo = this.keyInfo(armoredKey);

    this.privateKeys[Gpgkey.MY_KEY_ID] = keyInfo;

    // Update the local storage.
    this.store();

    return true;
};

/**
 * Get the key info.
 * @param armoredKey
 * @return {array} the key info.
 */
Gpgkey.prototype.keyInfo = function (armoredKey) {
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

    var info = {
        key: armoredKey,
        keyId: key.primaryKey.getKeyId().toHex(),
        userIds: userIdsSplited,
        fingerprint: key.primaryKey.getFingerprint(),
        algorithm: key.primaryKey.algorithm.substring(0, 3), //TODO : proper alghorithm parsing
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
Gpgkey.prototype.extractPublicKey = function (privateArmoredKey) {
    var key = openpgp.key.readArmored(privateArmoredKey);
    var publicKey = key.keys[0].toPublic();
    return publicKey.armor();
};

/**
 * Get a public key by its fingerprint.
 * @param userId The user id of the key to get.
 * @returns {OpenPgpKey}
 */
Gpgkey.prototype.findPublic = function (userId) {
    for (var i in this.publicKeys) {
        if (this.publicKeys[i].user_id == userId) {
            return this.publicKeys[i];
        }
    }
    return null;
};

/**
 * Get a private key by its fingerprint.
 * @param userId The user id of the key to get.
 * @returns {OpenPgpKey}
 */
Gpgkey.prototype.findPrivate = function (userId) {
    // @todo For now support only one private by people.
    userId = userId || Gpgkey.MY_KEY_ID;
    return this.privateKeys[userId];
};

/**
 * Generate a key pair from given parameters.
 * @param userId The user id of the key to get.
 * @param passphrase The master key.
 * @param lgth The length of the key
 * @returns {OpenPgpKey}
 */
Gpgkey.prototype.generateKeyPair = function (userId, passphrase, lgth) {
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
Gpgkey.prototype.checkPassphrase = function (passphrase) {
    var keyInfo = this.findPrivate(),
        privateKey = openpgp.key.readArmored(keyInfo.key).keys[0];

    if(!privateKey.isDecrypted) {
        var result = privateKey.decrypt(passphrase);
        //console.log('checkpassphrase: ' + passphrase + ':' + result);
        return result;
    } else {
        return true;
    }
};

/**
 * Sync the local keyring with the passbolt back end.
 * Retrieve the latest updated Public Keys.
 */
Gpgkey.prototype.sync = function () {
    var deferred = defer();

    // Attention : some latencies have been observed while operating on the opengpg keyring.
    var latestSync = storage.getItem('latestSync');

    // Get the latest keys changes from the backend.
    var url = Config.read('baseUrl') + '/gpgkeys.json';

    // If a sync has already been performed.
    if (latestSync) {
        url += '?modified_after=' + latestSync;
    }

    var self = this;

    // Get the updated public keys from passbolt.
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

// Exports the Gpg Key object.
exports.Gpgkey = Gpgkey;
