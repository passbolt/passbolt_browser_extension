/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.7.0
 */


import PostLogoutService from "./postLogoutService";
import WorkersSessionStorage from "../sessionStorage/workersSessionStorage";
import {readWorker} from "../../model/entity/worker/workerEntity.test.data";
import WorkerEntity from "../../model/entity/worker/workerEntity";
import AppPagemod from "../../pagemod/appPagemod";
import WebIntegrationPagemod from "../../pagemod/webIntegrationPagemod";
import BrowserTabService from "../ui/browserTab.service";
import PortManager from "../../sdk/port/portManager";
import {mockPort} from "../../sdk/port/portManager.test.data";
import Port from "../../sdk/port";
import LocalStorageService from "../localStorage/localStorageService";

describe("PostLogoutService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PostLogoutService:exec", () => {
    it("Should send message to awake port and send post logout event", async() => {
      expect.assertions(8);
      // data mocked
      const worker = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker));
      const worker2 = readWorker({name: AppPagemod.appName});
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker2));
      const worker3 = readWorker({name: WebIntegrationPagemod.appName});
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker3));
      const appPort = mockPort({name: worker2.id, tabId: worker2.tabId, frameId: worker2.frameId});
      const appPortWrapper = new Port(appPort);
      const webIntegrationPort = mockPort({name: worker3.id, tabId: worker3.tabId, frameId: worker3.frameId});
      const webIntegrationPortWrapper2 = new Port(webIntegrationPort);
      // function mocked
      jest.spyOn(BrowserTabService, "sendMessage").mockImplementation(jest.fn());
      jest.spyOn(PortManager, "getPortById").mockImplementationOnce(() => appPortWrapper);
      jest.spyOn(PortManager, "getPortById").mockImplementationOnce(() => webIntegrationPortWrapper2);
      jest.spyOn(appPortWrapper, "emit");
      jest.spyOn(webIntegrationPortWrapper2, "emit");
      jest.spyOn(LocalStorageService, "flush");
      // execution
      await PostLogoutService.exec();
      // Waiting all promises are resolved
      await Promise.resolve();
      // expectations
      expect(BrowserTabService.sendMessage).toHaveBeenCalledTimes(2);
      expect(BrowserTabService.sendMessage).toHaveBeenCalledWith(worker2, "passbolt.port.connect", worker2.id);
      expect(BrowserTabService.sendMessage).toHaveBeenCalledWith(worker3, "passbolt.port.connect", worker3.id);
      expect(appPortWrapper.emit).toHaveBeenCalledWith('passbolt.auth.after-logout');
      expect(appPortWrapper.emit).toHaveBeenCalledTimes(1);
      expect(webIntegrationPortWrapper2.emit).toHaveBeenCalledWith('passbolt.auth.after-logout');
      expect(webIntegrationPortWrapper2.emit).toHaveBeenCalledTimes(1);
      expect(LocalStorageService.flush).toHaveBeenCalled();
    });

    it("Should not send messages if workers port are still connected", async() => {
      expect.assertions(3);
      // data mocked
      const worker = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker));
      const worker2 = readWorker({name: AppPagemod.appName});
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker2));
      const worker3 = readWorker({name: WebIntegrationPagemod.appName});
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker3));
      // function mocked
      jest.spyOn(BrowserTabService, "sendMessage");
      jest.spyOn(PortManager, "isPortExist").mockImplementation(() => true);
      jest.spyOn(LocalStorageService, "flush");
      // execution
      await PostLogoutService.exec();
      // Waiting all promises are resolved
      await Promise.resolve();
      // expectations
      expect(BrowserTabService.sendMessage).toHaveBeenCalledTimes(0);
      expect(PortManager.isPortExist).toHaveBeenCalledTimes(2);
      expect(LocalStorageService.flush).toHaveBeenCalled();
    });

    it("Should not send messages if no workers needs to receive post logout event", async() => {
      expect.assertions(3);
      // data mocked
      const worker = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker));
      const worker2 = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker2));
      const worker3 = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker3));
      // function mocked
      jest.spyOn(BrowserTabService, "sendMessage");
      jest.spyOn(PortManager, "isPortExist").mockImplementation(() => true);
      jest.spyOn(LocalStorageService, "flush");
      // execution
      await PostLogoutService.exec();
      // Waiting all promises are resolved
      await Promise.resolve();
      // expectations
      expect(BrowserTabService.sendMessage).toHaveBeenCalledTimes(0);
      expect(PortManager.isPortExist).toHaveBeenCalledTimes(0);
      expect(LocalStorageService.flush).toHaveBeenCalled();
    });
  });
});
