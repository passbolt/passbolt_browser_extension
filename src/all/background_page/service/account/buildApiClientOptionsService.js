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

const {ApiClientOptions} = require("../api/apiClient/apiClientOptions");
const {UserService} = require("../api/user/userService");

class BuildAccountApiClientOptionsService {
  /**
   * Build api client options based on an account.
   * @param {AbstractAccountEntity} account The account to build the api client options based on
   * @returns {Promise<ApiClientOptions>}
   */
  static async build(account) {
    const apiClientOptions = (new ApiClientOptions())
      .setBaseUrl(account.domain);

    const userService = new UserService(apiClientOptions);
    apiClientOptions.setCsrfToken(await userService.findCsrfToken());

    return apiClientOptions;
  }
}

exports.BuildAccountApiClientOptionsService = BuildAccountApiClientOptionsService;
