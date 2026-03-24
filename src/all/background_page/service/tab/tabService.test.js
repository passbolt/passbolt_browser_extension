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
 * @since         4.0.0
 */
import WorkersSessionStorage from "../sessionStorage/workersSessionStorage";
import { readWorker } from "../../model/entity/worker/workerEntity.test.data";
import { mockPort } from "../../sdk/port/portManager.test.data";
import Port from "../../sdk/port";
import PortManager from "../../sdk/port/portManager";
import WebNavigationService from "../webNavigation/webNavigationService";
import TabService from "./tabService";
import BrowserTabService from "../ui/browserTab.service";
import workerEntity from "../../model/entity/worker/workerEntity";
import WorkerService from "../worker/workerService";

const mockGetPort = jest.spyOn(PortManager, "getPortById");
const mockIsPortExist = jest.spyOn(PortManager, "isPortExist");
const mockWorker = jest.spyOn(WorkersSessionStorage, "getWorkerOnMainFrame");
const mockWorkerSessionStorageUpdate = jest.spyOn(WorkersSessionStorage, "updateWorker");
const mockBrowserTabServiceSendMessage = jest.spyOn(BrowserTabService, "sendMessage");
const mockBrowserTabServiceGetById = jest.spyOn(BrowserTabService, "getById");
jest.spyOn(WorkerService, "execNavigationForWorkerWaitingConnection");
jest.spyOn(WebNavigationService, "exec");

describe("TabService", () => {
  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  describe("TabService::exec", () => {
    it("exits if onUpdated event status is not completed", async () => {
      expect.assertions(3);
      // process
      await TabService.exec(1, { status: "loading" }, null);
      // expectations
      expect(PortManager.getPortById).not.toHaveBeenCalled();
      expect(WorkersSessionStorage.getWorkerOnMainFrame).not.toHaveBeenCalled();
      expect(WebNavigationService.exec).not.toHaveBeenCalled();
    });

    it("exits if tabs onUpdated event tab object has no url", async () => {
      expect.assertions(3);
      // process
      await TabService.exec(1, { status: "complete" }, {});
      // expectations
      expect(PortManager.getPortById).not.toHaveBeenCalled();
      expect(WorkersSessionStorage.getWorkerOnMainFrame).not.toHaveBeenCalled();
      expect(WebNavigationService.exec).not.toHaveBeenCalled();
    });

    it("exits if tabs onUpdated event tab object url protocol is not https or https", async () => {
      expect.assertions(3);
      // process
      await TabService.exec(1, { status: "complete" }, { url: "about:blank" });
      // expectations
      expect(PortManager.getPortById).not.toHaveBeenCalled();
      expect(WorkersSessionStorage.getWorkerOnMainFrame).not.toHaveBeenCalled();
      expect(WebNavigationService.exec).not.toHaveBeenCalled();
    });

    it("exits if 1. a worker was attached to the tab 2. a port is found in runtime memory 3. a content script application is still connected to this port", async () => {
      expect.assertions(6);
      // data mocked
      const worker = readWorker();
      const frameDetails = {
        url: "https://passbolt.dev",
        tabId: worker.tabId,
        frameId: worker.frameId,
      };
      const port = mockPort({ name: worker.id, tabId: worker.tabId, frameId: worker.frameId, url: frameDetails.url });
      const portWrapper = new Port(port);
      jest.spyOn(portWrapper, "request").mockImplementationOnce(() => Promise.resolve());
      jest.spyOn(global, "setTimeout");
      jest.spyOn(global, "clearTimeout");
      // mock function
      mockWorker.mockImplementationOnce(() => worker);
      mockIsPortExist.mockImplementationOnce(() => true);
      mockGetPort.mockImplementationOnce(() => portWrapper);
      // process
      await TabService.exec(frameDetails.tabId, { status: "complete" }, { url: "https://passbolt.dev" });
      // await promise resolve to have finally method finished
      await Promise.resolve();
      // expectations
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      expect(PortManager.getPortById).toHaveBeenCalledWith(worker.id);
      expect(portWrapper.request).toHaveBeenCalledWith("passbolt.port.check");
      expect(WebNavigationService.exec).not.toHaveBeenCalled();
      // Called 1 times during the execution
      expect(global.setTimeout).toHaveBeenCalledTimes(1);
      expect(global.clearTimeout).toHaveBeenCalledTimes(1);
    });

    it("exits if 1. a worker was attached to the tab 2. NO port is found in runtime memory 3. a content script application was able to reconnect the port", async () => {
      expect.assertions(3);
      // data mocked
      const worker = readWorker();
      const frameDetails = {
        url: "https://passbolt.dev",
        tabId: worker.tabId,
        frameId: worker.frameId,
      };
      // mock function
      mockWorker.mockImplementationOnce(() => worker);
      mockIsPortExist.mockImplementationOnce(() => false);
      mockWorkerSessionStorageUpdate.mockImplementationOnce(() => {});
      mockBrowserTabServiceSendMessage.mockImplementationOnce(jest.fn);

      // process
      await TabService.exec(frameDetails.tabId, { status: "complete" }, { url: "https://passbolt.dev" });

      // expectations
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      const expectWorker = { ...worker, status: workerEntity.STATUS_RECONNECTING };
      expect(BrowserTabService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining(expectWorker),
        "passbolt.port.connect",
        expectWorker.id,
      );
      expect(WebNavigationService.exec).not.toHaveBeenCalled();
    });

    it("triggers the pagemods identification process if no worker was previously attached to the tab", async () => {
      expect.assertions(5);
      // data mocked
      const frameDetails = {
        url: "https://localhost",
        tabId: 1234,
        frameId: 0,
      };
      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
      const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create");
      // mock function
      mockWorker.mockImplementationOnce(() => null);
      // process
      await TabService.exec(
        frameDetails.tabId,
        { status: "complete" },
        { id: frameDetails.tabId, url: frameDetails.url },
      );
      // expectations
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      expect(PortManager.getPortById).not.toHaveBeenCalled();
      expect(WebNavigationService.exec).toHaveBeenCalledWith(frameDetails);
      // Called 0 times during the execution
      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(0);
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(0);
    });

    it("triggers the pagemods identification process if 1. a worker was attached to the tab 2. a port is found in runtime memory 3. the port sender url and tab url origins are not similar", async () => {
      expect.assertions(5);
      // data mocked
      const worker = readWorker();
      const frameDetails = {
        url: "https://localhost",
        tabId: worker.tabId,
        frameId: 0,
      };
      const port = mockPort({
        name: worker.id,
        tabId: worker.tabId,
        frameId: worker.frameId,
        url: "https://passbolt.dev",
      });
      const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
      const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create");
      // mock function
      mockWorker.mockImplementationOnce(() => worker);
      mockIsPortExist.mockImplementationOnce(() => true);
      mockGetPort.mockImplementationOnce(() => new Port(port));
      // process
      await TabService.exec(
        frameDetails.tabId,
        { status: "complete" },
        { id: frameDetails.tabId, url: "https://localhost" },
      );
      // expectations
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      expect(PortManager.getPortById).toHaveBeenCalledWith(worker.id);
      expect(WebNavigationService.exec).toHaveBeenCalledWith(frameDetails);
      // Called 0 times during the execution
      expect(spyOnAlarmCreate).toHaveBeenCalledTimes(0);
      expect(spyOnAlarmClear).toHaveBeenCalledTimes(0);
    });

    it("triggers the pagemods identification process if 1. a worker was attached to the tab 2. A port is found in runtime memory 3. No content script application was able to acknowledge presence on the port", async () => {
      expect.assertions(5);
      // data mocked
      const worker = readWorker();
      const frameDetails = {
        url: "https://localhost",
        tabId: worker.tabId,
        frameId: 0,
      };
      const port = mockPort({ name: worker.id, tabId: worker.tabId, frameId: worker.frameId, url: frameDetails.url });
      const portWrapper = new Port(port);
      jest.spyOn(portWrapper, "request").mockImplementationOnce(() => Promise.reject());
      jest.spyOn(global, "setTimeout");
      jest.spyOn(global, "clearTimeout");
      // mock function
      mockWorker.mockImplementationOnce(() => worker);
      mockIsPortExist.mockImplementationOnce(() => true);
      mockGetPort.mockImplementationOnce(() => portWrapper);
      // process
      await TabService.exec(
        frameDetails.tabId,
        { status: "complete" },
        { id: frameDetails.tabId, url: frameDetails.url },
      );
      // expectations
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      expect(PortManager.getPortById).toHaveBeenCalledWith(worker.id);
      expect(WebNavigationService.exec).toHaveBeenCalledWith(frameDetails);
      // Called 1 times during the execution
      expect(global.setTimeout).toHaveBeenCalledTimes(1);
      expect(global.clearTimeout).toHaveBeenCalledTimes(1);
    });

    it("triggers the pagemods identification process if 1. a worker was attached to the tab 2. A port is found in runtime memory 3. No content script application was able to acknowledge presence on the port due to the timeout", async () => {
      expect.assertions(5);
      // data mocked
      const worker = readWorker();
      const frameDetails = {
        url: "https://localhost",
        tabId: worker.tabId,
        frameId: 0,
      };
      const port = mockPort({ name: worker.id, tabId: worker.tabId, frameId: worker.frameId, url: frameDetails.url });
      const portWrapper = new Port(port);
      jest.spyOn(portWrapper, "request").mockImplementation(() => new Promise(() => null));
      jest.spyOn(global, "setTimeout");
      jest.spyOn(global, "clearTimeout");
      jest.spyOn(BrowserTabService, "getById").mockImplementationOnce(() => ({
        url: frameDetails.url,
      }));
      // mock function
      mockWorker.mockImplementationOnce(() => worker);
      mockIsPortExist.mockImplementation(() => true);
      mockGetPort.mockImplementationOnce(() => portWrapper);
      // process
      const promise = TabService.exec(
        frameDetails.tabId,
        { status: "complete" },
        { id: frameDetails.tabId, url: frameDetails.url },
      );
      // Await pending promise for timeout
      await Promise.resolve();
      // start the timeout promise
      jest.runOnlyPendingTimers();
      // Await pending promise for timeout
      await Promise.resolve();
      await Promise.resolve();
      jest.runOnlyPendingTimers();
      await promise;
      // expectations
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      expect(PortManager.getPortById).toHaveBeenCalledWith(worker.id);
      expect(WebNavigationService.exec).toHaveBeenCalledWith(frameDetails);
      // Called 2 times during the execution
      expect(global.setTimeout).toHaveBeenCalledTimes(2);
      // Called 0 times during the execution
      expect(global.clearTimeout).toHaveBeenCalledTimes(0);
    });

    it("do not triggers the pagemods identification process if 1. a worker was attached to the tab 2. A port is found in runtime memory 3. No content script application was able to acknowledge presence on the port due to the timeout but the url has changed", async () => {
      expect.assertions(5);
      // data mocked
      const worker = readWorker();
      const frameDetails = {
        url: "https://localhost",
        tabId: worker.tabId,
        frameId: 0,
      };
      const port = mockPort({ name: worker.id, tabId: worker.tabId, frameId: worker.frameId, url: frameDetails.url });
      const portWrapper = new Port(port);
      jest.spyOn(portWrapper, "request").mockImplementation(() => new Promise(() => null));
      jest.spyOn(global, "setTimeout");
      jest.spyOn(global, "clearTimeout");
      jest.spyOn(BrowserTabService, "getById").mockImplementationOnce(() => ({
        url: "https://localhost/new",
      }));
      // mock function
      mockWorker.mockImplementationOnce(() => worker);
      mockIsPortExist.mockImplementation(() => true);
      mockGetPort.mockImplementationOnce(() => portWrapper);
      // process
      const promise = TabService.exec(
        frameDetails.tabId,
        { status: "complete" },
        { id: frameDetails.tabId, url: frameDetails.url },
      );
      // Await pending promise for timeout
      await Promise.resolve();
      // start the timeout promise
      jest.runOnlyPendingTimers();
      await promise;
      // expectations
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenNthCalledWith(1, frameDetails.tabId);
      expect(PortManager.getPortById).toHaveBeenNthCalledWith(1, worker.id);
      expect(WebNavigationService.exec).toHaveBeenCalledTimes(0);
      // Called 1 times during the execution
      expect(global.setTimeout).toHaveBeenCalledTimes(1);
      // Called 0 times during the execution
      expect(global.clearTimeout).toHaveBeenCalledTimes(0);
    });

    it("do not triggers the pagemods identification process if 1. a worker was attached to the tab 2. A port is found in runtime memory 3. No content script application was able to acknowledge presence on the port due to the timeout but the port does not exist anymore", async () => {
      expect.assertions(5);
      // data mocked
      const worker = readWorker();
      const frameDetails = {
        url: "https://localhost",
        tabId: worker.tabId,
        frameId: 0,
      };
      const port = mockPort({ name: worker.id, tabId: worker.tabId, frameId: worker.frameId, url: frameDetails.url });
      const portWrapper = new Port(port);
      jest.spyOn(portWrapper, "request").mockImplementation(() => new Promise(() => null));
      jest.spyOn(global, "setTimeout");
      jest.spyOn(global, "clearTimeout");
      jest.spyOn(BrowserTabService, "getById").mockImplementationOnce(() => ({
        url: frameDetails.url,
      }));
      // mock function
      mockWorker.mockImplementationOnce(() => worker);
      mockIsPortExist.mockImplementationOnce(() => true);
      mockGetPort.mockImplementationOnce(() => portWrapper);
      // process
      const promise = TabService.exec(
        frameDetails.tabId,
        { status: "complete" },
        { id: frameDetails.tabId, url: frameDetails.url },
      );
      // Await pending promise for timeout
      await Promise.resolve();
      mockIsPortExist.mockImplementationOnce(() => false);
      // start the timeout promise
      jest.runOnlyPendingTimers();
      await promise;
      // expectations
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenNthCalledWith(1, frameDetails.tabId);
      expect(PortManager.getPortById).toHaveBeenNthCalledWith(1, worker.id);
      expect(WebNavigationService.exec).toHaveBeenCalledTimes(0);
      // Called 1 times during the execution
      expect(global.setTimeout).toHaveBeenCalledTimes(1);
      // Called 0 times during the execution
      expect(global.clearTimeout).toHaveBeenCalledTimes(0);
    });

    it("triggers the pagemods identification process if 1. a worker was attached to the tab 2. No port is found in runtime memory 3. No content script application was not able to reconnect its port.", async () => {
      expect.assertions(3);
      // data mocked
      const worker = readWorker();
      const frameDetails = {
        url: "https://passbolt.dev",
        tabId: worker.tabId,
        frameId: worker.frameId,
      };
      // mock function
      mockWorker.mockImplementationOnce(() => worker);
      mockIsPortExist.mockImplementationOnce(() => false);
      mockBrowserTabServiceSendMessage.mockImplementationOnce(() => {
        throw new Error("BrowserTabService.sendMessage was not able to reach the content script application");
      });

      // process
      await TabService.exec(
        frameDetails.tabId,
        { status: "complete" },
        { id: frameDetails.tabId, url: "https://passbolt.dev" },
      );

      // expectations
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      expect(BrowserTabService.sendMessage).not.toHaveBeenCalled();
      expect(WebNavigationService.exec).toHaveBeenCalledWith(frameDetails);
    });

    it("debounces the trigger of the pagemods identification process 1. a worker was attached to the tab 2. the worker is waiting for the content script application to connect its port", async () => {
      expect.assertions(5);
      // data mocked
      const worker = readWorker({ status: workerEntity.STATUS_WAITING_CONNECTION });
      const frameDetails = {
        url: "https://url.com",
        tabId: worker.tabId,
        frameId: 0,
      };
      jest.spyOn(WorkersSessionStorage, "getWorkerById").mockImplementationOnce(() => worker);
      jest.spyOn(global, "setTimeout");
      jest.spyOn(global, "clearTimeout");

      // mock function
      mockWorker.mockImplementationOnce(() => worker);
      mockBrowserTabServiceGetById.mockImplementationOnce(() => ({ url: frameDetails.url }));

      // process
      await TabService.exec(
        frameDetails.tabId,
        { status: "complete" },
        { id: frameDetails.tabId, url: frameDetails.url },
      );
      // start the timeout promise
      jest.runAllTimers();

      // Called 1 times after the timeout
      expect(global.setTimeout).toHaveBeenCalledTimes(1);
      expect(global.clearTimeout).toHaveBeenCalledTimes(1);

      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      expect(WorkerService.execNavigationForWorkerWaitingConnection).toHaveBeenCalledWith(worker.id);

      // The double promise resolve seems to make possible the following assert of a service called by the timeout
      await Promise.resolve();
      await Promise.resolve();
      expect(WebNavigationService.exec).toHaveBeenCalledWith(frameDetails);
    });

    it("debounces the trigger of the pagemods identification process 1. a worker was attached to the tab 2. the worker is waiting for the content script application to reconnect its port ", async () => {
      expect.assertions(5);
      // data mocked
      const worker = readWorker({ status: workerEntity.STATUS_RECONNECTING });
      const frameDetails = {
        url: "https://url.com",
        tabId: worker.tabId,
        frameId: 0,
      };
      jest.spyOn(WorkersSessionStorage, "getWorkerById").mockImplementationOnce(() => worker);
      jest.spyOn(global, "setTimeout");
      jest.spyOn(global, "clearTimeout");

      // mock function
      mockWorker.mockImplementationOnce(() => worker);
      mockBrowserTabServiceGetById.mockImplementationOnce(() => ({ url: frameDetails.url }));

      // process
      await TabService.exec(
        frameDetails.tabId,
        { status: "complete" },
        { id: frameDetails.tabId, url: frameDetails.url },
      );
      // start the timeout promise
      jest.runAllTimers();

      // Called 1 times after the timeout
      expect(global.setTimeout).toHaveBeenCalledTimes(1);
      expect(global.clearTimeout).toHaveBeenCalledTimes(1);

      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      expect(WorkerService.execNavigationForWorkerWaitingConnection).toHaveBeenCalledWith(worker.id);

      // The double promise resolve seems to make possible the following assert of a service called by the timeout
      await Promise.resolve();
      await Promise.resolve();
      expect(WebNavigationService.exec).toHaveBeenCalledWith(frameDetails);
    });
  });

  describe("TabService::execNavigationCompletion", () => {
    it("exits if frameId is not 0 (iframe security guard)", async () => {
      expect.assertions(3);
      // process
      await TabService.execNavigationCompletion({ tabId: 1, frameId: 1, url: "https://passbolt.dev" });
      // expectations
      expect(PortManager.getPortById).not.toHaveBeenCalled();
      expect(WorkersSessionStorage.getWorkerOnMainFrame).not.toHaveBeenCalled();
      expect(WebNavigationService.exec).not.toHaveBeenCalled();
    });

    it("exits if frameId is a nested iframe (iframe security guard)", async () => {
      expect.assertions(3);
      // process
      await TabService.execNavigationCompletion({ tabId: 1, frameId: 42, url: "https://evil.com" });
      // expectations
      expect(PortManager.getPortById).not.toHaveBeenCalled();
      expect(WorkersSessionStorage.getWorkerOnMainFrame).not.toHaveBeenCalled();
      expect(WebNavigationService.exec).not.toHaveBeenCalled();
    });

    it("triggers the pagemods identification process for top-frame navigation", async () => {
      expect.assertions(3);
      // data mocked
      const frameDetails = {
        url: "https://localhost",
        tabId: 1234,
        frameId: 0,
      };
      // mock function
      mockWorker.mockImplementationOnce(() => null);
      // process
      await TabService.execNavigationCompletion(frameDetails);
      // expectations
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      expect(PortManager.getPortById).not.toHaveBeenCalled();
      expect(WebNavigationService.exec).toHaveBeenCalledWith(frameDetails);
    });

    it("delegates to handleNavigation for top-frame navigation and triggers worker lookup", async () => {
      expect.assertions(3);
      // data mocked
      const frameDetails = {
        url: "https://localhost",
        tabId: 1234,
        frameId: 0,
      };
      // mock function — no worker on tab, so handleNavigation will trigger pagemod identification
      mockWorker.mockImplementationOnce(() => null);
      // process
      await TabService.execNavigationCompletion(frameDetails);
      // expectations — verifies handleNavigation was called (worker lookup) and completed (WebNavigationService.exec)
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      expect(WebNavigationService.exec).toHaveBeenCalledWith(frameDetails);
      expect(PortManager.getPortById).not.toHaveBeenCalled();
    });
  });
});
