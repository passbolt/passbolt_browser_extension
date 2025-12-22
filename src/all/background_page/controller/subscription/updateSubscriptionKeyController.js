/**
 * Subscription controller
 *
 * Used to handle the operation related to the current subscription
 *
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
 * @since         5.9.0
 */

import UpdateSubscriptionEntity from "../../model/entity/subscription/update/updateSubscriptionEntity";
import UpdateSubscriptionKeyService from "../../service/subscription/updateSubscriptionKeyService";

export default class UpdateSubscriptionKeyController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.updateSubscriptionService = new UpdateSubscriptionKeyService(apiClientOptions);
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
   * Update the subscription key
   * @param {{ data: string }} subscriptionKeyDto The new subscription key
   * @returns {Promise<SubscriptionEntity>} The subscription key
   * @throws {Error} Throws an error when encountering any network error
   * @throws {ValidationError} Throws an error if subscriptionKeyDto format is incorrect
   * @throws {PassboltSubscriptionError} Throws `PassboltSubscriptionError` when payment is required
   */
  exec(subscriptionKeyDto) {
    const updateSubscriptionEntity = new UpdateSubscriptionEntity(subscriptionKeyDto);
    return this.updateSubscriptionService.update(updateSubscriptionEntity);
  }
}
