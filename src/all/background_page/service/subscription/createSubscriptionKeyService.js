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

import SubscriptionEntity from "passbolt-styleguide/src/shared/models/entity/subscription/subscriptionEntity";

import PassboltSubscriptionError from "../../error/passboltSubscriptionError";
import PassboltEditionApiService from "../api/edition/passboltEditionApiService";
import UpdateSubscriptionEntity from "../../model/entity/subscription/update/updateSubscriptionEntity";

export default class CreateSubscriptionKeyService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    this.passboltEditionApiService = new PassboltEditionApiService(apiClientOptions);
  }

  /**
   * Create the subscription key (upgrade CE to PRO).
   *
   * @param {UpdateSubscriptionEntity} subscriptionKeyEntity the new subscription key
   * @returns {Promise<SubscriptionEntity>}
   * @throws {Error} Throws an error when encountering any network error
   * @throws {PassboltSubscriptionError} Throws `PassboltSubscriptionError` when the subscription is already expired, or user limit exceeded
   */
  async create(subscriptionKeyEntity) {
    if (!(subscriptionKeyEntity instanceof UpdateSubscriptionEntity)) {
      throw new TypeError("subscriptionKeyEntity is not an UpdateSubscriptionEntity");
    }

    try {
      const newSubscriptionDto = await this.passboltEditionApiService.create(subscriptionKeyEntity.toDto());
      return new SubscriptionEntity(newSubscriptionDto);
    } catch (error) {
      const isBadSubscription = error.data?.code === 402;

      if (isBadSubscription) {
        const subscription = new SubscriptionEntity(error.data.body);
        throw new PassboltSubscriptionError(error.message, subscription);
      }

      throw error;
    }
  }
}
