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
import PagemodManager from "./pagemodManager";
import pagemod from "./pagemod";
import RecoverBootstrapPagemod from "./recoverBootstrapPagemod";
import SetupBootstrapPagemod from "./setupBootstrapPagemod";
import AuthBootstrapPagemod from "./authBootstrapPagemod";
import User from "../model/user";
import UserSettings from "../model/userSettings/userSettings";
import GpgAuth from "../model/gpgauth";
import AppBootstrapPagemod from "./appBootstrapPagemod";
import WebIntegrationPagemod from "./webIntegrationPagemod";
import PublicWebsiteSignInPagemod from "./publicWebsiteSignInPagemod";

jest.spyOn(pagemod.prototype, "injectFiles").mockImplementation(jest.fn());
jest.spyOn(pagemod.prototype, "attachEvents").mockImplementation(jest.fn());

describe("PagemodManager", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("PagemodManager::exec", () => {
    it("Should find the recover page mod and inject file", async() => {
      expect.assertions(2);
      // data mocked
      const details = {
        tabId: 1,
        frameId: 0,
        url: "https://passbolt.dev/setup/recover/d57c10f5-639d-5160-9c81-8a0c6c4ec856/efc85bca-fc9f-4b32-aebf-b82765312e47"
      };
      // process
      await PagemodManager.exec(details);
      // expectations
      expect(pagemod.prototype.injectFiles).toHaveBeenCalledWith(details.tabId, details.frameId);
      expect(RecoverBootstrapPagemod.injectFiles).toHaveBeenCalledTimes(1);
    });

    it("Should find the setup page mod and inject file", async() => {
      expect.assertions(2);
      // data mocked
      const details = {
        tabId: 1,
        frameId: 0,
        url: "https://passbolt.dev/setup/start/d57c10f5-639d-5160-9c81-8a0c6c4ec856/efc85bca-fc9f-4b32-aebf-b82765312e47"
      };
      // process
      await PagemodManager.exec(details);
      // expectations
      expect(pagemod.prototype.injectFiles).toHaveBeenCalledWith(details.tabId, details.frameId);
      expect(SetupBootstrapPagemod.injectFiles).toHaveBeenCalledTimes(1);
    });

    it("Should find the auth page mod and inject file", async() => {
      expect.assertions(2);
      // data mocked
      const details = {
        tabId: 1,
        frameId: 0,
        url: "https://passbolt.dev/auth/login"
      };
      // mock functions
      jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => true);
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.dev");
      // process
      await PagemodManager.exec(details);
      // expectations
      expect(pagemod.prototype.injectFiles).toHaveBeenCalledWith(details.tabId, details.frameId);
      expect(AuthBootstrapPagemod.injectFiles).toHaveBeenCalledTimes(1);
    });

    it("Should find the app page mod and inject file", async() => {
      expect.assertions(2);
      // data mocked
      const details = {
        tabId: 1,
        frameId: 0,
        url: "https://passbolt.dev/app"
      };
      // mock functions
      jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => true);
      jest.spyOn(GpgAuth.prototype, "isAuthenticated").mockImplementation(() => new Promise(resolve => resolve(true)));
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.dev");
      // process
      await PagemodManager.exec(details);
      // expectations
      expect(pagemod.prototype.injectFiles).toHaveBeenCalledWith(details.tabId, details.frameId);
      expect(AppBootstrapPagemod.injectFiles).toHaveBeenCalledTimes(1);
    });

    it("Should find the web integration page mod and inject file", async() => {
      expect.assertions(2);
      // data mocked
      const details = {
        tabId: 1,
        frameId: 0,
        url: "https://test.dev/auth/login"
      };
      // mock functions
      jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => true);
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.dev");
      // process
      await PagemodManager.exec(details);
      // expectations
      expect(pagemod.prototype.injectFiles).toHaveBeenCalledWith(details.tabId, details.frameId);
      expect(WebIntegrationPagemod.injectFiles).toHaveBeenCalledTimes(1);
    });

    it("Should find the public website sign in page mod and inject file", async() => {
      expect.assertions(2);
      // data mocked
      const details = {
        tabId: 1,
        frameId: 0,
        url: "https://www.passbolt.com"
      };
      // mock functions
      jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => true);
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.dev");
      // process
      await PagemodManager.exec(details);
      // expectations
      expect(pagemod.prototype.injectFiles).toHaveBeenCalledWith(details.tabId, details.frameId);
      expect(PublicWebsiteSignInPagemod.injectFiles).toHaveBeenCalledTimes(1);
    });

    it("Should not find any pagemod", async() => {
      expect.assertions(1);
      // data mocked
      const details = {
        tabId: 1,
        frameId: 0,
        url: "about:settings"
      };
      // process
      await PagemodManager.exec(details);
      // expectations
      expect(pagemod.prototype.injectFiles).not.toHaveBeenCalled();
    });
  });

  describe("PagemodManager::attachEventToPort", () => {
    it("Should attach event to the port for a specific pagemod", async() => {
      expect.assertions(2);
      // data mocked
      const port = {
        name: "test"
      };
      // process
      await PagemodManager.attachEventToPort(port, "RecoverBootstrap");
      // expectations
      expect(pagemod.prototype.attachEvents).toHaveBeenCalledWith(port);
      expect(pagemod.prototype.attachEvents).toHaveBeenCalledTimes(1);
    });

    it("Should not attach event to the port if no pagemod found", async() => {
      expect.assertions(1);
      // data mocked
      const port = {
        name: "test"
      };
      // process
      await PagemodManager.attachEventToPort(port, "TEST");
      // expectations
      expect(pagemod.prototype.attachEvents).not.toHaveBeenCalled();
    });
  });

  describe("PagemodManager::hasPagemodMatchUrlToReload", () => {
    it("Should refresh tab if pagemod must refresh tab url", async() => {
      expect.assertions(7);
      // mock functions
      jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => true);
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.dev");
      // expectations
      expect(PagemodManager.hasPagemodMatchUrlToReload("https://passbolt.dev")).toBeTruthy();
      expect(PagemodManager.hasPagemodMatchUrlToReload("https://www.passbolt.com")).toBeFalsy();
      expect(PagemodManager.hasPagemodMatchUrlToReload("https://passbolt.dev/setup/recover/d57c10f5-639d-5160-9c81-8a0c6c4ec856/efc85bca-fc9f-4b32-aebf-b82765312e47")).toBeTruthy();
      expect(PagemodManager.hasPagemodMatchUrlToReload("https://passbolt.dev/auth/login")).toBeTruthy();
      expect(PagemodManager.hasPagemodMatchUrlToReload("https://passbolt.dev/setup/start/d57c10f5-639d-5160-9c81-8a0c6c4ec856/efc85bca-fc9f-4b32-aebf-b82765312e47")).toBeTruthy();
      expect(PagemodManager.hasPagemodMatchUrlToReload("https://passbolt.dev/account-recovery/continue/d57c10f5-639d-5160-9c81-8a0c6c4ec856/cb66b7ca-bb85-4088-b0da-c50f6f0c2a13")).toBeTruthy();
      expect(PagemodManager.hasPagemodMatchUrlToReload("https://localhost")).toBeFalsy();
    });
  });
});
