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
import BuildApiClientOptionsService
  from "../service/account/buildApiClientOptionsService";
import {AccountRecoveryEvents} from "../event/accountRecoveryEvents";
import AccountRecovery from "./accountRecoveryPagemod";
import GetRequestLocalAccountService
  from "../service/accountRecovery/getRequestLocalAccountService";

jest.spyOn(GetRequestLocalAccountService, "getAccountMatchingContinueUrl").mockImplementation(jest.fn());
jest.spyOn(BuildApiClientOptionsService, "buildFromAccount").mockImplementation(jest.fn());
jest.spyOn(AccountRecoveryEvents, "listen").mockImplementation(jest.fn());

describe("AccountRecovery", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("AccountRecovery::attachEvents", () => {
    it("Should attach events", async() => {
      expect.assertions(6);
      // data mocked
      const port = {
        _port: {
          sender: {
            tab: {
              url: "https://passbolt.dev/account-recovery/continue/d57c10f5-639d-5160-9c81-8a0c6c4ec856/cb66b7ca-bb85-4088-b0da-c50f6f0c2a13"
            }
          }
        }
      };
      // process
      await AccountRecovery.attachEvents(port);
      // expectations
      expect(GetRequestLocalAccountService.getAccountMatchingContinueUrl).toHaveBeenCalledWith(port._port.sender.tab.url);
      expect(BuildApiClientOptionsService.buildFromAccount).toHaveBeenCalled();
      expect(AccountRecoveryEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab}, undefined, undefined);
      expect(AccountRecovery.events).toStrictEqual([AccountRecoveryEvents]);
      expect(AccountRecovery.mustReloadOnExtensionUpdate).toBeFalsy();
      expect(AccountRecovery.appName).toBe('AccountRecovery');
    });

    it("Should not attach events", async() => {
      expect.assertions(3);
      // data mocked
      const port = {
        _port: {
          sender: {
            tab: {
              url: "https://passbolt.dev/account-recovery/continue/d57c10f5-639d-5160-9c81-8a0c6c4ec856/cb66b7ca-bb85-4088-b0da-c50f6f0c2a13"
            }
          }
        },
        disconnect: jest.fn()
      };
      jest.spyOn(GetRequestLocalAccountService, "getAccountMatchingContinueUrl").mockImplementation(() => { throw new Error("Error"); });
      // process
      await AccountRecovery.attachEvents(port);
      // expectations
      expect(GetRequestLocalAccountService.getAccountMatchingContinueUrl).toHaveBeenCalledWith(port._port.sender.tab.url);
      expect(AccountRecoveryEvents.listen).not.toHaveBeenCalled();
      expect(port.disconnect).toHaveBeenCalled();
    });
  });

  describe("AccountRecovery::canBeAttachedTo", () => {
    it("Should have the canBeAttachedTo not valid", async() => {
      expect.assertions(1);
      // process
      const canBeAttachedTo = await AccountRecovery.canBeAttachedTo({});
      // expectations
      expect(canBeAttachedTo).toBeFalsy();
    });
  });
});
