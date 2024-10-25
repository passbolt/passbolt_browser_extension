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
import {PownedPasswordEvents} from '../event/pownedPasswordEvents';
import {v4 as uuid} from 'uuid';
import {enableFetchMocks} from "jest-fetch-mock";
import {RememberMeEvents} from "../event/rememberMeEvents";
import {ResourceTypeEvents} from "../event/resourceTypeEvents";
import BuildApiClientOptionsService from "../service/account/buildApiClientOptionsService";
import GetActiveAccountService from "../service/account/getActiveAccountService";
import {AccountEvents} from "../event/accountEvents";

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
jest.spyOn(PownedPasswordEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(RememberMeEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(ResourceTypeEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(AccountEvents, "listen").mockImplementation(jest.fn());

describe("QuickAccess", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
    enableFetchMocks();
  });

  describe("QuickAccess::attachEvents", () => {
    it("Should attach events", async() => {
      expect.assertions(18);
      // data mocked
      const port = {
        _port: {
          sender: {}
        }
      };
      // mock functions
      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({value: "csrf-token"}));
      const mockedAccount = {user_id: uuid(), domain: "https://test.passbolt.local"};
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(mockedAccount);
      jest.spyOn(GetActiveAccountService, 'get').mockImplementation(() => mockedAccount);
      // process
      await QuickAccess.attachEvents(port);
      // expectations
      const expectedArgument = {port: port, tab: port._port.sender.tab, name: QuickAccess.appName};
      expect(AuthEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(ConfigEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(KeyringEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(QuickAccessEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(GroupEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(TagEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(ResourceEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(SecretEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(OrganizationSettingsEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(TabEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(LocaleEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(PownedPasswordEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(RememberMeEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(ResourceTypeEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(AccountEvents.listen).toHaveBeenCalledWith(expectedArgument, apiClientOptions, mockedAccount);
      expect(QuickAccess.events).toStrictEqual([AuthEvents, ConfigEvents, KeyringEvents, QuickAccessEvents, GroupEvents, TagEvents, ResourceEvents, SecretEvents, OrganizationSettingsEvents, TabEvents, LocaleEvents, PownedPasswordEvents, RememberMeEvents, ResourceTypeEvents, AccountEvents]);
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
