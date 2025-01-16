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
import FindAndUpdateMetadataKeysSessionStorageService from "./findAndUpdateMetadataKeysSessionStorageService";
import {
  defaultMetadataKeysDtos
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {
  defaultMetadataPrivateKeyDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import {v4 as uuidv4} from "uuid";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindAndUpdateMetadataKeysSessionStorageService", () => {
  let findAndUpdateKeysSessionStorageService,
    account,
    apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    findAndUpdateKeysSessionStorageService = new FindAndUpdateMetadataKeysSessionStorageService(account, apiClientOptions);
    // flush account related storage before each.
    findAndUpdateKeysSessionStorageService.metadataKeysSessionStorage.flush();
  });

  describe("::findAndUpdateAll", () => {
    it("should throw an error if the user passphrase is not set and is required", async() => {
      expect.assertions(1);
      const metadataKeysDto = defaultMetadataKeysDtos(1, {}, {withMetadataPrivateKeys: true});
      jest.spyOn(findAndUpdateKeysSessionStorageService.findMetadataKeysService.metadataKeysApiService, "findAll").mockImplementation(() => metadataKeysDto);

      await expect(() => findAndUpdateKeysSessionStorageService.findAndUpdateAll()).rejects.toThrow(UserPassphraseRequiredError);
    });

    it("retrieves the metadata keys from the API and store them into the session storage.", async() => {
      expect.assertions(7);

      const id = uuidv4();
      const metadataPrivateKeysDto = [defaultMetadataPrivateKeyDto({metadata_key_id: id, data: pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage})];
      const metadataKeysDto = [defaultMetadataKeyDto({id: id, metadata_private_keys: metadataPrivateKeysDto})];
      const expectedMetadataKeysDto = JSON.parse(JSON.stringify(metadataKeysDto));
      expectedMetadataKeysDto[0].metadata_private_keys[0].data = JSON.parse(pgpKeys.metadataKey.decryptedMetadataPrivateKeyData);

      jest.spyOn(findAndUpdateKeysSessionStorageService.findMetadataKeysService.metadataKeysApiService, "findAll").mockImplementation(() => metadataKeysDto);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);

      const collection = await findAndUpdateKeysSessionStorageService.findAndUpdateAll();

      expect(collection.toDto({metadata_private_keys: true})).toEqual(expectedMetadataKeysDto);
      expect(collection).toBeInstanceOf(MetadataKeysCollection);
      expect(collection).toHaveLength(1);
      expect(collection.hasEncryptedKeys()).toStrictEqual(false);
      expect(findAndUpdateKeysSessionStorageService.findMetadataKeysService.metadataKeysApiService.findAll).toHaveBeenCalledTimes(1);
      expect(PassphraseStorageService.get).toHaveBeenCalledTimes(1);

      const storageValue = await findAndUpdateKeysSessionStorageService.metadataKeysSessionStorage.get();
      await expect(storageValue).toEqual(expectedMetadataKeysDto);
    });

    it("overrides session storage with a second update call.", async() => {
      expect.assertions(2);

      // Store information in storage.
      const storedId = uuidv4();
      const storedMetadataPrivateKeysDto = [defaultMetadataPrivateKeyDto({metadata_key_id: storedId, data: JSON.parse(pgpKeys.metadataKey.decryptedMetadataPrivateKeyData)})];
      const storedMetadataKeysDto = [defaultMetadataKeyDto({id: storedId, metadata_private_keys: storedMetadataPrivateKeysDto})];
      await findAndUpdateKeysSessionStorageService.metadataKeysSessionStorage.set(new MetadataKeysCollection(storedMetadataKeysDto));

      // Mock data relative to service call
      const id = uuidv4();
      const metadataPrivateKeysDto = [defaultMetadataPrivateKeyDto({metadata_key_id: id, data: pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage})];
      const metadataKeysDto = [defaultMetadataKeyDto({id: id, metadata_private_keys: metadataPrivateKeysDto})];
      const expectedMetadataKeysDto = JSON.parse(JSON.stringify(metadataKeysDto));
      expectedMetadataKeysDto[0].metadata_private_keys[0].data = JSON.parse(pgpKeys.metadataKey.decryptedMetadataPrivateKeyData);

      jest.spyOn(findAndUpdateKeysSessionStorageService.findMetadataKeysService.metadataKeysApiService, "findAll").mockImplementation(() => metadataKeysDto);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);

      const collection = await findAndUpdateKeysSessionStorageService.findAndUpdateAll();

      expect(collection.toDto({metadata_private_keys: true})).toEqual(expectedMetadataKeysDto);
      const storageValue = await findAndUpdateKeysSessionStorageService.metadataKeysSessionStorage.get();
      await expect(storageValue).toEqual(expectedMetadataKeysDto);
    });

    it("waits any on-going call to the update and returns the result of the session storage.", async() => {
      expect.assertions(4);

      // Mock data relative to service call
      const id = uuidv4();
      const metadataPrivateKeysDto = [defaultMetadataPrivateKeyDto({metadata_key_id: id, data: pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage})];
      const metadataKeysDto = [defaultMetadataKeyDto({id: id, metadata_private_keys: metadataPrivateKeysDto})];
      const expectedMetadataKeysDto = JSON.parse(JSON.stringify(metadataKeysDto));
      expectedMetadataKeysDto[0].metadata_private_keys[0].data = JSON.parse(pgpKeys.metadataKey.decryptedMetadataPrivateKeyData);

      let resolve;
      const promise = new Promise(_resolve => resolve = _resolve);
      jest.spyOn(findAndUpdateKeysSessionStorageService.findMetadataKeysService.metadataKeysApiService, "findAll").mockImplementation(() => promise);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);

      const promiseFirstCall = findAndUpdateKeysSessionStorageService.findAndUpdateAll();
      const promiseSecondCall = findAndUpdateKeysSessionStorageService.findAndUpdateAll();
      resolve(metadataKeysDto);
      const resultFirstCall = await promiseFirstCall;
      const resultSecondCall = await promiseSecondCall;

      expect(findAndUpdateKeysSessionStorageService.findMetadataKeysService.metadataKeysApiService.findAll).toHaveBeenCalledTimes(1);
      expect(resultFirstCall.toDto({metadata_private_keys: true})).toEqual(expectedMetadataKeysDto);
      expect(resultSecondCall.toDto({metadata_private_keys: true})).toEqual(expectedMetadataKeysDto);
      const storageValue = await findAndUpdateKeysSessionStorageService.metadataKeysSessionStorage.get();
      await expect(storageValue).toEqual(expectedMetadataKeysDto);
    });
  });
});
