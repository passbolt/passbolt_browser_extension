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
 * @since         6.0.0
 */
import SiteSettingsEntity from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultProSiteSettings } from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity.test.data";
import SiteSettingsLocalStorage, { SITE_SETTINGS } from "./siteSettingsLocalStorage";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SiteSettingsLocalStorage", () => {
  let account, storage;

  beforeEach(async () => {
    account = new AccountEntity(defaultAccountDto());
    storage = new SiteSettingsLocalStorage(account);
    await storage.flush();
  });

  describe("::constructor", () => {
    it("derives a per-account storage key", () => {
      expect.assertions(1);
      expect(storage.storageKey).toBe(`${SITE_SETTINGS}-${account.id}`);
    });

    it("throws when account is missing", () => {
      expect.assertions(1);
      expect(() => new SiteSettingsLocalStorage(null)).toThrow(TypeError);
    });

    it("throws when account is not an AccountEntity", () => {
      expect.assertions(1);
      expect(() => new SiteSettingsLocalStorage({ id: "abc" })).toThrow(TypeError);
    });
  });

  describe("::get", () => {
    it("returns undefined when nothing is stored", async () => {
      expect.assertions(1);
      const result = await storage.get();
      expect(result).toBeUndefined();
    });

    it("returns content stored in the local storage", async () => {
      expect.assertions(1);
      const dto = defaultProSiteSettings();
      await browser.storage.local.set({ [storage.storageKey]: dto });
      const result = await storage.get();
      expect(result).toEqual(dto);
    });

    it("populates the runtime cache on the first read", async () => {
      expect.assertions(2);
      const dto = defaultProSiteSettings();
      await browser.storage.local.set({ [storage.storageKey]: dto });
      expect(SiteSettingsLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
      await storage.get();
      expect(SiteSettingsLocalStorage._runtimeCachedData[account.id]).toEqual(dto);
    });

    it("subsequent reads come from the runtime cache and skip browser.storage", async () => {
      expect.assertions(2);
      const dto = defaultProSiteSettings();
      await browser.storage.local.set({ [storage.storageKey]: dto });
      await storage.get();
      const spy = jest.spyOn(browser.storage.local, "get");
      const result = await storage.get();
      expect(spy).not.toHaveBeenCalled();
      expect(result).toEqual(dto);
    });
  });

  describe("::set", () => {
    it("writes the entity dto to local storage and runtime cache", async () => {
      expect.assertions(3);
      const entity = new SiteSettingsEntity(defaultProSiteSettings());
      await storage.set(entity);
      expect(browser.storage.local.store[storage.storageKey]).toEqual(entity.toDto());
      expect(SiteSettingsLocalStorage._runtimeCachedData[account.id]).toEqual(entity.toDto());
      const result = await storage.get();
      expect(result).toEqual(entity.toDto());
    });

    it("throws when settings is not a SiteSettingsEntity", async () => {
      expect.assertions(2);
      await expect(storage.set(null)).rejects.toThrow(TypeError);
      await expect(storage.set({ status: "enabled" })).rejects.toThrow(TypeError);
    });
  });

  describe("::flush", () => {
    it("clears both browser.storage and the runtime cache", async () => {
      expect.assertions(2);
      const entity = new SiteSettingsEntity(defaultProSiteSettings());
      await storage.set(entity);
      await storage.flush();
      expect(browser.storage.local.store[storage.storageKey]).toBeUndefined();
      expect(SiteSettingsLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
    });
  });
});
