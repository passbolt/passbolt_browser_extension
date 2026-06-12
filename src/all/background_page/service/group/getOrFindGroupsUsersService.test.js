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
import GetOrFindGroupsUsersService from "./getOrFindGroupsUsersService";
import FindGroupsService from "./findGroupsService";
import GroupsCollection from "passbolt-styleguide/src/shared/models/entity/group/groupsCollection";
import GroupsUsersCollection from "passbolt-styleguide/src/shared/models/entity/groupUser/groupsUsersCollection";
import { defaultGroupsDtos } from "passbolt-styleguide/src/shared/models/entity/group/groupsCollection.test.data";

describe("GetOrFindGroupsUsersService", () => {
  let service, account;

  beforeEach(async () => {
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
    service = new GetOrFindGroupsUsersService(account, defaultApiClientOptions());
    // flush account related storage before each.
    await service.getOrFindGroupsService.groupLocalStorage.flush();
  });

  describe("::getOrFindByGroupId", () => {
    it("returns the members of the requested group when the local storage is populated.", async () => {
      expect.assertions(3);
      const groupsDto = defaultGroupsDtos(5, { withGroupsUsers: 3 });
      await service.getOrFindGroupsService.groupLocalStorage.set(new GroupsCollection(groupsDto));
      const targetGroup = groupsDto[2];

      const result = await service.getOrFindByGroupId(targetGroup.id);

      expect(result).toBeInstanceOf(GroupsUsersCollection);
      expect(result).toHaveLength(3);
      expect(result.items.every((groupUser) => groupUser.groupId === targetGroup.id)).toBe(true);
    });

    it("returns an empty GroupsUsersCollection when the group has no members.", async () => {
      expect.assertions(2);
      const groupsDto = defaultGroupsDtos(1, { withGroupsUsers: 0 });
      await service.getOrFindGroupsService.groupLocalStorage.set(new GroupsCollection(groupsDto));

      const result = await service.getOrFindByGroupId(groupsDto[0].id);

      expect(result).toBeInstanceOf(GroupsUsersCollection);
      expect(result).toHaveLength(0);
    });

    it("fetches from the API when the local storage is not initialized, then returns the requested group's members.", async () => {
      expect.assertions(3);
      const groupsDto = defaultGroupsDtos(3, { withGroupsUsers: 2 });
      jest
        .spyOn(FindGroupsService.prototype, "findAllForLocalStorage")
        .mockImplementation(() => new GroupsCollection(groupsDto));
      const targetGroup = groupsDto[1];

      const result = await service.getOrFindByGroupId(targetGroup.id);

      expect(FindGroupsService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(GroupsUsersCollection);
      expect(result).toHaveLength(2);
    });

    it("throws when the group id does not exist.", async () => {
      expect.assertions(1);
      const groupsDto = defaultGroupsDtos();
      await service.getOrFindGroupsService.groupLocalStorage.set(new GroupsCollection(groupsDto));
      const missingId = uuidv4();

      await expect(() => service.getOrFindByGroupId(missingId)).rejects.toThrow(
        `The group with id ${missingId} could not be found.`,
      );
    });

    it("should assert its parameter.", async () => {
      expect.assertions(1);
      await expect(() => service.getOrFindByGroupId("not-a-uuid")).rejects.toThrow(
        "The given parameter is not a valid UUID",
      );
    });
  });
});
