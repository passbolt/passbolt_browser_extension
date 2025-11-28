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
 * @since         5.7.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import RolesUpdateLocalStorageController from "./rolesUpdateLocalStorageController";

describe("RolesUpdateLocalStorageController", () => {
  beforeEach(() => {
    jest.resetModules();
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
});
