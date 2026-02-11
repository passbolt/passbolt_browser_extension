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
import OpenWebsiteGettingStartedPageService from "./openWebsiteGettingStartedPageService";
import BrowserTabService from "./browserTab.service";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("OpenWebsiteGettingStartedPageService", () => {
  describe("::openTab", () => {
    it("Should open a new tab with the Passbolt getting started URL", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(BrowserTabService, "openTab").mockImplementation(() => {});
      // process
      const service = new OpenWebsiteGettingStartedPageService();
      await service.openTab();
      // expectations
      expect(BrowserTabService.openTab).toHaveBeenCalledWith("https://www.passbolt.com/start");
    });

    it("Should propagate errors from BrowserTabService", async () => {
      expect.assertions(1);
      // mock data
      const error = new Error("Cannot open tab due to an invalid URL");
      // mock functions
      jest.spyOn(BrowserTabService, "openTab").mockRejectedValue(error);
      // process
      const service = new OpenWebsiteGettingStartedPageService();
      // expectations
      await expect(service.openTab()).rejects.toThrow(error);
    });
  });
});
