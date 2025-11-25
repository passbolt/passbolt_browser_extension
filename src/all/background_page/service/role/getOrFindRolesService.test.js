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
import GetOrFindRolesService from "./getOrFindRolesService";
import RolesCollection from "passbolt-styleguide/src/shared/models/entity/role/rolesCollection";
import {defaultApiClientOptions} from 'passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data';
import RolesLocalStorage from "../local_storage/rolesLocalStorage";
import {rolesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/role/rolesCollection.test.data";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("GetOrFindRolesService", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());
  const apiClientOptions = defaultApiClientOptions();

  describe("::getOrFindAll", () => {
    it("retrieves roles from the API when the local storage is not initialized", async() => {
      expect.assertions(2);

      const rolesCollection = new RolesCollection(rolesCollectionDto);
      const service = new GetOrFindRolesService(account, apiClientOptions);
      jest.spyOn(service.findAndUpdateRolesLocalStorage, "findAndUpdateAll").mockImplementation(async() => rolesCollection);

      const result = await service.getOrFindAll();

      expect(service.findAndUpdateRolesLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(rolesCollection);
    });

    it("retrieves roles from the local storage when it is initialised.", async() => {
      expect.assertions(2);

      const rolesCollection = new RolesCollection(rolesCollectionDto);
      await RolesLocalStorage.set(rolesCollection);

      const service = new GetOrFindRolesService(account, apiClientOptions);
      jest.spyOn(service.findAndUpdateRolesLocalStorage, "findAndUpdateAll");

      const result = await service.getOrFindAll();

      expect(service.findAndUpdateRolesLocalStorage.findAndUpdateAll).not.toHaveBeenCalled();
      expect(result).toStrictEqual(rolesCollection);
    });
  });
});
