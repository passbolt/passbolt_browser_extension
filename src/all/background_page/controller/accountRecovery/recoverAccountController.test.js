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
import {enableFetchMocks} from "jest-fetch-mock";
import each from "jest-each";
import User from "../../model/user";
import Keyring from "../../model/keyring";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import RecoverAccountController from "./recoverAccountController";
import AccountAccountRecoveryEntity from "../../model/entity/account/accountAccountRecoveryEntity";
import {defaultAccountAccountRecoveryDto} from "../../model/entity/account/accountAccountRecoveryEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {
  approvedAccountRecoveryRequestDto,
  approvedAccountRecoveryRequestWithoutPrivateKeyDto,
  approvedAccountRecoveryRequestWithoutResponsesDto
} from "passbolt-styleguide/src/shared/models/entity/accountRecovery/accountRecoveryRequestEntity.test.data";
import InvalidMasterPasswordError from "../../error/invalidMasterPasswordError";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import GenerateSsoKitService from "../../service/sso/generateSsoKitService";
import {anonymousOrganizationSettings} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";

beforeEach(() => {
  enableFetchMocks();
  jest.clearAllMocks();
});

describe("RecoverAccountController", () => {
  describe("RecoverAccountController::exec", () => {
    const accountRecovery = new AccountAccountRecoveryEntity(defaultAccountAccountRecoveryDto());
    const apiClientOptions = defaultApiClientOptions();
    const accountRecoveryRequestDto = approvedAccountRecoveryRequestDto({id: accountRecovery.accountRecoveryRequestId});
    const passphrase = pgpKeys.account_recovery_request.passphrase;

    const mockOrganisationSettings = isSsoEnabled => {
      const organizationSettings = anonymousOrganizationSettings();
      if (isSsoEnabled) {
        organizationSettings.passbolt.plugins.sso = {enabled: true};
      }
      fetch.doMockOnce(() => mockApiResponse(organizationSettings, {servertime: Date.now() / 1000}));
    };

    it("Should perform the account recovery.", async() => {
      // Mock API fetch account recovery request get response.
      fetch.doMockOnce(() => mockApiResponse(accountRecoveryRequestDto));
      // Mock API complete request.
      fetch.doMockOnce(() => mockApiResponse());
      // Mock API organisation settings
      mockOrganisationSettings();
      // Mock temporary account
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: accountRecovery}));
      jest.spyOn(AccountTemporarySessionStorageService, "set").mockImplementationOnce(() => jest.fn());

      const controller = new RecoverAccountController({port: {_port: {name: "test"}}}, null, apiClientOptions);
      await controller.exec(passphrase);

      expect.assertions(9);

      // The user account should have been configured (legacy).
      const user = User.getInstance().get();
      expect(user.id).toStrictEqual(accountRecovery.userId);
      expect(user.username).toStrictEqual(accountRecovery.username);
      expect(user.firstname).toStrictEqual(accountRecovery.firstName);
      expect(user.lastname).toStrictEqual(accountRecovery.lastName);
      expect(user.settings.domain).toStrictEqual(accountRecovery.domain);
      expect(user.settings.securityToken).toStrictEqual(accountRecovery.securityToken.toDto());

      // The keyring should contain the user recovered key.
      const keyring = new Keyring();
      const keyringPrivateKey = await OpenpgpAssertion.readKeyOrFail(keyring.findPrivate().armoredKey);
      const userPublicKey = await OpenpgpAssertion.readKeyOrFail(keyring.findPublic(accountRecovery.userId).armoredKey);
      const keyringPrivateKeyFingerprint = keyringPrivateKey.getFingerprint().toUpperCase();
      const userPublicKeyFingerprint = userPublicKey.getFingerprint().toUpperCase();

      expect(keyringPrivateKeyFingerprint).toStrictEqual(pgpKeys.ada.fingerprint);
      expect(userPublicKeyFingerprint).toStrictEqual(pgpKeys.ada.fingerprint);
      expect(userPublicKeyFingerprint).toStrictEqual(keyringPrivateKeyFingerprint);
    });

    each([
      {expectedError: "A passphrase is required.", passphrase: undefined},
      {expectedError: "The passphrase should be a string.", passphrase: 42}
    ]).describe("Should assert the signed-in user passphrase parameter.", scenario => {
      it(`Should validate the scenario: ${scenario.expectedError}`, async() => {
        // Mock temporary account
        jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: accountRecovery}));
        const controller = new RecoverAccountController({port: {_port: {name: "test"}}}, null, apiClientOptions);
        const promise = controller.exec(scenario.passphrase);
        expect.assertions(1);
        await expect(promise).rejects.toThrowError(scenario.expectedError);
      });
    });

    each([
      {expectedError: "The account recovery request id should match the request id associated to the account being recovered.", findRequestMock: approvedAccountRecoveryRequestDto()},
      {expectedError: "The account recovery request should have a private key.", findRequestMock: approvedAccountRecoveryRequestWithoutPrivateKeyDto({id: accountRecovery.accountRecoveryRequestId})},
      {expectedError: "The account recovery request should have a collection of responses.", findRequestMock: approvedAccountRecoveryRequestWithoutResponsesDto({id: accountRecovery.accountRecoveryRequestId})},
      {expectedError: "The account recovery request responses should contain exactly one response.", findRequestMock: approvedAccountRecoveryRequestDto({id: accountRecovery.accountRecoveryRequestId, account_recovery_responses: []})},
    ]).describe("Should assert the signed-in user passphrase parameter.", scenario => {
      it(`Should validate the scenario: ${scenario.expectedError}`, async() => {
        // Mock API fetch account recovery request get response.
        fetch.doMockOnce(() => mockApiResponse(scenario.findRequestMock));
        // Mock temporary account
        jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: accountRecovery}));

        const controller = new RecoverAccountController({port: {_port: {name: "test"}}}, null, apiClientOptions);
        const promise = controller.exec(passphrase);
        expect.assertions(1);
        await expect(promise).rejects.toThrowError(scenario.expectedError);
      });
    });

    it("Should assert the account recovery user private key can be decrypted.", async() => {
      // Mock API fetch account recovery request get response.
      fetch.doMockOnce(() => mockApiResponse(accountRecoveryRequestDto));
      // Mock temporary account
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: accountRecovery}));

      const controller = new RecoverAccountController({port: {_port: {name: "test"}}}, null, apiClientOptions);
      const promise = controller.exec("wrong passphrase");
      expect.assertions(1);
      await expect(promise).rejects.toThrowError(InvalidMasterPasswordError);
    });

    it("Should not add the account to the local storage if the complete API request fails.", async() => {
      const accountRecovery = new AccountAccountRecoveryEntity(defaultAccountAccountRecoveryDto());
      const accountRecoveryRequestDto = approvedAccountRecoveryRequestDto({id: accountRecovery.accountRecoveryRequestId});
      // Mock temporary account
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: accountRecovery}));

      // Mock API fetch account recovery request get response.
      fetch.doMockOnce(() => mockApiResponse(accountRecoveryRequestDto));
      // Mock API complete request.
      fetch.doMockOnce(() => Promise.reject(new Error("Unable to reach the server, an unexpected error occurred")));

      const controller = new RecoverAccountController({port: {_port: {name: "test"}}}, null, apiClientOptions);
      const promise = controller.exec(passphrase);

      expect.assertions(2);
      await expect(promise).rejects.toThrow("Unable to reach the server, an unexpected error occurred");
      expect(() => User.getInstance().get()).toThrow("The user is not set");
    });

    it("Should refresh the SSO kit if SSO is enabled.", async() => {
      const apiClientOptions = defaultApiClientOptions();
      const passphrase = pgpKeys.account_recovery_request.passphrase;
      const accountRecovery = new AccountAccountRecoveryEntity(defaultAccountAccountRecoveryDto());
      const accountRecoveryRequestDto = approvedAccountRecoveryRequestDto({id: accountRecovery.accountRecoveryRequestId});

      expect.assertions(3);
      const expetedProvider = "azure";
      const organizationSettings = anonymousOrganizationSettings();
      organizationSettings.passbolt.plugins.sso = {enabled: true};

      // Mock API fetch account recovery request get response.
      fetch.doMockOnce(() => mockApiResponse(accountRecoveryRequestDto));
      // Mock API complete request.
      fetch.doMockOnce(() => mockApiResponse());
      // Mock API organisation settings
      mockOrganisationSettings(true);
      // Mock configured SSO settings
      fetch.doMockOnce(() => mockApiResponse({provider: expetedProvider}));
      // Mock temporary account
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: accountRecovery}));
      jest.spyOn(AccountTemporarySessionStorageService, "set").mockImplementationOnce(() => jest.fn());

      jest.spyOn(GenerateSsoKitService, "generate");

      const controller = new RecoverAccountController({port: {_port: {name: "test"}}}, null, apiClientOptions);
      await controller.exec(passphrase);

      expect(SsoDataStorage.flush).toHaveBeenCalled();
      expect(GenerateSsoKitService.generate).toHaveBeenCalledTimes(1);
      expect(GenerateSsoKitService.generate).toHaveBeenCalledWith(passphrase, expetedProvider);
    });

    it("Should only flush SSO kit if SSO is disabled.", async() => {
      const apiClientOptions = defaultApiClientOptions();
      const passphrase = pgpKeys.account_recovery_request.passphrase;
      const accountRecovery = new AccountAccountRecoveryEntity(defaultAccountAccountRecoveryDto());
      const accountRecoveryRequestDto = approvedAccountRecoveryRequestDto({id: accountRecovery.accountRecoveryRequestId});
      // Mock API fetch account recovery request get response.
      fetch.doMockOnce(() => mockApiResponse(accountRecoveryRequestDto));
      // Mock API complete request.
      fetch.doMockOnce(() => mockApiResponse());
      // Mock API organisation settings
      mockOrganisationSettings();
      // Mock temporary account
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: accountRecovery}));
      jest.spyOn(AccountTemporarySessionStorageService, "set").mockImplementationOnce(() => jest.fn());

      jest.spyOn(GenerateSsoKitService, "generate");

      const controller = new RecoverAccountController({port: {_port: {name: "test"}}}, null, apiClientOptions);
      await controller.exec(passphrase);

      expect.assertions(2);

      expect(SsoDataStorage.flush).toHaveBeenCalled();
      expect(GenerateSsoKitService.generate).not.toHaveBeenCalled();
    });

    it("Should raise an error if no account has been found.", async() => {
      const controller = new RecoverAccountController({port: {_port: {name: "test"}}}, null, apiClientOptions);
      expect.assertions(1);
      try {
        await controller.exec();
      } catch (error) {
        expect(error.message).toEqual("You have already started the process on another tab.");
      }
    });
  });
});
