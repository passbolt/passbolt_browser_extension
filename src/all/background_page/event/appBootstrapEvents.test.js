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
import { AppBootstrapEvents } from "./appBootstrapEvents";
import MfaSetupHandleWebauthnCeremonyResultController from "../controller/mfaSetup/MfaSetupHandleWebauthnCeremonyResultController";

describe("AppBootstrapEvents", () => {
  it("dispatches the webauthn ceremony result to its controller", async () => {
    expect.assertions(2);
    const listeners = {};
    const worker = { port: { on: jest.fn((name, callback) => (listeners[name] = callback)) }, tab: { id: 1 } };
    jest.spyOn(MfaSetupHandleWebauthnCeremonyResultController.prototype, "_exec").mockResolvedValue();
    const resultDto = { id: "8e3874ae-4b40-590b-968a-418f704b9d9a", status: "error", error: {} };

    AppBootstrapEvents.listen(worker);
    await listeners["passbolt.app-bootstrap.webauthn-ceremony-result"](resultDto);

    expect(worker.port.on).toHaveBeenCalledTimes(1);
    expect(MfaSetupHandleWebauthnCeremonyResultController.prototype._exec).toHaveBeenCalledWith(resultDto);
  });
});
