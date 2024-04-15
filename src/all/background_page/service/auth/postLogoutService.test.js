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
import BrowserTabService from "../ui/browserTab.service";
import PortManager from "../../sdk/port/portManager";
import {mockPort} from "../../sdk/port/portManager.test.data";
import Port from "../../sdk/port";
import LocalStorageService from "../localStorage/localStorageService";
import toolbarController from "../../controller/toolbarService";
import StartLoopAuthSessionCheckService from "./startLoopAuthSessionCheckService";
import resourceInProgressCacheService from "../cache/resourceInProgressCache.service";
import OnExtensionUpdateAvailableService from "../extension/onExtensionUpdateAvailableService";

describe("PostLogoutService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PostLogoutService:exec", () => {
    it("Should send message to awake port and send post logout event", async() => {
      expect.assertions(5);
      // data mocked
      const worker = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker));
      const worker2 = readWorker({name: AppPagemod.appName});
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker2));
      const appPort = mockPort({name: worker2.id, tabId: worker2.tabId, frameId: worker2.frameId});
      const appPortWrapper = new Port(appPort);

      // function mocked
      jest.spyOn(BrowserTabService, "sendMessage").mockImplementation(jest.fn());
      jest.spyOn(PortManager, "getPortById").mockImplementationOnce(() => appPortWrapper);
      jest.spyOn(appPortWrapper, "emit");
      jest.spyOn(LocalStorageService, "flush");
      // execution
      await PostLogoutService.exec();
      // Waiting all promises are resolved
      await Promise.resolve();
      // expectations
      expect(BrowserTabService.sendMessage).toHaveBeenCalledTimes(1);
      expect(BrowserTabService.sendMessage).toHaveBeenCalledWith(worker2, "passbolt.port.connect", worker2.id);
      expect(appPortWrapper.emit).toHaveBeenCalledWith('passbolt.auth.after-logout');
      expect(appPortWrapper.emit).toHaveBeenCalledTimes(1);
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

    it("Should call all services that needs to run processes on logout", async() => {
      expect.assertions(5);
      jest.spyOn(PortManager, "isPortExist").mockImplementation(() => false);
      jest.spyOn(LocalStorageService, "flush");
      jest.spyOn(toolbarController, "handleUserLoggedOut");
      jest.spyOn(StartLoopAuthSessionCheckService, "clearAlarm");
      jest.spyOn(resourceInProgressCacheService, "reset");
      jest.spyOn(OnExtensionUpdateAvailableService, "handleUserLoggedOut");

      await PostLogoutService.exec();

      expect(LocalStorageService.flush).toHaveBeenCalledTimes(1);
      expect(toolbarController.handleUserLoggedOut).toHaveBeenCalledTimes(1);
      expect(StartLoopAuthSessionCheckService.clearAlarm).toHaveBeenCalledTimes(1);
      expect(resourceInProgressCacheService.reset).toHaveBeenCalledTimes(1);
      expect(OnExtensionUpdateAvailableService.handleUserLoggedOut).toHaveBeenCalledTimes(1);
    });
  });
});
