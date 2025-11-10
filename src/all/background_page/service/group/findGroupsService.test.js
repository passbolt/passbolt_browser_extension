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

import User from "../../model/user";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from '../../model/entity/account/accountEntity.test.data';
import GroupsCollection from "../../model/entity/group/groupsCollection";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import FindGroupsService from "./findGroupsService";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {setupMockData} from "./findGroupsService.test.data";

describe('FindGroupsService', () => {
  let findGroupsService;
  const account = new AccountEntity(defaultAccountDto());
  const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

  beforeEach(async() => {
    findGroupsService = new FindGroupsService(apiClientOptions);
    jest.clearAllMocks();
    await MockExtension.withConfiguredAccount();
  });

  describe('::findAll', () => {
    /**
     * Tests the findAll method of the findGroupsService
     */
    const testFindAll = async(contains, filters, orders, ignoreInvalidEntity) => {
      // Setup mock data for the test
      const groupsDtos = setupMockData();
      // Create a spy on the findAll method of groupApiService and mock its return value
      const spy = jest.spyOn(findGroupsService.groupApiService, 'findAll')
        .mockResolvedValue(groupsDtos);
      // Call the findAll method of findGroupsService with the provided parameters
      const result = await findGroupsService.findAll(contains, filters, orders, ignoreInvalidEntity);
      // Assert that the spy was called with the correct parameters
      expect(spy).toHaveBeenCalledWith(contains, filters, orders);
      // Assert that the result is an instance of GroupsCollection
      expect(result).toBeInstanceOf(GroupsCollection);
      // Assert that the result's id matches the mock data's id
      expect(result.id).toBe(groupsDtos.id);
    };

    it("should find groups with contains, filters, and orders", async() => {
      await testFindAll(
        {groups_users: true, my_group_user: true, modifier: false},
        {"has-users": "user123"},
        {name: "asc"},
        true
      );
    });

    it("should find groups with empty contains, filters, and orders", async() => {
      await testFindAll({}, {}, {}, true);
    });

    it("should find groups with null contains, filters, and orders", async() => {
      await testFindAll(null, null, null, true);
    });

    it("should find groups with ignoreInvalidEntity set to false", async() => {
      await testFindAll(
        {groups_users: true, my_group_user: true, modifier: false},
        null,
        null,
        false
      );
    });

    /*
     * Tests invalid input for the findGroupsService.findAll method.
     * It ensures that the groupApiService.findAll method is not called
     * and that the findGroupsService.findAll method rejects with an error.
     */
    const testInvalidInput = async(param1, param2, param3, param4) => {
      jest.spyOn(findGroupsService.groupApiService, 'findAll');
      await expect(findGroupsService.groupApiService.findAll).not.toHaveBeenCalled();
      await expect(findGroupsService.findAll(param1, param2, param3, param4))
        .rejects.toThrow();
    };

    it('should throw error if contains is not an Object', async() => {
      await testInvalidInput("a string");
    });

    it('should throw error if filters is not an Object', async() => {
      await testInvalidInput(null, "a string");
    });

    it('should throw error if orders is not an Object', async() => {
      await testInvalidInput(null, null, "a string");
    });

    it('should throw error if ignoreInvalidEntity is not a boolean', async() => {
      await testInvalidInput(null, null, null, "a string");
    });
  });

  describe('::findMyGroups', () => {
    it("should find groups the user belongs to", async() => {
      const groupsDtos = setupMockData(10_000);
      const userId = User.getInstance().get().id;
      const filters = {"has-users": userId};

      jest.spyOn(findGroupsService, 'findAll').mockResolvedValue(groupsDtos);

      const result = await findGroupsService.findMyGroups();

      expect(findGroupsService.findAll).toHaveBeenCalledWith(null, filters);
      expect(result).toBeInstanceOf(Array);
      expect(result.id).toBe(groupsDtos.id);
    });
  });

  describe('::findAllForLocalStorage', () => {
    it("should find groups for the local storage", async() => {
      const groupsDtos = setupMockData(10_000);
      const contains = {groups_users: true, my_group_user: true, modifier: false};

      jest.spyOn(findGroupsService, 'findAll').mockResolvedValue(groupsDtos);

      const result = await findGroupsService.findAllForLocalStorage();

      expect(findGroupsService.findAll).toHaveBeenCalledWith(contains, null, null, true);
      expect(result).toBeInstanceOf(Array);
      expect(result.id).toBe(groupsDtos.id);
    });
  });
});
