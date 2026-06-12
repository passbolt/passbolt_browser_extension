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

import PassboltEditionApiService from "../api/edition/passboltEditionApiService";

export default class DeleteSubscriptionKeyService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    this.passboltEditionApiService = new PassboltEditionApiService(apiClientOptions);
  }

  /**
   * Delete the subscription key (downgrade PRO to CE).
   *
   * @returns {Promise<void>}
   * @throws {Error} Throws an error when encountering any network or server error
   */
  async delete() {
    await this.passboltEditionApiService.delete();
  }
}
