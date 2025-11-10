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
 * @since         5.7.0
 */
import {defaultGroupDto} from "passbolt-styleguide/src/shared/models/entity/group/groupEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import GroupsCollection from "../../model/entity/group/groupsCollection";
import {defaultGroupsDtos} from "../../model/entity/group/groupsCollection.test.data";
import GroupLocalStorage from "./groupLocalStorage";
import GroupEntity from "../../model/entity/group/groupEntity";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GroupLocalStorage", () => {
  let account, storage;
  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    storage = new GroupLocalStorage(account);
    // flush account related storage before each.
    await storage.flush();
  });

  describe("::constructor", () => {
    it("throws an error if no account is provided.", () => {
      expect.assertions(1);
      expect(() => new GroupLocalStorage()).toThrow(TypeError);
    });

    it("throws an error if parameter account is not a valid AccountEntity.", () => {
      expect.assertions(1);
      expect(() => new GroupLocalStorage({})).toThrow(TypeError);
    });
  });

  describe("::getStorageKey", () => {
    it("should concatenate the key with the user id", () => {
      expect.assertions(1);
      const key = GroupLocalStorage.getStorageKey(account.id);
      expect(key).toEqual(`groups-${account.id}`);
    });
  });

  describe("::hasCachedData", () => {
    it("should return false if there is no cached data for the account", () => {
      const accountId = "some-account-id";
      GroupLocalStorage._runtimeCachedData = {};
      const result = GroupLocalStorage.hasCachedData(accountId);
      expect(result).toBe(false);
    });

    it("should return false if the cached data for the account is empty", () => {
      const accountId = "some-account-id";
      GroupLocalStorage._runtimeCachedData = {
        [accountId]: {}
      };
      const result = GroupLocalStorage.hasCachedData(accountId);
      expect(result).toBe(false);
    });

    it("should return true if there is cached data for the account", () => {
      const accountId = "some-account-id";
      GroupLocalStorage._runtimeCachedData = {
        [accountId]: {
          "some-key": "some-value"
        }
      };
      const result = GroupLocalStorage.hasCachedData(accountId);
      expect(result).toBe(true);
    });
  });

  describe("::flush", () => {
    it("flushes works with not initialized local storage.", async() => {
      expect.assertions(2);
      await storage.flush();
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(GroupLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("flushes local storage's content.", async() => {
      expect.assertions(2);
      const dtos = defaultGroupsDtos();
      const collection = new GroupsCollection(dtos);
      await storage.set(collection);
      await storage.flush();
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(GroupLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
    });
  });

  describe("::get", () => {
    it("returns undefined if nothing is stored in the local storage.", async() => {
      expect.assertions(1);
      const result = await storage.get();
      expect(result).toBeUndefined();
    });

    it("returns content stored in the local storage.", async() => {
      expect.assertions(1);
      const collectionDto = defaultGroupsDtos();
      browser.storage.local.set({[storage.storageKey]: collectionDto});
      const result = await storage.get();
      expect(result).toEqual(collectionDto);
    });

    it("returns content stored in the runtime cache.", async() => {
      const collectionDto = defaultGroupsDtos();
      expect.assertions(2);
      // Force the runtime cache, to ensure it is hit even if the local storage is empty.
      GroupLocalStorage._runtimeCachedData[account.id] = collectionDto;
      const result = await storage.get();
      expect(result).toEqual(collectionDto);
      // Control the local storage was well empty.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
    });
  });

  describe("::set", () => {
    it("stores content in the local storage.", async() => {
      expect.assertions(3);
      const dtos = defaultGroupsDtos();
      const collection = new GroupsCollection(dtos);
      await storage.set(collection);
      // Expect the local storage (mocked here) to be set.
      expect(browser.storage.local.store[storage.storageKey]).toEqual(dtos);
      // Expect the runtime cache to be set.
      expect(GroupLocalStorage._runtimeCachedData[account.id]).toEqual(dtos);
      // Expect the get to retrieve the set data.
      const resultGet = await storage.get();
      expect(resultGet).toEqual(dtos);
    });

    it("throws error if no data is given to store.", async() => {
      expect.assertions(3);
      await expect(() => storage.set()).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(GroupLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("throws error if invalid data is given to store.", async() => {
      expect.assertions(3);
      await expect(() => storage.set({})).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(GroupLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
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

      const collectionDto1 = defaultGroupsDtos();
      const collectionDto2 = defaultGroupsDtos();
      const resultPromise1 = storage.set(new GroupsCollection(collectionDto1));
      const resultPromise2 = storage.set(new GroupsCollection(collectionDto2));
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({[storage.storageKey]: collectionDto1});
      expect(storage._setBrowserStorage).not.toHaveBeenCalledWith({[storage.storageKey]: collectionDto2});
      promisesResolvers[0]();
      await resultPromise1;
      expect(storage._setBrowserStorage).toHaveBeenCalledWith({[storage.storageKey]: collectionDto2});
      promisesResolvers[1]();
      await resultPromise2;
    });
  });

  describe("::getGroupById", () => {
    it("returns a group by its id.", async() => {
      expect.assertions(1);
      const collectionDto = defaultGroupsDtos();
      const firstGroupDto = collectionDto[0];
      expect.assertions(1);
      browser.storage.local.set({[storage.storageKey]: collectionDto});
      const result = await storage.getGroupById(firstGroupDto.id);
      expect(result).toEqual(firstGroupDto);
    });
  });

  describe("::addGroup", () => {
    it("adds a group to local storage.", async() => {
      expect.assertions(2);
      const collectionDto = defaultGroupsDtos();
      browser.storage.local.set({[storage.storageKey]: collectionDto});

      const newGroupDto = defaultGroupDto();
      const newGroupEntiy = new GroupEntity(newGroupDto);
      await storage.addGroup(newGroupEntiy);
      const result = await storage.getGroupById(newGroupDto.id);
      expect(result).toEqual(newGroupDto);
      expect(collectionDto.length).toEqual(11);
    });

    it("throws error when parameter is not a GroupEntity.", async() => {
      expect.assertions(2);
      const collectionDto = defaultGroupsDtos();
      browser.storage.local.set({[storage.storageKey]: collectionDto});

      await expect(storage.addGroup()).rejects.toThrow(
        TypeError('The parameter `groupEntity` should be of type GroupEntity.')
      );
      await expect(storage.addGroup({})).rejects.toThrow(
        TypeError('The parameter `groupEntity` should be of type GroupEntity.')
      );
    });
  });

  describe("::updateGroup", () => {
    it("updates a group in local storage.", async() => {
      expect.assertions(3);
      const collectionDto = defaultGroupsDtos();
      const firstGroupDto = collectionDto[0];
      const secondGroupDto = collectionDto[2];

      // Insert groups in local storage
      browser.storage.local.set({[storage.storageKey]: collectionDto});
      let result = await storage.getGroupById(firstGroupDto.id);
      // Verify that the first group is present
      expect(result).toEqual(firstGroupDto);
      // Modify the first group name and insert
      firstGroupDto.name = "Name modified";
      const groupEntity = new GroupEntity(firstGroupDto);
      await storage.updateGroup(groupEntity);
      // Fetch first group again and verify that the modified named is present
      result = await storage.getGroupById(firstGroupDto.id);
      expect(result.name).toEqual("Name modified");
      // Ensure the second group hasn't been modified
      result = await storage.getGroupById(secondGroupDto.id);
      expect(result).toEqual(secondGroupDto);
    });

    it("throws error when updating a group not in local storage.", async() => {
      const collectionDto = defaultGroupsDtos();
      const unknownGroupDto = defaultGroupDto();
      expect.assertions(1);

      // Insert groups in local storage
      browser.storage.local.set({[storage.storageKey]: collectionDto});
      const groupEntity = new GroupEntity(unknownGroupDto);
      await expect(storage.updateGroup(groupEntity)).rejects.toThrow(
        TypeError('The group could not be found in the local storage')
      );
    });

    it("throws error when the groupEntity parameter not defined or not a GroupEntity.", async() => {
      expect.assertions(2);

      const collectionDto = defaultGroupsDtos();
      // Insert groups in local storage
      browser.storage.local.set({[storage.storageKey]: collectionDto});
      await expect(storage.updateGroup()).rejects.toThrow(
        TypeError('The parameter `groupEntity` should be of type GroupEntity.')
      );
      await expect(storage.updateGroup({})).rejects.toThrow(
        TypeError('The parameter `groupEntity` should be of type GroupEntity.')
      );
    });
  });

  describe("::delete", () => {
    it("deletes a group from local storage.", async() => {
      const collectionDto = defaultGroupsDtos();
      const firstGroupDto = collectionDto[0];
      const secondGroupDto = collectionDto[2];
      expect.assertions(5);

      // Insert groups in local storage
      browser.storage.local.set({[storage.storageKey]: collectionDto});
      let result = await storage.getGroupById(firstGroupDto.id);
      // Verify that the first group is present
      expect(result).toEqual(firstGroupDto);
      expect(collectionDto.length).toEqual(10);

      // Delete the first group
      await storage.delete(firstGroupDto.id);
      // Fetch first group again and verify that the modified named is present
      result = await storage.getGroupById(firstGroupDto.id);
      expect(result).toBeUndefined();
      expect(collectionDto.length).toEqual(9);
      // Ensure the second group hasn't been modified
      result = await storage.getGroupById(secondGroupDto.id);
      expect(result).toEqual(secondGroupDto);
    });
  });

  describe("::assertEntityBeforeSave", () => {
    it("doesn't throw an error if the entity is a GroupEntity.", async() => {
      expect.assertions(1);
      const groupDto = defaultGroupDto();
      const groupEntity = new GroupEntity(groupDto);

      expect(() => GroupLocalStorage.assertEntityBeforeSave(groupEntity)).not.toThrow(Error);
    });

    it("throws an error if the entity is not set.", async() => {
      expect.assertions(1);
      expect(() => GroupLocalStorage.assertEntityBeforeSave()).toThrow(TypeError('GroupLocalStorage expects a GroupEntity to be set'));
    });

    it("throws an error if the entity is not a GroupEntity.", async() => {
      expect.assertions(1);
      expect(() => GroupLocalStorage.assertEntityBeforeSave({})).toThrow(TypeError('GroupLocalStorage expects an object of type GroupEntity'));
    });

    it("throws an error if the entity id is not set.", async() => {
      expect.assertions(2);
      const groupDto = defaultGroupDto();
      const groupEntity = new GroupEntity(groupDto);
      groupEntity._props.id = "";
      expect(() => GroupLocalStorage.assertEntityBeforeSave(groupEntity)).toThrow(TypeError('GroupLocalStorage expects GroupEntity id to be set'));
      groupEntity._props.id = null;
      expect(() => GroupLocalStorage.assertEntityBeforeSave(groupEntity)).toThrow(TypeError('GroupLocalStorage expects GroupEntity id to be set'));
    });
  });
});
