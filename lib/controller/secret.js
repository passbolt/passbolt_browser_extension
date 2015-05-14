var openpgp = require("openpgp");
var Gpgkey = require("model/gpgkey").Gpgkey;

/**
 * Encrypt a text for a bench of users.
 * @param worker
 * @param unarmored The text to encrypt.
 * @param usersIds The users to encrypt the text for.
 */
var encrypt = function(worker, unarmored, userId) {
  var gpgkey = new Gpgkey(),
    armored = null,
    keyInfo = null,
    publicKey = null;

  // @todo #robustness the public key hasn't been found,
  keyInfo = gpgkey.findPublic(userId);
  if (!keyInfo) {
    console.log('the public key of user ' + userId + ' couldnt be found');
    return null;
  }
  // @todo #robustness the public key is not valid
  publicKey = openpgp.key.readArmored(keyInfo.key);
  // @todo #robustness cannot encrypt
  armored = openpgp.encryptMessage(publicKey.keys, unarmored);

  return armored;
};
exports.encrypt = encrypt;

/**
 * Decrypt an armored text.
 * @param worker
 * @param armored The text to decrypt.
 * @param masterPassword (optional) The master password used to decrypt the private key.
 * @throw A REQUEST_MASTER_PASSWORD Exception if the private key is encrypted.
 */
var decrypt = function(worker, armored, masterPassword) {
  var gpgkey = new Gpgkey(),
    // Get the private key info.
    keyInfo = gpgkey.findPrivate(),
    // Load the private key.
    privateKey = openpgp.key.readArmored(keyInfo.key).keys[0];

  // If the key is encrypted.
  if (!privateKey.isDecrypted) {
    // Master password given or stored in the Gppkey model.
    var masterPassword = masterPassword || null; // || gpgkey.getMasterPassword() || '';
    // Try to decrypt it with the known master password.
    if (masterPassword) {
      privateKey.decrypt(masterPassword);
    }
    // Or request the master password to the user and try again.
    else {
      throw 'REQUEST_MASTER_PASSWORD';
    }
  }

  var pgpMessage = openpgp.message.readArmored(armored);
  var message = openpgp.decryptMessage(privateKey, pgpMessage);

  return message
};
exports.decrypt = decrypt;
