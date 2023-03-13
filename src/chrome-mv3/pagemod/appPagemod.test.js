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
import {ConfigEvents} from "../../all/background_page/event/configEvents";
import App from "./appPagemod";
import GetLegacyAccountService from "../../all/background_page/service/account/getLegacyAccountService";
import {UserEvents} from "../../all/background_page/event/userEvents";
import {KeyringEvents} from "../../all/background_page/event/keyringEvents";
import {AuthEvents} from "../../all/background_page/event/authEvents";
import {OrganizationSettingsEvents} from "../../all/background_page/event/organizationSettingsEvents";
import {LocaleEvents} from "../../all/background_page/event/localeEvents";
import {AppEvents} from "../../all/background_page/event/appEvents";
import {FolderEvents} from "../../all/background_page/event/folderEvents";
import {ResourceEvents} from "../../all/background_page/event/resourceEvents";
import {ResourceTypeEvents} from "../../all/background_page/event/resourceTypeEvents";
import {RoleEvents} from "../../all/background_page/event/roleEvents";
import {SecretEvents} from "../../all/background_page/event/secretEvents";
import {ShareEvents} from "../../all/background_page/event/shareEvents";
import {SubscriptionEvents} from "../../all/background_page/event/subscriptionEvents";
import {GroupEvents} from "../../all/background_page/event/groupEvents";
import {CommentEvents} from "../../all/background_page/event/commentEvents";
import {TagEvents} from "../../all/background_page/event/tagEvents";
import {FavoriteEvents} from "../../all/background_page/event/favoriteEvents";
import {ImportResourcesEvents} from "../../all/background_page/event/importResourcesEvents";
import {ExportResourcesEvents} from "../../all/background_page/event/exportResourcesEvents";
import {ActionLogEvents} from "../../all/background_page/event/actionLogEvents";
import {MultiFactorAuthenticationEvents} from "../../all/background_page/event/multiFactorAuthenticationEvents";
import {ThemeEvents} from "../../all/background_page/event/themeEvents";
import {PasswordGeneratorEvents} from "../../all/background_page/event/passwordGeneratorEvents";
import {MobileEvents} from "../../all/background_page/event/mobileEvents";
import GpgAuth from "../../all/background_page/model/gpgauth";
import {PownedPasswordEvents} from '../../all/background_page/event/pownedPasswordEvents';
import {MfaEvents} from "../../all/background_page/event/mfaEvents";
import {ClipboardEvents} from "../../all/background_page/event/clipboardEvents";

jest.spyOn(GetLegacyAccountService, "get").mockImplementation(jest.fn());
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
jest.spyOn(PasswordGeneratorEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(MobileEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(PownedPasswordEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(MfaEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ClipboardEvents, "listen").mockImplementation(jest.fn());


describe("Auth", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("Auth::attachEvents", () => {
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
      // mock functions
      jest.spyOn(GpgAuth.prototype, "isAuthenticated").mockImplementation(() => new Promise(resolve => resolve(true)));
      jest.spyOn(GpgAuth.prototype, "isMfaRequired").mockImplementation(() => new Promise(resolve => resolve(false)));
      // process
      await App.attachEvents(port);
      // expectations
      expect(GetLegacyAccountService.get).toHaveBeenCalled();
      expect(ConfigEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(AppEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(AuthEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(FolderEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(ResourceEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(ResourceTypeEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(RoleEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(KeyringEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(SecretEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(OrganizationSettingsEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(ShareEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(SubscriptionEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(UserEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(GroupEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(CommentEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(TagEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(FavoriteEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(ImportResourcesEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(ExportResourcesEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(ActionLogEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(MultiFactorAuthenticationEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(ThemeEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(LocaleEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(PasswordGeneratorEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(MobileEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(PownedPasswordEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(MfaEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(ClipboardEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
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
        PasswordGeneratorEvents,
        MobileEvents,
        PownedPasswordEvents,
        MfaEvents,
        ClipboardEvents
      ]);
      expect(App.mustReloadOnExtensionUpdate).toBeFalsy();
      expect(App.appName).toBe('App');
    });
  });

  describe("Auth::canBeAttachedTo", () => {
    it("Should have the canBeAttachedTo not valid", async() => {
      expect.assertions(1);
      // process
      const canBeAttachedTo = await App.canBeAttachedTo({});
      // expectations
      expect(canBeAttachedTo).toBeFalsy();
    });
  });
});
