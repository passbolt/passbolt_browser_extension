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

const {assertDecryptedPrivateKeys, assertPublicKeys} = require("../../utils/openpgp/openpgpAssertions");

class EncryptMessageService {
  /**
   * Encrypt symmetrically a message.
   *
   * @param {string} message The message to encrypt.
   * @param {array<string>} passwords The passwords to use to encrypt the message.
   * @param {array<openpgp.key.Key|string>|openpgp.key.Key|string} signingKeys The private key(s) to use to sign the message.
   * @returns {Promise<openpgp.Message>}
   */
  static async encryptSymmetrically(message, passwords, signingKeys = null) {
    if (signingKeys) {
      signingKeys = await assertDecryptedPrivateKeys(signingKeys);
    }

    return openpgp.encrypt({
      message: openpgp.message.fromText(message),
      passwords: passwords,
      privateKeys: signingKeys
    });
  }

  /**
   * Encrypt and sign text message.
   *
   * @param {string} message The message to encrypt.
   * @param {openpgp.key.Key|string} encryptionKeys The public key(s) to use to encrypt the message
   * @param {array<openpgp.key.Key|string>|openpgp.key.Key|string} signingKeys The private key(s) to use to sign the message.
   * @returns {Promise<openpgp.message.Message>}
   */
  static async encrypt(message, encryptionKeys, signingKeys = null) {
    encryptionKeys = await assertPublicKeys(encryptionKeys);
    if (signingKeys) {
      signingKeys = await assertDecryptedPrivateKeys(signingKeys);
    }

    return openpgp.encrypt({
      message: openpgp.message.fromText(message),
      publicKeys: encryptionKeys,
      privateKeys: signingKeys
    });
  }
}

exports.EncryptMessageService = EncryptMessageService;
