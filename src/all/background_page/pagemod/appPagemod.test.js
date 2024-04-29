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
import {ConfigEvents} from "../event/configEvents";
import App from "./appPagemod";
import GetLegacyAccountService from "../service/account/getLegacyAccountService";
import {UserEvents} from "../event/userEvents";
import {KeyringEvents} from "../event/keyringEvents";
import {AuthEvents} from "../event/authEvents";
import {OrganizationSettingsEvents} from "../event/organizationSettingsEvents";
import {LocaleEvents} from "../event/localeEvents";
import {AppEvents} from "../event/appEvents";
import {FolderEvents} from "../event/folderEvents";
import {ResourceEvents} from "../event/resourceEvents";
import {ResourceTypeEvents} from "../event/resourceTypeEvents";
import {RoleEvents} from "../event/roleEvents";
import {SecretEvents} from "../event/secretEvents";
import {ShareEvents} from "../event/shareEvents";
import {SubscriptionEvents} from "../event/subscriptionEvents";
import {GroupEvents} from "../event/groupEvents";
import {CommentEvents} from "../event/commentEvents";
import {TagEvents} from "../event/tagEvents";
import {FavoriteEvents} from "../event/favoriteEvents";
import {ImportResourcesEvents} from "../event/importResourcesEvents";
import {ExportResourcesEvents} from "../event/exportResourcesEvents";
import {ActionLogEvents} from "../event/actionLogEvents";
import {MultiFactorAuthenticationEvents} from "../event/multiFactorAuthenticationEvents";
import {ThemeEvents} from "../event/themeEvents";
import {MobileEvents} from "../event/mobileEvents";
import {PownedPasswordEvents} from '../event/pownedPasswordEvents';
import {MfaEvents} from "../event/mfaEvents";
import {ClipboardEvents} from "../event/clipboardEvents";
import {v4 as uuid} from "uuid";
import BuildApiClientOptionsService from "../service/account/buildApiClientOptionsService";
import {enableFetchMocks} from "jest-fetch-mock";
import {RememberMeEvents} from "../event/rememberMeEvents";
import CheckAuthStatusService from "../service/auth/checkAuthStatusService";
import {userLoggedInAuthStatus} from "../controller/auth/authCheckStatus.test.data";

jest.spyOn(ConfigEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(AppEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(AuthEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(FolderEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ResourceEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ResourceTypeEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(RoleEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(KeyringEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(SecretEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(OrganizationSettingsEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ShareEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(SubscriptionEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(UserEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(GroupEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(CommentEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(TagEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(FavoriteEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ImportResourcesEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ExportResourcesEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ActionLogEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(MultiFactorAuthenticationEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ThemeEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(LocaleEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(MobileEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(PownedPasswordEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(MfaEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ClipboardEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(RememberMeEvents, "listen").mockImplementation(jest.fn());

describe("App", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
    enableFetchMocks();
  });

  describe("App::attachEvents", () => {
    it("Should attach events", async() => {
      expect.assertions(32);
      // data mocked
      const port = {
        _port: {
          sender: {
            tab: {
              url: "https://localhost"
            }
          }
        }
      };
      jest.spyOn(GetLegacyAccountService, 'get').mockImplementation(() => mockedAccount);

      // mock functions
      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({value: "csrf-token"}));
      jest.spyOn(CheckAuthStatusService.prototype, "checkAuthStatus").mockImplementation(async() => userLoggedInAuthStatus());
      const mockedAccount = {user_id: uuid(), domain: "https://test-domain.passbolt.com"};
      const mockApiClient = await BuildApiClientOptionsService.buildFromAccount(mockedAccount);
      jest.spyOn(GetLegacyAccountService, 'get').mockImplementation(() => mockedAccount);
      // process
      await App.attachEvents(port);
      // expectations
      const expectedPortAndTab = {port: port, tab: port._port.sender.tab};
      expect(GetLegacyAccountService.get).toHaveBeenCalledWith({role: true});
      expect(ConfigEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(AppEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(AuthEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(FolderEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(ResourceEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(ResourceTypeEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(RoleEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(KeyringEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(SecretEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(OrganizationSettingsEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(ShareEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(SubscriptionEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(UserEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(GroupEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(CommentEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(TagEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(FavoriteEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(ImportResourcesEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(ExportResourcesEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(ActionLogEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(MultiFactorAuthenticationEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(ThemeEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(LocaleEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(MobileEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(PownedPasswordEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(MfaEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(ClipboardEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(RememberMeEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
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
        OrganizationSettingsEvents,
        ShareEvents,
        SubscriptionEvents,
        UserEvents,
        GroupEvents,
        CommentEvents,
        TagEvents,
        FavoriteEvents,
        ImportResourcesEvents,
        ExportResourcesEvents,
        ActionLogEvents,
        MultiFactorAuthenticationEvents,
        ThemeEvents,
        LocaleEvents,
        MobileEvents,
        PownedPasswordEvents,
        MfaEvents,
        ClipboardEvents,
        RememberMeEvents
      ]);
      expect(App.mustReloadOnExtensionUpdate).toBeFalsy();
      expect(App.appName).toBe('App');
    });
  });

  describe("App::canBeAttachedTo", () => {
    it("Should have the canBeAttachedTo not valid", async() => {
      expect.assertions(1);
      // process
      const canBeAttachedTo = await App.canBeAttachedTo({});
      // expectations
      expect(canBeAttachedTo).toBeFalsy();
    });
  });
});
