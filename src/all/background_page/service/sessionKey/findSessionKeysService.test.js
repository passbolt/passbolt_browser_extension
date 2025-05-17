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
 * @since         4.10.1
 */

import {enableFetchMocks} from "jest-fetch-mock";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import FindSessionKeysService from "./findSessionKeysService";
import {mockApiResponseError} from "passbolt-styleguide/test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {
  defaultSessionKeysBundlesDtos
} from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection.test.data";
import SessionKeysBundlesCollection
  from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection";

describe("FindSessionKeysService", () => {
  let apiClientOptions, account;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::findAllBundles', () => {
    it("retrieves the session keys bundles from API", async() => {
      expect.assertions(5);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      const apiSessionKeysBundlesCollection = defaultSessionKeysBundlesDtos();

      const service = new FindSessionKeysService(apiClientOptions, account);
      const spyOnFindService = jest.spyOn(service.sesionKeysBundlesApiService, "findAll");
      spyOnFindService.mockImplementation(() => apiSessionKeysBundlesCollection);
      const resultDto = await service.findAllBundles();

      expect(resultDto).toBeInstanceOf(SessionKeysBundlesCollection);
      expect(resultDto).toHaveLength(apiSessionKeysBundlesCollection.length);
      expect(resultDto.hasSomeDecryptedSessionKeysBundles()).toStrictEqual(true);
      expect(spyOnFindService).toHaveBeenCalledTimes(1);
      expect(spyOnPassphraseStorage).toHaveBeenCalledTimes(1);
    });

    it("does not retrieve the passphrase from the session storage if passed as parameter", async() => {
      expect.assertions(1);
      const apiSessionKeysBundlesCollection = defaultSessionKeysBundlesDtos();

      const service = new FindSessionKeysService(apiClientOptions, account);
      jest.spyOn(PassphraseStorageService, "get");
      jest.spyOn(service.sesionKeysBundlesApiService, "findAll").mockImplementation(() => apiSessionKeysBundlesCollection);
      await service.findAllBundles(pgpKeys.ada.passphrase);

      expect(PassphraseStorageService.get).not.toHaveBeenCalled();
    });

    it("throws an error if the keys from the API is already decrypted", async() => {
      expect.assertions(1);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      const apiSessionKeysBundlesCollection = defaultSessionKeysBundlesDtos({}, {withDecryptedSessionKeysBundle: true});

      const service = new FindSessionKeysService(apiClientOptions, account);
      const spyOnFindService = jest.spyOn(service.sesionKeysBundlesApiService, "findAll");
      spyOnFindService.mockImplementation(() => apiSessionKeysBundlesCollection);

      const expectedError = new Error("The session keys bundles should not be decrypted.");
      await expect(() => service.findAllBundles()).rejects.toThrow(expectedError);
    });

    it("throws API error if the API encountered an issue", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/session-keys/, () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new FindSessionKeysService(apiClientOptions, account);

      await expect(() => service.findAllBundles()).rejects.toThrow(PassboltApiFetchError);
    });

    it("throws service unavailable error if an error occurred but not from the API (by instance cloudflare)", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/metadata\/session-keys/, () => { throw new Error("Service unavailable"); });

      const service = new FindSessionKeysService(apiClientOptions, account);

      await expect(() => service.findAllBundles()).rejects.toThrow(PassboltServiceUnavailableError);
    });
  });
});
