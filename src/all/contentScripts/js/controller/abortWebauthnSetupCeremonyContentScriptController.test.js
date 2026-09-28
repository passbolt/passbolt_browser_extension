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
import AbortWebauthnSetupCeremonyContentScriptController from "./abortWebauthnSetupCeremonyContentScriptController";
import WebauthnSetupCeremonyService from "../service/webauthnSetupCeremonyService";

const CEREMONY_ID = "8e3874ae-4b40-590b-968a-418f704b9d9a";

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(WebauthnSetupCeremonyService, "abort").mockImplementation(() => {});
});

describe("AbortWebauthnSetupCeremonyContentScriptController", () => {
  describe("::exec", () => {
    it("Should call for the webauthn setup ceremony service to abort the given ceremony.", async () => {
      expect.assertions(2);
      const controller = new AbortWebauthnSetupCeremonyContentScriptController();

      await controller.exec({ id: CEREMONY_ID });

      expect(WebauthnSetupCeremonyService.abort).toHaveBeenCalledTimes(1);
      expect(WebauthnSetupCeremonyService.abort).toHaveBeenCalledWith(CEREMONY_ID);
    });

    it("Should throw an error if the given id is not a valid uuid.", async () => {
      expect.assertions(2);
      const controller = new AbortWebauthnSetupCeremonyContentScriptController();

      await expect(() => controller.exec({ id: "test" })).rejects.toThrow();
      expect(WebauthnSetupCeremonyService.abort).not.toHaveBeenCalled();
    });
  });
});
