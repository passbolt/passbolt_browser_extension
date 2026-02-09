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
import IsExtensionAllowedOnEveryWebsiteController from "./isExtensionAllowedOnEveryWebsiteController";
import ExtensionPermissionsService from "../../service/extension/extensionPermissionsService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("IsExtensionAllowedOnEveryWebsiteController", () => {
  describe("::exec", () => {
    it("Should return true when the extension is allowed on every website", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(ExtensionPermissionsService, "isAllowedOnEveryWebsite").mockResolvedValue(true);
      // process
      const controller = new IsExtensionAllowedOnEveryWebsiteController(null, null);
      const result = await controller.exec();
      // expectations
      expect(result).toBe(true);
    });

    it("Should return false when the extension is not allowed on every website", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(ExtensionPermissionsService, "isAllowedOnEveryWebsite").mockResolvedValue(false);
      // process
      const controller = new IsExtensionAllowedOnEveryWebsiteController(null, null);
      const result = await controller.exec();
      // expectations
      expect(result).toBe(false);
    });

    it("Should propagate errors from the service", async () => {
      expect.assertions(1);
      // mock data
      const error = new Error("Permissions API unavailable");
      // mock functions
      jest.spyOn(ExtensionPermissionsService, "isAllowedOnEveryWebsite").mockRejectedValue(error);
      // process
      const controller = new IsExtensionAllowedOnEveryWebsiteController(null, null);
      // expectations
      await expect(controller.exec()).rejects.toThrow(error);
    });
  });
});
