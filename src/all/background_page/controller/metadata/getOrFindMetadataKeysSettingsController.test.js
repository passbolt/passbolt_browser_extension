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
 * @since         5.4.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import GetOrFindMetadataKeysController from "./getOrFindMetadataKeysSettingsController";
import {
  defaultMetadataKeysSettingsDto,
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import MetadataKeysSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";
import {enableFetchMocks} from "jest-fetch-mock";
import {
  defaultCeOrganizationSettings
} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";

beforeEach(() => {
  enableFetchMocks();
});

jest.mock("../../service/passphrase/getPassphraseService");

describe("GetOrFindMetadataKeysSettingsController", () => {
  let controller, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    controller = new GetOrFindMetadataKeysController(null, null, apiClientOptions, account);
    // flush account related storage before each.
    await controller.getOrFindMetadaSettingsService.metadataKeysSettingsLocalStorage.flush();
  });

  describe("::exec", () => {
    it("get or find metadata keys settings for a v5.", async() => {
      expect.assertions(3);

      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      const siteSettingsDto = defaultCeOrganizationSettings();
      jest.spyOn(controller.getOrFindMetadaSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService, "findKeysSettings")
        .mockImplementationOnce(() => new MetadataKeysSettingsEntity(metadataKeysSettingsDto));
      jest.spyOn(controller.getOrFindMetadaSettingsService.findAndUpdateMetadataSettingsLocalStorageService.organisationSettingsModel.organizationSettingsService, "find")
        .mockImplementation(() => siteSettingsDto);

      const metadataKeysSettings = await controller.exec();

      expect(metadataKeysSettings).toBeInstanceOf(MetadataKeysSettingsEntity);
      expect(metadataKeysSettings.toDto()).toEqual(metadataKeysSettingsDto);
      const storageValue = await controller.getOrFindMetadaSettingsService.metadataKeysSettingsLocalStorage.get();
      expect(storageValue).toEqual(metadataKeysSettingsDto);
    });

    it("get or find metadata keys settings with usage of the shared key for a v5.", async() => {
      expect.assertions(3);

      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto({
        allow_usage_of_personal_keys: false,
        zero_knowledge_key_share: true,
      });
      const siteSettingsDto = defaultCeOrganizationSettings();
      jest.spyOn(controller.getOrFindMetadaSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService, "findKeysSettings")
        .mockImplementationOnce(() => new MetadataKeysSettingsEntity(metadataKeysSettingsDto));
      jest.spyOn(controller.getOrFindMetadaSettingsService.findAndUpdateMetadataSettingsLocalStorageService.organisationSettingsModel.organizationSettingsService, "find")
        .mockImplementation(() => siteSettingsDto);

      const metadataKeysSettings = await controller.exec();

      expect(metadataKeysSettings).toBeInstanceOf(MetadataKeysSettingsEntity);
      expect(metadataKeysSettings.toDto()).toEqual(metadataKeysSettingsDto);
      const storageValue = await controller.getOrFindMetadaSettingsService.metadataKeysSettingsLocalStorage.get();
      expect(storageValue).toEqual(metadataKeysSettingsDto);
    });

    it("get or find metadata keys settings for a v4 should have the default.", async() => {
      expect.assertions(3);

      const siteSettingsDto = defaultCeOrganizationSettings();
      // disable the plugin metadata.
      delete siteSettingsDto.passbolt.plugins.metadata;
      jest.spyOn(controller.getOrFindMetadaSettingsService.findAndUpdateMetadataSettingsLocalStorageService.organisationSettingsModel.organizationSettingsService, "find")
        .mockImplementation(() => siteSettingsDto);
      jest.spyOn(controller.getOrFindMetadaSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
        .mockImplementationOnce(() => {});

      const metadataKeysSettings = await controller.exec();

      const expectedMetadataKeysSettingsDto = MetadataKeysSettingsEntity.createFromDefault().toDto();
      expect(metadataKeysSettings).toBeInstanceOf(MetadataKeysSettingsEntity);
      expect(metadataKeysSettings.toDto()).toEqual(expectedMetadataKeysSettingsDto);
      const storageValue = await controller.getOrFindMetadaSettingsService.metadataKeysSettingsLocalStorage.get();
      expect(storageValue).toEqual(expectedMetadataKeysSettingsDto);
    });
  });
});
