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
import '../../../../../test/mocks/mockCryptoKey';
import {enableFetchMocks} from "jest-fetch-mock";
import {v4 as uuid} from "uuid";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import AzureSsoAuthenticationController from "./azureSsoAuthenticationController";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import DecryptSsoPassphraseService from "../../service/crypto/decryptSsoPassphraseService";
import {clientSsoKit} from "../../model/entity/sso/ssoKitClientPart.test.data";
import PassboltApiFetchError from "../../error/passboltApiFetchError";
import OutdatedSsoKitError from "../../error/outdatedSsoKitError";
import InvalidMasterPasswordError from "../../error/invalidMasterPasswordError";

const mockLogin = jest.fn();
jest.mock("../../model/auth/authModel", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    login: mockLogin
  }))
}));

const mockGetCodeFromThirdParty = jest.fn();
const mockCloseHandler = jest.fn();
jest.mock("../../service/sso/azurePopupHandlerService", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getCodeFromThirdParty: mockGetCodeFromThirdParty,
    closeHandler: mockCloseHandler
  }))
}));

beforeEach(() => {
  crypto.subtle.importKey.mockReset();
  jest.clearAllMocks();
  enableFetchMocks();
});

describe("AzureSsoAuthenticationController", () => {
  describe("AzureSsoAuthenticationController::exec", () => {
    it("Should sign the user using a third party.", async() => {
      expect.assertions(13);
      const ssoLocalKit = clientSsoKit();
      SsoDataStorage.setMockedData(ssoLocalKit);
      const ssoLoginToken = uuid();
      const serverSsoKitKey = {key: "fakeKey"};
      const serverSsoKit = {
        data: Buffer.from(JSON.stringify(serverSsoKitKey)).toString('base64')
      };
      const account = {userId: uuid()};
      const azureUrlResponse = {
        url: "https://login.azure.com/passbolt"
      };
      const severImportedKey = {algorithm: {name: "AES-GCM"}};
      const userPassphrase = "this is the user passphrase";

      mockGetCodeFromThirdParty.mockImplementation(async() => ssoLoginToken);
      mockLogin.mockImplementation(async(passphrase, rememberMe) => {
        expect(passphrase).toBe(userPassphrase);
        expect(rememberMe).toBe(true);
      });

      crypto.subtle.importKey.mockImplementation(async(keyFormat, keyInfo, algorithmName, isExtractable, capabilities) => {
        expect(keyFormat).toBe("jwk");
        expect(keyInfo).toStrictEqual(serverSsoKitKey);
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

      fetch.doMockOnceIf(new RegExp(`/sso/azure/login.json`), async req => {
        const request = JSON.parse(await req.text());
        expect(request).toStrictEqual({user_id: account.userId});
        return mockApiResponse(azureUrlResponse);
      });

      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoLocalKit.id}/${account.userId}/${ssoLoginToken}.json`), async() => mockApiResponse(serverSsoKit));

      const controller = new AzureSsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      return controller.exec();
    });
  });

  describe("AzureSsoAuthenticationController::exec should throw an error when something wrong happens", () => {
    it("Should throw an error when client sso kit can't be find.", async() => {
      expect.assertions(2);
      SsoDataStorage.setMockedData(null);
      const account = {userId: uuid()};
      const controller = new AzureSsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec();
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(SsoDataStorage.flush).not.toHaveBeenCalled();
      }
    });

    it("Should throw an error when server sso kit can't be find.", async() => {
      expect.assertions(2);
      const ssoKit = clientSsoKit();
      const ssoToken = uuid();
      SsoDataStorage.setMockedData(ssoKit);

      const account = {userId: uuid()};
      const azureUrlResponse = {
        url: "https://login.azure.com/passbolt"
      };
      mockGetCodeFromThirdParty.mockImplementation(async() => ssoToken);
      fetch.doMockOnceIf(new RegExp(`/sso/azure/login.json`), async() => mockApiResponse(azureUrlResponse));
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoKit.id}/${account.userId}/${ssoToken}.json`), async() => mockApiResponseError(404));

      const controller = new AzureSsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec();
      } catch (e) {
        expect(e).toBeInstanceOf(PassboltApiFetchError);
        expect(SsoDataStorage.flush).toHaveBeenCalledTimes(1);
      }
    });

    it("Should throw an error when the passphrase can't be decrypted.", async() => {
      expect.assertions(2);
      const ssoToken = uuid();
      const ssoLocalKit = clientSsoKit();
      SsoDataStorage.setMockedData(ssoLocalKit);
      const ssoLoginToken = uuid();
      const serverSsoKitKey = {key: "fakeKey"};
      const serverSsoKit = {
        data: Buffer.from(JSON.stringify(serverSsoKitKey)).toString('base64')
      };
      const account = {userId: uuid()};
      const azureUrlResponse = {
        url: "https://login.azure.com/passbolt"
      };

      mockGetCodeFromThirdParty.mockImplementation(async() => ssoLoginToken);
      jest.spyOn(DecryptSsoPassphraseService, "decrypt").mockImplementation(async() => { throw new OutdatedSsoKitError(); });

      mockGetCodeFromThirdParty.mockImplementation(async() => ssoToken);
      fetch.doMockOnceIf(new RegExp(`/sso/azure/login.json`), async() => mockApiResponse(azureUrlResponse));
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoLocalKit.id}/${account.userId}/${ssoToken}.json`), async() => mockApiResponse(serverSsoKit));

      const controller = new AzureSsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec();
      } catch (e) {
        expect(e).toBeInstanceOf(OutdatedSsoKitError);
        expect(SsoDataStorage.flush).toHaveBeenCalledTimes(1);
      }
    });

    it("Should throw an error when the passphrase can't be decrypted.", async() => {
      expect.assertions(2);
      const ssoToken = uuid();
      const ssoLocalKit = clientSsoKit();
      SsoDataStorage.setMockedData(ssoLocalKit);
      const ssoLoginToken = uuid();
      const serverSsoKitKey = {key: "fakeKey"};
      const serverSsoKit = {
        data: Buffer.from(JSON.stringify(serverSsoKitKey)).toString('base64')
      };
      const account = {userId: uuid()};
      const azureUrlResponse = {
        url: "https://login.azure.com/passbolt"
      };

      mockGetCodeFromThirdParty.mockImplementation(async() => ssoLoginToken);

      jest.spyOn(DecryptSsoPassphraseService, "decrypt").mockImplementation(async() => { throw new Error(); });

      mockGetCodeFromThirdParty.mockImplementation(async() => ssoToken);
      fetch.doMockOnceIf(new RegExp(`/sso/azure/login.json`), async() => mockApiResponse(azureUrlResponse));
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoLocalKit.id}/${account.userId}/${ssoToken}.json`), async() => mockApiResponse(serverSsoKit));

      const controller = new AzureSsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec();
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(SsoDataStorage.flush).not.toHaveBeenCalled();
      }
    });

    it("Should throw an error when the passphrase doesn't match the user's private key.", async() => {
      expect.assertions(2);
      const ssoToken = uuid();
      const ssoLocalKit = clientSsoKit();
      SsoDataStorage.setMockedData(ssoLocalKit);
      const ssoLoginToken = uuid();
      const serverSsoKitKey = {key: "fakeKey"};
      const serverSsoKit = {
        data: Buffer.from(JSON.stringify(serverSsoKitKey)).toString('base64')
      };
      const account = {userId: uuid()};
      const azureUrlResponse = {
        url: "https://login.azure.com/passbolt"
      };

      mockGetCodeFromThirdParty.mockImplementation(async() => ssoLoginToken);

      jest.spyOn(DecryptSsoPassphraseService, "decrypt").mockImplementation(async() => "passphrase");

      mockGetCodeFromThirdParty.mockImplementation(async() => ssoToken);
      mockLogin.mockImplementation(async() => { throw new InvalidMasterPasswordError(); });
      fetch.doMockOnceIf(new RegExp(`/sso/azure/login.json`), async() => mockApiResponse(azureUrlResponse));
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoLocalKit.id}/${account.userId}/${ssoToken}.json`), async() => mockApiResponse(serverSsoKit));

      const controller = new AzureSsoAuthenticationController(null, null, defaultApiClientOptions(), account);
      try {
        await controller.exec();
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidMasterPasswordError);
        expect(SsoDataStorage.flush).toHaveBeenCalledTimes(1);
      }
    });
  });
});
