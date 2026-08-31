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
 * @since         5.16.0
 */

import { v4 as uuidv4 } from "uuid";
import { ResourceEvents } from "./resourceEvents";
import MoveResourcesController from "../controller/move/moveResourcesController";
import AccountEntity from "../model/entity/account/accountEntity";
import { defaultAccountDto } from "../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";

describe("ResourceEvents", () => {
  describe("passbolt.resources.move-by-ids", () => {
    let worker, handlers, account;

    beforeEach(() => {
      handlers = {};
      worker = {
        port: {
          on: (name, handler) => {
            handlers[name] = handler;
          },
          emit: jest.fn(),
        },
      };
      account = new AccountEntity(defaultAccountDto());
      ResourceEvents.listen(worker, defaultApiClientOptions(), account);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("forwards the operator-confirmed permissions and emits SUCCESS with the move result", async () => {
      expect.assertions(2);
      const requestId = uuidv4();
      const resourcesIds = [uuidv4(), uuidv4()];
      const destinationFolderId = uuidv4();
      const permissionsDto = { [resourcesIds[0]]: [] };
      const result = { skippedResourceIds: [] };
      const execSpy = jest.spyOn(MoveResourcesController.prototype, "exec").mockResolvedValue(result);

      await handlers["passbolt.resources.move-by-ids"](requestId, resourcesIds, destinationFolderId, permissionsDto);

      expect(execSpy).toHaveBeenCalledWith(resourcesIds, destinationFolderId, permissionsDto);
      // The skipped ids go back to the flow, which shows a warning instead of a success.
      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "SUCCESS", result);
    });

    it("emits ERROR when the move fails, so the requesting flow's port request rejects instead of hanging", async () => {
      expect.assertions(1);
      const requestId = uuidv4();
      const error = new Error("Move failed");
      jest.spyOn(MoveResourcesController.prototype, "exec").mockRejectedValue(error);
      jest.spyOn(console, "error").mockImplementation(() => {});

      await handlers["passbolt.resources.move-by-ids"](requestId, [uuidv4()], null, null);

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "ERROR", error);
    });
  });
});
