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

import { defaultUserDto } from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import UserMeLocalStorage from "../local_storage/userMeLocalStorage";
import GetOrFindMeService from "./getOrFindMeService";
import UserEntity from "../../model/entity/user/userEntity";
import GetOrFindSiteSettingsService from "../siteSettings/getOrFindSiteSettingsService";
import SiteSettingsEntity from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity";
import { defaultCeSiteSettings } from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity.test.data";
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

describe("GetOrFindMeService", () => {
  let service, account, storage;

  beforeEach(async () => {
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
    service = new GetOrFindMeService(account, defaultApiClientOptions());
    storage = new UserMeLocalStorage(account);
    await storage.flush();
    jest
      .spyOn(GetOrFindSiteSettingsService.prototype, "getOrFind")
      .mockImplementation(() => new SiteSettingsEntity(defaultCeSiteSettings()));
  });

  describe("::getOrFindMe", () => {
    it("returns the user me from the local storage on hot cache without get service.", async () => {
      expect.assertions(2);
      const usersDto = defaultUserDto();
      await storage.setData(new UserEntity(usersDto));
      jest.spyOn(service.userApiService, "get");

      const result = await service.getOrFindMe();

      expect(service.userApiService.get).not.toHaveBeenCalled();
      expect(result.toDto(storage.DEFAULT_CONTAIN)).toEqual(new UserEntity(usersDto).toDto(storage.DEFAULT_CONTAIN));
    });

    it("delegates to the get service on cold cache and returns its result.", async () => {
      expect.assertions(2);
      mockActiveSession();
      const usersDto = defaultUserDto();
      const expected = new UserEntity(usersDto);
      jest.spyOn(service.userApiService, "get").mockImplementation(() => expected);

      const result = await service.getOrFindMe();

      expect(service.userApiService.get).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(expected);
    });

    it("refreshes from the API when the online session logged in after the cache was written.", async () => {
      expect.assertions(2);
      await storage.setData(new UserEntity(defaultUserDto()));
      await storage.setMetadata(new LocalStorageMetadataEntity({ last_updated: "2025-08-02T00:00:00+00:00" }));
      mockActiveSession({ last_logged_in: "2025-08-04T18:58:11+00:00" });
      const expected = new UserEntity(defaultUserDto());
      jest.spyOn(service.userApiService, "get").mockImplementation(() => expected);

      const result = await service.getOrFindMe();

      expect(service.userApiService.get).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(expected);
    });

    it("returns the cache when the online session logged in before the cache was written.", async () => {
      expect.assertions(2);
      const usersDto = defaultUserDto();
      await storage.setData(new UserEntity(usersDto));
      await storage.setMetadata(new LocalStorageMetadataEntity({ last_updated: "2025-08-02T00:00:00+00:00" }));
      mockActiveSession({ last_logged_in: "2025-08-01T00:00:00+00:00" });
      jest.spyOn(service.userApiService, "get");

      const result = await service.getOrFindMe();

      expect(service.userApiService.get).not.toHaveBeenCalled();
      expect(result.toDto(storage.DEFAULT_CONTAIN)).toEqual(new UserEntity(usersDto).toDto(storage.DEFAULT_CONTAIN));
    });

    it("returns the cache for an online session even when it logged in after the cache was written if server is not reachable.", async () => {
      expect.assertions(2);
      const usersDto = defaultUserDto();
      await storage.setData(new UserEntity(usersDto));
      await storage.setMetadata(new LocalStorageMetadataEntity({ last_updated: "2025-08-02T00:00:00+00:00" }));
      mockActiveSession({
        is_server_reachable: false,
        last_logged_in: "2025-08-04T18:58:11+00:00",
      });
      jest.spyOn(service.userApiService, "get");

      const result = await service.getOrFindMe();

      expect(service.userApiService.get).not.toHaveBeenCalled();
      expect(result.toDto(storage.DEFAULT_CONTAIN)).toEqual(new UserEntity(usersDto).toDto(storage.DEFAULT_CONTAIN));
    });

    it("returns the cache for an offline session even when it logged in after the cache was written.", async () => {
      expect.assertions(2);
      const usersDto = defaultUserDto();
      await storage.setData(new UserEntity(usersDto));
      await storage.setMetadata(new LocalStorageMetadataEntity({ last_updated: "2025-08-02T00:00:00+00:00" }));
      mockActiveSession({
        type: USER_ACTIVE_SESSION_OFFLINE,
        is_server_reachable: false,
        last_logged_in: "2025-08-04T18:58:11+00:00",
      });
      jest.spyOn(service.userApiService, "get");

      const result = await service.getOrFindMe();

      expect(service.userApiService.get).not.toHaveBeenCalled();
      expect(result.toDto(storage.DEFAULT_CONTAIN)).toEqual(new UserEntity(usersDto).toDto(storage.DEFAULT_CONTAIN));
    });

    it("return null for offline session if nothing is in the local storage.", async () => {
      expect.assertions(2);
      mockActiveSession({ type: USER_ACTIVE_SESSION_OFFLINE });
      jest.spyOn(service.userApiService, "get");

      const result = await service.getOrFindMe();

      expect(service.userApiService.get).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
