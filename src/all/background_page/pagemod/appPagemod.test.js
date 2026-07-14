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
 * @since         3.9.0
 */
import { ConfigEvents } from "../event/configEvents";
import App from "./appPagemod";
import { UserEvents } from "../event/userEvents";
import { KeyringEvents } from "../event/keyringEvents";
import { AuthEvents } from "../event/authEvents";
import { SiteSettingsEvents } from "../event/siteSettingsEvents";
import { LocaleEvents } from "../event/localeEvents";
import { AppEvents } from "../event/appEvents";
import { FolderEvents } from "../event/folderEvents";
import { ResourceEvents } from "../event/resourceEvents";
import { ResourceTypeEvents } from "../event/resourceTypeEvents";
import { RoleEvents } from "../event/roleEvents";
import { SecretEvents } from "../event/secretEvents";
import { ShareEvents } from "../event/shareEvents";
import { GroupEvents } from "../event/groupEvents";
import { CommentEvents } from "../event/commentEvents";
import { ImportResourcesEvents } from "../event/importResourcesEvents";
import { ExportResourcesEvents } from "../event/exportResourcesEvents";
import { ActionLogEvents } from "../event/actionLogEvents";
import { MultiFactorAuthenticationEvents } from "../event/multiFactorAuthenticationEvents";
import { ThemeEvents } from "../event/themeEvents";
import { MobileEvents } from "../event/mobileEvents";
import { PownedPasswordEvents } from "../event/pownedPasswordEvents";
import { MfaEvents } from "../event/mfaEvents";
import BuildApiClientOptionsService from "../service/account/buildApiClientOptionsService";
import { enableFetchMocks } from "jest-fetch-mock";
import { RememberMeEvents } from "../event/rememberMeEvents";
import CheckAuthStatusService from "../service/auth/checkAuthStatusService";
import { userLoggedInAuthStatus, userLoggedOutAuthStatus } from "../controller/auth/authCheckStatus.test.data";
import GetActiveAccountService from "../service/account/getActiveAccountService";
import { PermissionEvents } from "../event/permissionEvents";
import { AccountEvents } from "../event/accountEvents";
import { AppSignOutEvents } from "../event/appSignOutEvents";
import OnlineSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/onlineSessionEntity";
import UserApiService from "passbolt-styleguide/src/shared/services/api/user/userApiService";
import { defaultAdminUserDto } from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import AccountEntity from "../model/entity/account/accountEntity";
import { defaultAccountDto } from "../model/entity/account/accountEntity.test.data";

jest.spyOn(ConfigEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(AppEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(AuthEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(FolderEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ResourceEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ResourceTypeEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(RoleEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(KeyringEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(SecretEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(SiteSettingsEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ShareEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(UserEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(GroupEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(CommentEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ImportResourcesEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ExportResourcesEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ActionLogEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(MultiFactorAuthenticationEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ThemeEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(LocaleEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(MobileEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(PownedPasswordEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(MfaEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(RememberMeEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(PermissionEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(AccountEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(AppSignOutEvents, "listen").mockImplementation(jest.fn());
jest.mock("../service/auth/checkAuthStatusService");

describe("App", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    enableFetchMocks();
  });

  describe("App::attachEvents", () => {
    it("Should attach app events", async () => {
      expect.assertions(31);
      // data mocked
      const port = {
        _port: {
          sender: {
            tab: {
              url: "https://localhost",
            },
          },
        },
      };
      // mock functions
      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({ value: "csrf-token" }));
      jest
        .spyOn(CheckAuthStatusService.prototype, "checkAuthStatus")
        .mockImplementation(async () => new OnlineSessionEntity(userLoggedInAuthStatus()));
      const mockedAccount = new AccountEntity(defaultAccountDto());
      const mockApiClient = BuildApiClientOptionsService.buildFromAccount(mockedAccount);
      // resource name added when UserApiService is created.
      mockApiClient.setResourceName("users");
      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => mockedAccount);
      jest.spyOn(UserApiService.prototype, "get").mockImplementation(() => defaultAdminUserDto());
      // process
      await App.attachEvents(port);
      // expectations
      const expectedPortAndTab = { port: port, tab: port._port.sender.tab };
      expect(GetActiveAccountService.get).toHaveBeenCalledTimes(1);
      expect(UserApiService.prototype.get).toHaveBeenCalledWith(mockedAccount.userId, { role: true });
      expect(ConfigEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(AppEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(AuthEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(FolderEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(ResourceEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(ResourceTypeEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(RoleEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(KeyringEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(SecretEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(SiteSettingsEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(ShareEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(UserEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(GroupEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(CommentEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(ImportResourcesEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(ExportResourcesEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(ActionLogEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(MultiFactorAuthenticationEvents.listen).toHaveBeenCalledWith(
        expectedPortAndTab,
        mockApiClient,
        mockedAccount,
      );
      expect(ThemeEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(LocaleEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(MobileEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(PownedPasswordEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(MfaEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(RememberMeEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(PermissionEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(AccountEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(App.events).toStrictEqual([
        ConfigEvents,
        AppEvents,
        AuthEvents,
        FolderEvents,
        ResourceEvents,
        ResourceTypeEvents,
        RoleEvents,
        KeyringEvents,
        SecretEvents,
        SiteSettingsEvents,
        ShareEvents,
        UserEvents,
        GroupEvents,
        CommentEvents,
        ImportResourcesEvents,
        ExportResourcesEvents,
        ActionLogEvents,
        MultiFactorAuthenticationEvents,
        ThemeEvents,
        LocaleEvents,
        MobileEvents,
        PownedPasswordEvents,
        MfaEvents,
        RememberMeEvents,
        PermissionEvents,
        AccountEvents,
      ]);
      expect(App.mustReloadOnExtensionUpdate).toBeFalsy();
      expect(App.appName).toBe("App");
    });

    it("Should attach app sign out events", async () => {
      expect.assertions(5);
      // data mocked
      const port = {
        _port: {
          sender: {
            tab: {
              url: "https://localhost",
            },
          },
        },
      };
      // mock functions
      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({ value: "csrf-token" }));
      jest
        .spyOn(CheckAuthStatusService.prototype, "checkAuthStatus")
        .mockImplementation(async () => new OnlineSessionEntity(userLoggedOutAuthStatus()));
      // process
      await App.attachEvents(port);
      // expectations
      const expectedPortAndTab = { port: port, tab: port._port.sender.tab };
      expect(AppSignOutEvents.listen).toHaveBeenCalledWith(expectedPortAndTab);
      expect(AppEvents.listen).not.toHaveBeenCalled();
      expect(App.appSignOutEvent).toStrictEqual([AppSignOutEvents]);
      expect(App.mustReloadOnExtensionUpdate).toBeFalsy();
      expect(App.appName).toBe("App");
    });
  });

  describe("App::canBeAttachedTo", () => {
    it("Should have the canBeAttachedTo not valid", async () => {
      expect.assertions(1);
      // process
      const canBeAttachedTo = await App.canBeAttachedTo({});
      // expectations
      expect(canBeAttachedTo).toBeFalsy();
    });
  });
});
