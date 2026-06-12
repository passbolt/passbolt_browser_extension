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
 * @since         5.7.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import FindAndUpdateGroupsLocalStorageService from "./findAndUpdateGroupsLocalStorageService";
import GroupsCollection from "passbolt-styleguide/src/shared/models/entity/group/groupsCollection";
import { defaultGroupDto } from "passbolt-styleguide/src/shared/models/entity/group/groupEntity.test.data";
import { defaultGroupsDtos } from "passbolt-styleguide/src/shared/models/entity/group/groupsCollection.test.data";
import FindGroupsService from "./findGroupsService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindAndUpdateGroupsLocalStorageService", () => {
  let findAndUpdateGroupsLocalStorageService, account, apiClientOptions;

  beforeEach(async () => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    findAndUpdateGroupsLocalStorageService = new FindAndUpdateGroupsLocalStorageService(account, apiClientOptions);
    // flush account related storage before each.
    findAndUpdateGroupsLocalStorageService.groupLocalStorage.flush();
  });

  describe("::findAndUpdateAll", () => {
    it("retrieves the groups from the API and store them into the local storage.", async () => {
      expect.assertions(2);
      const groupsDtos = defaultGroupsDtos();
      const collection = new GroupsCollection(groupsDtos);
      jest
        .spyOn(findAndUpdateGroupsLocalStorageService.findGroupsService, "findAllForLocalStorage")
        .mockImplementation(() => collection);

      const entity = await findAndUpdateGroupsLocalStorageService.findAndUpdateAll();

      expect(entity.toDto()).toEqual(groupsDtos);
      const storageValue = await findAndUpdateGroupsLocalStorageService.groupLocalStorage.get();
      expect(storageValue).toEqual(groupsDtos);
    });

    it("overrides local storage with an update call.", async () => {
      expect.assertions(6);
      const cachedGroupsDtos = defaultGroupsDtos();
      const groupsDtos = JSON.parse(JSON.stringify(cachedGroupsDtos));

      // Modify the copied object to make it different
      groupsDtos.forEach((group) => {
        group.name = `${group.name} (modified)`;
      });

      const cachedCollection = new GroupsCollection(cachedGroupsDtos);
      const collection = new GroupsCollection(groupsDtos);

      // Set data in local storage
      await findAndUpdateGroupsLocalStorageService.groupLocalStorage.set(cachedCollection);

      // Verify initial storage value
      let storageValue = await findAndUpdateGroupsLocalStorageService.groupLocalStorage.get();
      expect(storageValue).toEqual(cachedGroupsDtos);
      expect(storageValue).not.toEqual(groupsDtos);

      // Mock the service call
      jest
        .spyOn(findAndUpdateGroupsLocalStorageService.findGroupsService, "findAllForLocalStorage")
        .mockImplementation(() => collection);

      // Perform the update
      const entity = await findAndUpdateGroupsLocalStorageService.findAndUpdateAll();

      // Verify the results
      expect(entity.toDto()).toEqual(groupsDtos);

      // Verify the storage was updated
      storageValue = await findAndUpdateGroupsLocalStorageService.groupLocalStorage.get();
      expect(storageValue).not.toEqual(cachedGroupsDtos);
      expect(storageValue).toEqual(groupsDtos);

      // Additional check for strict equality
      expect(storageValue === groupsDtos).toBe(false);
    });

    it("should return cached data if lock is not granted initially", async () => {
      expect.assertions(3);

      const groupsDto = defaultGroupsDtos();
      const groupsCollection = new GroupsCollection(groupsDto);
      let resolve;
      const promise = new Promise((_resolve) => (resolve = _resolve));
      jest.spyOn(FindGroupsService.prototype, "findAllForLocalStorage").mockImplementation(() => promise);

      findAndUpdateGroupsLocalStorageService.findAndUpdateAll();
      const promiseSecondCall = findAndUpdateGroupsLocalStorageService.findAndUpdateAll();
      resolve(groupsCollection);
      await promiseSecondCall;

      const groupsLSDto = await findAndUpdateGroupsLocalStorageService.groupLocalStorage.get();

      expect(FindGroupsService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(groupsLSDto).toHaveLength(10);
      expect(groupsLSDto).toEqual(groupsDto);
    });
  });

  describe("::findForLocalStorageByIds", () => {
    it("should return only the requested groups from local storage when all ids are present", async () => {
      expect.assertions(3);

      const groupsDtos = defaultGroupsDtos(5);
      const collection = new GroupsCollection(groupsDtos);
      await findAndUpdateGroupsLocalStorageService.groupLocalStorage.set(collection);

      const requestedIds = [groupsDtos[0].id, groupsDtos[2].id];
      jest.spyOn(findAndUpdateGroupsLocalStorageService.groupApiService, "findAll");

      const result = await findAndUpdateGroupsLocalStorageService.findForLocalStorageByIds(requestedIds);

      expect(findAndUpdateGroupsLocalStorageService.groupApiService.findAll).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(GroupsCollection);
      expect(result.items.map((g) => g.id)).toStrictEqual(requestedIds);
    });

    it("should fetch missing groups from the API, add them to local storage, and return the full requested collection", async () => {
      expect.assertions(5);

      const storedGroupsDtos = defaultGroupsDtos(3);
      const storedCollection = new GroupsCollection(storedGroupsDtos);
      await findAndUpdateGroupsLocalStorageService.groupLocalStorage.set(storedCollection);

      const missingGroupDto = defaultGroupDto();
      jest
        .spyOn(findAndUpdateGroupsLocalStorageService.groupApiService, "findAll")
        .mockResolvedValue({ body: [missingGroupDto] });

      const requestedIds = [storedGroupsDtos[0].id, missingGroupDto.id];
      const result = await findAndUpdateGroupsLocalStorageService.findForLocalStorageByIds(requestedIds);

      expect(findAndUpdateGroupsLocalStorageService.groupApiService.findAll).toHaveBeenCalledTimes(1);
      expect(findAndUpdateGroupsLocalStorageService.groupApiService.findAll).toHaveBeenCalledWith(
        { groups_users: true, my_group_user: true },
        { "has-id": [missingGroupDto.id] },
      );
      expect(result).toBeInstanceOf(GroupsCollection);
      expect(result.items.map((g) => g.id)).toStrictEqual(requestedIds);

      const storageValue = await findAndUpdateGroupsLocalStorageService.groupLocalStorage.get();
      expect(storageValue.find((dto) => dto.id === missingGroupDto.id)).toBeDefined();
    });

    it("should not call the API twice when two concurrent calls have the same missing group", async () => {
      expect.assertions(3);

      const storedGroupsDtos = defaultGroupsDtos(3);
      const storedCollection = new GroupsCollection(storedGroupsDtos);
      await findAndUpdateGroupsLocalStorageService.groupLocalStorage.set(storedCollection);

      const missingGroupDto = defaultGroupDto();
      let resolveApiCall;
      const apiPromise = new Promise((resolve) => (resolveApiCall = resolve));

      jest
        .spyOn(findAndUpdateGroupsLocalStorageService.groupApiService, "findAll")
        .mockImplementationOnce(() => apiPromise);

      const requestedIds = [storedGroupsDtos[0].id, missingGroupDto.id];

      const promise1 = findAndUpdateGroupsLocalStorageService.findForLocalStorageByIds(requestedIds);
      const promise2 = findAndUpdateGroupsLocalStorageService.findForLocalStorageByIds(requestedIds);

      resolveApiCall({ body: [missingGroupDto] });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(findAndUpdateGroupsLocalStorageService.groupApiService.findAll).toHaveBeenCalledTimes(1);
      expect(result1.items.map((g) => g.id)).toStrictEqual(requestedIds);
      expect(result2.items.map((g) => g.id)).toStrictEqual(requestedIds);
    });

    it("should throw if the parameter is not a valid array of UUIDs", async () => {
      expect.assertions(1);

      await expect(findAndUpdateGroupsLocalStorageService.findForLocalStorageByIds(["not-a-uuid"])).rejects.toThrow();
    });
  });
});
