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
import { WebauthnSetupCeremonyEvents } from "./webauthnSetupCeremonyEvents";
import WebauthnSetupCeremonyController from "../controller/webauthnSetupCeremonyController";

describe("WebauthnSetupCeremonyEvents", () => {
  let listeners, port;

  beforeEach(() => {
    jest.clearAllMocks();
    listeners = {};
    port = { on: jest.fn((name, callback) => (listeners[name] = callback)), emit: jest.fn() };
  });

  it("dispatches the run message to the controller", async () => {
    expect.assertions(1);
    jest.spyOn(WebauthnSetupCeremonyController.prototype, "run").mockResolvedValue();
    const dto = { id: "8e3874ae-4b40-590b-968a-418f704b9d9a", options: {} };

    WebauthnSetupCeremonyEvents.listen(port);
    await listeners["passbolt.app-bootstrap.run-webauthn-ceremony"](dto);

    expect(WebauthnSetupCeremonyController.prototype.run).toHaveBeenCalledWith(dto);
  });

  it("dispatches the abort message to the controller", () => {
    expect.assertions(1);
    jest.spyOn(WebauthnSetupCeremonyController.prototype, "abort").mockImplementation();
    const dto = { id: "8e3874ae-4b40-590b-968a-418f704b9d9a" };

    WebauthnSetupCeremonyEvents.listen(port);
    listeners["passbolt.app-bootstrap.abort-webauthn-ceremony"](dto);

    expect(WebauthnSetupCeremonyController.prototype.abort).toHaveBeenCalledWith(dto);
  });
});
