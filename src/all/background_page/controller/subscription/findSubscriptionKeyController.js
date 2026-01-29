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
 * @since         5.9.0
 */
import FindSubscriptionKeyService from "../../service/subscription/findSubscriptionKeyService";

export default class FindSubscriptionKeyController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.findSubscriptionService = new FindSubscriptionKeyService(apiClientOptions);
  }

  /**
   * Controller executor related to find the subscription key
   * @returns Promise<void>
   */
  async _exec() {
    try {
      const result = await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * Get the subscription key
   * @returns {Promise<SubscriptionEntity>} The subscription key
   * @throws {Error} Throws an error when encountering any network error
   * @throws {PassboltSubscriptionError} Throws `PassboltSubscriptionError` when payment is required
   */
  exec() {
    return this.findSubscriptionService.find();
  }
}
