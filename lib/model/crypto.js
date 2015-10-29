var openpgp = require('../vendors/openpgp');
var XRegExp = require('../vendors/xregexp').XRegExp;
var jsSHA = require('../vendors/sha');
var Keyring = require('./keyring').Keyring;
var __ = require("sdk/l10n").get;
var randomBytes = require('../vendors/crypto').randomBytes;

/**
 * The class that deals with Passbolt encryption and decryption operations
 */
var Crypto = function () {};

/**
 * Encrypt a text for a bench of users.
 * @param unarmored The text to encrypt.
 * @param usersIds The users to encrypt the text for.
 */
Crypto.prototype.encrypt = function(unarmored, userId) {
    var keyring = new Keyring(),
        armored = null,
        keyInfo = null,
        publicKey = null;

    // @todo #robustness the public key hasn't been found,
    keyInfo = keyring.findPublic(userId);
    if (!keyInfo) {
        console.log('the public key of user ' + userId + ' could not be found');
        return null;
    }

    // @todo #robustness the public key is not valid
    publicKey = openpgp.key.readArmored(keyInfo.key);

    // @todo #robustness cannot encrypt
    armored = openpgp.encryptMessage(publicKey.keys, unarmored);

    return armored;
};

/**
 * Decrypt an armored text.
 * @param armored The text to decrypt.
 * @param passphrase (optional) The master password used to decrypt the private key.
 * @throw Error if something goes wrong in openpgp methods
 * @return message string
 */
Crypto.prototype.decrypt = function(armored, passphrase) {

    // Get the private key and load it
    var keyring = new Keyring(),
        keyInfo = keyring.findPrivate(),
        privateKey = openpgp.key.readArmored(keyInfo.key).keys[0];

    if (!privateKey.isDecrypted) {
        privateKey.decrypt(passphrase);
    }

    // Openpgp will throw an exception if the message is badly formatted
    var pgpMessage = openpgp.message.readArmored(armored);
    var message = openpgp.decryptMessage(privateKey, pgpMessage);

    return message;
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
