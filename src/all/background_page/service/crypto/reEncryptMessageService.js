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
const {EncryptMessageService} = require('./encryptMessageService');
const {DecryptMessageService} = require('./decryptMessageService');
const {assertDecryptedPrivateKeys, assertEncryptedMessage, assertPublicKeys, assertKeys} = require("../../utils/openpgp/openpgpAssertions");

class ReEncryptMessageService {
  /**
   * Re-encrypt a given PGP Message with another key.
   *
   * @param {string|openpgp.Message} encryptedMessage
   * @param {string|openpgp.PublicKey|Array<string|openpgp.PublicKey>} encryptionKeys
   * @param {string|openpgp.PrivateKey|Array<string|openpgp.PrivateKey>} decryptionKeys
   * @param {string|openpgp.PrivateKey|Array<string|openpgp.PrivateKey>} signingKeys
   * @param {string|openpgp.PrivateKey|openpgp.PublicKey|Array<string|openpgp.PrivateKey|openpgp.PublicKey>} verifyingKeys
   * @returns {Promise<string>} armored re-encrypted message.
   */
  static async reEncrypt(encryptedMessage, encryptionKeys, decryptionKeys, signingKeys, verifyingKeys) {
    encryptedMessage = await assertEncryptedMessage(encryptedMessage);
    encryptionKeys = await assertPublicKeys(encryptionKeys);
    decryptionKeys = await assertDecryptedPrivateKeys(decryptionKeys);
    signingKeys = await assertDecryptedPrivateKeys(signingKeys);
    if (verifyingKeys) {
      verifyingKeys = await assertKeys(verifyingKeys);
    }

    const decryptedMessage = await DecryptMessageService.decrypt(encryptedMessage, decryptionKeys, verifyingKeys);
    return await EncryptMessageService.encrypt(decryptedMessage, encryptionKeys, signingKeys);
  }
}

exports.ReEncryptMessageService = ReEncryptMessageService;
