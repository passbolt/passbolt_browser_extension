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

import {SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN_RESPONSE_HANDLER} from "../../../offscreens/service/clipboard/writeClipobardOffscreenService";
import {SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_RESPONSE_HANDLER} from "../../../offscreens/service/network/fetchOffscreenService";
import {defaultCallbacks} from "../network/responseFetchOffscreenService.test.data";
import HandleOffscreenResponseService from "./handleOffscreenResponseService";
import {v4 as uuidv4} from "uuid";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("HandleOffscreenResponseService", () => {
  let fetchFunction, clipboardWriteFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchFunction = jest.spyOn(HandleOffscreenResponseService.REPONSE_HANDLE_MAP, SEND_MESSAGE_TARGET_FETCH_OFFSCREEN_RESPONSE_HANDLER).mockImplementation(() => {});
    clipboardWriteFunction = jest.spyOn(HandleOffscreenResponseService.REPONSE_HANDLE_MAP, SEND_MESSAGE_TARGET_CLIPBOARD_WRITE_OFFSCREEN_RESPONSE_HANDLER).mockImplementation(() => {});
  });

  describe("::handleOffscreenResponse", () => {
    it("should handle fetch response and dispatch to the right service", () => {
      expect.assertions(3);

      const message = {
        id: uuidv4(),
        target: "service-worker-fetch-offscreen-response-handler"
      };
      const promises = defaultCallbacks();
      HandleOffscreenResponseService.setResponseCallback(message.id, promises);

      HandleOffscreenResponseService.handleOffscreenResponse(message);

      expect(fetchFunction).toHaveBeenCalledTimes(1);
      expect(fetchFunction).toHaveBeenCalledWith(message, promises);
      expect(clipboardWriteFunction).not.toHaveBeenCalled();
    });

    it("should handle fetch polling response and dispatch to the right service", () => {
      expect.assertions(2);

      const message = {
        target: "service-worker-fetch-offscreen-polling-handler"
      };

      HandleOffscreenResponseService.handleOffscreenResponse(message);

      expect(fetchFunction).not.toHaveBeenCalled();
      expect(clipboardWriteFunction).not.toHaveBeenCalled();
    });

    it("should handle clipboard writeText and dispatch to the right service", () => {
      expect.assertions(3);

      const message = {
        id: uuidv4(),
        target: "service-worker-clipboard-write-text-offscreen-response-handler"
      };
      const promises = defaultCallbacks();
      HandleOffscreenResponseService.setResponseCallback(message.id, promises);

      HandleOffscreenResponseService.handleOffscreenResponse(message);

      expect(clipboardWriteFunction).toHaveBeenCalledTimes(1);
      expect(clipboardWriteFunction).toHaveBeenCalledWith(message, promises);
      expect(fetchFunction).not.toHaveBeenCalled();
    });

    it("should handle offscreen error message", () => {
      expect.assertions(2);

      const error = new Error("It went really bad somehow");
      const expectedError = new Error("Something went wrong while processing an offscreen request");
      expectedError.cause = error;

      const message = {
        id: uuidv4(),
        target: "service-worker-offscreen-error-response-handler",
        data: {error: JSON.stringify(error, Object.getOwnPropertyNames(error))},
      };

      const promises = defaultCallbacks();

      HandleOffscreenResponseService.setResponseCallback(message.id, promises);
      HandleOffscreenResponseService.handleOffscreenResponse(message);

      expect(promises.reject).toHaveBeenCalledTimes(1);
      expect(promises.reject).toHaveBeenCalledWith(expectedError);
    });

    it("should ignore message with unknown target", () => {
      expect.assertions(2);

      const message = {target: "???"};

      HandleOffscreenResponseService.handleOffscreenResponse(message);

      expect(clipboardWriteFunction).not.toHaveBeenCalled();
      expect(fetchFunction).not.toHaveBeenCalled();
    });
  });

  describe("::_consumeRequestPromiseCallbacksOrFail", () => {
    it("should consume the response handler associated to the given id", () => {
      expect.assertions(3);

      const id = crypto.randomUUID();
      const callbacks = defaultCallbacks();
      HandleOffscreenResponseService.setResponseCallback(id, callbacks);

      const consumedCallbacks = HandleOffscreenResponseService._consumeRequestPromiseCallbacksOrFail(id);

      expect(consumedCallbacks).not.toBeNull();
      expect(consumedCallbacks).toEqual(callbacks);
      expect(Object.keys(HandleOffscreenResponseService._offscreenResponsePromisesCallbacks).length).toEqual(0);
    });

    it("should throw if no associated callbacks found for the given id", () => {
      expect.assertions(1);
      const id = crypto.randomUUID();
      expect(() => HandleOffscreenResponseService._consumeRequestPromiseCallbacksOrFail(id)).toThrow();
    });
  });

  describe("::handleOffscreenError", () => {
    it("should reject the given promise with an error containing the cause of the offscreen process failure", () => {
      expect.assertions(2);

      const callbacks = defaultCallbacks();
      const error = new Error("Something went wrong with the fetch");
      const message = {
        data: {
          error: JSON.stringify(error, Object.getOwnPropertyNames(error))
        },

      };
      const expectedError = new Error("Something went wrong while processing an offscreen request");
      expectedError.cause = message.data.error;

      HandleOffscreenResponseService.handleOffscreenError(message, callbacks);

      expect(callbacks.reject).toHaveBeenCalledTimes(1);
      expect(callbacks.reject).toHaveBeenCalledWith(expectedError);
    });
  });
});
