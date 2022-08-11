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
import UserModel from "../../model/user/userModel";
import AccountLocalStorage from "../../service/local_storage/accountLocalStorage";
import SetupModel from "../../model/setup/setupModel";
import AccountAccountRecoveryEntity from "../../model/entity/account/accountAccountRecoveryEntity";


class AbortAndInitiateNewAccountRecoveryController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   * @param {AccountAccountRecoveryEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.setupModel = new SetupModel(apiClientOptions);
    this.userModel = new UserModel(apiClientOptions);
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
   * Abort current request and initiate a new one.
   * @returns {Promise<void>}
   */
  async exec() {
    await this.setupModel.abortRecover(this.account);
    await AccountLocalStorage.deleteByUserIdAndType(this.account.userId, AccountAccountRecoveryEntity.TYPE_ACCOUNT_ACCOUNT_RECOVERY);
    await this.userModel.requestHelpCredentialsLost(this.account);
  }
}

export default AbortAndInitiateNewAccountRecoveryController;
