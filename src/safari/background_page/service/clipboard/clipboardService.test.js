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
 * @since         5.16.0
 */

import { ClipboardService } from "./clipboardService";

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("ClipboardService", () => {
  describe("::writeText", () => {
    it("write the data to the clipboard with Safari", async () => {
      expect.assertions(1);

      // function mocked
      chrome.runtime.sendNativeMessage = jest.fn();
      chrome.runtime.sendNativeMessage.mockImplementation(() => ({ success: true }));

      // process
      await ClipboardService.writeText("secret-to-copy");

      // expectation
      const expectedArgument = {
        action: "write-clipboard",
        data: "secret-to-copy",
      };

      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledWith("com.passbolt.safari", expectedArgument);
    });

    it("throw if the native application could not write the clipboard", async () => {
      expect.assertions(1);

      // function mocked
      chrome.runtime.sendNativeMessage = jest.fn();
      chrome.runtime.sendNativeMessage.mockImplementation(() => ({
        success: false,
        error: { domain: "WriteClipboardController", code: 999, message: "Unable to write the pasteboard" },
      }));

      // process & expectation
      await expect(ClipboardService.writeText("secret-to-copy")).rejects.toThrow(/Unable to write the pasteboard/);
    });
  });
});
