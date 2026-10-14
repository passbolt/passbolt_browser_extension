/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.17.0
 */
import MfaSetupHandleWebauthnCeremonyResultController from "./MfaSetupHandleWebauthnCeremonyResultController";
import WebauthnSetupCeremonyService from "../../service/mfa/webauthnSetupCeremonyService";
import GetActiveAccountService from "../../service/account/getActiveAccountService";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(GetActiveAccountService, "get").mockResolvedValue(new AccountEntity(defaultAccountDto()));
});

describe("MfaSetupHandleWebauthnCeremonyResultController", () => {
  const resultDto = { id: "8e3874ae-4b40-590b-968a-418f704b9d9a", status: "error", error: { name: "x", message: "y" } };
  let controller;

  beforeEach(() => {
    controller = new MfaSetupHandleWebauthnCeremonyResultController({ port: { emit: jest.fn() }, tab: { id: 1 } });
  });

  describe("MfaSetupHandleWebauthnCeremonyResultController::_exec", () => {
    it("forwards the result to the ceremony service with the worker tab id", async () => {
      expect.assertions(1);
      jest.spyOn(WebauthnSetupCeremonyService.prototype, "handleResult").mockResolvedValue();

      await controller._exec(resultDto);

      expect(WebauthnSetupCeremonyService.prototype.handleResult).toHaveBeenCalledWith(1, resultDto);
    });

    it("logs and swallows service errors", async () => {
      expect.assertions(2);
      const error = new Error("service failed");
      jest.spyOn(WebauthnSetupCeremonyService.prototype, "handleResult").mockRejectedValue(error);

      await expect(controller._exec(resultDto)).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(error);
    });
  });
});
