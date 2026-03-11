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
import OpenWebsiteGettingStartedPageController from "./openWebsiteGettingStartedPageController";
import OpenWebsiteGettingStartedPageService from "../../service/ui/openWebsiteGettingStartedPageService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("OpenWebsiteGettingStartedPageController", () => {
  describe("::exec", () => {
    it("Should call the service to open the getting started page in a new tab", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(OpenWebsiteGettingStartedPageService.prototype, "openTab").mockImplementation(() => {});
      // process
      const controller = new OpenWebsiteGettingStartedPageController(null, null);
      await controller.exec();
      // expectations
      expect(OpenWebsiteGettingStartedPageService.prototype.openTab).toHaveBeenCalled();
    });

    it("Should propagate errors from the service", async () => {
      expect.assertions(1);
      // mock data
      const error = new Error("Cannot open tab due to an invalid URL");
      // mock functions
      jest.spyOn(OpenWebsiteGettingStartedPageService.prototype, "openTab").mockRejectedValue(error);
      // process
      const controller = new OpenWebsiteGettingStartedPageController(null, null);
      // expectations
      await expect(controller.exec()).rejects.toThrow(error);
    });
  });
});
