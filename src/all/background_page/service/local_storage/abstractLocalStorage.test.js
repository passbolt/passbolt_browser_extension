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
 * @since         6.0.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { TestEntityLocalStorage, TestLocalStorage } from "./abstractLocalStorage.test.data";
import { v4 as uuidv4 } from "uuid";
import LocalStorageMetadataEntity from "../../model/entity/localStorage/localStorageMetadataEntity";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AbstractLocalStorage", () => {
  let account, storage;
  beforeEach(() => {
    account = new AccountEntity(defaultAccountDto());
    storage = new TestLocalStorage(account);
    // flush account related storage before each.
    storage.flush();
  });

  describe("::constructor", () => {
    it("throws an error if no account is provided.", () => {
      expect.assertions(1);
      expect(() => new TestLocalStorage()).toThrow(TypeError);
    });

    it("throws an error if parameter account is not a valid AccountEntity.", () => {
      expect.assertions(1);
      expect(() => new TestLocalStorage({})).toThrow(TypeError);
    });
  });

  describe("::getMetadata", () => {
    it("returns undefined if nothing is stored in the local storage.", async () => {
      expect.assertions(1);
      const result = await storage.getMetadata();
      expect(result).toBeUndefined();
    });

    it("returns content stored in the local storage.", async () => {
      const dto = {
        last_updated: new Date().toISOString(),
      };
      expect.assertions(1);
      browser.storage.local.set({ [storage.storageMetadataKey]: dto });
      const result = await storage.getMetadata();
      expect(result).toEqual(dto);
    });

    it("returns content stored in the runtime cache.", async () => {
      const dto = {
        last_updated: new Date().toISOString(),
      };
      expect.assertions(2);
      // Force the runtime cache, to ensure it is hit even if the local storage is empty.
      TestLocalStorage._runtimeCachedMetadata[storage.storageMetadataKey] = dto;
      const result = await storage.getMetadata();
      expect(result).toEqual(dto);
      // Control the local storage was well empty.
      expect(browser.storage.local.store[storage.storageMetadataKey]).toBeUndefined();
    });
  });

  describe("::getData", () => {
    it("returns undefined if nothing is stored in the local storage.", async () => {
      expect.assertions(1);
      const result = await storage.getData();
      expect(result).toBeUndefined();
    });

    it("returns content stored in the local storage.", async () => {
      const dto = {
        id: uuidv4(),
        name: "test",
      };
      expect.assertions(1);
      browser.storage.local.set({ [storage.storageDataKey]: dto });
      const result = await storage.getData();
      expect(result).toEqual(dto);
    });

    it("returns content stored in the runtime cache.", async () => {
      const dto = {
        id: uuidv4(),
        name: "test",
      };
      expect.assertions(2);
      // Force the runtime cache, to ensure it is hit even if the local storage is empty.
      TestLocalStorage._runtimeCachedData[storage.storageDataKey] = dto;
      const result = await storage.getData();
      expect(result).toEqual(dto);
      // Control the local storage was well empty.
      expect(browser.storage.local.store[storage.storageDataKey]).toBeUndefined();
    });
  });

  describe("::setMetadata", () => {
    it("stores content in the local storage.", async () => {
      expect.assertions(3);
      const dto = {
        last_updated: new Date().toISOString(),
      };
      const entity = new LocalStorageMetadataEntity(dto);
      await storage.setMetadata(entity);
      // Expect the local storage (mocked here) to be set.
      expect(browser.storage.local.store[storage.storageMetadataKey]).toEqual(dto);
      // Expect the runtime cache to be set.
      expect(TestLocalStorage._runtimeCachedMetadata[storage.storageMetadataKey]).toEqual(dto);
      // Expect the get to retrieve the set metadata.
      const resultGetMetadata = await storage.getMetadata();
      expect(resultGetMetadata).toEqual(dto);
    });

    it("throws if no metadata is given to store.", async () => {
      expect.assertions(3);
      await expect(() => storage.setMetadata()).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageMetadataKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(TestLocalStorage._runtimeCachedMetadata[storage.storageMetadataKey]).toBeUndefined();
    });

    it("throws if invalid metadata is given to store.", async () => {
      expect.assertions(3);
      await expect(() => storage.setMetadata({})).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageMetadataKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(TestLocalStorage._runtimeCachedMetadata[storage.storageMetadataKey]).toBeUndefined();
    });

    it("waits any on-going call to set to perform another set.", async () => {
      expect.assertions(3);
      const promisesResolvers = [];

      jest.spyOn(storage, "_setBrowserStorage").mockImplementation(() => {
        let resolve;
        const promise = new Promise((_resolve) => (resolve = _resolve));
        promisesResolvers.push(resolve);
        return promise;
      });

      const dto1 = {
        last_updated: new Date().toISOString(),
      };
      const resultPromise1 = storage.setMetadata(new LocalStorageMetadataEntity(dto1));
      const dto2 = {
        last_updated: "2026-05-04T20:31:45+00:00",
      };
      const resultPromise2 = storage.setMetadata(new LocalStorageMetadataEntity(dto2));
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({ [storage.storageMetadataKey]: dto1 });
      expect(storage._setBrowserStorage).not.toHaveBeenCalledWith({ [storage.storageMetadataKey]: dto2 });
      promisesResolvers[0]();
      await resultPromise1;
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({ [storage.storageMetadataKey]: dto2 });
      promisesResolvers[1]();
      await resultPromise2;
    });
  });

  describe("::setData", () => {
    it("stores content in the local storage.", async () => {
      expect.assertions(4);
      const dto = {
        id: uuidv4(),
        name: "test",
      };
      const entity = new TestEntityLocalStorage(dto);
      await storage.setData(entity);
      // Expect the local storage (mocked here) to be set.
      expect(browser.storage.local.store[storage.storageDataKey]).toEqual(dto);
      // Expect the runtime cache to be set.
      expect(TestLocalStorage._runtimeCachedData[storage.storageDataKey]).toEqual(dto);
      // Expect the get to retrieve the set data.
      const resultGet = await storage.getData();
      const resultGetMetadata = await storage.getMetadata();
      expect(resultGet).toEqual(dto);
      expect(resultGetMetadata.last_updated.slice(0, 10)).toEqual(new Date().toISOString().slice(0, 10));
    });

    it("throws if no data is given to store.", async () => {
      expect.assertions(3);
      await expect(() => storage.setData()).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageDataKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(TestLocalStorage._runtimeCachedData[storage.storageDataKey]).toBeUndefined();
    });

    it("throws if invalid data is given to store.", async () => {
      expect.assertions(3);
      await expect(() => storage.setData({})).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageDataKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(TestLocalStorage._runtimeCachedData[storage.storageDataKey]).toBeUndefined();
    });

    it("waits any on-going call to set to perform another set.", async () => {
      expect.assertions(3);
      const promisesResolvers = [];

      jest.spyOn(storage, "_setBrowserStorage").mockImplementation(() => {
        let resolve;
        const promise = new Promise((_resolve) => (resolve = _resolve));
        promisesResolvers.push(resolve);
        return promise;
      });
      jest.spyOn(storage, "setMetadata").mockImplementation(() => {});

      const dto1 = {
        id: uuidv4(),
        name: "test",
      };
      const resultPromise1 = storage.setData(new TestEntityLocalStorage(dto1));
      const dto2 = {
        id: uuidv4(),
        name: "test2",
      };
      const resultPromise2 = storage.setData(new TestEntityLocalStorage(dto2));
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({ [storage.storageDataKey]: dto1 });
      expect(storage._setBrowserStorage).not.toHaveBeenCalledWith({ [storage.storageDataKey]: dto2 });
      promisesResolvers[0]();
      await resultPromise1;
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({ [storage.storageDataKey]: dto2 });
      promisesResolvers[1]();
      await resultPromise2;
    });
  });

  describe("::flush", () => {
    it("flushes works with not initialized local storage.", async () => {
      expect.assertions(3);
      await storage.flush();
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageDataKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(TestLocalStorage._runtimeCachedData[storage.storageDataKey]).toBeUndefined();
      expect(TestLocalStorage._runtimeCachedMetadata[storage.storageMetadataKey]).toBeUndefined();
    });

    it("flushes content of the local storage.", async () => {
      expect.assertions(3);
      const dto = {
        id: uuidv4(),
        name: "test",
      };
      const entity = new TestEntityLocalStorage(dto);
      await storage.setData(entity);
      await storage.flush();
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageDataKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(TestLocalStorage._runtimeCachedData[storage.storageDataKey]).toBeUndefined();
      expect(TestLocalStorage._runtimeCachedMetadata[storage.storageMetadataKey]).toBeUndefined();
    });
  });
});
