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
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import GetOrFindActiveSessionService from "./getOrFindActiveSessionService";
import FindAndUpdateActiveSessionSessionStorageService from "./findAndUpdateActiveSessionSessionStorageService";
import FindServerStatusService from "../status/findServerStatusService";
import UserActiveSessionEntity, {
  USER_ACTIVE_SESSION_ONLINE,
} from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity";
import ActiveSessionSessionStorage from "../session_storage/activeSessionSessionStorage";

describe("GetOrFindActiveSessionService", () => {
  let service, account;

  beforeEach(async () => {
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
    service = new GetOrFindActiveSessionService(account, defaultApiClientOptions());
    // flush account related storage before each.
    await service.activeSessionSessionStorage.flush();
  });

  describe("::getOrFindAll", () => {
    it("fetches from the API the server status and initializes the local storage with a user active session.", async () => {
      expect.assertions(3);
      jest.spyOn(FindServerStatusService.prototype, "find").mockImplementation(() => true);
      jest.spyOn(FindAndUpdateActiveSessionSessionStorageService.prototype, "findAndUpdateAuthenticationStatus");

      const userActiveSessionEntity = await service.getOrFind();

      expect(
        FindAndUpdateActiveSessionSessionStorageService.prototype.findAndUpdateAuthenticationStatus,
      ).toHaveBeenCalledTimes(1);
      expect(userActiveSessionEntity).toBeInstanceOf(UserActiveSessionEntity);
      expect(await service.activeSessionSessionStorage.get()).toEqual(userActiveSessionEntity.toDto());
    });

    it("If any validation error happen, fetches from the API the server status and set the local storage with a user active session.", async () => {
      expect.assertions(3);
      jest.spyOn(FindServerStatusService.prototype, "find").mockImplementation(() => true);
      jest.spyOn(service.activeSessionSessionStorage, "get").mockImplementationOnce(() => {});
      jest.spyOn(FindAndUpdateActiveSessionSessionStorageService.prototype, "findAndUpdateAuthenticationStatus");

      const userActiveSessionEntity = await service.getOrFind();

      expect(
        FindAndUpdateActiveSessionSessionStorageService.prototype.findAndUpdateAuthenticationStatus,
      ).toHaveBeenCalledTimes(1);
      expect(userActiveSessionEntity).toBeInstanceOf(UserActiveSessionEntity);
      expect(await service.activeSessionSessionStorage.get()).toEqual(userActiveSessionEntity.toDto());
    });

    it("retrieves user active session from the local storage when the local storage is initialized.", async () => {
      expect.assertions(4);
      const userActiveSession = {
        is_authenticated: false,
        is_server_reachable: true,
        type: USER_ACTIVE_SESSION_ONLINE,
      };
      jest.spyOn(FindServerStatusService.prototype, "find");
      await service.activeSessionSessionStorage.set(new UserActiveSessionEntity(userActiveSession));

      expect(service.activeSessionSessionStorage.hasCachedData()).toBeTruthy();

      const userActiveSessionEntity = await service.getOrFind();

      expect(FindServerStatusService.prototype.find).not.toHaveBeenCalled();
      expect(userActiveSessionEntity.toDto()).toEqual(userActiveSession);
      expect(await service.activeSessionSessionStorage.get()).toEqual(userActiveSessionEntity.toDto());
    });

    it("does not validate the user active session if the information is retrieved from the runtime cache.", async () => {
      expect.assertions(2);
      const userActiveSession = {
        is_authenticated: false,
        is_server_reachable: true,
        type: USER_ACTIVE_SESSION_ONLINE,
      };
      jest.spyOn(FindServerStatusService.prototype, "find");
      await service.activeSessionSessionStorage.set(new UserActiveSessionEntity(userActiveSession));
      jest.spyOn(UserActiveSessionEntity.prototype, "validateSchema");

      await service.getOrFind();

      expect(FindServerStatusService.prototype.find).not.toHaveBeenCalled();
      // Validation must not be triggered by getOrFindAll when the data comes from the runtime cache.
      expect(UserActiveSessionEntity.prototype.validateSchema).not.toHaveBeenCalled();
    });

    it("validates groups collection if the local storage has no runtime cache and the information is retrieved from the local storage.", async () => {
      expect.assertions(2);
      const userActiveSession = {
        is_authenticated: false,
        is_server_reachable: true,
        type: USER_ACTIVE_SESSION_ONLINE,
      };
      jest.spyOn(FindServerStatusService.prototype, "find");
      await service.activeSessionSessionStorage.set(new UserActiveSessionEntity(userActiveSession));
      ActiveSessionSessionStorage._runtimeCachedData = {};
      jest.spyOn(UserActiveSessionEntity.prototype, "validateSchema");

      await service.getOrFind();

      expect(FindServerStatusService.prototype.find).not.toHaveBeenCalled();
      // Validation must be triggered by getOrFindAll when the data is loaded from the disk cache.
      expect(UserActiveSessionEntity.prototype.validateSchema).toHaveBeenCalled();
    });
  });
});
