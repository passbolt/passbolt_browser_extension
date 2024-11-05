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
import SessionKeysBundlesSessionStorageService from "./sessionKeysBundlesSessionStorageService";
import {
  defaultSessionKeysBundlesDtos
} from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection.test.data";
import SessionKeysBundlesCollection from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SessionKeysBundlesSessionStorageService", () => {
  let account, storage;
  beforeEach(() => {
    account = new AccountEntity(defaultAccountDto());
    storage = new SessionKeysBundlesSessionStorageService(account);
    // flush account related storage before each.
    storage.flush();
  });

  describe("::constructor", () => {
    it("throws an error if no account is provided.", () => {
      expect.assertions(1);
      expect(() => new SessionKeysBundlesSessionStorageService()).toThrow(TypeError);
    });

    it("throws an error if parameter account is not a valid AccountEntity.", () => {
      expect.assertions(1);
      expect(() => new SessionKeysBundlesSessionStorageService({})).toThrow(TypeError);
    });
  });

  describe("::get", () => {
    it("returns undefined if nothing is stored in the session storage.", async() => {
      expect.assertions(1);
      const result = await storage.get();
      expect(result).toBeUndefined();
    });

    it("returns content stored in the session storage.", async() => {
      const sessionKeysBundlesDto = defaultSessionKeysBundlesDtos({}, {withDecryptedSessionKeysBundle: true});
      expect.assertions(1);
      browser.storage.session.set({[storage.storageKey]: sessionKeysBundlesDto});
      const result = await storage.get();
      expect(result).toEqual(sessionKeysBundlesDto);
    });

    it("returns content stored in the runtime cache.", async() => {
      const sessionKeysBundlesDto = defaultSessionKeysBundlesDtos({}, {withDecryptedSessionKeysBundle: true});
      expect.assertions(2);
      // Force the runtime cache, to ensure it is hit even if the session storage is empty.
      SessionKeysBundlesSessionStorageService._runtimeCachedData[account.id] = sessionKeysBundlesDto;
      const result = await storage.get();
      expect(result).toEqual(sessionKeysBundlesDto);
      // Control the session storage was well empty.
      expect(browser.storage.session.store[storage.storageKey]).toBeUndefined();
    });
  });

  describe("::set", () => {
    it("stores content in the session storage.", async() => {
      expect.assertions(3);
      const sessionKeysBundlesCollection = new SessionKeysBundlesCollection(defaultSessionKeysBundlesDtos({}, {withDecryptedSessionKeysBundle: true}));
      await storage.set(sessionKeysBundlesCollection);
      // Expect the session storage (mocked here) to be set.
      expect(browser.storage.session.store[storage.storageKey]).toEqual(sessionKeysBundlesCollection.toDto());
      // Expect the runtime cache to be set.
      expect(SessionKeysBundlesSessionStorageService._runtimeCachedData[account.id]).toEqual(sessionKeysBundlesCollection.toDto());
      // Expect the get to retrieve the set data.
      const resultGet = await storage.get();
      expect(resultGet).toEqual(sessionKeysBundlesCollection.toDto());
    });

    it("throws if no data is given to store.", async() => {
      expect.assertions(3);
      await expect(() => storage.set()).rejects.toThrow(TypeError);
      // Expect the session storage (mocked here) to not be set.
      expect(browser.storage.session.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(SessionKeysBundlesSessionStorageService._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("throws if invalid data is given to store.", async() => {
      expect.assertions(3);
      await expect(() => storage.set({})).rejects.toThrow(TypeError);
      // Expect the session storage (mocked here) to not be set.
      expect(browser.storage.session.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(SessionKeysBundlesSessionStorageService._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("throws if the collection contains encrypted private keys.", async() => {
      expect.assertions(1);
      // missing metadata private keys association
      const collection = new SessionKeysBundlesCollection(defaultSessionKeysBundlesDtos());
      await expect(() => storage.set(collection)).rejects.toThrow(new TypeError("The parameter `collection` should contain only decrypted keys."));
    });

    it("waits any on-going call to set to perform another set.", async() => {
      expect.assertions(3);
      const promisesResolvers = [];
      const sessionKeysBundlesDto1 = defaultSessionKeysBundlesDtos({}, {withDecryptedSessionKeysBundle: true});
      const sessionKeysBundlesDto2 = defaultSessionKeysBundlesDtos({}, {withDecryptedSessionKeysBundle: true});

      jest.spyOn(storage, "_setBrowserStorage").mockImplementation(() => {
        let resolve;
        const promise = new Promise(_resolve => resolve = _resolve);
        promisesResolvers.push(resolve);
        return promise;
      });

      const resultPromise1 = storage.set(new SessionKeysBundlesCollection(sessionKeysBundlesDto1));
      const resultPromise2 = storage.set(new SessionKeysBundlesCollection(sessionKeysBundlesDto2));
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({[storage.storageKey]: sessionKeysBundlesDto1});
      expect(storage._setBrowserStorage).not.toHaveBeenCalledWith({[storage.storageKey]: sessionKeysBundlesDto2});
      promisesResolvers[0]();
      await resultPromise1;
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({[storage.storageKey]: sessionKeysBundlesDto2});
      promisesResolvers[1]();
      await resultPromise2;
    });
  });

  describe("::flush", () => {
    it("flushes works with not initialized session storage.", async() => {
      expect.assertions(2);
      await storage.flush();
      // Expect the session storage (mocked here) to not be set.
      expect(browser.storage.session.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(SessionKeysBundlesSessionStorageService._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("flushes content of the session storage.", async() => {
      expect.assertions(2);
      const sessionKeysBundlesCollection = new SessionKeysBundlesCollection(defaultSessionKeysBundlesDtos({}, {withDecryptedSessionKeysBundle: true}));
      await storage.set(sessionKeysBundlesCollection);
      await storage.flush();
      // Expect the session storage (mocked here) to not be set.
      expect(browser.storage.session.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(SessionKeysBundlesSessionStorageService._runtimeCachedData[account.id]).toBeUndefined();
    });
  });
});
