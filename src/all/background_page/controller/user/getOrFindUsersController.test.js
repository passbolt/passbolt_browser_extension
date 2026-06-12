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
import GetOrFindUsersController from "./getOrFindUsersController";
import UsersCollection from "passbolt-styleguide/src/shared/models/entity/user/usersCollection";
import { defaultUsersDtos } from "passbolt-styleguide/src/shared/models/entity/user/usersCollection.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GetOrFindUsersController", () => {
  describe("::exec", () => {
    it("Should retrieve the users matching the given ids.", async () => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const usersDto = defaultUsersDtos();
      const usersCollection = new UsersCollection(usersDto);
      const requestedIds = [usersDto[1].id, usersDto[3].id];
      const controller = new GetOrFindUsersController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.getOrFindUsersService, "getOrFindByIds").mockImplementation(() => usersCollection);

      const result = await controller.exec(requestedIds);

      expect(result).toBeInstanceOf(UsersCollection);
      expect(result).toStrictEqual(usersCollection);
      expect(controller.getOrFindUsersService.getOrFindByIds).toHaveBeenCalledWith(requestedIds);
    });

    it("Should let error been thrown from the service if any.", async () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const controller = new GetOrFindUsersController(null, null, defaultApiClientOptions(), account);
      const requestedIds = [defaultUsersDtos()[0].id];
      jest.spyOn(controller.getOrFindUsersService, "getOrFindByIds").mockImplementation(() => {
        throw new Error("Something went wrong!");
      });

      await expect(() => controller.exec(requestedIds)).rejects.toThrow();
    });

    it("Should assert its parameter.", async () => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const controller = new GetOrFindUsersController(null, null, defaultApiClientOptions(), account);

      await expect(() => controller.exec(["not-a-uuid"])).rejects.toThrow(
        "The given parameter is not a valid array of uuid",
      );
    });
  });
});
