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

import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import GetOrFindGroupsUsersController from "./getOrFindGroupsUsersController";
import GroupsUsersCollection from "passbolt-styleguide/src/shared/models/entity/groupUser/groupsUsersCollection";
import { defaultGroupsDtos } from "passbolt-styleguide/src/shared/models/entity/group/groupsCollection.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GetOrFindGroupsUsersController", () => {
  describe("::exec", () => {
    it("Should retrieve the members of the requested group.", async () => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const groupsDto = defaultGroupsDtos(1, { withGroupsUsers: 3 });
      const targetGroup = groupsDto[0];
      const groupsUsersCollection = new GroupsUsersCollection(targetGroup.groups_users);
      const controller = new GetOrFindGroupsUsersController(null, null, defaultApiClientOptions(), account);
      jest
        .spyOn(controller.getOrFindGroupsUsersService, "getOrFindByGroupId")
        .mockImplementation(() => groupsUsersCollection);

      const result = await controller.exec(targetGroup.id);

      expect(result).toBeInstanceOf(GroupsUsersCollection);
      expect(result).toStrictEqual(groupsUsersCollection);
      expect(controller.getOrFindGroupsUsersService.getOrFindByGroupId).toHaveBeenCalledWith(targetGroup.id);
    });

    it("Should let error been thrown from the service if any.", async () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const controller = new GetOrFindGroupsUsersController(null, null, defaultApiClientOptions(), account);
      const groupId = defaultGroupsDtos()[0].id;
      jest.spyOn(controller.getOrFindGroupsUsersService, "getOrFindByGroupId").mockImplementation(() => {
        throw new Error("Something went wrong!");
      });

      await expect(() => controller.exec(groupId)).rejects.toThrow();
    });

    it("Should assert its parameter.", async () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const controller = new GetOrFindGroupsUsersController(null, null, defaultApiClientOptions(), account);

      await expect(() => controller.exec("not-a-uuid")).rejects.toThrow("The given parameter is not a valid UUID");
    });
  });
});
