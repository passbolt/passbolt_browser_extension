/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */

const {BadSignatureMessageGpgKeyError} = require("../../error/badSignatureMessageGpgKeyError");
const {assertDecryptedPrivateKeys, assertMessage, assertKeys} = require("../../utils/openpgp/openpgpAssertions");

class DecryptMessageService {
  /**
   * Encrypt symmetrically a message
   *
   * @param {string} message The message to encrypt.
   * @param {array<string>} passwords The passwords to use to encrypt the message.
   * @param {array<openpgp.key.Key|string>|openpgp.key.Key|string} signingKeys The private key(s) to use to sign the message.
   * @returns {Promise<openpgp.message.Message>}
   */
  static async decryptSymmetrically(message, passwords, signingKeys = null) {
    if (signingKeys) {
      signingKeys = await assertKeys(signingKeys);
    }

    const decryptedMessage = await openpgp.decrypt({
      message: await openpgp.message.readArmored(message),
      passwords: passwords,
      publicKeys: signingKeys
    });

    if (signingKeys && !this._assertSignatures(decryptedMessage)) {
      throw new BadSignatureMessageGpgKeyError('The signature(s) cannot be verified.');
    }

    return decryptedMessage;
  }

  /**
   * Decrypt a text message with signature.
   *
   * @param {string} message The message to decrypt.
   * @param {openpgp.key.Key|string} decryptionKeys The private key(s) to use to decrypt the message
   * @param {array<openpgp.key.Key|string>|openpgp.key.Key|string} signingKeys The public key(s) to check the signature.
   * @returns {Promise<openpgp.Message>}
   * @throws {BadSignatureMessageGpgKeyError} if the given signatures don't match the message to decrypt.
   */
  static async decrypt(message, decryptionKeys, signingKeys = null) {
    try {
      message = await assertMessage(message);
      decryptionKeys = await assertDecryptedPrivateKeys(decryptionKeys);
      if (signingKeys) {
        signingKeys = await assertKeys(signingKeys);
      }

      const decryptedMessage = await openpgp.decrypt({
        message: message,
        privateKeys: decryptionKeys,
        publicKeys: signingKeys
      });

      if (signingKeys && !this._assertSignatures(decryptedMessage)) {
        throw new BadSignatureMessageGpgKeyError('The signature(s) cannot be verified.');
      }

      return decryptedMessage;
    } finally {
      this._clearCache();
    }
  }

  /**
   * Assert signatures
   * @param {openpgp.Message} decryptedMessage The decrypted message to assert the signatures for
   * @returns {boolean}
   * @private
   */
  static _assertSignatures(decryptedMessage) {
    return decryptedMessage.signatures.reduce((result, signature) => result && signature.valid, true);
  }

  /**
   * Clear the openpgp cache to avoid sensitive to remain in memory.
   */
  static async _clearCache() {
    const worker = openpgp.getWorker();
    if (worker) {
      await worker.clearKeyCache();
    }
  }
}

exports.DecryptMessageService = DecryptMessageService;
