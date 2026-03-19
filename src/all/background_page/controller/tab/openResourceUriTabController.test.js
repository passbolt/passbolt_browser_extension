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
 * @since         5.11.0
 */
import OpenResourceUriTabController from "./openResourceUriTabController";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("OpenResourceUriTabController", () => {
  describe("::exec", () => {
    it("Should open a tab with a valid HTTPS URL", async () => {
      const controller = new OpenResourceUriTabController(null, null);
      jest.spyOn(browser.tabs, "create");

      expect.assertions(1);
      await controller.exec("https://example.com");
      expect(browser.tabs.create).toHaveBeenCalledWith({ url: "https://example.com/" });
    });

    it("Should open a tab with a valid HTTP URL", async () => {
      const controller = new OpenResourceUriTabController(null, null);
      jest.spyOn(browser.tabs, "create");

      expect.assertions(1);
      await controller.exec("http://example.com");
      expect(browser.tabs.create).toHaveBeenCalledWith({ url: "http://example.com/" });
    });

    it("Should default to HTTPS when no protocol is provided", async () => {
      const controller = new OpenResourceUriTabController(null, null);
      jest.spyOn(browser.tabs, "create");

      expect.assertions(1);
      await controller.exec("example.com");
      expect(browser.tabs.create).toHaveBeenCalledWith({ url: "https://example.com/" });
    });

    it("Should throw if the URL uses a disallowed protocol", async () => {
      const controller = new OpenResourceUriTabController(null, null);

      expect.assertions(1);
      await expect(controller.exec("ftp://example.com")).rejects.toThrow();
    });

    it("Should throw if no URL is provided", async () => {
      const controller = new OpenResourceUriTabController(null, null);

      expect.assertions(1);
      await expect(controller.exec()).rejects.toThrow();
    });

    it("Should throw if the URL is not a string", async () => {
      const controller = new OpenResourceUriTabController(null, null);

      expect.assertions(1);
      await expect(controller.exec(123)).rejects.toThrow();
    });
  });
});
