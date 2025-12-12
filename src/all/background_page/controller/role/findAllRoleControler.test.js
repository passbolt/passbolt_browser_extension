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
 * @since         5.8.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import FindAllRoleController from "./findAllRoleControler";
import RolesCollection from "passbolt-styleguide/src/shared/models/entity/role/rolesCollection";
import {rolesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/role/rolesCollection.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindAllRoleController", () => {
  describe("::exec", () => {
    it("Should retrieve all the roles.", async() => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());
      const rolesCollection = new RolesCollection(rolesCollectionDto);
      const controller = new FindAllRoleController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.getOrFindRolesService, "getOrFindAll").mockImplementation(() => rolesCollection);

      const result = await controller.exec();

      expect(result).toBeInstanceOf(RolesCollection);
      expect(result).toStrictEqual(rolesCollection);
      expect(controller.getOrFindRolesService.getOrFindAll).toHaveBeenCalledTimes(1);
    });

    it("Should let error been thrown from the service if any.", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const controller = new FindAllRoleController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.getOrFindRolesService, "getOrFindAll").mockImplementation(() => { throw new Error("Something went wrong!"); });

      await expect(() => controller.exec()).rejects.toThrowError();
    });
  });
});
