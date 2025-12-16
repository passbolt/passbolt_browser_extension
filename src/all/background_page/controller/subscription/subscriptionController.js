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
import SubscriptionModel from "../../model/subscription/subscriptionModel";
import UpdateSubscriptionEntity from "../../model/entity/subscription/update/updateSubscriptionEntity";
import FindSubscriptionKeyService from '../../service/subscription/findSubscriptionKeyService';

class SubscriptionController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, apiClientOptions) {
    this.worker = worker;

    this.findSubscriptionService = new FindSubscriptionKeyService(apiClientOptions);

    this.subscriptionModel = new SubscriptionModel(apiClientOptions);
  }

  /**
   * Get the subscription key
   * @returns {Promise<SubscriptionEntity>} The subscription key
   */
  async getSubscription() {
    return await this.findSubscriptionService.find();
  }

  /**
   * Update the subscription key
   * @param {SubscriptionEntity} subscriptionKeyDto The new subscription key
   * @returns {Promise<SubscriptionEntity>} The updated subscription key
   */
  async updateSubscription(subscriptionKeyDto) {
    const updateSubscriptionEntity = new UpdateSubscriptionEntity(subscriptionKeyDto);
    return await this.subscriptionModel.update(updateSubscriptionEntity);
  }
}

export default SubscriptionController;
