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
 * @since         3.2.0
 */
import SubscriptionService from "../../service/api/subscription/subscriptionService";
import SubscriptionEntity from "../entity/subscription/subscriptionEntity";
import PassboltSubscriptionError from "../../error/passboltSubscriptionError";

class SubscriptionModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.subscriptionService = new SubscriptionService(apiClientOptions);
  }

  /*
   * ==============================================================
   *  Finders / remote calls
   * ==============================================================
   */

  /**
   * Find the subscription
   *
   * @returns {Promise<SubscriptionEntity>}
   */
  async find() {
    try {
      const subscriptionDto = await this.subscriptionService.find();
      return new SubscriptionEntity(subscriptionDto);
    } catch (error) {
      const isPaymentRequired = error.data && error.data.code === 402;
      if (isPaymentRequired) {
        const subscription = new SubscriptionEntity(error.data.body);
        throw new PassboltSubscriptionError(error.message, subscription);
      }
      throw error;
    }
  }

  /*
   * ==============================================================
   *  CRUD
   * ==============================================================
   */

  /**
   * Update the subscription
   *
   * @param {UpdateSubscriptionEntity} updateSubscriptionEntity
   * @returns {Promise<SubscriptionEntity>}
   */
  async update(updateSubscriptionEntity) {
    try {
      const subscriptionDto = await this.subscriptionService.update(updateSubscriptionEntity.toDto());
      return new SubscriptionEntity(subscriptionDto);
    } catch (error) {
      const isPaymentRequired = error.data && error.data.code === 402;
      if (isPaymentRequired) {
        const subscription = new SubscriptionEntity(error.data.body);
        throw new PassboltSubscriptionError(error.message, subscription);
      }
      throw error;
    }
  }
}

export default SubscriptionModel;
