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
 * @since         3.2.0
 */
const {OrganizationSettingsEntity} = require("../entity/organizationSettings/organizationSettingsEntity");
const {OrganizationSettingsService} = require("../../service/api/organizationSettings/organizationSettingsService");

// Settings local cache.
let _settings;

/**
 * Organization settings model.
 */
class OrganizationSettingsModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.organizationSettingsService = new OrganizationSettingsService(apiClientOptions);
  }

  /**
   * Returns the organization settings from the local cache or requests the server.
   * @param {boolean} refreshCache Should request the API to retrieve the organization settings and refresh the cache.
   * @returns {Promise<OrganizationSettingsEntity>}
   */
  async getOrFind(refreshCache) {
    if (refreshCache || !_settings) {
      _settings = await this.find();
    }
    return _settings;
  }

  /**
   * Find the organization settings.
   * @returns {Promise<OrganizationSettingsEntity>}
   */
  async find() {
    const organizationSettingsDto = await this.organizationSettingsService.find();
    return new OrganizationSettingsEntity(organizationSettingsDto);
  }
}

exports.OrganizationSettingsModel = OrganizationSettingsModel;
