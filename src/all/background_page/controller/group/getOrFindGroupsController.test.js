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
import GetOrFindGroupsController from "./getOrFindGroupsController";
import GroupsCollection from "passbolt-styleguide/src/shared/models/entity/group/groupsCollection";
import { defaultGroupsDtos } from "passbolt-styleguide/src/shared/models/entity/group/groupsCollection.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GetOrFindGroupsController", () => {
  describe("::exec", () => {
    it("Should retrieve the groups matching the given ids.", async () => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const groupsDto = defaultGroupsDtos();
      const groupsCollection = new GroupsCollection(groupsDto);
      const requestedIds = [groupsDto[1].id, groupsDto[3].id];
      const controller = new GetOrFindGroupsController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.getOrFindGroupsService, "getOrFindByIds").mockImplementation(() => groupsCollection);

      const result = await controller.exec(requestedIds);

      expect(result).toBeInstanceOf(GroupsCollection);
      expect(result).toStrictEqual(groupsCollection);
      expect(controller.getOrFindGroupsService.getOrFindByIds).toHaveBeenCalledWith(requestedIds);
    });

    it("Should let error been thrown from the service if any.", async () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const controller = new GetOrFindGroupsController(null, null, defaultApiClientOptions(), account);
      const requestedIds = [defaultGroupsDtos()[0].id];
      jest.spyOn(controller.getOrFindGroupsService, "getOrFindByIds").mockImplementation(() => {
        throw new Error("Something went wrong!");
      });

      await expect(() => controller.exec(requestedIds)).rejects.toThrow();
    });

    it("Should assert its parameter.", async () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const controller = new GetOrFindGroupsController(null, null, defaultApiClientOptions(), account);

      await expect(() => controller.exec(["not-a-uuid"])).rejects.toThrow(
        "The given parameter is not a valid array of uuid",
      );
    });
  });
});
