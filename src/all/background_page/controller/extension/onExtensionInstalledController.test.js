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
 * @since         3.6.0
 */

import OnExtensionInstalledController from "./onExtensionInstalledController";
import browser from "../../sdk/polyfill/browserPolyfill";
import User from "../../model/user";
import UserSettings from "../../model/userSettings/userSettings";
import WebNavigationService from "../../service/webNavigation/webNavigationService";

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("OnExtensionInstalledController", () => {
  describe("OnExtensionInstalledController::exec", () => {
    it("Should exec install if the reason is install", async() => {
      expect.assertions(7);
      // data mocked
      const details = {
        reason: browser.runtime.OnInstalledReason.INSTALL
      };
      const tabs = [
        {id: 1, url: "https://passbolt.dev/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0"},
        {id: 2, url: "https://passbolt.dev/setup/recover/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0"},
        {id: 3, url: "https://passbolt.dev/auth/login"},
        {id: 4, url: "https://localhost"},
        {id: 5, url: "https://chrome.google.com/webstore/id/passbolt"},
        {id: 6, url: "https://addons.mozilla.org/id/passbolt"}
      ];
      // mock function
      jest.spyOn(OnExtensionInstalledController, "onInstall");
      jest.spyOn(browser.tabs, "query").mockImplementation(() => Promise.resolve(tabs));
      jest.spyOn(browser.tabs, "update").mockImplementation(tabId => tabs.find(tab => tab.id === tabId));
      // process
      await OnExtensionInstalledController.exec(details);
      // expectation
      expect(OnExtensionInstalledController.onInstall).toHaveBeenCalled();
      expect(browser.tabs.update).toHaveBeenCalledWith(tabs[0].id, {url: `${tabs[0].url}?first-install=1`, active: true});
      expect(browser.tabs.update).toHaveBeenCalledWith(tabs[1].id, {url: `${tabs[1].url}?first-install=1`, active: true});
      expect(browser.tabs.update).toHaveBeenCalledTimes(2);
      expect(browser.tabs.remove).toHaveBeenCalledWith(tabs[4].id);
      expect(browser.tabs.remove).toHaveBeenCalledWith(tabs[5].id);
      expect(browser.tabs.remove).toHaveBeenCalledTimes(2);
    });

    it("Should exec update if the reason is update", async() => {
      expect.assertions(9);
      // data mocked
      const details = {
        reason: browser.runtime.OnInstalledReason.UPDATE
      };
      const tabs = [
        {id: 1, url: "https://passbolt.dev/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0"},
        {id: 2, url: "https://passbolt.dev/setup/recover/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0"},
        {id: 3, url: "https://passbolt.dev/auth/login"},
        {id: 4, url: "https://passbolt.dev"},
        {id: 5, url: "https://passbolt.com"},
        {id: 6, url: "https://localhost"}
      ];
      // mock function
      jest.spyOn(OnExtensionInstalledController, "onUpdate");
      jest.spyOn(WebNavigationService, "exec");
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => Promise.resolve(tabs));
      jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => true);
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.dev");
      // process
      await OnExtensionInstalledController.exec(details);
      // expectation
      expect(OnExtensionInstalledController.onUpdate).toHaveBeenCalled();
      expect(browser.tabs.reload).toHaveBeenCalledWith(tabs[0].id);
      expect(browser.tabs.reload).toHaveBeenCalledWith(tabs[1].id);
      expect(browser.tabs.reload).toHaveBeenCalledWith(tabs[2].id);
      expect(browser.tabs.reload).toHaveBeenCalledWith(tabs[3].id);
      expect(browser.tabs.reload).toHaveBeenCalledTimes(4);
      expect(WebNavigationService.exec).toHaveBeenCalledWith({frameId: 0, tabId: tabs[4].id, url: tabs[4].url});
      expect(WebNavigationService.exec).toHaveBeenCalledWith({frameId: 0, tabId: tabs[5].id, url: tabs[5].url});
      expect(WebNavigationService.exec).toHaveBeenCalledTimes(2);
    });

    it("Should not exec update neither install if the reason is unknown", async() => {
      expect.assertions(2);
      // data mocked
      const details = {
        reason: "unknown"
      };
      // mock function
      jest.spyOn(OnExtensionInstalledController, "onUpdate");
      jest.spyOn(OnExtensionInstalledController, "onInstall");

      // process
      await OnExtensionInstalledController.exec(details);
      // expectation
      expect(OnExtensionInstalledController.onUpdate).not.toHaveBeenCalled();
      expect(OnExtensionInstalledController.onInstall).not.toHaveBeenCalled();
    });
  });
});
