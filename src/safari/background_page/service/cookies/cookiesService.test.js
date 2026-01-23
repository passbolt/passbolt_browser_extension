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

import { CookiesService } from "./cookiesService";
import { fullSessionCookie, fullThemeCookie, simpleSessionCookie, simpleThemeCookie } from "./cookiesService.test.data";

beforeEach(() => {
  jest.resetAllMocks();
});

describe("CookieService", () => {
  describe("::getSerialisedCookies", () => {
    it("should serialize the given set of cookies", async () => {
      expect.assertions(1);
      const cookie1 = {
        name: "session",
        value: "abcdef",
      };

      const cookie2 = {
        name: "test",
        value: "other",
        url: "https://www.passbolt.com",
        domain: "www.passbolt.com",
        secure: true,
        httpOnly: true,
      };

      const cookies = [cookie1, cookie2];
      jest.spyOn(chrome.cookies, "getAll").mockReturnValue(cookies);

      const service = new CookiesService("https://www.passbolt.com");
      const result = await service.getSerialisedCookies();

      expect(result).toStrictEqual(`session=abcdef;test=other`);
    });
  });

  describe("::updateCookiesWithSetCookieHeader", () => {
    it("should call for chrome.cookies.set with the given cookie", async () => {
      expect.assertions(2);

      jest.spyOn(chrome.cookies, "set").mockImplementation(() => {});

      const service = new CookiesService("https://www.passbolt.com");
      const cookieString = fullSessionCookie();

      await service.updateCookiesWithSetCookieHeader(cookieString);

      expect(chrome.cookies.set).toHaveBeenCalledTimes(1);
      expect(chrome.cookies.set).toHaveBeenCalledWith({
        name: "session",
        value: "test-session",
        url: "https://www.passbolt.com/",
        domain: "www.passbolt.com",
        secure: true,
        httpOnly: true,
        path: "/passbolt/",
        sameSite: "strict",
        expirationDate: 0,
      });
    });

    it("should call for chrome.cookies.set for each cookie found", async () => {
      expect.assertions(3);

      jest.spyOn(chrome.cookies, "set").mockImplementation(() => {});

      const service = new CookiesService("https://www.passbolt.com");
      const cookieString = [fullSessionCookie(), simpleThemeCookie()].join(", ");

      await service.updateCookiesWithSetCookieHeader(cookieString);

      expect(chrome.cookies.set).toHaveBeenCalledTimes(2);
      expect(chrome.cookies.set).toHaveBeenCalledWith({
        name: "session",
        value: "test-session",
        url: "https://www.passbolt.com/",
        domain: "www.passbolt.com",
        secure: true,
        httpOnly: true,
        path: "/passbolt/",
        sameSite: "strict",
        expirationDate: 0,
      });

      expect(chrome.cookies.set).toHaveBeenCalledWith({
        name: "theme",
        value: "dark",
        url: "https://www.passbolt.com/",
        domain: "www.passbolt.com",
        sameSite: "strict",
      });
    });

    it("should assert its parameter", async () => {
      expect.assertions(1);
      const service = new CookiesService("https://www.passbolt.com");
      await expect(() => service.updateCookiesWithSetCookieHeader(42)).rejects.toThrowError();
    });
  });

  describe("::getCsrfToken", () => {
    it("should return the csrf token value if any", async () => {
      expect.assertions(3);

      jest.spyOn(chrome.cookies, "get").mockImplementation(() => ({ value: "123456" }));

      const service = new CookiesService("https://www.passbolt.com");

      const cookieValue = await service.getCsrfToken();
      expect(cookieValue).toStrictEqual("123456");
      expect(chrome.cookies.get).toHaveBeenCalledTimes(1);
      expect(chrome.cookies.get).toHaveBeenCalledWith({
        domain: "www.passbolt.com",
        url: "https://www.passbolt.com/",
        name: "csrfToken",
      });
    });

    it("should return null if there is no csrf token set", async () => {
      expect.assertions(3);

      jest.spyOn(chrome.cookies, "get").mockImplementation(() => null);

      const service = new CookiesService("https://www.passbolt.com");

      const cookieValue = await service.getCsrfToken();
      expect(cookieValue).toBeNull();
      expect(chrome.cookies.get).toHaveBeenCalledTimes(1);
      expect(chrome.cookies.get).toHaveBeenCalledWith({
        domain: "www.passbolt.com",
        url: "https://www.passbolt.com/",
        name: "csrfToken",
      });
    });
  });

  describe("::deserialisedCookie", () => {
    it("should pick a cookie string and prepare an Cookie object compatible with chrome.cookies API", () => {
      expect.assertions(2);
      const service = new CookiesService("https://www.passbolt.com");
      const cookieString = simpleThemeCookie();

      const cookieList = service.deserialisedCookie(cookieString);
      expect(cookieList).toHaveLength(1);
      expect(cookieList[0]).toStrictEqual({
        url: "https://www.passbolt.com/",
        domain: "www.passbolt.com",
        name: "theme",
        value: "dark",
        sameSite: "strict",
      });
    });

    it("should pick a cookie string with all attributes and prepare Cookie objects compatible with chrome.cookies API", () => {
      expect.assertions(2);
      const service = new CookiesService("https://www.passbolt.com");
      const cookieString = fullThemeCookie();

      const cookieList = service.deserialisedCookie(cookieString);
      expect(cookieList).toHaveLength(1);
      expect(cookieList[0]).toStrictEqual({
        url: "https://www.passbolt.com/",
        domain: "www.passbolt.com",
        name: "theme",
        value: "dark",
        sameSite: "strict",
        path: "/passbolt/",
        secure: true,
        httpOnly: true,
        expirationDate: 0,
      });
    });

    it("should pick a multiple cookie string with all attributes and prepare Cookie objects compatible with chrome.cookies API", () => {
      expect.assertions(3);
      const service = new CookiesService("https://www.passbolt.com");
      const cookieString = `${fullThemeCookie()}, ${fullSessionCookie()}`;

      const cookieList = service.deserialisedCookie(cookieString);
      expect(cookieList).toHaveLength(2);
      expect(cookieList[0]).toStrictEqual({
        url: "https://www.passbolt.com/",
        domain: "www.passbolt.com",
        name: "theme",
        value: "dark",
        sameSite: "strict",
        path: "/passbolt/",
        secure: true,
        httpOnly: true,
        expirationDate: 0,
      });
      expect(cookieList[1]).toStrictEqual({
        url: "https://www.passbolt.com/",
        domain: "www.passbolt.com",
        name: "session",
        value: "test-session",
        sameSite: "strict",
        path: "/passbolt/",
        secure: true,
        httpOnly: true,
        expirationDate: 0,
      });
    });

    it("should assert its parameter", () => {
      expect.assertions(1);
      const service = new CookiesService("https://www.passbolt.com");
      expect(() => service.deserialisedCookie(42)).toThrowError();
    });
  });

  describe("::splitMultiCookieString", () => {
    it("should not split the string if there is only one cookie with no attributes", () => {
      expect.assertions(2);
      const service = new CookiesService("https://www.passbolt.com");
      const cookieString = simpleThemeCookie();

      const cookieList = service.splitMultiCookieString(cookieString);
      expect(cookieList).toHaveLength(1);
      expect(cookieList[0]).toStrictEqual(cookieString);
    });

    it("should not split the string if there is only one cookie with some attributes", () => {
      expect.assertions(2);
      const service = new CookiesService("https://www.passbolt.com");
      const cookieString = simpleThemeCookie({ withSecure: true, withHttpOnly: true });

      const cookieList = service.splitMultiCookieString(cookieString);
      expect(cookieList).toHaveLength(1);
      expect(cookieList[0]).toStrictEqual(cookieString);
    });

    it("should not split the string if there is only one cookie with all attributes", () => {
      expect.assertions(2);
      const service = new CookiesService("https://www.passbolt.com");
      const cookieString = fullThemeCookie();

      const cookieList = service.splitMultiCookieString(cookieString);
      expect(cookieList).toHaveLength(1);
      expect(cookieList[0]).toStrictEqual(cookieString);
    });

    it("should split the string if there are more than one cookie with no attributes", () => {
      expect.assertions(3);
      const service = new CookiesService("https://www.passbolt.com");
      const cookie1 = simpleThemeCookie();
      const cookie2 = simpleSessionCookie();
      const cookieString = `${cookie1}, ${cookie2}`;

      const cookieList = service.splitMultiCookieString(cookieString);
      expect(cookieList).toHaveLength(2);
      expect(cookieList[0]).toStrictEqual(cookie1);
      expect(cookieList[1]).toStrictEqual(cookie2);
    });

    it("should split the string if there are more than cookie with some attributes", () => {
      expect.assertions(3);
      const service = new CookiesService("https://www.passbolt.com");
      const cookie1 = simpleThemeCookie({ withSecure: true, withHttpOnly: true });
      const cookie2 = simpleSessionCookie({ withPath: true, withSameSaite: true });
      const cookieString = `${cookie1}, ${cookie2}`;

      const cookieList = service.splitMultiCookieString(cookieString);
      expect(cookieList).toHaveLength(2);
      expect(cookieList[0]).toStrictEqual(cookie1);
      expect(cookieList[1]).toStrictEqual(cookie2);
    });

    it("should split the string if there are more than one cookie with all attributes and not split on the expiry date", () => {
      expect.assertions(3);
      const service = new CookiesService("https://www.passbolt.com");
      const cookie1 = fullThemeCookie();
      const cookie2 = fullSessionCookie();
      const cookieString = `${cookie1}, ${cookie2}`;

      const cookieList = service.splitMultiCookieString(cookieString);
      expect(cookieList).toHaveLength(2);
      expect(cookieList[0]).toStrictEqual(cookie1);
      expect(cookieList[1]).toStrictEqual(cookie2);
    });

    it("should split the string with many cookies", () => {
      expect.assertions(7);
      const service = new CookiesService("https://www.passbolt.com");
      const cookies = [
        simpleThemeCookie(),
        simpleSessionCookie(),
        simpleThemeCookie({ withSecure: true, withHttpOnly: true }),
        simpleSessionCookie({ withPath: true, withSameSaite: true }),
        fullThemeCookie(),
        fullSessionCookie(),
      ];

      const cookieString = cookies.join(", ");
      const cookieList = service.splitMultiCookieString(cookieString);
      expect(cookieList).toHaveLength(cookies.length);
      for (let i = 0; i < cookies.length; i++) {
        expect(cookieList[i]).toStrictEqual(cookies[i]);
      }
    });

    it("should handle cookies with Expires containing commas in dates", () => {
      expect.assertions(4);
      const service = new CookiesService("https://www.passbolt.com");
      const cookieString =
        "session=abc; Expires=Thu, 19 Nov 2026 08:52:00 GMT; Path=/; Secure, csrfToken=xyz123; Expires=Fri, 20 Nov 2026 08:52:00 GMT; Path=/";

      const cookieList = service.splitMultiCookieString(cookieString);
      expect(cookieList).toHaveLength(2);
      expect(cookieList[0]).toContain("session=abc");
      expect(cookieList[0]).toContain("Expires=Thu, 19 Nov 2026");
      expect(cookieList[1]).toContain("csrfToken=xyz123");
    });

    it("should not create cookies where Expires becomes the cookie name", () => {
      expect.assertions(4);
      const service = new CookiesService("https://www.passbolt.com");
      const cookieString =
        "PHPSESSID=abc; path=/; Expires=Thu, 19 Nov 1981 08:52:00 GMT; HttpOnly, csrfToken=xyz; path=/; secure";

      const cookieList = service.deserialisedCookie(cookieString);

      expect(cookieList).toHaveLength(2);
      expect(cookieList.every((c) => c.name !== "Expires")).toBe(true);
      expect(cookieList[0].name).toBe("PHPSESSID");
      expect(cookieList[1].name).toBe("csrfToken");
    });
  });
});
