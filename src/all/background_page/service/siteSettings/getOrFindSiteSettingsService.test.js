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
import AuthStatusLocalStorage from "../local_storage/authStatusLocalStorage";
import SiteSettingsLocalStorage from "../local_storage/siteSettingsLocalStorage";
import SiteSettingsRuntimeCache from "./siteSettingsRuntimeCache";
import GetOrFindSiteSettingsService from "./getOrFindSiteSettingsService";

const mockAuthStatus = (isAuthenticated) =>
  jest
    .spyOn(AuthStatusLocalStorage, "get")
    .mockResolvedValue(isAuthenticated === undefined ? undefined : { isAuthenticated, isMfaRequired: false });

beforeEach(() => {
  jest.clearAllMocks();
  SiteSettingsRuntimeCache.flushAll();
  SiteSettingsLocalStorage._runtimeCachedData = {};
  // Default to "not authenticated" so anything that doesn't explicitly re-mock stays on the safe path.
  mockAuthStatus(false);
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
      SiteSettingsRuntimeCache.set(account.id, stale);

      const fresh = new SiteSettingsEntity(defaultProSiteSettings());
      const apiSpy = jest
        .spyOn(service.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService, "findSiteSettings")
        .mockResolvedValue(fresh);

      const result = await service.getOrFind();

      expect(apiSpy).toHaveBeenCalledTimes(1);
      expect(result.toDto()).toEqual(fresh.toDto());
      expect(SiteSettingsRuntimeCache.get(account.id)).toEqual(fresh.toDto());
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
      mockAuthStatus(true);
    });

    it("returns from local storage when populated; no API call", async () => {
      expect.assertions(2);
      const dto = defaultProSiteSettings();
      await service.siteSettingsLocalStorage.set(new SiteSettingsEntity(dto));
      const apiSpy = jest.spyOn(
        service.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService,
        "findSiteSettings",
      );

      const result = await service.getOrFind(false);

      expect(result.toDto()).toEqual(dto);
      expect(apiSpy).not.toHaveBeenCalled();
    });

    it("ignores the runtime cache and falls through to the API on a local storage miss", async () => {
      expect.assertions(2);
      // Populate the runtime cache but leave LS empty: an authenticated read must not use
      // the runtime cache, so it falls through to the API.
      SiteSettingsRuntimeCache.set(
        account.id,
        new SiteSettingsEntity({ ...defaultProSiteSettings(), serverTimeDiff: 999 }),
      );
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
      SiteSettingsRuntimeCache.set(account.id, new SiteSettingsEntity(dto));
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
});
