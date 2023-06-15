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

import browser from "../../sdk/polyfill/browserPolyfill";
import UserMeSessionStorageService from "./userMeSessionStorageService";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import UserEntity from "../../model/entity/user/userEntity";
import ProfileEntity from "../../model/entity/profile/profileEntity";

describe("UserMeSessionStorageService", () => {
  beforeEach(async() => {
    await browser.storage.session.clear();
  });

  describe("UserMeSessionStorageService::get", () => {
    it('should return null if there is no data in the storage', async() => {
      expect.assertions(1);
      const account = new AccountEntity(defaultAccountDto());
      const cachedUser = await UserMeSessionStorageService.get(account);
      expect(cachedUser).toBeNull();
    });

    it('should return the user in cache associated to the passed account if one in cache', async() => {
      expect.assertions(4);
      const account = new AccountEntity(defaultAccountDto());
      const user = new UserEntity(defaultUserDto());
      await UserMeSessionStorageService.set(account, user);

      const cachedUser = await UserMeSessionStorageService.get(account);
      expect(cachedUser).not.toBeNull();
      expect(cachedUser).toBeInstanceOf(UserEntity);
      expect(cachedUser.id).toEqual(user.id);
      expect(cachedUser.profile).toBeInstanceOf(ProfileEntity);
    });

    it('should return null if trying to access the cache of another account', async() => {
      expect.assertions(1);
      const otherAccount = new AccountEntity(defaultAccountDto());

      const account = new AccountEntity(defaultAccountDto());
      const user = new UserEntity(defaultUserDto());
      await UserMeSessionStorageService.set(account, user);

      const cachedUserOtherAccount = await UserMeSessionStorageService.get(otherAccount);
      expect(cachedUserOtherAccount).toBeNull();
    });

    it('should return the cached user for the given account even if there are other cached users for other accounts', async() => {
      expect.assertions(2);
      const otherAccount = new AccountEntity(defaultAccountDto());
      const userOtherAccount = new UserEntity(defaultUserDto());
      await UserMeSessionStorageService.set(otherAccount, userOtherAccount);

      const account = new AccountEntity(defaultAccountDto());
      const user = new UserEntity(defaultUserDto());
      await UserMeSessionStorageService.set(account, user);

      const cachedUser = await UserMeSessionStorageService.get(account);
      expect(cachedUser).not.toBeNull();
      expect(cachedUser.id).toEqual(user.id);
    });
  });

  describe("UserMeSessionStorageService::set", () => {
    it('should override an existing cached user if one already present', async() => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const user = new UserEntity(defaultUserDto());
      await UserMeSessionStorageService.set(account, user);
      await UserMeSessionStorageService.set(account, user);

      expect(Object.keys(await browser.storage.session.get()).length).toEqual(1);
      const cachedUser = await UserMeSessionStorageService.get(account);
      expect(cachedUser).not.toBeNull();
      expect(cachedUser.id).toEqual(user.id);
    });
  });

  describe("UserMeSessionStorageService::remove", () => {
    it('should not crash if nothing to remove', async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      await UserMeSessionStorageService.remove(account);
      expect(true).toBeTruthy();
    });

    it('should remove a cached user', async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const user = new UserEntity(defaultUserDto());
      await UserMeSessionStorageService.set(account, user);

      await UserMeSessionStorageService.remove(account);

      expect(Object.keys(await browser.storage.session.get()).length).toEqual(0);
    });

    it('should not remove another cached user if there is none for the given account', async() => {
      expect.assertions(1);

      const otherAccount = new AccountEntity(defaultAccountDto());
      const userOtherAccount = new UserEntity(defaultUserDto());
      await UserMeSessionStorageService.set(otherAccount, userOtherAccount);

      const account = new AccountEntity(defaultAccountDto());

      await UserMeSessionStorageService.remove(account);

      expect(Object.keys(await browser.storage.session.get()).length).toEqual(1);
    });

    it('should not remove another cached user if there is a cached user for the given account', async() => {
      expect.assertions(3);

      const otherAccount = new AccountEntity(defaultAccountDto());
      const userOtherAccount = new UserEntity(defaultUserDto());
      await UserMeSessionStorageService.set(otherAccount, userOtherAccount);

      const account = new AccountEntity(defaultAccountDto());
      const user = new UserEntity(defaultUserDto());
      await UserMeSessionStorageService.set(account, user);

      await UserMeSessionStorageService.remove(account);

      expect(Object.keys(await browser.storage.session.get()).length).toEqual(1);
      const cachedUserOtherAccount = await UserMeSessionStorageService.get(otherAccount);
      expect(cachedUserOtherAccount).not.toBeNull();
      expect(cachedUserOtherAccount.id).toEqual(userOtherAccount.id);
    });
  });
});
