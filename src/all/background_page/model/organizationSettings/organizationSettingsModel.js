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
import OrganizationSettingsService from "../../service/api/organizationSettings/organizationSettingsService";
import OrganizationSettingsEntity from "../entity/organizationSettings/organizationSettingsEntity";
import PassboltApiFetchError from "../../error/passboltApiFetchError";

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
   * Set the settings.
   * @params {OrganizationSettingsEntity} settings The settings
   */
  static set(settings) {
    if (!(settings instanceof OrganizationSettingsEntity)) {
      throw new Error('The settings should be an instance of OrganizationSettingsEntity');
    }
    _settings = settings;
  }

  /**
   * get the cached settings if any.
   * @return {OrganizationSettingsEntity|null}
   */
  static get() {
    return _settings || null;
  }

  /**
   * Returns the organization settings from the local cache or requests the server.
   * @param {boolean} refreshCache Should request the API to retrieve the organization settings and refresh the cache.
   * Default false
   * @returns {Promise<OrganizationSettingsEntity>}
   */
  async getOrFind(refreshCache = false) {
    if (refreshCache || !_settings) {
      _settings = await this.find();
    }
    return _settings;
  }

  /**
   * Flush the settings cache
   */
  static flushCache() {
    _settings = null;
  }

  /**
   * Find the organization settings.
   * @returns {Promise<OrganizationSettingsEntity>}
   */
  async find() {
    let organizationSettingsDto;

    try {
      organizationSettingsDto = await this.organizationSettingsService.find();
    } catch (error) {
      // When the cloud organization is disabled or not found, the cloud API returns a 403.
      if (error instanceof PassboltApiFetchError
        && error?.data?.code === 403) {
        organizationSettingsDto = OrganizationSettingsEntity.disabledOrganizationSettings;
      }
    }
    return new OrganizationSettingsEntity(organizationSettingsDto);
  }
}

export default OrganizationSettingsModel;
