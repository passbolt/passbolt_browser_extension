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
import SsoUserServerDataService from "../../service/api/sso/ssoUserServerDataService";
import SsoUserServerDataEntity from "../entity/sso/ssoUserServerDataEntity";

/**
 * Model related to the SSO user's server-side data
 */
class SsoUserServerDataModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.ssoUserDataService = new SsoUserServerDataService(apiClientOptions);
  }

  /**
   * Find the SSO configuration using Passbolt API
   *
   * @return {Promise<SsoUserServerDataEntity|null>}
   */
  async findUserData() {
    const ssoUserServerDataDto = await this.ssoUserDataService.findUserData();
    if (!ssoUserServerDataDto) {
      return null;
    }
    return new SsoUserServerDataEntity(ssoUserServerDataDto);
  }
}

export default SsoUserServerDataModel;
