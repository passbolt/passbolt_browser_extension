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
 * @since         5.6.0
 */

import FileService from "./fileService";

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("FileService", () => {
  describe("::saveFile", () => {
    it("save file with Safari", async () => {
      expect.assertions(1);

      // function mocked
      chrome.runtime.sendNativeMessage = jest.fn();
      chrome.runtime.sendNativeMessage.mockImplementation(() => ({ success: true }));

      // process
      await FileService.saveFile("filename", "Text", null, null);

      // expectation
      const expectedArgument = {
        action: "save-file",
        filename: "filename",
        mimeType: "text/plain",
        base64Data: "VGV4dA==",
      };

      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledWith("com.passbolt.safari", expectedArgument);
    });
  });
});
