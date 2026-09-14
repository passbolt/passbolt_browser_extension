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
import WebauthnSetupCeremonyController from "./webauthnSetupCeremonyController";
import { defaultWebauthnCredentialCreationOptionsDto } from "../../../background_page/model/entity/mfa/webauthnCredentialCreationOptionsEntity.test.data";
import { defaultWebauthnRegistrationResponseDto } from "../../../background_page/model/entity/mfa/webauthnRegistrationResponseEntity.test.data";

const RESULT_EVENT = "passbolt.app-bootstrap.webauthn-ceremony-result";
const CEREMONY_ID = "8e3874ae-4b40-590b-968a-418f704b9d9a";
const AAGUID = "fbfc3007-154e-4ecc-8c0b-6e020557d7bd";

// rpIdHash (32) + flags (1) + signCount (4) + aaguid (16)
const authenticatorData = () => {
  const bytes = new Uint8Array(53);
  const aaguidBytes = AAGUID.replace(/-/g, "")
    .match(/.{2}/g)
    .map((hex) => parseInt(hex, 16));
  bytes.set(aaguidBytes, 37);
  return bytes.buffer;
};

const mockCredential = (data = {}) => ({
  toJSON: () => defaultWebauthnRegistrationResponseDto(),
  response: { getAuthenticatorData: () => authenticatorData() },
  ...data,
});

const domException = (name) => {
  const error = new Error(`${name} message`);
  error.name = name;
  return error;
};

const defineGlobal = (name, value) => Object.defineProperty(globalThis, name, { value, configurable: true });

describe("WebauthnSetupCeremonyController", () => {
  let controller, port, create, parseCreationOptionsFromJSON;
  const options = defaultWebauthnCredentialCreationOptionsDto();

  beforeEach(() => {
    port = { emit: jest.fn() };
    controller = new WebauthnSetupCeremonyController(port);
    create = jest.fn().mockResolvedValue(mockCredential());
    parseCreationOptionsFromJSON = jest.fn((json) => ({ parsed: json }));
    defineGlobal("location", { hostname: "passbolt.local" });
    defineGlobal("PublicKeyCredential", { parseCreationOptionsFromJSON });
    Object.defineProperty(globalThis.navigator, "credentials", { value: { create }, configurable: true });
  });

  describe("WebauthnSetupCeremonyController::run", () => {
    it("creates the credential and emits it with the aaguid", async () => {
      expect.assertions(4);

      await controller.run({ id: CEREMONY_ID, options });

      expect(parseCreationOptionsFromJSON).toHaveBeenCalledWith(options);
      expect(create).toHaveBeenCalledWith({ publicKey: { parsed: options }, signal: expect.any(AbortSignal) });
      expect(port.emit).toHaveBeenCalledWith(RESULT_EVENT, {
        id: CEREMONY_ID,
        status: "success",
        credential: defaultWebauthnRegistrationResponseDto(),
        aaguid: AAGUID,
      });
      expect(controller.pendingId).toBeNull();
    });

    it("emits a null aaguid when the authenticator data is truncated", async () => {
      expect.assertions(1);
      create.mockResolvedValue(mockCredential({ response: { getAuthenticatorData: () => new ArrayBuffer(37) } }));

      await controller.run({ id: CEREMONY_ID, options });

      expect(port.emit).toHaveBeenCalledWith(
        RESULT_EVENT,
        expect.objectContaining({ status: "success", aaguid: null }),
      );
    });

    it.each([
      ["NotAllowedError", "WebauthnCeremonyCancelledError"],
      ["InvalidStateError", "WebauthnAuthenticatorAlreadyRegisteredError"],
    ])("maps a %s exception to %s", async (domName, errorName) => {
      expect.assertions(1);
      create.mockRejectedValue(domException(domName));

      await controller.run({ id: CEREMONY_ID, options });

      expect(port.emit).toHaveBeenCalledWith(RESULT_EVENT, {
        id: CEREMONY_ID,
        status: "error",
        error: { name: errorName, message: expect.any(String) },
      });
    });

    it("maps any other exception to WebauthnCeremonyError carrying the original name and message", async () => {
      expect.assertions(1);
      create.mockRejectedValue(domException("SecurityError"));

      await controller.run({ id: CEREMONY_ID, options });

      expect(port.emit).toHaveBeenCalledWith(RESULT_EVENT, {
        id: CEREMONY_ID,
        status: "error",
        error: { name: "WebauthnCeremonyError", message: "SecurityError: SecurityError message" },
      });
    });

    it("refuses to run when the page hostname differs from the relying party id", async () => {
      expect.assertions(2);
      defineGlobal("location", { hostname: "evil.local" });

      await controller.run({ id: CEREMONY_ID, options });

      expect(create).not.toHaveBeenCalled();
      expect(port.emit).toHaveBeenCalledWith(RESULT_EVENT, {
        id: CEREMONY_ID,
        status: "error",
        error: {
          name: "WebauthnCeremonyError",
          message: 'The relying party id "passbolt.local" does not match the page origin.',
        },
      });
    });

    it("aborts a pending ceremony when a new one is run", async () => {
      expect.assertions(3);
      const signals = [];
      create.mockImplementation(({ signal }) => {
        signals.push(signal);
        return new Promise((resolve, reject) => {
          signal.addEventListener("abort", () => reject(domException("AbortError")));
          if (signals.length === 2) {
            resolve(mockCredential());
          }
        });
      });

      const first = controller.run({ id: CEREMONY_ID, options });
      const second = controller.run({ id: "1cbfca6f-ab36-4e13-a5b8-7c0a1b2c3d4e", options });
      await Promise.all([first, second]);

      expect(signals[0].aborted).toBe(true);
      expect(port.emit).toHaveBeenCalledTimes(1);
      expect(port.emit).toHaveBeenCalledWith(
        RESULT_EVENT,
        expect.objectContaining({ id: "1cbfca6f-ab36-4e13-a5b8-7c0a1b2c3d4e", status: "success" }),
      );
    });
  });

  describe("WebauthnSetupCeremonyController::abort", () => {
    it("aborts the pending ceremony with a matching id without reporting it", async () => {
      expect.assertions(2);
      create.mockImplementation(
        ({ signal }) =>
          new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(domException("AbortError")))),
      );

      const run = controller.run({ id: CEREMONY_ID, options });
      controller.abort({ id: CEREMONY_ID });
      await run;

      expect(port.emit).not.toHaveBeenCalled();
      expect(controller.abortController).toBeNull();
    });

    it("ignores an abort for another ceremony id", async () => {
      expect.assertions(1);
      let resolveCreate;
      create.mockImplementation(() => new Promise((resolve) => (resolveCreate = resolve)));

      const run = controller.run({ id: CEREMONY_ID, options });
      controller.abort({ id: "1cbfca6f-ab36-4e13-a5b8-7c0a1b2c3d4e" });
      expect(controller.abortController.signal.aborted).toBe(false);
      resolveCreate(mockCredential());
      await run;
    });
  });
});
