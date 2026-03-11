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
import OpenAdministrationPageController from "./openAdministrationPageController";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("OpenAdministrationPageController", () => {
  describe("::exec", () => {
    it("Should call the service to open the administration page", async () => {
      expect.assertions(1);
      // mock data
      const pageName = "/app/administration/mfa";

      // mock functions
      const controller = new OpenAdministrationPageController(null, null);
      jest.spyOn(controller.openAdministrationApiPageService, "openPage").mockImplementation(() => {});

      // process
      await controller.exec(pageName);
      // expectations
      expect(controller.openAdministrationApiPageService.openPage).toHaveBeenCalledWith(pageName);
    });

    it("Should propagate errors from the service", async () => {
      expect.assertions(1);
      // mock data
      const pageName = "/app/administration/unknown";
      const error = new Error("Unknown administration page");
      // mock functions
      const controller = new OpenAdministrationPageController(null, null);
      jest.spyOn(controller.openAdministrationApiPageService, "openPage").mockRejectedValue(error);
      // expectations
      await expect(controller.exec(pageName)).rejects.toThrow(error);
    });
  });
});
