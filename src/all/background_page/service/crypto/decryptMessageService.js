const {BadSignatureMessageGpgKeyError} = require("../../error/badSignatureMessageGpgKeyError");

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
 * @since         3.6.0
 */
class DecryptMessageService {
  /**
   * Decrypt a text message with signature.
   *
   * @param {string} message The message to decrypt.
   * @param {openpgp.key.Key|string} decryptionKeys The private key(s) to use to decrypt the message
   * @param {array<openpgp.key.Key|string>|openpgp.key.Key|string} signingKeys The public key(s) to check the signature.
   * @returns {Promise<*>}
   */
  static async decrypt(message, decryptionKeys, signingKeys) {
    decryptionKeys = await this._assertPrivateKeys(decryptionKeys);
    signingKeys = await this._assertKeys(signingKeys);
    message = await this._readMessage(message);

    const decryptedMessage = await openpgp.decrypt({
      message: message,
      privateKeys: decryptionKeys,
      publicKeys: signingKeys
    });
    // Check signature
    if (!this._isSignatureValid(decryptedMessage)) {
      throw new BadSignatureMessageGpgKeyError('Bad signing keys.');
    }
    return decryptedMessage;
  }



  /**
   * Assert the private key(s).
   * - Should be a valid armored key or valid openpgp key.
   * - Should be private.
   * - Should be decrypted.
   *
   * @param {array<openpgp.key.Key|string>|openpgp.key.Key|string} privateKeys The private key(s) to assert.
   * @returns {array<openpgp.key.Key>|openpgp.key.Key}
   * @private
   */
  static async _assertPrivateKeys(privateKeys) {
    if (Array.isArray(privateKeys)) {
      return privateKeys.map(decryptionKey => this._assertPrivateKeys(decryptionKey));
    }

    if (typeof privateKeys === "string") {
      try {
        privateKeys = (await openpgp.key.readArmored(privateKeys)).keys[0];
      } catch (error) {
        throw new Error("The private key is not a valid armored key");
      }
    }

    if (!privateKeys.isPrivate()) {
      throw new Error("The private key is not a valid private key.");
    }

    if (!privateKeys.isDecrypted()) {
      throw new Error("The private key is not decrypted.");
    }

    return privateKeys;
  }

  /**
   * Assert key(s).
   * - Should be a valid armored key or valid openpgp key.
   *
   * @param {array<openpgp.key.Key|string>|openpgp.key.Key|string} keys The key(s) to assert.
   * @returns {array<openpgp.key.Key>|openpgp.key.Key}
   * @private
   */
  static async _assertKeys(keys) {
    if (typeof keys === "string") {
      try {
        keys = (await openpgp.key.readArmored(keys)).keys;
      } catch (error) {
        throw new Error("The public key is not a valid armored key");
      }
    }

    return keys;
  }

  /**
   * Read the message.
   * - Should be a valid message.
   *
   * @param {string} message The message to read.
   * @returns {*}
   * @private
   */
  static async _readMessage(message) {
    if (typeof message === "string") {
      try {
        message = await openpgp.message.readArmored(message);
        return message;
      } catch (error) {
        throw new Error("The message is not a valid cleartext signed message");
      }
    }
  }

  /**
   * Is signature valid
   * @param decryptedMessage
   * @returns {boolean}
   * @private
   */
  static _isSignatureValid(decryptedMessage) {
    return decryptedMessage.signatures[0].valid;
  }
}

exports.DecryptMessageService = DecryptMessageService;
