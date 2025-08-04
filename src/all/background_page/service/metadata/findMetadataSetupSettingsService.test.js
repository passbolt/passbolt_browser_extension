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
import {enableFetchMocks} from "jest-fetch-mock";
import FindMetadataSetupSettingsService from "./findMetadataSetupSettingsService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import MetadataSetupSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataSetupSettingsEntity";
import {enableMetadataSetupSettingsDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataSetupSettingsEntity.test.data";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";

beforeEach(() => {
  jest.clearAllMocks();
  enableFetchMocks();
});

describe("FindMetadataSetupSettingsService", () => {
  describe("::findSetupSettings", () => {
    it("retrieve the metadata setup settings.", async() => {
      expect.assertions(2);

      const expectedSettings = enableMetadataSetupSettingsDto();
      const apiClientOptions = defaultApiClientOptions();
      const service = new FindMetadataSetupSettingsService(apiClientOptions);

      fetch.doMockOnceIf(/\/metadata\/setup\/settings\.json/, () => mockApiResponse(expectedSettings));

      const metadataSetupSettingsEntity = await service.findSetupSettings();

      expect(metadataSetupSettingsEntity).toBeInstanceOf(MetadataSetupSettingsEntity);
      expect(metadataSetupSettingsEntity.enableEncryptedMetadataOnInstall).toStrictEqual(true);
    });

    it("should consider default disabled settings if the API sends back a 404", async() => {
      expect.assertions(2);

      const apiClientOptions = defaultApiClientOptions();
      const service = new FindMetadataSetupSettingsService(apiClientOptions);

      fetch.doMockOnceIf(/\/metadata\/setup\/settings.json/, () => mockApiResponseError(404, "Endpoint does not exists"));

      const metadataSetupSettingsEntity = await service.findSetupSettings();

      expect(metadataSetupSettingsEntity).toBeInstanceOf(MetadataSetupSettingsEntity);
      expect(metadataSetupSettingsEntity.enableEncryptedMetadataOnInstall).toStrictEqual(false);
    });

    it("should not intercept the error from the API if something goes wrong and it is not a 404", async() => {
      expect.assertions(1);

      const apiClientOptions = defaultApiClientOptions();
      const service = new FindMetadataSetupSettingsService(apiClientOptions);

      fetch.doMockOnce(/\/metadata\/setup\/settings.json/, () => mockApiResponseError(500, "Something went wrong!"));

      await expect(() => service.findSetupSettings()).rejects.toThrowError();
    });
  });
});
