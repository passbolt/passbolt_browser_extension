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
const {ApiClientOptions} = require("../../service/api/apiClient/apiClientOptions");
const {AccountModel} = require("../../model/account/accountModel");
const {AccountRecoveryModel} = require("../../model/accountRecovery/accountRecoveryModel");
const {AccountEntity} = require("../../model/entity/account/accountEntity");
const {AccountRecoveryRequestCreateEntity} = require("../../model/entity/accountRecovery/accountRecoveryRequestCreateEntity");
const {AccountRecoveryRequestService} = require("../../service/api/accountRecovery/accountRecoveryRequestService");
const {AccountLocalStorage} = require("../../service/local_storage/accountLocalStorage");

class RecoverInitiateAccountRecoveryRequestController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {SetupEntity} setupEntity The associated setup entity.
   */
  constructor(worker, requestId, setupEntity) {
    this.worker = worker;
    this.requestId = requestId;
    this.setupEntity = setupEntity;
    const apiClientOptions = (new ApiClientOptions()).setBaseUrl(this.setupEntity.domain);
    this.accountModel = new AccountModel(apiClientOptions);
    this.accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
    this.accountRecoveryRequestService = new AccountRecoveryRequestService(apiClientOptions);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      await this.exec();
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Create account recovery
   * @returns {Promise<void>}
   */
  async exec() {
    const accountDto = this.setupEntity.toAccountRecoveryAccountDto();
    const accountEntity = new AccountEntity(accountDto);
    const accountRecoveryRequestDto = this.setupEntity.toAccountRecoveryRequestCreateDto();
    const accountRecoverRequestCreate = new AccountRecoveryRequestCreateEntity(accountRecoveryRequestDto);

    await AccountLocalStorage.deleteByUserIdAndType(accountEntity.userId, accountEntity.type);
    await AccountLocalStorage.add(accountEntity);
    await this.accountRecoveryRequestService.create(accountRecoverRequestCreate);
  }
}

exports.RecoverInitiateAccountRecoveryRequestController = RecoverInitiateAccountRecoveryRequestController;
