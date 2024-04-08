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
 * @since         4.6.0
 */

import OnExtensionUpdateAvailableController from "./onExtensionUpdateAvailableController";
import AuthenticationStatusService from "../../service/authenticationStatusService";
import MockExtension from "../../../../../test/mocks/mockExtension";
import MfaAuthenticationRequiredError from "../../error/mfaAuthenticationRequiredError";
import {readWorker} from "../../model/entity/worker/workerEntity.test.data";
import WorkersSessionStorage from "../../service/sessionStorage/workersSessionStorage";
import WorkerEntity from "../../model/entity/worker/workerEntity";
import WebIntegrationPagemod from "../../pagemod/webIntegrationPagemod";
import Port from "../../sdk/port";
import {mockPort} from "../../sdk/port/portManager.test.data";
import PortManager from "../../sdk/port/portManager";
import BrowserTabService from "../../service/ui/browserTab.service";

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("OnExtensionInstalledController", () => {
  describe("OnExtensionInstalledController::exec", () => {
    it("Should exec update if the user is not signed-in", async() => {
      expect.assertions(3);
      // data mocked
      const worker = readWorker({name: WebIntegrationPagemod.appName});
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker));
      const webIntegrationPort = mockPort({name: worker.id, tabId: worker.tabId, frameId: worker.frameId});
      const webIntegrationPortWrapper = new Port(webIntegrationPort);
      PortManager.registerPort(webIntegrationPortWrapper);
      // mock function
      MockExtension.withConfiguredAccount();
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => false);
      jest.spyOn(browser.runtime, "reload");
      jest.spyOn(webIntegrationPortWrapper, "emit");
      // process
      await OnExtensionUpdateAvailableController.exec();
      // expectation
      expect(webIntegrationPortWrapper.emit).toHaveBeenCalledWith("passbolt.content-script.destroy");
      expect(webIntegrationPortWrapper.emit).toHaveBeenCalledTimes(1);
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should exec update if the user is not valid", async() => {
      expect.assertions(1);
      // mock function
      MockExtension.withMissingPrivateKeyAccount();
      jest.spyOn(browser.runtime, "reload");
      // process
      await OnExtensionUpdateAvailableController.exec();
      // expectation
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should exec update only when the user is signed-out", async() => {
      expect.assertions(2);
      // mock function
      MockExtension.withConfiguredAccount();
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => true);
      jest.spyOn(browser.runtime, "reload");
      // process
      await OnExtensionUpdateAvailableController.exec();
      // expectation
      expect(browser.runtime.reload).not.toHaveBeenCalled();
      self.dispatchEvent(new Event('passbolt.auth.after-logout'));
      // Waiting all promises has been finished
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should clean and exec update", async() => {
      expect.assertions(8);
      // data mocked
      const worker = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker));
      const worker2 = readWorker({name: WebIntegrationPagemod.appName});
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker2));
      const worker3 = readWorker({name: WebIntegrationPagemod.appName});
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker3));
      const webIntegrationPort = mockPort({name: worker2.id, tabId: worker2.tabId, frameId: worker2.frameId});
      const webIntegrationPortWrapper = new Port(webIntegrationPort);
      const webIntegrationPort2 = mockPort({name: worker3.id, tabId: worker3.tabId, frameId: worker3.frameId});
      const webIntegrationPortWrapper2 = new Port(webIntegrationPort2);
      PortManager.registerPort(webIntegrationPortWrapper2);
      // mock function
      MockExtension.withConfiguredAccount();
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => true);
      jest.spyOn(BrowserTabService, "sendMessage").mockImplementation(() => PortManager.registerPort(webIntegrationPortWrapper));
      jest.spyOn(browser.runtime, "reload");
      jest.spyOn(webIntegrationPortWrapper, "emit");
      jest.spyOn(webIntegrationPortWrapper2, "emit");
      // process
      await OnExtensionUpdateAvailableController.exec();
      // expectation
      expect(browser.runtime.reload).not.toHaveBeenCalled();
      self.dispatchEvent(new Event('passbolt.auth.after-logout'));
      // Waiting all promises has been finished
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      // expectation
      expect(webIntegrationPortWrapper.emit).toHaveBeenCalledWith("passbolt.content-script.destroy");
      expect(webIntegrationPortWrapper.emit).toHaveBeenCalledTimes(1);
      expect(webIntegrationPortWrapper2.emit).toHaveBeenCalledWith("passbolt.content-script.destroy");
      expect(webIntegrationPortWrapper2.emit).toHaveBeenCalledTimes(1);
      expect(BrowserTabService.sendMessage).toHaveBeenCalledWith(worker2, "passbolt.port.connect", worker2.id);
      expect(BrowserTabService.sendMessage).toHaveBeenCalledTimes(1);
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should exec update if an error occurred and there is no possibility to check if the user is authenticated", async() => {
      expect.assertions(1);
      // mock function
      MockExtension.withConfiguredAccount();
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => { throw new Error("Error"); });
      jest.spyOn(browser.runtime, "reload");
      // process
      await OnExtensionUpdateAvailableController.exec();
      // expectation
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should not exec update when the user is not fully signed-in", async() => {
      expect.assertions(2);
      // mock function
      MockExtension.withConfiguredAccount();
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => { throw new MfaAuthenticationRequiredError(); });
      jest.spyOn(browser.runtime, "reload");
      // process
      await OnExtensionUpdateAvailableController.exec();
      // expectation
      expect(browser.runtime.reload).not.toHaveBeenCalled();
      self.dispatchEvent(new Event('passbolt.auth.after-logout'));
      // Waiting all promises has been finished
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });
  });
});
