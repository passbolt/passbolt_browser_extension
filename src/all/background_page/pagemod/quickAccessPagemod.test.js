/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import QuickAccess from "./quickAccessPagemod";
import {ConfigEvents} from "../event/configEvents";
import {AuthEvents} from "../event/authEvents";
import {KeyringEvents} from "../event/keyringEvents";
import {QuickAccessEvents} from "../event/quickAccessEvents";
import {GroupEvents} from "../event/groupEvents";
import {TagEvents} from "../event/tagEvents";
import {ResourceEvents} from "../event/resourceEvents";
import {SecretEvents} from "../event/secretEvents";
import {OrganizationSettingsEvents} from "../event/organizationSettingsEvents";
import {TabEvents} from "../event/tabEvents";
import {LocaleEvents} from "../event/localeEvents";
import {PasswordGeneratorEvents} from "../event/passwordGeneratorEvents";
import {PownedPasswordEvents} from '../event/pownedPasswordEvents';
import GetLegacyAccountService from "../service/account/getLegacyAccountService";
import {v4 as uuid} from 'uuid';

jest.spyOn(GetLegacyAccountService, "get").mockImplementation(jest.fn());
jest.spyOn(AuthEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ConfigEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(KeyringEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(QuickAccessEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(GroupEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(TagEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ResourceEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(SecretEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(OrganizationSettingsEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(TabEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(LocaleEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(PasswordGeneratorEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(PownedPasswordEvents, "listen").mockImplementation(jest.fn());

describe("QuickAccess", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("QuickAccess::attachEvents", () => {
    it("Should attach events", async() => {
      expect.assertions(16);
      // data mocked
      const port = {
        _port: {
          sender: {}
        }
      };
      const mockedAccount = {user_id: uuid()};
      jest.spyOn(GetLegacyAccountService, 'get').mockImplementation(() => mockedAccount);
      // process
      await QuickAccess.attachEvents(port);
      // expectations
      expect(AuthEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName}, mockedAccount);
      expect(ConfigEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName}, mockedAccount);
      expect(KeyringEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName}, mockedAccount);
      expect(QuickAccessEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName}, mockedAccount);
      expect(GroupEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName}, mockedAccount);
      expect(TagEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName}, mockedAccount);
      expect(ResourceEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName}, mockedAccount);
      expect(SecretEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName}, mockedAccount);
      expect(OrganizationSettingsEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName}, mockedAccount);
      expect(TabEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName}, mockedAccount);
      expect(LocaleEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName}, mockedAccount);
      expect(PasswordGeneratorEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName}, mockedAccount);
      expect(PownedPasswordEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName}, mockedAccount);
      expect(QuickAccess.events).toStrictEqual([AuthEvents, ConfigEvents, KeyringEvents, QuickAccessEvents, GroupEvents, TagEvents, ResourceEvents, SecretEvents, OrganizationSettingsEvents, TabEvents, LocaleEvents, PasswordGeneratorEvents, PownedPasswordEvents]);
      expect(QuickAccess.mustReloadOnExtensionUpdate).toBeFalsy();
      expect(QuickAccess.appName).toBe('QuickAccess');
    });
  });

  describe("QuickAccess::canBeAttachedTo", () => {
    it("Should have the canBeAttachedTo not valid", async() => {
      expect.assertions(1);
      // process
      const canBeAttachedTo = await QuickAccess.canBeAttachedTo({});
      // expectations
      expect(canBeAttachedTo).toBeFalsy();
    });
  });
});
