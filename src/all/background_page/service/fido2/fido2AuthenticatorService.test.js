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

import Fido2AuthenticatorService from "./fido2AuthenticatorService";
import Fido2Utils from "./fido2Utils";

const EC_KEY_PARAMS = { name: "ECDSA", namedCurve: "P-256" };
const EC_SIGN_PARAMS = { name: "ECDSA", hash: { name: "SHA-256" } };

/**
 * Convert an ASN.1 DER ECDSA signature back to the raw r||s form (32+32) WebCrypto verifies.
 */
const derToRaw = (der) => {
  let offset = 2; // 0x30, total-length
  const readInt = () => {
    if (der[offset] !== 0x02) {
      throw new Error("bad DER integer");
    }
    const len = der[offset + 1];
    let value = der.slice(offset + 2, offset + 2 + len);
    offset += 2 + len;
    // strip leading zero used for sign bit
    while (value.length > 32 && value[0] === 0x00) {
      value = value.slice(1);
    }
    // left pad to 32 bytes
    const padded = new Uint8Array(32);
    padded.set(value, 32 - value.length);
    return padded;
  };
  const r = readInt();
  const s = readInt();
  return Fido2Utils.concat(r, s);
};

describe("Fido2AuthenticatorService", () => {
  describe("::makeCredential", () => {
    it("assembles a well-formed authenticatorData and attestation object", async () => {
      const rpId = "example.com";
      const result = await Fido2AuthenticatorService.makeCredential({ rpId });

      const authData = result.authenticatorData;
      // rpIdHash
      const expectedRpIdHash = await Fido2Utils.sha256(Fido2Utils.fromUtf8(rpId));
      expect(Array.from(authData.slice(0, 32))).toStrictEqual(Array.from(expectedRpIdHash));

      // flags: UP|UV|BE|BS|AT = 0x5d
      expect(authData[32]).toStrictEqual(0x5d);

      // signCount = 0
      expect(Array.from(authData.slice(33, 37))).toStrictEqual([0, 0, 0, 0]);

      // AAGUID = "PASSBOLTPASSKEYS"
      expect(Array.from(authData.slice(37, 53))).toStrictEqual([
        0x50, 0x41, 0x53, 0x53, 0x42, 0x4f, 0x4c, 0x54, 0x50, 0x41, 0x53, 0x53, 0x4b, 0x45, 0x59, 0x53,
      ]);

      // credential id length + value
      const credIdLen = (authData[53] << 8) | authData[54];
      expect(credIdLen).toStrictEqual(result.credentialId.length);
      expect(Array.from(authData.slice(55, 55 + credIdLen))).toStrictEqual(Array.from(result.credentialId));

      // COSE key header {1:2, 3:-7, -1:1, -2:..., -3:...}
      const cose = authData.slice(55 + credIdLen);
      expect(Array.from(cose.slice(0, 10))).toStrictEqual([
        0xa5, 0x01, 0x02, 0x03, 0x26, 0x20, 0x01, 0x21, 0x58, 0x20,
      ]);

      // the COSE x/y coordinates match the exported raw public key
      const rawPublicKey = Fido2Utils.fromBase64Url(result.publicKeyRaw);
      const x = cose.slice(10, 42);
      const y = cose.slice(45, 77);
      expect(Array.from(x)).toStrictEqual(Array.from(rawPublicKey.slice(1, 33)));
      expect(Array.from(y)).toStrictEqual(Array.from(rawPublicKey.slice(33, 65)));

      // attestation object starts with a 3-entry map and the "fmt"/"none" text strings
      expect(result.attestationObject[0]).toStrictEqual(0xa3);
      expect(result.algorithm).toStrictEqual(-7);
    });

    it("throws without an rpId", async () => {
      await expect(Fido2AuthenticatorService.makeCredential({})).rejects.toThrow();
    });
  });

  describe("::getAssertion", () => {
    it("produces a signature that verifies against the credential public key", async () => {
      const rpId = "example.com";
      const created = await Fido2AuthenticatorService.makeCredential({ rpId });

      const clientDataHash = await Fido2Utils.sha256(Fido2Utils.fromUtf8('{"challenge":"abc"}'));
      const assertion = await Fido2AuthenticatorService.getAssertion({
        rpId,
        privateKeyPkcs8: created.privateKeyPkcs8,
        clientDataHash,
        signCount: created.signCount,
      });

      // Constant-zero signature counter (vault-synced authenticator; RPs skip the monotonic check).
      expect(assertion.signCount).toStrictEqual(0);
      const authCount = (assertion.authenticatorData[33] << 24) |
        (assertion.authenticatorData[34] << 16) |
        (assertion.authenticatorData[35] << 8) |
        assertion.authenticatorData[36];
      expect(authCount).toStrictEqual(0);

      // get flags UP|UV|BE|BS = 0x1d (no AT)
      expect(assertion.authenticatorData[32]).toStrictEqual(0x1d);

      // verify the signature end-to-end
      const publicKey = await crypto.subtle.importKey(
        "raw",
        Fido2Utils.fromBase64Url(created.publicKeyRaw),
        EC_KEY_PARAMS,
        false,
        ["verify"],
      );
      const signedData = Fido2Utils.concat(assertion.authenticatorData, clientDataHash);
      const rawSignature = derToRaw(assertion.signature);
      const verified = await crypto.subtle.verify(EC_SIGN_PARAMS, publicKey, rawSignature, signedData);
      expect(verified).toStrictEqual(true);
    });

    it("produces a signature that fails verification when the signed data is tampered", async () => {
      const rpId = "example.com";
      const created = await Fido2AuthenticatorService.makeCredential({ rpId });
      const clientDataHash = await Fido2Utils.sha256(Fido2Utils.fromUtf8('{"challenge":"abc"}'));
      const assertion = await Fido2AuthenticatorService.getAssertion({
        rpId,
        privateKeyPkcs8: created.privateKeyPkcs8,
        clientDataHash,
      });

      const publicKey = await crypto.subtle.importKey(
        "raw",
        Fido2Utils.fromBase64Url(created.publicKeyRaw),
        EC_KEY_PARAMS,
        false,
        ["verify"],
      );
      const tampered = await Fido2Utils.sha256(Fido2Utils.fromUtf8('{"challenge":"different"}'));
      const signedData = Fido2Utils.concat(assertion.authenticatorData, tampered);
      const rawSignature = derToRaw(assertion.signature);
      const verified = await crypto.subtle.verify(EC_SIGN_PARAMS, publicKey, rawSignature, signedData);
      expect(verified).toStrictEqual(false);
    });

    it("throws without required inputs", async () => {
      await expect(Fido2AuthenticatorService.getAssertion({ rpId: "example.com" })).rejects.toThrow();
    });
  });
});
