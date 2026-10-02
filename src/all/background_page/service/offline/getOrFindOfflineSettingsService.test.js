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
 * @since         5.13.0
 */

import OfflineSettingsEntity from "passbolt-styleguide/src/shared/models/entity/offline/offlineSettingsEntity";
import { defaultOfflineSettingsDto } from "passbolt-styleguide/src/shared/models/entity/offline/offlineSettingsEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { offlinePluginEnabledSiteSettings } from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity.test.data";
import GetOrFindOfflineSettingsService from "./getOrFindOfflineSettingsService";
import SiteSettingsEntity from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity";
import UserActiveSessionEntity, {
  USER_ACTIVE_SESSION_OFFLINE,
} from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity";
import { defaultUserActiveSessionDto } from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity.test.data";
import LocalStorageMetadataEntity from "../../model/entity/localStorage/localStorageMetadataEntity";
import GetOrFindActiveSessionService from "../activeSession/getOrFindActiveSessionService";

const mockActiveSession = (data) =>
  jest
    .spyOn(GetOrFindActiveSessionService.prototype, "getOrFind")
    .mockResolvedValue(new UserActiveSessionEntity(defaultUserActiveSessionDto(data)));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GetOrFindOfflineSettingsService", () => {
  let getOrFindOfflineSettingsService, account, apiClientOptions;

  beforeEach(async () => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    getOrFindOfflineSettingsService = new GetOrFindOfflineSettingsService(account, apiClientOptions);
    await getOrFindOfflineSettingsService.offlineSettingsLocalStorage.flush();
  });

  describe("::getOrFind", () => {
    it("with empty storage, retrieves the offline settings from the API and stores them into the local storage.", async () => {
      expect.assertions(3);
      const offlineSettingsDto = defaultOfflineSettingsDto();
      mockActiveSession();
      jest
        .spyOn(
          getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService.findOfflineSettingsService
            .offlineSettingsApiService,
          "find",
        )
        .mockImplementation(() => ({ body: offlineSettingsDto }));
      jest
        .spyOn(
          getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService.getOrFindSiteSettingsService,
          "getOrFind",
        )
        .mockImplementation(() => new SiteSettingsEntity(offlinePluginEnabledSiteSettings()));

      // Control initial storage value.
      const initialStorageValue = await getOrFindOfflineSettingsService.offlineSettingsLocalStorage.getData();
      expect(initialStorageValue).toBeUndefined();

      const entity = await getOrFindOfflineSettingsService.getOrFind();

      expect(entity.toDto()).toEqual(offlineSettingsDto);
      const storageValue = await getOrFindOfflineSettingsService.offlineSettingsLocalStorage.getData();
      expect(storageValue).toEqual(offlineSettingsDto);
    });

    it("with populated storage, retrieves the offline settings from the local storage.", async () => {
      expect.assertions(2);
      const offlineSettingsDto = defaultOfflineSettingsDto();
      await getOrFindOfflineSettingsService.offlineSettingsLocalStorage.setData(
        new OfflineSettingsEntity(offlineSettingsDto),
      );
      mockActiveSession();
      jest.spyOn(
        getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService.findOfflineSettingsService
          .offlineSettingsApiService,
        "find",
      );

      const entity = await getOrFindOfflineSettingsService.getOrFind();

      expect(
        getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService.findOfflineSettingsService
          .offlineSettingsApiService.find,
      ).not.toHaveBeenCalled();
      expect(entity.toDto()).toEqual(offlineSettingsDto);
    });

    it("with empty storage and no offline settings available from the API, returns null and leaves storage empty.", async () => {
      expect.assertions(3);
      jest
        .spyOn(
          getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService.findOfflineSettingsService
            .offlineSettingsApiService,
          "find",
        )
        .mockImplementation(() => ({ body: {} }));
      jest
        .spyOn(
          getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService.getOrFindSiteSettingsService,
          "getOrFind",
        )
        .mockImplementation(() => new SiteSettingsEntity(offlinePluginEnabledSiteSettings()));

      const entity = await getOrFindOfflineSettingsService.getOrFind();

      expect(entity).toBeNull();
      expect(
        getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService.findOfflineSettingsService
          .offlineSettingsApiService.find,
      ).toHaveBeenCalledTimes(1);
      const storageValue = await getOrFindOfflineSettingsService.offlineSettingsLocalStorage.getData();
      expect(storageValue).toBeUndefined();
    });

    it("refreshes from the API when the online session logged in after the cache was written.", async () => {
      expect.assertions(2);
      await getOrFindOfflineSettingsService.offlineSettingsLocalStorage.setData(
        new OfflineSettingsEntity(defaultOfflineSettingsDto()),
      );
      await getOrFindOfflineSettingsService.offlineSettingsLocalStorage.setMetadata(
        new LocalStorageMetadataEntity({ last_updated: "2025-08-02T00:00:00+00:00" }),
      );
      mockActiveSession({ last_logged_in: "2025-08-04T18:58:11+00:00" });
      const expected = new OfflineSettingsEntity(defaultOfflineSettingsDto());
      jest
        .spyOn(getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService, "findAndUpdate")
        .mockResolvedValue(expected);

      const entity = await getOrFindOfflineSettingsService.getOrFind();

      expect(
        getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService.findAndUpdate,
      ).toHaveBeenCalledTimes(1);
      expect(entity).toStrictEqual(expected);
    });

    it("returns the cache when the online session logged in before the cache was written.", async () => {
      expect.assertions(2);
      const offlineSettingsDto = defaultOfflineSettingsDto();
      await getOrFindOfflineSettingsService.offlineSettingsLocalStorage.setData(
        new OfflineSettingsEntity(offlineSettingsDto),
      );
      await getOrFindOfflineSettingsService.offlineSettingsLocalStorage.setMetadata(
        new LocalStorageMetadataEntity({ last_updated: "2025-08-02T00:00:00+00:00" }),
      );
      mockActiveSession({ last_logged_in: "2025-08-01T00:00:00+00:00" });
      jest.spyOn(getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService, "findAndUpdate");

      const entity = await getOrFindOfflineSettingsService.getOrFind();

      expect(
        getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService.findAndUpdate,
      ).not.toHaveBeenCalled();
      expect(entity.toDto()).toEqual(offlineSettingsDto);
    });

    it("returns the cache for an online session even when it logged in after the cache was written if the server is not reachable.", async () => {
      expect.assertions(2);
      const offlineSettingsDto = defaultOfflineSettingsDto();
      await getOrFindOfflineSettingsService.offlineSettingsLocalStorage.setData(
        new OfflineSettingsEntity(offlineSettingsDto),
      );
      await getOrFindOfflineSettingsService.offlineSettingsLocalStorage.setMetadata(
        new LocalStorageMetadataEntity({ last_updated: "2025-08-02T00:00:00+00:00" }),
      );
      mockActiveSession({
        is_server_reachable: false,
        last_logged_in: "2025-08-04T18:58:11+00:00",
      });
      jest.spyOn(getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService, "findAndUpdate");

      const entity = await getOrFindOfflineSettingsService.getOrFind();

      expect(
        getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService.findAndUpdate,
      ).not.toHaveBeenCalled();
      expect(entity.toDto()).toEqual(offlineSettingsDto);
    });

    it("returns the cache for an offline session even when it logged in after the cache was written.", async () => {
      expect.assertions(2);
      const offlineSettingsDto = defaultOfflineSettingsDto();
      await getOrFindOfflineSettingsService.offlineSettingsLocalStorage.setData(
        new OfflineSettingsEntity(offlineSettingsDto),
      );
      await getOrFindOfflineSettingsService.offlineSettingsLocalStorage.setMetadata(
        new LocalStorageMetadataEntity({ last_updated: "2025-08-02T00:00:00+00:00" }),
      );
      mockActiveSession({
        type: USER_ACTIVE_SESSION_OFFLINE,
        is_server_reachable: false,
        last_logged_in: "2025-08-04T18:58:11+00:00",
      });
      jest.spyOn(getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService, "findAndUpdate");

      const entity = await getOrFindOfflineSettingsService.getOrFind();

      expect(
        getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService.findAndUpdate,
      ).not.toHaveBeenCalled();
      expect(entity.toDto()).toEqual(offlineSettingsDto);
    });

    it("returns null if the active session is offline and local storage is empty.", async () => {
      expect.assertions(2);
      mockActiveSession({
        type: USER_ACTIVE_SESSION_OFFLINE,
      });
      jest.spyOn(getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService, "findAndUpdate");

      const entity = await getOrFindOfflineSettingsService.getOrFind();

      expect(
        getOrFindOfflineSettingsService.findAndUpdateOfflineSettingsLocalStorageService.findAndUpdate,
      ).not.toHaveBeenCalled();
      expect(entity).toBeNull();
    });
  });
});
