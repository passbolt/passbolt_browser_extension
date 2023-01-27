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
 * @since         3.6.0
 */

import "../../../../../test/mocks/mockSsoDataStorage";
import "../../../../../test/mocks/mockCryptoKey";
import {enableFetchMocks} from "jest-fetch-mock";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import SignInSetupController from "./signInSetupController";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import InvalidMasterPasswordError from "../../error/invalidMasterPasswordError";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {anonymousOrganizationSettings} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import GenerateSsoKitService from "../../service/sso/generateSsoKitService";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import {withAzureSsoSettings} from "../sso/getCurrentSsoSettingsController.test.data";

beforeEach(() => {
  enableFetchMocks();
});

describe("SignInSetupController", () => {
  describe("SignInSetupController::exec", () => {
    it.todo("Should sign-in the user.");
    it.todo("Should remember the passphrase.");
    it.todo("Should redirect the user to the application.");

    it("Should throw an exception if the passphrase is not a valid.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      const runtimeMemory = {};
      const controller = new SignInSetupController(null, null, defaultApiClientOptions(), account, runtimeMemory);

      expect.assertions(2);
      const promiseMissingParameter = controller.exec();
      await expect(promiseMissingParameter).rejects.toThrowError("A passphrase is required.");
      const promiseInvalidTypeParameter = controller.exec();
      await expect(promiseInvalidTypeParameter).rejects.toThrowError("A passphrase is required.");
    }, 10000);

    it("Should throw an exception if the provided remember me is not a valid boolean.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      const runtimeMemory = {passphrase: pgpKeys.ada.passphrase};
      const controller = new SignInSetupController(null, null, defaultApiClientOptions(), account, runtimeMemory);

      expect.assertions(1);
      const promiseInvalidTypeParameter = controller.exec(42);
      await expect(promiseInvalidTypeParameter).rejects.toThrowError("The rememberMe should be a boolean.");
    }, 10000);

    it("Should throw an exception if the provided passphrase can't decrypt the current private key.", async() => {
      await MockExtension.withConfiguredAccount();
      const account = new AccountEntity(defaultAccountDto());
      const runtimeMemory = {passphrase: "fake passphrase"};
      const controller = new SignInSetupController(null, null, defaultApiClientOptions(), account, runtimeMemory);

      expect.assertions(1);
      try {
        await controller.exec(true);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidMasterPasswordError);
      }
    }, 10000);

    /**
     * @todo: put back when a easier mock implementation of login procedure will be available
     */
    it.skip("Should ask for SSO kits generation.", async() => {
      const organizationSettings = anonymousOrganizationSettings();
      organizationSettings.passbolt.plugins.sso = {
        enabled: true
      };
      fetch.doMockOnceIf(new RegExp('/settings.json'), () => mockApiResponse(organizationSettings, {servertime: Date.now() / 1000}));
      fetch.doMockOnceIf(new RegExp('/sso/settings/current.json'), () => mockApiResponse(withAzureSsoSettings()));
      fetch.doMockOnceIf(new RegExp('/csrf-token.json'), () => mockApiResponse("csrf-token"));

      SsoDataStorage.setMockedData(null);

      jest.spyOn(GenerateSsoKitService, "generate");

      await MockExtension.withConfiguredAccount();
      const account = new AccountEntity(defaultAccountDto());
      const runtimeMemory = {passphrase: "ada@passbolt.com"};
      const controller = new SignInSetupController(null, null, defaultApiClientOptions(), account, runtimeMemory);

      expect.assertions(2);
      await controller.exec(true);
      expect(GenerateSsoKitService.generate).toHaveBeenCalledWith("ada@passbolt.com", "azure");
      expect(GenerateSsoKitService.generate).toHaveBeenCalledTimes(1);
    }, 10000);
  });
});
