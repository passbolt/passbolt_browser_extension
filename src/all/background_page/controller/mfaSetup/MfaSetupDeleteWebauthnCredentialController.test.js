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
import MfaSetupDeleteWebauthnCredentialController from "./MfaSetupDeleteWebauthnCredentialController";

describe("MfaSetupDeleteWebauthnCredentialController", () => {
  let controller, worker;
  const requestId = "b0f2c1a2-0c39-4b1d-9c3e-2f0a3b4c5d6e";
  const id = "8e3874ae-4b40-590b-968a-418f704b9d9a";

  beforeEach(() => {
    worker = { port: { emit: jest.fn() } };
    controller = new MfaSetupDeleteWebauthnCredentialController(worker, requestId, defaultApiClientOptions());
  });

  describe("MfaSetupDeleteWebauthnCredentialController::_exec", () => {
    it("deletes the credential and emits SUCCESS", async () => {
      expect.assertions(2);
      jest.spyOn(controller.webauthnApiService, "delete").mockResolvedValue();

      await controller._exec(id);

      expect(controller.webauthnApiService.delete).toHaveBeenCalledWith(id);
      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "SUCCESS");
    });

    it("emits ERROR with the service error", async () => {
      expect.assertions(1);
      const error = new Error("service failed");
      jest.spyOn(controller.webauthnApiService, "delete").mockRejectedValue(error);

      await controller._exec(id);

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "ERROR", error);
    });
  });

  describe("MfaSetupDeleteWebauthnCredentialController::exec", () => {
    it("throws if the id is not a uuid", async () => {
      expect.assertions(1);
      await expect(controller.exec("not-a-uuid")).rejects.toThrow('The parameter "id" should be a UUID');
    });
  });
});
