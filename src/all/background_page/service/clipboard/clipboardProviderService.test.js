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
import "../../../../../test/mocks/mockNavigatorClipboard";
import ClipboardProviderService from "./clipboardProviderService";
import BrowserService from "../browser/browserService";
import EdgeBackgroundPageClipboardService from "../../../../chrome/polyfill/clipboard/edgeBackgroundPageClipboardService";

beforeEach(() => {
  global.customNavigatorClipboard = undefined;
});

describe("ClipboardProviderService", () => {
  describe("::getClipboard", () => {
    it("should return the customNavigatorClipboard if it is set", async() => {
      expect.assertions(1);

      const customNavigatorClipboard = {writeText: jest.fn()};
      global.customNavigatorClipboard = customNavigatorClipboard;

      expect(ClipboardProviderService.getClipboard()).toStrictEqual(customNavigatorClipboard);
    });

    it("should return the EdgeBackgroundPageClipboardService if not on Firefox and is on MV2", async() => {
      expect.assertions(1);

      chrome.runtime.getManifest.mockImplementation(() => ({manifest_version: 2}));
      jest.spyOn(BrowserService, "isFirefox").mockImplementation(() => false);

      expect(ClipboardProviderService.getClipboard()).toStrictEqual(EdgeBackgroundPageClipboardService);
    });

    it("should return the navigator.clipboard in every other cases: Firefox", async() => {
      expect.assertions(1);

      chrome.runtime.getManifest.mockImplementation(() => ({manifest_version: 2}));
      jest.spyOn(BrowserService, "isFirefox").mockImplementation(() => true);

      expect(ClipboardProviderService.getClipboard()).toStrictEqual(navigator.clipboard);
    });

    it("should return the navigator.clipboard in every other cases: Firefox + mv3", async() => {
      expect.assertions(1);

      chrome.runtime.getManifest.mockImplementation(() => ({manifest_version: 3}));
      jest.spyOn(BrowserService, "isFirefox").mockImplementation(() => true);

      expect(ClipboardProviderService.getClipboard()).toStrictEqual(navigator.clipboard);
    });
  });
});
