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
import AuthStatusLocalStorage from "../../service/local_storage/authStatusLocalStorage";
import SiteSettingsLocalStorage from "../../service/local_storage/siteSettingsLocalStorage";
import SiteSettingsRuntimeCache from "../../service/siteSettings/siteSettingsRuntimeCache";
import GetOrFindSiteSettingsController from "./getOrFindSiteSettingsController";

beforeEach(() => {
  jest.clearAllMocks();
  SiteSettingsRuntimeCache.flushAll();
  SiteSettingsLocalStorage._runtimeCachedData = {};
});

describe("GetOrFindSiteSettingsController", () => {
  let account, apiClientOptions, worker;

  beforeEach(() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    worker = { port: { emit: jest.fn() } };
  });

  describe("::exec (default refreshCache=true)", () => {
    it("fetches from the API and persists when authenticated", async () => {
      expect.assertions(3);
      const dto = defaultProSiteSettings();
      jest.spyOn(AuthStatusLocalStorage, "get").mockResolvedValue({ isAuthenticated: true, isMfaRequired: false });
      const controller = new GetOrFindSiteSettingsController(worker, "req-1", apiClientOptions, account);
      jest
        .spyOn(
          controller.getOrFindSiteSettingsService.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService,
          "findSiteSettings",
        )
        .mockResolvedValue(new SiteSettingsEntity(dto));
      const ls =
        controller.getOrFindSiteSettingsService.findAndUpdateSiteSettingsLocalStorageService.siteSettingsLocalStorage;
      await ls.flush();

      const result = await controller.exec();

      expect(result.toDto()).toEqual(dto);
      expect(SiteSettingsRuntimeCache.get(account.id)).toEqual(dto);
      expect(await ls.get()).toEqual(dto);
    });

    it("does not persist when not authenticated", async () => {
      expect.assertions(3);
      const dto = defaultProSiteSettings();
      jest.spyOn(AuthStatusLocalStorage, "get").mockResolvedValue({ isAuthenticated: false, isMfaRequired: false });
      const controller = new GetOrFindSiteSettingsController(worker, "req-1", apiClientOptions, account);
      jest
        .spyOn(
          controller.getOrFindSiteSettingsService.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService,
          "findSiteSettings",
        )
        .mockResolvedValue(new SiteSettingsEntity(dto));
      const ls =
        controller.getOrFindSiteSettingsService.findAndUpdateSiteSettingsLocalStorageService.siteSettingsLocalStorage;
      await ls.flush();

      const result = await controller.exec();

      expect(result.toDto()).toEqual(dto);
      expect(SiteSettingsRuntimeCache.get(account.id)).toEqual(dto);
      expect(await ls.get()).toBeUndefined();
    });
  });

  describe("::exec (refreshCache=false)", () => {
    it("returns from the in-memory cache without an API call when populated", async () => {
      expect.assertions(2);
      const dto = defaultProSiteSettings();
      const controller = new GetOrFindSiteSettingsController(worker, "req-1", apiClientOptions, account);
      SiteSettingsRuntimeCache.set(account.id, new SiteSettingsEntity(dto));
      const apiSpy = jest.spyOn(
        controller.getOrFindSiteSettingsService.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService,
        "findSiteSettings",
      );

      const result = await controller.exec(false);

      expect(apiSpy).not.toHaveBeenCalled();
      expect(result.toDto()).toEqual(dto);
    });

    it("returns from local storage when authenticated, without an API call", async () => {
      expect.assertions(2);
      const dto = defaultProSiteSettings();
      jest.spyOn(AuthStatusLocalStorage, "get").mockResolvedValue({ isAuthenticated: true, isMfaRequired: false });
      const controller = new GetOrFindSiteSettingsController(worker, "req-1", apiClientOptions, account);
      await controller.getOrFindSiteSettingsService.siteSettingsLocalStorage.set(new SiteSettingsEntity(dto));
      const apiSpy = jest.spyOn(
        controller.getOrFindSiteSettingsService.findAndUpdateSiteSettingsLocalStorageService.findSiteSettingsService,
        "findSiteSettings",
      );

      const result = await controller.exec(false);

      expect(result.toDto()).toEqual(dto);
      expect(apiSpy).not.toHaveBeenCalled();
    });
  });

  describe("::_exec", () => {
    it("forwards refreshCache from the port handler through to the service", async () => {
      expect.assertions(1);
      const dto = defaultProSiteSettings();
      const controller = new GetOrFindSiteSettingsController(worker, "req-1", apiClientOptions, account);
      SiteSettingsRuntimeCache.set(account.id, new SiteSettingsEntity(dto));
      const execSpy = jest.spyOn(controller, "exec");

      await controller._exec(false);

      expect(execSpy).toHaveBeenCalledWith(false);
    });

    it("emits ERROR when the service throws", async () => {
      expect.assertions(1);
      const controller = new GetOrFindSiteSettingsController(worker, "req-1", apiClientOptions, account);
      jest.spyOn(controller.getOrFindSiteSettingsService, "getOrFind").mockRejectedValue(new Error("boom"));

      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith("req-1", "ERROR", expect.any(Error));
    });
  });
});
