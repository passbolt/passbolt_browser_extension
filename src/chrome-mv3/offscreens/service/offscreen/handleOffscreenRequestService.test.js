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

import FetchOffscreenService, {FETCH_OFFSCREEN_DATA_TYPE_JSON} from "../network/fetchOffscreenService";
import WriteClipobardOffscreenService from "../clipboard/writeClipobardOffscreenService";
import HandleOffscreenRequestService, {SEND_MESSAGE_TARGET_OFFSCREEN_ERROR_RESPONSE_HANDLER} from "./handleOffscreenRequestService";
import {v4 as uuidv4} from "uuid";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("HandleOffscreenRequestService", () => {
  describe("::handleOffscreenRequest", () => {
    it("should redirect fetch request to FetchOffscreenService", async() => {
      expect.assertions(3);

      const message = {
        id: uuidv4(),
        target: "fetch-offscreen",
        data: {
          resource: "https://www.passbolt.com",
          options: {
            body: {
              data: "test",
              dataType: FETCH_OFFSCREEN_DATA_TYPE_JSON
            }
          }
        },
      };

      jest.spyOn(FetchOffscreenService, "handleFetchRequest").mockImplementation(() => {});
      jest.spyOn(WriteClipobardOffscreenService, "handleClipboardRequest");

      await HandleOffscreenRequestService.handleOffscreenRequest(message);

      expect(FetchOffscreenService.handleFetchRequest).toHaveBeenCalledTimes(1);
      expect(FetchOffscreenService.handleFetchRequest).toHaveBeenCalledWith(message.data);
      expect(WriteClipobardOffscreenService.handleClipboardRequest).not.toHaveBeenCalled();
    });

    it("should redirect clipboard write request to WriteClipobardOffscreenService", async() => {
      expect.assertions(3);

      const message = {
        id: uuidv4(),
        target: "clipboard-write-offscreen",
        data: {
          clipboardContent: "test",
        },
      };

      jest.spyOn(FetchOffscreenService, "handleFetchRequest");
      jest.spyOn(WriteClipobardOffscreenService, "handleClipboardRequest").mockImplementation(() => {});

      await HandleOffscreenRequestService.handleOffscreenRequest(message);

      expect(FetchOffscreenService.handleFetchRequest).not.toHaveBeenCalled();
      expect(WriteClipobardOffscreenService.handleClipboardRequest).toHaveBeenCalledTimes(1);
      expect(WriteClipobardOffscreenService.handleClipboardRequest).toHaveBeenCalledWith(message.data);
    });

    it("should send back a generic offscreen message if something wrong happens during the offscreen process", async() => {
      expect.assertions(2);

      const message = {
        id: uuidv4(),
        target: "clipboard-write-offscreen",
        data: {},
      };

      const error = new Error("Impossible to copy to clipboard");
      jest.spyOn(WriteClipobardOffscreenService, "handleClipboardRequest").mockImplementation(() => { throw error; });
      jest.spyOn(chrome.runtime, "sendMessage").mockImplementation(() => {});

      await HandleOffscreenRequestService.handleOffscreenRequest(message);

      const expectedMessage = {
        id: message.id,
        target: SEND_MESSAGE_TARGET_OFFSCREEN_ERROR_RESPONSE_HANDLER,
        data: {error: JSON.stringify(error, Object.getOwnPropertyNames(error))},
      };

      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(1);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(expectedMessage);
    });
  });
});
