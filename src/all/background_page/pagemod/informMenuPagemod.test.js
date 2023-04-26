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
import InformMenu from "./informMenuPagemod";
import {InformMenuEvents} from "../event/informMenuEvents";

jest.spyOn(InformMenuEvents, "listen").mockImplementation(jest.fn());

describe("InFormMenu", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("InformMenu::attachEvents", () => {
    it("Should attach events", async() => {
      expect.assertions(4);
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
      await InformMenu.attachEvents(port);
      // expectations
      expect(InformMenuEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: InformMenu.appName});
      expect(InformMenu.events).toStrictEqual([InformMenuEvents]);
      expect(InformMenu.mustReloadOnExtensionUpdate).toBeFalsy();
      expect(InformMenu.appName).toBe('InFormMenu');
    });
  });

  describe("InformMenu::canBeAttachedTo", () => {
    it("Should have the canBeAttachedTo not valid", async() => {
      expect.assertions(1);
      // process
      const canBeAttachedTo = await InformMenu.canBeAttachedTo({});
      // expectations
      expect(canBeAttachedTo).toBeFalsy();
    });
  });
});
