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
 * @since         4.7.0
 */

import each from "jest-each";
import {enableFetchMocks} from "jest-fetch-mock";
import {RequestFetchOffscreenService} from "./requestFetchOffscreenService";
import {
  FETCH_OFFSCREEN_RESPONSE_TYPE_ERROR,
  FETCH_OFFSCREEN_RESPONSE_TYPE_SUCCESS
} from "../../../offscreens/service/network/fetchOffscreenService";
import ResponseFetchOffscreenService from "./responseFetchOffscreenService";
import {defaultCallbacks, defaultResponseMessage} from "./responseFetchOffscreenService.test.data";

beforeEach(() => {
  enableFetchMocks();
  fetch.resetMocks();
  jest.clearAllMocks();
  // Flush the requests promises callbacks stack.
  RequestFetchOffscreenService.offscreenRequestsPromisesCallbacks = {};
});

describe("ResponseFetchOffscreenService", () => {
  describe("::assertMessage", () => {
    each([
      {scenario: "success", type: FETCH_OFFSCREEN_RESPONSE_TYPE_SUCCESS},
      {scenario: "error", type: FETCH_OFFSCREEN_RESPONSE_TYPE_ERROR},
    ]).describe("should accept if message type is valid", _props => {
      it(`should validate message type: ${_props.scenario}`, () => {
        const message = defaultResponseMessage({type: _props.type});
        try {
          ResponseFetchOffscreenService.assertMessage(message);
          expect(true).toBeTruthy();
        } catch (error) {
          expect(error).toBeNull();
        }
      });
    });

    each([
      {scenario: "undefined", type: undefined},
      {scenario: "null", type: null},
      {scenario: "invalid string", type: "invalid"},
      {scenario: "boolean", type: true},
      {scenario: "object", type: {data: FETCH_OFFSCREEN_RESPONSE_TYPE_SUCCESS}},
    ]).describe("should throw if message type is not valid", _props => {
      it(`should trow if message type: ${_props.scenario}`, () => {
        const message = defaultResponseMessage({type: _props.type});
        try {
          ResponseFetchOffscreenService.assertMessage(message);
          expect(true).toBeFalsy();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });

    it("should validate message id", () => {
      expect(() => ResponseFetchOffscreenService.assertMessage(defaultResponseMessage({id: crypto.randomUUID()}))).not.toThrow();
    });

    each([
      {scenario: "undefined", id: undefined},
      {scenario: "null", id: null},
      {scenario: "invalid string", id: "invalid"},
      {scenario: "boolean", id: true},
      {scenario: "object", id: {data: crypto.randomUUID()}},
    ]).describe("should throw if message id is not valid", _props => {
      it(`should trow if message id: ${_props.scenario}`, () => {
        const message = defaultResponseMessage({id: _props.id});
        try {
          ResponseFetchOffscreenService.assertMessage(message);
          expect(true).toBeFalsy();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });

    it("should validate message data", () => {
      expect(() => defaultResponseMessage({data: {prop: "value"}})).not.toThrow();
    });

    each([
      {scenario: "undefined", data: undefined},
      {scenario: "null", data: null},
      {scenario: "invalid string", data: "invalid"},
      {scenario: "boolean", data: true},
    ]).describe("should throw if message data is not valid", _props => {
      it(`should trow if message id: ${_props.scenario}`, () => {
        const message = defaultResponseMessage({data: _props.data});
        try {
          ResponseFetchOffscreenService.assertMessage(message);
          expect(true).toBeFalsy();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe("::consumeRequestPromiseCallbacksOrFail", () => {
    it("should consume the response handler associated to the given id", () => {
      expect.assertions(3);
      const id = crypto.randomUUID();
      const callbacks = defaultCallbacks();
      RequestFetchOffscreenService.offscreenRequestsPromisesCallbacks[id] = callbacks;
      const consumedCallbacks = ResponseFetchOffscreenService.consumeRequestPromiseCallbacksOrFail(id);
      expect(consumedCallbacks).not.toBeNull();
      expect(consumedCallbacks).toEqual(callbacks);
      expect(Object.keys(RequestFetchOffscreenService.offscreenRequestsPromisesCallbacks).length).toEqual(0);
    });

    it("should throw if no associated callbacks found for the given id", () => {
      expect.assertions(1);
      const id = crypto.randomUUID();
      expect(() => ResponseFetchOffscreenService.consumeRequestPromiseCallbacksOrFail(id)).toThrow();
    });
  });

  describe("::buildFetchResponse", () => {
    it("should build the fetch response object based on the offscreen message data", async() => {
      expect.assertions(8);
      const message = defaultResponseMessage();
      const response = ResponseFetchOffscreenService.buildFetchResponse(message.data);
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toEqual(message.data.status);
      expect(response.statusText).toEqual(message.data.statusText);
      expect(Array.from(response.headers.entries())).toEqual(message.data.headers);
      expect(response.redirected).toEqual(message.data.redirected);
      expect(response.url).toEqual(message.data.url);
      expect(response.ok).toEqual(message.data.ok);
      expect(await response.text()).toEqual(message.data.text);
    });
  });

  describe("::handleFetchResponse", () => {
    it("should handle success response and execute the resolve callback", () => {
      expect.assertions(1);
      const id = crypto.randomUUID();
      const callbacks = defaultCallbacks();
      RequestFetchOffscreenService.offscreenRequestsPromisesCallbacks[id] = callbacks;
      const message = defaultResponseMessage({id});
      ResponseFetchOffscreenService.handleFetchResponse(message);
      expect(callbacks.resolve).toHaveBeenCalledWith(expect.any(Response));
    });

    it("should handle error response and execute the reject callback", () => {
      expect.assertions(1);
      const id = crypto.randomUUID();
      const callbacks = defaultCallbacks();
      RequestFetchOffscreenService.offscreenRequestsPromisesCallbacks[id] = callbacks;
      // eslint-disable-next-line object-shorthand
      const message = defaultResponseMessage({id, type: FETCH_OFFSCREEN_RESPONSE_TYPE_ERROR});
      ResponseFetchOffscreenService.handleFetchResponse(message);
      expect(callbacks.reject).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should ignore message having the wrong target", () => {
      expect.assertions(2);
      const id = crypto.randomUUID();
      const callbacks = defaultCallbacks();
      RequestFetchOffscreenService.offscreenRequestsPromisesCallbacks[id] = callbacks;
      // eslint-disable-next-line object-shorthand
      const message = defaultResponseMessage({id, target: "other-target"});
      ResponseFetchOffscreenService.handleFetchResponse(message);
      expect(callbacks.resolve).not.toHaveBeenCalled();
      expect(callbacks.reject).not.toHaveBeenCalled();
    });
  });
});
