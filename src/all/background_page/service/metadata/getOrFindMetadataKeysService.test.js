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
 * @since         4.10.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import GetOrFindMetadataKeysService from "./getOrFindMetadataKeysService";
import {v4 as uuidv4} from "uuid";
import {
  defaultMetadataPrivateKeyDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GetOrFindMetadataKeysService", () => {
  let getOrFindMetadataKeysService, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    getOrFindMetadataKeysService = new GetOrFindMetadataKeysService(account, apiClientOptions);
    // flush account related storage before each.
    getOrFindMetadataKeysService.metadataKeysSessionStorage.flush();
  });

  describe("::getOrFindMetadataTypesSettings", () => {
    it("with empty storage, retrieves the metadata types settings from the API and store them into the session storage, using the passphrase from the session storage.", async() => {
      expect.assertions(4);

      const id = uuidv4();
      const metadata_private_keys = [defaultMetadataPrivateKeyDto({metadata_key_id: id, data: pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage})];
      const fingerprint = "c0dce0aaea4d8cce961c26bddfb6e74e598f025c";
      const apiMetadataKeysCollectionDto = [defaultMetadataKeyDto({id, metadata_private_keys, fingerprint})];
      const expectedMetadataKeysDto = JSON.parse(JSON.stringify(apiMetadataKeysCollectionDto));
      expectedMetadataKeysDto[0].metadata_private_keys[0].data = JSON.parse(pgpKeys.metadataKey.decryptedMetadataPrivateKeyData);

      jest.spyOn(getOrFindMetadataKeysService.findAndUpdateMetadataKeysService.findMetadataKeysService.metadataKeysApiService, "findAll")
        .mockImplementation(() => apiMetadataKeysCollectionDto);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);

      // Control initial storage value.
      const initialStorageValue = await getOrFindMetadataKeysService.metadataKeysSessionStorage.get();
      await expect(initialStorageValue).toBeUndefined();

      const collection = await getOrFindMetadataKeysService.getOrFindAll();

      expect(collection.toDto(MetadataKeyEntity.ALL_CONTAIN_OPTIONS)).toEqual(expectedMetadataKeysDto);
      const storageValue = await getOrFindMetadataKeysService.metadataKeysSessionStorage.get();
      await expect(storageValue).toEqual(expectedMetadataKeysDto);
      expect(PassphraseStorageService.get).toHaveBeenCalledTimes(1);
    });

    it("does not retrieve the passphrase from the session storage if passed as parameter", async() => {
      expect.assertions(1);

      const id = uuidv4();
      const metadata_private_keys = [defaultMetadataPrivateKeyDto({metadata_key_id: id, data: pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage})];
      const fingerprint = "c0dce0aaea4d8cce961c26bddfb6e74e598f025c";
      const apiMetadataKeysCollectionDto = [defaultMetadataKeyDto({id, metadata_private_keys, fingerprint})];
      const expectedMetadataKeysDto = JSON.parse(JSON.stringify(apiMetadataKeysCollectionDto));
      expectedMetadataKeysDto[0].metadata_private_keys[0].data = JSON.parse(pgpKeys.metadataKey.decryptedMetadataPrivateKeyData);

      jest.spyOn(getOrFindMetadataKeysService.findAndUpdateMetadataKeysService.findMetadataKeysService.metadataKeysApiService, "findAll")
        .mockImplementation(() => apiMetadataKeysCollectionDto);
      jest.spyOn(PassphraseStorageService, "get");

      await getOrFindMetadataKeysService.getOrFindAll(pgpKeys.ada.passphrase);

      expect(PassphraseStorageService.get).not.toHaveBeenCalled();
    });

    it("with populated storage, retrieves the metadata keys from the session storage.", async() => {
      expect.assertions(2);
      const id = uuidv4();
      const metadata_private_keys = [defaultMetadataPrivateKeyDto({metadata_key_id: id, data: pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage})];
      const metadataKeysCollectionDto = [defaultMetadataKeyDto({id, metadata_private_keys})];
      metadataKeysCollectionDto[0].metadata_private_keys[0].data = JSON.parse(pgpKeys.metadataKey.decryptedMetadataPrivateKeyData);

      await getOrFindMetadataKeysService.metadataKeysSessionStorage.set(new MetadataKeysCollection(metadataKeysCollectionDto));
      jest.spyOn(getOrFindMetadataKeysService.findAndUpdateMetadataKeysService.findMetadataKeysService.metadataKeysApiService, "findAll");

      const collection = await getOrFindMetadataKeysService.getOrFindAll();

      expect(getOrFindMetadataKeysService.findAndUpdateMetadataKeysService.findMetadataKeysService.metadataKeysApiService.findAll)
        .not.toHaveBeenCalled();
      expect(collection.toDto(MetadataKeyEntity.ALL_CONTAIN_OPTIONS)).toEqual(metadataKeysCollectionDto);
    });
  });
});
