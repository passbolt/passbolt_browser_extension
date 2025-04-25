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
import {enableFetchMocks} from "jest-fetch-mock";
import {v4 as uuid} from "uuid";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import SsoAuthenticationController from "./ssoAuthenticationController";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import DecryptSsoPassphraseService from "../../service/crypto/decryptSsoPassphraseService";
import {clientSsoKit} from "../../model/entity/sso/ssoKitClientPart.test.data";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
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
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import PostLoginService from "../../service/auth/postLoginService";
import BrowserTabService from "../../service/ui/browserTab.service";
import {buildMockedCryptoKey} from "../../utils/assertions.test.data";
import EncryptSsoPassphraseService from "../../service/crypto/encryptSsoPassphraseService";
import KeepSessionAliveService from "../../service/session_storage/keepSessionAliveService";

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
  jest.clearAllMocks();
  enableFetchMocks();
});

afterEach(() => {
  DecryptSsoPassphraseService.decrypt.mockRestore?.();
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
      expect.assertions(5);
      const ssoLocalKit = await clientSsoKit({
        provider: scenario.providerId
      });
      const ssoServerKey = await buildMockedCryptoKey({extractable: true});
      const exportedKey = await crypto.subtle.exportKey("jwk", ssoServerKey);
      const serializedKey = Buffer.from(JSON.stringify(exportedKey)).toString("base64");
      const userPassphrase = "ada@passbolt.com";

      const encryptedPassphrase = await EncryptSsoPassphraseService.encrypt(userPassphrase, ssoLocalKit.nek, ssoServerKey, ssoLocalKit.iv1, ssoLocalKit.iv2);
      ssoLocalKit.secret = encryptedPassphrase;

      SsoDataStorage.setMockedData(ssoLocalKit);

      const ssoLoginToken = uuid();
      const serverSsoKit = {data: serializedKey};
      const account = new AccountEntity(defaultAccountDto());

      mockGetSsoTokenFromThirdParty.mockImplementation(async() => ssoLoginToken);

      fetch.doMockOnceIf(new RegExp(`/sso/${scenario.providerId}/login.json`), async req => {
        const request = JSON.parse(await req.text());
        expect(request).toStrictEqual({user_id: account.userId});
        return await mockApiResponse(scenario.loginUrlResponse);
      });

      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoLocalKit.id}/${account.userId}/${ssoLoginToken}.json`), () => mockApiResponse(serverSsoKit));

      const controller = new SsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.authVerifyLoginChallengeService, "verifyAndValidateLoginChallenge").mockImplementation(async() => {});
      jest.spyOn(PassphraseStorageService, "set");
      jest.spyOn(KeepSessionAliveService, "start").mockImplementation(async() => {});
      jest.spyOn(PostLoginService, "exec").mockImplementation(async() => {});

      await controller.exec(scenario.providerId);

      expect(controller.authVerifyLoginChallengeService.verifyAndValidateLoginChallenge).toHaveBeenCalledWith(account.userKeyFingerprint, account.userPrivateArmoredKey, userPassphrase);
      expect(PassphraseStorageService.set).toHaveBeenCalledWith(userPassphrase, -1);
      expect(PostLoginService.exec).toHaveBeenCalled();
      expect(KeepSessionAliveService.start).toHaveBeenCalledTimes(1);
    });

    it(`Should sign, from quickaccess, the user using a third party: ${scenario.providerId}`, async() => {
      expect.assertions(6);
      const ssoLocalKit = await clientSsoKit({
        provider: scenario.providerId
      });
      const ssoServerKey = await buildMockedCryptoKey({extractable: true});
      const exportedKey = await crypto.subtle.exportKey("jwk", ssoServerKey);
      const serializedKey = Buffer.from(JSON.stringify(exportedKey)).toString("base64");
      const userPassphrase = "ada@passbolt.com";

      const encryptedPassphrase = await EncryptSsoPassphraseService.encrypt(userPassphrase, ssoLocalKit.nek, ssoServerKey, ssoLocalKit.iv1, ssoLocalKit.iv2);
      ssoLocalKit.secret = encryptedPassphrase;

      SsoDataStorage.setMockedData(ssoLocalKit);

      const ssoLoginToken = uuid();
      const serverSsoKit = {data: serializedKey};
      const account = new AccountEntity(defaultAccountDto());

      mockGetSsoTokenFromThirdParty.mockImplementation(async() => ssoLoginToken);
      fetch.doMockOnceIf(new RegExp(`/sso/${scenario.providerId}/login.json`), () => mockApiResponse(scenario.loginUrlResponse));
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoLocalKit.id}/${account.userId}/${ssoLoginToken}.json`), () => mockApiResponse(serverSsoKit));

      const spyOnOpenInDetachedMode = jest.spyOn(QuickAccessService, "openInDetachedMode").mockImplementation(() => {});

      const controller = new SsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.authVerifyLoginChallengeService, "verifyAndValidateLoginChallenge").mockImplementationOnce(jest.fn());
      jest.spyOn(PassphraseStorageService, "set");
      jest.spyOn(BrowserTabService, "getCurrent").mockImplementation(() => ({id: 1}));
      jest.spyOn(KeepSessionAliveService, "start").mockImplementation(async() => {});
      jest.spyOn(PostLoginService, "exec").mockImplementation(() => {});

      await controller.exec(scenario.providerId, true);

      expect(controller.authVerifyLoginChallengeService.verifyAndValidateLoginChallenge).toHaveBeenCalledWith(account.userKeyFingerprint, account.userPrivateArmoredKey, userPassphrase);
      expect(PassphraseStorageService.set).toHaveBeenCalledWith(userPassphrase, -1);
      expect(BrowserTabService.getCurrent).toHaveBeenCalled();
      expect(PostLoginService.exec).toHaveBeenCalled();

      const expectedQuickAccessCallParameters =  [
        {name: "uiMode", value: "detached"},
        {name: "feature", value: "login"},
        {name: "tabId", value: 1}
      ];

      expect(spyOnOpenInDetachedMode).toHaveBeenCalledTimes(1);
      expect(spyOnOpenInDetachedMode).toHaveBeenCalledWith(expectedQuickAccessCallParameters);
    });
  });

  describe(`SsoAuthenticationController::exec should throw a qualified error when the login URL can't be fetch (with provider: '${scenario.providerId}')`, () => {
    it("Should throw an SsoDisabledError.", async() => {
      expect.assertions(2);
      const ssoKit = await clientSsoKit();
      SsoDataStorage.setMockedData(ssoKit);

      const account = new AccountEntity(defaultAccountDto());
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
      const ssoKit = await clientSsoKit({provider: scenario.providerId});
      const configuredProvider = scenario.providerId === "azure" ? "google" : "azure";
      SsoDataStorage.setMockedData(ssoKit);

      const account = new AccountEntity(defaultAccountDto());
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
      const ssoLocalKit = await clientSsoKit();
      SsoDataStorage.setMockedData(ssoLocalKit);

      const expectedUrl = `${User.getInstance().settings.getDomain()}/auth/login?case=sso-login-error`;
      const account = new AccountEntity(defaultAccountDto());

      jest.spyOn(browser.tabs, 'create').mockImplementation(tabInfo => {
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
      const account = new AccountEntity(defaultAccountDto());
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
      const ssoKit = await clientSsoKit();
      const ssoToken = uuid();
      const account = new AccountEntity(defaultAccountDto());
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

    it("Should throw an error when the passphrase can't be decrypted as the SSO kit is outdated.", async() => {
      expect.assertions(2);
      const ssoToken = uuid();
      const ssoLocalKit = await clientSsoKit();
      const serverSsoKit = {data: await generateSsoKitServerData()};
      const account = new AccountEntity(defaultAccountDto());
      SsoDataStorage.setMockedData(ssoLocalKit);

      jest.spyOn(DecryptSsoPassphraseService, "decrypt").mockImplementation(async() => { throw new OutdatedSsoKitError(); });

      mockGetSsoTokenFromThirdParty.mockImplementation(async() => ssoToken);
      fetch.doMockOnceIf(new RegExp(`/sso/${scenario.providerId}/login.json`), () => mockApiResponse(scenario.loginUrlResponse));
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoLocalKit.id}/${account.userId}/${ssoToken}.json`), () => mockApiResponse(serverSsoKit));

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
      const ssoLocalKit = await clientSsoKit();
      const serverSsoKit = {data: await generateSsoKitServerData({})};
      const account = new AccountEntity(defaultAccountDto());
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
      const serverSsoKit = {data: await generateSsoKitServerData({})};
      const account = new AccountEntity(defaultAccountDto());
      const ssoLocalKit = await clientSsoKit();
      SsoDataStorage.setMockedData(ssoLocalKit);

      jest.spyOn(DecryptSsoPassphraseService, "decrypt").mockImplementation(async() => "passphrase");

      mockGetSsoTokenFromThirdParty.mockImplementation(async() => ssoToken);
      fetch.doMockOnceIf(new RegExp(`/sso/${scenario.providerId}/login.json`), () => mockApiResponse(scenario.loginUrlResponse));
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoLocalKit.id}/${account.userId}/${ssoToken}.json`), () => mockApiResponse(serverSsoKit));

      const controller = new SsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.authVerifyLoginChallengeService, "verifyAndValidateLoginChallenge").mockImplementationOnce(() => { throw new InvalidMasterPasswordError(); });


      try {
        await controller.exec(scenario.providerId);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidMasterPasswordError);
        expect(SsoDataStorage.flush).toHaveBeenCalledTimes(1);
      }
    });

    it("Should throw an error if CSRF token is not valid but shouldn't remove the local SSO kit.", async() => {
      expect.assertions(2);
      const account = new AccountEntity(defaultAccountDto());
      SsoDataStorage.setMockedData(await clientSsoKit());

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
