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
 * @since         4.5.0
 */
import GetLegacyAccountService from "../account/getLegacyAccountService";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import PasswordExpirySettingsLocalStorage from "./passwordExpirySettingsLocalStorage";
import {defaultPasswordExpirySettingsDtoFromApi} from "passbolt-styleguide/src/shared/models/entity/passwordExpiry/passwordExpirySettingsEntity.test.data";
import PasswordExpirySettingsEntity from "passbolt-styleguide/src/shared/models/entity/passwordExpiry/passwordExpirySettingsEntity";

describe("PasswordExpirySettingsLocalStorage", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());
  // spy on
  jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);

  describe("PasswordExpirySettingsLocalStorage::get", () => {
    it("Should return undefined if nothing stored in the storage", async() => {
      expect.assertions(1);
      const storage = new PasswordExpirySettingsLocalStorage(account);
      const result = await storage.get();
      expect(result).toStrictEqual(undefined);
    });

    it("Should return the content stored in the local storage", async() => {
      expect.assertions(1);
      const storage = new PasswordExpirySettingsLocalStorage(account);
      const dto = defaultPasswordExpirySettingsDtoFromApi();
      const entity = new PasswordExpirySettingsEntity(dto);
      browser.storage.local.set({[storage.storageKey]: entity.toDto()});
      expect(await storage.get()).toEqual(entity.toDto());
    });
  });

  describe("PasswordExpirySettingsLocalStorage::set", () => {
    it("Should set the password expiry settings in the local storage", async() => {
      expect.assertions(2);
      const storage = new PasswordExpirySettingsLocalStorage(account);
      const dto = defaultPasswordExpirySettingsDtoFromApi();
      const entity = new PasswordExpirySettingsEntity(dto);
      await storage.set(entity.toDto());
      expect(await storage.get()).toStrictEqual(entity.toDto());

      const dto2 = defaultPasswordExpirySettingsDtoFromApi({policy_override: true});
      const entity2 = new PasswordExpirySettingsEntity(dto2);
      await storage.set(entity2.toDto());
      expect(await storage.get()).toStrictEqual(entity2.toDto());
    });
  });

  describe("PasswordExpirySettingsLocalStorage::flush", () => {
    it("Should flush the password expiry settings from the local storage", async() => {
      expect.assertions(1);
      const storage = new PasswordExpirySettingsLocalStorage(account);
      const dto = defaultPasswordExpirySettingsDtoFromApi();
      const entity = new PasswordExpirySettingsEntity(dto);
      await storage.set(entity.toDto());
      await storage.flush();
      expect(await storage.get()).toStrictEqual(undefined);
    });
  });
});
