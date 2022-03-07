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

const {AccountRecoveryModel} = require("../../model/accountRecovery/accountRecoveryModel");
const {DecryptPrivateKeyService} = require("../../service/crypto/decryptPrivateKeyService");
const {AccountRecoveryResponseEntity} = require("../../model/entity/accountRecovery/accountRecoveryResponseEntity");
const {PrivateGpgkeyEntity} = require("../../model/entity/gpgkey/privateGpgkeyEntity");
const {AccountRecoveryPrivateKeyPasswordEntity} = require("../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordEntity");
const PassphraseController = require("../passphrase/passphraseController");
const {ReEncryptMessageService} = require("../../service/crypto/reEncryptMessageService");

/**
 * Controller related to the account recovery response
 */
class AccountRecoveryReviewRequestController {
  /**
   * AccountRecoveryResponseController constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
  }

  /**
   * Controller executor.
   * @param {Object} accountRecoveryResponseDto The response account recovery
   * @param {Object} privateKeyDto the current private ORK with its passphrase
   * @returns {Promise<void>}
   */
  async _exec(accountRecoveryResponseDto, privateKeyDto) {
    try {
      await this.exec(accountRecoveryResponseDto, privateKeyDto);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Review account recovery user request.
   * @param {Object} accountRecoveryResponseDto The account recovery response dto
   * @param {Object} organizationPrivateGpgkeyDto The account recovery organization private key dto (contains the passphrase)
   * @return {Promise<AccountRecoveryResponseEntity>}
   */
  async exec(accountRecoveryResponseDto, organizationPrivateGpgkeyDto = null) {
    // Secure access with user passphrase.
    await PassphraseController.request(this.worker);

    if (accountRecoveryResponseDto?.status === AccountRecoveryResponseEntity.STATUS_APPROVED) {
      const organizationPrivateGpgkey = new PrivateGpgkeyEntity(organizationPrivateGpgkeyDto);
      accountRecoveryResponseDto.data = await this.reEncryptPrivateKeyPasswordForUser(organizationPrivateGpgkey, accountRecoveryResponseDto.account_recovery_request_id);
    }

    const accountRecoveryResponseEntity = new AccountRecoveryResponseEntity(accountRecoveryResponseDto);
    return this.accountRecoveryModel.saveReview(accountRecoveryResponseEntity);
  }

  /**
   * Re-encrypt the account recovery private key password for the user request public key.
   * @param {PrivateGpgkeyEntity} organizationPrivateGpgkey The account recovery organization private with its passphrase
   * @param {string} accountRecoveryRequestId The account recovery request id
   * @returns {Promise<string>} The armored account recovery private key password encrypted for the user request public key.
   */
  async reEncryptPrivateKeyPasswordForUser(organizationPrivateGpgkey, accountRecoveryRequestId) {
    const organizationPrivateKeyDecrypted = await DecryptPrivateKeyService.decryptPrivateGpgKeyEntity(organizationPrivateGpgkey);
    const accountRecoveryRequestEntity = await this.accountRecoveryModel.findRequestById(accountRecoveryRequestId);
    const accountRecoveryPrivateKeyPassword = accountRecoveryRequestEntity.accountRecoveryPrivateKeyPasswords.filterByForeignModel(AccountRecoveryPrivateKeyPasswordEntity.FOREIGN_MODEL_ORGANIZATION_KEY);
    if (!accountRecoveryPrivateKeyPassword) {
      throw new Error("No account recovery private key password found.");
    }
    return ReEncryptMessageService.reEncrypt(accountRecoveryPrivateKeyPassword.data, accountRecoveryRequestEntity.armoredKey, organizationPrivateKeyDecrypted, organizationPrivateKeyDecrypted);
  }
}

exports.AccountRecoveryReviewRequestController = AccountRecoveryReviewRequestController;
