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
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import SignInSetupController from "./signInSetupController";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import InvalidMasterPasswordError from "../../error/invalidMasterPasswordError";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {anonymousOrganizationSettings} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import GenerateSsoKitService from "../../service/sso/generateSsoKitService";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import {withAzureSsoSettings} from "../sso/getCurrentSsoSettingsController.test.data";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import PostLoginService from "../../service/auth/postLoginService";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";

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
      const controller = new SignInSetupController({port: {_port: {name: "test"}}}, null, defaultApiClientOptions());

      expect.assertions(2);
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: account}));
      const promiseMissingParameter = controller.exec();
      await expect(promiseMissingParameter).rejects.toThrowError("A passphrase is required.");
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: account, passphrase: {}}));
      const promiseInvalidTypeParameter = controller.exec();
      await expect(promiseInvalidTypeParameter).rejects.toThrowError("The passphrase should be a string.");
    }, 10000);

    it("Should throw an exception if the provided remember me is not a valid boolean.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: account, passphrase: pgpKeys.ada.passphrase}));
      const controller = new SignInSetupController({port: {_port: {name: "test"}}}, null, defaultApiClientOptions());

      expect.assertions(1);
      const promiseInvalidTypeParameter = controller.exec(42);
      await expect(promiseInvalidTypeParameter).rejects.toThrowError("The rememberMe should be a boolean.");
    }, 10000);

    it("Should throw an exception if the provided passphrase can't decrypt the current private key.", async() => {
      await MockExtension.withConfiguredAccount();
      const account = new AccountEntity(defaultAccountDto());
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: account, passphrase: "fake passphrase"}));

      const controller = new SignInSetupController({port: {_port: {name: "test"}}}, null, defaultApiClientOptions());

      expect.assertions(1);
      try {
        await controller.exec(true);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidMasterPasswordError);
      }
    }, 10000);

    it("Should ask for SSO kits generation.", async() => {
      const organizationSettings = anonymousOrganizationSettings();
      organizationSettings.passbolt.plugins.sso = {
        enabled: true
      };
      fetch.doMockOnceIf(new RegExp('/settings.json'), () => mockApiResponse(organizationSettings, {servertime: Date.now() / 1000}));
      fetch.doMockOnceIf(new RegExp('/sso/settings/current.json'), () => mockApiResponse(withAzureSsoSettings()));
      jest.spyOn(browser.cookies, "get").mockImplementationOnce(() => ({value: "csrf-token"}));
      jest.spyOn(PassphraseStorageService, "set");
      jest.spyOn(PostLoginService, "exec");
      jest.spyOn(browser.tabs, "update");

      SsoDataStorage.setMockedData(null);

      jest.spyOn(GenerateSsoKitService, "generate");

      await MockExtension.withConfiguredAccount();
      const account = new AccountEntity(defaultAccountDto());
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: account, passphrase: "ada@passbolt.com"}));

      const controller = new SignInSetupController({tab: {id: 1}, port: {_port: {name: "test"}}}, null, defaultApiClientOptions());
      jest.spyOn(controller.authVerifyLoginChallengeService, "verifyAndValidateLoginChallenge").mockImplementationOnce(jest.fn());
      jest.spyOn(AccountTemporarySessionStorageService, "remove");

      expect.assertions(7);
      await controller.exec(true);
      expect(controller.authVerifyLoginChallengeService.verifyAndValidateLoginChallenge).toHaveBeenCalledWith(account.userKeyFingerprint, account.userPrivateArmoredKey, "ada@passbolt.com");
      expect(PassphraseStorageService.set).toHaveBeenCalledWith("ada@passbolt.com", -1);
      expect(PostLoginService.exec).toHaveBeenCalled();
      expect(GenerateSsoKitService.generate).toHaveBeenCalledWith("ada@passbolt.com", "azure");
      expect(GenerateSsoKitService.generate).toHaveBeenCalledTimes(1);
      expect(browser.tabs.update).toHaveBeenCalledWith(1, {url: account.domain});
      expect(AccountTemporarySessionStorageService.remove).toHaveBeenCalledTimes(1);
    }, 10000);

    it("Should raise an error if no account has been found.", async() => {
      const controller = new SignInSetupController({port: {_port: {name: "test"}}}, null, defaultApiClientOptions());
      expect.assertions(1);
      try {
        await controller.exec();
      } catch (error) {
        expect(error.message).toEqual("You have already started the process on another tab.");
      }
    });
  });
});
