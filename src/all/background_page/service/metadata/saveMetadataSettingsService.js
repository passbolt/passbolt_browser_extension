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
 * @since         4.11.0
 */
import MetadataTypesSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import MetadataTypesSettingsApiService from "../api/metadata/metadataTypesSettingsApiService";
import MetadataTypesSettingsLocalStorage from "../local_storage/metadataTypesSettingsLocalStorage";
import {assertType} from "../../utils/assertions";

/**
 * The service aims to save metadata settings.
 */
export default class SaveMetadataSettingsService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.metadataTypesSettingsApiService = new MetadataTypesSettingsApiService(apiClientOptions);
    this.metadataTypesSettingsLocalStorage = new MetadataTypesSettingsLocalStorage(account);
  }

  /**
   * Save the metadata type settings to the API and update local storage with the latest version.
   * @param {MetadataTypesSettingsEntity} settings The settings to save.
   * @return {Promise<MetadataTypesSettingsEntity>}
   */
  async saveTypesSettings(settings) {
    assertType(settings, MetadataTypesSettingsEntity);
    const savedSettingsDto = await this.metadataTypesSettingsApiService.save(settings);
    const savedSettings = new MetadataTypesSettingsEntity(savedSettingsDto);
    await this.metadataTypesSettingsLocalStorage.set(savedSettings);

    return savedSettings;
  }
}
