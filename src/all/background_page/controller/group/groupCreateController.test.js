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
import GroupCreateController from "./groupCreateController";
import { defaultGroupDto } from "passbolt-styleguide/src/shared/models/entity/group/groupEntity.test.data";
import GroupEntity from "../../model/entity/group/groupEntity";

describe("GroupCreateController", () => {
  let controller, account, apiClientOptions;

  beforeEach(async () => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    controller = new GroupCreateController(null, null, apiClientOptions, account);
  });

  describe("GroupCreateController::exec", () => {
    it("Should create a group via the service.", async () => {
      expect.assertions(2);

      const groupDto = defaultGroupDto({}, { withGroupsUsers: true, withMyGroupUser: true });
      const createdGroupEntity = new GroupEntity(groupDto);

      jest.spyOn(controller.createGroupService, "create").mockResolvedValue(createdGroupEntity);

      const result = await controller.exec(groupDto);

      expect(result).toBeInstanceOf(GroupEntity);
      expect(result.name).toEqual(groupDto.name);
    });

    it("Should call the service with a GroupEntity.", async () => {
      expect.assertions(2);

      const groupDto = defaultGroupDto({}, { withGroupsUsers: true, withMyGroupUser: true });
      const createdGroupEntity = new GroupEntity(groupDto);

      jest.spyOn(controller.createGroupService, "create").mockResolvedValue(createdGroupEntity);

      await controller.exec(groupDto);

      expect(controller.createGroupService.create).toHaveBeenCalledTimes(1);
      expect(controller.createGroupService.create).toHaveBeenCalledWith(expect.any(GroupEntity));
    });

    it("Should throw if the group dto is invalid.", async () => {
      expect.assertions(1);

      const groupDto = { name: "" };

      await expect(controller.exec(groupDto)).rejects.toThrow();
    });
  });
});
