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
import WorkersSessionStorage from "../sessionStorage/workersSessionStorage";
import {readWorker} from "../../model/entity/worker/workerEntity.test.data";
import WorkerEntity from "../../model/entity/worker/workerEntity";
import BrowserTabService from "../ui/browserTab.service";
import PortManager from "../../sdk/port/portManager";
import {mockPort} from "../../sdk/port/portManager.test.data";
import Port from "../../sdk/port";
import MockExtension from "../../../../../test/mocks/mockExtension";
import PostLoginService from "./postLoginService";
import StartLoopAuthSessionCheckService from "./startLoopAuthSessionCheckService";
import InformCallToActionPagemod from "../../pagemod/informCallToActionPagemod";
import toolbarService from "../toolbar/toolbarService";

beforeEach(async() => {
  jest.clearAllMocks();
  await MockExtension.withConfiguredAccount();
});

describe("PostLoginService", () => {
  describe("PostLoinService::postLogin", () => {
    it("Should send message to awake port and send post logout event", async() => {
      expect.assertions(4);
      // data mocked
      const worker = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker));

      const workerCta = readWorker({name: InformCallToActionPagemod.appName});
      await WorkersSessionStorage.addWorker(new WorkerEntity(workerCta));
      const informCtaPort = mockPort({name: workerCta.id, tabId: workerCta.tabId, frameId: workerCta.frameId});
      const informCtaPortWrapper = new Port(informCtaPort);

      // function mocked
      jest.spyOn(BrowserTabService, "sendMessage").mockImplementation(jest.fn());
      jest.spyOn(PortManager, "getPortById").mockImplementationOnce(() => informCtaPortWrapper);
      jest.spyOn(informCtaPortWrapper, "emit");
      jest.spyOn(toolbarService, "handleUserLoggedIn").mockImplementation(async() => {});
      jest.spyOn(StartLoopAuthSessionCheckService, "exec").mockImplementation(async() => {});

      // execution
      await PostLoginService.exec();

      // Waiting all promises are resolved
      await Promise.resolve();

      // expectations
      expect(BrowserTabService.sendMessage).toHaveBeenCalledTimes(1);
      expect(BrowserTabService.sendMessage).toHaveBeenCalledWith(workerCta, "passbolt.port.connect", workerCta.id);
      expect(informCtaPortWrapper.emit).toHaveBeenCalledWith('passbolt.auth.after-login');
      expect(informCtaPortWrapper.emit).toHaveBeenCalledTimes(1);
    });

    it("Should not send messages if no workers needs to receive post logout event", async() => {
      expect.assertions(2);
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
      jest.spyOn(toolbarService, "handleUserLoggedIn").mockImplementation(async() => {});
      jest.spyOn(StartLoopAuthSessionCheckService, "exec").mockImplementation(async() => {});
      // execution
      await PostLoginService.exec();
      // Waiting all promises are resolved
      await Promise.resolve();
      // expectations
      expect(BrowserTabService.sendMessage).toHaveBeenCalledTimes(0);
      expect(PortManager.isPortExist).toHaveBeenCalledTimes(0);
    });

    it("Should call all the services that reacts on a post login event", async() => {
      expect.assertions(2);

      jest.spyOn(StartLoopAuthSessionCheckService, "exec").mockImplementation(async() => {});
      jest.spyOn(toolbarService, "handleUserLoggedIn").mockImplementation(async() => {});

      await PostLoginService.exec();

      expect(StartLoopAuthSessionCheckService.exec).toHaveBeenCalledTimes(1);
      expect(toolbarService.handleUserLoggedIn).toHaveBeenCalledTimes(1);
    });
  });
});
