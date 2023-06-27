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
import MockExtension from "../../../../../test/mocks/mockExtension";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import GenerateSsoKitService from "../../service/sso/generateSsoKitService";
import AuthLoginController from "./authLoginController";
import {enableFetchMocks} from "jest-fetch-mock";
import {anonymousOrganizationSettings} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {defaultEmptySettings, withAzureSsoSettings} from "../sso/getCurrentSsoSettingsController.test.data";
import {clientSsoKit} from "../../model/entity/sso/ssoKitClientPart.test.data";

const mockLogin = jest.fn();
jest.mock("../../model/auth/authModel", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    login: mockLogin
  }))
}));

beforeEach(async() => {
  enableFetchMocks();
  jest.clearAllMocks();
  await MockExtension.withConfiguredAccount();
});

describe("AuthLoginController", () => {
  describe("AuthLoginController::exec", () => {
    const passphrase = "ada@passbolt.com";
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

    it("Should sign-in the user.", async() => {
      mockOrganisationSettings(false);

      const account = new AccountEntity(defaultAccountDto());
      const controller = new AuthLoginController(null, null, defaultApiClientOptions(), account);
      const scenarios = [{
        passphrase: passphrase,
        rememberMe: true
      },
      {
        passphrase: passphrase,
        rememberMe: false
      }];
      expect.assertions(scenarios.length);

      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];
        await controller.exec(scenario.passphrase, scenario.rememberMe);
        expect(mockLogin).toHaveBeenCalledWith(scenario.passphrase, scenario.rememberMe);
      }
    });

    it("Should throw an exception if the passphrase is not a valid.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      const controller = new AuthLoginController(null, null, defaultApiClientOptions(), account);

      expect.assertions(2);
      const promiseMissingParameter = controller.exec();
      await expect(promiseMissingParameter).rejects.toThrowError("A passphrase is required.");
      const promiseInvalidTypeParameter = controller.exec(2);
      await expect(promiseInvalidTypeParameter).rejects.toThrowError("The passphrase should be a string.");
    }, 10000);

    it("Should throw an exception if the provided remember me is not a valid boolean.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      const controller = new AuthLoginController(null, null, defaultApiClientOptions(), account);

      expect.assertions(1);
      const promiseInvalidTypeParameter = controller.exec("passphrase", 42);
      await expect(promiseInvalidTypeParameter).rejects.toThrowError("The rememberMe should be a boolean.");
    }, 10000);

    it("Should sign-in the user and not generate an SSO kit if SSO organization settings is disabled.", async() => {
      expect.assertions(1);
      SsoDataStorage.setMockedData(null);
      jest.spyOn(GenerateSsoKitService, "generate");
      mockOrganisationSettings(false);

      const account = new AccountEntity(defaultAccountDto());
      const controller = new AuthLoginController(null, null, defaultApiClientOptions(), account);
      await controller.exec(passphrase, true);
      expect(GenerateSsoKitService.generate).not.toHaveBeenCalled();
    });

    it("Should sign-in the user and not generate an SSO kit if SSO organization settings is enabled and a kit already exists.", async() => {
      expect.assertions(1);
      SsoDataStorage.setMockedData(clientSsoKit());
      jest.spyOn(GenerateSsoKitService, "generate");
      mockOrganisationSettings(true);
      mockOrganisationSettingsSsoSettings(withAzureSsoSettings());

      const account = new AccountEntity(defaultAccountDto());
      const controller = new AuthLoginController(null, null, defaultApiClientOptions(), account);
      await controller.exec(passphrase, true);
      expect(GenerateSsoKitService.generate).not.toHaveBeenCalled();
    });

    it("Should sign-in the user and generate an SSO kit if SSO organization settings is enabled and a kit is not available.", async() => {
      expect.assertions(1);
      SsoDataStorage.setMockedData(null);
      const ssoSettingsDto = withAzureSsoSettings();
      jest.spyOn(GenerateSsoKitService, "generate");
      mockOrganisationSettings(true);
      mockOrganisationSettingsSsoSettings(ssoSettingsDto);

      const account = new AccountEntity(defaultAccountDto());
      const controller = new AuthLoginController(null, null, defaultApiClientOptions(), account);
      await controller.exec(passphrase, true);
      expect(GenerateSsoKitService.generate).toHaveBeenCalledWith(passphrase, ssoSettingsDto.provider);
    });

    it("Should sign-in the user and flush SSO kit data if a kit is available locally and the SSO is not configured for the organisation.", async() => {
      expect.assertions(1);
      SsoDataStorage.setMockedData(clientSsoKit());
      mockOrganisationSettings(true);
      mockOrganisationSettingsSsoSettings(defaultEmptySettings());

      const account = new AccountEntity(defaultAccountDto());
      const controller = new AuthLoginController(null, null, defaultApiClientOptions(), account);
      await controller.exec(passphrase, true);
      expect(SsoDataStorage.flush).toHaveBeenCalledTimes(1);
    });

    it("Should sign-in the user and flush SSO kit data if a kit is available locally and the organization settings is disabled.", async() => {
      expect.assertions(1);
      SsoDataStorage.setMockedData(clientSsoKit());
      mockOrganisationSettings(false);

      const account = new AccountEntity(defaultAccountDto());
      const controller = new AuthLoginController(null, null, defaultApiClientOptions(), account);
      await controller.exec(passphrase, true);
      expect(SsoDataStorage.flush).toHaveBeenCalledTimes(1);
    });
  });
});
