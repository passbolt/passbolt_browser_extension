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
 * @since         4.0.0
 */
import BrowserTabService from "./browserTab.service";
import {readWorker} from "../../model/entity/worker/workerEntity.test.data";
import browser from "../../sdk/polyfill/browserPolyfill";

describe("BrowserTabService", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("BrowserTabService::getCurrent", () => {
    it("Should get current tab", async() => {
      expect.assertions(1);
      // mock data
      const tab = {url: "https://localhost"};
      // mock functions
      jest.spyOn(browser.tabs, 'query').mockImplementationOnce(() => [tab]);
      // process
      const cuurentTab = await BrowserTabService.getCurrent();
      // expectations
      expect(cuurentTab).toBe(tab);
    });
  });

  describe("BrowserTabService::getById", () => {
    it("Should get tab by id", async() => {
      expect.assertions(1);
      // mock data
      const tab1 = {id: 1};
      const tab2 = {id: 2};
      // mock functions
      jest.spyOn(browser.tabs, 'query').mockImplementationOnce(() => [tab1, tab2]);
      // process
      const tab = await BrowserTabService.getById(1);
      // expectations
      expect(tab).toBe(tab1);
    });
  });

  describe("BrowserTabService::sendMessage", () => {
    it("Should send message to a specific tab and frame and get a success response", async() => {
      expect.assertions(1);
      // data mocked
      const worker = readWorker();
      // mock functions
      jest.spyOn(browser.tabs, 'sendMessage').mockImplementationOnce(() => ({status: "SUCCESS", response: "DONE"}));
      // process
      await BrowserTabService.sendMessage(worker, "message", "arguments1", "arguments2");
      // expectations
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(worker.tabId, ["message", "arguments1", "arguments2"], {frameId: worker.frameId});
    });

    it("Should send message to a specific tab and frame and get an error response", async() => {
      expect.assertions(2);
      // data mocked
      const worker = readWorker();
      // mock functions
      jest.spyOn(browser.tabs, 'sendMessage').mockImplementationOnce(() => Promise.reject("Error"));
      // process
      try {
        await BrowserTabService.sendMessage(worker, "message", "arguments1", "arguments2");
      } catch (error) {
        // expectations
        expect(browser.tabs.sendMessage).toHaveBeenCalledWith(worker.tabId, ["message", "arguments1", "arguments2"], {frameId: worker.frameId});
        expect(error).toStrictEqual("Error");
      }
    });
  });
});
