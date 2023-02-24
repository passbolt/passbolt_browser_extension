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

import AccountRecoveryModel from "../../model/accountRecovery/accountRecoveryModel";
import WorkerService from "../../service/worker/workerService";

class ContinueAccountRecoveryController {
  /**
   * Constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountAccountRecoveryEntity} account The account completing the account recovery.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
    this.account = account;
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec() {
    try {
      await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Check the user can continue the account recovery process.
   *
   * @return {Promise<void>}
   */
  async exec() {
    try {
      await this.accountRecoveryModel.continue(this.account.userId, this.account.authenticationTokenToken);
    } catch (error) {
      /*
       * Something went wrong.
       * Stop the account recovery process and destroy the iframe, the application served by the API will handle the user
       * from here.
       */
      (await WorkerService.get('AccountRecoveryBootstrap', this.worker.tab.id)).port.emit('passbolt.account-recovery-bootstrap.remove-iframe');
      throw error;
    }
  }
}

export default ContinueAccountRecoveryController;
