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
import WebauthnSetupCeremonyContentScriptService from "./webauthnSetupCeremonyContentScriptService";
import WebauthnCredentialCreationOptionsEntity from "../../../background_page/model/entity/mfa/webauthnCredentialCreationOptionsEntity";
import { defaultWebauthnCredentialCreationOptionsDto } from "../../../background_page/model/entity/mfa/webauthnCredentialCreationOptionsEntity.test.data";
import { defaultWebauthnRegistrationResponseDto } from "../../../background_page/model/entity/mfa/webauthnRegistrationResponseEntity.test.data";
import WebauthnCeremonyError from "../../../background_page/error/webauthnCeremonyError";
import WebauthnCeremonyCancelledError from "../../../background_page/error/webauthnCeremonyCancelledError";
import WebauthnAuthenticatorAlreadyRegisteredError from "../../../background_page/error/webauthnAuthenticatorAlreadyRegisteredError";
import WebauthnTLSCertificateError from "../../../background_page/error/webauthnTLSCertificateError";
import WebauthnAlreadyRunningCeremonyError from "../../../background_page/error/webauthnAlreadyRunningCeremonyError";
import WebauthnRelyingPartyIpAddressError from "passbolt-styleguide/src/shared/lib/Error/WebauthnRelyingPartyIpAddressError";

const CEREMONY_ID = "8e3874ae-4b40-590b-968a-418f704b9d9a";
const OTHER_CEREMONY_ID = "1cbfca6f-ab36-4e13-a5b8-7c0a1b2c3d4e";
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

beforeEach(() => {
  jest.clearAllMocks();
});

describe("WebauthnSetupCeremonyContentScriptService", () => {
  let create, parseCreationOptionsFromJSON;
  const options = new WebauthnCredentialCreationOptionsEntity(defaultWebauthnCredentialCreationOptionsDto());

  beforeEach(() => {
    // The service is a singleton, reset its state between tests.
    WebauthnSetupCeremonyContentScriptService.pendingId = null;
    WebauthnSetupCeremonyContentScriptService.abortController = null;
    create = jest.fn().mockResolvedValue(mockCredential());
    parseCreationOptionsFromJSON = jest.fn((json) => ({ parsed: json }));
    defineGlobal("location", { hostname: "passbolt.local" });
    defineGlobal("PublicKeyCredential", { parseCreationOptionsFromJSON });
    Object.defineProperty(globalThis.navigator, "credentials", { value: { create }, configurable: true });
  });

  describe("::run", () => {
    it("creates the credential and returns it with the aaguid.", async () => {
      expect.assertions(5);

      const result = await WebauthnSetupCeremonyContentScriptService.run(CEREMONY_ID, options);

      expect(parseCreationOptionsFromJSON).toHaveBeenCalledWith(options.toDto());
      expect(create).toHaveBeenCalledWith({ publicKey: { parsed: options.toDto() }, signal: expect.any(AbortSignal) });
      expect(result).toEqual({
        id: CEREMONY_ID,
        credential: defaultWebauthnRegistrationResponseDto(),
        aaguid: AAGUID,
      });
      expect(WebauthnSetupCeremonyContentScriptService.pendingId).toBeNull();
      expect(WebauthnSetupCeremonyContentScriptService.abortController).toBeNull();
    });

    it("throws a WebauthnCeremonyError if the page hostname differs from the relying party id.", async () => {
      expect.assertions(4);
      defineGlobal("location", { hostname: "evil.local" });

      try {
        await WebauthnSetupCeremonyContentScriptService.run(CEREMONY_ID, options);
      } catch (error) {
        expect(error).toBeInstanceOf(WebauthnCeremonyError);
        expect(error.message).toEqual('The relying party id "passbolt.local" does not match the page origin.');
        expect(error.ceremonyId).toEqual(CEREMONY_ID);
      }
      expect(create).not.toHaveBeenCalled();
    });

    it.each(["192.168.1.10", "[::1]"])(
      "throws a WebauthnRelyingPartyIpAddressError if the page is reached through the IP address %s.",
      async (hostname) => {
        expect.assertions(3);
        defineGlobal("location", { hostname });

        const promise = WebauthnSetupCeremonyContentScriptService.run(CEREMONY_ID, options);

        await expect(promise).rejects.toThrow(WebauthnRelyingPartyIpAddressError);
        await expect(promise).rejects.toHaveProperty("ceremonyId", CEREMONY_ID);
        expect(create).not.toHaveBeenCalled();
      },
    );

    it("throws the qualified error if the credential creation fails.", async () => {
      expect.assertions(3);
      const error = domException("NotAllowedError");
      create.mockRejectedValue(error);

      const promise = WebauthnSetupCeremonyContentScriptService.run(CEREMONY_ID, options);

      await expect(promise).rejects.toThrow(WebauthnCeremonyCancelledError);
      await expect(promise).rejects.toHaveProperty("ceremonyId", CEREMONY_ID);
      await expect(promise).rejects.toHaveProperty("cause", error);
    });

    it("aborts a pending ceremony when a new one is run.", async () => {
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

      const first = WebauthnSetupCeremonyContentScriptService.run(CEREMONY_ID, options);
      const second = WebauthnSetupCeremonyContentScriptService.run(OTHER_CEREMONY_ID, options);
      const [firstResult, secondResult] = await Promise.all([first, second]);

      expect(signals[0].aborted).toBe(true);
      expect(firstResult).toBeUndefined();
      expect(secondResult).toEqual(expect.objectContaining({ id: OTHER_CEREMONY_ID }));
    });
  });

  describe("::abort", () => {
    it("aborts the pending ceremony with a matching id.", async () => {
      expect.assertions(3);
      create.mockImplementation(
        ({ signal }) =>
          new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(domException("AbortError")))),
      );

      const run = WebauthnSetupCeremonyContentScriptService.run(CEREMONY_ID, options);
      const { signal } = WebauthnSetupCeremonyContentScriptService.abortController;
      WebauthnSetupCeremonyContentScriptService.abort(CEREMONY_ID);

      expect(signal.aborted).toBe(true);
      await expect(run).resolves.toBeUndefined();
      expect(WebauthnSetupCeremonyContentScriptService.abortController).toBeNull();
    });

    it("ignores an abort for another ceremony id.", async () => {
      expect.assertions(1);
      let resolveCreate;
      create.mockImplementation(() => new Promise((resolve) => (resolveCreate = resolve)));

      const run = WebauthnSetupCeremonyContentScriptService.run(CEREMONY_ID, options);
      WebauthnSetupCeremonyContentScriptService.abort(OTHER_CEREMONY_ID);

      expect(WebauthnSetupCeremonyContentScriptService.abortController.signal.aborted).toBe(false);
      resolveCreate(mockCredential());
      await run;
    });

    it("does nothing if no ceremony is pending.", () => {
      expect.assertions(1);
      expect(() => WebauthnSetupCeremonyContentScriptService.abort(CEREMONY_ID)).not.toThrow();
    });
  });

  describe("::getAaguid", () => {
    it("returns the aaguid read from the authenticator data.", () => {
      expect.assertions(1);
      expect(WebauthnSetupCeremonyContentScriptService.getAaguid(mockCredential())).toEqual(AAGUID);
    });

    it("returns null if the authenticator data is truncated.", () => {
      expect.assertions(1);
      const credential = mockCredential({ response: { getAuthenticatorData: () => new ArrayBuffer(37) } });
      expect(WebauthnSetupCeremonyContentScriptService.getAaguid(credential)).toBeNull();
    });
  });

  describe("::qualifyWebauthnCeremonyError", () => {
    it.each([
      ["NotAllowedError", WebauthnCeremonyCancelledError],
      ["InvalidStateError", WebauthnAuthenticatorAlreadyRegisteredError],
      ["SecurityError", WebauthnTLSCertificateError],
      ["ConstraintError", WebauthnAlreadyRunningCeremonyError],
    ])("maps a %s exception to %p.", (domName, expectedErrorClass) => {
      expect.assertions(3);
      const error = domException(domName);

      const result = WebauthnSetupCeremonyContentScriptService.qualifyWebauthnCeremonyError(CEREMONY_ID, error);

      expect(result).toBeInstanceOf(expectedErrorClass);
      expect(result.ceremonyId).toEqual(CEREMONY_ID);
      expect(result.cause).toBe(error);
    });

    it("keeps a WebauthnCeremonyError as is.", () => {
      expect.assertions(3);
      const error = new WebauthnCeremonyError("Something went wrong.");

      const result = WebauthnSetupCeremonyContentScriptService.qualifyWebauthnCeremonyError(CEREMONY_ID, error);

      expect(result).toBe(error);
      expect(result.ceremonyId).toEqual(CEREMONY_ID);
      expect(result.cause).toBeUndefined();
    });

    it("keeps a WebauthnRelyingPartyIpAddressError as is.", () => {
      expect.assertions(3);
      const error = new WebauthnRelyingPartyIpAddressError();

      const result = WebauthnSetupCeremonyContentScriptService.qualifyWebauthnCeremonyError(CEREMONY_ID, error);

      expect(result).toBe(error);
      expect(result.ceremonyId).toEqual(CEREMONY_ID);
      expect(result.cause).toBeUndefined();
    });

    it("maps any other exception to a WebauthnCeremonyError carrying the original name and message.", () => {
      expect.assertions(4);
      const error = domException("Error");

      const result = WebauthnSetupCeremonyContentScriptService.qualifyWebauthnCeremonyError(CEREMONY_ID, error);

      expect(result).toBeInstanceOf(WebauthnCeremonyError);
      expect(result.message).toEqual("Error: Error message");
      expect(result.ceremonyId).toEqual(CEREMONY_ID);
      expect(result.cause).toBe(error);
    });
  });
});
