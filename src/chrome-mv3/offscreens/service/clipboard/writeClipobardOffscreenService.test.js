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
 * @since         5.3.2
 */
import WriteClipobardOffscreenService from "./writeClipobardOffscreenService";

export const SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN = "clipboard-write-offscreen";
export const SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN_RESPONSE_HANDLER = "service-worker-clipboard-write-text-offscreen-response-handler";

describe("WriteClipobardOffscreenService", () => {
  describe("::handleClipboardRequest", () => {
    it("should run the copy to clipboard and return a message tailored for the requester", async() => {
      expect.assertions(9);

      let copiedValue = "";
      const fakeElement = {
        value: "",
        select: jest.fn().mockImplementation(() => { copiedValue = fakeElement.value; }),
      };
      global.document = {
        createElement: () => fakeElement,
        body: {
          appendChild: jest.fn(),
          removeChild: jest.fn(),
        },
        execCommand: jest.fn()
      };

      const clipboardContent = "test";
      const result = await WriteClipobardOffscreenService.handleClipboardRequest({clipboardContent});
      const expectedResult = {
        target: "service-worker-clipboard-write-text-offscreen-response-handler",
        data: null,
      };

      expect(copiedValue).toStrictEqual(clipboardContent);
      expect(fakeElement.select).toHaveBeenCalledTimes(1);
      expect(document.body.appendChild).toHaveBeenCalledTimes(1);
      expect(document.body.appendChild).toHaveBeenCalledWith(fakeElement);
      expect(document.body.removeChild).toHaveBeenCalledTimes(1);
      expect(document.body.removeChild).toHaveBeenCalledWith(fakeElement);
      expect(document.execCommand).toHaveBeenCalledTimes(1);
      expect(document.execCommand).toHaveBeenCalledWith("cut");
      expect(result).toStrictEqual(expectedResult);
    });
  });
});
