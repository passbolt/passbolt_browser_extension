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
import OpenSafariExtensionSettingsController from "./openSafariExtensionSettingsController";
import OpenSafariExtensionSettingsService from "../../service/extension/openSafariExtensionSettingsService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("OpenSafariExtensionSettingsController", () => {
  describe("::exec", () => {
    it("Should call the service to open Safari extension settings", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(OpenSafariExtensionSettingsService, "openSettings").mockImplementation(() => {});
      // process
      const controller = new OpenSafariExtensionSettingsController(null, null);
      await controller.exec();
      // expectations
      expect(OpenSafariExtensionSettingsService.openSettings).toHaveBeenCalled();
    });

    it("Should propagate errors from the service", async () => {
      expect.assertions(1);
      // mock data
      const error = new Error("Safari native application execution failed");
      // mock functions
      jest.spyOn(OpenSafariExtensionSettingsService, "openSettings").mockRejectedValue(error);
      // process
      const controller = new OpenSafariExtensionSettingsController(null, null);
      // expectations
      await expect(controller.exec()).rejects.toThrow(error);
    });
  });
});
