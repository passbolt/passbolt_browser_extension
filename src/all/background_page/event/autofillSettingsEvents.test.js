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
 * @since         5.12.1
 */

import { AutofillSettingsEvents } from "./autofillSettingsEvents";
import AutofillSettingsService from "../service/autofill/autofillSettingsService";

/**
 * Build a worker whose port records the registered listeners so they can be invoked, and captures
 * everything emitted back.
 */
function mockWorker() {
  const listeners = {};
  const emitted = [];
  const worker = {
    port: {
      on: (name, handler) => {
        listeners[name] = handler;
      },
      emit: (...args) => emitted.push(args),
    },
  };
  return { worker, listeners, emitted };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AutofillSettingsEvents", () => {
  it("registers only the read (get) handler — no setter is exposed over the port", () => {
    const { worker, listeners } = mockWorker();

    AutofillSettingsEvents.listen(worker);

    expect(Object.keys(listeners)).toEqual(["passbolt.autofill-settings.get"]);
    expect(listeners["passbolt.autofill-settings.set"]).toBeUndefined();
  });

  describe("passbolt.autofill-settings.get", () => {
    it("emits SUCCESS with the persisted settings", async () => {
      const { worker, listeners, emitted } = mockWorker();
      jest.spyOn(AutofillSettingsService, "get").mockResolvedValue({ autofillOnLaunch: true });
      AutofillSettingsEvents.listen(worker);

      await listeners["passbolt.autofill-settings.get"]("req-1");

      expect(emitted).toEqual([["req-1", "SUCCESS", { autofillOnLaunch: true }]]);
    });

    it("emits a generic ERROR (no internal detail) when the read fails", async () => {
      const { worker, listeners, emitted } = mockWorker();
      jest.spyOn(AutofillSettingsService, "get").mockRejectedValue(new Error("storage exploded internally"));
      jest.spyOn(console, "error").mockImplementation(() => {});
      AutofillSettingsEvents.listen(worker);

      await listeners["passbolt.autofill-settings.get"]("req-1");

      expect(emitted).toHaveLength(1);
      expect(emitted[0][0]).toBe("req-1");
      expect(emitted[0][1]).toBe("ERROR");
      expect(emitted[0][2].message).toBe("Could not read the autofill settings.");
    });
  });
});
