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

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import ResourceUpdateLocalStorageController from "./resourceUpdateLocalStorageController";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";

describe("ResourceUpdateLocalStorageController", () => {
  let controller, worker;

  beforeEach(() => {
    worker = {
      port: {
        emit: jest.fn()
      }
    };
    const account = new AccountEntity(defaultAccountDto());
    const apiClientOptions = defaultApiClientOptions();
    controller = new ResourceUpdateLocalStorageController(worker, null, apiClientOptions, account);
  });
  describe("ResourceUpdateLocalStorageController::_exec", () => {
    it("Should call the resourceLocalStorageUpdateService and emit a success message", async() => {
      expect.assertions(3);

      jest.spyOn(controller.updateResourcesLocalStorageService, "updateAll").mockImplementationOnce(jest.fn());
      await controller._exec({updatePeriodThreshold: 10000});

      expect(controller.updateResourcesLocalStorageService.updateAll).toHaveBeenCalledTimes(1);
      expect(controller.updateResourcesLocalStorageService.updateAll).toHaveBeenCalledWith({updatePeriodThreshold: 10000});
      expect(controller.worker.port.emit).toHaveBeenCalledWith(null, 'SUCCESS');
    });

    it("Should call the resourceUpdateService and emit an error message", async() => {
      expect.assertions(2);

      const error = new Error();
      jest.spyOn(controller.updateResourcesLocalStorageService, "updateAll").mockImplementationOnce(() => { throw error; });
      await controller._exec();

      expect(controller.updateResourcesLocalStorageService.updateAll).toHaveBeenCalledWith({});
      expect(controller.worker.port.emit).toHaveBeenCalledWith(null, 'ERROR', error);
    });
  });
});
