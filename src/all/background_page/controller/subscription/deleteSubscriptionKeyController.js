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
 * @since         5.13.0
 */

import PostLogoutService from "../../service/auth/postLogoutService";
import DeleteSubscriptionKeyService from "../../service/subscription/deleteSubscriptionKeyService";
import FindAndUpdateActiveSessionSessionStorageService from "../../service/activeSession/findAndUpdateActiveSessionSessionStorageService";

export default class DeleteSubscriptionKeyController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;

    this.deleteSubscriptionService = new DeleteSubscriptionKeyService(apiClientOptions);
    this.findAndUpdateActiveSessionSessionStorageService = new FindAndUpdateActiveSessionSessionStorageService(
      account,
      apiClientOptions,
    );
  }

  /**
   * Controller executor
   * @returns Promise<void>
   */
  async _exec() {
    try {
      const result = await this.exec.apply(this, arguments);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Delete the subscription key (downgrade PRO to CE).
   * @returns {Promise<void>}
   * @throws {Error} Throws an error when encountering any network or server error
   */
  async exec() {
    await this.deleteSubscriptionService.delete();
    // Mark the active session as signed out, before the post-logout cleanup flushes the storages.
    await this.findAndUpdateActiveSessionSessionStorageService.resetAuthentication();
    await PostLogoutService.exec();
  }
}
