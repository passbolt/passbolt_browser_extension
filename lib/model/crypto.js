var openpgp = require('../vendors/openpgp');
var XRegExp = require('../vendors/xregexp').XRegExp;
var jsSHA = require('../vendors/sha');
var Keyring = require('./keyring').Keyring;
var __ = require("sdk/l10n").get;

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
 */
Crypto.prototype.decrypt = function(armored, passphrase) {

    var keyring = new Keyring(),
    // Get the private key info.
        keyInfo = keyring.findPrivate(),
    // Load the private key.
        privateKey = openpgp.key.readArmored(keyInfo.key).keys[0];

    if (!privateKey.isDecrypted) {
        privateKey.decrypt(passphrase);
    }

    // @todo badly formated message
    var pgpMessage = openpgp.message.readArmored(armored);
    var message = openpgp.decryptMessage(privateKey, pgpMessage);

    return message;
};

/**
 * Create a predictable uuid from a sha1 hashed seed
 * @param seed
 * @returns {*}
 */
Crypto.uuid = function (seed) {
    // @TODO random uuid
    if(typeof seed === 'undefined') {
        throw new Error(__('The seed for the UUID cannot be undefined'));
    }
    // Create SHA hash from seed.
    var shaObj = new jsSHA("SHA-1", "TEXT");
    shaObj.update(seed);
    var hashStr = shaObj.getHash("HEX").substring(0, 32);
    // Build a uuid based on the hash
    var search = XRegExp('^(?<first>.{8})(?<second>.{4})(?<third>.{1})(?<fourth>.{3})(?<fifth>.{1})(?<sixth>.{3})(?<seventh>.{12}$)');
    var replace = XRegExp('${first}-${second}-3${fourth}-a${sixth}-${seventh}');
    // Replace regexp by corresponding mask, and remove / character at each side of the result.
    var uuid = XRegExp.replace(hashStr, search, replace).replace(/\//g, '');
    return uuid;
};

// Make the object available to other scripts
exports.Crypto = Crypto;
