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
const {ParseSetupUrlService} = require("./parseSetupUrlService");

class BuildSetupApiClientOptions {
  /**
   * Build api client options for setup.
   * @param {string} url The setup url.
   * @returns {Promise<ApiClientOptions>}
   */
  static async buildFromUrl(url) {
    const parseSetupUrl = ParseSetupUrlService.parse(url);

    const apiClientOptions = (new ApiClientOptions())
      .setBaseUrl(parseSetupUrl.domain);

    const userService = new UserService(apiClientOptions);
    apiClientOptions.setCsrfToken(await userService.findCsrfToken());

    return apiClientOptions;
  }
}

exports.BuildSetupApiClientOptions = BuildSetupApiClientOptions;
