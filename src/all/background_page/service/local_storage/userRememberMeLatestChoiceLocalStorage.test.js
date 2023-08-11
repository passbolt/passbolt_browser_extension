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
 * @since         4.2.0
 */
import browser from "../../sdk/polyfill/browserPolyfill";
import GetLegacyAccountService from "../account/getLegacyAccountService";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import UserRememberMeLatestChoiceLocalStorage from "./userRememberMeLatestChoiceLocalStorage";
import UserRememberMeLatestChoiceEntity from "../../model/entity/rememberMe/userRememberMeLatestChoiceEntity";

describe("UserRememberMeLatestChoiceLocalStorage", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());
  // spy on
  jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);

  describe("rememberMeLocalStorage::get", () => {
    it("Should return false if nothing stored in the storage", async() => {
      expect.assertions(1);
      const storage = new UserRememberMeLatestChoiceLocalStorage(account);
      const result = await storage.get();
      expect(result).toStrictEqual(null);
    });

    it("Should return the content stored in the local storage", async() => {
      expect.assertions(1);
      const storage = new UserRememberMeLatestChoiceLocalStorage(account);
      const entity = new UserRememberMeLatestChoiceEntity({duration: 3600});
      browser.storage.local.set({[storage.storageKey]: entity.toDto()});
      expect(await storage.get()).toEqual(entity);
    });

    it("Should return null if the entity cannot be validated", async() => {
      expect.assertions(1);
      const storage = new UserRememberMeLatestChoiceLocalStorage(account);
      browser.storage.local.set({[storage.storageKey]: "garbage"});
      expect(await storage.get()).toEqual(null);
    });
  });

  describe("UserRememberMeLatestChoiceLocalStorage::set", () => {
    it("Should set the rememberMe choice in the local storage", async() => {
      expect.assertions(2);
      const storage = new UserRememberMeLatestChoiceLocalStorage(account);
      const entity1 = new UserRememberMeLatestChoiceEntity({duration: -1});
      await storage.set(entity1);
      expect(await storage.get()).toStrictEqual(entity1);

      const entity2 = new UserRememberMeLatestChoiceEntity({duration: 500});
      await storage.set(entity2);
      expect(await storage.get()).toStrictEqual(entity2);
    });
  });

  describe("UserRememberMeLatestChoiceLocalStorage::flush", () => {
    it("Should flush all the rememberMe option from the local storage", async() => {
      expect.assertions(1);
      const storage = new UserRememberMeLatestChoiceLocalStorage(account);
      const entity = new UserRememberMeLatestChoiceEntity({duration: -1});
      await storage.set(entity);
      await storage.flush();
      expect(await storage.get()).toStrictEqual(null);
    });
  });
});
