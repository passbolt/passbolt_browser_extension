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
 * @since         5.0.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import ResourceGridUserSettingLocalStorage from "./ressourceGridSettingLocalStorage";
import {
  defaultGridUserSettingData
} from "passbolt-styleguide/src/shared/models/entity/gridUserSetting/gridUserSettingEntity.test.data";
import GridUserSettingEntity from "passbolt-styleguide/src/shared/models/entity/gridUserSetting/gridUserSettingEntity";
import {defaultSorterData} from "passbolt-styleguide/src/shared/models/entity/sorter/sorterEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ResourceGridUserSettingLocalStorage", () => {
  let account, storage;
  beforeEach(() => {
    account = new AccountEntity(defaultAccountDto());
    storage = new ResourceGridUserSettingLocalStorage(account);
    // flush account related storage before each.
    storage.flush();
  });

  describe("::constructor", () => {
    it("throws an error if no account is provided.", () => {
      expect.assertions(1);
      expect(() => new ResourceGridUserSettingLocalStorage()).toThrow(TypeError);
    });

    it("throws an error if parameter account is not a valid AccountEntity.", () => {
      expect.assertions(1);
      expect(() => new ResourceGridUserSettingLocalStorage({})).toThrow(TypeError);
    });
  });

  describe("::get", () => {
    it("returns undefined if nothing is stored in the local storage.", async() => {
      expect.assertions(1);
      const result = await storage.get();
      expect(result).toBeNull();
    });

    it("returns content stored in the local storage.", async() => {
      const settingsDto = defaultGridUserSettingData();
      expect.assertions(2);
      browser.storage.local.set({[storage.storageKey]: settingsDto});
      const result = await storage.get();
      expect(result).toBeInstanceOf(GridUserSettingEntity);
      expect(result.toDto({columns_setting: true, sorter: true})).toEqual(settingsDto);
    });
  });

  describe("::set", () => {
    it("stores content in the local storage.", async() => {
      expect.assertions(2);
      const settingsDto = defaultGridUserSettingData();
      const settings = new GridUserSettingEntity(settingsDto);
      await storage.set(settings);
      // Expect the local storage (mocked here) to be set.
      expect(browser.storage.local.store[storage.storageKey]).toEqual(settingsDto);
      // Expect the get to retrieve the set data.
      const resultGet = await storage.get();
      expect(resultGet.toDto({columns_setting: true, sorter: true})).toEqual(settingsDto);
    });

    it("throws if no data is given to store.", async() => {
      expect.assertions(2);
      await expect(() => storage.set()).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
    });

    it("throws if invalid data is given to store.", async() => {
      expect.assertions(2);
      await expect(() => storage.set({})).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
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

      const dto1 = defaultGridUserSettingData();
      const dto2 = defaultGridUserSettingData({sorter: defaultSorterData({"propertyName": "id"})});
      const resultPromise1 = storage.set(new GridUserSettingEntity(dto1));
      const resultPromise2 = storage.set(new GridUserSettingEntity(dto2));
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({[storage.storageKey]: dto1});
      expect(storage._setBrowserStorage).not.toHaveBeenCalledWith({[storage.storageKey]: dto2});
      promisesResolvers[0]();
      await resultPromise1;
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({[storage.storageKey]: dto2});
      promisesResolvers[1]();
      await resultPromise2;
    });
  });

  describe("::flush", () => {
    it("flushes works with not initialized local storage.", async() => {
      expect.assertions(1);
      await storage.flush();
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
    });

    it("flushes content of the local storage.", async() => {
      expect.assertions(1);
      const settings = new GridUserSettingEntity(defaultGridUserSettingData());
      await storage.set(settings);
      await storage.flush();
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
    });
  });
});
