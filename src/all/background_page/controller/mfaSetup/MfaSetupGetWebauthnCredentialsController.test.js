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
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";
import MfaSetupGetWebauthnCredentialsController from "./MfaSetupGetWebauthnCredentialsController";
import { defaultMfaWebauthnCredentialsDtos } from "../../model/entity/mfa/mfaWebauthnCredentialsCollection.test.data";
import { mockPassboltResponse } from "passbolt-styleguide/test/mocks/mockApiResponse";

describe("MfaSetupGetWebauthnCredentialsController", () => {
  let controller, worker;
  const requestId = "b0f2c1a2-0c39-4b1d-9c3e-2f0a3b4c5d6e";

  beforeEach(() => {
    worker = { port: { emit: jest.fn() } };
    controller = new MfaSetupGetWebauthnCredentialsController(worker, requestId, defaultApiClientOptions());
  });

  describe("MfaSetupGetWebauthnCredentialsController::_exec", () => {
    it("emits SUCCESS with the credentials dtos", async () => {
      expect.assertions(1);
      const dtos = defaultMfaWebauthnCredentialsDtos(2);
      jest.spyOn(controller.webauthnApiService, "findAll").mockResolvedValue(await mockPassboltResponse(dtos));

      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "SUCCESS", dtos);
    });

    it("emits ERROR with the service error", async () => {
      expect.assertions(1);
      const error = new Error("service failed");
      jest.spyOn(controller.webauthnApiService, "findAll").mockRejectedValue(error);

      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, "ERROR", error);
    });
  });

  describe("MfaSetupGetWebauthnCredentialsController::exec", () => {
    it("throws if the API returns an invalid credential", async () => {
      expect.assertions(1);
      const response = await mockPassboltResponse([{ id: "not-a-uuid" }]);

      jest.spyOn(controller.webauthnApiService, "findAll").mockResolvedValue(response);

      await expect(controller.exec()).rejects.toThrow(CollectionValidationError);
    });
  });
});
