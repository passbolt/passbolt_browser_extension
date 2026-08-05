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
import GetOrFindSiteSettingsService from "./getOrFindSiteSettingsService";
import OnlineSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/onlineSessionEntity";
import CheckAuthStatusService from "../auth/checkAuthStatusService";
import PassboltBadResponseError from "../../error/passboltBadResponseError";

beforeEach(() => {
  jest.clearAllMocks();
  SiteSettingsRuntimeCache.flushAll();
  SiteSettingsLocalStorage._runtimeCachedData = {};
  // Default to "not authenticated" so anything that doesn't explicitly re-mock stays on the safe path.
  jest
    .spyOn(CheckAuthStatusService.prototype, "checkAuthStatus")
    .mockResolvedValue(new OnlineSessionEntity({ is_authenticated: false }));
});

describe("GetOrFindSiteSettingsService", () => {
  let account, apiClientOptions, service;

  beforeEach(async () => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    service = new GetOrFindSiteSettingsService(account, apiClientOptions);
    await service.siteSettingsLocalStorage.flush();
  });

  describe("::getOrFind (refreshCache=true, default)", () => {
    it("always hits the API even when the runtime cache is populated", async () => {
      expect.assertions(3);
      const stale = new SiteSettingsEntity({ ...defaultProSiteSettings(), serverTimeDiff: 999 });
      SiteSettingsRuntimeCache.set(stale);

      const fresh = new SiteSettingsEntity(defaultProSiteSettings());
      const apiSpy = jest
        .spyOn(service.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService, "findSiteSettings")
        .mockResolvedValue(fresh);

      const result = await service.getOrFind();

      expect(apiSpy).toHaveBeenCalledTimes(1);
      expect(result.toDto()).toEqual(fresh.toDto());
      expect(SiteSettingsRuntimeCache.get()).toEqual(fresh.toDto());
    });

    it("never reads local storage on this path", async () => {
      expect.assertions(2);
      const lsSpy = jest.spyOn(service.siteSettingsLocalStorage, "get");
      const apiSpy = jest
        .spyOn(service.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService, "findSiteSettings")
        .mockResolvedValue(new SiteSettingsEntity(defaultProSiteSettings()));

      await service.getOrFind();

      expect(lsSpy).not.toHaveBeenCalled();
      expect(apiSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("::getOrFind (refreshCache=false) — authenticated", () => {
    beforeEach(() => {
      jest
        .spyOn(CheckAuthStatusService.prototype, "checkAuthStatus")
        .mockResolvedValue(new OnlineSessionEntity({ is_authenticated: true }));
    });

    it("returns from local storage when populated; no API call", async () => {
      expect.assertions(3);
      const dto = defaultProSiteSettings();
      await service.siteSettingsLocalStorage.set(new SiteSettingsEntity(dto));
      const apiSpy = jest.spyOn(
        service.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService,
        "findSiteSettings",
      );

      const result = await service.getOrFind(false);

      expect(result.toDto()).toEqual(dto);
      expect(apiSpy).not.toHaveBeenCalled();
      // The local storage read must also seed the runtime cache (see next test for why).
      expect(SiteSettingsRuntimeCache.get()).toEqual(dto);
    });

    it("seeds the runtime cache from local storage so the synchronous username validator stays consistent", async () => {
      /*
       * Regression: SiteSettingsRuntimeCache is the ONLY store AppEmailValidatorService reads
       * (synchronously, while constructing a user entity). It is flushed on login and lost on
       * service-worker restart, whereas SiteSettingsLocalStorage survives both. An authenticated
       * read that hits local storage must therefore repopulate the runtime cache, otherwise a
       * custom email validation regex would be dropped and valid usernames rejected.
       */
      expect.assertions(3);
      const dto = defaultProSiteSettings();
      await service.siteSettingsLocalStorage.set(new SiteSettingsEntity(dto));
      // Emulate a flushed / post-restart runtime cache while local storage still holds the settings.
      SiteSettingsRuntimeCache.flushAll();
      expect(SiteSettingsRuntimeCache.get()).toBeNull();
      const apiSpy = jest.spyOn(
        service.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService,
        "findSiteSettings",
      );

      await service.getOrFind(false);

      expect(SiteSettingsRuntimeCache.get()).toEqual(dto);
      expect(apiSpy).not.toHaveBeenCalled();
    });

    it("ignores the runtime cache and falls through to the API on a local storage miss", async () => {
      expect.assertions(2);
      // Populate the runtime cache but leave LS empty: an authenticated read must not use
      // the runtime cache, so it falls through to the API.
      SiteSettingsRuntimeCache.set(new SiteSettingsEntity({ ...defaultProSiteSettings(), serverTimeDiff: 999 }));
      const dto = defaultProSiteSettings();
      const apiSpy = jest
        .spyOn(service.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService, "findSiteSettings")
        .mockResolvedValue(new SiteSettingsEntity(dto));

      const result = await service.getOrFind(false);

      expect(apiSpy).toHaveBeenCalledTimes(1);
      expect(result.toDto()).toEqual(dto);
    });
  });

  describe("::getOrFind (refreshCache=false) — unauthenticated", () => {
    it("returns from the runtime cache when populated; no LS read; no API call", async () => {
      expect.assertions(3);
      const dto = defaultProSiteSettings();
      SiteSettingsRuntimeCache.set(new SiteSettingsEntity(dto));
      const lsSpy = jest.spyOn(service.siteSettingsLocalStorage, "get");
      const apiSpy = jest.spyOn(
        service.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService,
        "findSiteSettings",
      );

      const result = await service.getOrFind(false);

      expect(result.toDto()).toEqual(dto);
      expect(lsSpy).not.toHaveBeenCalled();
      expect(apiSpy).not.toHaveBeenCalled();
    });

    it("skips local storage entirely on runtime miss; falls through to the API", async () => {
      expect.assertions(2);
      const lsSpy = jest.spyOn(service.siteSettingsLocalStorage, "get");
      const dto = defaultProSiteSettings();
      jest
        .spyOn(service.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService, "findSiteSettings")
        .mockResolvedValue(new SiteSettingsEntity(dto));

      const result = await service.getOrFind(false);

      expect(lsSpy).not.toHaveBeenCalled();
      expect(result.toDto()).toEqual(dto);
    });
  });

  describe("::getOrFind (refreshCache=false) — authentication status unavailable", () => {
    beforeEach(() => {
      // An API error occured
      jest.spyOn(CheckAuthStatusService.prototype, "checkAuthStatus").mockRejectedValue(new PassboltBadResponseError());
    });

    it("should return the runtime cache when populated when there is an API error", async () => {
      expect.assertions(3);

      const dto = defaultProSiteSettings();
      SiteSettingsRuntimeCache.set(new SiteSettingsEntity(dto));

      const localStorageSpy = jest.spyOn(service.siteSettingsLocalStorage, "get");
      const apiSpy = jest.spyOn(
        service.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService,
        "findSiteSettings",
      );

      const result = await service.getOrFind(false);

      expect(result.toDto()).toEqual(dto);
      expect(localStorageSpy).not.toHaveBeenCalled();
      expect(apiSpy).not.toHaveBeenCalled();
    });

    it("should  call the API when cache is empty when there is an API error", async () => {
      expect.assertions(2);

      const dto = defaultProSiteSettings();

      const apiSpy = jest
        .spyOn(service.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService, "findSiteSettings")
        .mockResolvedValue(new SiteSettingsEntity(dto));

      const result = await service.getOrFind(false);

      expect(apiSpy).toHaveBeenCalledTimes(1);
      expect(result.toDto()).toEqual(dto);
    });
  });
});
