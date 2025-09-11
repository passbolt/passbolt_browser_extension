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
 * @since         5.1.0
 */

import BrowserExtensionUpdatedLocalStorage from "./browserExtensionUpdatedLocalStorage";

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe("BrowserExtensionUpdatedLocalStorage", () => {
  describe("::get", () => {
    it("returns undefined if nothing is stored in the local storage.", async() => {
      expect.assertions(1);

      const storage = new BrowserExtensionUpdatedLocalStorage();

      const result = await storage.get();
      expect(result).toBeUndefined();
    });

    it("returns the content stored in the local storage.", async() => {
      expect.assertions(1);

      const now = Date.now();
      const storage = new BrowserExtensionUpdatedLocalStorage();
      await browser.storage.local.set({[storage.storageKey]: now});

      const result = await storage.get();
      expect(result).toEqual(now);
    });
  });

  describe("::set", () => {
    it("stores content in the local storage.", async() => {
      expect.assertions(2);

      const now = Date.now();
      const storage = new BrowserExtensionUpdatedLocalStorage();
      await storage.set(now);

      // Expect the local storage (mocked here) to be set.
      expect(browser.storage.local.store[storage.storageKey]).toEqual(now);
      // Expect the get to retrieve the set data.
      const resultGet = await storage.get();
      expect(resultGet).toEqual(now);
    });

    it("throws if no data is given to store.", async() => {
      expect.assertions(2);

      const storage = new BrowserExtensionUpdatedLocalStorage();

      await expect(() => storage.set()).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
    });

    it("throws if invalid data is given to store.", async() => {
      expect.assertions(2);

      const storage = new BrowserExtensionUpdatedLocalStorage();

      await expect(() => storage.set({})).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
    });

    it("waits any on-going call to set to perform another set.", async() => {
      expect.assertions(3);
      const promisesResolvers = [];

      const storage = new BrowserExtensionUpdatedLocalStorage();
      jest.spyOn(browser.storage.local, "set").mockImplementation(() => {
        let resolve;
        const promise = new Promise(_resolve => resolve = _resolve);
        promisesResolvers.push(resolve);
        return promise;
      });

      const date1 = Date.now();
      const date2 = date1 + 10_000;

      const resultPromise1 = storage.set(date1);
      const resultPromise2 = storage.set(date2);

      expect(browser.storage.local.set).toHaveBeenCalledWith({[storage.storageKey]: date1});
      expect(browser.storage.local.set).not.toHaveBeenCalledWith({[storage.storageKey]: date2});
      promisesResolvers[0]();
      await resultPromise1;

      expect(browser.storage.local.set).toHaveBeenCalledWith({[storage.storageKey]: date2});
      promisesResolvers[1]();
      await resultPromise2;
    });
  });

  describe("::flush", () => {
    it("flushes works with not initialized local storage.", async() => {
      expect.assertions(1);

      const storage = new BrowserExtensionUpdatedLocalStorage();
      await storage.flush();

      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
    });

    it("flushes content of the local storage.", async() => {
      expect.assertions(1);

      const now = Date.now();
      const storage = new BrowserExtensionUpdatedLocalStorage();
      await storage.set(now);
      await storage.flush();

      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
    });
  });
});
