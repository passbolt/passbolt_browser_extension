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
import { FolderEvents } from "./folderEvents";
import MoveFolderController from "../controller/move/moveFolderController";
import AccountEntity from "../model/entity/account/accountEntity";
import { defaultAccountDto } from "../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";

describe("FolderEvents", () => {
  describe("passbolt.folders.move-by-id", () => {
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
      FolderEvents.listen(worker, defaultApiClientOptions(), account);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("emits SUCCESS once the move completes, so the requesting flow's port request resolves", async () => {
      expect.assertions(2);
      const requestId = uuidv4();
      const folderId = uuidv4();
      const destinationFolderId = uuidv4();
      const permissionsDto = null;
      const execSpy = jest.spyOn(MoveFolderController.prototype, "exec").mockResolvedValue(undefined);

      await handlers["passbolt.folders.move-by-id"](requestId, folderId, destinationFolderId, permissionsDto);

      expect(execSpy).toHaveBeenCalledWith(folderId, destinationFolderId, permissionsDto);
      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "SUCCESS");
    });

    it("emits ERROR when the move fails, so the requesting flow's port request rejects instead of hanging", async () => {
      expect.assertions(1);
      const requestId = uuidv4();
      const error = new Error("Move failed");
      jest.spyOn(MoveFolderController.prototype, "exec").mockRejectedValue(error);
      jest.spyOn(console, "error").mockImplementation(() => {});

      await handlers["passbolt.folders.move-by-id"](requestId, uuidv4(), null, null);

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "ERROR", error);
    });
  });
});
