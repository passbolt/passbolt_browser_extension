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
 * @since         3.7.3
 */
import AbstractService from "../abstract/abstractService";
import browser from "webextension-polyfill";//@todo to remove

const SSO_USER_DATA_SERVICE_RESOURCE_NAME = '/sso/config';

class SsoUserServerDataService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, SsoUserServerDataService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return SSO_USER_DATA_SERVICE_RESOURCE_NAME;
  }

  /**
   * Get the SSO configuration from the server
   * @returns {Promise<SsoUserDataDto>}
   */
  async findUserData() {
    //@todo @mock
    const storageKey = "__tmp__sso_user_server_data";
    const ssoUserData = await browser.storage.local.get([storageKey]);
    return ssoUserData[storageKey];
    //@todo: implement
    const response = await this.apiClient.find();
    return response.body;
  }
}

export default SsoUserServerDataService;
