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
import SsoLoginUrlEntity from "../entity/sso/ssoLoginUrlEntity";
import SsoLoginService from "../../service/api/sso/ssoLoginService";

/**
 * Model related to the SSO Azure Login URL
 */
class SsoLoginModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.ssoLoginService = new SsoLoginService(apiClientOptions);
  }

  /**
   * Get the Azure login URL given a user id
   * @param {string} providerId the provider identifier
   * @param {uuid} userid
   * @return {Promise<URL>}
   */
  async getLoginUrl(providerId, userId) {
    assertUuid(userId, "The user id should be a valid uuid.");

    const redirectUrlDto = await this.ssoLoginService.getLoginUrl(providerId, {user_id: userId});
    return new SsoLoginUrlEntity(redirectUrlDto, providerId);
  }
}

export default SsoLoginModel;
