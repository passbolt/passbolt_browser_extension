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
 * @since         4.6.0
 */
import {defaultPassboltData} from "../../controller/dataConfig/passboltData.test.data";
import browser from "../../sdk/polyfill/browserPolyfill";
import PassboltDataLocalStorage from "./passboltDataLocalStorage";

describe("PassboltDataLocalStorage", () => {
  describe("::get", () => {
    it("Should return null if nothing stored in the storage", async() => {
      expect.assertions(1);
      const storage = new PassboltDataLocalStorage();
      const result = await storage.get();
      expect(result).toStrictEqual(null);
    });

    it("Should return the content stored in the local storage", async() => {
      expect.assertions(1);
      const storage = new PassboltDataLocalStorage();
      const dto = defaultPassboltData();
      browser.storage.local.set({[storage.storageKey]: dto});
      expect(await storage.get()).toEqual(dto);
    });
  });

  describe("PasswordExpirySettingsLocalStorage::set", () => {
    it("Should set the password expiry settings in the local storage", async() => {
      expect.assertions(2);
      const storage = new PassboltDataLocalStorage();
      const dto = defaultPassboltData();
      await storage.set(dto);
      expect(await storage.get()).toStrictEqual(dto);

      const dto2 = defaultPassboltData({other: {data: "other random data"}});
      await storage.set(dto2);
      expect(await storage.get()).toStrictEqual(dto2);
    });
  });

  describe("PasswordExpirySettingsLocalStorage::flush", () => {
    it("Should flush the password expiry settings from the local storage", async() => {
      expect.assertions(1);
      const storage = new PassboltDataLocalStorage();
      const dto = defaultPassboltData();
      await storage.set(dto);
      await storage.flush();
      expect(await storage.get()).toStrictEqual(null);
    });
  });
});
