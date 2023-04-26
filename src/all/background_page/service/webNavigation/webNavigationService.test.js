/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import PortManager from "../../sdk/port/portManager";
import PagemodManager from "../../pagemod/pagemodManager";
import WebNavigationService from "./webNavigationService";

jest.spyOn(PortManager, "onTabRemoved");
jest.spyOn(PagemodManager, "exec");

describe("NavigationService", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("NavigationService::exec", () => {
    it("Should remove port and exec pagemod manager", async() => {
      expect.assertions(2);
      // data mocked
      const frameDetails = {
        url: "https://localhost",
        tabId: 1234,
        frameId: 0
      };
      // process
      await WebNavigationService.exec(frameDetails);
      // expectations
      expect(PortManager.onTabRemoved).toHaveBeenCalledWith(frameDetails.tabId);
      expect(PagemodManager.exec).toHaveBeenCalledWith(frameDetails);
    });

    it("Should only exec pagemod manager", async() => {
      expect.assertions(2);
      // data mocked
      const frameDetails = {
        url: "https://localhost",
        tabId: 1234,
        frameId: 1234
      };
      // process
      await WebNavigationService.exec(frameDetails);
      // expectations
      expect(PortManager.onTabRemoved).not.toHaveBeenCalled();
      expect(PagemodManager.exec).toHaveBeenCalledWith(frameDetails);
    });
  });
});
