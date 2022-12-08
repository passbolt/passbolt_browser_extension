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
import Auth from "./authPagemod";
import GetLegacyAccountService from "../../all/background_page/service/account/getLegacyAccountService";
import {UserEvents} from "../../all/background_page/event/userEvents";
import {KeyringEvents} from "../../all/background_page/event/keyringEvents";
import {AuthEvents} from "../../all/background_page/event/authEvents";
import {OrganizationSettingsEvents} from "../../all/background_page/event/organizationSettingsEvents";
import {LocaleEvents} from "../../all/background_page/event/localeEvents";

jest.spyOn(GetLegacyAccountService, "get").mockImplementation(jest.fn());
jest.spyOn(ConfigEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(UserEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(KeyringEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(AuthEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(OrganizationSettingsEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(LocaleEvents, "listen").mockImplementation(jest.fn());

describe("Auth", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("Auth::attachEvents", () => {
    it("Should attach events", async() => {
      expect.assertions(9);
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
      // process
      await Auth.attachEvents(port);
      // expectations
      expect(GetLegacyAccountService.get).toHaveBeenCalled();
      expect(ConfigEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(UserEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(KeyringEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(AuthEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(OrganizationSettingsEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(LocaleEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined);
      expect(Auth.events).toStrictEqual([ConfigEvents, UserEvents, KeyringEvents, AuthEvents, OrganizationSettingsEvents, LocaleEvents]);
      expect(Auth.appName).toBe('Auth');
    });
  });

  describe("Auth::isConstraintValidated", () => {
    it("Should have the constraint not valid", async() => {
      expect.assertions(1);
      // process
      const canBeAttachedTo = await Auth.canBeAttachedTo({});
      // expectations
      expect(canBeAttachedTo).toBeFalsy();
    });
  });
});
