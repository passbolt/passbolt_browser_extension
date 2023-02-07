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
import SsoKitServerPartService from "../../service/api/sso/ssoKitServerPartService";
import {assertUuid} from "../../utils/assertions";
import SsoKitServerPartEntity from "../entity/sso/ssoKitServerPartEntity";

/**
 * Model related to the SSO kit server part data
 */
class SsoKitServerPartModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.ssoKitServerPartService = new SsoKitServerPartService(apiClientOptions);
  }

  /**
   * Find the server part SSO kit given an SSO kit id, user id and an authorisation token using Passbolt API
   *
   * @param {string} ssoKitId a code given by the third party auth
   * @param {string} userId a code given by the third party auth
   * @param {string} ssoToken a code given by the third party auth
   * @return {Promise<SsoKitServerPartEntity>}
   */
  async getSsoKit(ssoKitId, userId, ssoToken) {
    assertUuid(ssoKitId, "The SSO kit id should be a valid uuid.");
    assertUuid(userId, "The user id should be a valid uuid.");
    assertUuid(ssoToken, "The SSO token should be a valid uuid.");

    const ssoUserServerDataDto = await this.ssoKitServerPartService.getSsoKit(ssoKitId, userId, ssoToken);
    return new SsoKitServerPartEntity(ssoUserServerDataDto);
  }

  /**
   * Saves the generated server part SSO kit.
   * @param {SsoKitServerPartEntity} ssoKitServerPartEntity the server part SSO kit
   * @returns {Promise<SsoKitServerPartEntity>}
   */
  async setupSsoKit(ssoKitServerPartEntity) {
    const ssoKit = await this.ssoKitServerPartService.setupSsoKit(ssoKitServerPartEntity);
    return new SsoKitServerPartEntity(ssoKit);
  }

  /**
   * Delete an SSO kit matching the given id.
   * @param {uuid} ssoKitId
   * @returns {Promise<void>}
   */
  async deleteSsoKit(ssoKitId) {
    assertUuid(ssoKitId, "The SSO kit id should be a valid uuid.");

    await this.ssoKitServerPartService.deleteSsoKit(ssoKitId);
  }
}

export default SsoKitServerPartModel;
