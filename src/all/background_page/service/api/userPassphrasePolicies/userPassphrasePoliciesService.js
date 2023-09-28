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
 * @since         v4.3.0
 */

import AbstractService from "../abstract/abstractService";

const USER_PASSPRHASE_POLICIES_RESOURCE_NAME = 'user-passphrase-policies/settings';

class UserPassphrasePoliciesService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, UserPassphrasePoliciesService.RESOURCE_NAME);
  }

  /**
   * Get settings for user-passphrase-policies.
   * @returns {Promise<Object>} Response body
   * @public
   */
  async find() {
    const setting = await this.apiClient.findAll();
    return setting.body;
  }

  /**
   * Create user passphrase policies settings on the API.
   * @param {Object} data the settings to save
   * @returns {Promise<Object>} Response body
   * @public
   */
  async create(data) {
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
    return USER_PASSPRHASE_POLICIES_RESOURCE_NAME;
  }
}

export default UserPassphrasePoliciesService;
