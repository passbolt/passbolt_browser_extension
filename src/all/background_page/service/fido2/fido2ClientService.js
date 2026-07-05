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
import Fido2AuthenticatorService from "./fido2AuthenticatorService";
import ClientDataService, { CLIENT_DATA_TYPE_CREATE } from "./clientDataService";
import WebauthnOriginValidationService from "./webauthnOriginValidationService";
import { COSE_ALG_ES256 } from "./coseKeyService";

/**
 * Build an error whose name matches the DOMException the site expects, so the page-script can
 * rethrow a faithful DOMException.
 * @param {string} name e.g. "NotAllowedError"
 * @param {string} message
 * @returns {Error}
 */
export const webauthnError = (name, message) => {
  const error = new Error(message);
  error.name = name;
  return error;
};

/**
 * Orchestrates a WebAuthn create ceremony on behalf of a third-party relying party. This is the
 * service-worker side of the passkey provider: it validates the request, obtains user consent and
 * verification, drives the authenticator core, and persists the credential through the injected
 * store. It is browser-messaging agnostic and fully unit testable via its injected collaborators.
 */
class Fido2ClientService {
  /**
   * @param {object} dependencies
   * @param {object} dependencies.store persistence for passkey credentials
   *   ({findByRpId(rpId): Promise<Array>, save(passkey): Promise<void>})
   * @param {object} dependencies.userConsentService consent + user verification
   *   ({requestCreateConsent(context): Promise<{userVerified: boolean}>})
   */
  constructor({ store, userConsentService }) {
    this.store = store;
    this.userConsentService = userConsentService;
  }

  /**
   * Handle navigator.credentials.create() for the given publicKey options and caller origin.
   *
   * @param {object} options the serialized PublicKeyCredentialCreationOptions
   *   (challenge/user/rp are already plain: challenge = base64url, user.id = base64url)
   * @param {string} origin the caller origin
   * @returns {Promise<object>} the serialized PublicKeyCredential (attestation)
   */
  async createCredential(options, origin) {
    const rpId = WebauthnOriginValidationService.resolveRpId(options?.rp?.id, origin);
    this._assertAlgorithmSupported(options?.pubKeyCredParams);
    await this._assertNotExcluded(rpId, options?.excludeCredentials);

    const consent = await this.userConsentService.requestCreateConsent({
      rpId,
      origin,
      userName: options?.user?.name ?? null,
      userDisplayName: options?.user?.displayName ?? null,
    });
    if (!consent) {
      throw webauthnError("NotAllowedError", "The passkey creation was not allowed by the user.");
    }

    const credential = await Fido2AuthenticatorService.makeCredential({
      rpId,
      userVerified: consent.userVerified !== false,
    });

    const clientDataJson = ClientDataService.build({
      type: CLIENT_DATA_TYPE_CREATE,
      challenge: options.challenge,
      origin,
    });

    await this.store.save(
      {
        credential_id: Fido2Utils.toBase64Url(credential.credentialId),
        rp_id: rpId,
        user_handle: options?.user?.id ?? null,
        user_name: options?.user?.name ?? null,
        user_display_name: options?.user?.displayName ?? null,
        private_key: credential.privateKeyPkcs8,
        public_key: credential.publicKeyRaw,
        algorithm: credential.algorithm,
        counter: credential.signCount,
        discoverable: true,
      },
      consent.passphrase,
    );

    return {
      id: Fido2Utils.toBase64Url(credential.credentialId),
      rawId: Fido2Utils.toBase64Url(credential.credentialId),
      type: "public-key",
      authenticatorAttachment: "platform",
      clientExtensionResults: {},
      response: {
        clientDataJSON: Fido2Utils.toBase64Url(clientDataJson),
        attestationObject: Fido2Utils.toBase64Url(credential.attestationObject),
        transports: ["internal", "hybrid"],
        publicKeyAlgorithm: credential.algorithm,
      },
    };
  }

  /**
   * Ensure the requested credential parameters include an algorithm we support (ES256).
   * @param {Array|undefined} pubKeyCredParams
   * @private
   */
  _assertAlgorithmSupported(pubKeyCredParams) {
    if (!Array.isArray(pubKeyCredParams) || pubKeyCredParams.length === 0) {
      // No preference expressed: we default to ES256.
      return;
    }
    const supported = pubKeyCredParams.some((param) => param?.alg === COSE_ALG_ES256);
    if (!supported) {
      throw webauthnError("NotSupportedError", "None of the requested credential algorithms are supported.");
    }
  }

  /**
   * Enforce excludeCredentials: if the relying party already has one of the listed credentials on
   * this authenticator, the ceremony must fail with InvalidStateError.
   * @param {string} rpId
   * @param {Array|undefined} excludeCredentials
   * @private
   */
  async _assertNotExcluded(rpId, excludeCredentials) {
    if (!Array.isArray(excludeCredentials) || excludeCredentials.length === 0) {
      return;
    }
    const existing = await this.store.findByRpId(rpId);
    const existingIds = new Set((existing ?? []).map((passkey) => passkey.credential_id));
    const collision = excludeCredentials.some((descriptor) => existingIds.has(descriptor?.id));
    if (collision) {
      throw webauthnError("InvalidStateError", "A credential already exists for this relying party.");
    }
  }
}

export default Fido2ClientService;
