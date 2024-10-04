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

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindAndUpdateMetadataSettingsLocalStorageService", () => {
  let findAndUpdateMetadataTypesSettingsService, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    findAndUpdateMetadataTypesSettingsService = new FindAndUpdateMetadataSettingsLocalStorageService(account, apiClientOptions);
  });

  describe("::findAndUpdateTypesSettings", () => {
    it("retrieves the metadata types settings from the API and store them into the local storage.", async() => {
      expect.assertions(2);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const siteSettingsDto = defaultCeOrganizationSettings();
      jest.spyOn(findAndUpdateMetadataTypesSettingsService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings").mockImplementation(() => metadataTypesSettingsDto);
      jest.spyOn(findAndUpdateMetadataTypesSettingsService.organisationSettingsModel.organizationSettingsService, "find").mockImplementation(() => siteSettingsDto);

      const entity = await findAndUpdateMetadataTypesSettingsService.findAndUpdateTypesSettings();

      expect(entity.toDto()).toEqual(metadataTypesSettingsDto);
      const storageValue = await findAndUpdateMetadataTypesSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataTypesSettingsDto);
    });

    it("retrieves partial metadata types settings from the API and store them marshalled into the local storage.", async() => {
      expect.assertions(2);
      const metadataTypesSettingsDto = {};
      const siteSettingsDto = defaultCeOrganizationSettings();
      jest.spyOn(findAndUpdateMetadataTypesSettingsService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings").mockImplementation(() => metadataTypesSettingsDto);
      jest.spyOn(findAndUpdateMetadataTypesSettingsService.organisationSettingsModel.organizationSettingsService, "find").mockImplementation(() => siteSettingsDto);

      const entity = await findAndUpdateMetadataTypesSettingsService.findAndUpdateTypesSettings();

      // The value of the default are expected to evolve with passbolt transitioning to v5 types.
      const expectedMetadataTypesSettingsDto = defaultMetadataTypesSettingsV4Dto();
      expect(entity.toDto()).toEqual(expectedMetadataTypesSettingsDto);
      const storageValue = await findAndUpdateMetadataTypesSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(expectedMetadataTypesSettingsDto);
    });

    it("with v4, retrieves default v4 metadata types settings without calling the API and store the into the local storage.", async() => {
      expect.assertions(3);
      const siteSettingsDto = defaultCeOrganizationSettings();
      delete siteSettingsDto.passbolt.plugins.metadata;
      jest.spyOn(findAndUpdateMetadataTypesSettingsService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings");
      jest.spyOn(findAndUpdateMetadataTypesSettingsService.organisationSettingsModel.organizationSettingsService, "find").mockImplementation(() => siteSettingsDto);

      const entity = await findAndUpdateMetadataTypesSettingsService.findAndUpdateTypesSettings();

      // The value of the default are expected to evolve with passbolt transitioning to v5 types.
      const expectedMetadataTypesSettingsDto = defaultMetadataTypesSettingsV4Dto();
      expect(findAndUpdateMetadataTypesSettingsService.findMetadataSettingsService.metadataTypesSettingsApiService.findSettings).not.toHaveBeenCalled();
      expect(entity.toDto()).toEqual(expectedMetadataTypesSettingsDto);
      const storageValue = await findAndUpdateMetadataTypesSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(expectedMetadataTypesSettingsDto);
    });

    it("overrides local storage with a second update call.", async() => {
      expect.assertions(2);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const siteSettingsDto = defaultCeOrganizationSettings();
      jest.spyOn(findAndUpdateMetadataTypesSettingsService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings").mockImplementation(() => metadataTypesSettingsDto);
      jest.spyOn(findAndUpdateMetadataTypesSettingsService.organisationSettingsModel.organizationSettingsService, "find").mockImplementation(() => siteSettingsDto);
      await findAndUpdateMetadataTypesSettingsService.metadataTypesSettingsLocalStorage.set(new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto()));

      const entity = await findAndUpdateMetadataTypesSettingsService.findAndUpdateTypesSettings();

      expect(entity.toDto()).toEqual(metadataTypesSettingsDto);
      const storageValue = await findAndUpdateMetadataTypesSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataTypesSettingsDto);
    });

    it("waits any on-going call to the update and returns the result of the local storage.", async() => {
      expect.assertions(4);
      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const siteSettingsDto = defaultCeOrganizationSettings();
      let resolve;
      const promise = new Promise(_resolve => resolve = _resolve);
      jest.spyOn(findAndUpdateMetadataTypesSettingsService.findMetadataSettingsService.metadataTypesSettingsApiService, "findSettings").mockImplementation(() => promise);
      jest.spyOn(findAndUpdateMetadataTypesSettingsService.organisationSettingsModel.organizationSettingsService, "find").mockImplementation(() => siteSettingsDto);
      await findAndUpdateMetadataTypesSettingsService.metadataTypesSettingsLocalStorage.set(new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV4Dto()));

      const promiseFirstCall = findAndUpdateMetadataTypesSettingsService.findAndUpdateTypesSettings();
      const promiseSecondCall = findAndUpdateMetadataTypesSettingsService.findAndUpdateTypesSettings();
      resolve(metadataTypesSettingsDto);
      const resultFirstCall = await promiseFirstCall;
      const resultSecondCall = await promiseSecondCall;

      expect(findAndUpdateMetadataTypesSettingsService.findMetadataSettingsService.metadataTypesSettingsApiService.findSettings).toHaveBeenCalledTimes(1);
      expect(resultFirstCall.toDto()).toEqual(metadataTypesSettingsDto);
      expect(resultSecondCall.toDto()).toEqual(metadataTypesSettingsDto);
      const storageValue = await findAndUpdateMetadataTypesSettingsService.metadataTypesSettingsLocalStorage.get();
      await expect(storageValue).toEqual(metadataTypesSettingsDto);
    });
  });
});
