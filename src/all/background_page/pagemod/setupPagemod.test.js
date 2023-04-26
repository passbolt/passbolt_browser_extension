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
import Setup from "./setupPagemod";
import {ConfigEvents} from "../event/configEvents";
import {SetupEvents} from "../event/setupEvents";
import BuildApiClientOptionsService
  from "../service/account/buildApiClientOptionsService";
import BuildAccountSetupService from "../service/setup/buildAccountSetupService";
import {PownedPasswordEvents} from '../event/pownedPasswordEvents';
import {mockApiResponse} from "../../../../test/mocks/mockApiResponse";
import {enableFetchMocks} from "jest-fetch-mock";

jest.spyOn(BuildAccountSetupService, "buildFromSetupUrl");
jest.spyOn(BuildApiClientOptionsService, "buildFromAccount");
jest.spyOn(ConfigEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(SetupEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(PownedPasswordEvents, "listen").mockImplementation(jest.fn());

describe("Setup", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
    enableFetchMocks();
  });

  describe("Setup::attachEvents", () => {
    it("Should attach events", async() => {
      expect.assertions(8);
      // data mocked
      const port = {
        _port: {
          sender: {
            tab: {
              url: "https://passbolt.dev/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0"
            }
          }
        }
      };
      fetch.doMockOnceIf(new RegExp('/users/csrf-token.json'), async() => mockApiResponse("csrf-token"));
      // process
      await Setup.attachEvents(port);
      // expectations
      expect(BuildAccountSetupService.buildFromSetupUrl).toHaveBeenCalledWith(port._port.sender.tab.url);
      expect(BuildApiClientOptionsService.buildFromAccount).toHaveBeenCalled();
      expect(ConfigEvents.listen).toHaveBeenCalled();
      expect(SetupEvents.listen).toHaveBeenCalled();
      expect(PownedPasswordEvents.listen).toHaveBeenCalled();
      expect(Setup.events).toStrictEqual([ConfigEvents, SetupEvents, PownedPasswordEvents]);
      expect(Setup.mustReloadOnExtensionUpdate).toBeFalsy();
      expect(Setup.appName).toBe('Setup');
    });
  });

  describe("Setup::canBeAttachedTo", () => {
    it("Should have the canBeAttachedTo not valid", async() => {
      expect.assertions(1);
      // process
      const canBeAttachedTo = await Setup.canBeAttachedTo({});
      // expectations
      expect(canBeAttachedTo).toBeFalsy();
    });
  });
});
