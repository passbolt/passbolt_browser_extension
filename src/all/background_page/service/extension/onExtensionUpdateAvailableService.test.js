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

import OnExtensionUpdateAvailableService from "./onExtensionUpdateAvailableService";
import AuthenticationStatusService from "../authenticationStatusService";
import MockExtension from "../../../../../test/mocks/mockExtension";
import MfaAuthenticationRequiredError from "../../error/mfaAuthenticationRequiredError";
import {readWorker} from "../../model/entity/worker/workerEntity.test.data";
import WorkersSessionStorage from "../sessionStorage/workersSessionStorage";
import WorkerEntity from "../../model/entity/worker/workerEntity";
import WebIntegrationPagemod from "../../pagemod/webIntegrationPagemod";
import Port from "../../sdk/port";
import {mockPort} from "../../sdk/port/portManager.test.data";
import PortManager from "../../sdk/port/portManager";
import BrowserTabService from "../ui/browserTab.service";
import PublicWebsiteSignInPagemod from "../../pagemod/publicWebsiteSignInPagemod";
import PostLogoutService from "../auth/postLogoutService";
import BrowserService from "../browser/browserService";
import BrowserExtensionUpdatedLocalStorage from "../local_storage/browserExtensionUpdatedLocalStorage";
import WorkerService from "../worker/workerService";

// Reset the modules before each test.
beforeEach(() => {
  jest.resetAllMocks();
});

describe("OnExtensionUpdateAvailableService", () => {
  describe("OnExtensionUpdateAvailableService::exec", () => {
    it("Should exec update if the user is not signed-in", async() => {
      expect.assertions(3);

      // data mocked
      await MockExtension.withConfiguredAccount();
      const worker = readWorker({name: WebIntegrationPagemod.appName});
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker));
      const webIntegrationPort = mockPort({name: worker.id, tabId: worker.tabId, frameId: worker.frameId});
      const webIntegrationPortWrapper = new Port(webIntegrationPort);
      PortManager.registerPort(webIntegrationPortWrapper);
      // mock function
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => false);
      jest.spyOn(browser.runtime, "reload");
      jest.spyOn(webIntegrationPortWrapper, "emit");
      // process
      await OnExtensionUpdateAvailableService.exec();
      // expectation
      expect(webIntegrationPortWrapper.emit).toHaveBeenCalledWith("passbolt.content-script.destroy");
      expect(webIntegrationPortWrapper.emit).toHaveBeenCalledTimes(1);
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should exec update if the user is not valid", async() => {
      expect.assertions(1);
      // mock function
      await MockExtension.withMissingPrivateKeyAccount();
      jest.spyOn(browser.runtime, "reload");
      // process
      await OnExtensionUpdateAvailableService.exec();
      // expectation
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should exec update only when the user is signed-out", async() => {
      expect.assertions(3);
      // mock function
      await MockExtension.withConfiguredAccount();
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => true);
      jest.spyOn(browser.runtime, "reload");
      jest.spyOn(BrowserService, "isChromeAndMv3").mockImplementation(() => false);
      chrome.runtime.getManifest.mockImplementation(() => ({manifest_version: 3}));
      chrome.runtime.getURL.mockImplementation(() => "chrome://extension/test");

      // process
      await OnExtensionUpdateAvailableService.exec();
      // expectation
      expect(browser.runtime.reload).not.toHaveBeenCalled();
      await PostLogoutService.exec();
      // Waiting all promises has been finished
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
      const storage = new BrowserExtensionUpdatedLocalStorage();
      const shouldExtensionBeReloaded = await storage.get();
      expect(shouldExtensionBeReloaded).toStrictEqual(undefined);
    });

    it("Should clean and exec update", async() => {
      expect.assertions(10);
      // data mocked
      await MockExtension.withConfiguredAccount();
      const worker = readWorker();
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker));
      const worker2 = readWorker({name: WebIntegrationPagemod.appName});
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker2));
      const worker3 = readWorker({name: WebIntegrationPagemod.appName});
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker3));
      const worker4 = readWorker({name: PublicWebsiteSignInPagemod.appName});
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker4));
      const webIntegrationPort = mockPort({name: worker2.id, tabId: worker2.tabId, frameId: worker2.frameId});
      const webIntegrationPortWrapper = new Port(webIntegrationPort);
      const webIntegrationPort2 = mockPort({name: worker3.id, tabId: worker3.tabId, frameId: worker3.frameId});
      const webIntegrationPortWrapper2 = new Port(webIntegrationPort2);
      const publicWebsiteSignInPort = mockPort({name: worker4.id, tabId: worker4.tabId, frameId: worker4.frameId});
      const publicWebsiteSignInPortWrapper = new Port(publicWebsiteSignInPort);
      PortManager.registerPort(webIntegrationPortWrapper2);
      PortManager.registerPort(publicWebsiteSignInPortWrapper);
      // mock function
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => true);
      jest.spyOn(BrowserTabService, "sendMessage").mockImplementation(() => PortManager.registerPort(webIntegrationPortWrapper));
      jest.spyOn(browser.runtime, "reload");
      jest.spyOn(webIntegrationPortWrapper, "emit");
      jest.spyOn(webIntegrationPortWrapper2, "emit");
      jest.spyOn(publicWebsiteSignInPortWrapper, "emit");
      chrome.runtime.getManifest.mockImplementation(() => ({manifest_version: 3}));
      chrome.runtime.getURL.mockImplementation(() => "chrome://extension/test");
      // process
      await OnExtensionUpdateAvailableService.exec();
      // expectation
      expect(browser.runtime.reload).not.toHaveBeenCalled();
      await PostLogoutService.exec();
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
      expect(publicWebsiteSignInPortWrapper.emit).toHaveBeenCalledWith("passbolt.content-script.destroy");
      expect(publicWebsiteSignInPortWrapper.emit).toHaveBeenCalledTimes(1);
      expect(BrowserTabService.sendMessage).toHaveBeenCalledWith(worker2, "passbolt.port.connect", worker2.id);
      expect(BrowserTabService.sendMessage).toHaveBeenCalledTimes(1);
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should exec update if an error occurred and there is no possibility to check if the user is authenticated", async() => {
      expect.assertions(1);
      // mock function
      await MockExtension.withConfiguredAccount();
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => { throw new Error("Error"); });
      jest.spyOn(browser.runtime, "reload");
      // process
      await OnExtensionUpdateAvailableService.exec();
      // expectation
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should not exec update when the user is not fully signed-in", async() => {
      expect.assertions(2);
      // mock function
      await MockExtension.withConfiguredAccount();
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => { throw new MfaAuthenticationRequiredError(); });
      jest.spyOn(browser.runtime, "reload");
      chrome.runtime.getManifest.mockImplementation(() => ({manifest_version: 3}));
      chrome.runtime.getURL.mockImplementation(() => "chrome://extension/test");
      // process
      await OnExtensionUpdateAvailableService.exec();
      // expectation
      expect(browser.runtime.reload).not.toHaveBeenCalled();
      await PostLogoutService.exec();
      // Waiting all promises has been finished
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should not exec update when the user is signed-in and marked the extension as waiting for an update", async() => {
      expect.assertions(1);

      // mock function
      await MockExtension.withConfiguredAccount();
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => true);
      jest.spyOn(browser.runtime, "reload");

      // process
      await OnExtensionUpdateAvailableService.exec();

      // expectation
      const sessionStorage = await browser.storage.session.get(["passboltExtensionUpdate"]);
      expect(sessionStorage).toStrictEqual({["passboltExtensionUpdate"]: true});
    });
  });

  describe("::handleUserLoggedOut", () => {
    it("sbould not clean and reload the service worker if not asked", async() => {
      expect.assertions(3);

      // data mocked
      await MockExtension.withConfiguredAccount();

      jest.spyOn(OnExtensionUpdateAvailableService, "cleanAndReload").mockImplementation(() => {});
      jest.spyOn(BrowserService, "isChromeAndMv3").mockImplementation(() => false);
      jest.spyOn(BrowserExtensionUpdatedLocalStorage.prototype, "set").mockImplementation(() => {});

      await browser.storage.session.set({"passboltExtensionUpdate": false});
      await OnExtensionUpdateAvailableService.handleUserLoggedOut();

      // expectation
      expect(BrowserService.isChromeAndMv3).not.toHaveBeenCalled();
      expect(OnExtensionUpdateAvailableService.cleanAndReload).not.toHaveBeenCalled();
      expect(BrowserExtensionUpdatedLocalStorage.prototype.set).not.toHaveBeenCalled();
    });

    it("sbould clean and reload the service worker when asked", async() => {
      expect.assertions(3);

      // data mocked
      await MockExtension.withConfiguredAccount();

      jest.spyOn(OnExtensionUpdateAvailableService, "cleanAndReload").mockImplementation(() => {});
      jest.spyOn(BrowserService, "isChromeAndMv3").mockImplementation(() => false);
      jest.spyOn(BrowserExtensionUpdatedLocalStorage.prototype, "set").mockImplementation(() => {});
      jest.spyOn(WorkerService, "destroyWorkersByName").mockImplementation(() => {});

      await browser.storage.session.set({"passboltExtensionUpdate": true});
      await OnExtensionUpdateAvailableService.handleUserLoggedOut();

      // expectation
      expect(BrowserService.isChromeAndMv3).toHaveBeenCalled();
      expect(OnExtensionUpdateAvailableService.cleanAndReload).toHaveBeenCalledTimes(1);
      expect(BrowserExtensionUpdatedLocalStorage.prototype.set).not.toHaveBeenCalled();
    });

    it("sbould clean and reload the service worker when asked", async() => {
      expect.assertions(4);

      // data mocked
      await MockExtension.withConfiguredAccount();

      jest.spyOn(OnExtensionUpdateAvailableService, "cleanAndReload").mockImplementation(() => {});
      jest.spyOn(BrowserService, "isChromeAndMv3").mockImplementation(() => true);
      jest.spyOn(BrowserExtensionUpdatedLocalStorage.prototype, "set").mockImplementation(() => {});

      await browser.storage.session.set({"passboltExtensionUpdate": true});
      await OnExtensionUpdateAvailableService.handleUserLoggedOut();

      // expectation
      expect(BrowserService.isChromeAndMv3).toHaveBeenCalled();
      expect(OnExtensionUpdateAvailableService.cleanAndReload).toHaveBeenCalled();
      expect(BrowserExtensionUpdatedLocalStorage.prototype.set).toHaveBeenCalledTimes(1);
      expect(BrowserExtensionUpdatedLocalStorage.prototype.set).toHaveBeenCalledWith(expect.any(Number));
    });
  });
});
