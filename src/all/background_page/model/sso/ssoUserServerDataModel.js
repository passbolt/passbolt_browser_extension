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
   * @param {string} thirdPartyCode a code given by the third party auth
   * @return {Promise<SsoUserServerDataEntity|null>}
   */
  async findUserData(thirdPartyCode) {
    const ssoUserServerDataDto = await this.ssoUserDataService.findUserData(thirdPartyCode);
    if (!ssoUserServerDataDto) {
      return null;
    }
    return new SsoUserServerDataEntity(ssoUserServerDataDto);
  }

  /**
   * Saves the generated credential's server-side data.
   * @param {SsoUserServerDataEntity} ssoUserServerDataEntity the server-side user's data
   * @returns {Promise<void>}
   */
  async updateUserData(ssoUserServerDataEntity) {
    await this.ssoUserDataService.update(ssoUserServerDataEntity);
  }
}

export default SsoUserServerDataModel;
