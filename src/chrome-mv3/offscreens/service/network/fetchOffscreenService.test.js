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
import {v4 as uuid} from 'uuid';
import {enableFetchMocks} from "jest-fetch-mock";
import FetchOffscreenService from './fetchOffscreenService';
import each from "jest-each";
import {defaultFetchMessage, defaultFetchResponse} from "./fetchOffscreenService.test.data";

beforeEach(() => {
  enableFetchMocks();
  fetch.resetMocks();
  jest.clearAllMocks();
  // Flush runtime memory cache.
  FetchOffscreenService.pollingIntervalId = null;
  FetchOffscreenService.pendingRequestsCount = 0;
});

describe("FetchOffscreenService", () => {
  describe("::handleFetchRequest", () => {
    it("should not proceed message if the message doesn't have a target", async() => {
      expect.assertions(1);
      const spyOnFetch = jest.spyOn(self, "fetch");
      await FetchOffscreenService.handleFetchRequest({});

      expect(spyOnFetch).not.toHaveBeenCalled();
    });

    it("should not proceed message if targetting another process", async() => {
      expect.assertions(1);
      const spyOnFetch = jest.spyOn(self, "fetch");
      await FetchOffscreenService.handleFetchRequest({target: "wrong-target"});
      expect(spyOnFetch).not.toHaveBeenCalled();
    });

    it("should increase and decrease the pending request count", async() => {
      expect.assertions(5);
      const message = defaultFetchMessage();
      const spyOnFetch = jest.spyOn(self, "fetch").mockImplementation(async() => ({header: {}, body: {}}));
      const spyOnIncreaseRequestCount = jest.spyOn(FetchOffscreenService, "increaseAwaitingRequests");
      const spyOnDecreaseRequestCount = jest.spyOn(FetchOffscreenService, "decreaseAwaitingRequests");
      await FetchOffscreenService.handleFetchRequest(message);

      expect(spyOnFetch).toHaveBeenCalledTimes(1);
      expect(spyOnFetch).toHaveBeenCalledWith(message.data.resource, message.data.options);
      expect(spyOnIncreaseRequestCount).toHaveBeenCalledTimes(1);
      expect(spyOnDecreaseRequestCount).toHaveBeenCalledTimes(1);
      expect(FetchOffscreenService.pendingRequestsCount).toStrictEqual(0);
    });

    it("should handle a successful response", async() => {
      expect.assertions(3);
      const message = defaultFetchMessage();
      const expectedResponse = {header: {}, body: {}};
      const spyOnFetch = jest.spyOn(self, "fetch").mockImplementation(async() => expectedResponse);
      const spyOnSuccessResponse = jest.spyOn(FetchOffscreenService, "handleSuccessResponse");
      const spyOnErrorResponse = jest.spyOn(FetchOffscreenService, "handleErrorResponse");
      await FetchOffscreenService.handleFetchRequest(message);

      expect(spyOnFetch).toHaveBeenCalledTimes(1);
      expect(spyOnSuccessResponse).toHaveBeenCalledWith(message.data.id, expectedResponse);
      expect(spyOnErrorResponse).not.toHaveBeenCalledWith();
    });

    it("should handle a erroneous response", async() => {
      expect.assertions(3);
      const message = defaultFetchMessage();
      const expectedError = new Error("Something went wrong!");
      const spyOnFetch = jest.spyOn(self, "fetch").mockImplementation(async() => { throw expectedError; });
      const spyOnSuccessResponse = jest.spyOn(FetchOffscreenService, "handleSuccessResponse");
      const spyOnErrorResponse = jest.spyOn(FetchOffscreenService, "handleErrorResponse");
      await FetchOffscreenService.handleFetchRequest(message);

      expect(spyOnFetch).toHaveBeenCalledTimes(1);
      expect(spyOnSuccessResponse).not.toHaveBeenCalledWith();
      expect(spyOnErrorResponse).toHaveBeenCalledWith(message.data.id, expectedError);
    });
  });

  describe("::validateMessageData", () => {
    it("should validate if the message data respects the format", async() => {
      const message = defaultFetchMessage();
      const validation = await FetchOffscreenService.validateMessageData(message.data);
      expect(validation).toBeTruthy();
      expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
    });

    each([
      {scenario: "undefined", id: undefined},
      {scenario: "null", id: null},
      {scenario: "invalid string", id: "invalid"},
      {scenario: "boolean", id: true},
      {scenario: "object", id: {data: crypto.randomUUID()}},
    ]).describe("should fail if message id is not valid", _props => {
      it(`should trow if message id: ${_props.scenario}`, async() => {
        const message = defaultFetchMessage();
        message.data.id = _props.id;
        const spyOnErrorResponse = jest.spyOn(FetchOffscreenService, "handleErrorResponse");
        const validation = await FetchOffscreenService.validateMessageData(message.data);
        expect(validation).toBeFalsy();
        expect(spyOnErrorResponse).toHaveBeenCalledWith(message.data.id, expect.any(Error));
      });
    });

    each([
      {scenario: "undefined", resource: undefined},
      {scenario: "null", resource: null},
      {scenario: "integer", resource: 42},
      {scenario: "boolean", resource: true},
      {scenario: "object", resource: {data: "resource"}},
    ]).describe("should fail if message resource is not valid", _props => {
      it(`should fail if message resource: ${_props.scenario}`, async() => {
        const message = defaultFetchMessage();
        message.data.resource = _props.resource;
        const spyOnErrorResponse = jest.spyOn(FetchOffscreenService, "handleErrorResponse");
        const validation = await FetchOffscreenService.validateMessageData(message.data);
        expect(validation).toBeFalsy();
        expect(spyOnErrorResponse).toHaveBeenCalledWith(message.data.id, expect.any(Error));
      });
    });

    each([
      {scenario: "undefined", options: undefined},
      {scenario: "null", options: null},
      {scenario: "integer", options: 42},
      {scenario: "boolean", options: true},
      {scenario: "string", options: "string"},
    ]).describe("should fail if message options is not valid", _props => {
      it(`should fail if message options: ${_props.scenario}`, async() => {
        const message = defaultFetchMessage();
        message.data.options = _props.options;
        const spyOnErrorResponse = jest.spyOn(FetchOffscreenService, "handleErrorResponse");
        const validation = await FetchOffscreenService.validateMessageData(message.data);
        expect(validation).toBeFalsy();
        expect(spyOnErrorResponse).toHaveBeenCalledWith(message.data.id, expect.any(Error));
      });
    });
  });

  describe("::handleSuccessResponse", () => {
    it("should send a message through the chrome.runtime", async() => {
      expect.assertions(2);

      const message = defaultFetchMessage();

      const fetchResponse = {
        headers: new Array([]),
        status: 200,
        statusText: "OK",
        text: async() => "",
        ok: true,
        url: message.data.resource,
        redirected: false,
      };
      await FetchOffscreenService.handleSuccessResponse(message.data.id, fetchResponse);

      const expectedCall = {
        target: "service-worker-fetch-offscreen-response-handler",
        id: message.data.id,
        type: "success",
        data: await FetchOffscreenService.serializeResponse(fetchResponse),
      };

      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(1);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(expectedCall);
    });
  });

  describe("::handleErrorResponse", () => {
    it("should send an error message through the chrome.runtime", async() => {
      expect.assertions(2);

      const dataFetch = {
        id: uuid(),
      };

      const error = new Error("Something went wrong");
      error.name = "A fake error name";
      const spyOnChromeRuntime = jest.spyOn(chrome.runtime, "sendMessage");
      await FetchOffscreenService.handleErrorResponse(dataFetch.id, error);

      const expectedCall = {
        target: "service-worker-fetch-offscreen-response-handler",
        id: dataFetch.id,
        type: "error",
        data: {
          name: error.name,
          message: error.message
        }
      };

      expect(spyOnChromeRuntime).toHaveBeenCalledTimes(1);
      expect(spyOnChromeRuntime).toHaveBeenCalledWith(expectedCall);
    });
  });

  describe("::serializeResponse", () => {
    it("should serialize fetch response object", async() => {
      expect.assertions(7);
      const response = defaultFetchResponse();
      const serializedResponse = await FetchOffscreenService.serializeResponse(response);
      expect(serializedResponse.status).toEqual(response.status);
      expect(serializedResponse.statusText).toEqual(response.statusText);
      expect(serializedResponse.headers).toEqual(Array.from(response.headers.entries()));
      expect(serializedResponse.redirected).toEqual(response.redirected);
      expect(serializedResponse.url).toEqual(response.url);
      expect(serializedResponse.ok).toEqual(response.ok);
      expect(serializedResponse.text).toEqual(await defaultFetchResponse().text());
    });
  });

  describe("::increaseAwaitingRequests", () => {
    it("should increase the pending requests count and not start the polling if already started", async() => {
      expect.assertions(2);
      jest.useFakeTimers();

      FetchOffscreenService.pollingIntervalId = 42;
      await FetchOffscreenService.increaseAwaitingRequests();
      const spyOnInterval = jest.spyOn(self, "setInterval");

      expect(FetchOffscreenService.pendingRequestsCount).toStrictEqual(1);
      expect(spyOnInterval).not.toHaveBeenCalled();
    });

    it("should increase the pending requests count and start the polling if not started already", async() => {
      expect.assertions(3);
      jest.useFakeTimers();

      const spyOnInterval = jest.spyOn(self, "setInterval");
      FetchOffscreenService.pollingIntervalId = null;
      FetchOffscreenService.pendingRequestsCount = 10;
      await FetchOffscreenService.increaseAwaitingRequests();

      expect(FetchOffscreenService.pendingRequestsCount).toStrictEqual(11);
      expect(FetchOffscreenService.pollingIntervalId).not.toBeNull();
      expect(spyOnInterval).toHaveBeenCalled();
    });
  });

  describe("::decreaseAwaitingRequests", () => {
    it("should decrease the pending requests count and keep the polling if pending requests are left", async() => {
      expect.assertions(2);
      jest.useFakeTimers();

      FetchOffscreenService.pendingRequestsCount = 10;
      FetchOffscreenService.pollingIntervalId = 42;
      await FetchOffscreenService.decreaseAwaitingRequests();
      expect(FetchOffscreenService.pendingRequestsCount).toStrictEqual(9);
      expect(FetchOffscreenService.pollingIntervalId).not.toBeNull();
    });

    it("should decrease the pending requests count and stop the polling if no pending requests are left", async() => {
      expect.assertions(2);
      jest.useFakeTimers();

      FetchOffscreenService.pendingRequestsCount = 1;
      FetchOffscreenService.pollingIntervalId = 42;
      await FetchOffscreenService.decreaseAwaitingRequests();
      expect(FetchOffscreenService.pendingRequestsCount).toStrictEqual(0);
      expect(FetchOffscreenService.pollingIntervalId).toBeNull();
    });
  });

  describe("::pollServiceWorker", () => {
    it("should send a poll message to the service worker", async() => {
      expect.assertions(1);
      await FetchOffscreenService.pollServiceWorker();
      const target = "service-worker-fetch-offscreen-polling-handler";
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({target});
    });
  });
});
