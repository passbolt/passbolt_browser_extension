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
import OpenSafariExtensionSettingsService from "./openSafariExtensionSettingsService";
import { SendNativeMessageService } from "../../../../safari/background_page/service/nativeMessage/sendNativeMessageService";
import BrowserService from "../browser/browserService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("OpenSafariExtensionSettingsService", () => {
  describe("::openSettings", () => {
    it("Should send a native message to open Safari extension settings when on Safari", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(BrowserService, "isSafari").mockReturnValue(true);
      jest.spyOn(SendNativeMessageService, "sendNativeMessage").mockImplementation(() => {});
      // process
      await OpenSafariExtensionSettingsService.openSettings();
      // expectations
      expect(SendNativeMessageService.sendNativeMessage).toHaveBeenCalledWith("open-safari-settings");
    });

    it("Should not send a native message when not on Safari", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(BrowserService, "isSafari").mockReturnValue(false);
      jest.spyOn(SendNativeMessageService, "sendNativeMessage").mockImplementation(() => {});
      // process
      await OpenSafariExtensionSettingsService.openSettings();
      // expectations
      expect(SendNativeMessageService.sendNativeMessage).not.toHaveBeenCalled();
    });

    it("Should propagate errors from SendNativeMessageService", async () => {
      expect.assertions(1);
      // mock data
      const error = new Error("Safari native application execution failed");
      // mock functions
      jest.spyOn(BrowserService, "isSafari").mockReturnValue(true);
      jest.spyOn(SendNativeMessageService, "sendNativeMessage").mockRejectedValue(error);
      // expectations
      await expect(OpenSafariExtensionSettingsService.openSettings()).rejects.toThrow(error);
    });
  });
});
