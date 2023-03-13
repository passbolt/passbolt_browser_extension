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
import {ConfigEvents} from "../../all/background_page/event/configEvents";
import {AuthEvents} from "../../all/background_page/event/authEvents";
import {KeyringEvents} from "../../all/background_page/event/keyringEvents";
import {QuickAccessEvents} from "../../all/background_page/event/quickAccessEvents";
import {GroupEvents} from "../../all/background_page/event/groupEvents";
import {TagEvents} from "../../all/background_page/event/tagEvents";
import {ResourceEvents} from "../../all/background_page/event/resourceEvents";
import {SecretEvents} from "../../all/background_page/event/secretEvents";
import {OrganizationSettingsEvents} from "../../all/background_page/event/organizationSettingsEvents";
import {TabEvents} from "../../all/background_page/event/tabEvents";
import {LocaleEvents} from "../../all/background_page/event/localeEvents";
import {PasswordGeneratorEvents} from "../../all/background_page/event/passwordGeneratorEvents";
import {PownedPasswordEvents} from '../../all/background_page/event/pownedPasswordEvents';

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
      // process
      await QuickAccess.attachEvents(port);
      // expectations
      expect(AuthEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName});
      expect(ConfigEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName});
      expect(KeyringEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName});
      expect(QuickAccessEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName});
      expect(GroupEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName});
      expect(TagEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName});
      expect(ResourceEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName});
      expect(SecretEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName});
      expect(OrganizationSettingsEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName});
      expect(TabEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName});
      expect(LocaleEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName});
      expect(PasswordGeneratorEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName});
      expect(PownedPasswordEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: QuickAccess.appName});
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
