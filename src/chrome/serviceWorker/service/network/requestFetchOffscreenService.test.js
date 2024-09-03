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
import Validator from "validator";
import {enableFetchMocks} from "jest-fetch-mock";
import {
  IS_FETCH_OFFSCREEN_PREFERRED_STORAGE_KEY,
  RequestFetchOffscreenService
} from "./requestFetchOffscreenService";
import {
  FETCH_OFFSCREEN_DATA_TYPE_FORM_DATA, FETCH_OFFSCREEN_DATA_TYPE_JSON,
  SEND_MESSAGE_TARGET_FETCH_OFFSCREEN
} from "../../../offscreens/service/network/fetchOffscreenService";
import {fetchOptionsWithBodyFormData, fetchOptionWithBodyData} from "./requestFetchOffscreenService.test.data";
import FormDataUtils from "../../../../all/background_page/utils/format/formDataUtils";

beforeEach(() => {
  enableFetchMocks();
  fetch.resetMocks();
  jest.clearAllMocks();
  // Flush preferred strategy runtime cache.
  RequestFetchOffscreenService.isFetchOffscreenPreferredCache = null;
});

describe("RequestFetchOffscreenService", () => {
  describe("::isFetchOffscreenPreferred", () => {
    it("should return false if no value found in runtime or session storage caches", async() => {
      expect.assertions(1);
      expect(await RequestFetchOffscreenService.isFetchOffscreenPreferred()).toBeFalsy();
    });

    each([
      {label: "true", value: true},
      {label: "false", value: false},
    ]).describe("should return the runtime cached value", scenario => {
      it(`should return the runtime cached value for scenario: ${scenario.label}`, async() => {
        expect.assertions(1);
        // Mock runtime cached value.
        RequestFetchOffscreenService.isFetchOffscreenPreferredCache = scenario.value;
        expect(await RequestFetchOffscreenService.isFetchOffscreenPreferred()).toEqual(scenario.value);
      });
    });

    each([
      {label: "true", value: true},
      {label: "false", value: false},
    ]).describe("should return the session storage value if no runtime value is present", scenario => {
      it(`should return the runtime cached value for scenario: ${scenario.label}`, async() => {
        expect.assertions(1);
        // Mock session storage cached value.
        browser.storage.session.set({[IS_FETCH_OFFSCREEN_PREFERRED_STORAGE_KEY]: scenario.value});
        expect(await RequestFetchOffscreenService.isFetchOffscreenPreferred()).toEqual(scenario.value);
      });
    });

    each([
      {label: "true", value: true},
      {label: "false", value: false},
    ]).describe("should return the runtime cached value if set and if the session storage value is also set", scenario => {
      it(`should return the runtime cached value for scenario: ${scenario.label}`, async() => {
        expect.assertions(1);
        // Mock runtime cached value.
        RequestFetchOffscreenService.isFetchOffscreenPreferredCache = scenario.value;
        browser.storage.session.set({[IS_FETCH_OFFSCREEN_PREFERRED_STORAGE_KEY]: !scenario.value});
        expect(await RequestFetchOffscreenService.isFetchOffscreenPreferred()).toEqual(scenario.value);
      });
    });
  });

  describe("::createIfNotExistOffscreenDocument", () => {
    it("should create the offscreen document if it does not exist yet ", async() => {
      expect.assertions(2);
      jest.spyOn(chrome.runtime, "getContexts").mockImplementationOnce(() => []);
      await RequestFetchOffscreenService.createIfNotExistOffscreenDocument();

      const expectedGetContextsData = {
        contextTypes: ["OFFSCREEN_DOCUMENT"],
        documentUrls: ["chrome-extension://didegimhafipceonhjepacocaffmoppf/offscreens/fetch.html"]
      };
      const expectedCreateDocumentData = {
        url: "offscreens/fetch.html",
        reasons: ["WORKERS"],
        justification: "Used to perform fetch to services such as the passbolt API serving invalid certificate."
      };
      expect(chrome.runtime.getContexts).toHaveBeenCalledWith(expectedGetContextsData);
      expect(chrome.offscreen.createDocument).toHaveBeenCalledWith(expectedCreateDocumentData);
    });

    it("should not create the offscreen document if it already exist ", async() => {
      expect.assertions(1);
      jest.spyOn(chrome.runtime, "getContexts").mockImplementationOnce(() => ["shallow-offscreen-document-mock"]);
      await RequestFetchOffscreenService.createIfNotExistOffscreenDocument();
      expect(chrome.offscreen.createDocument).not.toHaveBeenCalled();
    });
  });

  describe("::buildOffscreenData", () => {
    it("should build data to send to the offscreen document", async() => {
      expect.assertions(1);
      const id = crypto.randomUUID();
      const resource = "https://test.passbolt.com/passbolt-unit-test/test.json";
      const options = fetchOptionWithBodyData();
      const offscreenData = await RequestFetchOffscreenService.buildOffscreenData(id, resource, options);
      options.body = {
        data: options.body,
        dataType: FETCH_OFFSCREEN_DATA_TYPE_JSON
      };
      // Ensure body remains a form data after serialization.
      expect(offscreenData).toEqual({id, resource, options});
    });

    it("should ensure given fetch options body will not be altered", async() => {
      expect.assertions(2);
      const id = crypto.randomUUID();
      const resource = "https://test.passbolt.com/passbolt-unit-test/test.json";
      const fetchOptions = fetchOptionsWithBodyFormData();
      const offscreenData = await RequestFetchOffscreenService.buildOffscreenData(id, resource, fetchOptions);
      // Ensure body remains a form data after serialization.
      expect(offscreenData.options.body.data).toBeInstanceOf(Array);
      expect(offscreenData.options.body.dataType).toStrictEqual(FETCH_OFFSCREEN_DATA_TYPE_FORM_DATA);
    });

    it("should transform FormData body into serialized encoded url parameters", async() => {
      expect.assertions(1);
      const id = crypto.randomUUID();
      const resource = "https://test.passbolt.com/passbolt-unit-test/test.json";
      const options = fetchOptionsWithBodyFormData();

      const offscreenData = await RequestFetchOffscreenService.buildOffscreenData(id, resource, options);
      // eslint-disable-next-line object-shorthand
      const expectedOffscreenMessageData = {
        id,
        resource,
        options: {
          ...options,
          headers: {
            ...options.headers,
          },
          body: {
            data: [{key: "prop1", value: "value 1", type: FormDataUtils.TYPE_SCALAR}, {key: "prop1", value: "value 2", type: FormDataUtils.TYPE_SCALAR}],
            dataType: FETCH_OFFSCREEN_DATA_TYPE_FORM_DATA
          } // ensure the body is serialized as url encoded parameter
        }
      };
      expect(offscreenData).toEqual(expectedOffscreenMessageData);
    });
  });

  describe("::sendOffscreenMessage", () => {
    it("should send a message to the offscreen document", async() => {
      expect.assertions(1);
      const data = {prop1: "value1"};
      await RequestFetchOffscreenService.sendOffscreenMessage(data);
      const target = SEND_MESSAGE_TARGET_FETCH_OFFSCREEN;
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({target, data});
    });
  });

  describe("::fetchOffscreen", () => {
    it("should send a message to the offscreen document and stack the response callback handlers", async() => {
      expect.assertions(4);
      const resource = "https://test.passbolt.com/passbolt-unit-test/test.json";
      const options = fetchOptionsWithBodyFormData();
      jest.spyOn(chrome.runtime, "sendMessage").mockImplementationOnce(message => {
        expect(Validator.isUUID(message.data.id)).toBe(true);
        const expectedMessageData = {
          target: SEND_MESSAGE_TARGET_FETCH_OFFSCREEN,
          data: {
            ...message.data,
            options: {
              ...message.data.options,
              headers: {
                ...message.data.options.headers,
              },
              body: {
                data: [
                  {key: "prop1", value: "value 1", type: FormDataUtils.TYPE_SCALAR},
                  {key: "prop1", value: "value 2", type: FormDataUtils.TYPE_SCALAR}
                ],
                dataType: FETCH_OFFSCREEN_DATA_TYPE_FORM_DATA
              }, // ensure the body is serialized as url encoded parameter
            }
          },
        };
        expect(message).toEqual(expectedMessageData);
        RequestFetchOffscreenService.offscreenRequestsPromisesCallbacks[message.data.id].resolve();
      });
      const requestPromise = RequestFetchOffscreenService.fetchOffscreen(resource, options);
      expect(requestPromise).toBeInstanceOf(Promise);
      await expect(requestPromise).resolves.not.toThrow();
    });

    it("should throw if the message cannot be sent to the offscreen document for unexpected reason", async() => {
      expect.assertions(2);
      const resource = "https://test.passbolt.com/passbolt-unit-test/test.json";
      const options = fetchOptionsWithBodyFormData();
      jest.spyOn(chrome.runtime, "sendMessage").mockImplementationOnce(() => {
        throw new Error("Test error");
      });
      const requestPromise = RequestFetchOffscreenService.fetchOffscreen(resource, options);
      expect(requestPromise).toBeInstanceOf(Promise);
      await expect(requestPromise).rejects.toThrow();
    });
  });

  describe("::fetchNative", () => {
    it("should call the native fetch API", async() => {
      expect.assertions(2);
      const resource = "https://test.passbolt.com/passbolt-unit-test/test.json";
      const options = fetchOptionsWithBodyFormData();
      fetch.doMockOnce(() => Promise.resolve({}));
      const requestPromise = RequestFetchOffscreenService.fetchNative(resource, options);
      await expect(requestPromise).resolves.not.toThrow();
      expect(fetch).toHaveBeenCalledWith(resource, options);
    });

    it("should fallback on fetchOffscreen if an unexpected error occurred", async() => {
      expect.assertions(3);
      const resource = "https://test.passbolt.com/passbolt-unit-test/test.json";
      const options = fetchOptionsWithBodyFormData();
      fetch.doMockOnce(() => Promise.reject({}));
      jest.spyOn(RequestFetchOffscreenService, "fetchOffscreen").mockImplementationOnce(() => jest.fn);
      const requestPromise = RequestFetchOffscreenService.fetchNative(resource, options);
      await expect(requestPromise).resolves.not.toThrow();
      expect(RequestFetchOffscreenService.isFetchOffscreenPreferredCache).toBeTruthy();
      expect(RequestFetchOffscreenService.fetchOffscreen).toHaveBeenCalledWith(resource, options);
    });

    it("should throw and not fallback on fetchOffscreen if the navigator is not online", async() => {
      expect.assertions(1);
      const resource = "https://test.passbolt.com/passbolt-unit-test/test.json";
      const options = fetchOptionsWithBodyFormData();
      fetch.doMockOnce(() => Promise.reject({}));
      jest.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(false);
      const requestPromise = RequestFetchOffscreenService.fetchNative(resource, options);
      await expect(requestPromise).rejects.toThrow();
    });
  });

  describe("::fetch", () => {
    it("should call the native fetch API if offscreen strategy has not been marked as preferred", async() => {
      expect.assertions(1);
      const resource = "https://test.passbolt.com/passbolt-unit-test/test.json";
      const options = fetchOptionsWithBodyFormData();
      jest.spyOn(RequestFetchOffscreenService, "fetchNative").mockImplementationOnce(() => jest.fn);
      await RequestFetchOffscreenService.fetch(resource, options);
      expect(RequestFetchOffscreenService.fetchNative).toHaveBeenCalledWith(resource, options);
    });

    it("should call the native fetch offscreen if this strategy has been marked as preferred", async() => {
      expect.assertions(1);
      const resource = "https://test.passbolt.com/passbolt-unit-test/test.json";
      const options = fetchOptionsWithBodyFormData();
      jest.spyOn(RequestFetchOffscreenService, "fetchOffscreen").mockImplementationOnce(() => jest.fn);
      RequestFetchOffscreenService.isFetchOffscreenPreferredCache = true;
      await RequestFetchOffscreenService.fetch(resource, options);
      expect(RequestFetchOffscreenService.fetchOffscreen).toHaveBeenCalledWith(resource, options);
    });
  });
});
