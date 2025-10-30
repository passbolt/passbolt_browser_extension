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
 * @since         5.6.0
 */

import {SendNativeMessageService} from "./sendNativeMessageService";

describe("SendNativeMessageService", () => {
  describe("::sendNativeMessage", () => {
    it("should call for chrome.runtime.sendNativeMessage with the right arguments", async() => {
      expect.assertions(3);

      const action = "test-message";
      const args = {arg1: "test", arg2: "other-test"};
      const expectedMessage = {action, ...args};

      jest.spyOn(chrome.runtime, "sendNativeMessage").mockReturnValue({success: true});

      const result = await SendNativeMessageService.sendNativeMessage(action, args);

      expect(result).toStrictEqual({success: true});
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledTimes(1);
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledWith("com.passbolt.Passbolt-Safari-Extension", expectedMessage);
    });

    it("should throw an error if the messaing went wrong", async() => {
      expect.assertions(1);

      const action = "error-message";
      const args = {arg1: "test", arg2: "other-test"};

      jest.spyOn(chrome.runtime, "sendNativeMessage").mockReturnValue({success: false, error: "Something went wrong!"});

      await expect(() => SendNativeMessageService.sendNativeMessage(action, args)).rejects.toThrowError(new Error("Something went wrong!"));
    });

    it("should throw an error with a generic message if the messaing went wrong and gave no error message", async() => {
      expect.assertions(1);

      const action = "error-message";
      const args = {arg1: "test", arg2: "other-test"};

      jest.spyOn(chrome.runtime, "sendNativeMessage").mockReturnValue({success: false});

      await expect(() => SendNativeMessageService.sendNativeMessage(action, args)).rejects.toThrowError(new Error("Safari native application execution failed"));
    });
  });
});
