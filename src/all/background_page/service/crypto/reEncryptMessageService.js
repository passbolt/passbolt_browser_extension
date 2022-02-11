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

const {EncryptMessageService} = require('./encryptMessageService');
const {DecryptMessageService} = require('./decryptMessageService');
const {assertPrivateKeys, assertMessage, assertPublicKeys} = require("../../utils/openpgp/openpgpAssertions");

class ReEncryptMessageService {
  /**
   * Re-encrypt a given PGP Message with another key.
   *
   * @param {string|openpgp.message} encryptedMessage
   * @param {string|openpgp.key|Array<string|openpgp.key>} encryptionKeys
   * @param {string|openpgp.key|Array<string|openpgp.key>} decryptionKeys
   * @param {string|openpgp.key|Array<string|openpgp.key>} signingKeys
   * @returns {Promise<openpgp.message>} armored re-encrypted message.
   */
  static async reEncrypt(encryptedMessage, encryptionKeys, decryptionKeys, signingKeys) {
    encryptedMessage = await assertMessage(encryptedMessage);
    encryptionKeys = await assertPublicKeys(encryptionKeys);
    decryptionKeys = await assertPrivateKeys(decryptionKeys);
    signingKeys = await assertPrivateKeys(signingKeys);

    const decryptedMessage = await DecryptMessageService.decrypt(encryptedMessage, decryptionKeys, signingKeys);
    return await EncryptMessageService.encrypt(decryptedMessage.data, encryptionKeys, signingKeys);
  }
}

exports.ReEncryptMessageService = ReEncryptMessageService;
