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
 * @since         5.11.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import CreateGroupService from "./createGroupService";
import GroupEntity from "../../model/entity/group/groupEntity";
import { defaultGroupDto } from "passbolt-styleguide/src/shared/models/entity/group/groupEntity.test.data";

describe("CreateGroupService", () => {
  let createGroupService, account;

  beforeEach(async () => {
    account = new AccountEntity(defaultAccountDto());
    const apiClientOptions = defaultApiClientOptions();
    createGroupService = new CreateGroupService(apiClientOptions, account);
    jest.clearAllMocks();
  });

  describe("::create", () => {
    it("Should create a group through the API and add it to local storage.", async () => {
      expect.assertions(4);

      const groupDto = defaultGroupDto({}, { withGroupsUsers: true });
      const groupEntity = new GroupEntity(groupDto);
      const createdGroupDto = defaultGroupDto(
        { name: groupDto.name },
        { withGroupsUsers: true, withMyGroupUser: true },
      );

      jest.spyOn(createGroupService.groupApiService, "create").mockResolvedValue(createdGroupDto);
      jest.spyOn(createGroupService.groupLocalStorage, "addGroup").mockResolvedValue();

      const result = await createGroupService.create(groupEntity);

      expect(result).toBeInstanceOf(GroupEntity);
      expect(result.name).toEqual(groupDto.name);
      expect(createGroupService.groupApiService.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: groupDto.name }),
        { groups_users: true, my_group_user: true },
      );
      expect(createGroupService.groupLocalStorage.addGroup).toHaveBeenCalledTimes(1);
    });

    it("Should throw if the API call fails.", async () => {
      expect.assertions(1);

      const groupEntity = new GroupEntity(defaultGroupDto());
      const error = new Error();

      jest.spyOn(createGroupService.groupApiService, "create").mockRejectedValue(error);

      await expect(createGroupService.create(groupEntity)).rejects.toThrow(error);
    });
  });
});
