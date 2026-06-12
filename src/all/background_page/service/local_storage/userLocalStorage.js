/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.13.0
 */
import Log from "../../model/log";
import UserEntity from "passbolt-styleguide/src/shared/models/entity/user/userEntity";
import UsersCollection from "passbolt-styleguide/src/shared/models/entity/user/usersCollection";

const USER_LOCAL_STORAGE_KEY = "users";

class UserLocalStorage {
  /**
   * Runtime cached data.
   * @type {Array|null}
   * @private
   */
  static _runtimeCachedData = null;

  /**
   * Check if there is cached data.
   * @returns {boolean}
   */
  static hasCachedData() {
    return UserLocalStorage._runtimeCachedData !== null && UserLocalStorage._runtimeCachedData !== undefined;
  }

  /**
   * Flush the users local storage
   *
   * @throws {Error} if operation failed
   * @return {Promise<void>}
   */
  static async flush() {
    UserLocalStorage._runtimeCachedData = null;
    Log.write({ level: "debug", message: "UserLocalStorage flushed" });
    return await browser.storage.local.remove(UserLocalStorage.USER_LOCAL_STORAGE_KEY);
  }

  /**
   * Get the users from the local storage.
   *
   * @throws {Error} if operation failed
   * @return {Promise} results object, containing every object in keys that was found in the storage area.
   * If storage is not set, undefined will be returned.
   */
  static async get() {
    if (UserLocalStorage._runtimeCachedData) {
      return UserLocalStorage._runtimeCachedData;
    }
    const { users } = await browser.storage.local.get([UserLocalStorage.USER_LOCAL_STORAGE_KEY]);
    if (!users) {
      return undefined;
    }
    UserLocalStorage._runtimeCachedData = users;
    return UserLocalStorage._runtimeCachedData;
  }

  /**
   * Set the users local storage.
   *
   * @param {UsersCollection} usersCollection The users to insert in the local storage.
   * @return {Promise<void>}
   */
  static async set(usersCollection) {
    if (!(usersCollection instanceof UsersCollection)) {
      throw new TypeError("UserLocalStorage::set expects a UsersCollection");
    }

    await navigator.locks.request(USER_LOCAL_STORAGE_KEY, async () => {
      const users = [];
      for (const userEntity of usersCollection) {
        UserLocalStorage.assertEntityBeforeSave(userEntity);
        users.push(userEntity.toDto(UserLocalStorage.DEFAULT_CONTAIN));
      }
      await browser.storage.local.set({ users: users });
      UserLocalStorage._runtimeCachedData = users;
    });
  }

  /**
   * Get a user from the local storage by id
   *
   * @param {string} id The user id
   * @return {object} a user dto
   */
  static async getUserById(id) {
    const users = await UserLocalStorage.get();
    return users.find((item) => item.id === id);
  }

  /**
   * Add a user in the local storage
   * @param {UserEntity} userEntity
   * @throws {TypeError} If parameter userEntity is not of type UserEntity.
   */
  static async addUser(userEntity) {
    if (!userEntity || !(userEntity instanceof UserEntity)) {
      throw new TypeError("UserLocalStorage expects an object of type UserEntity");
    }

    await navigator.locks.request(USER_LOCAL_STORAGE_KEY, async () => {
      UserLocalStorage.assertEntityBeforeSave(userEntity);
      const users = await UserLocalStorage.get();
      users.push(userEntity.toDto(UserLocalStorage.DEFAULT_CONTAIN));
      await browser.storage.local.set({ users: users });
      UserLocalStorage._runtimeCachedData = users;
    });
  }

  /**
   * Update a user in the local storage.
   *
   * @param {UserEntity} userEntity The user to update
   * @throws {TypeError} If parameter userEntity is not of type UserEntity.
   * @throws {Error} if the user does not exist in the local storage
   */
  static async updateUser(userEntity) {
    if (!userEntity || !(userEntity instanceof UserEntity)) {
      throw new TypeError("UserLocalStorage expects an object of type UserEntity");
    }

    await navigator.locks.request(USER_LOCAL_STORAGE_KEY, async () => {
      UserLocalStorage.assertEntityBeforeSave(userEntity);
      const users = await UserLocalStorage.get();
      // If the local storage has been already initialized.
      if (users) {
        const userIndex = users.findIndex((item) => item.id === userEntity.id);
        if (userIndex === -1) {
          throw new Error("The user could not be found in the local storage");
        }
        users[userIndex] = Object.assign(users[userIndex], userEntity.toDto(UserLocalStorage.DEFAULT_CONTAIN));
        await browser.storage.local.set({ users: users });
        UserLocalStorage._runtimeCachedData = users;
      }
    });
  }

  /**
   * Delete users in the local storage by users ids.
   * @param {string} userId user uuid
   */
  static async delete(userId) {
    await navigator.locks.request(USER_LOCAL_STORAGE_KEY, async () => {
      const users = await UserLocalStorage.get();
      if (users) {
        const userIndex = users.findIndex((item) => item.id === userId);
        if (userIndex !== -1) {
          users.splice(userIndex, 1);
        }
        await browser.storage.local.set({ users: users });
        UserLocalStorage._runtimeCachedData = users;
      }
    });
  }

  /**
   * UserLocalStorage.DEFAULT_CONTAIN
   * Warning: To be used for entity serialization not service API contain!
   *
   * @returns {Object}
   * @private
   */
  static get DEFAULT_CONTAIN() {
    return { profile: { avatar: true }, pending_account_recovery_request: true, account_recovery_user_setting: true };
  }

  /**
   * UserLocalStorage.USER_LOCAL_STORAGE_KEY
   * @returns {string}
   * @constructor
   */
  static get USER_LOCAL_STORAGE_KEY() {
    return USER_LOCAL_STORAGE_KEY;
  }

  /**
   * Make sure the entity meet some minimal requirements before being stored
   *
   * @param {UserEntity} userEntity
   * @throw {TypeError} if requirements are not met
   * @private
   */
  static assertEntityBeforeSave(userEntity) {
    if (!userEntity) {
      throw new TypeError("UserLocalStorage expects a UserEntity to be set");
    }
    if (!(userEntity instanceof UserEntity)) {
      throw new TypeError("UserLocalStorage expects an object of type UserEntity");
    }
    if (!userEntity.id) {
      throw new TypeError("UserLocalStorage expects UserEntity id to be set");
    }
    if (!userEntity.profile) {
      throw new TypeError("UserLocalStorage::set expects UserEntity profile to be set");
    }
    if (!userEntity.profile.avatar) {
      throw new TypeError("UserLocalStorage::set expects UserEntity avatar to be set");
    }
  }
}

export default UserLocalStorage;
