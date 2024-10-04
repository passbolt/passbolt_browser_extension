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

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GetOrFindMetadataSettingsService", () => {
  let getOrFindMetadataTypesSettingsService, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    getOrFindMetadataTypesSettingsService = new GetOrFindMetadataSettingsService(account, apiClientOptions);
    // flush account related storage before each.
    getOrFindMetadataTypesSettingsService.metadataTypesSettingsLocalStorage.flush();
  });

  describe("::getOrFindMetadataTypesSettings", () => {
    it("with empty storage, retrieves the metadata types settings from the API and store them into the local storage.", async() => {
      expect.assertions(3);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const siteSettingsDto = defaultCeOrganizationSettings();
      jest.spyOn(getOrFindMetadataTypesSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings")
        .mockImplementation(() => metadataTypesSettingsDto);
      jest.spyOn(getOrFindMetadataTypesSettingsService.findAndUpdateMetadataSettingsLocalStorageService.organisationSettingsModel.organizationSettingsService, "find")
        .mockImplementation(() => siteSettingsDto);

      // Control initial storage value.
      const initialStorageValue = await getOrFindMetadataTypesSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(initialStorageValue).toBeUndefined();

      const entity = await getOrFindMetadataTypesSettingsService.getOrFindTypesSettings();

      expect(entity.toDto()).toEqual(metadataTypesSettingsDto);
      const storageValue = await getOrFindMetadataTypesSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataTypesSettingsDto);
    });

    it("with populated storage, retrieves the metadata types settings from the local storage.", async() => {
      expect.assertions(2);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      await getOrFindMetadataTypesSettingsService.metadataTypesSettingsLocalStorage.set(new MetadataTypesSettingsEntity(metadataTypesSettingsDto));
      jest.spyOn(getOrFindMetadataTypesSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings");

      const entity = await getOrFindMetadataTypesSettingsService.getOrFindTypesSettings();

      expect(getOrFindMetadataTypesSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataTypesSettingsApiService.findSettings)
        .not.toHaveBeenCalled();
      expect(entity.toDto()).toEqual(metadataTypesSettingsDto);
    });

    it("with storage populated with incomplete data, retrieves the metadata types settings marshall with default value.", async() => {
      expect.assertions(2);
      browser.storage.local.set({[getOrFindMetadataTypesSettingsService.metadataTypesSettingsLocalStorage.storageKey]: {}});

      jest.spyOn(getOrFindMetadataTypesSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings");

      const entity = await getOrFindMetadataTypesSettingsService.getOrFindTypesSettings();

      expect(getOrFindMetadataTypesSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataTypesSettingsApiService.findSettings)
        .not.toHaveBeenCalled();
      expect(entity.toDto()).toEqual(defaultMetadataTypesSettingsV4Dto());
    });
  });
});
