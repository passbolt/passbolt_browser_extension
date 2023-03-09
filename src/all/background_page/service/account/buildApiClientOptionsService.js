/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */
import UserService from "../api/user/userService";
import ApiClientOptions from "../api/apiClient/apiClientOptions";

class BuildApiClientOptionsService {
  /**
   * Build Api client options based on an account.
   * @param {AbstractAccountEntity} account The account to build the api client options based on
   * @returns {Promise<ApiClientOptions>}
   */
  static async buildFromAccount(account) {
    return this.buildFromDomain(account.domain);
  }

  /**
   * Build Api client options based on a domain.
   * @param {string} domain The domain to build the api client options based on.
   * @returns {Promise<ApiClientOptions>}
   */
  static async buildFromDomain(domain) {
    const apiClientOptions = (new ApiClientOptions())
      .setBaseUrl(domain);

    const userService = new UserService(apiClientOptions);
    apiClientOptions.setCsrfToken(await userService.findCsrfToken());

    return apiClientOptions;
  }
}

export default BuildApiClientOptionsService;
