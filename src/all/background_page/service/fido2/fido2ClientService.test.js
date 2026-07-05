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
 * @since         5.13.0
 */

import Fido2ClientService from "./fido2ClientService";
import Fido2Utils from "./fido2Utils";

const decodeClientData = (base64url) => JSON.parse(new TextDecoder().decode(Fido2Utils.fromBase64Url(base64url)));

const defaultCreateOptions = (data = {}) => ({
  rp: { id: "example.com", name: "Example" },
  user: { id: "dXNlci1pZA", name: "burak@example.com", displayName: "Burak" },
  challenge: "Y2hhbGxlbmdl",
  pubKeyCredParams: [{ type: "public-key", alg: -7 }],
  ...data,
});

const buildService = (overrides = {}) => {
  const store = {
    saved: [],
    findByRpId: jest.fn(async () => []),
    save: jest.fn(async function (passkey) {
      this.saved.push(passkey);
    }),
    ...overrides.store,
  };
  const userConsentService = {
    requestCreateConsent: jest.fn(async () => ({ userVerified: true })),
    ...overrides.userConsentService,
  };
  return { service: new Fido2ClientService({ store, userConsentService }), store, userConsentService };
};

describe("Fido2ClientService", () => {
  describe("::createCredential", () => {
    it("creates, stores and returns a well-formed attestation credential", async () => {
      const { service, store } = buildService();
      const result = await service.createCredential(defaultCreateOptions(), "https://example.com");

      expect(result.type).toStrictEqual("public-key");
      expect(result.id).toStrictEqual(result.rawId);
      expect(typeof result.response.attestationObject).toStrictEqual("string");

      // clientDataJSON binds the ceremony type, challenge and origin
      const clientData = decodeClientData(result.response.clientDataJSON);
      expect(clientData.type).toStrictEqual("webauthn.create");
      expect(clientData.challenge).toStrictEqual("Y2hhbGxlbmdl");
      expect(clientData.origin).toStrictEqual("https://example.com");
      expect(clientData.crossOrigin).toStrictEqual(false);

      // the credential is persisted with the right relying party binding
      expect(store.save).toHaveBeenCalledTimes(1);
      const saved = store.saved[0];
      expect(saved.rp_id).toStrictEqual("example.com");
      expect(saved.credential_id).toStrictEqual(result.id);
      expect(saved.user_name).toStrictEqual("burak@example.com");
      expect(saved.algorithm).toStrictEqual(-7);
      expect(typeof saved.private_key).toStrictEqual("string");
      expect(saved.discoverable).toStrictEqual(true);
    });

    it("resolves the rpId against the origin (subdomain)", async () => {
      const { service, store } = buildService();
      await service.createCredential(defaultCreateOptions(), "https://app.example.com");
      expect(store.saved[0].rp_id).toStrictEqual("example.com");
    });

    it("rejects a cross-site rpId", async () => {
      const { service } = buildService();
      await expect(
        service.createCredential(defaultCreateOptions({ rp: { id: "evil.com" } }), "https://example.com"),
      ).rejects.toThrow();
    });

    it("throws NotSupportedError when ES256 is not offered", async () => {
      const { service } = buildService();
      await expect(
        service.createCredential(
          defaultCreateOptions({ pubKeyCredParams: [{ type: "public-key", alg: -257 }] }),
          "https://example.com",
        ),
      ).rejects.toMatchObject({ name: "NotSupportedError" });
    });

    it("throws InvalidStateError when an excluded credential already exists", async () => {
      const { service } = buildService({
        store: { findByRpId: jest.fn(async () => [{ credential_id: "existing-id" }]) },
      });
      await expect(
        service.createCredential(
          defaultCreateOptions({ excludeCredentials: [{ type: "public-key", id: "existing-id" }] }),
          "https://example.com",
        ),
      ).rejects.toMatchObject({ name: "InvalidStateError" });
    });

    it("throws NotAllowedError when the user denies consent", async () => {
      const { service } = buildService({
        userConsentService: { requestCreateConsent: jest.fn(async () => null) },
      });
      await expect(
        service.createCredential(defaultCreateOptions(), "https://example.com"),
      ).rejects.toMatchObject({ name: "NotAllowedError" });
    });
  });
});
