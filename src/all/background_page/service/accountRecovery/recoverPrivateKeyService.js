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

const {DecryptPrivateKeyService} = require("../../service/crypto/decryptPrivateKeyService");
const {DecryptMessageService} = require("../../service/crypto/decryptMessageService");
const {EncryptPrivateKeyService} = require("../crypto/encryptPrivateKeyService");

class RecoverPrivateKeyService {
  /**
   * Recover the private key.
   * @param {AccountRecoveryPrivateKeyEntity} accountRecoveryPrivateKey The account recovery private key to recover
   * @param {AccountRecoveryResponsesCollection} accountRecoveryResponses The collection of account recovery responses
   * @param {string} requestPrivateKey The user request armored gpg key
   * @param {string} passphrase The user request gpg key passphrase
   * @returns {Promise<string>} The decrypted armored private key
   */
  static async recover(accountRecoveryPrivateKey, accountRecoveryResponses, requestPrivateKey, passphrase) {
    const requestPrivateKeyDecrypted = await DecryptPrivateKeyService.decrypt(requestPrivateKey, passphrase);
    const privateKeyPasswordEncrypted = accountRecoveryResponses.items[0]?.data;
    const privateKeyPassword = await DecryptMessageService.decrypt(privateKeyPasswordEncrypted, requestPrivateKeyDecrypted);
    const decryptedPrivateKey = await DecryptMessageService.decryptSymmetrically(accountRecoveryPrivateKey.data, privateKeyPassword);

    return EncryptPrivateKeyService.encrypt(decryptedPrivateKey, passphrase);
  }
}

exports.RecoverPrivateKeyService = RecoverPrivateKeyService;
