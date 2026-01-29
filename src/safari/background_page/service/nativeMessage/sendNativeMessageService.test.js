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

import { SendNativeMessageService } from "./sendNativeMessageService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SendNativeMessageService", () => {
  describe("::sendNativeMessage", () => {
    it("should call chrome.runtime.sendNativeMessage with the right arguments", async () => {
      expect.assertions(3);

      const action = "test-message";
      const args = { arg1: "test", arg2: "other-test" };
      const expectedMessage = { action, ...args };

      jest.spyOn(chrome.runtime, "sendNativeMessage").mockReturnValue({ success: true });

      const result = await SendNativeMessageService.sendNativeMessage(action, args);

      expect(result).toBeUndefined();
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledTimes(1);
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledWith("com.passbolt.safari", expectedMessage);
    });

    it("should call chrome.runtime.sendNativeMessage with the right arguments and return an object value", async () => {
      expect.assertions(3);

      const action = "test-message";
      const args = { arg1: "test", arg2: "other-test" };
      const expectedMessage = { action, ...args };
      const returnedValue = { field1: "value1" };

      jest.spyOn(chrome.runtime, "sendNativeMessage").mockReturnValue({ success: true, returnedValue: returnedValue });

      const result = await SendNativeMessageService.sendNativeMessage(action, args);

      expect(result).toStrictEqual(returnedValue);
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledTimes(1);
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledWith("com.passbolt.safari", expectedMessage);
    });

    it("should call chrome.runtime.sendNativeMessage with the right arguments and return an array value", async () => {
      expect.assertions(3);

      const action = "test-message";
      const args = { arg1: "test", arg2: "other-test" };
      const expectedMessage = { action, ...args };
      const returnedValue = ["test", "other"];

      jest.spyOn(chrome.runtime, "sendNativeMessage").mockReturnValue({ success: true, returnedValue: returnedValue });

      const result = await SendNativeMessageService.sendNativeMessage(action, args);

      expect(result).toStrictEqual(returnedValue);
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledTimes(1);
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledWith("com.passbolt.safari", expectedMessage);
    });

    it("should call chrome.runtime.sendNativeMessage with the right arguments and return a scalar", async () => {
      expect.assertions(3);

      const action = "test-message";
      const args = { arg1: "test", arg2: "other-test" };
      const expectedMessage = { action, ...args };
      const returnedValue = 42;

      jest.spyOn(chrome.runtime, "sendNativeMessage").mockReturnValue({ success: true, returnedValue: returnedValue });

      const result = await SendNativeMessageService.sendNativeMessage(action, args);

      expect(result).toStrictEqual(returnedValue);
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledTimes(1);
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledWith("com.passbolt.safari", expectedMessage);
    });

    it("should call chrome.runtime.sendNativeMessage with the right arguments and return a string", async () => {
      expect.assertions(3);

      const action = "test-message";
      const args = { arg1: "test", arg2: "other-test" };
      const expectedMessage = { action, ...args };
      const returnedValue = "something";

      jest.spyOn(chrome.runtime, "sendNativeMessage").mockReturnValue({ success: true, returnedValue: returnedValue });

      const result = await SendNativeMessageService.sendNativeMessage(action, args);

      expect(result).toStrictEqual(returnedValue);
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledTimes(1);
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledWith("com.passbolt.safari", expectedMessage);
    });

    it("should call chrome.runtime.sendNativeMessage with the right arguments and return nothing", async () => {
      expect.assertions(3);

      const action = "test-message";
      const args = { arg1: "test", arg2: "other-test" };
      const expectedMessage = { action, ...args };

      jest.spyOn(chrome.runtime, "sendNativeMessage").mockReturnValue({ success: true });

      const result = await SendNativeMessageService.sendNativeMessage(action, args);

      expect(result).toBeUndefined();
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledTimes(1);
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledWith("com.passbolt.safari", expectedMessage);
    });

    it("should call chrome.runtime.sendNativeMessage with the right arguments and return null", async () => {
      expect.assertions(3);

      const action = "test-message";
      const args = { arg1: "test", arg2: "other-test" };
      const expectedMessage = { action, ...args };

      jest.spyOn(chrome.runtime, "sendNativeMessage").mockReturnValue({ success: true, returnedValue: null });

      const result = await SendNativeMessageService.sendNativeMessage(action, args);

      expect(result).toBeNull();
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledTimes(1);
      expect(chrome.runtime.sendNativeMessage).toHaveBeenCalledWith("com.passbolt.safari", expectedMessage);
    });

    it("should throw an error if the messaging went wrong", async () => {
      expect.assertions(1);

      const action = "error-message";
      const args = { arg1: "test", arg2: "other-test" };

      jest
        .spyOn(chrome.runtime, "sendNativeMessage")
        .mockReturnValue({ success: false, error: "Something went wrong!" });

      await expect(() => SendNativeMessageService.sendNativeMessage(action, args)).rejects.toThrowError(
        new Error("Something went wrong!"),
      );
    });

    it("should throw an error with a generic message if the messaging went wrong and gave no error message", async () => {
      expect.assertions(1);

      const action = "error-message";
      const args = { arg1: "test", arg2: "other-test" };

      jest.spyOn(chrome.runtime, "sendNativeMessage").mockReturnValue({ success: false });

      await expect(() => SendNativeMessageService.sendNativeMessage(action, args)).rejects.toThrowError(
        new Error("Safari native application execution failed"),
      );
    });
  });
});
