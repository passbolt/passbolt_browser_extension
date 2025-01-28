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

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import SaveMetadataSettingsService from "./saveMetadataSettingsService";
import MetadataTypesSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {
  defaultMetadataTypesSettingsV4Dto,
  defaultMetadataTypesSettingsV50FreshDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import {
  defaultMetadataKeysSettingsDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import MetadataKeysSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SaveMetadataSettingsService", () => {
  let saveMetadataSettingsService, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    saveMetadataSettingsService = new SaveMetadataSettingsService(account, apiClientOptions);
    // flush account related storages before each test.
    await saveMetadataSettingsService.metadataTypesSettingsLocalStorage.flush();
  });

  describe("::saveTypesSettings", () => {
    it("saves the metadata types settings to the API and store them into the local storage.", async() => {
      expect.assertions(3);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const metadataTypesSettings = new MetadataTypesSettingsEntity(metadataTypesSettingsDto);

      jest.spyOn(saveMetadataSettingsService.metadataTypesSettingsApiService, "save")
        .mockImplementation(settings => settings);

      const savedSettings = await saveMetadataSettingsService.saveTypesSettings(metadataTypesSettings);

      expect(saveMetadataSettingsService.metadataTypesSettingsApiService.save).toHaveBeenCalledWith(metadataTypesSettings);
      expect(savedSettings.toDto()).toEqual(metadataTypesSettingsDto);
      const storageValue = await saveMetadataSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataTypesSettingsDto);
    });

    it("saves the metadata types settings to the API and replace existing settings already stored in the local storage.", async() => {
      expect.assertions(3);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const metadataTypesSettings = new MetadataTypesSettingsEntity(metadataTypesSettingsDto);
      const originalMetadataTypesSettingsDto = defaultMetadataTypesSettingsV4Dto();
      await saveMetadataSettingsService.metadataTypesSettingsLocalStorage.set(new MetadataTypesSettingsEntity(originalMetadataTypesSettingsDto));

      jest.spyOn(saveMetadataSettingsService.metadataTypesSettingsApiService, "save")
        .mockImplementation(settings => settings);

      const savedSettings = await saveMetadataSettingsService.saveTypesSettings(metadataTypesSettings);

      expect(saveMetadataSettingsService.metadataTypesSettingsApiService.save).toHaveBeenCalledWith(metadataTypesSettings);
      expect(savedSettings.toDto()).toEqual(metadataTypesSettingsDto);
      const storageValue = await saveMetadataSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataTypesSettingsDto);
    });

    it("throws if the given metadata types settings is not of type MetadataTypesSettingsEntity.", async() => {
      expect.assertions(1);
      await expect(() => saveMetadataSettingsService.saveTypesSettings(42)).rejects.toThrow(TypeError);
    });

    it("throws if API return invalid settings.", async() => {
      expect.assertions(1);

      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const metadataTypesSettings = new MetadataTypesSettingsEntity(metadataTypesSettingsDto);

      jest.spyOn(saveMetadataSettingsService.metadataTypesSettingsApiService, "save")
        .mockImplementation(() => {});

      await expect(() => saveMetadataSettingsService.saveTypesSettings(metadataTypesSettings))
        .toThrowEntityValidationError("default_resource_types", "required");
    });
  });

  describe("::saveKeysSettings", () => {
    it("saves the metadata keys settings to the API and store them into the local storage.", async() => {
      expect.assertions(3);
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      const metadataKeysSettings = new MetadataKeysSettingsEntity(metadataKeysSettingsDto);

      jest.spyOn(saveMetadataSettingsService.metadataKeysSettingsApiService, "save")
        .mockImplementation(settings => settings);

      const savedSettings = await saveMetadataSettingsService.saveKeysSettings(metadataKeysSettings);

      expect(saveMetadataSettingsService.metadataKeysSettingsApiService.save).toHaveBeenCalledWith(metadataKeysSettings);
      expect(savedSettings.toDto()).toEqual(metadataKeysSettingsDto);
      const storageValue = await saveMetadataSettingsService.metadataKeysSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataKeysSettingsDto);
    });

    it("saves the metadata keys settings to the API and replace existing settings already stored in the local storage.", async() => {
      expect.assertions(3);
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      const metadataKeysSettings = new MetadataKeysSettingsEntity(metadataKeysSettingsDto);
      const originalMetadataKeysSettingsDto = defaultMetadataKeysSettingsDto({zero_knowledge_key_share: true});
      await saveMetadataSettingsService.metadataKeysSettingsLocalStorage.set(new MetadataKeysSettingsEntity(originalMetadataKeysSettingsDto));

      jest.spyOn(saveMetadataSettingsService.metadataKeysSettingsApiService, "save")
        .mockImplementation(settings => settings);

      const savedSettings = await saveMetadataSettingsService.saveKeysSettings(metadataKeysSettings);

      expect(saveMetadataSettingsService.metadataKeysSettingsApiService.save).toHaveBeenCalledWith(metadataKeysSettings);
      expect(savedSettings.toDto()).toEqual(metadataKeysSettingsDto);
      const storageValue = await saveMetadataSettingsService.metadataKeysSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataKeysSettingsDto);
    });

    it("throws if the given metadata keys settings is not of type MetadataKeysSettingsEntity.", async() => {
      expect.assertions(1);
      await expect(() => saveMetadataSettingsService.saveKeysSettings(42)).rejects.toThrow(TypeError);
    });

    it("throws if API return invalid settings.", async() => {
      expect.assertions(1);

      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      const metadataKeysSettings = new MetadataKeysSettingsEntity(metadataKeysSettingsDto);

      jest.spyOn(saveMetadataSettingsService.metadataKeysSettingsApiService, "save")
        .mockImplementation(() => {});

      await expect(() => saveMetadataSettingsService.saveKeysSettings(metadataKeysSettings))
        .toThrowEntityValidationError("allow_usage_of_personal_keys", "required");
    });
  });
});
