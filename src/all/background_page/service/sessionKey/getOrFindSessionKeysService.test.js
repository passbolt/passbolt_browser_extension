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
import GetOrFindSessionKeysService from "./getOrFindSessionKeysService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import SessionKeysBundlesCollection from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection";
import {
  defaultSessionKeysBundlesDtos
} from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GetOrFindSessionKeysService", () => {
  let getOrFindSessionKeysService, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    getOrFindSessionKeysService = new GetOrFindSessionKeysService(account, apiClientOptions);
    // flush account related storage before each.
    getOrFindSessionKeysService.sessionKeysBundlesSessionStorageService.flush();
  });

  describe("::getOrFindAllBundles", () => {
    it("with empty storage, retrieves the session types settings from the API and store them into the session storage.", async() => {
      expect.assertions(3);

      const apiSessionKeysBundlesCollectionDto = defaultSessionKeysBundlesDtos();

      jest.spyOn(getOrFindSessionKeysService.findAndUpdateSessionKeysService.findSessionKeysService.sesionKeysBundlesApiService, "findAll")
        .mockImplementation(() => apiSessionKeysBundlesCollectionDto);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);

      // Control initial storage value.
      const initialStorageValue = await getOrFindSessionKeysService.sessionKeysBundlesSessionStorageService.get();
      await expect(initialStorageValue).toBeUndefined();

      const collection = await getOrFindSessionKeysService.getOrFindAllBundles();

      const expectedSessionKeysBundlesDto = [...apiSessionKeysBundlesCollectionDto];
      expectedSessionKeysBundlesDto.forEach(sessionKeysBundleDto => sessionKeysBundleDto.data = JSON.parse(pgpKeys.metadataKey.decryptedSessionKeysDataMessage));

      expect(collection.toDto()).toEqual(expectedSessionKeysBundlesDto);
      const storageValue = await getOrFindSessionKeysService.sessionKeysBundlesSessionStorageService.get();
      await expect(storageValue).toEqual(expectedSessionKeysBundlesDto);
    });

    it("with populated storage, retrieves the session keys from the session storage.", async() => {
      expect.assertions(2);

      const sessionKeysBundlesCollectionDto = defaultSessionKeysBundlesDtos({}, {withDecryptedSessionKeysBundle: true});

      await getOrFindSessionKeysService.sessionKeysBundlesSessionStorageService.set(new SessionKeysBundlesCollection(sessionKeysBundlesCollectionDto));
      jest.spyOn(getOrFindSessionKeysService.findAndUpdateSessionKeysService.findSessionKeysService.sesionKeysBundlesApiService, "findAll");

      const collection = await getOrFindSessionKeysService.getOrFindAllBundles();

      expect(getOrFindSessionKeysService.findAndUpdateSessionKeysService.findSessionKeysService.sesionKeysBundlesApiService.findAll)
        .not.toHaveBeenCalled();
      expect(collection.toDto()).toEqual(sessionKeysBundlesCollectionDto);
    });
  });
});
