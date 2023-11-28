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
 * @since 4.5.0
 */
import AbstractService from "../abstract/abstractService";

const PASSWORD_EXPIRY_RESOURCE_NAME = 'password-expiry/resources';

class PasswordExpiryResourceService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, PasswordExpiryResourceService.RESOURCE_NAME);
  }

  /**
   * Create password-expiry Resource on the API.
   * @param {Object} data the Resource to save
   * @returns {Promise<Object>} Response body
   * @public
   */
  async update(data) {
    this.assertNonEmptyData(data);
    const setting = await this.apiClient.create(data);
    return setting.body;
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return PASSWORD_EXPIRY_RESOURCE_NAME;
  }
}

export default PasswordExpiryResourceService;
