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
 * @since         5.1.0
 */

import AbstractService from "../abstract/abstractService";

const USER_GPG_KEY_POLICIES_SETTINGS_API_SERVICE_RESOURCE_NAME = "user-gpg-key-policies/settings";

class UserGpgKeyPoliciesSettingsApiService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, USER_GPG_KEY_POLICIES_SETTINGS_API_SERVICE_RESOURCE_NAME);
  }

  /**
   * Retrieve the user gpg key policies settings from the API as guest.
   * @returns {Promise<Object>} Response body
   * @public
   */
  async findSettingsAsGuest(userId, authenticationToken) {
    // TODO assert parameters
    const urlOptions = {
      user_id: userId,
      authentication_token: authenticationToken
    };

    const apiResult = await this.apiClient.findAll(urlOptions);
    return apiResult.body;
  }
}

export default UserGpgKeyPoliciesSettingsApiService;
