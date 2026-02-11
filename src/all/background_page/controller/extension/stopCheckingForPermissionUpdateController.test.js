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
import StopCheckingForPermissionUpdateController from "./stopCheckingForPermissionUpdateController";
import CheckForPermissionUpdateService from "../../service/extension/checkForPermissionUpdateService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("StopCheckingForPermissionUpdateController", () => {
  describe("::exec", () => {
    it("Should call the service stop method", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(CheckForPermissionUpdateService, "stop").mockImplementation(() => {});
      // process
      const controller = new StopCheckingForPermissionUpdateController(null, null);
      await controller.exec();
      // expectations
      expect(CheckForPermissionUpdateService.stop).toHaveBeenCalled();
    });

    it("Should propagate errors from the service", async () => {
      expect.assertions(1);
      // mock data
      const error = new Error("An error occurred");
      // mock functions
      jest.spyOn(CheckForPermissionUpdateService, "stop").mockImplementation(() => {
        throw error;
      });
      // process
      const controller = new StopCheckingForPermissionUpdateController(null, null);
      // expectations
      await expect(controller.exec()).rejects.toThrow(error);
    });
  });
});
