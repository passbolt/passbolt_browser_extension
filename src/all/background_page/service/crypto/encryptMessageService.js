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

const {assertDecryptedPrivateKeys, assertPublicKeys, assertMessageToEncrypt} = require("../../utils/openpgp/openpgpAssertions");

class EncryptMessageService {
  /**
   * Encrypt symmetrically a message.
   *
   * @param {string} message The message to encrypt.
   * @param {string} password The password to use to encrypt the message.
   * @param {array<openpgp.PrivateKey|string>|openpgp.PrivateKey|string} signingKeys The private key(s) to use to sign the message.
   * @returns {Promise<string>} the encrypted message in its armored version
   */
  static async encryptSymmetrically(message, password, signingKeys = null) {
    if (signingKeys) {
      signingKeys = await assertDecryptedPrivateKeys(signingKeys);
    }

    message = await assertMessageToEncrypt(message);
    return await openpgp.encrypt({
      message: message,
      passwords: password,
      signingKeys: signingKeys
    });
  }

  /**
   * Encrypt and sign text message.
   *
   * @param {string} message The message to encrypt.
   * @param {openpgp.PublicKey|string} encryptionKey The public key(s) to use to encrypt the message
   * @param {array<openpgp.PrivateKey|string>|openpgp.PrivateKey|string} signingKeys The private key(s) to use to sign the message.
   * @returns {Promise<string>} the encrypted message in its armored version
   */
  static async encrypt(message, encryptionKey, signingKeys = null) {
    message = await assertMessageToEncrypt(message);
    encryptionKey = await assertPublicKeys(encryptionKey);
    if (signingKeys) {
      signingKeys = await assertDecryptedPrivateKeys(signingKeys);
    }

    return await openpgp.encrypt({
      message: message,
      encryptionKeys: encryptionKey,
      signingKeys: signingKeys
    });
  }
}

exports.EncryptMessageService = EncryptMessageService;
