var openpgp = require('../vendors/openpgp');
var Gpgkey = require('./gpgkey').Gpgkey;

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
    var gpgkey = new Gpgkey(),
        armored = null,
        keyInfo = null,
        publicKey = null;

    // @todo #robustness the public key hasn't been found,
    keyInfo = gpgkey.findPublic(userId);
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

    var gpgkey = new Gpgkey(),
    // Get the private key info.
        keyInfo = gpgkey.findPrivate(),
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

// Make the object available to other scripts
exports.Crypto = Crypto;
