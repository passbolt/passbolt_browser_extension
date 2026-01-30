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
 * @since         5.7.0
 */
import OpenTabController from "./openTabController";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("OpenTabController", () => {
  describe("::exec", () => {
    it("Should open a tab with the given URL", async () => {
      const controller = new OpenTabController(null, null);
      jest.spyOn(browser.tabs, "create");

      expect.assertions(1);
      await controller.exec("https://example.com");
      expect(browser.tabs.create).toHaveBeenCalledWith({ url: "https://example.com" });
    });

    it("Should throw if the URL is not a valid URL format", async () => {
      const controller = new OpenTabController(null, null);

      expect.assertions(1);
      await expect(controller.exec("not-a-valid-url")).rejects.toThrow("Cannot open tab due to an invalid URL");
    });

    it("Should throw if no URL is provided", async () => {
      const controller = new OpenTabController(null, null);

      expect.assertions(1);
      await expect(controller.exec()).rejects.toThrow();
    });

    it("Should throw if the URL is not a string", async () => {
      const controller = new OpenTabController(null, null);

      expect.assertions(1);
      await expect(controller.exec(123)).rejects.toThrow();
    });
  });
});
