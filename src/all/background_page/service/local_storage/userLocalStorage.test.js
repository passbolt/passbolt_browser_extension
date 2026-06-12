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
 * @since         5.13.0
 */
import { defaultUserDto } from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import { defaultUsersDtos } from "passbolt-styleguide/src/shared/models/entity/user/usersCollection.test.data";
import UsersCollection from "passbolt-styleguide/src/shared/models/entity/user/usersCollection";
import UserEntity from "../../model/entity/user/userEntity";
import UserLocalStorage from "./userLocalStorage";

beforeEach(async () => {
  jest.clearAllMocks();
  await UserLocalStorage.flush();
});

describe("UserLocalStorage", () => {
  describe("::hasCachedData", () => {
    it("should return false if there is no cached data", () => {
      expect.assertions(1);
      UserLocalStorage._runtimeCachedData = null;
      expect(UserLocalStorage.hasCachedData()).toBe(false);
    });

    it("should return false if the cached data is undefined", () => {
      expect.assertions(1);
      UserLocalStorage._runtimeCachedData = undefined;
      expect(UserLocalStorage.hasCachedData()).toBe(false);
    });

    it("should return true if there is cached data", () => {
      expect.assertions(1);
      UserLocalStorage._runtimeCachedData = [defaultUserDto()];
      expect(UserLocalStorage.hasCachedData()).toBe(true);
    });
  });

  describe("::flush", () => {
    it("flushes works with not initialized local storage.", async () => {
      expect.assertions(2);
      await UserLocalStorage.flush();
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[UserLocalStorage.USER_LOCAL_STORAGE_KEY]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(UserLocalStorage._runtimeCachedData).toBeNull();
    });

    it("flushes local storage's content.", async () => {
      expect.assertions(2);
      const dtos = defaultUsersDtos();
      const collection = new UsersCollection(dtos);
      await UserLocalStorage.set(collection);
      await UserLocalStorage.flush();
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[UserLocalStorage.USER_LOCAL_STORAGE_KEY]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(UserLocalStorage._runtimeCachedData).toBeNull();
    });
  });

  describe("::get", () => {
    it("returns undefined if nothing is stored in the local storage.", async () => {
      expect.assertions(1);
      const result = await UserLocalStorage.get();
      expect(result).toBeUndefined();
    });

    it("returns content stored in the local storage.", async () => {
      expect.assertions(1);
      const collectionDto = defaultUsersDtos();
      browser.storage.local.set({ [UserLocalStorage.USER_LOCAL_STORAGE_KEY]: collectionDto });
      const result = await UserLocalStorage.get();
      expect(result).toEqual(collectionDto);
    });

    it("returns content stored in the runtime cache.", async () => {
      expect.assertions(2);
      const collectionDto = defaultUsersDtos();
      // Force the runtime cache, to ensure it is hit even if the local storage is empty.
      UserLocalStorage._runtimeCachedData = collectionDto;
      const result = await UserLocalStorage.get();
      expect(result).toEqual(collectionDto);
      // Control the local storage was well empty.
      expect(browser.storage.local.store[UserLocalStorage.USER_LOCAL_STORAGE_KEY]).toBeUndefined();
    });
  });

  describe("::set", () => {
    it("stores content in the local storage.", async () => {
      expect.assertions(3);
      const dtos = defaultUsersDtos();
      const collection = new UsersCollection(dtos);
      await UserLocalStorage.set(collection);
      // Expect the local storage (mocked here) to be set.
      expect(browser.storage.local.store[UserLocalStorage.USER_LOCAL_STORAGE_KEY]).toBeDefined();
      // Expect the runtime cache to be set.
      expect(UserLocalStorage._runtimeCachedData).toBeDefined();
      // Expect the get to retrieve the set data.
      const resultGet = await UserLocalStorage.get();
      expect(resultGet).toHaveLength(dtos.length);
    });

    it("throws error if no data is given to store.", async () => {
      expect.assertions(3);
      await expect(() => UserLocalStorage.set()).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[UserLocalStorage.USER_LOCAL_STORAGE_KEY]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(UserLocalStorage._runtimeCachedData).toBeNull();
    });

    it("throws error if invalid data is given to store.", async () => {
      expect.assertions(3);
      await expect(() => UserLocalStorage.set({})).rejects.toThrow(TypeError);
      // Expect the local storage (mocked here) to not be set.
      expect(browser.storage.local.store[UserLocalStorage.USER_LOCAL_STORAGE_KEY]).toBeUndefined();
      // Expect the runtime cache to not be set.
      expect(UserLocalStorage._runtimeCachedData).toBeNull();
    });
  });

  describe("::getUserById", () => {
    it("returns a user by its id.", async () => {
      expect.assertions(1);
      const collectionDto = defaultUsersDtos();
      const firstUserDto = collectionDto[0];
      browser.storage.local.set({ [UserLocalStorage.USER_LOCAL_STORAGE_KEY]: collectionDto });
      const result = await UserLocalStorage.getUserById(firstUserDto.id);
      expect(result).toEqual(firstUserDto);
    });
  });

  describe("::addUser", () => {
    it("adds a user to local storage.", async () => {
      expect.assertions(2);
      const collectionDto = defaultUsersDtos();
      browser.storage.local.set({ [UserLocalStorage.USER_LOCAL_STORAGE_KEY]: collectionDto });

      const newUserDto = defaultUserDto();
      const newUserEntity = new UserEntity(newUserDto);
      await UserLocalStorage.addUser(newUserEntity);
      const result = await UserLocalStorage.getUserById(newUserDto.id);
      expect(result).toBeDefined();
      expect(collectionDto.length).toEqual(11);
    });

    it("throws error when parameter is not a UserEntity.", async () => {
      expect.assertions(2);
      const collectionDto = defaultUsersDtos();
      browser.storage.local.set({ [UserLocalStorage.USER_LOCAL_STORAGE_KEY]: collectionDto });

      await expect(UserLocalStorage.addUser()).rejects.toThrow("UserLocalStorage expects an object of type UserEntity");
      await expect(UserLocalStorage.addUser({})).rejects.toThrow(
        "UserLocalStorage expects an object of type UserEntity",
      );
    });
  });

  describe("::updateUser", () => {
    it("updates a user in local storage.", async () => {
      expect.assertions(3);
      const collectionDto = defaultUsersDtos();
      const firstUserDto = collectionDto[0];
      const secondUserDto = collectionDto[2];

      browser.storage.local.set({ [UserLocalStorage.USER_LOCAL_STORAGE_KEY]: collectionDto });
      let result = await UserLocalStorage.getUserById(firstUserDto.id);
      expect(result).toEqual(firstUserDto);

      // Modify the first user username and update
      firstUserDto.username = "modified@passbolt.com";
      const userEntity = new UserEntity(firstUserDto);
      await UserLocalStorage.updateUser(userEntity);

      result = await UserLocalStorage.getUserById(firstUserDto.id);
      expect(result.username).toEqual("modified@passbolt.com");

      // Ensure the second user hasn't been modified
      result = await UserLocalStorage.getUserById(secondUserDto.id);
      expect(result).toEqual(secondUserDto);
    });

    it("throws error when updating a user not in local storage.", async () => {
      expect.assertions(1);
      const collectionDto = defaultUsersDtos();
      const unknownUserDto = defaultUserDto();

      browser.storage.local.set({ [UserLocalStorage.USER_LOCAL_STORAGE_KEY]: collectionDto });
      const userEntity = new UserEntity(unknownUserDto);
      await expect(UserLocalStorage.updateUser(userEntity)).rejects.toThrow(
        "The user could not be found in the local storage",
      );
    });

    it("throws error when the userEntity parameter is not defined or not a UserEntity.", async () => {
      expect.assertions(2);
      const collectionDto = defaultUsersDtos();
      browser.storage.local.set({ [UserLocalStorage.USER_LOCAL_STORAGE_KEY]: collectionDto });

      await expect(UserLocalStorage.updateUser()).rejects.toThrow(
        "UserLocalStorage expects an object of type UserEntity",
      );
      await expect(UserLocalStorage.updateUser({})).rejects.toThrow(
        "UserLocalStorage expects an object of type UserEntity",
      );
    });
  });

  describe("::delete", () => {
    it("deletes a user from local storage.", async () => {
      expect.assertions(5);
      const collectionDto = defaultUsersDtos();
      const firstUserDto = collectionDto[0];
      const secondUserDto = collectionDto[2];

      browser.storage.local.set({ [UserLocalStorage.USER_LOCAL_STORAGE_KEY]: collectionDto });
      let result = await UserLocalStorage.getUserById(firstUserDto.id);
      expect(result).toEqual(firstUserDto);
      expect(collectionDto.length).toEqual(10);

      await UserLocalStorage.delete(firstUserDto.id);
      result = await UserLocalStorage.getUserById(firstUserDto.id);
      expect(result).toBeUndefined();
      expect(collectionDto.length).toEqual(9);

      // Ensure the second user hasn't been modified
      result = await UserLocalStorage.getUserById(secondUserDto.id);
      expect(result).toEqual(secondUserDto);
    });
  });

  describe("::assertEntityBeforeSave", () => {
    it("doesn't throw an error if the entity is a valid UserEntity.", () => {
      expect.assertions(1);
      const userDto = defaultUserDto();
      const userEntity = new UserEntity(userDto);
      expect(() => UserLocalStorage.assertEntityBeforeSave(userEntity)).not.toThrow();
    });

    it("throws an error if the entity is not set.", () => {
      expect.assertions(1);
      expect(() => UserLocalStorage.assertEntityBeforeSave()).toThrow(
        "UserLocalStorage expects a UserEntity to be set",
      );
    });

    it("throws an error if the entity is not a UserEntity.", () => {
      expect.assertions(1);
      expect(() => UserLocalStorage.assertEntityBeforeSave({})).toThrow(
        "UserLocalStorage expects an object of type UserEntity",
      );
    });

    it("throws an error if the entity id is not set.", () => {
      expect.assertions(1);
      const userDto = defaultUserDto();
      const userEntity = new UserEntity(userDto);
      userEntity._props.id = null;
      expect(() => UserLocalStorage.assertEntityBeforeSave(userEntity)).toThrow(
        "UserLocalStorage expects UserEntity id to be set",
      );
    });

    it("throws an error if the entity profile is not set.", () => {
      expect.assertions(1);
      const userDto = defaultUserDto();
      const userEntity = new UserEntity(userDto);
      delete userEntity._profile;
      expect(() => UserLocalStorage.assertEntityBeforeSave(userEntity)).toThrow(
        "UserLocalStorage::set expects UserEntity profile to be set",
      );
    });
  });
});
