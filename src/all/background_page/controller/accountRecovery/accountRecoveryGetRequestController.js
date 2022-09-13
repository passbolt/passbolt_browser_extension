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
import Validator from "validator";

class AccountRecoveryGetRequestController {
  /**
   * AccountRecoveryGetRequestController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.accountRecoveryModel = new AccountRecoveryModel(apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {string} accountRecoverRequestId The account recovery request id to retrieve
   * @return {Promise<void>}
   */
  async _exec(accountRecoverRequestId) {
    try {
      const accountRecoveryRequest = await this.exec(accountRecoverRequestId);
      this.worker.port.emit(this.requestId, "SUCCESS", accountRecoveryRequest);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Get an account recovery request.
   *
   * @param {string} accountRecoverRequestId The account recovery request id to retrieve
   * @return {Promise<AccountRecoveryRequestEntity|null>}
   */
  async exec(accountRecoverRequestId) {
    if (typeof accountRecoverRequestId === "undefined") {
      throw new Error("An account recovery request id is required.");
    }
    if (typeof accountRecoverRequestId !== "string") {
      throw new Error("The account recovery request should be a string.");
    }
    if (!Validator.isUUID(accountRecoverRequestId)) {
      throw new Error("The account recovery request should be a valid uuid.");
    }

    const contains = {"creator": true, "creator.gpgkey": true};
    return this.accountRecoveryModel.findRequestById(accountRecoverRequestId, contains);
  }
}

export default AccountRecoveryGetRequestController;
