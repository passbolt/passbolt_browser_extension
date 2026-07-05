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

import Fido2Utils from "./fido2Utils";
import CborEncoderService from "./cborEncoderService";
import CoseKeyService, { COSE_ALG_ES256 } from "./coseKeyService";

/*
 * Passbolt passkey provider AAGUID. A stable, non-zero identifier so relying parties stop labelling
 * these credentials as a generic all-zero (e.g. "iCloud Keychain") authenticator. The bytes spell
 * "PASSBOLTPASSKEYS" (uuid 50415353-424f-4c54-5041-53534b455953). Note: the human-readable provider
 * name a relying party shows is derived from the FIDO Metadata Service, not the ceremony, so a fully
 * custom "Passbolt Passkeys" label would require registering this AAGUID with FIDO MDS.
 */
const AAGUID = new Uint8Array([
  0x50, 0x41, 0x53, 0x53, 0x42, 0x4f, 0x4c, 0x54, 0x50, 0x41, 0x53, 0x53, 0x4b, 0x45, 0x59, 0x53,
]);
const CREDENTIAL_ID_LENGTH = 32;

// authenticatorData flag bits (WebAuthn §6.1).
const FLAG_UP = 0x01; // User present
const FLAG_UV = 0x04; // User verified
const FLAG_BE = 0x08; // Backup eligible
const FLAG_BS = 0x10; // Backup state
const FLAG_AT = 0x40; // Attested credential data included

const EC_KEY_PARAMS = { name: "ECDSA", namedCurve: "P-256" };
const EC_SIGN_PARAMS = { name: "ECDSA", hash: { name: "SHA-256" } };

/**
 * Emulates a FIDO2 authenticator using WebCrypto. This is the security core of the passkey
 * provider: it generates credential key pairs, assembles authenticator data / attestation
 * objects, and signs assertions. It knows nothing about the browser messaging, the vault, or
 * consent UI — those live in the client/orchestration layer.
 *
 * Passbolt-backed passkeys are synchronised across devices, hence backup eligible + backed up.
 */
class Fido2AuthenticatorService {
  /**
   * Create a new credential (navigator.credentials.create authenticator step).
   *
   * @param {object} options
   * @param {string} options.rpId the relying party id (e.g. "example.com")
   * @param {boolean} [options.userPresent=true]
   * @param {boolean} [options.userVerified=true]
   * @returns {Promise<object>} {
   *   credentialId: Uint8Array,
   *   attestationObject: Uint8Array,
   *   authenticatorData: Uint8Array,
   *   publicKeyCose: Uint8Array,
   *   privateKeyPkcs8: string (base64url),
   *   publicKeyRaw: string (base64url),
   *   algorithm: number,
   *   signCount: number,
   * }
   */
  static async makeCredential(options) {
    if (!options?.rpId) {
      throw new Error("Fido2AuthenticatorService.makeCredential requires an rpId.");
    }
    const userPresent = options.userPresent !== false;
    const userVerified = options.userVerified !== false;

    const keyPair = await crypto.subtle.generateKey(EC_KEY_PARAMS, true, ["sign", "verify"]);
    const rawPublicKey = new Uint8Array(await crypto.subtle.exportKey("raw", keyPair.publicKey));
    const pkcs8PrivateKey = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keyPair.privateKey));

    const { x, y } = CoseKeyService.splitRawPublicKey(rawPublicKey);
    const publicKeyCose = CoseKeyService.buildEs256PublicKey(x, y);

    const credentialId = Fido2Utils.randomBytes(CREDENTIAL_ID_LENGTH);
    const signCount = 0;

    const attestedCredentialData = Fido2Utils.concat(
      AAGUID,
      Fido2Utils.uint16BE(credentialId.length),
      credentialId,
      publicKeyCose,
    );

    const authenticatorData = await Fido2AuthenticatorService._buildAuthenticatorData({
      rpId: options.rpId,
      flags: Fido2AuthenticatorService._flags({ userPresent, userVerified, attested: true }),
      signCount,
      attestedCredentialData,
    });

    const attestationObject = CborEncoderService.encode(
      new Map([
        ["fmt", "none"],
        ["attStmt", new Map()],
        ["authData", authenticatorData],
      ]),
    );

    return {
      credentialId,
      attestationObject,
      authenticatorData,
      publicKeyCose,
      privateKeyPkcs8: Fido2Utils.toBase64Url(pkcs8PrivateKey),
      publicKeyRaw: Fido2Utils.toBase64Url(rawPublicKey),
      algorithm: COSE_ALG_ES256,
      signCount,
    };
  }

  /**
   * Produce an assertion for an existing credential (navigator.credentials.get authenticator step).
   *
   * @param {object} options
   * @param {string} options.rpId the relying party id
   * @param {string} options.privateKeyPkcs8 the base64url PKCS8 private key
   * @param {Uint8Array} options.clientDataHash the SHA-256 hash of the clientDataJSON
   * @param {number} [options.signCount=0] the current signature counter
   * @param {boolean} [options.userPresent=true]
   * @param {boolean} [options.userVerified=true]
   * @returns {Promise<object>} { authenticatorData: Uint8Array, signature: Uint8Array, signCount: number }
   */
  static async getAssertion(options) {
    if (!options?.rpId || !options?.privateKeyPkcs8 || !options?.clientDataHash) {
      throw new Error("Fido2AuthenticatorService.getAssertion requires rpId, privateKeyPkcs8 and clientDataHash.");
    }
    const userPresent = options.userPresent !== false;
    const userVerified = options.userVerified !== false;
    // Constant zero signature counter: this is a vault-synced software authenticator with no reliable
    // per-device counter, so per the WebAuthn spec we keep it at zero and relying parties skip the
    // monotonic check (otherwise repeated assertions fail "signCount not greater than current").
    const signCount = 0;

    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      Fido2Utils.fromBase64Url(options.privateKeyPkcs8),
      EC_KEY_PARAMS,
      false,
      ["sign"],
    );

    const authenticatorData = await Fido2AuthenticatorService._buildAuthenticatorData({
      rpId: options.rpId,
      flags: Fido2AuthenticatorService._flags({ userPresent, userVerified, attested: false }),
      signCount,
    });

    const signedData = Fido2Utils.concat(authenticatorData, options.clientDataHash);
    const rawSignature = new Uint8Array(await crypto.subtle.sign(EC_SIGN_PARAMS, privateKey, signedData));
    const signature = Fido2Utils.rawEcdsaSignatureToAsn1(rawSignature);

    return { authenticatorData, signature, signCount };
  }

  /**
   * Assemble the authenticatorData byte structure.
   * @param {object} params
   * @param {string} params.rpId
   * @param {number} params.flags
   * @param {number} params.signCount
   * @param {Uint8Array} [params.attestedCredentialData]
   * @returns {Promise<Uint8Array>}
   * @private
   */
  static async _buildAuthenticatorData({ rpId, flags, signCount, attestedCredentialData }) {
    const rpIdHash = await Fido2Utils.sha256(Fido2Utils.fromUtf8(rpId));
    const parts = [rpIdHash, new Uint8Array([flags]), Fido2Utils.uint32BE(signCount)];
    if (attestedCredentialData) {
      parts.push(attestedCredentialData);
    }
    return Fido2Utils.concat(...parts);
  }

  /**
   * Compute the authenticatorData flags byte. Passbolt passkeys are always backup eligible + backed up.
   * @param {object} params
   * @param {boolean} params.userPresent
   * @param {boolean} params.userVerified
   * @param {boolean} params.attested
   * @returns {number}
   * @private
   */
  static _flags({ userPresent, userVerified, attested }) {
    let flags = FLAG_BE | FLAG_BS;
    if (userPresent) {
      flags |= FLAG_UP;
    }
    if (userVerified) {
      flags |= FLAG_UV;
    }
    if (attested) {
      flags |= FLAG_AT;
    }
    return flags;
  }
}

export default Fido2AuthenticatorService;
