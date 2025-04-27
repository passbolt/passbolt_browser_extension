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
import MetadataKeysSessionStorage from "./metadataKeysSessionStorage";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {
  defaultDecryptedSharedMetadataKeysDtos,
  defaultMetadataKeysDtos
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";
import {defaultMetadataPrivateKeyDto, decryptedMetadataPrivateKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("MetadataKeysSessionStorage", () => {
  let account, storage;
  beforeEach(() => {
    account = new AccountEntity(defaultAccountDto());
    storage = new MetadataKeysSessionStorage(account);
    // flush account related storage before each.
    storage.flush();
  });

  describe("::constructor", () => {
    it("throws an error if no account is provided.", () => {
      expect.assertions(1);
      expect(() => new MetadataKeysSessionStorage()).toThrow(TypeError);
    });

    it("throws an error if parameter account is not a valid AccountEntity.", () => {
      expect.assertions(1);
      expect(() => new MetadataKeysSessionStorage({})).toThrow(TypeError);
    });
  });

  describe("::get", () => {
    it("returns undefined if nothing is stored in the session storage.", async() => {
      expect.assertions(1);
      const result = await storage.get();
      expect(result).toBeUndefined();
    });

    it("returns content stored in the session storage.", async() => {
      const collectionDto = defaultMetadataKeysDtos();
      expect.assertions(1);
      browser.storage.session.set({[storage.storageKey]: collectionDto});
      const result = await storage.get();
      expect(result).toEqual(collectionDto);
    });

    it("returns content stored in the runtime cache.", async() => {
      const collectionDto = defaultDecryptedSharedMetadataKeysDtos();
      expect.assertions(2);
      // Force the runtime cache, to ensure it is hit even if the session storage is empty.
      MetadataKeysSessionStorage._runtimeCachedData[account.id] = collectionDto;
      const result = await storage.get();
      expect(result).toEqual(collectionDto);
      // Control the session storage was well empty.
      expect(browser.storage.session.store[storage.storageKey]).toBeUndefined();
    });
  });

  describe("::set", () => {
    it("stores content in the session storage.", async() => {
      expect.assertions(3);
      const dtos = defaultDecryptedSharedMetadataKeysDtos();
      const collection = new MetadataKeysCollection(dtos);
      await storage.set(collection);
      // Expect the session storage (mocked here) to be set.
      expect(browser.storage.session.store[storage.storageKey]).toEqual(dtos);
      // Expect the runtime cache to be set.
      expect(MetadataKeysSessionStorage._runtimeCachedData[account.id]).toEqual(dtos);
      // Expect the get to retrieve the set data.
      const resultGet = await storage.get();
      expect(resultGet).toEqual(dtos);
    });

    it("throws if no data is given to store.", async() => {
      expect.assertions(3);
      await expect(() => storage.set()).rejects.toThrow(TypeError);
      // Expect the session storage (mocked here) to not be set.
      expect(browser.storage.session.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(MetadataKeysSessionStorage._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("throws if invalid data is given to store.", async() => {
      expect.assertions(3);
      await expect(() => storage.set({})).rejects.toThrow(TypeError);
      // Expect the session storage (mocked here) to not be set.
      expect(browser.storage.session.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(MetadataKeysSessionStorage._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("throws if invalid incomplete data given to store.", async() => {
      expect.assertions(1);
      // missing metadata private keys association
      const collection = new MetadataKeysCollection(defaultMetadataKeysDtos());
      await expect(() => storage.set(collection)).rejects.toThrow(new TypeError("The parameter 'metadataKey' should have the association '_metadata_private_keys' set."));
    });

    it("throws if the collection contains encrypted private keys.", async() => {
      expect.assertions(1);
      // missing metadata private keys association
      const collection = new MetadataKeysCollection(defaultMetadataKeysDtos(2, {}, {withMetadataPrivateKeys: true}));
      await expect(() => storage.set(collection)).rejects.toThrow(new TypeError("The parameter `collection` should contain only decrypted keys."));
    });

    it("waits any on-going call to set to perform another set.", async() => {
      expect.assertions(3);
      const promisesResolvers = [];

      jest.spyOn(storage, "_setBrowserStorage").mockImplementation(() => {
        let resolve;
        const promise = new Promise(_resolve => resolve = _resolve);
        promisesResolvers.push(resolve);
        return promise;
      });

      const collectionDto1 = defaultDecryptedSharedMetadataKeysDtos();
      const collectionDto2 = defaultDecryptedSharedMetadataKeysDtos();
      const resultPromise1 = storage.set(new MetadataKeysCollection(collectionDto1));
      const resultPromise2 = storage.set(new MetadataKeysCollection(collectionDto2));
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({[storage.storageKey]: collectionDto1});
      expect(storage._setBrowserStorage).not.toHaveBeenCalledWith({[storage.storageKey]: collectionDto2});
      promisesResolvers[0]();
      await resultPromise1;
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({[storage.storageKey]: collectionDto2});
      promisesResolvers[1]();
      await resultPromise2;
    });
  });

  describe("::updatePrivateKey", () => {
    it("stores content in the session storage.", async() => {
      expect.assertions(3);
      const dtos = defaultDecryptedSharedMetadataKeysDtos();
      const collection = new MetadataKeysCollection(dtos);
      await storage.set(collection);
      const date = (new Date()).toISOString();
      const metadataPrivateKeyDto = decryptedMetadataPrivateKeyDto({
        id: dtos[0].metadata_private_keys[0].id,
        metadata_key_id: dtos[0].id,
        user_id: dtos[0].metadata_private_keys[0].user_id,
        data_signed_by_current_user: date
      });
      const metadataPrivateKey = new MetadataPrivateKeyEntity(metadataPrivateKeyDto);
      const updatedDtos = JSON.parse(JSON.stringify(dtos));
      updatedDtos[0].metadata_private_keys[0].data_signed_by_current_user = date;
      updatedDtos[0].metadata_private_keys[0].created_by = metadataPrivateKeyDto.created_by;
      updatedDtos[0].metadata_private_keys[0].modified_by = metadataPrivateKeyDto.modified_by;
      await storage.updatePrivateKey(metadataPrivateKey);

      // Expect the session storage (mocked here) to be set.
      expect(browser.storage.session.store[storage.storageKey]).toEqual(updatedDtos);
      // Expect the runtime cache to be set.
      expect(MetadataKeysSessionStorage._runtimeCachedData[account.id]).toEqual(updatedDtos);
      // Expect the get to retrieve the set data.
      const resultGet = await storage.get();
      expect(resultGet).toEqual(updatedDtos);
    });

    it("throws if no data is given to update.", async() => {
      expect.assertions(3);
      await expect(() => storage.updatePrivateKey()).rejects.toThrow(TypeError);
      // Expect the session storage (mocked here) to not be set.
      expect(browser.storage.session.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(MetadataKeysSessionStorage._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("throws if invalid data is given to update.", async() => {
      expect.assertions(3);
      await expect(() => storage.updatePrivateKey({})).rejects.toThrow(TypeError);
      // Expect the session storage (mocked here) to not be set.
      expect(browser.storage.session.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(MetadataKeysSessionStorage._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("throws if encrypted data given to update.", async() => {
      expect.assertions(1);
      const metadataPrivateKey = new MetadataPrivateKeyEntity(defaultMetadataPrivateKeyDto());
      await expect(() => storage.updatePrivateKey(metadataPrivateKey)).rejects.toThrow(new TypeError("The metadata private key should be decrypted."));
    });

    it("throws if the associated metadata key cannot be found.", async() => {
      expect.assertions(1);
      const metadataPrivateKey = new MetadataPrivateKeyEntity(decryptedMetadataPrivateKeyDto());
      await expect(() => storage.updatePrivateKey(metadataPrivateKey)).rejects.toThrow(new TypeError("The metadata key could not be found in the session storage"));
    });
  });

  describe("::flush", () => {
    it("flushes works with not initialized session storage.", async() => {
      expect.assertions(2);
      await storage.flush();
      // Expect the session storage (mocked here) to not be set.
      expect(browser.storage.session.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(MetadataKeysSessionStorage._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("flushes content of the session storage.", async() => {
      expect.assertions(2);
      const dtos = defaultDecryptedSharedMetadataKeysDtos();
      const collection = new MetadataKeysCollection(dtos);
      await storage.set(collection);
      await storage.flush();
      // Expect the session storage (mocked here) to not be set.
      expect(browser.storage.session.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(MetadataKeysSessionStorage._runtimeCachedData[account.id]).toBeUndefined();
    });
  });
});
