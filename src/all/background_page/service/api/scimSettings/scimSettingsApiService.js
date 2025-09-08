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
 * @since         5.5.0
 */
import ScimSettingsEntity from "passbolt-styleguide/src/shared/models/entity/scimSettings/scimSettingsEntity";
import {assertType} from "../../../utils/assertions";
import AbstractService from "../abstract/abstractService";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";

const SCIM_SETTINGS_SERVICE_RESOURCE_NAME = 'scim/settings';

class ScimSettingsApiService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, ScimSettingsApiService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return SCIM_SETTINGS_SERVICE_RESOURCE_NAME;
  }

  /**
   * Get SCIM settings
   *
   * @returns {Promise<PassboltResponseEntity>}
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async get() {
    const result = await this.apiClient.findAll();
    return new PassboltResponseEntity(result);
  }

  /**
   * Create SCIM settings
   *
   * @param {ScimSettingsEntity} scimSettings
   * @returns {Promise<PassboltResponseEntity>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async create(scimSettings) {
    assertType(scimSettings, ScimSettingsEntity);

    const response = await this.apiClient.create(scimSettings);
    return new PassboltResponseEntity(response);
  }

  /**
   * Update SCIM settings
   *
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<PassboltResponseEntity>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async update(id, data) {
    this.assertValidId(id);
    this.assertNonEmptyData(data);
    const response = await this.apiClient.update(id, data);
    return new PassboltResponseEntity(response);
  }

  /**
   * Delete SCIM settings
   *
   * @param {string} id
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async delete(id) {
    this.assertValidId(id);
    const result = await this.apiClient.delete(id);
    return new PassboltResponseEntity(result);
  }
}

export default ScimSettingsApiService;
