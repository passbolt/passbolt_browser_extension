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
import RbacLocalStorage from "./rbacLocalStorage";
import {defaultRbacWithUiActionData} from "passbolt-styleguide/src/shared/models/entity/rbac/rbacEntity.test.data";
import RbacEntity from "passbolt-styleguide/src/shared/models/entity/rbac/rbacEntity";
import RbacsCollection from "passbolt-styleguide/src/shared/models/entity/rbac/rbacsCollection";
import browser from "../../sdk/polyfill/browserPolyfill";
import GetLegacyAccountService from "../account/getLegacyAccountService";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";

describe("RbacLocalStorage", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());
  // spy on
  jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);

  describe("RbacLocalStorage::get", () => {
    it("Should return undefined if nothing stored in the storage", async() => {
      expect.assertions(1);
      const rbacLocalstorage = new RbacLocalStorage(account);
      const result = await rbacLocalstorage.get();
      expect(result).toEqual(undefined);
    });

    it("Should return content stored in the local storage", async() => {
      const rbacs = [defaultRbacWithUiActionData()];
      expect.assertions(1);
      const rbacLocalstorage = new RbacLocalStorage(account);
      browser.storage.local.set({[rbacLocalstorage.storageKey]: rbacs});
      const result = await rbacLocalstorage.get();
      expect(result).toEqual(rbacs);
    });
  });

  describe("RbacLocalStorage::set", () => {
    it("Should set a rbac colection in the local storage", async() => {
      expect.assertions(2);
      const rbacLocalstorage = new RbacLocalStorage(account);
      const rbac = new RbacEntity(defaultRbacWithUiActionData());
      const rbacsCollection = new RbacsCollection([rbac]);
      await rbacLocalstorage.set(rbacsCollection);
      const rbacs = await rbacLocalstorage.get();
      expect(rbacs).toHaveLength(1);
      expect(rbacs[0]).toEqual(rbac.toDto(RbacEntity.ALL_CONTAIN_OPTIONS));
    });
  });

  describe("RbacLocalStorage::flush", () => {
    it("Should flush all the rbac from the local storage", async() => {
      expect.assertions(1);
      const rbacLocalstorage = new RbacLocalStorage(account);
      await rbacLocalstorage.flush();
      const rbacs = await rbacLocalstorage.get();
      expect(rbacs).toEqual(undefined);
    });
  });
});
