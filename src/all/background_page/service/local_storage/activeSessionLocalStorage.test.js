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
import { defaultOnlineSessionDto } from "passbolt-styleguide/src/shared/models/entity/session/onlineSessionEntity.test.data";
import ActiveSessionLocalStorage from "./activeSessionLocalStorage";
import OnlineSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/onlineSessionEntity";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ActiveSessionLocalStorage", () => {
  let account, storage;
  beforeEach(() => {
    account = new AccountEntity(defaultAccountDto());
    storage = new ActiveSessionLocalStorage(account);
    // flush account related storage before each.
    storage.flush();
  });

  describe("::constructor", () => {
    it("throws an error if no account is provided.", () => {
      expect.assertions(1);
      expect(() => new ActiveSessionLocalStorage()).toThrow(TypeError);
    });

    it("throws an error if parameter account is not a valid AccountEntity.", () => {
      expect.assertions(1);
      expect(() => new ActiveSessionLocalStorage({})).toThrow(TypeError);
    });
  });

  describe("::get", () => {
    it("returns undefined if nothing is stored in the local storage.", async () => {
      expect.assertions(1);
      const result = await storage.get();
      expect(result).toBeUndefined();
    });

    it("returns content stored in the local storage.", async () => {
      const activeSessionDto = defaultOnlineSessionDto();
      expect.assertions(1);
      browser.storage.local.set({ [storage.storageKey]: activeSessionDto });
      const result = await storage.get();
      expect(result).toEqual(activeSessionDto);
    });

    it("returns content stored in the runtime cache.", async () => {
      const activeSessionDto = defaultOnlineSessionDto();
      expect.assertions(2);
      // Force the runtime cache, to ensure it is hit even if the local storage is empty.
      ActiveSessionLocalStorage._runtimeCachedData[account.id] = activeSessionDto;
      const result = await storage.get();
      expect(result).toEqual(activeSessionDto);
      // Control the local storage was well empty.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
    });
  });

  describe("::set", () => {
    it("stores content in the local storage.", async () => {
      expect.assertions(3);
      const activeSessionDto = new OnlineSessionEntity(defaultOnlineSessionDto());
      await storage.set(activeSessionDto);
      // Expect the local storage (mocked here) to be set.
      expect(browser.storage.local.store[storage.storageKey]).toEqual(activeSessionDto.toDto());
      // Expect the runtime cache to be set.
      expect(ActiveSessionLocalStorage._runtimeCachedData[account.id]).toEqual(activeSessionDto.toDto());
      // Expect the get to retrieve the set data.
      const resultGet = await storage.get();
      expect(resultGet).toEqual(activeSessionDto.toDto());
    });

    it("throws if no data is given to store.", async () => {
      expect.assertions(3);
      await expect(() => storage.set()).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(ActiveSessionLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("throws if invalid data is given to store.", async () => {
      expect.assertions(3);
      await expect(() => storage.set({})).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(ActiveSessionLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
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

      const resultPromise1 = storage.set(new OnlineSessionEntity(defaultOnlineSessionDto()));
      const onlineSessionUpdated = defaultOnlineSessionDto({
        is_mfa_authenticated: false,
        last_online_logged_in: "2022-05-05T12:41:45.000Z",
      });
      const resultPromise2 = storage.set(new OnlineSessionEntity(onlineSessionUpdated));
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({ [storage.storageKey]: defaultOnlineSessionDto() });
      expect(storage._setBrowserStorage).not.toHaveBeenCalledWith({ [storage.storageKey]: onlineSessionUpdated });
      promisesResolvers[0]();
      await resultPromise1;
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({ [storage.storageKey]: onlineSessionUpdated });
      promisesResolvers[1]();
      await resultPromise2;
    });
  });

  describe("::flush", () => {
    it("flushes works with not initialized local storage.", async () => {
      expect.assertions(2);
      await storage.flush();
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(ActiveSessionLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("flushes content of the local storage.", async () => {
      expect.assertions(2);
      const activeSessionDto = new OnlineSessionEntity(defaultOnlineSessionDto());
      await storage.set(activeSessionDto);
      await storage.flush();
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(ActiveSessionLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
    });
  });
});
