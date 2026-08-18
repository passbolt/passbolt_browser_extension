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
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultProSiteSettings } from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity.test.data";
import SiteSettingsLocalStorage from "../local_storage/siteSettingsLocalStorage";
import SiteSettingsRuntimeCache from "./siteSettingsRuntimeCache";
import FindAndUpdateSiteSettingsLocalStorageService from "./findAndUpdateSiteSettingsLocalStorageService";
import OnlineSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/onlineSessionEntity";
import PassboltBadResponseError from "../../error/passboltBadResponseError";

const readBrowserStorage = async (storageKey) => {
  const data = await browser.storage.local.get([storageKey]);
  return data[storageKey];
};

beforeEach(() => {
  jest.clearAllMocks();
  SiteSettingsRuntimeCache.flushAll();
  SiteSettingsLocalStorage._runtimeCachedData = {};
});

describe("FindAndUpdateSiteSettingsLocalStorageService", () => {
  let account, apiClientOptions, service;

  beforeEach(async () => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    service = new FindAndUpdateSiteSettingsLocalStorageService(account, apiClientOptions);
    await service.siteSettingsLocalStorage.flush();
  });

  describe("::findAndUpdateAll — runtime cache", () => {
    it("always updates SiteSettingsRuntimeCache regardless of auth status", async () => {
      expect.assertions(2);
      const dto = defaultProSiteSettings();
      jest
        .spyOn(service.checkAuthStatusService, "checkAuthStatus")
        .mockResolvedValue(new OnlineSessionEntity({ is_authenticated: false }));
      jest.spyOn(service.findSiteSettingsService, "findSiteSettings").mockResolvedValue(new SiteSettingsEntity(dto));

      const result = await service.findAndUpdateAll();

      expect(result.toDto()).toEqual(dto);
      expect(SiteSettingsRuntimeCache.get(account.id)).toEqual(dto);
    });
  });

  describe("::findAndUpdateAll — local storage gate", () => {
    it("writes SiteSettingsLocalStorage when authenticated", async () => {
      expect.assertions(2);
      const dto = defaultProSiteSettings();
      jest
        .spyOn(service.checkAuthStatusService, "checkAuthStatus")
        .mockResolvedValue(new OnlineSessionEntity({ is_authenticated: true }));
      jest.spyOn(service.findSiteSettingsService, "findSiteSettings").mockResolvedValue(new SiteSettingsEntity(dto));

      await service.findAndUpdateAll();

      expect(await readBrowserStorage(service.siteSettingsLocalStorage.storageKey)).toEqual(dto);
      expect(SiteSettingsLocalStorage._runtimeCachedData[account.id]).toEqual(dto);
    });

    it("does not touch SiteSettingsLocalStorage when not authenticated", async () => {
      expect.assertions(2);
      const dto = defaultProSiteSettings();
      jest
        .spyOn(service.checkAuthStatusService, "checkAuthStatus")
        .mockResolvedValue(new OnlineSessionEntity({ is_authenticated: false }));

      jest.spyOn(service.findSiteSettingsService, "findSiteSettings").mockResolvedValue(new SiteSettingsEntity(dto));

      await service.findAndUpdateAll();

      expect(await readBrowserStorage(service.siteSettingsLocalStorage.storageKey)).toBeUndefined();
      expect(SiteSettingsLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
    });

    it("should handle API errors as if the user is not authenticated", async () => {
      expect.assertions(4);

      const dto = defaultProSiteSettings();

      // An API error occured
      jest.spyOn(service.checkAuthStatusService, "checkAuthStatus").mockRejectedValue(new PassboltBadResponseError());
      jest.spyOn(service.findSiteSettingsService, "findSiteSettings").mockResolvedValue(new SiteSettingsEntity(dto));

      const result = await service.findAndUpdateAll();

      expect(result.toDto()).toEqual(dto);
      expect(SiteSettingsRuntimeCache.get()).toEqual(dto);
      expect(await readBrowserStorage(service.siteSettingsLocalStorage.storageKey)).toBeUndefined();
      expect(SiteSettingsLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
    });
  });

  describe("::findAndUpdateAll — concurrency", () => {
    it("coalesces concurrent calls into one API hit per account", async () => {
      expect.assertions(4);
      const dto = defaultProSiteSettings();
      jest
        .spyOn(service.checkAuthStatusService, "checkAuthStatus")
        .mockResolvedValue(new OnlineSessionEntity({ is_authenticated: true }));

      const apiSpy = jest
        .spyOn(service.findSiteSettingsService, "findSiteSettings")
        .mockResolvedValue(new SiteSettingsEntity(dto));

      const results = await Promise.all([
        service.findAndUpdateAll(),
        service.findAndUpdateAll(),
        service.findAndUpdateAll(),
      ]);

      expect(apiSpy).toHaveBeenCalledTimes(1);
      results.forEach((r) => expect(r?.toDto()).toEqual(dto));
    });
  });

  describe("::findAndUpdateAll — error propagation", () => {
    it("propagates API errors and leaves both caches untouched", async () => {
      expect.assertions(4);
      jest
        .spyOn(service.checkAuthStatusService, "checkAuthStatus")
        .mockResolvedValue(new OnlineSessionEntity({ is_authenticated: true }));

      jest.spyOn(service.findSiteSettingsService, "findSiteSettings").mockRejectedValue(new Error("API down"));

      await expect(service.findAndUpdateAll()).rejects.toThrow("API down");
      expect(await readBrowserStorage(service.siteSettingsLocalStorage.storageKey)).toBeUndefined();
      expect(SiteSettingsLocalStorage._runtimeCachedData[account.id]).toBeUndefined();
      expect(SiteSettingsRuntimeCache.get(account.id)).toBeNull();
    });
  });
});
