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
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import MfaSetupFinishWebauthnCeremonyController from "./MfaSetupFinishWebauthnCeremonyController";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";

describe("MfaSetupFinishWebauthnCeremonyController", () => {
  let controller, worker;
  const requestId = "b0f2c1a2-0c39-4b1d-9c3e-2f0a3b4c5d6e";

  beforeEach(() => {
    worker = { port: { emit: jest.fn() }, tab: { id: 1 } };
    controller = new MfaSetupFinishWebauthnCeremonyController(
      worker,
      requestId,
      defaultApiClientOptions(),
      new AccountEntity(defaultAccountDto()),
    );
  });

  describe("MfaSetupFinishWebauthnCeremonyController::_exec", () => {
    it("emits SUCCESS with the service result", async () => {
      expect.assertions(2);
      jest.spyOn(controller.webauthnSetupCeremonyService, "finish").mockResolvedValue({ verified: true });

      await controller._exec("My passkey");

      expect(controller.webauthnSetupCeremonyService.finish).toHaveBeenCalledWith(1, "My passkey");
      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "SUCCESS", { verified: true });
    });

    it("emits ERROR with the service error", async () => {
      expect.assertions(1);
      const error = new Error("service failed");
      jest.spyOn(controller.webauthnSetupCeremonyService, "finish").mockRejectedValue(error);

      await controller._exec("My passkey");

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "ERROR", error);
    });
  });
});
