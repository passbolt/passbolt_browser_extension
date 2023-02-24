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
import browser from "../../../background_page/sdk/polyfill/browserPolyfill";

describe("MessageService", () => {
  describe("MessageService::onMessage", () => {
    it("Should receive a message know by message service", async() => {
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
  });

  describe("MessageService::emit", () => {
    it("Should emit a success message", async() => {
      expect.assertions(1);
      // process
      const messageService = new MessageService();
      const result = await messageService.success("result");
      // expectation
      expect(result).toStrictEqual("result");
    });

    it("Should emit an error message", async() => {
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
