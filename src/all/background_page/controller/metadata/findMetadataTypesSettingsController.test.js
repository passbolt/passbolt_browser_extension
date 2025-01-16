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
import FindMetadataTypesSettingsController from "./findMetadataTypesSettingsController";
import {
  defaultMetadataTypesSettingsV4Dto,
  defaultMetadataTypesSettingsV50FreshDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import MetadataTypesSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {enableFetchMocks} from "jest-fetch-mock";
import {
  defaultCeOrganizationSettings
} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";

beforeEach(() => {
  enableFetchMocks();
});

jest.mock("../../service/passphrase/getPassphraseService");

describe("FindMetadataTypesSettingsController", () => {
  let controller, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    controller = new FindMetadataTypesSettingsController(null, null, apiClientOptions, account);
    // flush account related storage before each.
    await controller.findAndUpdateMetadataSettingsLocalStorageService.metadataTypesSettingsLocalStorage.flush();
  });

  describe("::exec", () => {
    it("get or find metadata types settings for a v5.", async() => {
      expect.assertions(3);

      const metadataTypesSettingsDto = defaultMetadataTypesSettingsV50FreshDto();
      const siteSettingsDto = defaultCeOrganizationSettings();
      jest.spyOn(controller.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService, "findTypesSettings")
        .mockImplementationOnce(() => new MetadataTypesSettingsEntity(metadataTypesSettingsDto));
      jest.spyOn(controller.findAndUpdateMetadataSettingsLocalStorageService.organisationSettingsModel.organizationSettingsService, "find")
        .mockImplementation(() => siteSettingsDto);

      const metadataTypesSettings = await controller.exec();

      expect(metadataTypesSettings).toBeInstanceOf(MetadataTypesSettingsEntity);
      expect(metadataTypesSettings.toDto()).toEqual(metadataTypesSettingsDto);
      const storageValue = await controller.findAndUpdateMetadataSettingsLocalStorageService.metadataTypesSettingsLocalStorage.get();
      expect(storageValue).toEqual(metadataTypesSettingsDto);
    });

    it("get or find metadata types settings for a v4.", async() => {
      expect.assertions(3);

      const siteSettingsDto = defaultCeOrganizationSettings();
      // disable the plugin metadata.
      delete siteSettingsDto.passbolt.plugins.metadata;
      jest.spyOn(controller.findAndUpdateMetadataSettingsLocalStorageService.organisationSettingsModel.organizationSettingsService, "find")
        .mockImplementation(() => siteSettingsDto);

      const metadataTypesSettings = await controller.exec();

      const expectedMetadataTypesSettingsDto = defaultMetadataTypesSettingsV4Dto();
      expect(metadataTypesSettings).toBeInstanceOf(MetadataTypesSettingsEntity);
      expect(metadataTypesSettings.toDto()).toEqual(expectedMetadataTypesSettingsDto);
      const storageValue = await controller.findAndUpdateMetadataSettingsLocalStorageService.metadataTypesSettingsLocalStorage.get();
      expect(storageValue).toEqual(expectedMetadataTypesSettingsDto);
    });
  });
});
