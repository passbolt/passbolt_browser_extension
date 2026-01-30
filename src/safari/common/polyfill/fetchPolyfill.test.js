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
 * @since         5.7.0
 */

import {
  defaultAppResponse,
  defaultFetchOptions,
  fetchOptionsWithCredentials,
  fetchOptionsWithFormData,
  appResponseWithSetCookie,
  appResponseWithStatus,
  appResponseWithBody,
  appResponseWithHeaders,
} from "./fetchPolyfill.test.data";
import { CookiesService } from "../../background_page/service/cookies/cookiesService";
import { SendNativeMessageService } from "../../background_page/service/nativeMessage/sendNativeMessageService";
import FormDataUtils from "../../../all/background_page/utils/format/formDataUtils";

const FetchSafariPolyfill = require("./fetchPolyfill");

const TEST_URL = "https://www.passbolt.com/api/resources.json";

beforeEach(() => {
  jest.resetAllMocks();
});

describe("FetchSafariPolyfill", () => {
  describe("FetchSafariPolyfill::fetch", () => {
    it("should call SendNativeMessageService with correct parameters", async () => {
      expect.assertions(2);
      jest.spyOn(SendNativeMessageService, "sendNativeMessage").mockResolvedValue(defaultAppResponse());

      await FetchSafariPolyfill(TEST_URL, defaultFetchOptions());

      expect(SendNativeMessageService.sendNativeMessage).toHaveBeenCalledTimes(1);
      expect(SendNativeMessageService.sendNativeMessage).toHaveBeenCalledWith("fetch", {
        resource: TEST_URL,
        options: expect.objectContaining({ method: "GET", headers: {} }),
      });
    });

    it("should return a Response object", async () => {
      expect.assertions(3);
      jest.spyOn(SendNativeMessageService, "sendNativeMessage").mockResolvedValue(defaultAppResponse());

      const response = await FetchSafariPolyfill(TEST_URL, defaultFetchOptions());

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe("OK");
    });

    it("should include cookies and CSRF token when credentials is include", async () => {
      expect.assertions(2);
      jest.spyOn(SendNativeMessageService, "sendNativeMessage").mockResolvedValue(defaultAppResponse());
      jest.spyOn(CookiesService.prototype, "getSerialisedCookies").mockResolvedValue("session=abc123");
      jest.spyOn(CookiesService.prototype, "getCsrfToken").mockResolvedValue("csrf-token-value");

      await FetchSafariPolyfill(TEST_URL, fetchOptionsWithCredentials());

      expect(SendNativeMessageService.sendNativeMessage).toHaveBeenCalledWith("fetch", {
        resource: TEST_URL,
        options: expect.objectContaining({
          cookies: "session=abc123",
          headers: expect.objectContaining({ "X-Csrf-Token": "csrf-token-value" }),
        }),
      });
      expect(CookiesService.prototype.getSerialisedCookies).toHaveBeenCalledTimes(1);
    });
  });

  describe("FetchSafariPolyfill::prepareOptions", () => {
    it("should convert FormData body to URL-encoded string", async () => {
      expect.assertions(2);
      jest.spyOn(SendNativeMessageService, "sendNativeMessage").mockResolvedValue(defaultAppResponse());
      jest.spyOn(FormDataUtils, "formDataToString").mockResolvedValue("username=test-user&password=test-password");

      await FetchSafariPolyfill(TEST_URL, fetchOptionsWithFormData());

      expect(FormDataUtils.formDataToString).toHaveBeenCalledTimes(1);
      expect(SendNativeMessageService.sendNativeMessage).toHaveBeenCalledWith("fetch", {
        resource: TEST_URL,
        options: expect.objectContaining({ body: "username=test-user&password=test-password" }),
      });
    });

    it("should not add cookies when credentials is not include", async () => {
      expect.assertions(2);
      jest.spyOn(SendNativeMessageService, "sendNativeMessage").mockResolvedValue(defaultAppResponse());
      jest.spyOn(CookiesService.prototype, "getSerialisedCookies");
      jest.spyOn(CookiesService.prototype, "getCsrfToken");

      await FetchSafariPolyfill(TEST_URL, defaultFetchOptions({ credentials: "omit" }));

      expect(CookiesService.prototype.getSerialisedCookies).not.toHaveBeenCalled();
      expect(CookiesService.prototype.getCsrfToken).not.toHaveBeenCalled();
    });
  });

  describe("FetchSafariPolyfill::getProcessedAppResponse", () => {
    it("should return a valid Response object with correct status", async () => {
      expect.assertions(2);
      jest
        .spyOn(SendNativeMessageService, "sendNativeMessage")
        .mockResolvedValue(appResponseWithStatus(201, "Created"));

      const response = await FetchSafariPolyfill(TEST_URL, defaultFetchOptions());

      expect(response.status).toBe(201);
      expect(response.statusText).toBe("Created");
    });

    it("should include body as JSON string", async () => {
      expect.assertions(1);
      jest
        .spyOn(SendNativeMessageService, "sendNativeMessage")
        .mockResolvedValue(appResponseWithBody({ header: { code: 200 }, body: { id: "123", name: "test" } }));

      const response = await FetchSafariPolyfill(TEST_URL, defaultFetchOptions());
      const body = await response.json();

      expect(body).toEqual({ header: { code: 200 }, body: { id: "123", name: "test" } });
    });

    it("should append headers to response", async () => {
      expect.assertions(1);
      jest
        .spyOn(SendNativeMessageService, "sendNativeMessage")
        .mockResolvedValue(appResponseWithHeaders({ "X-Custom-Header": "custom-value" }));

      const response = await FetchSafariPolyfill(TEST_URL, defaultFetchOptions());

      expect(response.headers.get("X-Custom-Header")).toBe("custom-value");
    });

    it("should call updateCookiesWithSetCookieHeader when Set-Cookie header present", async () => {
      expect.assertions(2);
      jest.spyOn(SendNativeMessageService, "sendNativeMessage").mockResolvedValue(appResponseWithSetCookie());
      jest.spyOn(CookiesService.prototype, "updateCookiesWithSetCookieHeader").mockResolvedValue();

      await FetchSafariPolyfill(TEST_URL, defaultFetchOptions());

      expect(CookiesService.prototype.updateCookiesWithSetCookieHeader).toHaveBeenCalledTimes(1);
      expect(CookiesService.prototype.updateCookiesWithSetCookieHeader).toHaveBeenCalledWith(
        "session=abc123; Path=/; Secure",
      );
    });

    it("should not call updateCookiesWithSetCookieHeader when no Set-Cookie header", async () => {
      expect.assertions(1);
      jest.spyOn(SendNativeMessageService, "sendNativeMessage").mockResolvedValue(defaultAppResponse());
      jest.spyOn(CookiesService.prototype, "updateCookiesWithSetCookieHeader");

      await FetchSafariPolyfill(TEST_URL, defaultFetchOptions());

      expect(CookiesService.prototype.updateCookiesWithSetCookieHeader).not.toHaveBeenCalled();
    });

    it("should use body header code when code is not in headers", async () => {
      expect.assertions(1);
      jest.spyOn(SendNativeMessageService, "sendNativeMessage").mockResolvedValue({
        success: true,
        httpResponse: {
          headers: { status: "Accepted" },
          body: { header: { code: 202 } },
        },
      });

      const response = await FetchSafariPolyfill(TEST_URL, defaultFetchOptions());

      expect(response.status).toBe(202);
    });
  });
});
