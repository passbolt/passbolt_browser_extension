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
import WorkersSessionStorage from "../../service/sessionStorage/workersSessionStorage";
import PortManager from "./portManager";
import { mockPort } from "./portManager.test.data";
import PagemodManager from "../../pagemod/pagemodManager";
import { readWorker } from "../../model/entity/worker/workerEntity.test.data";
import WorkerEntity from "../../model/entity/worker/workerEntity";
import GetLegacyAccountService from "../../service/account/getLegacyAccountService";

const spyGetWorkerById = jest.spyOn(WorkersSessionStorage, "getWorkerById");
const spyGetWorkersByTabId = jest.spyOn(WorkersSessionStorage, "getWorkersByTabId");

describe("PortManager", () => {
  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    await PortManager.flush();
  });

  describe("PortManager::onPortConnect", () => {
    it("Should connect new port if it is in the workersSessionStorage", async () => {
      expect.assertions(4);
      // data mocked
      const workerDto = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerDto));
      const port = mockPort({ name: workerDto.id, tabId: workerDto.tabId, frameId: workerDto.frameId });
      // mock functions
      jest.spyOn(PagemodManager, "attachEventToPort");
      // process
      await PortManager.onPortConnect(port);
      // expectations
      expect(PortManager._ports[workerDto.id]).toBeDefined();
      expect(PortManager._ports[workerDto.id]._port).toBe(port);
      expect(PagemodManager.attachEventToPort).toHaveBeenCalledWith(PortManager._ports[workerDto.id], workerDto.name);
      expect(port.postMessage).toHaveBeenCalledWith(JSON.stringify(["passbolt.port.ready"]));
    });

    it("Should connect new port if it is the quick access", async () => {
      expect.assertions(5);
      // data mocked
      const popupUrl = "chrome-extension://extensionId/webAccessibleResources/quickaccess.html?passbolt=quickaccess";
      const port = mockPort({ name: "quickaccess", url: popupUrl });
      delete port.sender.tab;
      // mock functions
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(jest.fn());
      jest.spyOn(browser.runtime, "getURL").mockImplementationOnce(() => popupUrl);
      jest.spyOn(PagemodManager, "attachEventToPort");
      // process
      await PortManager.onPortConnect(port);
      // expectations
      expect(browser.runtime.getURL).toHaveBeenCalled();
      expect(PortManager._ports[port.name]).toBeDefined();
      expect(PortManager._ports[port.name]._port).toBe(port);
      expect(PagemodManager.attachEventToPort).toHaveBeenCalledWith(PortManager._ports[port.name], "QuickAccess");
      expect(port.postMessage).toHaveBeenCalledWith(JSON.stringify(["passbolt.port.ready"]));
    });

    it("Should not connect new port if it is not in the workersSessionStorage", async () => {
      expect.assertions(3);
      // data mocked
      const workerDto = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerDto));
      const port = mockPort({ name: workerDto.id, tabId: 2, frameId: workerDto.frameId });
      // mock functions
      jest.spyOn(PagemodManager, "attachEventToPort");
      // process
      await PortManager.onPortConnect(port);
      // expectations
      expect(PortManager._ports[workerDto.id]).toBeUndefined();
      expect(PagemodManager.attachEventToPort).not.toHaveBeenCalled();
      expect(port.postMessage).not.toHaveBeenCalled();
    });

    it("Should not connect new port if it is not the quick access url", async () => {
      expect.assertions(4);
      // data mocked
      const port = mockPort({
        name: "test",
        url: "chrome-extension://extensionId/webAccessibleResources/quickaccess.html?passbolt=test",
      });
      delete port.sender.tab;
      // mock functions
      jest
        .spyOn(browser.runtime, "getURL")
        .mockImplementationOnce(
          () => "chrome-extension://extensionId/webAccessibleResources/quickaccess.html?passbolt=quickaccess",
        );
      jest.spyOn(PagemodManager, "attachEventToPort");
      // process
      try {
        await PortManager.onPortConnect(port);
      } catch (error) {
        // expectations
        expect(error.message).toStrictEqual("The worker id should be a valid uuid.");
        expect(browser.runtime.getURL).toHaveBeenCalled();
        expect(PortManager._ports[port.name]).not.toBeDefined();
        expect(PagemodManager.attachEventToPort).not.toHaveBeenCalled();
      }
    });
  });

  describe("PortManager::port lifecycle", () => {
    /**
     * Trigger the disconnection listeners registered on a runtime port.
     * @param {object} runtimePort The mocked runtime port
     */
    const triggerDisconnect = (runtimePort) =>
      runtimePort.onDisconnect.addListener.mock.calls.forEach(([listener]) => listener());

    it("should disconnect a port denied because its sender is not the expected one", async () => {
      expect.assertions(2);
      const workerDto = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerDto));
      const port = mockPort({ name: workerDto.id, tabId: 2, frameId: workerDto.frameId });

      await PortManager.onPortConnect(port);

      expect(port.disconnect).toHaveBeenCalled();
      expect(port.postMessage).not.toHaveBeenCalled();
    });

    it("should disconnect an unknown port", async () => {
      expect.assertions(2);
      const workerDto = readWorker();
      const port = mockPort({ name: workerDto.id, tabId: workerDto.tabId, frameId: workerDto.frameId });

      await PortManager.onPortConnect(port);

      expect(port.disconnect).toHaveBeenCalled();
      expect(PortManager._ports[workerDto.id]).toBeUndefined();
    });

    it("should disconnect a port reusing the name of a port still connected", async () => {
      expect.assertions(3);
      const workerDto = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerDto));
      const firstPort = mockPort({ name: workerDto.id, tabId: workerDto.tabId, frameId: workerDto.frameId });
      const secondPort = mockPort({ name: workerDto.id, tabId: workerDto.tabId, frameId: workerDto.frameId });
      jest.spyOn(PagemodManager, "attachEventToPort").mockImplementation(jest.fn());

      await PortManager.onPortConnect(firstPort);
      await PortManager.onPortConnect(secondPort);

      expect(PortManager._ports[workerDto.id]._port).toBe(firstPort);
      expect(secondPort.disconnect).toHaveBeenCalled();
      expect(firstPort.disconnect).not.toHaveBeenCalled();
    });

    it("should forget a disconnected port so the application can reconnect with the same name", async () => {
      expect.assertions(3);
      const workerDto = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerDto));
      const firstPort = mockPort({ name: workerDto.id, tabId: workerDto.tabId, frameId: workerDto.frameId });
      jest.spyOn(PagemodManager, "attachEventToPort").mockImplementation(jest.fn());
      await PortManager.onPortConnect(firstPort);

      // The page was frozen, closed or navigated away.
      triggerDisconnect(firstPort);
      expect(PortManager._ports[workerDto.id]).toBeUndefined();

      const secondPort = mockPort({ name: workerDto.id, tabId: workerDto.tabId, frameId: workerDto.frameId });
      await PortManager.onPortConnect(secondPort);

      expect(PortManager._ports[workerDto.id]._port).toBe(secondPort);
      expect(secondPort.postMessage).toHaveBeenCalledWith(JSON.stringify(["passbolt.port.ready"]));
    });

    it("should not emit ready on a port disconnected while its events were attached", async () => {
      expect.assertions(2);
      const workerDto = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerDto));
      const port = mockPort({ name: workerDto.id, tabId: workerDto.tabId, frameId: workerDto.frameId });
      // The application gives up waiting while the events are being attached.
      jest.spyOn(PagemodManager, "attachEventToPort").mockImplementation(async () => triggerDisconnect(port));

      await PortManager.onPortConnect(port);

      expect(PortManager._ports[workerDto.id]).toBeUndefined();
      expect(port.postMessage).not.toHaveBeenCalled();
    });

    it("should not forget a newer port when a previous port with the same name is disconnected late", async () => {
      expect.assertions(1);
      const workerDto = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerDto));
      const firstPort = mockPort({ name: workerDto.id, tabId: workerDto.tabId, frameId: workerDto.frameId });
      const secondPort = mockPort({ name: workerDto.id, tabId: workerDto.tabId, frameId: workerDto.frameId });
      jest.spyOn(PagemodManager, "attachEventToPort").mockImplementation(jest.fn());
      await PortManager.onPortConnect(firstPort);
      // The first port is replaced, i.e. the service worker restarted and its memory was flushed.
      PortManager._ports = {};
      await PortManager.onPortConnect(secondPort);

      triggerDisconnect(firstPort);

      expect(PortManager._ports[workerDto.id]._port).toBe(secondPort);
    });
  });

  describe("PortManager::onTabRemoved", () => {
    it("Should remove the workers and runtime memory ports for a specific tab id", async () => {
      expect.assertions(6);
      // data mocked
      const workerDto1 = readWorker();
      const workerDto2 = readWorker({ frameId: null });
      const workerDto3 = readWorker({ tabId: 5 });
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerDto1));
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerDto2));
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerDto3));
      const port = mockPort({ name: workerDto1.id, tabId: workerDto1.tabId, frameId: workerDto1.frameId });
      const port2 = mockPort({ name: workerDto2.id, tabId: workerDto2.tabId, frameId: 3 });
      const port3 = mockPort({ name: workerDto3.id, tabId: workerDto3.tabId, frameId: workerDto3.frameId });
      // mock functions
      jest.spyOn(PagemodManager, "attachEventToPort");
      jest.spyOn(WorkersSessionStorage, "deleteByTabId");
      jest.spyOn(WorkersSessionStorage, "updateWorker");
      spyGetWorkerById.mockImplementationOnce(() => workerDto1);
      spyGetWorkerById.mockImplementationOnce(() => workerDto2);
      spyGetWorkerById.mockImplementationOnce(() => workerDto3);
      spyGetWorkersByTabId.mockImplementation(() => [workerDto1, workerDto2]);
      // process
      await PortManager.onPortConnect(port);
      await PortManager.onPortConnect(port2);
      await PortManager.onPortConnect(port3);
      await PortManager.onTabRemoved(1);
      // expectations
      expect(PortManager._ports[workerDto1.id]).toBeUndefined();
      expect(PortManager._ports[workerDto2.id]).toBeUndefined();
      expect(PortManager._ports[workerDto3.id]).toBeDefined();
      // data updated
      workerDto2.frameId = 3;
      expect(WorkersSessionStorage.updateWorker).toHaveBeenCalledWith(new WorkerEntity(workerDto2));
      expect(PagemodManager.attachEventToPort).not.toHaveBeenCalledWith(3);
      expect(WorkersSessionStorage.deleteByTabId).toHaveBeenCalledWith(1);
    });

    it("Should fail if the tabId is not provided", async () => {
      expect.assertions(1);
      // process
      const promise = PortManager.onTabRemoved();
      // expectations
      await expect(promise).rejects.toThrow();
    });

    it("Should fail if the tabId is not a valid integer", async () => {
      expect.assertions(1);
      // process
      const promise = PortManager.onTabRemoved("not-valid-integer");
      // expectations
      await expect(promise).rejects.toThrow();
    });
  });
});
