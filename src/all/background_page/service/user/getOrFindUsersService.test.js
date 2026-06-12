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

import { v4 as uuidv4 } from "uuid";
import { defaultUsersDtos } from "passbolt-styleguide/src/shared/models/entity/user/usersCollection.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import GetOrFindUsersService from "./getOrFindUsersService";
import FindAndUpdateUsersLocalStorageService from "./findAndUpdateUsersLocalStorageService";
import UsersCollection from "passbolt-styleguide/src/shared/models/entity/user/usersCollection";
import UserLocalStorage from "../local_storage/userLocalStorage";

describe("GetOrFindUsersService", () => {
  let service, account;

  beforeEach(async () => {
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
    service = new GetOrFindUsersService(account, defaultApiClientOptions());
    await UserLocalStorage.flush();
  });

  describe("::getOrFindAll", () => {
    it("returns the users from the local storage on hot cache without delegating to the find-and-update service.", async () => {
      expect.assertions(2);
      const usersDto = defaultUsersDtos();
      await UserLocalStorage.set(new UsersCollection(usersDto));
      jest.spyOn(FindAndUpdateUsersLocalStorageService.prototype, "findAndUpdateAll");

      const result = await service.getOrFindAll();

      expect(FindAndUpdateUsersLocalStorageService.prototype.findAndUpdateAll).not.toHaveBeenCalled();
      expect(result.toDto(UserLocalStorage.DEFAULT_CONTAIN)).toEqual(
        new UsersCollection(usersDto).toDto(UserLocalStorage.DEFAULT_CONTAIN),
      );
    });

    it("delegates to the find-and-update service on cold cache and returns its result.", async () => {
      expect.assertions(2);
      const usersDto = defaultUsersDtos();
      const expected = new UsersCollection(usersDto);
      jest
        .spyOn(FindAndUpdateUsersLocalStorageService.prototype, "findAndUpdateAll")
        .mockImplementation(() => expected);

      const result = await service.getOrFindAll();

      expect(FindAndUpdateUsersLocalStorageService.prototype.findAndUpdateAll).toHaveBeenCalledTimes(1);
      expect(result).toBe(expected);
    });
  });

  describe("::getOrFindByIds", () => {
    it("returns only the users whose ids are in the requested set.", async () => {
      expect.assertions(2);
      const usersDto = defaultUsersDtos();
      await UserLocalStorage.set(new UsersCollection(usersDto));
      const requestedIds = [usersDto[1].id, usersDto[3].id, usersDto[5].id];

      const result = await service.getOrFindByIds(requestedIds);

      expect(result).toHaveLength(3);
      expect(result.extract("id").sort()).toEqual([...requestedIds].sort());
    });

    it("returns an empty collection when none of the ids match.", async () => {
      expect.assertions(1);
      const usersDto = defaultUsersDtos();
      await UserLocalStorage.set(new UsersCollection(usersDto));

      const result = await service.getOrFindByIds([uuidv4()]);

      expect(result).toHaveLength(0);
    });

    it("delegates to the find-and-update service on cold cache, then filters.", async () => {
      expect.assertions(3);
      const usersDto = defaultUsersDtos();
      jest
        .spyOn(FindAndUpdateUsersLocalStorageService.prototype, "findAndUpdateAll")
        .mockImplementation(() => new UsersCollection(usersDto));
      const requestedIds = [usersDto[0].id, usersDto[2].id];

      const result = await service.getOrFindByIds(requestedIds);

      expect(FindAndUpdateUsersLocalStorageService.prototype.findAndUpdateAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result.extract("id").sort()).toEqual([...requestedIds].sort());
    });

    it("should assert its parameter.", async () => {
      expect.assertions(1);
      await expect(() => service.getOrFindByIds(["not-a-uuid"])).rejects.toThrow(
        "The given parameter is not a valid array of uuid",
      );
    });
  });
});
