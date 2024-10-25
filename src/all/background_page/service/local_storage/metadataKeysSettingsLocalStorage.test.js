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
import {
  defaultMetadataKeysSettingsDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import MetadataKeysSettingsLocalStorage from "./metadataKeysSettingsLocalStorage";
import MetadataKeysSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("MetadataKeysSettingsLocalStorage", () => {
  let account, storage;
  beforeEach(() => {
    account = new AccountEntity(defaultAccountDto());
    storage = new MetadataKeysSettingsLocalStorage(account);
    // flush account related storage before each.
    storage.flush();
  });

  describe("::constructor", () => {
    it("throws an error if no account is provided.", () => {
      expect.assertions(1);
      expect(() => new MetadataKeysSettingsLocalStorage()).toThrow(TypeError);
    });

    it("throws an error if parameter account is not a valid AccountEntity.", () => {
      expect.assertions(1);
      expect(() => new MetadataKeysSettingsLocalStorage({})).toThrow(TypeError);
    });
  });

  describe("::get", () => {
    it("returns undefined if nothing is stored in the local storage.", async() => {
      expect.assertions(1);
      const result = await storage.get();
      expect(result).toBeUndefined();
    });

    it("returns content stored in the local storage.", async() => {
      const settingsDto = defaultMetadataKeysSettingsDto();
      expect.assertions(1);
      browser.storage.local.set({[storage.storageKey]: settingsDto});
      const result = await storage.get();
      expect(result).toEqual(settingsDto);
    });

    it("returns content stored in the runtime cache.", async() => {
      const settingsDto = defaultMetadataKeysSettingsDto();
      expect.assertions(2);
      // Force the runtime cache, to ensure it is hit even if the local storage is empty.
      MetadataKeysSettingsLocalStorage._runtimeCachedData[account.id] = settingsDto;
      const result = await storage.get();
      expect(result).toEqual(settingsDto);
      // Control the local storage was well empty.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
    });
  });

  describe("::set", () => {
    it("stores content in the local storage.", async() => {
      expect.assertions(3);
      const settings = new MetadataKeysSettingsEntity(defaultMetadataKeysSettingsDto());
      await storage.set(settings);
      // Expect the local storage (mocked here) to be set.
      expect(browser.storage.local.store[storage.storageKey]).toEqual(settings.toDto());
      // Expect the runtime cache to be set.
      expect(MetadataKeysSettingsLocalStorage._runtimeCachedData[account.id]).toEqual(settings.toDto());
      // Expect the get to retrieve the set data.
      const resultGet = await storage.get();
      expect(resultGet).toEqual(settings.toDto());
    });

    it("throws if no data is given to store.", async() => {
      expect.assertions(3);
      await expect(() => storage.set()).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(MetadataKeysSettingsLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("throws if invalid data is given to store.", async() => {
      expect.assertions(3);
      await expect(() => storage.set({})).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(MetadataKeysSettingsLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
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

      const resultPromise1 = storage.set(new MetadataKeysSettingsEntity(defaultMetadataKeysSettingsDto()));
      const resultPromise2 = storage.set(new MetadataKeysSettingsEntity(defaultMetadataKeysSettingsDto({allow_usage_of_personal_keys: false, zero_knowledge_key_share: true})));
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({[storage.storageKey]: defaultMetadataKeysSettingsDto()});
      expect(storage._setBrowserStorage).not.toHaveBeenCalledWith({[storage.storageKey]: defaultMetadataKeysSettingsDto({allow_usage_of_personal_keys: false, zero_knowledge_key_share: true})});
      promisesResolvers[0]();
      await resultPromise1;
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({[storage.storageKey]: defaultMetadataKeysSettingsDto()});
      promisesResolvers[1]();
      await resultPromise2;
    });
  });

  describe("::flush", () => {
    it("flushes works with not initialized local storage.", async() => {
      expect.assertions(2);
      await storage.flush();
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(MetadataKeysSettingsLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("flushes content of the local storage.", async() => {
      expect.assertions(2);
      const settings = new MetadataKeysSettingsEntity(defaultMetadataKeysSettingsDto());
      await storage.set(settings);
      await storage.flush();
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(MetadataKeysSettingsLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
    });
  });
});
