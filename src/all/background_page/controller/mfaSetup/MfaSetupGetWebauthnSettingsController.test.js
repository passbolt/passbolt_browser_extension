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
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import MfaSetupGetWebauthnSettingsController from "./MfaSetupGetWebauthnSettingsController";
import { defaultMfaWebauthnSettingsDto } from "../../model/entity/mfa/mfaWebauthnSettingsEntity.test.data";
import { mockPassboltResponse } from "passbolt-styleguide/test/mocks/mockApiResponse";

describe("MfaSetupGetWebauthnSettingsController", () => {
  let controller, worker;
  const requestId = "b0f2c1a2-0c39-4b1d-9c3e-2f0a3b4c5d6e";

  beforeEach(() => {
    worker = { port: { emit: jest.fn() } };
    controller = new MfaSetupGetWebauthnSettingsController(worker, requestId, defaultApiClientOptions());
  });

  describe("MfaSetupGetWebauthnSettingsController::exec", () => {
    it("returns a valid MfaWebauthnSettingsEntity", async () => {
      expect.assertions(1);
      const dto = defaultMfaWebauthnSettingsDto();
      jest.spyOn(controller.webauthnSettingsApiService, "find").mockImplementation(() => mockPassboltResponse(dto));

      const entity = await controller.exec();

      expect(entity.toDto()).toStrictEqual(dto);
    });

    it("let the error be thrown from the service and bubble up", async () => {
      expect.assertions(1);
      const error = new Error("service failed");
      jest.spyOn(controller.webauthnSettingsApiService, "find").mockRejectedValue(error);

      await expect(() => controller.exec()).rejects.toThrow(error);
    });

    it("throws if the API returns invalid settings", async () => {
      expect.assertions(1);
      jest
        .spyOn(controller.webauthnSettingsApiService, "find")
        .mockImplementation(() => mockPassboltResponse({ max_credentials_per_user: 0 }));

      await expect(controller.exec()).rejects.toThrow(EntityValidationError);
    });
  });
});
