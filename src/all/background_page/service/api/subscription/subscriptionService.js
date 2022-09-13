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
import AbstractService from "../abstract/abstractService";

const SUBSCRIPTION_SERVICE_RESOURCE_NAME = 'ee/subscription';

class SubscriptionService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, SubscriptionService.RESOURCE_NAME);
  }

  /**
   * API Subscription Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return SUBSCRIPTION_SERVICE_RESOURCE_NAME;
  }

  /**
   * Get the subscription
   *
   * @throws {Error} if API call fails, service unreachable, etc.
   * @returns {Object} subscriptionDto
   */
  async find() {
    const response = await this.apiClient.get("key");
    return response.body;
  }

  /**
   * Update the subscription
   *
   * @param keyDto the new subscription key
   * @throws {Error} if API call fails, service unreachable, etc.
   * @returns {Object} subscriptionDto
   */
  async update(keyDto) {
    const response = await this.apiClient.update("key", keyDto);
    return response.body;
  }
}

export default SubscriptionService;
