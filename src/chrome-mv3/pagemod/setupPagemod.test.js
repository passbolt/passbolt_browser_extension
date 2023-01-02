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
import {ConfigEvents} from "../../all/background_page/event/configEvents";
import {SetupEvents} from "../../all/background_page/event/setupEvents";
import BuildAccountApiClientOptionsService
  from "../../all/background_page/service/account/buildApiClientOptionsService";
import BuildAccountSetupService from "../../all/background_page/service/setup/buildAccountSetupService";

jest.spyOn(BuildAccountSetupService, "buildFromSetupUrl").mockImplementation(jest.fn());
jest.spyOn(BuildAccountApiClientOptionsService, "build").mockImplementation(jest.fn());
jest.spyOn(ConfigEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(SetupEvents, "listen").mockImplementation(jest.fn());

describe("Setup", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("Setup::attachEvents", () => {
    it("Should attach events", async() => {
      expect.assertions(6);
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
      await Setup.attachEvents(port);
      // expectations
      expect(BuildAccountSetupService.buildFromSetupUrl).toHaveBeenCalledWith(port._port.sender.tab.url);
      expect(BuildAccountApiClientOptionsService.build).toHaveBeenCalled();
      expect(ConfigEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined, undefined);
      expect(SetupEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined, undefined);
      expect(Setup.events).toStrictEqual([ConfigEvents, SetupEvents]);
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
