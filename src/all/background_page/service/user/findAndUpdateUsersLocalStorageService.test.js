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

import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import { defaultUsersDtos } from "passbolt-styleguide/src/shared/models/entity/user/usersCollection.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import FindAndUpdateUsersLocalStorageService from "./findAndUpdateUsersLocalStorageService";
import FindUsersService from "./findUsersService";
import UsersCollection from "passbolt-styleguide/src/shared/models/entity/user/usersCollection";
import UserLocalStorage from "../local_storage/userLocalStorage";
import OrganizationSettingsModel from "../../model/organizationSettings/organizationSettingsModel";

describe("FindAndUpdateUsersLocalStorageService", () => {
  let service, account;

  beforeEach(async () => {
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
    service = new FindAndUpdateUsersLocalStorageService(account, defaultApiClientOptions());
    await UserLocalStorage.flush();
  });

  describe("::findAndUpdateAll", () => {
    it("retrieves the users from the API and stores them into the local storage.", async () => {
      expect.assertions(3);
      const usersDto = defaultUsersDtos();
      jest.spyOn(FindUsersService.prototype, "findAll").mockImplementation(() => new UsersCollection(usersDto));

      const result = await service.findAndUpdateAll();

      expect(FindUsersService.prototype.findAll).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(UsersCollection);
      expect(await UserLocalStorage.get()).toEqual(result.toDto(UserLocalStorage.DEFAULT_CONTAIN));
    });

    it("overrides local storage with the API result on each call.", async () => {
      expect.assertions(2);
      const initialUsersDto = defaultUsersDtos(2);
      const refreshedUsersDto = defaultUsersDtos(5);
      await UserLocalStorage.set(new UsersCollection(initialUsersDto));
      jest
        .spyOn(FindUsersService.prototype, "findAll")
        .mockImplementation(() => new UsersCollection(refreshedUsersDto));

      const result = await service.findAndUpdateAll();

      expect(result.toDto(UserLocalStorage.DEFAULT_CONTAIN)).toEqual(refreshedUsersDto);
      expect(await UserLocalStorage.get()).toEqual(refreshedUsersDto);
    });

    it("on the non-admin path, omits is_mfa_enabled and missing_metadata_key_ids from the contains.", async () => {
      expect.assertions(2);
      const findAllSpy = jest
        .spyOn(FindUsersService.prototype, "findAll")
        .mockImplementation(() => new UsersCollection([]));

      await service.findAndUpdateAll();

      const contains = findAllSpy.mock.calls[0][0];
      expect(contains.is_mfa_enabled).toBeUndefined();
      expect(contains.missing_metadata_key_ids).toBeUndefined();
    });

    it("on the admin path with the metadata plugin enabled, includes is_mfa_enabled and missing_metadata_key_ids.", async () => {
      expect.assertions(2);
      const adminAccount = new AccountEntity(defaultAccountDto({ role_name: RoleEntity.ROLE_ADMIN }));
      const adminService = new FindAndUpdateUsersLocalStorageService(adminAccount, defaultApiClientOptions());
      const findAllSpy = jest
        .spyOn(FindUsersService.prototype, "findAll")
        .mockImplementation(() => new UsersCollection([]));
      jest
        .spyOn(OrganizationSettingsModel.prototype, "getOrFind")
        .mockImplementation(() => ({ isPluginEnabled: (plugin) => plugin === "metadata" }));

      await adminService.findAndUpdateAll();

      const contains = findAllSpy.mock.calls[0][0];
      expect(contains.is_mfa_enabled).toBe(true);
      expect(contains.missing_metadata_key_ids).toBe(true);
    });

    it("on the admin path with the metadata plugin disabled, includes is_mfa_enabled but omits missing_metadata_key_ids.", async () => {
      expect.assertions(2);
      const adminAccount = new AccountEntity(defaultAccountDto({ role_name: RoleEntity.ROLE_ADMIN }));
      const adminService = new FindAndUpdateUsersLocalStorageService(adminAccount, defaultApiClientOptions());
      const findAllSpy = jest
        .spyOn(FindUsersService.prototype, "findAll")
        .mockImplementation(() => new UsersCollection([]));
      jest
        .spyOn(OrganizationSettingsModel.prototype, "getOrFind")
        .mockImplementation(() => ({ isPluginEnabled: () => false }));

      await adminService.findAndUpdateAll();

      const contains = findAllSpy.mock.calls[0][0];
      expect(contains.is_mfa_enabled).toBe(true);
      expect(contains.missing_metadata_key_ids).toBeUndefined();
    });

    it("returns cached data and does not re-fetch when the lock is not granted (a concurrent update is in flight).", async () => {
      expect.assertions(3);
      const usersDto = defaultUsersDtos();
      let resolve;
      const inflight = new Promise((_resolve) => (resolve = _resolve));
      jest.spyOn(FindUsersService.prototype, "findAll").mockImplementation(() => inflight);

      // First call grabs the exclusive lock; second call falls into the shared-lock branch.
      service.findAndUpdateAll();
      const secondCall = service.findAndUpdateAll();
      resolve(new UsersCollection(usersDto));
      await secondCall;

      const stored = await UserLocalStorage.get();
      expect(FindUsersService.prototype.findAll).toHaveBeenCalledTimes(1);
      expect(stored).toHaveLength(usersDto.length);
      expect(stored).toEqual(usersDto);
    });
  });
});
