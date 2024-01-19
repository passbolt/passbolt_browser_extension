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
import Auth from "./authPagemod";
import GetLegacyAccountService from "../service/account/getLegacyAccountService";
import {UserEvents} from "../event/userEvents";
import {KeyringEvents} from "../event/keyringEvents";
import {AuthEvents} from "../event/authEvents";
import {OrganizationSettingsEvents} from "../event/organizationSettingsEvents";
import {LocaleEvents} from "../event/localeEvents";
import {v4 as uuid} from 'uuid';
import {enableFetchMocks} from "jest-fetch-mock";
import BuildApiClientOptionsService from "../service/account/buildApiClientOptionsService";
import {mockApiResponse} from "../../../../test/mocks/mockApiResponse";
import {RememberMeEvents} from "../event/rememberMeEvents";
import {DataEvents} from "../event/dataEvents";

jest.spyOn(ConfigEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(UserEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(KeyringEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(AuthEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(OrganizationSettingsEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(LocaleEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(RememberMeEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(DataEvents, "listen").mockImplementation(jest.fn());

describe("Auth", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
    enableFetchMocks();
  });

  describe("Auth::attachEvents", () => {
    it("Should attach events", async() => {
      expect.assertions(12);
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
      fetch.doMockIf(/csrf-token/, async() => mockApiResponse("csrf-token"));
      const mockedAccount = {user_id: uuid(), domain: "https://test-domain.passbolt.com"};
      const mockApiClient = await BuildApiClientOptionsService.buildFromAccount(mockedAccount);
      jest.spyOn(GetLegacyAccountService, 'get').mockImplementation(() => mockedAccount);
      // process
      await Auth.attachEvents(port);
      // expectations
      const expectedPortAndTab = {port: port, tab: port._port.sender.tab};
      expect(GetLegacyAccountService.get).toHaveBeenCalledTimes(1);
      expect(ConfigEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(UserEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(KeyringEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(AuthEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(OrganizationSettingsEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(LocaleEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(RememberMeEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(DataEvents.listen).toHaveBeenCalledWith(expectedPortAndTab, mockApiClient, mockedAccount);
      expect(Auth.events).toStrictEqual([DataEvents, ConfigEvents, UserEvents, KeyringEvents, AuthEvents, OrganizationSettingsEvents, LocaleEvents, RememberMeEvents]);
      expect(Auth.mustReloadOnExtensionUpdate).toBeFalsy();
      expect(Auth.appName).toBe('Auth');
    });
  });

  describe("Auth::canBeAttachedTo", () => {
    it("Should have the canBeAttachedTo not valid", async() => {
      expect.assertions(1);
      // process
      const canBeAttachedTo = await Auth.canBeAttachedTo({});
      // expectations
      expect(canBeAttachedTo).toBeFalsy();
    });
  });
});
