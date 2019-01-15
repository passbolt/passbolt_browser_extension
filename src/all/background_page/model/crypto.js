"use strict";
/**
 * Crypto model.
 *
 * @copyright (c) 2017-2018 Passbolt SARL, 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const Keyring = require('./keyring').Keyring;
const __ = require('../sdk/l10n').get;

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
 * @throw Exception {Error} The public key is not found
 * @throw Exception {Error} The public key is not in a valid or supported format
 * @return {Promise} The encrypted message
 */
Crypto.prototype.encrypt = async function (message, key) {
  const keyring = new Keyring();
  let publicKey;

  // If user_id given as parameter, find the user public key.
  if (Validator.isUUID(key)) {
    let keyInfo = keyring.findPublic(key);
    if (!keyInfo) {
      throw new Error(__('The public key could not be found for the user'));
    }
    key = keyInfo.key;
  }

  try {
    publicKey = (await openpgp.key.readArmored(key)).keys[0];
  } catch (error) {
    throw new Error(__('The public key is not in a valid or supported format.'));
  }

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
 * @param data {array} The list of message to encrypt associated to the user to encrypt for
 * @param startCallback {function} The callback to execute each time the function start to encrypt a message
 * @param completeCallback {function} The callback to execute each time the function complete to encrypt a message.
 * @throw Error if something goes wrong in openpgp methods
 * @return {Promise} The encrypted messages
 */
Crypto.prototype.encryptAll = async function (data, completeCallback, startCallback) {
  const _startCallback = startCallback || function() {};
  const _completeCallback = completeCallback || function() {};
  const result = [];

  for (let i in data) {
    _startCallback(i);
    const messageEncrypted = await this.encrypt(data[i].message, data[i].userId);
    result.push(messageEncrypted);
    _completeCallback(messageEncrypted, data[i].userId, i);
  }

  return result;
};

/**
 * Get a decrypted version of the private key.
 * @param passphrase {string} The passphrase to use to decrypt the private key.
 * @return {Promise} The user decrypted private key
 */
Crypto.prototype.getAndDecryptPrivateKey = async function(passphrase) {
  const keyring = new Keyring();
  const armoredKey = keyring.findPrivate().key;
  let privateKey = (await openpgp.key.readArmored(armoredKey)).keys[0];
  if (!privateKey.isDecrypted()) {
    await privateKey.decrypt(passphrase);
  }

  return privateKey;
};

/**
 * Decrypt an armored text with a given key.
 *
 * @param armoredMessage {string} The text to decrypt.
 * @param passphrase {openpgp.key.Key} The decrypted private key to use to decrypt the message.
 * @throw Error if something goes wrong in openpgp methods
 * @return {Promise} The decrypted message
 */
Crypto.prototype.decryptWithKey = async function (armoredMessage, key) {
  const pgpMessage = await openpgp.message.readArmored(armoredMessage);
  const decrypted = await openpgp.decrypt({privateKeys: [key], message: pgpMessage});

  return decrypted.data;
};

/**
 * Decrypt an armored text.
 *
 * @param armoredMessage {string} The text to decrypt.
 * @param passphrase {string} The passphrase to use to decrypt the private key.
 * @throw Error if something goes wrong in openpgp methods
 * @return {Promise} The decrypted message
 */
Crypto.prototype.decrypt = async function (armoredMessage, passphrase) {
  const key = await this.getAndDecryptPrivateKey(passphrase);
  const message = await this.decryptWithKey(armoredMessage, key);

  return message;
};

/**
 * Decrypt an array of armored text.
 *
 * @param armoredMessages {string} The text to decrypt.
 * @param passphrase {string} The passphrase to use to decrypt the private key.
 * @param startCallback {function} The callback to execute each time the function start to decrypt a secret.
 * @param completeCallback {function} The callback to execute each time the function complete to decrypt a secret.
 * @throw Error if something goes wrong in openpgp methods
 * @return {Promise} The decrypted messages
 */
Crypto.prototype.decryptAll = async function (armoredMessages, passphrase, completeCallback, startCallback) {
  const privateKey = await this.getAndDecryptPrivateKey(passphrase);
  const _startCallback = startCallback || function() {};
  const _completeCallback = completeCallback || function() {};
  const result = [];

  for (let index in armoredMessages) {
    _startCallback(index);
    const message = await this.decryptWithKey(armoredMessages[index], privateKey);
    result.push(message);
    _completeCallback(message, index);
  }

  return result;
};

// Make the object available to other scripts
exports.Crypto = Crypto;
