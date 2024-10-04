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
 * @since         4.10.0
 */
import MetadataTypesSettingsApiService from "../api/metadata/metadataTypesSettingsApiService";
import MetadataTypesSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";

/**
 * The service aims to find metadata settings from the API.
 */
export default class FindMetadataSettingsService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.metadataTypesSettingsApiService = new MetadataTypesSettingsApiService(apiClientOptions);
  }

  /**
   * Retrieve the metadata types settings.
   * Marshall the information retrieved from the API, and ensure all the local default are present.
   * @returns {Promise<MetadataTypesSettingsEntity>}
   */
  async findTypesSettings() {
    const dto = await this.metadataTypesSettingsApiService.findSettings();
    return MetadataTypesSettingsEntity.createFromDefault(dto);
  }
}
