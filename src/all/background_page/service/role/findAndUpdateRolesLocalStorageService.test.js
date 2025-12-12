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
import RolesCollection from "passbolt-styleguide/src/shared/models/entity/role/rolesCollection";
import RolesLocalStorage from "../local_storage/rolesLocalStorage";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {rolesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/role/rolesCollection.test.data";
import FindAndUpdateRolesLocalStorageService from "./findAndUpdateRolesLocalStorageService";

describe("FindAndUpdateRolesLocalStorageService", () => {
  describe("::findAndUpdateAll", () => {
    it("should call the API to retrieve the data and set the local storage", async() => {
      expect.assertions(5);
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const rolesCollection = new RolesCollection(rolesCollectionDto);

      const service = new FindAndUpdateRolesLocalStorageService(account, apiClientOptions);
      jest.spyOn(service.findRolesService, "findAll").mockImplementation(() => rolesCollection);

      const localStorageStateBefore = await RolesLocalStorage.get();
      expect(localStorageStateBefore).toBeUndefined();

      const resultCollection = await service.findAndUpdateAll();
      expect(service.findRolesService.findAll).toHaveBeenCalledTimes(1);
      expect(service.findRolesService.findAll).toHaveBeenCalledWith({ignoreInvalidEntity: true});
      expect(resultCollection).toStrictEqual(rolesCollection);

      const localStorageStateAfter = await RolesLocalStorage.get();
      expect(localStorageStateAfter).toStrictEqual(rolesCollection.toDto());
    });

    it("should call the API only once if the API did not responded yet", async() => {
      expect.assertions(3);

      let resolve;
      const promise = new Promise(_resolve => resolve = _resolve);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const rolesCollection = new RolesCollection(rolesCollectionDto);
      const service = new FindAndUpdateRolesLocalStorageService(account, apiClientOptions);
      jest.spyOn(service.findRolesService, "findAll").mockImplementation(() => promise);

      service.findAndUpdateAll();
      const promiseSecondCall = service.findAndUpdateAll();

      resolve(rolesCollection);
      await promiseSecondCall;

      const rolesCollectionLocalStorage = await RolesLocalStorage.get();

      expect(service.findRolesService.findAll).toHaveBeenCalledTimes(1);
      expect(service.findRolesService.findAll).toHaveBeenCalledWith({ignoreInvalidEntity: true});
      expect(rolesCollectionLocalStorage).toEqual(rolesCollection.toDto());
    });
  });
});
