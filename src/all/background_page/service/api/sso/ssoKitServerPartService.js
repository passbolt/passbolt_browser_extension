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
import AbstractService from "../abstract/abstractService";

const SSO_USER_DATA_SERVICE_RESOURCE_NAME = '/sso/keys';

class SsoKitServerPartService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, SsoKitServerPartService.RESOURCE_NAME);
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
   * Get the user's server part SSO kit.
   *
   * @param {uuid} ssoKitId the id of the kit to retrieve
   * @param {uuid} ssoToken an authorisation token to access the data
   * @returns {Promise<SsoKitServerPartDto>}
   */
  async getSsoKit(ssoKitId, userId, ssoToken) {
    const response = await this.apiClient.get(`${ssoKitId}/${userId}/${ssoToken}`);
    return response.body;
  }

  /**
   * Set the server part SSO kit.
   *
   * @param {SsoKitServerPartDro} ssoKiyServerPartDto
   * @returns {Promise<SsoKitServerPartDto>}
   */
  async setupSsoKit(ssoKitServerPartDto) {
    this.assertNonEmptyData(ssoKitServerPartDto);
    const response = await this.apiClient.create(ssoKitServerPartDto);
    return response.body;
  }

  /**
   * Delete an SSO kit matching the given ID using the API.
   * @param {uuid} ssoKitId
   * @returns {Promise<void>}
   */
  async deleteSsoKit(ssoKitId) {
    this.assertValidId(ssoKitId);
    await this.apiClient.delete(ssoKitId);
  }
}

export default SsoKitServerPartService;
