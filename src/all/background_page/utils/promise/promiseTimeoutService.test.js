/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.1.2
 */
import PromiseTimeoutService from "./promiseTimeoutService";

describe("PromiseTimeoutService", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("PromiseTimeoutService::exec", () => {
    it("Should exec PromiseTimeout with a promise resolved before timeout", async() => {
      expect.assertions(3);
      // data mocked
      const promise = new Promise(resolve => resolve("DONE"));
      // mock functions
      jest.spyOn(global, "setTimeout");
      jest.spyOn(global, "clearTimeout");
      // process
      const PromiseTimeoutResult = await PromiseTimeoutService.exec(promise, 1000);
      // expectations
      expect(global.setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
      expect(PromiseTimeoutResult).toStrictEqual("DONE");
      // Need to resolve the result and the finally
      await Promise.resolve();
      await Promise.resolve();
      expect(global.clearTimeout).toHaveBeenCalledTimes(1);
    });

    it("Should exec PromiseTimeout with a promise rejected before timeout", async() => {
      expect.assertions(3);
      // data mocked
      const promise = new Promise((resolve, reject) => reject("REJECT"));
      // mock functions
      jest.spyOn(global, "setTimeout");
      jest.spyOn(global, "clearTimeout");
      // process
      try {
        await PromiseTimeoutService.exec(promise);
      } catch (error) {
        // expectations
        expect(global.setTimeout).toHaveBeenCalledWith(expect.any(Function), 500);
        // Need to resolve the finally
        await Promise.resolve();
        expect(global.clearTimeout).toHaveBeenCalledTimes(1);
        expect(error).toStrictEqual("REJECT");
      }
    });

    it("Should exec PromiseTimeout with a promise throwing error before timeout", async() => {
      expect.assertions(3);
      // data mocked
      const promise = new Promise(() => { throw new Error("REJECT"); });
      // mock functions
      jest.spyOn(global, "setTimeout");
      jest.spyOn(global, "clearTimeout");
      // process
      try {
        await PromiseTimeoutService.exec(promise);
      } catch (error) {
        // expectations
        expect(global.setTimeout).toHaveBeenCalledWith(expect.any(Function), 500);
        // Need to resolve the finally
        await Promise.resolve();
        expect(global.clearTimeout).toHaveBeenCalledTimes(1);
        expect(error.message).toStrictEqual("REJECT");
      }
    });

    it("Should exec PromiseTimeout with a promise not resolved before timeout", async() => {
      expect.assertions(1);
      // data mocked
      const promise = new Promise(() => null);
      // mock functions
      jest.spyOn(global, "setTimeout");
      jest.spyOn(global, "clearTimeout");
      // process
      try {
        await PromiseTimeoutService.exec(promise);
      } catch (error) {
        // expectations
        expect(global.clearTimeout).toHaveBeenCalledTimes(0);
      }
    });
  });
});
