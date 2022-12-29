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
import {RecoverEvents} from "../../all/background_page/event/recoverEvents";
import BuildAccountRecoverService from "../../all/background_page/service/recover/buildAccountRecoverService";
import {ConfigEvents} from "../../all/background_page/event/configEvents";
import BuildAccountApiClientOptionsService
  from "../../all/background_page/service/account/buildApiClientOptionsService";

jest.spyOn(BuildAccountRecoverService, "buildFromRecoverUrl").mockImplementation(jest.fn());
jest.spyOn(BuildAccountApiClientOptionsService, "build").mockImplementation(jest.fn());
jest.spyOn(ConfigEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(RecoverEvents, "listen").mockImplementation(jest.fn());

describe("Recover", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("Recover::attachEvents", () => {
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
      await Recover.attachEvents(port);
      // expectations
      expect(BuildAccountRecoverService.buildFromRecoverUrl).toHaveBeenCalledWith(port._port.sender.tab.url);
      expect(BuildAccountApiClientOptionsService.build).toHaveBeenCalled();
      expect(ConfigEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined, undefined);
      expect(RecoverEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined, undefined);
      expect(Recover.events).toStrictEqual([ConfigEvents, RecoverEvents]);
      expect(Recover.appName).toBe('Recover');
    });
  });

  describe("Recover::isConstraintValidated", () => {
    it("Should have the constraint not valid", async() => {
      expect.assertions(1);
      // process
      const canBeAttachedTo = await Recover.canBeAttachedTo({});
      // expectations
      expect(canBeAttachedTo).toBeFalsy();
    });
  });
});
