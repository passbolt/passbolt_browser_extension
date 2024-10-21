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
import MetadataTypesSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import FindMetadataSettingsService from "./findMetadataSettingsService";
import MetadataTypesSettingsLocalStorage from "../local_storage/metadataTypesSettingsLocalStorage";
import OrganizationSettingsModel from "../../model/organizationSettings/organizationSettingsModel";
import MetadataKeysSettingsLocalStorage from "../local_storage/metadataKeysSettingsLocalStorage";
import MetadataKeysSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";

const FIND_AND_UPDATE_METADATA_TYPES_SETTINGS_LS_LOCK_PREFIX = "FIND_AND_UPDATE_METADATA_TYPES_SETTINGS_LS_LOCK-";
const FIND_AND_UPDATE_METADATA_KEYS_SETTINGS_LS_LOCK_PREFIX = "FIND_AND_UPDATE_METADATA_KEYS_SETTINGS_LS_LOCK-";

/**
 * The service aims to find metadata settings from the API and store them in the local storage.
 */
export default class FindAndUpdateMetadataSettingsLocalStorageService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.findMetadataSettingsService = new FindMetadataSettingsService(apiClientOptions);
    this.metadataTypesSettingsLocalStorage = new MetadataTypesSettingsLocalStorage(account);
    this.metadataKeysSettingsLocalStorage = new MetadataKeysSettingsLocalStorage(account);
    this.organisationSettingsModel = new OrganizationSettingsModel(apiClientOptions);
  }

  /**
   * Retrieve the metadata types settings from the API and store them in the local storage.
   * If the API does not already implement the metadata plugin, return the default v4 settings.
   * @returns {Promise<MetadataTypesSettingsEntity>}
   */
  async findAndUpdateTypesSettings() {
    const lockKey = `${FIND_AND_UPDATE_METADATA_TYPES_SETTINGS_LS_LOCK_PREFIX}${this.account.id}`;

    // If no update is in progress, refresh the local storage.
    return await navigator.locks.request(lockKey, {ifAvailable: true}, async lock => {
      // Lock not granted, an update is already in progress. Wait for its completion and return the value of the local storage.
      if (!lock) {
        return await navigator.locks.request(lockKey, {mode: "shared"}, async() =>
          new MetadataTypesSettingsEntity(await this.metadataTypesSettingsLocalStorage.get())
        );
      }

      // Lock is granted, retrieve the metadata types settings and update the local storage.
      let metadataTypesSettings;
      const organizationSettings = await this.organisationSettingsModel.getOrFind();
      if (organizationSettings.isPluginEnabled("metadata")) {
        metadataTypesSettings = await this.findMetadataSettingsService.findTypesSettings();
      } else {
        // If the metadata plugin is not yet present, provide with the default v4 metadata types settings.
        metadataTypesSettings = MetadataTypesSettingsEntity.createFromV4Default();
      }

      await this.metadataTypesSettingsLocalStorage.set(metadataTypesSettings);
      return metadataTypesSettings;
    });
  }

  /**
   * Retrieve the metadata keys settings from the API and store them in the local storage.
   * If the API does not already implement the metadata plugin, return the default settings.
   * @returns {Promise<MetadataKeysSettingsEntity>}
   */
  async findAndUpdateKeysSettings() {
    const lockKey = `${FIND_AND_UPDATE_METADATA_KEYS_SETTINGS_LS_LOCK_PREFIX}${this.account.id}`;

    // If no update is in progress, refresh the local storage.
    return await navigator.locks.request(lockKey, {ifAvailable: true}, async lock => {
      // Lock not granted, an update is already in progress. Wait for its completion and return the value of the local storage.
      if (!lock) {
        return await navigator.locks.request(lockKey, {mode: "shared"}, async() =>
          new MetadataKeysSettingsEntity(await this.metadataKeysSettingsLocalStorage.get())
        );
      }

      // Lock is granted, retrieve the metadata keys settings and update the local storage.
      const metadataKeysSettings = await this.findMetadataSettingsService.findKeysSettings();
      await this.metadataKeysSettingsLocalStorage.set(metadataKeysSettings);
      return metadataKeysSettings;
    });
  }
}
