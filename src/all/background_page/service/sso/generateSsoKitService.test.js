/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.9.0
 */
import "../../../../../test/mocks/mockSsoDataStorage";
import "../../../../../test/mocks/mockCryptoKey";
import SsoDataStorage from "../indexedDB_storage/ssoDataStorage";
import {withAzureSsoSettings} from "../../controller/sso/getCurrentSsoSettingsController.test.data";
import GenerateSsoKitService from "./generateSsoKitService";
import {anonymousOrganizationSettings} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {enableFetchMocks} from "jest-fetch-mock";
import SsoKitClientPartEntity from "../../model/entity/sso/ssoKitClientPartEntity";
import SsoKitTemporaryStorageService from "../session_storage/ssoKitTemporaryStorageService";
import SsoKitServerPartEntity from "../../model/entity/sso/ssoKitServerPartEntity";

beforeEach(async() => {
  enableFetchMocks();
  jest.clearAllMocks();
});

describe("GenerateSsoKitService", () => {
  describe("GenerateSsoKitService::generate", () => {
    const mockOrganisationSettings = (withSsoEnabled = true) => {
      const organizationSettings = anonymousOrganizationSettings();
      organizationSettings.passbolt.plugins.sso = {
        enabled: withSsoEnabled
      };
      fetch.doMockOnceIf(new RegExp('/settings.json'), () => mockApiResponse(organizationSettings, {servertime: Date.now() / 1000}));
    };

    const mockOrganisationSettingsSsoSettings = ssoSettings => {
      fetch.doMockOnceIf(new RegExp('/sso/settings/current.json'), () => mockApiResponse(ssoSettings));
    };

    it("Should generate an SSO kit.", async() => {
      expect.assertions(2);
      mockOrganisationSettings(true);
      mockOrganisationSettingsSsoSettings(withAzureSsoSettings());
      jest.spyOn(SsoKitTemporaryStorageService, "set");

      await GenerateSsoKitService.generate("this is the passphrase to encrypt", "azure-provider");

      expect(SsoDataStorage.save).toHaveBeenCalledWith(expect.any(SsoKitClientPartEntity));
      expect(SsoKitTemporaryStorageService.set).toHaveBeenCalledWith(expect.any(SsoKitServerPartEntity));
    });

    it("Should flush local data when an exception is thrown.", async() => {
      expect.assertions(3);
      mockOrganisationSettings(true);
      mockOrganisationSettingsSsoSettings(withAzureSsoSettings());

      const exepctedError = new Error("something went wrong");
      SsoDataStorage.save.mockImplementation(() => { throw exepctedError; });
      jest.spyOn(SsoKitTemporaryStorageService, "flush");

      await expect(GenerateSsoKitService.generate("test", "test")).rejects.toThrow(exepctedError);

      expect(SsoDataStorage.flush).toHaveBeenCalledTimes(1);
      expect(SsoKitTemporaryStorageService.flush).toHaveBeenCalledTimes(1);
    });
  });
});
