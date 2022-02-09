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
const {AccountRecoveryModel} = require("../../model/accountRecovery/accountRecoveryModel");
const {DecryptPrivateKeyService} = require("../../service/crypto/decryptPrivateKeyService");
const {EncryptMessageService} = require("../../service/crypto/encryptMessageService");
const {AccountRecoveryResponseEntity} = require("../../model/entity/accountRecovery/accountRecoveryResponseEntity");
const {DecryptMessageService} = require("../../service/crypto/decryptMessageService");
const {PrivateGpgkeyEntity} = require("../../model/entity/gpgkey/privateGpgkeyEntity");
const {AccountRecoveryPrivateKeyPasswordEntity} = require("../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordEntity");
const PassphraseController = require("../passphrase/passphraseController");

/**
 * Controller related to the account recovery response
 */
class AccountRecoveryResponseController {
  /**
   * AccountRecoveryResponseController constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, apiClientOptions) {
    this.worker = worker;
    this.accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
  }

  /**
   * Request the save organization settings of the account recovery
   * @param accountRecoveryResponseDto The response account recovery
   * @param privateKeyDto the current private ORK with its passphrase
   */
  async saveReview(accountRecoveryResponseDto, privateKeyDto) {
    // Security check to save a review of an account recovery
    await PassphraseController.request(this.worker);

    if (accountRecoveryResponseDto?.status === AccountRecoveryResponseEntity.STATUS_APPROVED) {
      const accountRecoveryRequestEntity = await this.accountRecoveryModel.findRequestById(accountRecoveryResponseDto.account_recovery_request_id);
      const currentOrkEntity = new PrivateGpgkeyEntity(privateKeyDto);

      // Decrypt the private organization recovery key
      const decryptedOrk = await DecryptPrivateKeyService.decryptPrivateGpgKeyEntity(currentOrkEntity);
      // Find the private key password corresponding to the foreign model
      const accountRecoveryPrivateKeyPassword = accountRecoveryRequestEntity.accountRecoveryPrivateKeyPasswords.filterByForeignModel(AccountRecoveryPrivateKeyPasswordEntity.FOREIGN_MODEL_ORGANIZATION_KEY);
      // Decrypt message
      const decryptedMessages = await DecryptMessageService.decrypt(accountRecoveryPrivateKeyPassword.data, decryptedOrk.armoredKey, decryptedOrk.armoredKey);
      // Encrypt message
      const messagesReEncrypted = await EncryptMessageService.encrypt(decryptedMessages.data, accountRecoveryRequestEntity.armoredKey, decryptedOrk.armoredKey);
      // Set the message re-encrypted in the response
      accountRecoveryResponseDto.data = messagesReEncrypted.data;
    }

    const accountRecoveryResponseEntity = new AccountRecoveryResponseEntity(accountRecoveryResponseDto);
    return this.accountRecoveryModel.saveReview(accountRecoveryResponseEntity);
  }
}


exports.AccountRecoveryResponseController = AccountRecoveryResponseController;
