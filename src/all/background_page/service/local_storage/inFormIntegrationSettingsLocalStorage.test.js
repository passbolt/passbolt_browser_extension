/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2024 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2024 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.7.0
 */
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import InFormIntegrationSettingsLocalStorage from "./inFormIntegrationSettingsLocalStorage";
import InFormIntegrationSettingsEntity from "../../model/entity/inFormIntegration/inFormIntegrationSettingsEntity";

describe("InFormIntegrationSettingsLocalStorage", () => {
  const account = new AccountEntity(defaultAccountDto());

  beforeEach(async () => {
    await browser.storage.local.clear();
  });

  describe("InFormIntegrationSettingsLocalStorage::constructor", () => {
    it("Should throw if the account has no id", () => {
      expect.assertions(1);
      expect(() => new InFormIntegrationSettingsLocalStorage({})).toThrow();
    });

    it("Should build a per-account storage key", () => {
      expect.assertions(1);
      const storage = new InFormIntegrationSettingsLocalStorage(account);
      expect(storage.storageKey).toStrictEqual(`inFormIntegrationSettings-${account.id}`);
    });
  });

  describe("InFormIntegrationSettingsLocalStorage::get", () => {
    it("Should return null if nothing is stored", async () => {
      expect.assertions(1);
      const storage = new InFormIntegrationSettingsLocalStorage(account);
      expect(await storage.get()).toBeNull();
    });

    it("Should return the entity stored in the local storage", async () => {
      expect.assertions(1);
      const storage = new InFormIntegrationSettingsLocalStorage(account);
      const entity = new InFormIntegrationSettingsEntity({ isInFormMenuEnabled: false });
      await browser.storage.local.set({ [storage.storageKey]: entity.toDto() });
      expect(await storage.get()).toEqual(entity);
    });

    it("Should return null if the stored value cannot be validated", async () => {
      expect.assertions(1);
      const storage = new InFormIntegrationSettingsLocalStorage(account);
      await browser.storage.local.set({ [storage.storageKey]: { isInFormMenuEnabled: "not-a-boolean" } });
      expect(await storage.get()).toBeNull();
    });
  });

  describe("InFormIntegrationSettingsLocalStorage::set", () => {
    it("Should persist the settings in the local storage", async () => {
      expect.assertions(2);
      const storage = new InFormIntegrationSettingsLocalStorage(account);

      const disabled = new InFormIntegrationSettingsEntity({ isInFormMenuEnabled: false });
      await storage.set(disabled);
      expect(await storage.get()).toEqual(disabled);

      const enabled = new InFormIntegrationSettingsEntity({ isInFormMenuEnabled: true });
      await storage.set(enabled);
      expect(await storage.get()).toEqual(enabled);
    });
  });

  describe("InFormIntegrationSettingsLocalStorage::flush", () => {
    it("Should remove the settings from the local storage", async () => {
      expect.assertions(1);
      const storage = new InFormIntegrationSettingsLocalStorage(account);
      await storage.set(InFormIntegrationSettingsEntity.createDefault());
      await storage.flush();
      expect(await storage.get()).toBeNull();
    });
  });
});
