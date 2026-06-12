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
 * @since         4.1.0
 */

import UserMeLocalStorage from "./userMeLocalStorage";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultUserDto } from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import UserEntity from "../../model/entity/user/userEntity";
import ProfileEntity from "passbolt-styleguide/src/shared/models/entity/profile/profileEntity";
import { v4 as uuidv4 } from "uuid";
import browser from "../../../common/polyfill/browserPolyfill";

describe("UserMeLocalStorage", () => {
  beforeEach(async () => {
    await browser.storage.local.clear();
  });

  describe("UserMeLocalStorage::get", () => {
    it("should return null if there is no data in the storage", async () => {
      expect.assertions(1);
      const account = new AccountEntity(defaultAccountDto());
      const userMeLocalStorage = new UserMeLocalStorage(account);
      const cachedUser = await userMeLocalStorage.getData();
      expect(cachedUser).toBeUndefined();
    });

    it("should return the user in cache associated to the passed account if one in cache", async () => {
      expect.assertions(4);
      const account = new AccountEntity(defaultAccountDto());
      const user = new UserEntity(defaultUserDto());
      const userMeLocalStorage = new UserMeLocalStorage(account);
      await userMeLocalStorage.setData(user);

      const cachedUser = new UserEntity(await userMeLocalStorage.getData());
      expect(cachedUser).not.toBeNull();
      expect(cachedUser).toBeInstanceOf(UserEntity);
      expect(cachedUser.id).toEqual(user.id);
      expect(cachedUser.profile).toBeInstanceOf(ProfileEntity);
      await userMeLocalStorage.flush();
    });

    it("should return null if trying to access the cache of another account", async () => {
      expect.assertions(1);
      const otherAccount = new AccountEntity(defaultAccountDto());

      const account = new AccountEntity(
        defaultAccountDto({
          user_id: uuidv4(),
        }),
      );

      const userMeLocalStorage = new UserMeLocalStorage(account);
      const userMeLocalStorageOtherAccount = new UserMeLocalStorage(otherAccount);
      const user = new UserEntity(defaultUserDto());
      await userMeLocalStorage.setData(user);

      const cachedUserOtherAccount = await userMeLocalStorageOtherAccount.getData();
      expect(cachedUserOtherAccount).toBeUndefined();
    });

    it("should return the cached user for the given account even if there are other cached users for other accounts", async () => {
      expect.assertions(2);
      const otherAccount = new AccountEntity(defaultAccountDto());
      const userOtherAccount = new UserEntity(defaultUserDto());
      const userMeLocalStorageOtherAccount = new UserMeLocalStorage(otherAccount);
      await userMeLocalStorageOtherAccount.setData(userOtherAccount);

      const account = new AccountEntity(defaultAccountDto());
      const user = new UserEntity(defaultUserDto());
      const userMeLocalStorage = new UserMeLocalStorage(account);
      await userMeLocalStorage.setData(user);

      const cachedUser = await userMeLocalStorage.getData();
      expect(cachedUser).not.toBeNull();
      expect(cachedUser.id).toEqual(user.id);
    });
  });

  describe("UserMeLocalStorage::set", () => {
    it("should override an existing cached user if one already present", async () => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const user = new UserEntity(defaultUserDto());
      const userMeLocalStorage = new UserMeLocalStorage(account);
      await userMeLocalStorage.setData(user);
      await userMeLocalStorage.setData(user);

      // One for data and another one for metadata
      expect(Object.keys(await browser.storage.local.get()).length).toEqual(2);
      const cachedUser = await userMeLocalStorage.getData();
      expect(cachedUser).not.toBeNull();
      expect(cachedUser.id).toEqual(user.id);
    });
  });

  describe("UserMeLocalStorage::flush", () => {
    it("should not crash if nothing to flush", async () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const userMeLocalStorage = new UserMeLocalStorage(account);
      await userMeLocalStorage.flush();
      const cachedUser = await userMeLocalStorage.getData();
      expect(cachedUser).toBeUndefined();
    });

    it("should flush a cached user", async () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const user = new UserEntity(defaultUserDto());
      const userMeLocalStorage = new UserMeLocalStorage(account);
      await userMeLocalStorage.setData(user);

      await userMeLocalStorage.flush();

      expect(Object.keys(await browser.storage.local.get()).length).toEqual(0);
    });

    it("should not remove another cached user if there is none for the given account", async () => {
      expect.assertions(1);

      const otherAccount = new AccountEntity(
        defaultAccountDto({
          user_id: uuidv4(),
        }),
      );
      const userOtherAccount = new UserEntity(defaultUserDto());
      const userMeLocalStorageOtherAccount = new UserMeLocalStorage(otherAccount);
      await userMeLocalStorageOtherAccount.setData(userOtherAccount);

      const account = new AccountEntity(defaultAccountDto());
      const userMeLocalStorage = new UserMeLocalStorage(account);
      await userMeLocalStorage.flush();

      // One for data and another one for metadata
      expect(Object.keys(await browser.storage.local.get()).length).toEqual(2);
    });

    it("should not remove another cached user if there is a cached user for the given account", async () => {
      expect.assertions(3);

      const otherAccount = new AccountEntity(
        defaultAccountDto({
          user_id: uuidv4(),
        }),
      );
      const userOtherAccount = new UserEntity(defaultUserDto());
      const userMeLocalStorageOtherAccount = new UserMeLocalStorage(otherAccount);
      await userMeLocalStorageOtherAccount.setData(userOtherAccount);

      const account = new AccountEntity(defaultAccountDto());
      const user = new UserEntity(defaultUserDto());
      const userMeLocalStorage = new UserMeLocalStorage(account);
      await userMeLocalStorage.setData(user);

      await userMeLocalStorage.flush();

      // One for data and another one for metadata
      expect(Object.keys(await browser.storage.local.get()).length).toEqual(2);
      const cachedUserOtherAccount = await userMeLocalStorageOtherAccount.getData();
      expect(cachedUserOtherAccount).not.toBeNull();
      expect(cachedUserOtherAccount.id).toEqual(userOtherAccount.id);
    });
  });
});
