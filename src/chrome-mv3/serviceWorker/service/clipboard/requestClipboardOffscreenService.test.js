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

import Validator from "validator";
import {RequestClipboardOffscreenService} from "./requestClipboardOffscreenService";
import {v4 as uuidv4} from "uuid";
import HandleOffscreenResponseService from "../offscreen/handleOffscreenResponseService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RequestClipboardOffscreenService", () => {
  describe("::sendWriteTextOffscreenMessage", () => {
    it("should send a message to the offscreen document", async() => {
      expect.assertions(1);
      const id = uuidv4();
      const data = {clipboardContent: "test-data"};
      const target = "clipboard-write-offscreen";

      await RequestClipboardOffscreenService.sendWriteTextOffscreenMessage(id, data);

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({id, data, target});
    });
  });

  describe("::writeText", () => {
    it("should send a message to the offscreen document and stack the response callback handlers", async() => {
      expect.assertions(5);

      let sentMessage;
      jest.spyOn(chrome.runtime, "sendMessage").mockImplementationOnce(message => {
        sentMessage = message;
        HandleOffscreenResponseService._offscreenResponsePromisesCallbacks[message.id].resolve();
      });

      const clipboardContentToWrite = "clipboard-content";
      const requestPromise = RequestClipboardOffscreenService.writeText(clipboardContentToWrite);

      expect(requestPromise).toBeInstanceOf(Promise);
      await expect(requestPromise).resolves.not.toThrow();

      expect(Validator.isUUID(sentMessage.id)).toBe(true);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(1);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        id: sentMessage.id,
        data: {clipboardContent: clipboardContentToWrite},
        target: "clipboard-write-offscreen",
      });
    });

    it("should throw if the message cannot be sent to the offscreen document for unexpected reason", async() => {
      expect.assertions(1);
      jest.spyOn(chrome.runtime, "sendMessage").mockImplementationOnce(() => { throw new Error("Test error"); });

      await expect(() => RequestClipboardOffscreenService.writeText("test")).rejects.toThrow();
    });
  });
});
