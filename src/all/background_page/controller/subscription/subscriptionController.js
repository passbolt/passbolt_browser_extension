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
 */
import UpdateSubscriptionKeyService from '../../service/subscription/updateSubscriptionKeyService';
import UpdateSubscriptionEntity from '../../model/entity/subscription/update/updateSubscriptionEntity';

class SubscriptionController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, apiClientOptions) {
    this.worker = worker;
    this.updateSubscriptionService = new UpdateSubscriptionKeyService(apiClientOptions);
  }

  /**
   * Update the subscription key
   * @param {SubscriptionEntity} subscriptionKeyDto The new subscription key
   * @returns {Promise<SubscriptionEntity>} The updated subscription key
   * @throws {Error} Throws an error when encountering any network error
   * @throws {PassboltSubscriptionError} Throws `PassboltSubscriptionError` when payment is required
   */
  async updateSubscription(subscriptionKeyDto) {
    const updateSubscriptionEntity = new UpdateSubscriptionEntity(subscriptionKeyDto);
    return await this.updateSubscriptionService.update(updateSubscriptionEntity);
  }
}

export default SubscriptionController;
