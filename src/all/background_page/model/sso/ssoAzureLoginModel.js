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
import {assertUuid} from "../../utils/assertions";
import SsoAzureLoginService from "../../service/api/sso/ssoAzureLoginService";
import SsoLoginUrlEntity from "../entity/sso/ssoLoginUrlEntity";

/**
 * Model related to the SSO Azure Login URL
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
   * Get the Azure login URL given a user id
   *
   * @param {uuid} userid
   * @return {Promise<URL>}
   */
  async getLoginUrl(userId) {
    assertUuid(userId, "The user id should be a valid uuid.");

    const redirectUrlDto = await this.ssoAzureLoginService.getLoginUrl({user_id: userId});
    return new SsoLoginUrlEntity(redirectUrlDto);
  }
}

export default SsoAzureLoginModel;
