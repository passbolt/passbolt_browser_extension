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
import { readWorker } from "../../model/entity/worker/workerEntity.test.data";

describe("BrowserTabService", () => {
  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("BrowserTabService::getCurrent", () => {
    it("Should get current tab", async () => {
      expect.assertions(1);
      // mock data
      const tab = { url: "https://localhost" };
      // mock functions
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [tab]);
      // process
      const cuurentTab = await BrowserTabService.getCurrent();
      // expectations
      expect(cuurentTab).toBe(tab);
    });
  });

  describe("BrowserTabService::getById", () => {
    it("Should get tab by id", async () => {
      expect.assertions(1);
      // mock data
      const tab1 = { id: 1 };
      const tab2 = { id: 2 };
      // mock functions
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [tab1, tab2]);
      // process
      const tab = await BrowserTabService.getById(1);
      // expectations
      expect(tab).toBe(tab1);
    });
  });

  describe("BrowserTabService::sendMessage", () => {
    it("Should send message to a specific tab and frame and get a success response", async () => {
      expect.assertions(1);
      // data mocked
      const worker = readWorker();
      // mock functions
      jest.spyOn(browser.tabs, "sendMessage").mockImplementationOnce(() => ({ status: "SUCCESS", response: "DONE" }));
      // process
      await BrowserTabService.sendMessage(worker, "message", "arguments1", "arguments2");
      // expectations
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(worker.tabId, ["message", "arguments1", "arguments2"], {
        frameId: worker.frameId,
      });
    });

    it("Should send message to a specific tab and frame and get an error response", async () => {
      expect.assertions(2);
      // data mocked
      const worker = readWorker();
      // mock functions
      jest.spyOn(browser.tabs, "sendMessage").mockImplementationOnce(() => Promise.reject("Error"));
      // process
      try {
        await BrowserTabService.sendMessage(worker, "message", "arguments1", "arguments2");
      } catch (error) {
        // expectations
        expect(browser.tabs.sendMessage).toHaveBeenCalledWith(worker.tabId, ["message", "arguments1", "arguments2"], {
          frameId: worker.frameId,
        });
        expect(error).toStrictEqual("Error");
      }
    });
  });

  describe("BrowserTabService::reloadTab", () => {
    it("Should reload the tab by id", async () => {
      expect.assertions(1);
      // mock data
      const tab = { id: 1 };
      // mock functions
      jest.spyOn(browser.tabs, "reload");
      // process
      await BrowserTabService.reloadTab(tab.id);
      // expectations
      expect(browser.tabs.reload).toHaveBeenCalledWith(tab.id);
    });

    it("Should assert its parameter", async () => {
      expect.assertions(1);
      // mock data
      const tab = { id: "1" };
      // process
      await expect(() => BrowserTabService.reloadTab(tab.id)).rejects.toThrowError();
    });
  });

  describe("BrowserTabService::closeTab", () => {
    it("Should close the tab by id", async () => {
      expect.assertions(1);
      // mock data
      const tab = { id: 1 };
      // mock functions
      jest.spyOn(browser.tabs, "remove");
      // process
      await BrowserTabService.closeTab(tab.id);
      // expectations
      expect(browser.tabs.remove).toHaveBeenCalledWith(tab.id);
    });

    it("Should assert its parameter", async () => {
      expect.assertions(1);
      // mock data
      const tab = { id: "1" };
      // process
      await expect(() => BrowserTabService.closeTab(tab.id)).rejects.toThrowError();
    });
  });

  describe("BrowserTabService::openTab", () => {
    it("Should open a new tab given a URL", async () => {
      expect.assertions(1);
      // mock data
      const url = "https://www.passbolt.com/";
      // mock functions
      jest.spyOn(browser.tabs, "create");
      // process
      await BrowserTabService.openTab(url);
      // expectations
      expect(browser.tabs.create).toHaveBeenCalledWith({ url });
    });

    it("Should throw an error if the URL is not valid", async () => {
      expect.assertions(4);
      // mock functions
      jest.spyOn(browser.tabs, "create");

      await expect(() => BrowserTabService.openTab(null)).rejects.toThrowError();
      await expect(() => BrowserTabService.openTab("url")).rejects.toThrowError();
      await expect(() => BrowserTabService.openTab("ftp://www.passbolt.com")).rejects.toThrowError();
      await expect(() => BrowserTabService.openTab("javascript:void(0")).rejects.toThrowError();
    });
  });

  describe("BrowserTabService::updateCurrentTabUrl", () => {
    it("Should update the current tab with the given URL", async () => {
      expect.assertions(2);
      // mock data
      const url = "https://www.passbolt.com/";
      const currentTab = { id: 42 };
      // mock functions
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [currentTab]);
      jest.spyOn(browser.tabs, "update");
      // process
      await BrowserTabService.updateCurrentTabUrl(url);
      // expectations
      expect(browser.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true });
      expect(browser.tabs.update).toHaveBeenCalledWith(currentTab.id, { url });
    });

    it("Should throw an error if the URL is not valid", async () => {
      expect.assertions(4);
      // mock functions
      jest.spyOn(browser.tabs, "update");

      await expect(() => BrowserTabService.updateCurrentTabUrl(null)).rejects.toThrowError(
        "Cannot update the current tab due to an invalid URL",
      );
      await expect(() => BrowserTabService.updateCurrentTabUrl("url")).rejects.toThrowError(
        "Cannot update the current tab due to an invalid URL",
      );
      await expect(() => BrowserTabService.updateCurrentTabUrl("ftp://www.passbolt.com")).rejects.toThrowError(
        "Cannot update the current tab due to an invalid URL",
      );
      await expect(() => BrowserTabService.updateCurrentTabUrl("javascript:void(0")).rejects.toThrowError(
        "Cannot update the current tab due to an invalid URL",
      );
    });
  });
});
