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
import {Worker} from "../../model/worker";
import PortManager from "../../../../chrome-mv3/sdk/portManager";
import WorkerService from "./workerService";
import BrowserTabService from "../ui/browserTab.service";
import WorkersSessionStorage from "../../../../chrome-mv3/service/sessionStorage/workersSessionStorage";
import {readWorker} from "../../model/entity/worker/workerEntity.test.data";

describe("WorkerService", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("WorkerService::get", () => {
    it("Should get worker from manifest v2", async() => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(chrome.runtime, 'getManifest').mockImplementationOnce(() => ({manifest_version: 2}));
      jest.spyOn(Worker, "get").mockImplementation(jest.fn());
      // process
      await WorkerService.get("ApplicationName", 1);
      // expectations
      expect(Worker.get).toHaveBeenCalledWith("ApplicationName", 1);
    });

    it("Should get worker from manifest v3", async() => {
      expect.assertions(3);
      // data mocked
      const worker = readWorker();
      const port = {
        _name: worker.id,
        _port: {
          sender: {
            tab: {}
          }
        }
      };
      // mock functions
      jest.spyOn(chrome.runtime, 'getManifest').mockImplementationOnce(() => ({manifest_version: 3}));
      jest.spyOn(WorkersSessionStorage, 'getWorkersByNameAndTabId').mockImplementationOnce(() => [worker]);
      jest.spyOn(BrowserTabService, "sendMessage").mockImplementation(() => jest.fn());
      jest.spyOn(PortManager, "getPortById").mockImplementation(() => port);
      // process
      const workerResult = await WorkerService.get("ApplicationName", 1);
      // expectations
      expect(BrowserTabService.sendMessage).toHaveBeenCalledWith(worker, "passbolt.port.connect", worker.id);
      expect(PortManager.getPortById).toHaveBeenCalledWith(worker.id);
      expect(workerResult).toStrictEqual({port: port, tab: port._port.sender.tab});
    });

    it("Should get no worker from manifest v3", async() => {
      expect.assertions(3);
      // mock functions
      jest.spyOn(chrome.runtime, 'getManifest').mockImplementationOnce(() => ({manifest_version: 3}));
      jest.spyOn(WorkersSessionStorage, 'getWorkersByNameAndTabId').mockImplementationOnce(() => []);
      jest.spyOn(BrowserTabService, "sendMessage");
      jest.spyOn(PortManager, "getPortById");
      // process
      try {
        await WorkerService.get("ApplicationName", 1);
      } catch (error) {
        // expectations
        expect(BrowserTabService.sendMessage).not.toHaveBeenCalled();
        expect(PortManager.getPortById).not.toHaveBeenCalled();
        expect(error).toStrictEqual(new Error("Could not find worker ApplicationName for tab 1."));
      }
    });
  });
});
