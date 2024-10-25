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

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import GetOrFindMetadataSettingsService from "./getOrFindMetadataSettingsService";
import {
  defaultMetadataTypesSettingsV4Dto,
  defaultMetadataTypesSettingsV50FreshDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import {
  defaultCeOrganizationSettings
} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import MetadataTypesSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {
  defaultMetadataKeysSettingsDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import MetadataKeysSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GetOrFindMetadataSettingsService", () => {
  let getOrFindMetadataSettingsService, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    getOrFindMetadataSettingsService = new GetOrFindMetadataSettingsService(account, apiClientOptions);
    // flush account related storage before each.
    getOrFindMetadataSettingsService.metadataTypesSettingsLocalStorage.flush();
    getOrFindMetadataSettingsService.metadataKeysSettingsLocalStorage.flush();
  });

  describe("::getOrFindMetadataTypesSettings", () => {
    it("with empty storage, retrieves the metadata types settings from the API and store them into the local storage.", async() => {
      expect.assertions(3);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const siteSettingsDto = defaultCeOrganizationSettings();
      jest.spyOn(getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings")
        .mockImplementation(() => metadataTypesSettingsDto);
      jest.spyOn(getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.organisationSettingsModel.organizationSettingsService, "find")
        .mockImplementation(() => siteSettingsDto);

      // Control initial storage value.
      const initialStorageValue = await getOrFindMetadataSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(initialStorageValue).toBeUndefined();

      const entity = await getOrFindMetadataSettingsService.getOrFindTypesSettings();

      expect(entity.toDto()).toEqual(metadataTypesSettingsDto);
      const storageValue = await getOrFindMetadataSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataTypesSettingsDto);
    });

    it("with populated storage, retrieves the metadata types settings from the local storage.", async() => {
      expect.assertions(2);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      await getOrFindMetadataSettingsService.metadataTypesSettingsLocalStorage.set(new MetadataTypesSettingsEntity(metadataTypesSettingsDto));
      jest.spyOn(getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings");

      const entity = await getOrFindMetadataSettingsService.getOrFindTypesSettings();

      expect(getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataTypesSettingsApiService.findSettings)
        .not.toHaveBeenCalled();
      expect(entity.toDto()).toEqual(metadataTypesSettingsDto);
    });

    it("with storage populated with incomplete data, retrieves the metadata types settings marshall with default value.", async() => {
      expect.assertions(2);
      browser.storage.local.set({[getOrFindMetadataSettingsService.metadataTypesSettingsLocalStorage.storageKey]: {}});

      jest.spyOn(getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings");

      const entity = await getOrFindMetadataSettingsService.getOrFindTypesSettings();

      expect(getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataTypesSettingsApiService.findSettings)
        .not.toHaveBeenCalled();
      expect(entity.toDto()).toEqual(defaultMetadataTypesSettingsV4Dto());
    });
  });

  describe("::getOrFindMetadataKeysSettings", () => {
    it("with empty storage, retrieves the metadata keys settings from the API and store them into the local storage.", async() => {
      expect.assertions(3);
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      jest.spyOn(getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementation(() => metadataKeysSettingsDto);

      // Control initial storage value.
      const initialStorageValue = await getOrFindMetadataSettingsService.metadataKeysSettingsLocalStorage.get();
      await expect(initialStorageValue).toBeUndefined();

      const entity = await getOrFindMetadataSettingsService.getOrFindKeysSettings();

      expect(entity.toDto()).toEqual(metadataKeysSettingsDto);
      const storageValue = await getOrFindMetadataSettingsService.metadataKeysSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataKeysSettingsDto);
    });

    it("with populated storage, retrieves the metadata keys settings from the local storage.", async() => {
      expect.assertions(2);
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      await getOrFindMetadataSettingsService.metadataKeysSettingsLocalStorage.set(new MetadataKeysSettingsEntity(metadataKeysSettingsDto));
      jest.spyOn(getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings");

      const entity = await getOrFindMetadataSettingsService.getOrFindKeysSettings();

      expect(getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService.findSettings)
        .not.toHaveBeenCalled();
      expect(entity.toDto()).toEqual(metadataKeysSettingsDto);
    });

    it("with storage populated with incomplete data, retrieves the metadata keys settings marshall with default value.", async() => {
      expect.assertions(2);
      browser.storage.local.set({[getOrFindMetadataSettingsService.metadataKeysSettingsLocalStorage.storageKey]: {}});

      jest.spyOn(getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings");

      const entity = await getOrFindMetadataSettingsService.getOrFindKeysSettings();

      expect(getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService.findSettings)
        .not.toHaveBeenCalled();
      expect(entity.toDto()).toEqual(defaultMetadataKeysSettingsDto());
    });
  });
});
