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
import FindAndUpdateMetadataSettingsLocalStorageService from "./findAndUpdateMetadataSettingsLocalStorageService";
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

describe("FindAndUpdateMetadataSettingsLocalStorageService", () => {
  let findAndUpdateMetadataSettingsService, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    findAndUpdateMetadataSettingsService = new FindAndUpdateMetadataSettingsLocalStorageService(account, apiClientOptions);
    // flush account related storage before each.
    findAndUpdateMetadataSettingsService.metadataTypesSettingsLocalStorage.flush();
    findAndUpdateMetadataSettingsService.metadataKeysSettingsLocalStorage.flush();
  });

  describe("::findAndUpdateTypesSettings", () => {
    it("retrieves the metadata types settings from the API and store them into the local storage.", async() => {
      expect.assertions(2);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const siteSettingsDto = defaultCeOrganizationSettings();
      jest.spyOn(findAndUpdateMetadataSettingsService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings").mockImplementation(() => metadataTypesSettingsDto);
      jest.spyOn(findAndUpdateMetadataSettingsService.organisationSettingsModel.organizationSettingsService, "find").mockImplementation(() => siteSettingsDto);

      const entity = await findAndUpdateMetadataSettingsService.findAndUpdateTypesSettings();

      expect(entity.toDto()).toEqual(metadataTypesSettingsDto);
      const storageValue = await findAndUpdateMetadataSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataTypesSettingsDto);
    });

    it("retrieves partial metadata types settings from the API and store them marshalled into the local storage.", async() => {
      expect.assertions(2);
      const metadataTypesSettingsDto = {};
      const siteSettingsDto = defaultCeOrganizationSettings();
      jest.spyOn(findAndUpdateMetadataSettingsService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings").mockImplementation(() => metadataTypesSettingsDto);
      jest.spyOn(findAndUpdateMetadataSettingsService.organisationSettingsModel.organizationSettingsService, "find").mockImplementation(() => siteSettingsDto);

      const entity = await findAndUpdateMetadataSettingsService.findAndUpdateTypesSettings();

      // The value of the default are expected to evolve with passbolt transitioning to v5 types.
      const expectedMetadataTypesSettingsDto = defaultMetadataTypesSettingsV4Dto();
      expect(entity.toDto()).toEqual(expectedMetadataTypesSettingsDto);
      const storageValue = await findAndUpdateMetadataSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(expectedMetadataTypesSettingsDto);
    });

    it("with v4, retrieves default v4 metadata types settings without calling the API and store them into the local storage.", async() => {
      expect.assertions(3);
      const siteSettingsDto = defaultCeOrganizationSettings();
      delete siteSettingsDto.passbolt.plugins.metadata;
      jest.spyOn(findAndUpdateMetadataSettingsService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings");
      jest.spyOn(findAndUpdateMetadataSettingsService.organisationSettingsModel.organizationSettingsService, "find").mockImplementation(() => siteSettingsDto);

      const entity = await findAndUpdateMetadataSettingsService.findAndUpdateTypesSettings();

      // The value of the default are expected to evolve with passbolt transitioning to v5 types.
      const expectedMetadataTypesSettingsDto = defaultMetadataTypesSettingsV4Dto();
      expect(findAndUpdateMetadataSettingsService.findMetadataSettingsService.metadataTypesSettingsApiService.findSettings).not.toHaveBeenCalled();
      expect(entity.toDto()).toEqual(expectedMetadataTypesSettingsDto);
      const storageValue = await findAndUpdateMetadataSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(expectedMetadataTypesSettingsDto);
    });

    it("overrides local storage with a second update call.", async() => {
      expect.assertions(2);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const siteSettingsDto = defaultCeOrganizationSettings();
      jest.spyOn(findAndUpdateMetadataSettingsService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings").mockImplementation(() => metadataTypesSettingsDto);
      jest.spyOn(findAndUpdateMetadataSettingsService.organisationSettingsModel.organizationSettingsService, "find").mockImplementation(() => siteSettingsDto);
      await findAndUpdateMetadataSettingsService.metadataTypesSettingsLocalStorage.set(new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto()));

      const entity = await findAndUpdateMetadataSettingsService.findAndUpdateTypesSettings();

      expect(entity.toDto()).toEqual(metadataTypesSettingsDto);
      const storageValue = await findAndUpdateMetadataSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataTypesSettingsDto);
    });

    it("waits any on-going call to the update and returns the result of the local storage.", async() => {
      expect.assertions(4);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const siteSettingsDto = defaultCeOrganizationSettings();
      let resolve;
      const promise = new Promise(_resolve => resolve = _resolve);
      jest.spyOn(findAndUpdateMetadataSettingsService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings").mockImplementation(() => promise);
      jest.spyOn(findAndUpdateMetadataSettingsService.organisationSettingsModel.organizationSettingsService, "find").mockImplementation(() => siteSettingsDto);
      await findAndUpdateMetadataSettingsService.metadataTypesSettingsLocalStorage.set(new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto()));

      const promiseFirstCall = findAndUpdateMetadataSettingsService.findAndUpdateTypesSettings();
      const promiseSecondCall = findAndUpdateMetadataSettingsService.findAndUpdateTypesSettings();
      resolve(metadataTypesSettingsDto);
      const resultFirstCall = await promiseFirstCall;
      const resultSecondCall = await promiseSecondCall;

      expect(findAndUpdateMetadataSettingsService.findMetadataSettingsService.metadataTypesSettingsApiService.findSettings).toHaveBeenCalledTimes(1);
      expect(resultFirstCall.toDto()).toEqual(metadataTypesSettingsDto);
      expect(resultSecondCall.toDto()).toEqual(metadataTypesSettingsDto);
      const storageValue = await findAndUpdateMetadataSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataTypesSettingsDto);
    });
  });

  describe("::findAndUpdateKeysSettings", () => {
    it("retrieves the metadata keys settings from the API and store them into the local storage.", async() => {
      expect.assertions(2);
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      jest.spyOn(findAndUpdateMetadataSettingsService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings").mockImplementation(() => metadataKeysSettingsDto);

      const entity = await findAndUpdateMetadataSettingsService.findAndUpdateKeysSettings();

      expect(entity.toDto()).toEqual(metadataKeysSettingsDto);
      const storageValue = await findAndUpdateMetadataSettingsService.metadataKeysSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataKeysSettingsDto);
    });

    it("retrieves partial metadata keys settings from the API and store them marshalled into the local storage.", async() => {
      expect.assertions(2);
      const metadataKeysSettingsDto = {};
      jest.spyOn(findAndUpdateMetadataSettingsService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings").mockImplementation(() => metadataKeysSettingsDto);

      const entity = await findAndUpdateMetadataSettingsService.findAndUpdateKeysSettings();

      // The value of the default is expected.
      const expectedMetadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      expect(entity.toDto()).toEqual(expectedMetadataKeysSettingsDto);
      const storageValue = await findAndUpdateMetadataSettingsService.metadataKeysSettingsLocalStorage.get();
      await expect(storageValue).toEqual(expectedMetadataKeysSettingsDto);
    });

    it("overrides local storage with a second update call.", async() => {
      expect.assertions(2);
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto({allow_usage_of_personal_keys: false, zero_knowledge_key_share: true});
      jest.spyOn(findAndUpdateMetadataSettingsService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings").mockImplementation(() => metadataKeysSettingsDto);
      await findAndUpdateMetadataSettingsService.metadataKeysSettingsLocalStorage.set(new MetadataKeysSettingsEntity(defaultMetadataKeysSettingsDto()));

      const entity = await findAndUpdateMetadataSettingsService.findAndUpdateKeysSettings();

      expect(entity.toDto()).toEqual(metadataKeysSettingsDto);
      const storageValue = await findAndUpdateMetadataSettingsService.metadataKeysSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataKeysSettingsDto);
    });

    it("waits any on-going call to the update and returns the result of the local storage.", async() => {
      expect.assertions(4);
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto({allow_usage_of_personal_keys: false, zero_knowledge_key_share: true});
      let resolve;
      const promise = new Promise(_resolve => resolve = _resolve);
      jest.spyOn(findAndUpdateMetadataSettingsService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings").mockImplementation(() => promise);
      await findAndUpdateMetadataSettingsService.metadataKeysSettingsLocalStorage.set(new MetadataKeysSettingsEntity(defaultMetadataKeysSettingsDto()));

      const promiseFirstCall = findAndUpdateMetadataSettingsService.findAndUpdateKeysSettings();
      const promiseSecondCall = findAndUpdateMetadataSettingsService.findAndUpdateKeysSettings();
      resolve(metadataKeysSettingsDto);
      const resultFirstCall = await promiseFirstCall;
      const resultSecondCall = await promiseSecondCall;

      expect(findAndUpdateMetadataSettingsService.findMetadataSettingsService.metadataKeysSettingsApiService.findSettings).toHaveBeenCalledTimes(1);
      expect(resultFirstCall.toDto()).toEqual(metadataKeysSettingsDto);
      expect(resultSecondCall.toDto()).toEqual(metadataKeysSettingsDto);
      const storageValue = await findAndUpdateMetadataSettingsService.metadataKeysSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataKeysSettingsDto);
    });
  });
});
