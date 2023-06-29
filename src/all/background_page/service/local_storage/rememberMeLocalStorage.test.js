/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.1.0
 */
import browser from "../../sdk/polyfill/browserPolyfill";
import GetLegacyAccountService from "../account/getLegacyAccountService";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import RememberMeLocalStorage from "./rememberMeLocalStorage";

describe("RememberMeLocalStorage", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());
  // spy on
  jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);

  describe("rememberMeLocalStorage::get", () => {
    it("Should return false if nothing stored in the storage", async() => {
      expect.assertions(1);
      const storage = new RememberMeLocalStorage(account);
      const result = await storage.get();
      expect(result).toStrictEqual(false);
    });

    it("Should return content stored in the local storage", async() => {
      expect.assertions(2);
      let rememberMeOption = true;
      const storage = new RememberMeLocalStorage(account);
      browser.storage.local.set({[storage.storageKey]: rememberMeOption});
      expect(await storage.get()).toEqual(rememberMeOption);

      rememberMeOption = false;
      browser.storage.local.set({[storage.storageKey]: rememberMeOption});
      expect(await storage.get()).toEqual(rememberMeOption);
    });
  });

  describe("RememberMeLocalStorage::set", () => {
    it("Should set the rememberMe choice in the local storage", async() => {
      expect.assertions(2);
      let rememberMeOption = true;
      const storage = new RememberMeLocalStorage(account);
      await storage.set(rememberMeOption);
      expect(await storage.get()).toStrictEqual(rememberMeOption);

      rememberMeOption = false;
      await storage.set(rememberMeOption);
      expect(await storage.get()).toStrictEqual(rememberMeOption);
    });
  });

  describe("RememberMeLocalStorage::flush", () => {
    it("Should flush all the rememberMe option from the local storage", async() => {
      expect.assertions(1);
      const storage = new RememberMeLocalStorage(account);
      await storage.set(true);
      await storage.flush();
      expect(await storage.get()).toStrictEqual(false);
    });
  });
});
