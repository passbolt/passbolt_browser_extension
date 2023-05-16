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
import {readWorker} from "../../model/entity/worker/workerEntity.test.data";
import {mockPort} from "../../sdk/port/portManager.test.data";
import Port from "../../sdk/port";
import PortManager from "../../sdk/port/portManager";
import WebNavigationService from "../webNavigation/webNavigationService";
import TabService from "./tabService";

const mockGetPort = jest.spyOn(PortManager, "getPortById");
const mockIsPortExist = jest.spyOn(PortManager, "isPortExist");
const mockWorker = jest.spyOn(WorkersSessionStorage, "getWorkerOnMainFrame");
jest.spyOn(WebNavigationService, "exec");

describe("TabService", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("TabService::exec", () => {
    it("Should do nothing if status is not completed", async() => {
      expect.assertions(3);
      // process
      await TabService.exec(1, {status: "loading"}, null);
      // expectations
      expect(PortManager.getPortById).not.toHaveBeenCalled();
      expect(WorkersSessionStorage.getWorkerOnMainFrame).not.toHaveBeenCalled();
      expect(WebNavigationService.exec).not.toHaveBeenCalled();
    });

    it("Should do nothing if tab object has no url", async() => {
      expect.assertions(3);
      // process
      await TabService.exec(1, {status: "complete"}, {});
      // expectations
      expect(PortManager.getPortById).not.toHaveBeenCalled();
      expect(WorkersSessionStorage.getWorkerOnMainFrame).not.toHaveBeenCalled();
      expect(WebNavigationService.exec).not.toHaveBeenCalled();
    });

    it("Should do nothing if tab object has url about:blank", async() => {
      expect.assertions(3);
      // process
      await TabService.exec(1, {status: "complete"}, {url: "about:blank"});
      // expectations
      expect(PortManager.getPortById).not.toHaveBeenCalled();
      expect(WorkersSessionStorage.getWorkerOnMainFrame).not.toHaveBeenCalled();
      expect(WebNavigationService.exec).not.toHaveBeenCalled();
    });

    it("Should do nothing if worker on main frame and port is still connected", async() => {
      expect.assertions(4);
      // data mocked
      const worker = readWorker();
      const frameDetails = {
        url: "https://passbolt.dev",
        tabId: worker.tabId,
        frameId: worker.frameId
      };
      const port = mockPort({name: worker.id, tabId: worker.tabId, frameId: worker.frameId, url: frameDetails.url});
      const portWrapper = new Port(port);
      jest.spyOn(portWrapper, "emit");
      // mock function
      mockWorker.mockImplementationOnce(() => worker);
      mockIsPortExist.mockImplementationOnce(() => true);
      mockGetPort.mockImplementationOnce(() => portWrapper);
      // process
      await TabService.exec(frameDetails.tabId, {status: "complete"}, {url: "https://passbolt.dev"});
      // expectations
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      expect(PortManager.getPortById).toHaveBeenCalledWith(worker.id);
      expect(portWrapper.emit).toHaveBeenCalledWith('passbolt.port.check');
      expect(WebNavigationService.exec).not.toHaveBeenCalled();
    });

    it("Should exec if no worker on main frame", async() => {
      expect.assertions(3);
      // data mocked
      const frameDetails = {
        url: "https://localhost",
        tabId: 1234,
        frameId: 0
      };
      // mock function
      mockWorker.mockImplementationOnce(() => null);
      // process
      await TabService.exec(frameDetails.tabId, {status: "complete"}, {id: frameDetails.tabId, url: frameDetails.url});
      // expectations
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      expect(PortManager.getPortById).not.toHaveBeenCalled();
      expect(WebNavigationService.exec).toHaveBeenCalledWith(frameDetails);
    });

    it("Should exec if worker on main frame but not the same origin url", async() => {
      expect.assertions(3);
      // data mocked
      const worker = readWorker();
      const frameDetails = {
        url: "https://localhost",
        tabId: worker.tabId,
        frameId: 0
      };
      const port = mockPort({name: worker.id, tabId: worker.tabId, frameId: worker.frameId, url: "https://passbolt.dev"});
      // mock function
      mockWorker.mockImplementationOnce(() => worker);
      mockIsPortExist.mockImplementationOnce(() => true);
      mockGetPort.mockImplementationOnce(() => new Port(port));
      // process
      await TabService.exec(frameDetails.tabId, {status: "complete"}, {id: frameDetails.tabId, url: "https://localhost"});
      // expectations
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      expect(PortManager.getPortById).toHaveBeenCalledWith(worker.id);
      expect(WebNavigationService.exec).toHaveBeenCalledWith(frameDetails);
    });

    it("Should exec if worker on main frame and port is not connected", async() => {
      expect.assertions(3);
      // data mocked
      const worker = readWorker();
      const frameDetails = {
        url: "https://localhost",
        tabId: worker.tabId,
        frameId: 0
      };
      const port = mockPort({name: worker.id, tabId: worker.tabId, frameId: worker.frameId, url: frameDetails.url});
      const portWrapper = new Port(port);
      jest.spyOn(portWrapper, "emit").mockImplementationOnce(() => { throw new Error(); });
      // mock function
      mockWorker.mockImplementationOnce(() => worker);
      mockIsPortExist.mockImplementationOnce(() => true);
      mockGetPort.mockImplementationOnce(() => portWrapper);
      // process
      await TabService.exec(frameDetails.tabId, {status: "complete"}, {id: frameDetails.tabId, url: frameDetails.url});
      // expectations
      expect(WorkersSessionStorage.getWorkerOnMainFrame).toHaveBeenCalledWith(frameDetails.tabId);
      expect(PortManager.getPortById).toHaveBeenCalledWith(worker.id);
      expect(WebNavigationService.exec).toHaveBeenCalledWith(frameDetails);
    });
  });
});
