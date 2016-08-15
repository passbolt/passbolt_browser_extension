/**
 * Crypto model.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

const { defer } = require('sdk/core/promise');
var openpgp = require('../vendors/openpgp');
var webWorker = require('../vendors/web-worker').Worker;
var XRegExp = require('../vendors/xregexp').XRegExp;
var jsSHA = require('../vendors/sha');
var Keyring = require('./keyring').Keyring;
var __ = require("sdk/l10n").get;
var randomBytes = require('../vendors/crypto').randomBytes;
var Config = require('./config');

/**
 * The class that deals with Passbolt encryption and decryption operations
 */
var Crypto = function () {
    this.openpgpWorker = Crypto.getOpenpgpWorker();
};

/////////////////////////////////////////////
//////////    STATIC    ////////////////////
///////////////////////////////////////////

/**
 *
 * @returns {exports.AsyncProxy}
 */
Crypto.getOpenpgpWorker = function() {
    openpgp.initWorker({
        worker: new webWorker(Config.read('extensionBasePath') + '/lib/vendors/openpgp.worker.js')
    });
    return openpgp;
}

/**
 * Encrypt a message using a public key.
 *
 * @param armoredKey
 * @param message
 *
 * @returns {Promise.<String>|*}
 */
Crypto.encrypt = function(armoredKey, message) {
    // Get Openpgp worker.
    var openpgpWorker = Crypto.getOpenpgpWorker(),
        deferred = defer();

    // Retrieve public key.
    var publicKey = openpgpWorker.key.readArmored(armoredKey);

    // Encrypt message.
    openpgpWorker.encrypt({
        publicKeys: publicKey.keys,
        data: message
    }).then(
        function(encrypted) {
            deferred.resolve(encrypted.data);
        },
        function(error) {
            deferred.reject(error);
        }
    );

    return deferred.promise;

};

/////////////////////////////////////////////
//////////    PROTOTYPE ////////////////////
///////////////////////////////////////////

/**
 * Encrypt a text for a given user.
 * @param unarmored The text to encrypt.
 * @param userId The user to encrypt the text for.
 * @return promise
 * @throw Exception
 *   in case of key not found, or problem during encryption.
 */
Crypto.prototype.encrypt = function(unarmored, userId) {
    var keyring = new Keyring(),
        keyInfo = null,
        publicKey = null,
        deferred = defer();

    keyInfo = keyring.findPublic(userId);
    if (!keyInfo) {
        throw __('The public key could not be found for the user');
    }

    // @todo #robustness the public key is not valid
    publicKey = this.openpgpWorker.key.readArmored(keyInfo.key);

    // Encrypt message.
    this.openpgpWorker.encrypt({
        publicKeys: publicKey.keys,
        data: unarmored
    }).then(
        function(encrypted) {
            deferred.resolve(encrypted.data);
        },
        function(error) {
            deferred.reject(error);
        }
    );

    // Encrypt message.
    return deferred.promise;
};


/**
 * Decrypt an armored text.
 * @param armored The text to decrypt.
 * @param passphrase (optional) The passphrase used to decrypt the private key.
 * @throw Error if something goes wrong in openpgp methods
 * @return promise
 */
Crypto.prototype.decrypt = function(armored, passphrase) {

    // Get the private key and load it
    var keyring = new Keyring(),
        keyInfo = keyring.findPrivate(),
        privateKey = this.openpgpWorker.key.readArmored(keyInfo.key).keys[0],
        deferred = defer(),
        self = this;

    if (!privateKey.isDecrypted) {
        this.openpgpWorker.decryptKey({privateKey: privateKey, passphrase: passphrase})
            .then(function(privateKey) {
                // Openpgp will throw an exception if the message is badly formatted
                var pgpMessage = self.openpgpWorker.message.readArmored(armored);
                self.openpgpWorker.decrypt({privateKey: privateKey.key, message: pgpMessage})
                    .then(
                        function(decrypted) {
                            deferred.resolve(decrypted.data);
                        },
                        function(error) {
                            deferred.reject(error);
                        });
            });
    }
    else {
        self.openpgpWorker.decrypt({privateKey: privateKey, message: pgpMessage})
            .then(
                function(decrypted) {
                    deferred.resolve(decrypted.data);
                },
                function(error) {
                    deferred.reject(error);
                }
            );
    }

    return deferred.promise;
};

/**
 * Generate a random text
 * @param size
 */
Crypto.generateRandomHex = function (size) {
    var text = '';
    var possible = 'ABCDEF0123456789';
    var random_array = randomBytes(size);
    for(var i=size; i > 0; i--) {
        text += possible.charAt(Math.floor(random_array[i] % possible.length));
    }
    return text;
};

/**
 * Create a predictable uuid from a sha1 hashed seed
 * @param seed
 * @returns {*}
 */
Crypto.uuid = function (seed) {
    var hashStr;

    // Generate a random hash if no seed is provided
    if(typeof seed === 'undefined') {
        hashStr = Crypto.generateRandomHex(32);
    }
    else {
        // Create SHA hash from seed.
        var shaObj = new jsSHA('SHA-1', 'TEXT');
        shaObj.update(seed);
        hashStr = shaObj.getHash('HEX').substring(0, 32);
    }
    // Build a uuid based on the hash
    var search = XRegExp('^(?<first>.{8})(?<second>.{4})(?<third>.{1})(?<fourth>.{3})(?<fifth>.{1})(?<sixth>.{3})(?<seventh>.{12}$)');
    var replace = XRegExp('${first}-${second}-3${fourth}-a${sixth}-${seventh}');

    // Replace regexp by corresponding mask, and remove / character at each side of the result.
    var uuid = XRegExp.replace(hashStr, search, replace).replace(/\//g, '');
    return uuid;
};

/**
 * Read Armored Message - can be used to validate
 * @param pgpMessage
 * @returns {*}
 * @throw error if the message is not valid pgp armored text
 */
Crypto.prototype.readArmoredMessage = function(pgpMessage) {
    pgpMessage = openpgp.message.readArmored(pgpMessage);
    return pgpMessage;
};

// Make the object available to other scripts
exports.Crypto = Crypto;
