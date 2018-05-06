/**
 * Crypto model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Keyring = require('./keyring').Keyring;
var __ = require('../sdk/l10n').get;
var randomBytes = require('../sdk/random').randomBytes;
var Log = require('../model/log').Log;

/**
 * The class that deals with Passbolt encryption and decryption operations.
 */
var Crypto = function () {
};

/**
 * Generate a random text.
 * @param size {int} The desired random text size.
 * @returns {string}
 */
Crypto.generateRandomHex = function (size) {
  var text = '';
  var possible = 'ABCDEF0123456789';
  var random_array = randomBytes(size);
  for (var i = size; i > 0; i--) {
    text += possible.charAt(Math.floor(random_array[i] % possible.length));
  }
  return text;
};

/**
 * Generate a random uuid.
 * @param seed {string} (optional) The seed to use to generate a predictable uuid
 *  based on its sha1 hashed
 * @returns {string}
 */
Crypto.uuid = function (seed) {
  var hashStr;

  // Generate a random hash if no seed is provided
  if (typeof seed === 'undefined') {
    hashStr = Crypto.generateRandomHex(32);
  } else {
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
 * Encrypt a text for a given user id (or an armored key)
 *
 * @param message {string} The text to encrypt
 * @param key {string} The user id or public armored key
 * @return {promise}
 * @throw Exception
 *   in case of key not found, or problem during encryption.
 */
Crypto.prototype.encrypt = async function (message, key) {
  let keyring = new Keyring(),
    publicKey = null;

  // if the key is a uuid we get the armored version from the keyring
  if (Validator.isUUID(key)) {
    let keyInfo = keyring.findPublic(key);
    if (!keyInfo) {
      throw new Error(__('The public key could not be found for the user'));
    }
    key = keyInfo.key;
  }

  // parse the armored key
  try {
    publicKey = openpgp.key.readArmored(key);
  } catch (error) {
    throw new Error(__('The public key is not in a valid or supported format.'));
  }

  // encrypt the message
  let encryptedMessage = await openpgp.encrypt({publicKeys: publicKey.keys, data: message});
  return encryptedMessage.data;
};

/**
 * Encrypt an array of messages.
 *
 * @param toEncrypt The text to encrypt.
 * @param passphrase (optional) The passphrase used to decrypt the private key.
 * @param startCallback The callback to execute each time the function start to encrypt a message
 * @param completeCallback The callback to execute each time the function complete to encrypt a message.
 * @throw Error if something goes wrong in openpgp methods
 * @return promise
 */
Crypto.prototype.encryptAll = async function (toEncrypt, completeCallback, startCallback) {
  const keyring = new Keyring();
  let i, armoredKey, publicKeys, ciphertext, result = [];
  for (i in toEncrypt) {
    if (startCallback) {
      startCallback(i);
    }

    armoredKey = keyring.findPublic(toEncrypt[i].userId).key;
    publicKeys = openpgp.key.readArmored(armoredKey).keys[0];
    try {
      ciphertext = await openpgp.encrypt({publicKeys: publicKeys, data: toEncrypt[i].message});
      result.push(ciphertext.data);
      if (completeCallback) {
        completeCallback(ciphertext.data, toEncrypt[i].userId, i);
      }
    } catch(error) {
      let message = `Could not encrypt for user ${toEncrypt[i].userId} with key: ${armoredKey}`;
      console.error(message);
      console.error(error);
    }
  }
  return result;
};

/**
 * Decrypt an armored text.
 *
 * @param armored The text to decrypt.
 * @param passphrase (optional) The (validated) passphrase to use to decrypt the private key.
 * @throw Error if something goes wrong in openpgp methods
 * @return promise
 */
Crypto.prototype.decrypt = async function (armoredMessage, passphrase) {
  const keyring = new Keyring(),
    armoredKey = keyring.findPrivate().key,
    pgpMessage = openpgp.message.readArmored(armoredMessage);
  let privateKey = openpgp.key.readArmored(armoredKey).keys[0];
  try {
    await privateKey.decrypt(passphrase);
  } catch(error) {
    Log.write({level: 'warning', message: error.message});
  }
  let decrypted = await openpgp.decrypt({privateKeys: [privateKey], message: pgpMessage});
  return decrypted.data;
};

/**
 * Decrypt an array of armored text.
 *
 * @param armored The text to decrypt.
 * @param passphrase (optional) The passphrase used to decrypt the private key.
 * @param startCallback The callback to execute each time the function start to decrypt a secret.
 * @param completeCallback The callback to execute each time the function complete to decrypt a secret.
 * @throw Error if something goes wrong in openpgp methods
 * @return promise
 */
Crypto.prototype.decryptAll = async function (armoredMessages, passphrase, completeCallback, startCallback) {
  const keyring = new Keyring(),
    armoredKey = keyring.findPrivate().key;
  let privateKey = openpgp.key.readArmored(armoredKey).keys[0];
  try {
    await privateKey.decrypt(passphrase);
  } catch(error) {
    Log.write({level: 'warning', message: error.message});
  }

  // Decrypt the secrets sequentially.
  let i, pgpMessage, decryptedMessage, result = [];
  for (i in armoredMessages) {
    if (startCallback) {
      startCallback(i);
    }
    pgpMessage = openpgp.message.readArmored(armoredMessages[i]);
    decryptedMessage = await openpgp.decrypt({privateKeys: [privateKey], message: pgpMessage});
    result.push(decryptedMessage.data);
    if (completeCallback) {
      completeCallback(decryptedMessage.data, i);
    }
  }
  return result;
};

// Make the object available to other scripts
exports.Crypto = Crypto;
