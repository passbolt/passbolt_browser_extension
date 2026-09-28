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
import RunWebauthnSetupCeremonyContentScriptController from "./runWebauthnSetupCeremonyContentScriptController";
import WebauthnSetupCeremonyContentScriptService from "../service/webauthnSetupCeremonyContentScriptService";
import WebauthnCredentialCreationOptionsEntity from "../../../background_page/model/entity/mfa/webauthnCredentialCreationOptionsEntity";
import { defaultWebauthnCredentialCreationOptionsDto } from "../../../background_page/model/entity/mfa/webauthnCredentialCreationOptionsEntity.test.data";

const CEREMONY_ID = "8e3874ae-4b40-590b-968a-418f704b9d9a";

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(WebauthnSetupCeremonyContentScriptService, "run").mockImplementation(async (id) => ({ id }));
});

describe("RunWebauthnSetupCeremonyContentScriptController", () => {
  describe("::exec", () => {
    it("Should call for the webauthn setup ceremony service to run the ceremony and return its result.", async () => {
      expect.assertions(4);
      const options = defaultWebauthnCredentialCreationOptionsDto();
      const controller = new RunWebauthnSetupCeremonyContentScriptController();

      const result = await controller.exec({ id: CEREMONY_ID, options });

      expect(WebauthnSetupCeremonyContentScriptService.run).toHaveBeenCalledTimes(1);
      expect(WebauthnSetupCeremonyContentScriptService.run).toHaveBeenCalledWith(
        CEREMONY_ID,
        expect.any(WebauthnCredentialCreationOptionsEntity),
      );
      expect(WebauthnSetupCeremonyContentScriptService.run.mock.calls[0][1].toDto()).toEqual(options);
      expect(result).toEqual({ id: CEREMONY_ID });
    });

    it("Should throw an error if the given id is not a valid uuid.", async () => {
      expect.assertions(2);
      const controller = new RunWebauthnSetupCeremonyContentScriptController();

      await expect(() =>
        controller.exec({ id: "test", options: defaultWebauthnCredentialCreationOptionsDto() }),
      ).rejects.toThrow();
      expect(WebauthnSetupCeremonyContentScriptService.run).not.toHaveBeenCalled();
    });

    it("Should throw an error if the given options is not an object.", async () => {
      expect.assertions(2);
      const controller = new RunWebauthnSetupCeremonyContentScriptController();

      await expect(() => controller.exec({ id: CEREMONY_ID, options: "test" })).rejects.toThrow(TypeError);
      expect(WebauthnSetupCeremonyContentScriptService.run).not.toHaveBeenCalled();
    });

    it("Should throw an error if the given options are not valid creation options.", async () => {
      expect.assertions(2);
      const controller = new RunWebauthnSetupCeremonyContentScriptController();

      await expect(() => controller.exec({ id: CEREMONY_ID, options: {} })).rejects.toThrow();
      expect(WebauthnSetupCeremonyContentScriptService.run).not.toHaveBeenCalled();
    });
  });
});
