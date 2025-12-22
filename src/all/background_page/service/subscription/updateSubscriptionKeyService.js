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
import SubscriptionEntity from "../../model/entity/subscription/subscriptionEntity";
import PassboltSubscriptionError from "../../error/passboltSubscriptionError";
import SubscriptionApiService from "../api/subscription/subscriptionApiService";
import UpdateSubscriptionEntity from "../../model/entity/subscription/update/updateSubscriptionEntity";

export default class UpdateSubscriptionKeyService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    this.subscriptionService = new SubscriptionApiService(apiClientOptions);
  }

  /**
   * Update the subscription key
   *
   * @param {UpdateSubscriptionEntity} updateSubscriptionEntity The new subscription key
   * @returns {Promise<SubscriptionEntity>}
   * @throws {Error} Throws an error when encountering any network error
   * @throws {PassboltSubscriptionError} Throws `PassboltSubscriptionError` when payment is required
   */
  async update(updateSubscriptionEntity) {
    if (!(updateSubscriptionEntity instanceof UpdateSubscriptionEntity)) {
      throw new TypeError("updateSubscriptionEntity is not a UpdateSubscriptionEntity");
    }
    try {
      const subscriptionDto = await this.subscriptionService.update(updateSubscriptionEntity.toDto());
      return new SubscriptionEntity(subscriptionDto);
    } catch (error) {
      const isPaymentRequired = error.data?.code === 402;

      if (isPaymentRequired) {
        const subscription = new SubscriptionEntity(error.data.body);
        throw new PassboltSubscriptionError(error.message, subscription);
      }

      throw error;
    }
  }
}
