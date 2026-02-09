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
import ExtensionPermissionsService from "./extensionPermissionsService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ExtensionPermissionsService", () => {
  describe("::isAllowedOnEveryWebsite", () => {
    it("Should return true when origins contains *://*/*", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(browser.permissions, "getAll").mockImplementation(() => ({
        origins: ["*://*/*"],
        permissions: ["activeTab"],
      }));
      // process & expectations
      const result = await ExtensionPermissionsService.isAllowedOnEveryWebsite();
      expect(result).toBe(true);
    });

    it("Should return true when origins contains <all_urls>", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(browser.permissions, "getAll").mockImplementation(() => ({
        origins: ["<all_urls>"],
        permissions: ["activeTab"],
      }));
      // process & expectations
      const result = await ExtensionPermissionsService.isAllowedOnEveryWebsite();
      expect(result).toBe(true);
    });

    it("Should return true when origins contains *://*/* among other origins", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(browser.permissions, "getAll").mockImplementation(() => ({
        origins: ["https://passbolt.local/*", "*://*/*"],
        permissions: ["activeTab"],
      }));
      // process & expectations
      const result = await ExtensionPermissionsService.isAllowedOnEveryWebsite();
      expect(result).toBe(true);
    });

    it("Should return false when origins only has specific URLs", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(browser.permissions, "getAll").mockImplementation(() => ({
        origins: ["https://passbolt.local/*", "https://example.com/*"],
        permissions: ["activeTab"],
      }));
      // process & expectations
      const result = await ExtensionPermissionsService.isAllowedOnEveryWebsite();
      expect(result).toBe(false);
    });

    it("Should return false when origins is empty", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(browser.permissions, "getAll").mockImplementation(() => ({
        origins: [],
        permissions: ["activeTab"],
      }));
      // process & expectations
      const result = await ExtensionPermissionsService.isAllowedOnEveryWebsite();
      expect(result).toBe(false);
    });
  });
});
