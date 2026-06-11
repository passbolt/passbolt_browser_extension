/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.8.0
 */
import MessageService from "./messageService";

describe("MessageService", () => {
  describe("MessageService::onMessage", () => {
    it("Should receive a message know by message service", async () => {
      expect.assertions(2);
      // data mocked
      const callback = jest.fn();
      // process
      const messageService = new MessageService();
      messageService.addListener("test", callback);
      messageService._onMessage(["test", "argument"]);
      // expectation
      expect(browser.runtime.onMessage.addListener).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith("argument");
    });

    it("Should decline (return undefined, no dispatch) a message it does not own", () => {
      expect.assertions(2);
      const callback = jest.fn();
      const messageService = new MessageService();
      messageService.addListener("known.event", callback);
      // An event with no registered listener must be declined synchronously so the
      // polyfill closes the channel instead of nulling the reply of the real responder.
      const result = messageService._onMessage(["unknown.event", "argument"]);
      expect(result).toBeUndefined();
      expect(callback).not.toHaveBeenCalled();
    });

    it("Should decline a non-array message such as an automation {type} object", () => {
      expect.assertions(2);
      const callback = jest.fn();
      const messageService = new MessageService();
      messageService.addListener("known.event", callback);
      const result = messageService._onMessage({ type: "passbolt.automation.list-keys" });
      expect(result).toBeUndefined();
      expect(callback).not.toHaveBeenCalled();
    });

    it("Should decline event names that are prototype members (constructor/__proto__)", () => {
      expect.assertions(3);
      // The null-prototype listener map means these resolve to undefined (not an
      // Object.prototype function) and are declined, never claimed/dispatched.
      const messageService = new MessageService();
      expect(messageService._onMessage(["constructor", "x"])).toBeUndefined();
      expect(messageService._onMessage(["__proto__", "x"])).toBeUndefined();
      expect(messageService._onMessage(["hasOwnProperty", "x"])).toBeUndefined();
    });

    it("Should keep the channel open for an owned event until its dispatch settles", async () => {
      expect.assertions(2);
      let resolveCallback;
      const callback = jest.fn(
        () =>
          new Promise((resolve) => {
            resolveCallback = resolve;
          }),
      );
      const messageService = new MessageService();
      messageService.addListener("owned.event", callback);
      const result = messageService._onMessage(["owned.event"]);
      // Owned event returns a thenable, so the polyfill holds the response channel open.
      expect(typeof result.then).toBe("function");
      // It must stay pending until the dispatched callback settles, since the WorkerService.get
      // "await passbolt.port.connect then read the reconnected port" timing contract.
      const pending = Symbol("pending");
      const raced = await Promise.race([result, Promise.resolve(pending)]);
      expect(raced).toBe(pending);
      resolveCallback();
      await result;
    });
  });

  describe("MessageService::emit", () => {
    it("Should emit a success message", async () => {
      expect.assertions(1);
      // process
      const messageService = new MessageService();
      const result = await messageService.success("result");
      // expectation
      expect(result).toStrictEqual("result");
    });

    it("Should emit an error message", async () => {
      expect.assertions(1);
      // process
      const messageService = new MessageService();
      try {
        await messageService.error("error");
      } catch (error) {
        // expectation
        expect(error).toStrictEqual("error");
      }
    });
  });
});
