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

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import RolesUpdateLocalStorageController from "./rolesUpdateLocalStorageController";
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import {rolesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/role/rolesCollection.test.data";
import RolesLocalStorage from "../../service/local_storage/rolesLocalStorage";
import RolesCollection from "passbolt-styleguide/src/shared/models/entity/role/rolesCollection";

describe("RolesUpdateLocalStorageController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    enableFetchMocks();
  });

  describe("::exec", () => {
    it("Should call for the service to find roles and update the local storage", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const controller = new RolesUpdateLocalStorageController(null, null, apiClientOptions, account);

      jest.spyOn(controller.findAndUpdateRolesLocalStorageService, "findAndUpdateAll").mockResolvedValue(() => {});
      await controller.exec();

      expect(controller.findAndUpdateRolesLocalStorageService.findAndUpdateAll).toHaveBeenCalledTimes(1);
    });

    it("Should not catch errors and let them be thrown", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const controller = new RolesUpdateLocalStorageController(null, null, apiClientOptions, account);

      jest.spyOn(controller.findAndUpdateRolesLocalStorageService, "findAndUpdateAll").mockResolvedValue(() => { throw new Error("Something went wrong!"); });
      await controller.exec();

      expect(controller.findAndUpdateRolesLocalStorageService.findAndUpdateAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("Scenarios", () => {
    it("Should call the API and update the local storage with its response", async() => {
      expect.assertions(4);

      const localStorageBeforeCall = await RolesLocalStorage.get();
      expect(localStorageBeforeCall).toBeUndefined();

      const account = new AccountEntity(defaultAccountDto());
      const controller = new RolesUpdateLocalStorageController(null, null, defaultApiClientOptions(), account);

      const allRoles = rolesCollectionDto;
      const expectedRoles = allRoles.filter(r => r.name !== "guest");

      jest.spyOn(RolesLocalStorage, "set");
      fetch.doMockOnceIf(/roles\.json/, () => mockApiResponse(expectedRoles));

      await controller.exec();

      const localStorageAfterCall = await RolesLocalStorage.get();
      expect(localStorageAfterCall).toStrictEqual(expectedRoles);
      expect(RolesLocalStorage.set).toHaveBeenCalledTimes(1);
      expect(RolesLocalStorage.set).toHaveBeenCalledWith(new RolesCollection(expectedRoles));
    });

    it("Should let errors be thrown if something goes wrong on the API", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const controller = new RolesUpdateLocalStorageController(null, null, defaultApiClientOptions(), account);

      fetch.doMockOnceIf(/roles\.json/, () => mockApiResponseError(500, "Something went wrong!"));

      await expect(() => controller.exec()).rejects.toThrowError("Something went wrong!");
    });
  });
});
