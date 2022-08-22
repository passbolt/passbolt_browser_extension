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

class AccountRecoveryGetUserRequestsController {
  /**
   * AccountRecoveryGetUserRequestsController constructor
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
   * @param {string} userId The user id the retrieve the user requests for
   * @return {Promise<void>}
   */
  async _exec(userId) {
    try {
      const collections = await this.exec(userId);
      this.worker.port.emit(this.requestId, "SUCCESS", collections);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Get account recovery user requests.
   *
   * @param {string} userId The user id the retrieve the user requests for
   * @return {Promise<AccountRecoveryRequestsCollection|null>}
   */
  async exec(userId) {
    if (!Validator.isUUID(userId)) {
      throw new Error("The user id is not valid");
    }

    const filters = {
      "has-users": [userId],
    };
    return this.accountRecoveryModel.findUserRequests(filters);
  }
}

export default AccountRecoveryGetUserRequestsController;
