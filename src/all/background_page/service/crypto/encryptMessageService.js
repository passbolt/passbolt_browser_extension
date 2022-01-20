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
class EncryptMessageService {
  /**
   * Encrypt symmetrically a message
   *
   * @param {string} message The message to encrypt.
   * @param {array<string>} passwords The passwords to use to encrypt the message.
   * @param {array<openpgp.key.Key|string>|openpgp.key.Key|string} signingKeys The private key(s) to use to sign the message.
   * @returns {Promise<openpgp.Message>}
   */
  static async encryptSymmetrically(message, passwords, signingKeys) {
    signingKeys = await this._assertPrivateKeys(signingKeys);

    return await openpgp.encrypt({
      message: openpgp.message.fromText(message),
      passwords: passwords,
      privateKeys: signingKeys
    });
  }

  /**
   * Encrypt and sign text message.
   *
   * @param {string} message The message to encrypt.
   * @param {openpgp.key.Key} encryptionKeys The public key(s) to use to encrypt the message
   * @param {array<openpgp.key.Key|string>|openpgp.key.Key|string} signingKeys The private key(s) to use to sign the message.
   * @returns {Promise<*>}
   */
  static async encrypt(message, encryptionKeys, signingKeys) {
    signingKeys = await this._assertPrivateKeys(signingKeys);

    return openpgp.encrypt({
      message: openpgp.message.fromText(message),
      publicKeys: encryptionKeys,
      privateKeys: signingKeys
    });
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
      return privateKeys.map(signingKey => this._assertPrivateKeys(signingKey));
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
}

exports.EncryptMessageService = EncryptMessageService;
