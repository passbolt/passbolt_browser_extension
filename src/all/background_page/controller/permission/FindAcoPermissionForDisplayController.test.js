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
 * @since         4.9.4
 */

import AppPagemod from "../../pagemod/appPagemod";
import {v4 as uuidv4} from "uuid";
import {readWorker} from "../../model/entity/worker/workerEntity.test.data";
import FindAcoPermissionsForDisplayController from "./FindAcoPermissionsForDisplayController";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";


describe("FindAcoPermissionsForDisplayController", () => {
  const account = new AccountEntity(defaultAccountDto());

  describe("FindAcoPermissionsForDisplayController::exec", () => {
    it("Should find all permission from a resource id.", async() => {
      expect.assertions(2);

      // initialisation
      const requestId = uuidv4();
      const worker = readWorker({name: AppPagemod.appName});
      const controller = new FindAcoPermissionsForDisplayController(worker, requestId, defaultApiClientOptions(), account);
      const resourceId = uuidv4();
      // mocked function
      jest.spyOn(controller.findPermissionService, "findAllByAcoForeignKeyForDisplay").mockImplementationOnce(jest.fn());

      // process
      await controller.exec(resourceId);

      // expectations
      expect(controller.findPermissionService.findAllByAcoForeignKeyForDisplay).toHaveBeenCalledTimes(1);
      expect(controller.findPermissionService.findAllByAcoForeignKeyForDisplay).toHaveBeenCalledWith(resourceId);
    });
  });
});

