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
 * @since         5.10.0
 */
import StartCheckingForPermissionUpdateController from "./startCheckingForPermissionUpdateController";
import CheckForPermissionUpdateService from "../../service/extension/checkForPermissionUpdateService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("StartCheckingForPermissionUpdateController", () => {
  describe("::exec", () => {
    it("Should call the service start method with the worker", async () => {
      expect.assertions(1);
      // mock data
      const worker = { port: { emit: jest.fn() } };
      // mock functions
      jest.spyOn(CheckForPermissionUpdateService, "start").mockImplementation(() => {});
      // process
      const controller = new StartCheckingForPermissionUpdateController(worker, null);
      await controller.exec();
      // expectations
      expect(CheckForPermissionUpdateService.start).toHaveBeenCalledWith(worker);
    });

    it("Should propagate errors from the service", async () => {
      expect.assertions(1);
      // mock data
      const error = new Error("An error occurred");
      // mock functions
      jest.spyOn(CheckForPermissionUpdateService, "start").mockImplementation(() => {
        throw error;
      });
      // process
      const controller = new StartCheckingForPermissionUpdateController(null, null);
      // expectations
      await expect(controller.exec()).rejects.toThrow(error);
    });
  });
});
