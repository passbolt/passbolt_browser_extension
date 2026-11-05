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
import UserSettings from "../../model/userSettings/userSettings";
import WebNavigationService from "../../service/webNavigation/webNavigationService";
import AuthModel from "../../model/auth/authModel";
import GetActiveAccountService from "../../service/account/getActiveAccountService";
import User from "../../model/user";
import UserActiveSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultUserActiveSessionDto } from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity.test.data";
import GetOrFindActiveSessionService from "../../service/activeSession/getOrFindActiveSessionService";
import AuthenticationStatusService from "../../service/authenticationStatusService";
import MfaAuthenticationRequiredError from "../../error/mfaAuthenticationRequiredError";
import LocalLogoutService from "../../service/auth/localLogoutService";

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("OnExtensionInstalledController", () => {
  describe("OnExtensionInstalledController::exec", () => {
    it("Should exec install if the reason is install", async () => {
      expect.assertions(7);
      // data mocked
      const details = {
        reason: browser.runtime.OnInstalledReason.INSTALL,
      };
      const tabs = [
        {
          id: 1,
          url: "https://passbolt.local/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        },
        {
          id: 2,
          url: "https://passbolt.local/setup/recover/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        },
        { id: 3, url: "https://passbolt.local/auth/login" },
        { id: 4, url: "https://localhost" },
        { id: 5, url: "https://chromewebstore.google.com/id/passbolt" },
        { id: 6, url: "https://addons.mozilla.org/id/passbolt" },
      ];
      // mock function
      jest.spyOn(OnExtensionInstalledController, "onInstall");
      jest.spyOn(browser.tabs, "query").mockImplementation(() => Promise.resolve(tabs));
      jest.spyOn(browser.tabs, "update").mockImplementation((tabId) => tabs.find((tab) => tab.id === tabId));
      // process
      await OnExtensionInstalledController.exec(details);
      // expectation
      expect(OnExtensionInstalledController.onInstall).toHaveBeenCalled();
      expect(browser.tabs.update).toHaveBeenCalledWith(tabs[0].id, {
        url: `${tabs[0].url}?first-install=1`,
        active: true,
      });
      expect(browser.tabs.update).toHaveBeenCalledWith(tabs[1].id, {
        url: `${tabs[1].url}?first-install=1`,
        active: true,
      });
      expect(browser.tabs.update).toHaveBeenCalledTimes(2);
      expect(browser.tabs.remove).toHaveBeenCalledWith(tabs[4].id);
      expect(browser.tabs.remove).toHaveBeenCalledWith(tabs[5].id);
      expect(browser.tabs.remove).toHaveBeenCalledTimes(2);
    });

    it("Should exec update if the reason is update", async () => {
      expect.assertions(9);
      // data mocked
      const details = {
        reason: browser.runtime.OnInstalledReason.UPDATE,
      };
      const tabs = [
        {
          id: 1,
          url: "https://passbolt.local/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        },
        {
          id: 2,
          url: "https://passbolt.local/setup/recover/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        },
        { id: 3, url: "https://passbolt.local/auth/login" },
        { id: 4, url: "https://passbolt.local" },
        { id: 5, url: "https://passbolt.com" },
        { id: 6, url: "https://localhost" },
      ];
      // mock function
      jest.spyOn(OnExtensionInstalledController, "onUpdate");
      jest.spyOn(WebNavigationService, "exec");
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => Promise.resolve(tabs));
      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => new AccountEntity(defaultAccountDto()));
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.local");
      // process
      await OnExtensionInstalledController.exec(details);
      // expectation
      expect(OnExtensionInstalledController.onUpdate).toHaveBeenCalled();
      expect(browser.tabs.reload).toHaveBeenCalledWith(tabs[0].id);
      expect(browser.tabs.reload).toHaveBeenCalledWith(tabs[1].id);
      expect(browser.tabs.reload).toHaveBeenCalledWith(tabs[2].id);
      expect(browser.tabs.reload).toHaveBeenCalledWith(tabs[3].id);
      expect(browser.tabs.reload).toHaveBeenCalledTimes(4);
      expect(WebNavigationService.exec).toHaveBeenCalledWith({ frameId: 0, tabId: tabs[4].id, url: tabs[4].url });
      expect(WebNavigationService.exec).toHaveBeenCalledWith({ frameId: 0, tabId: tabs[5].id, url: tabs[5].url });
      expect(WebNavigationService.exec).toHaveBeenCalledTimes(2);
    });

    it("Should exec browser update if the reason is chrome update", async () => {
      expect.assertions(3);
      // data mocked
      const details = {
        reason: browser.runtime.OnInstalledReason.CHROME_UPDATE,
      };
      // mock function
      jest.spyOn(OnExtensionInstalledController, "onBrowserUpdate");
      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => {
        throw new Error("No account");
      });
      jest.spyOn(AuthModel.prototype, "logout");
      jest.spyOn(browser.tabs, "reload");
      // process
      await OnExtensionInstalledController.exec(details);
      // expectation
      expect(OnExtensionInstalledController.onBrowserUpdate).toHaveBeenCalled();
      expect(AuthModel.prototype.logout).toHaveBeenCalledTimes(0);
      expect(browser.tabs.reload).not.toHaveBeenCalled();
    });

    it("Should exec browser update if the reason is browser update", async () => {
      expect.assertions(4);
      // data mocked
      const details = {
        reason: browser.runtime.OnInstalledReason.BROWSER_UPDATE,
      };
      const tabs = [
        { id: 1, url: "https://passbolt.local/app/passwords" },
        {
          id: 2,
          url: "https://passbolt.local/setup/recover/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        },
        { id: 3, url: "https://passbolt.local/auth/login" },
        { id: 4, url: "https://passbolt.local" },
        { id: 5, url: "https://passbolt.com" },
        { id: 6, url: "https://localhost" },
      ];
      // mock function
      jest.spyOn(OnExtensionInstalledController, "onBrowserUpdate");
      jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => true);
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.local");
      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => new AccountEntity(defaultAccountDto()));
      jest.spyOn(AuthModel.prototype, "logout").mockImplementation(() => {});
      jest.spyOn(browser.tabs, "query").mockImplementation(() => Promise.resolve(tabs));
      jest.spyOn(browser.tabs, "reload");
      jest.spyOn(AuthenticationStatusService.prototype, "isAuthenticated").mockImplementation(async () => true);
      // process
      await OnExtensionInstalledController.exec(details);
      // expectation
      expect(OnExtensionInstalledController.onBrowserUpdate).toHaveBeenCalled();
      expect(AuthModel.prototype.logout).toHaveBeenCalledTimes(1);
      expect(browser.tabs.query).toHaveBeenCalledTimes(1);
      expect(browser.tabs.reload).toHaveBeenCalledWith(tabs[0].id);
    });

    it("Should not exec update neither install if the reason is unknown", async () => {
      expect.assertions(3);
      // data mocked
      const details = {
        reason: "unknown",
      };
      // mock function
      jest.spyOn(OnExtensionInstalledController, "onUpdate");
      jest.spyOn(OnExtensionInstalledController, "onInstall");
      jest.spyOn(OnExtensionInstalledController, "onBrowserUpdate");

      // process
      await OnExtensionInstalledController.exec(details);
      // expectation
      expect(OnExtensionInstalledController.onUpdate).not.toHaveBeenCalled();
      expect(OnExtensionInstalledController.onInstall).not.toHaveBeenCalled();
      expect(OnExtensionInstalledController.onBrowserUpdate).not.toHaveBeenCalled();
    });
  });

  describe("OnExtensionInstalledController::signOutIfAuthenticated", () => {
    const appTab = { id: 1, url: "https://passbolt.dev/app/passwords" };

    beforeEach(() => {
      jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => true);
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.dev");
      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => new AccountEntity(defaultAccountDto()));
      jest.spyOn(browser.tabs, "query").mockImplementation(() => Promise.resolve([appTab]));
      jest.spyOn(browser.tabs, "reload");
      jest.spyOn(AuthModel.prototype, "logout").mockImplementation(() => {});
      // The toolbar icon reads the active session once the user is signed out.
      jest
        .spyOn(GetOrFindActiveSessionService.prototype, "getOrFind")
        .mockImplementation(
          () => new UserActiveSessionEntity(defaultUserActiveSessionDto({ is_authenticated: false })),
        );
    });

    it("Should sign out a user who still has to complete the MFA on the server", async () => {
      expect.assertions(2);
      jest.spyOn(AuthenticationStatusService.prototype, "isAuthenticated").mockImplementation(async () => {
        throw new MfaAuthenticationRequiredError();
      });
      jest.spyOn(LocalLogoutService.prototype, "exec");

      await OnExtensionInstalledController.exec({ reason: browser.runtime.OnInstalledReason.UPDATE });

      expect(AuthModel.prototype.logout).toHaveBeenCalledTimes(1);
      expect(LocalLogoutService.prototype.exec).not.toHaveBeenCalled();
    });

    it("Should not sign out a user who is not signed in on the server", async () => {
      expect.assertions(3);
      jest.spyOn(AuthenticationStatusService.prototype, "isAuthenticated").mockImplementation(async () => false);
      jest.spyOn(LocalLogoutService.prototype, "exec");

      await OnExtensionInstalledController.exec({ reason: browser.runtime.OnInstalledReason.UPDATE });

      expect(AuthModel.prototype.logout).not.toHaveBeenCalled();
      expect(LocalLogoutService.prototype.exec).not.toHaveBeenCalled();
      expect(browser.tabs.reload).toHaveBeenCalledWith(appTab.id);
    });

    it("Should sign out with the local logout if the server is not reachable", async () => {
      expect.assertions(3);
      jest.spyOn(AuthenticationStatusService.prototype, "isAuthenticated").mockImplementation(async () => {
        throw new Error("Server not reachable");
      });
      jest.spyOn(LocalLogoutService.prototype, "exec").mockImplementation(() => {});

      await OnExtensionInstalledController.exec({ reason: browser.runtime.OnInstalledReason.UPDATE });

      expect(AuthModel.prototype.logout).not.toHaveBeenCalled();
      expect(LocalLogoutService.prototype.exec).toHaveBeenCalledTimes(1);
      expect(browser.tabs.reload).toHaveBeenCalledWith(appTab.id);
    });

    it("Should sign out with the local logout if the server logout fails", async () => {
      expect.assertions(2);
      jest.spyOn(AuthenticationStatusService.prototype, "isAuthenticated").mockImplementation(async () => true);
      jest.spyOn(AuthModel.prototype, "logout").mockImplementation(() => {
        throw new Error("Unexpected error");
      });
      jest.spyOn(LocalLogoutService.prototype, "exec").mockImplementation(() => {});

      await OnExtensionInstalledController.exec({ reason: browser.runtime.OnInstalledReason.UPDATE });

      expect(LocalLogoutService.prototype.exec).toHaveBeenCalledTimes(1);
      expect(browser.tabs.reload).toHaveBeenCalledWith(appTab.id);
    });

    it("Should remove the legacy active session from the local storage", async () => {
      expect.assertions(1);
      const account = new AccountEntity(defaultAccountDto());
      jest.spyOn(AuthenticationStatusService.prototype, "isAuthenticated").mockImplementation(async () => false);
      const legacyStorageKey = `active_session-${account.id}`;
      await browser.storage.local.set({ [legacyStorageKey]: defaultUserActiveSessionDto() });

      await OnExtensionInstalledController.exec({ reason: browser.runtime.OnInstalledReason.UPDATE });

      expect(browser.storage.local.store[legacyStorageKey]).toBeUndefined();
    });

    it("Should still process the tabs if no account is associated with the extension", async () => {
      expect.assertions(3);
      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => {
        throw new Error("No account");
      });
      jest.spyOn(AuthenticationStatusService.prototype, "isAuthenticated");

      await OnExtensionInstalledController.exec({ reason: browser.runtime.OnInstalledReason.UPDATE });

      expect(AuthenticationStatusService.prototype.isAuthenticated).not.toHaveBeenCalled();
      expect(AuthModel.prototype.logout).not.toHaveBeenCalled();
      expect(browser.tabs.query).toHaveBeenCalledTimes(1);
    });

    it("Should reload the app tabs on browser update even if the user was not signed in", async () => {
      expect.assertions(2);
      jest.spyOn(AuthenticationStatusService.prototype, "isAuthenticated").mockImplementation(async () => false);

      await OnExtensionInstalledController.exec({ reason: browser.runtime.OnInstalledReason.BROWSER_UPDATE });

      expect(AuthModel.prototype.logout).not.toHaveBeenCalled();
      expect(browser.tabs.reload).toHaveBeenCalledWith(appTab.id);
    });
  });
});
