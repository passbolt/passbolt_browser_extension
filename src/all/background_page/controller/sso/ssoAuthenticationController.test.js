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
import each from "jest-each";
import "../../../../../test/mocks/mockSsoDataStorage";
import '../../../../../test/mocks/mockCryptoKey';
import {enableFetchMocks} from "jest-fetch-mock";
import {v4 as uuid} from "uuid";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import SsoAuthenticationController from "./ssoAuthenticationController";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import DecryptSsoPassphraseService from "../../service/crypto/decryptSsoPassphraseService";
import {clientSsoKit} from "../../model/entity/sso/ssoKitClientPart.test.data";
import PassboltApiFetchError from "../../error/passboltApiFetchError";
import OutdatedSsoKitError from "../../error/outdatedSsoKitError";
import InvalidMasterPasswordError from "../../error/invalidMasterPasswordError";
import {generateSsoKitServerData} from "../../model/entity/sso/ssoKitServerPart.test.data";
import SsoDisabledError from "../../error/ssoDisabledError";
import SsoProviderMismatchError from "../../error/ssoProviderMismatchError";
import SsoSettingsChangedError from "../../error/ssoSettingsChangedError";
import MockExtension from "../../../../../test/mocks/mockExtension";
import User from "../../model/user";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {QuickAccessService} from "../../service/ui/quickAccess.service";

const mockLogin = jest.fn();
jest.mock("../../model/auth/authModel", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    login: mockLogin
  }))
}));

const mockedTabCreate = jest.fn();
jest.mock("../../sdk/polyfill/browserPolyfill", () => ({
  __esModule: true,
  default: {
    tabs: {
      create: data => { mockedTabCreate(data); }
    }
  }
}));

const mockGetSsoTokenFromThirdParty = jest.fn();
const mockCloseHandler = jest.fn();
jest.mock("../../service/sso/popupHandlerService", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getSsoTokenFromThirdParty: mockGetSsoTokenFromThirdParty,
    closeHandler: mockCloseHandler
  }))
}));

beforeEach(() => {
  crypto.subtle.importKey.mockReset();
  jest.clearAllMocks();
  enableFetchMocks();
});

const scenarios = [
  {
    providerId: "azure",
    loginUrlResponse: {
      url: "https://login.microsoftonline.com"
    }
  },
  {
    providerId: "google",
    loginUrlResponse: {
      url: "https://accounts.google.com/o/oauth2/v2/auth"
    }
  }
];

each(scenarios).describe("SsoAuthenticationController", scenario => {
  describe(`SsoAuthenticationController::exec (with provider: '${scenario.providerId}')`, () => {
    it(`Should sign the user using a third party: ${scenario.providerId}`, async() => {
      expect.assertions(13);
      const ssoLocalKit = clientSsoKit();
      SsoDataStorage.setMockedData(ssoLocalKit);
      const ssoLoginToken = uuid();
      const serverSsoKit = {data: generateSsoKitServerData()};
      const deserializedKeyData = JSON.parse(Buffer.from(serverSsoKit.data, 'base64').toString());
      const account = {userId: uuid()};
      const severImportedKey = {algorithm: {name: "AES-GCM"}};
      const userPassphrase = "this is the user passphrase";

      mockGetSsoTokenFromThirdParty.mockImplementation(async() => ssoLoginToken);
      mockLogin.mockImplementation(async(passphrase, rememberMe) => {
        expect(passphrase).toBe(userPassphrase);
        expect(rememberMe).toBe(true);
      });

      crypto.subtle.importKey.mockImplementation(async(keyFormat, keyInfo, algorithmName, isExtractable, capabilities) => {
        expect(keyFormat).toBe("jwk");
        expect(keyInfo).toStrictEqual(deserializedKeyData);
        expect(algorithmName).toBe('AES-GCM');
        expect(isExtractable).toBe(true);
        expect(capabilities).toStrictEqual(["encrypt", "decrypt"]);
        return severImportedKey;
      });

      jest.spyOn(DecryptSsoPassphraseService, "decrypt").mockImplementation(async(secret, nek, ek, iv1, iv2) => {
        expect(secret).toStrictEqual(ssoLocalKit.secret);
        expect(nek).toStrictEqual(ssoLocalKit.nek);
        expect(ek).toStrictEqual(severImportedKey);
        expect(iv1).toStrictEqual(ssoLocalKit.iv1);
        expect(iv2).toStrictEqual(ssoLocalKit.iv2);
        return userPassphrase;
      });

      fetch.doMockOnceIf(new RegExp(`/sso/${scenario.providerId}/login.json`), async req => {
        const request = JSON.parse(await req.text());
        expect(request).toStrictEqual({user_id: account.userId});
        return mockApiResponse(scenario.loginUrlResponse);
      });

      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoLocalKit.id}/${account.userId}/${ssoLoginToken}.json`), async() => mockApiResponse(serverSsoKit));

      const controller = new SsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      return controller.exec(scenario.providerId);
    });

    it(`Should sign the user using a third party: ${scenario.providerId}`, async() => {
      expect.assertions(2);
      const ssoLocalKit = clientSsoKit();
      SsoDataStorage.setMockedData(ssoLocalKit);
      const ssoLoginToken = uuid();
      const serverSsoKit = {data: generateSsoKitServerData()};
      const account = {userId: uuid()};
      const severImportedKey = {algorithm: {name: "AES-GCM"}};
      const userPassphrase = "this is the user passphrase";

      mockGetSsoTokenFromThirdParty.mockImplementation(async() => ssoLoginToken);
      mockLogin.mockImplementation(async() => {});
      crypto.subtle.importKey.mockImplementation(async() => severImportedKey);
      jest.spyOn(DecryptSsoPassphraseService, "decrypt").mockImplementation(async() => userPassphrase);
      fetch.doMockOnceIf(new RegExp(`/sso/${scenario.providerId}/login.json`), async() => mockApiResponse(scenario.loginUrlResponse));
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoLocalKit.id}/${account.userId}/${ssoLoginToken}.json`), async() => mockApiResponse(serverSsoKit));

      const spyOnOpenInDetachedMode = jest.spyOn(QuickAccessService, "openInDetachedMode").mockImplementation(() => {});

      const controller = new SsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      await controller.exec(scenario.providerId, true);

      const expectedQuickAccessCallParameters =  [
        {name: "uiMode", value: "detached"},
        {name: "feature", value: "login"}
      ];

      expect(spyOnOpenInDetachedMode).toHaveBeenCalledTimes(1);
      expect(spyOnOpenInDetachedMode).toHaveBeenCalledWith(expectedQuickAccessCallParameters);
    });
  });

  describe(`SsoAuthenticationController::exec should throw a qualified error when the login URL can't be fetch (with provider: '${scenario.providerId}')`, () => {
    it("Should throw an SsoDisabledError.", async() => {
      expect.assertions(2);
      const ssoKit = clientSsoKit();
      SsoDataStorage.setMockedData(ssoKit);

      const account = {userId: uuid()};
      fetch.doMockOnceIf(new RegExp(`/sso/${scenario.providerId}/login.json`), async() => mockApiResponseError(400));
      fetch.doMockOnceIf(new RegExp(`/sso/settings/current.json`), async() => mockApiResponse({provider: null}));

      const controller = new SsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec(scenario.providerId);
      } catch (e) {
        expect(e).toBeInstanceOf(SsoDisabledError);
        expect(SsoDataStorage.flush).not.toHaveBeenCalled();
      }
    });

    it("Should throw an SsoProviderMismatchError.", async() => {
      expect.assertions(2);
      const ssoKit = clientSsoKit({provider: scenario.providerId});
      const configuredProvider = scenario.providerId === "azure" ? "google" : "azure";
      SsoDataStorage.setMockedData(ssoKit);

      const account = {userId: uuid()};
      fetch.doMockOnceIf(new RegExp(`/sso/${scenario.providerId}/login.json`), async() => mockApiResponseError(400));
      fetch.doMockOnceIf(new RegExp(`/sso/settings/current.json`), async() => mockApiResponse({provider: configuredProvider}));

      const controller = new SsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec(scenario.providerId);
      } catch (e) {
        expect(e).toBeInstanceOf(SsoProviderMismatchError);
        expect(SsoDataStorage.flush).not.toHaveBeenCalled();
      }
    });

    it("Should throw an SsoSettingsChangedError.", async() => {
      expect.assertions(3);
      await MockExtension.withConfiguredAccount();
      const ssoLocalKit = clientSsoKit();
      SsoDataStorage.setMockedData(ssoLocalKit);

      const expectedUrl = `${User.getInstance().settings.getDomain()}/auth/login?case=sso-login-error`;
      const account = new AccountEntity(defaultAccountDto());

      mockedTabCreate.mockImplementation(tabInfo => {
        expect(tabInfo.url).toBe(expectedUrl);
        expect(tabInfo.active).toBe(true);
      });

      fetch.doMockOnceIf(new RegExp(`/sso/${scenario.providerId}/login.json`), async() => mockApiResponseError(400));

      const controller = new SsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec(scenario.providerId, true);
      } catch (e) {
        expect(e).toBeInstanceOf(SsoSettingsChangedError);
      }
    });
  });

  describe(`SsoAuthenticationController::exec should throw an error when something wrong happens (with provider: '${scenario.providerId}')`, () => {
    it("Should throw an error when client sso kit can't be find.", async() => {
      expect.assertions(2);
      const account = {userId: uuid()};
      SsoDataStorage.setMockedData(null);
      const controller = new SsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec(scenario.providerId);
      } catch (e) {
        expect(e).toStrictEqual(new Error('The Single Sign-On cannot proceed as there is no SSO kit registered on this browser profile.'));
        expect(SsoDataStorage.flush).not.toHaveBeenCalled();
      }
    });

    it("Should throw an error when server sso kit can't be find.", async() => {
      expect.assertions(2);
      const ssoKit = clientSsoKit();
      const ssoToken = uuid();
      const account = {userId: uuid()};
      SsoDataStorage.setMockedData(ssoKit);

      mockGetSsoTokenFromThirdParty.mockImplementation(async() => ssoToken);
      fetch.doMockOnceIf(new RegExp(`/sso/${scenario.providerId}/login.json`), async() => mockApiResponse(scenario.loginUrlResponse));
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoKit.id}/${account.userId}/${ssoToken}.json`), async() => mockApiResponseError(404));

      const controller = new SsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec(scenario.providerId);
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
        expect(SsoDataStorage.flush).toHaveBeenCalledTimes(1);
      }
    });

    it("Should throw an error when the passphrase can't be decrypted.", async() => {
      expect.assertions(2);
      const ssoToken = uuid();
      const ssoLocalKit = clientSsoKit();
      const serverSsoKit = {data: generateSsoKitServerData({})};
      const account = {userId: uuid()};
      SsoDataStorage.setMockedData(ssoLocalKit);

      jest.spyOn(DecryptSsoPassphraseService, "decrypt").mockImplementation(async() => { throw new OutdatedSsoKitError(); });

      mockGetSsoTokenFromThirdParty.mockImplementation(async() => ssoToken);
      fetch.doMockOnceIf(new RegExp(`/sso/${scenario.providerId}/login.json`), async() => mockApiResponse(scenario.loginUrlResponse));
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoLocalKit.id}/${account.userId}/${ssoToken}.json`), async() => mockApiResponse(serverSsoKit));

      const controller = new SsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec(scenario.providerId);
      } catch (e) {
        expect(e).toBeInstanceOf(OutdatedSsoKitError);
        expect(SsoDataStorage.flush).toHaveBeenCalledTimes(1);
      }
    });

    it("Should throw an error when the passphrase can't be decrypted.", async() => {
      expect.assertions(2);
      const ssoToken = uuid();
      const ssoLocalKit = clientSsoKit();
      const serverSsoKit = {data: generateSsoKitServerData({})};
      const account = {userId: uuid()};
      SsoDataStorage.setMockedData(ssoLocalKit);

      jest.spyOn(DecryptSsoPassphraseService, "decrypt").mockImplementation(async() => { throw new Error(); });

      mockGetSsoTokenFromThirdParty.mockImplementation(async() => ssoToken);
      fetch.doMockOnceIf(new RegExp(`/sso/${scenario.providerId}/login.json`), async() => mockApiResponse(scenario.loginUrlResponse));
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoLocalKit.id}/${account.userId}/${ssoToken}.json`), async() => mockApiResponse(serverSsoKit));

      const controller = new SsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec(scenario.providerId);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(SsoDataStorage.flush).not.toHaveBeenCalled();
      }
    });

    it("Should throw an error when the passphrase doesn't match the user's private key.", async() => {
      expect.assertions(2);
      const ssoToken = uuid();
      const serverSsoKit = {data: generateSsoKitServerData({})};
      const account = {userId: uuid()};
      const ssoLocalKit = clientSsoKit();
      SsoDataStorage.setMockedData(ssoLocalKit);

      jest.spyOn(DecryptSsoPassphraseService, "decrypt").mockImplementation(async() => "passphrase");

      mockGetSsoTokenFromThirdParty.mockImplementation(async() => ssoToken);
      mockLogin.mockImplementation(async() => { throw new InvalidMasterPasswordError(); });
      fetch.doMockOnceIf(new RegExp(`/sso/${scenario.providerId}/login.json`), async() => mockApiResponse(scenario.loginUrlResponse));
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoLocalKit.id}/${account.userId}/${ssoToken}.json`), async() => mockApiResponse(serverSsoKit));

      const controller = new SsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec(scenario.providerId);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidMasterPasswordError);
        expect(SsoDataStorage.flush).toHaveBeenCalledTimes(1);
      }
    });

    it("Should throw an error if CSRF token is not valid but shouldn't remove the local SSO kit.", async() => {
      expect.assertions(2);
      const account = {userId: uuid()};
      SsoDataStorage.setMockedData(clientSsoKit());

      jest.spyOn(DecryptSsoPassphraseService, "decrypt").mockImplementation(async() => "passphrase");
      fetch.doMockOnceIf(new RegExp(`/sso/${scenario.providerId}/login.json`), async() => mockApiResponseError(403, "Wrong CSRF token"));

      const controller = new SsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec(scenario.providerId);
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
        expect(SsoDataStorage.flush).not.toHaveBeenCalled();
      }
    });
  });
});
