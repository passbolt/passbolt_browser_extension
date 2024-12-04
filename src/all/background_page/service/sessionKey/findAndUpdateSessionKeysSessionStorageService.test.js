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

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import FindAndUpdateSessionKeysSessionStorageService from "./findAndUpdateSessionKeysSessionStorageService";
import {
  defaultSessionKeysBundlesDtos
} from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection.test.data";
import SessionKeysBundlesCollection
  from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindAndUpdateSessionKeysSessionStorageService", () => {
  let findAndUpdateSessionKeysSessionStorageService, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);
    findAndUpdateSessionKeysSessionStorageService = new FindAndUpdateSessionKeysSessionStorageService(account, apiClientOptions);
    // flush account related storage before each.
    findAndUpdateSessionKeysSessionStorageService.sessionKeysBundlesSessionStorageService.flush();
  });

  describe("::findAndUpdateAllBundles", () => {
    it("retrieves the session keys bundles from the API and store them into the session storage.", async() => {
      expect.assertions(2);
      const sessionKeysBundlesDto = defaultSessionKeysBundlesDtos();
      jest.spyOn(findAndUpdateSessionKeysSessionStorageService.findSessionKeysService.sesionKeysBundlesApiService, "findAll").mockImplementation(() => sessionKeysBundlesDto);

      const collection = await findAndUpdateSessionKeysSessionStorageService.findAndUpdateAllBundles();

      const expectedSessionKeysBundlesDto = [...sessionKeysBundlesDto];
      expectedSessionKeysBundlesDto.forEach(sessionKeysBundleDto => sessionKeysBundleDto.data = JSON.parse(pgpKeys.metadataKey.decryptedSessionKeysDataMessage));

      expect(collection.toDto()).toEqual(expectedSessionKeysBundlesDto);
      const storageValue = await findAndUpdateSessionKeysSessionStorageService.sessionKeysBundlesSessionStorageService.get();
      expect(storageValue).toEqual(expectedSessionKeysBundlesDto);
    });

    it("retrieves empty array of session keys bundles from the API and store them into the session storage.", async() => {
      expect.assertions(2);
      const sessionKeysBundlesDto = [];
      jest.spyOn(findAndUpdateSessionKeysSessionStorageService.findSessionKeysService.sesionKeysBundlesApiService, "findAll").mockImplementation(() => sessionKeysBundlesDto);

      const collection = await findAndUpdateSessionKeysSessionStorageService.findAndUpdateAllBundles();

      expect(collection.toDto()).toEqual(sessionKeysBundlesDto);
      const storageValue = await findAndUpdateSessionKeysSessionStorageService.sessionKeysBundlesSessionStorageService.get();
      await expect(storageValue).toEqual(sessionKeysBundlesDto);
    });

    it("overrides session storage with a second update call.", async() => {
      expect.assertions(2);
      const sessionKeysBundlesDto = defaultSessionKeysBundlesDtos();
      jest.spyOn(findAndUpdateSessionKeysSessionStorageService.findSessionKeysService.sesionKeysBundlesApiService, "findAll").mockImplementation(() => sessionKeysBundlesDto);
      await findAndUpdateSessionKeysSessionStorageService.sessionKeysBundlesSessionStorageService.set(new SessionKeysBundlesCollection(defaultSessionKeysBundlesDtos({}, {withDecryptedSessionKeysBundle: true})));

      const collection = await findAndUpdateSessionKeysSessionStorageService.findAndUpdateAllBundles();

      const expectedSessionKeysBundlesDto = [...sessionKeysBundlesDto];
      expectedSessionKeysBundlesDto.forEach(sessionKeysBundleDto => sessionKeysBundleDto.data = JSON.parse(pgpKeys.metadataKey.decryptedSessionKeysDataMessage));

      expect(collection.toDto()).toEqual(expectedSessionKeysBundlesDto);
      const storageValue = await findAndUpdateSessionKeysSessionStorageService.sessionKeysBundlesSessionStorageService.get();
      await expect(storageValue).toEqual(expectedSessionKeysBundlesDto);
    });

    it("waits any on-going call to the update and returns the result of the session storage.", async() => {
      expect.assertions(4);
      const sessionKeysBundlesDto = defaultSessionKeysBundlesDtos();
      let resolve;
      const promise = new Promise(_resolve => resolve = _resolve);
      jest.spyOn(findAndUpdateSessionKeysSessionStorageService.findSessionKeysService.sesionKeysBundlesApiService, "findAll").mockImplementation(() => promise);
      await findAndUpdateSessionKeysSessionStorageService.sessionKeysBundlesSessionStorageService.set(new SessionKeysBundlesCollection(defaultSessionKeysBundlesDtos({}, {withDecryptedSessionKeysBundle: true})));

      const promiseFirstCall = findAndUpdateSessionKeysSessionStorageService.findAndUpdateAllBundles();
      const promiseSecondCall = findAndUpdateSessionKeysSessionStorageService.findAndUpdateAllBundles();
      resolve(sessionKeysBundlesDto);
      const resultFirstCall = await promiseFirstCall;
      const resultSecondCall = await promiseSecondCall;

      const expectedSessionKeysBundlesDto = [...sessionKeysBundlesDto];
      expectedSessionKeysBundlesDto.forEach(sessionKeysBundleDto => sessionKeysBundleDto.data = JSON.parse(pgpKeys.metadataKey.decryptedSessionKeysDataMessage));

      expect(findAndUpdateSessionKeysSessionStorageService.findSessionKeysService.sesionKeysBundlesApiService.findAll).toHaveBeenCalledTimes(1);
      expect(resultFirstCall.toDto()).toEqual(expectedSessionKeysBundlesDto);
      expect(resultSecondCall.toDto()).toEqual(expectedSessionKeysBundlesDto);
      const storageValue = await findAndUpdateSessionKeysSessionStorageService.sessionKeysBundlesSessionStorageService.get();
      await expect(storageValue).toEqual(expectedSessionKeysBundlesDto);
    });
  });
});
