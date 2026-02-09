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
 * @since         5.10.0
 */
import BrowserService from "./browserService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("BrowserService", () => {
  describe("::isFirefox", () => {
    it("Should return true when the browser is Firefox", () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(browser.runtime, "getURL").mockReturnValue("moz-extension://134c1a66-c6e3-1343-a5d4-63c511465c17/");
      // expectations
      expect(BrowserService.isFirefox()).toBe(true);
    });

    it("Should return false when the browser is Chrome", () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(browser.runtime, "getURL").mockReturnValue("chrome-extension://abcdefghijklmnop/");
      // expectations
      expect(BrowserService.isFirefox()).toBe(false);
    });

    it("Should return false when the browser is Safari", () => {
      expect.assertions(1);
      // mock functions
      jest
        .spyOn(browser.runtime, "getURL")
        .mockReturnValue("safari-web-extension://134c1a66-c6e3-1343-a5d4-63c511465c17/");
      // expectations
      expect(BrowserService.isFirefox()).toBe(false);
    });
  });

  describe("::isSafari", () => {
    it("Should return true when the browser is Safari", () => {
      expect.assertions(1);
      // mock functions
      jest
        .spyOn(browser.runtime, "getURL")
        .mockReturnValue("safari-web-extension://134c1a66-c6e3-1343-a5d4-63c511465c17/");
      // expectations
      expect(BrowserService.isSafari()).toBe(true);
    });

    it("Should return false when the browser is Chrome", () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(browser.runtime, "getURL").mockReturnValue("chrome-extension://abcdefghijklmnop/");
      // expectations
      expect(BrowserService.isSafari()).toBe(false);
    });

    it("Should return false when the browser is Firefox", () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(browser.runtime, "getURL").mockReturnValue("moz-extension://134c1a66-c6e3-1343-a5d4-63c511465c17/");
      // expectations
      expect(BrowserService.isSafari()).toBe(false);
    });
  });
});
