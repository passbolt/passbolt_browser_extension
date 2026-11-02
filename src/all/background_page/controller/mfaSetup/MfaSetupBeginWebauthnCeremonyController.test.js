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
import MfaSetupBeginWebauthnCeremonyController from "./MfaSetupBeginWebauthnCeremonyController";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";

describe("MfaSetupBeginWebauthnCeremonyController", () => {
  let controller, worker;
  const requestId = "b0f2c1a2-0c39-4b1d-9c3e-2f0a3b4c5d6e";

  beforeEach(() => {
    worker = { port: { emit: jest.fn() }, tab: { id: 1 } };
    controller = new MfaSetupBeginWebauthnCeremonyController(
      worker,
      requestId,
      defaultApiClientOptions(),
      new AccountEntity(defaultAccountDto()),
    );
  });

  describe("MfaSetupBeginWebauthnCeremonyController::_exec", () => {
    it("emits SUCCESS with the service result", async () => {
      expect.assertions(2);
      jest.spyOn(controller.webauthnSetupCeremonyService, "begin").mockResolvedValue(undefined);

      await controller._exec();

      expect(controller.webauthnSetupCeremonyService.begin).toHaveBeenCalledWith(1);
      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "SUCCESS", undefined);
    });

    it("emits ERROR with the service error", async () => {
      expect.assertions(1);
      const error = new Error("service failed");
      jest.spyOn(controller.webauthnSetupCeremonyService, "begin").mockRejectedValue(error);

      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "ERROR", error);
    });
  });
});
