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
 * @since         3.9.0
 */
import SsoAzureLoginService from "../../service/api/sso/ssoAzureLoginService";

/**
 * Model related to the SSO kit server part data
 */
class SsoAzureLoginModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.ssoAzureLoginService = new SsoAzureLoginService(apiClientOptions);
  }

  /**
   * Find the server part SSO kit given an Sso kit id, user id and an authorisation token using Passbolt API
   *
   * @param {string} ssoKitId a code given by the third party auth
   * @param {string} userId a code given by the third party auth
   * @param {string} ssoToken a code given by the third party auth
   * @return {Promise<SsoUserServerDataEntity|null>}
   */
  async getLoginUrl(userId) {
    const redirectUrlDto = await this.ssoAzureLoginService.getLoginUrl({user_id: userId});
    return new URL(redirectUrlDto);
  }
}

export default SsoAzureLoginModel;
