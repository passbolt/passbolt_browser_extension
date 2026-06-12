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
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import GetOrFindGroupsService from "./getOrFindGroupsService";
import FindAndUpdateGroupsLocalStorageService from "./findAndUpdateGroupsLocalStorageService";
import FindGroupsService from "./findGroupsService";
import GroupsCollection from "passbolt-styleguide/src/shared/models/entity/group/groupsCollection";
import GroupLocalStorage from "../local_storage/groupLocalStorage";
import { defaultGroupsDtos } from "passbolt-styleguide/src/shared/models/entity/group/groupsCollection.test.data";

describe("GetOrFindGroupsService", () => {
  let service, account;

  beforeEach(async () => {
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
    service = new GetOrFindGroupsService(account, defaultApiClientOptions());
    // flush account related storage before each.
    await service.groupLocalStorage.flush();
  });

  describe("::getOrFindAll", () => {
    it("fetches from the API and initializes the local storage with an empty array when the API returns no groups.", async () => {
      expect.assertions(4);
      jest
        .spyOn(FindGroupsService.prototype, "findAllForLocalStorage")
        .mockImplementation(() => new GroupsCollection([]));
      jest.spyOn(FindAndUpdateGroupsLocalStorageService.prototype, "findAndUpdateAll");

      const groups = await service.getOrFindAll();

      expect(FindAndUpdateGroupsLocalStorageService.prototype.findAndUpdateAll).toHaveBeenCalledTimes(1);
      expect(groups).toBeInstanceOf(GroupsCollection);
      expect(groups).toHaveLength(0);
      expect(await service.groupLocalStorage.get()).toEqual([]);
    });

    it("fetches the groups from the API and populates the local storage when the local storage is not initialized.", async () => {
      expect.assertions(4);
      const groupsDto = defaultGroupsDtos();
      jest
        .spyOn(FindGroupsService.prototype, "findAllForLocalStorage")
        .mockImplementation(() => new GroupsCollection(groupsDto));

      const groups = await service.getOrFindAll();

      expect(groups).toHaveLength(groupsDto.length);
      expect(groups.toDto(GroupLocalStorage.DEFAULT_CONTAIN)).toEqual(groupsDto);
      expect(GroupLocalStorage.hasCachedData(account.id)).toBeTruthy();
      expect(await service.groupLocalStorage.get()).toEqual(groupsDto);
    });

    it("retrieves groups from the local storage when the local storage is initialized.", async () => {
      expect.assertions(5);
      const groupsDto = defaultGroupsDtos();
      jest.spyOn(FindGroupsService.prototype, "findAllForLocalStorage");
      await service.groupLocalStorage.set(new GroupsCollection(groupsDto));

      const groups = await service.getOrFindAll();

      expect(FindGroupsService.prototype.findAllForLocalStorage).not.toHaveBeenCalled();
      expect(groups).toHaveLength(groupsDto.length);
      expect(groups.toDto(GroupLocalStorage.DEFAULT_CONTAIN)).toEqual(groupsDto);
      expect(GroupLocalStorage.hasCachedData(account.id)).toBeTruthy();
      expect(await service.groupLocalStorage.get()).toEqual(groupsDto);
    });

    it("does not validate the groups collection if the information is retrieved from the runtime cache.", async () => {
      expect.assertions(2);
      jest.spyOn(FindGroupsService.prototype, "findAllForLocalStorage");
      await service.groupLocalStorage.set(new GroupsCollection(defaultGroupsDtos()));
      jest.spyOn(GroupsCollection.prototype, "validateSchema");

      await service.getOrFindAll();

      expect(FindGroupsService.prototype.findAllForLocalStorage).not.toHaveBeenCalled();
      // Validation must not be triggered by getOrFindAll when the data comes from the runtime cache.
      expect(GroupsCollection.prototype.validateSchema).not.toHaveBeenCalled();
    });

    it("validates groups collection if the local storage has no runtime cache and the information is retrieved from the local storage.", async () => {
      expect.assertions(2);
      jest.spyOn(FindGroupsService.prototype, "findAllForLocalStorage");
      await service.groupLocalStorage.set(new GroupsCollection(defaultGroupsDtos()));
      delete GroupLocalStorage._runtimeCachedData[account.id];
      jest.spyOn(GroupsCollection.prototype, "validateSchema");

      await service.getOrFindAll();

      expect(FindGroupsService.prototype.findAllForLocalStorage).not.toHaveBeenCalled();
      // Validation must be triggered by getOrFindAll when the data is loaded from the disk cache.
      expect(GroupsCollection.prototype.validateSchema).toHaveBeenCalled();
    });
  });

  describe("::getOrFindByIds", () => {
    it("returns only the groups whose ids are in the requested set.", async () => {
      expect.assertions(2);
      const groupsDto = defaultGroupsDtos();
      await service.groupLocalStorage.set(new GroupsCollection(groupsDto));
      const requestedIds = [groupsDto[1].id, groupsDto[3].id, groupsDto[5].id];

      const groups = await service.getOrFindByIds(requestedIds);

      expect(groups).toHaveLength(3);
      expect(groups.extract("id").sort()).toEqual([...requestedIds].sort());
    });

    it("returns an empty collection when none of the ids match.", async () => {
      expect.assertions(1);
      const groupsDto = defaultGroupsDtos();
      await service.groupLocalStorage.set(new GroupsCollection(groupsDto));

      const groups = await service.getOrFindByIds([uuidv4(), uuidv4()]);

      expect(groups).toHaveLength(0);
    });

    it("returns all groups when every group id is requested.", async () => {
      expect.assertions(2);
      const groupsDto = defaultGroupsDtos();
      await service.groupLocalStorage.set(new GroupsCollection(groupsDto));
      const allIds = groupsDto.map((group) => group.id);

      const groups = await service.getOrFindByIds(allIds);

      expect(groups).toHaveLength(groupsDto.length);
      expect(groups.extract("id").sort()).toEqual([...allIds].sort());
    });

    it("fetches from the API when the local storage is not initialized, then filters.", async () => {
      expect.assertions(3);
      const groupsDto = defaultGroupsDtos();
      jest
        .spyOn(FindGroupsService.prototype, "findAllForLocalStorage")
        .mockImplementation(() => new GroupsCollection(groupsDto));
      const requestedIds = [groupsDto[0].id, groupsDto[2].id];

      const groups = await service.getOrFindByIds(requestedIds);

      expect(FindGroupsService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(groups).toHaveLength(2);
      expect(groups.extract("id").sort()).toEqual([...requestedIds].sort());
    });

    it("should assert its parameter.", async () => {
      expect.assertions(1);
      await expect(() => service.getOrFindByIds(["not-a-uuid"])).rejects.toThrow(
        "The given parameter is not a valid array of uuid",
      );
    });
  });
});
