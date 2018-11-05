"use strict";
/**
 * Crypto model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const Keyring = require('./keyring').Keyring;
const __ = require('../sdk/l10n').get;
const Log = require('../model/log').Log;

/**
 * The class that deals with Passbolt encryption and decryption operations.
 */
const Crypto = function () {
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
    publicKey = (await openpgp.key.readArmored(key)).keys[0];
  } catch (error) {
    throw new Error(__('The public key is not in a valid or supported format.'));
  }

  // encrypt the message
  const options = {
    message: openpgp.message.fromText(message),
    publicKeys: [publicKey]
  };
  let encryptedMessage = await openpgp.encrypt(options);
  return encryptedMessage.data;
};

/**
 * Encrypt an array of messages.
 *
 * @param toEncrypt The text to encrypt.
 * @param startCallback The callback to execute each time the function start to encrypt a message
 * @param completeCallback The callback to execute each time the function complete to encrypt a message.
 * @throw Error if something goes wrong in openpgp methods
 * @return promise
 */
Crypto.prototype.encryptAll = async function (toEncrypt, completeCallback, startCallback) {
  const keyring = new Keyring();
  let i, armoredKey, publicKey, ciphertext, result = [], options;
  for (i in toEncrypt) {
    if (startCallback) {
      startCallback(i);
    }
    armoredKey = keyring.findPublic(toEncrypt[i].userId).key;
    publicKey = (await openpgp.key.readArmored(armoredKey)).keys[0];
    try {
      options = {
        message: openpgp.message.fromText(toEncrypt[i].message),
        publicKeys: [publicKey]
      };
      ciphertext = await openpgp.encrypt(options);
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
 * @param armoredMessage {string} The text to decrypt.
 * @param passphrase {string} The (validated) passphrase to use to decrypt the private key.
 * @throw Error if something goes wrong in openpgp methods
 * @return promise
 */
Crypto.prototype.decrypt = async function (armoredMessage, passphrase) {
  const keyring = new Keyring(),
    armoredKey = keyring.findPrivate().key,
    pgpMessage = await openpgp.message.readArmored(armoredMessage);
  let privateKey = (await openpgp.key.readArmored(armoredKey)).keys[0];
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
 * @param armoredMessages {string} The text to decrypt.
 * @param passphrase {string}  The passphrase used to decrypt the private key.
 * @param startCallback {function} The callback to execute each time the function start to decrypt a secret.
 * @param completeCallback {function} The callback to execute each time the function complete to decrypt a secret.
 * @throw Error if something goes wrong in openpgp methods
 * @return {Promise} the decrypted string
 */
Crypto.prototype.decryptAll = async function (armoredMessages, passphrase, completeCallback, startCallback) {
  const keyring = new Keyring(),
    armoredKey = keyring.findPrivate().key;
  let privateKey = (await openpgp.key.readArmored(armoredKey)).keys[0];
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
    pgpMessage = await openpgp.message.readArmored(armoredMessages[i]);
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
