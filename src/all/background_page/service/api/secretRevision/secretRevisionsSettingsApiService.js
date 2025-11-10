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
 * @since         5.7.0
 */

import {ApiClient} from "passbolt-styleguide/src/shared/lib/apiClient/apiClient";
import {assertType} from "../../../utils/assertions";
import AbstractService from "../abstract/abstractService";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import SecretRevisionsSettingsEntity from "passbolt-styleguide/src/shared/models/entity/secretRevision/secretRevisionsSettingsEntity";

const SECRET_REVISION_SETTINGS_SERVICE_RESOURCE_NAME = 'secret-revisions/settings';
const SECRET_REVISION_SETTINGS_SERVICE_DELETE_RESOURCE_NAME = 'secret-revisions';

export default class SecretRevisionsSettingsApiService extends AbstractService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, SecretRevisionsSettingsApiService.RESOURCE_NAME);
    this.apiClientOptions = apiClientOptions;
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return SECRET_REVISION_SETTINGS_SERVICE_RESOURCE_NAME;
  }

  /**
   * Get Secret revisions settings
   *
   * @returns {Promise<PassboltResponseEntity>}
   */
  async findSettings() {
    const result = await this.apiClient.findAll();
    return new PassboltResponseEntity(result);
  }

  /**
   * Saves the given secret revisions settings onto the API.
   *
   * @param {SecretRevisionsSettingsEntity} settings
   * @returns {Promise<PassboltResponseEntity>}
   */
  async save(secretRevisionsSettingsEntity) {
    assertType(secretRevisionsSettingsEntity, SecretRevisionsSettingsEntity);
    const requestBody = secretRevisionsSettingsEntity.toDto();
    const result = await this.apiClient.create(requestBody);
    return new PassboltResponseEntity(result);
  }

  /**
   * Deletes the given secret revisions settings onto the API.
   * @returns {Promise<PassboltResponseEntity>}
   */
  async delete() {
    this.apiClientOptions.setResourceName(SECRET_REVISION_SETTINGS_SERVICE_DELETE_RESOURCE_NAME);
    const apiClient = new ApiClient(this.apiClientOptions);
    const result = await apiClient.delete("settings");
    return new PassboltResponseEntity(result);
  }
}
