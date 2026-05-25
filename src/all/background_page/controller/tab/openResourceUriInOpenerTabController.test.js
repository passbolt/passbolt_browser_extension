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
 * @since         5.12.1
 */

import OpenResourceUriInOpenerTabController from "./openResourceUriInOpenerTabController";
import BrowserTabService from "../../service/ui/browserTab.service";

const URI = "https://example.com/login";

function buildController() {
  const emit = jest.fn();
  const controller = new OpenResourceUriInOpenerTabController({ port: { emit } }, "req-1");
  global.browser.tabs.update = jest.fn().mockResolvedValue({ id: 7 });
  global.browser.tabs.create = jest.fn().mockResolvedValue({ id: 42 });
  global.browser.tabs.query = jest.fn().mockResolvedValue([]);
  return { controller, emit };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("OpenResourceUriInOpenerTabController", () => {
  describe("::exec", () => {
    it("reuses the opener tab when it is blank", async () => {
      const { controller } = buildController();
      jest.spyOn(BrowserTabService, "getById").mockResolvedValue({ id: 7, url: "about:blank" });

      await controller.exec(URI, 7);

      expect(global.browser.tabs.update).toHaveBeenCalledWith(7, { url: URI });
      expect(global.browser.tabs.create).not.toHaveBeenCalled();
    });

    it("opens a new tab when the opener tab is a real http(s) page", async () => {
      const { controller } = buildController();
      jest.spyOn(BrowserTabService, "getById").mockResolvedValue({ id: 7, url: "https://other.com" });

      await controller.exec(URI, 7);

      expect(global.browser.tabs.create).toHaveBeenCalledWith({ url: URI });
      expect(global.browser.tabs.update).not.toHaveBeenCalled();
    });

    it("falls back to the active tab when the opener id does not resolve", async () => {
      const { controller } = buildController();
      jest.spyOn(BrowserTabService, "getById").mockRejectedValue(new Error("no tab"));
      global.browser.tabs.query = jest.fn().mockResolvedValue([{ id: 99, url: "about:newtab" }]);

      await controller.exec(URI, 7);

      expect(global.browser.tabs.update).toHaveBeenCalledWith(99, { url: URI });
    });

    it("rejects an invalid (non-http) URL", async () => {
      const { controller } = buildController();

      await expect(controller.exec("javascript:alert(1)", 7)).rejects.toThrow("not valid");
      expect(global.browser.tabs.update).not.toHaveBeenCalled();
      expect(global.browser.tabs.create).not.toHaveBeenCalled();
    });
  });

  describe("::_exec", () => {
    it("emits SUCCESS on success", async () => {
      const { controller, emit } = buildController();
      jest.spyOn(BrowserTabService, "getById").mockResolvedValue({ id: 7, url: "about:blank" });

      await controller._exec(URI, 7);

      expect(emit).toHaveBeenCalledWith("req-1", "SUCCESS");
    });

    it("emits a sanitised ERROR on failure", async () => {
      const { controller, emit } = buildController();
      jest.spyOn(console, "error").mockImplementation(() => {});

      await controller._exec("javascript:alert(1)", 7);

      const errorCall = emit.mock.calls.find((call) => call[1] === "ERROR");
      expect(errorCall).toBeDefined();
      expect(errorCall[2].message).toBe("Unable to open the resource URL.");
    });
  });
});
