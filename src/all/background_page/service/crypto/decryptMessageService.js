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

const {assertPrivateKeys, assertPublicKeys, assertMessage} = require("../../utils/openpgp/openpgpAssertions");

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
    decryptionKeys = await assertPrivateKeys(decryptionKeys);
    signingKeys = await assertPublicKeys(signingKeys);
    message = await assertMessage(message);

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
