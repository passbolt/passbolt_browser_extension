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
 * @since         3.7.0
 */

import WorkersSessionStorage from "../../service/sessionStorage/workersSessionStorage";
import RemovePortController from "./removePortController";
import {readWorker} from "../../model/entity/worker/workerEntity.test.data";
import PortManager from "../../sdk/port/portManager";
import Port from "../../sdk/port";
import WorkerEntity from "../../model/entity/worker/workerEntity";

jest.spyOn(WorkersSessionStorage, "getWorkersByNameAndTabId");
jest.spyOn(WorkersSessionStorage, "deleteById");
jest.spyOn(PortManager, "removePort");

beforeEach(async() => {
  jest.resetModules();
  jest.clearAllMocks();
  await PortManager.flush();
});

describe("RemovePortController", () => {
  describe("RemovePortController::isAllowedToRemovePort", () => {
    it("Should allowed to remove port", async() => {
      expect.assertions(6);
      // data mocked
      const worker = readWorker({name: "WebIntegration"});
      // process
      const controller = new RemovePortController(worker);
      // expectations
      expect(controller.isAllowedToRemovePort(worker.name, "Recover")).toBeFalsy();
      expect(controller.isAllowedToRemovePort(worker.name, "Setup")).toBeFalsy();
      expect(controller.isAllowedToRemovePort(worker.name, "App")).toBeFalsy();
      expect(controller.isAllowedToRemovePort(worker.name, "Unknown")).toBeFalsy();
      expect(controller.isAllowedToRemovePort(worker.name, "InFormCallToAction")).toBeTruthy();
      expect(controller.isAllowedToRemovePort(worker.name, "InFormMenu")).toBeTruthy();
    });

    it("Should not allowed to remove port for unknown application", async() => {
      expect.assertions(2);
      // data mocked
      const worker = readWorker({name: "Unknown"});
      // process
      const controller = new RemovePortController(worker);
      // expectations
      expect(controller.isAllowedToRemovePort(worker.name, "InFormCallToAction")).toBeFalsy();
      expect(controller.isAllowedToRemovePort(worker.name, "Unknown")).toBeFalsy();
    });
  });

  describe("RemovePortController::exec", () => {
    it("Should remove worker and port for InformMenu", async() => {
      expect.assertions(3);
      // data mocked
      const workerWebIntegration = readWorker({name: "WebIntegration"});
      const workerInformMenu = readWorker({name: "InFormMenu", tabId: workerWebIntegration.tabId, frameId: 1234});
      // process
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerWebIntegration));
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerInformMenu));
      const controller = new RemovePortController({name: workerWebIntegration.name, tab: {id: workerWebIntegration.tabId}});
      await controller.exec("InFormMenu");
      // expectations
      expect(WorkersSessionStorage.getWorkersByNameAndTabId).toHaveBeenCalledWith(workerInformMenu.name, workerWebIntegration.tabId);
      expect(PortManager.removePort).toHaveBeenCalledWith(workerInformMenu.id, {"reason": "disconnected"});
      expect(WorkersSessionStorage.deleteById).toHaveBeenCalledWith(workerInformMenu.id);
    });

    it("Should remove worker and port for InformCallToAction", async() => {
      expect.assertions(5);
      // data mocked
      const workerWebIntegration = readWorker({name: "WebIntegration"});
      const workerInformCallToAction = readWorker({name: "InFormCallToAction", tabId: workerWebIntegration.tabId, frameId: 1234});
      const workerInformCallToActionToRemoved = readWorker({name: "InFormCallToAction", tabId: workerWebIntegration.tabId, frameId: 12345});
      const workerInformCallToActionNotExist = readWorker({name: "InFormCallToAction", tabId: workerWebIntegration.tabId, frameId: 123456});
      const port = {
        name: workerInformCallToAction.id,
        onMessage: {
          addListener: () => jest.fn()
        },
        postMessage: () => jest.fn()
      };
      const portDisconnected = {
        name: workerInformCallToActionToRemoved.id,
        onMessage: {
          addListener: () => jest.fn()
        },
        postMessage: () => { throw new Error('Disconnected'); }
      };
      const portInformCallToAction = new Port(port);
      const portInformCallToActionToRemoved = new Port(portDisconnected);
      // process
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerWebIntegration));
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerInformCallToAction));
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerInformCallToActionToRemoved));
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerInformCallToActionNotExist));
      PortManager.registerPort(portInformCallToAction);
      PortManager.registerPort(portInformCallToActionToRemoved);
      const controller = new RemovePortController({name: workerWebIntegration.name, tab: {id: workerWebIntegration.tabId}});
      await controller.exec("InFormCallToAction");
      // expectations
      expect(WorkersSessionStorage.getWorkersByNameAndTabId).toHaveBeenCalledWith(workerInformCallToActionToRemoved.name, workerWebIntegration.tabId);
      expect(PortManager.removePort).toHaveBeenCalledWith(workerInformCallToActionToRemoved.id, {"reason": "disconnected"});
      expect(WorkersSessionStorage.deleteById).toHaveBeenCalledWith(workerInformCallToActionToRemoved.id);
      expect(WorkersSessionStorage.deleteById).toHaveBeenCalledWith(workerInformCallToActionNotExist.id);
      expect((await WorkersSessionStorage.getWorkers()).length).toStrictEqual(2);
    });

    it("Should not remove worker and port for application not allowed", async() => {
      expect.assertions(1);
      // data mocked
      const worker = {
        tab: {
          id: 1
        },
        name: "WebIntegration"
      };
      // process
      const controller = new RemovePortController(worker);
      try {
        await controller.exec("QuickAccess");
      } catch (error) {
        // expectations
        expect(error.message).toStrictEqual("The application is not allowed to close the application QuickAccess");
      }
    });

    it("Should not remove worker and port for an application name that is not a string", async() => {
      expect.assertions(1);
      // data mocked
      const worker = {
        tab: {
          id: 1
        },
        name: "WebIntegration"
      };
      // process
      const controller = new RemovePortController(worker);
      try {
        await controller.exec({name: "QuickAccess"});
      } catch (error) {
        // expectations
        expect(error.message).toStrictEqual("The application name should be a string");
      }
    });
  });
});
