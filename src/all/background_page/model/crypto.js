/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         1.0.0
 */
const {Keyring} = require('./keyring');

/**
 * The class that deals with Passbolt encryption and decryption operations.
 */
class Crypto {
  /**
   * Crypt constructor
   * @param {Keyring} [keyring] optional
   */
  constructor(keyring) {
    this.keyring = keyring ? keyring : new Keyring();
  }

  /**
   * Encrypt a text for a given user id (or an armored key)
   *
   * @param {string} message The text to encrypt
   * @param {string} publicKey The user id or public armored key
   * @param {openpgp.key.Key} [privateKey] optional The decrypted private key to sign the message.
   * @throw {Error} The public key is not found
   * @throw {Error} The public key is not in a valid or supported format
   * @return {Promise} The encrypted message
   */
  async encrypt(message, publicKey, privateKey) {
    // If user_id given as parameter, find the user public key.
    if (Validator.isUUID(publicKey)) {
      let keyInfo = this.keyring.findPublic(publicKey);
      if (!keyInfo) {
        throw new Error('The public key could not be found for the user');
      }
      publicKey = keyInfo.key;
    }

    try {
      publicKey = (await openpgp.key.readArmored(publicKey)).keys[0];
    } catch (error) {
      throw new Error('The public key is not in a valid or supported format.');
    }

    const options = {
      message: openpgp.message.fromText(message),
      publicKeys: [publicKey]
    };

    // If a private key is given, sign the message.
    if (privateKey) {
      options.privateKeys = [privateKey];
    }

    let encryptedMessage;
    try {
      encryptedMessage = await openpgp.encrypt(options);
    } finally {
      await openpgp.getWorker().clearKeyCache();
    }

    return encryptedMessage.data;
  };

  /**
   * Encrypt an array of messages
   *
   * @param {array} data The list of message to encrypt associated to the user to encrypt for
   * @param {openpgp.key.Key} privateKey The decrypted private key to use to decrypt the message.
   * @param {function} [startCallback] optional The callback to execute each time the function start to encrypt a message
   * @param {function} [completeCallback] optional The callback to execute each time the function complete to encrypt a message.
   * @throw Error if something goes wrong in openpgp methods
   * @return {Promise} The encrypted messages
   */
  async encryptAll(data, privateKey, completeCallback, startCallback) {
    const _startCallback = startCallback || function() {};
    const _completeCallback = completeCallback || function() {};
    const result = [];

    for (let i in data) {
      _startCallback(i);
      const messageEncrypted = await this.encrypt(data[i].message, data[i].userId, privateKey);
      result.push(messageEncrypted);
      _completeCallback(messageEncrypted, data[i].userId, i);
    }

    return result;
  };

  /**
   * Get a decrypted version of the private key
   *
   * @param {string} passphrase The passphrase to use to decrypt the private key.
   * @return {Promise<openpgp.key.Key>} The user decrypted private key
   */
  async getAndDecryptPrivateKey(passphrase) {
    const armoredKey = this.keyring.findPrivate().key;
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
   * @param privateKey {openpgp.key.Key} The decrypted private key to use to decrypt the message.
   * @throw Error if something goes wrong in openpgp methods
   * @return {Promise} The decrypted message
   */
  async decryptWithKey(armoredMessage, privateKey) {
    const pgpMessage = await openpgp.message.readArmored(armoredMessage);
    let decrypted;

    try {
      decrypted = await openpgp.decrypt({privateKeys: [privateKey], message: pgpMessage});
    } finally {
      await openpgp.getWorker().clearKeyCache();
    }

    return decrypted.data;
  };

  /**
   * Decrypt an armored text
   *
   * @param armoredMessage {string} The text to decrypt.
   * @param passphrase {string} The passphrase to use to decrypt the private key.
   * @throw Error if something goes wrong in openpgp methods
   * @return {Promise} The decrypted message
   * @deprecated since 2.13 use decryptWithKey
   */
  async decrypt(armoredMessage, passphrase) {
    const key = await this.getAndDecryptPrivateKey(passphrase);
    return await this.decryptWithKey(armoredMessage, key);
  };

  /**
   * Decrypt an array of armored text
   *
   * @param {array<string>} armoredMessages The text to decrypt.
   * @param {openpgp.key.Key} privateKey the decrypted private key
   * @param {function} startCallback The callback to execute each time the function start to decrypt a secret.
   * @param {function} completeCallback The callback to execute each time the function complete to decrypt a secret.
   * @throw {Error} if something goes wrong in openpgp methods
   * @return {Promise} The decrypted messages
   */
  async decryptAll(armoredMessages, privateKey, completeCallback, startCallback) {
    const _startCallback = startCallback || function() {};
    const _completeCallback = completeCallback || function() {};
    const result = [];

    for (let index in armoredMessages) {
      if (armoredMessages.hasOwnProperty(index)) {
        _startCallback(index);
        const message = await this.decryptWithKey(armoredMessages[index], privateKey);
        result.push(message);
        _completeCallback(message, index);
      }
    }

    return result;
  };
}

exports.Crypto = Crypto;
