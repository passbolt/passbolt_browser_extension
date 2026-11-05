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

import UpdateSubscriptionEntity from "../../model/entity/subscription/update/updateSubscriptionEntity";
import PostLogoutService from "../../service/auth/postLogoutService";
import CreateSubscriptionKeyService from "../../service/subscription/createSubscriptionKeyService";
import FindAndUpdateActiveSessionSessionStorageService from "../../service/activeSession/findAndUpdateActiveSessionSessionStorageService";

export default class CreateSubscriptionKeyController {
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

    this.createSubscriptionService = new CreateSubscriptionKeyService(apiClientOptions);
    this.findAndUpdateActiveSessionSessionStorageService = new FindAndUpdateActiveSessionSessionStorageService(
      account,
      apiClientOptions,
    );
  }

  /**
   * Controller executor
   * @returns {Promise<void>}
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
   * Create the subscription key (upgrade CE to PRO).
   * @param {{ data: string }} subscriptionKeyDto The new subscription key
   * @returns {Promise<SubscriptionEntity>} The subscription key
   * @throws {Error} Throws an error when encountering any network error
   * @throws {ValidationError} Throws an error if subscriptionKeyDto format is incorrect
   * @throws {PassboltSubscriptionError} Throws `PassboltSubscriptionError` when subscription is already expired or user limit reached
   */
  async exec(subscriptionKeyDto) {
    const subscriptionKeyEntity = new UpdateSubscriptionEntity(subscriptionKeyDto);
    const subscriptionEntity = await this.createSubscriptionService.create(subscriptionKeyEntity);

    // Mark the active session as signed out, before the post-logout cleanup flushes the storages.
    await this.findAndUpdateActiveSessionSessionStorageService.resetAuthentication();
    await PostLogoutService.exec();

    return subscriptionEntity;
  }
}
