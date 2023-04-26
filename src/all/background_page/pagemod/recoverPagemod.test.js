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
import Recover from "./recoverPagemod";
import {RecoverEvents} from "../event/recoverEvents";
import BuildAccountRecoverService from "../service/recover/buildAccountRecoverService";
import {ConfigEvents} from "../event/configEvents";
import BuildApiClientOptionsService
  from "../service/account/buildApiClientOptionsService";
import {PownedPasswordEvents} from '../event/pownedPasswordEvents';
import {mockApiResponse} from "../../../../test/mocks/mockApiResponse";
import {enableFetchMocks} from "jest-fetch-mock";

jest.spyOn(BuildAccountRecoverService, "buildFromRecoverUrl");
jest.spyOn(BuildApiClientOptionsService, "buildFromAccount");
jest.spyOn(ConfigEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(RecoverEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(PownedPasswordEvents, "listen").mockImplementation(jest.fn());

describe("Recover", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
    enableFetchMocks();
  });

  describe("Recover::attachEvents", () => {
    it("Should attach events", async() => {
      expect.assertions(8);
      // data mocked
      const port = {
        _port: {
          sender: {
            tab: {
              url: "https://passbolt.dev/setup/recover/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0"
            }
          }
        }
      };
      fetch.doMockOnceIf(new RegExp('/users/csrf-token.json'), async() => mockApiResponse("csrf-token"));
      // process
      await Recover.attachEvents(port);
      // expectations
      expect(BuildAccountRecoverService.buildFromRecoverUrl).toHaveBeenCalledWith(port._port.sender.tab.url);
      expect(BuildApiClientOptionsService.buildFromAccount).toHaveBeenCalled();
      expect(ConfigEvents.listen).toHaveBeenCalled();
      expect(RecoverEvents.listen).toHaveBeenCalled();
      expect(PownedPasswordEvents.listen).toHaveBeenCalled();
      expect(Recover.events).toStrictEqual([ConfigEvents, RecoverEvents, PownedPasswordEvents]);
      expect(Recover.mustReloadOnExtensionUpdate).toBeFalsy();
      expect(Recover.appName).toBe('Recover');
    });
  });

  describe("Recover::canBeAttachedTo", () => {
    it("Should have the canBeAttachedTo not valid", async() => {
      expect.assertions(1);
      // process
      const canBeAttachedTo = await Recover.canBeAttachedTo({});
      // expectations
      expect(canBeAttachedTo).toBeFalsy();
    });
  });
});
