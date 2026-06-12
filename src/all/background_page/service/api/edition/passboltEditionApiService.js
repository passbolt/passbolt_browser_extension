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

import AbstractService from "../abstract/abstractService";

export const PASSBOLT_EDITION_API_SERVICE_RESOURCE_NAME = "edition/subscription/key";

class PassboltEditionApiService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, PassboltEditionApiService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return PASSBOLT_EDITION_API_SERVICE_RESOURCE_NAME;
  }

  /**
   * Create the subscription on the API (upgrade CE to PRO).
   *
   * @param {Object} keyDto the new subscription key dto
   * @throws {Error} if API call fails, service unreachable, etc.
   * @returns {Promise<Object>} subscriptionDto
   */
  async create(keyDto) {
    const response = await this.apiClient.create(keyDto);
    return response.body;
  }

  /**
   * Delete the subscription on the API (downgrade PRO to CE).
   *
   * @throws {Error} if API call fails, service unreachable, etc.
   * @returns {Promise<void>}
   */
  async delete() {
    const url = this.apiClient.buildUrl(this.apiClient.baseUrl.toString());
    await this.apiClient.fetchAndHandleResponse("DELETE", url);
  }
}

export default PassboltEditionApiService;
