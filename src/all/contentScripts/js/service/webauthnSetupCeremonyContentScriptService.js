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
import Validator from "validator";
import WebauthnAuthenticatorAlreadyRegisteredError from "../../../background_page/error/webauthnAuthenticatorAlreadyRegisteredError";
import WebauthnCeremonyCancelledError from "../../../background_page/error/webauthnCeremonyCancelledError";
import WebauthnCeremonyError from "../../../background_page/error/webauthnCeremonyError";
import WebauthnTLSCertificateError from "../../../background_page/error/webauthnTLSCertificateError";
import WebauthnAlreadyRunningCeremonyError from "../../../background_page/error/webauthnAlreadyRunningCeremonyError";
import WebauthnRelyingPartyIpAddressError from "passbolt-styleguide/src/shared/lib/Error/WebauthnRelyingPartyIpAddressError";

// Authenticator data: rpIdHash (32) + flags (1) + signCount (4) + aaguid (16), https://www.w3.org/TR/webauthn-3/#sctn-attested-credential-data
const AAGUID_OFFSET = 37;
const AAGUID_LENGTH = 16;

/**
 * Handles navigator.credentials.create() on the relying party origin on behalf of the background page.
 */
class WebauthnSetupCeremonyContentScriptService {
  /**
   * @constructor
   */
  constructor() {
    this.pendingId = null;
    this.abortController = null;
  }

  /**
   * Run a ceremony and emit its result. A ceremony still pending is aborted first.
   * @param {string} id creation options in PublicKeyCredentialCreationOptionsJSON form
   * @param {WebauthnCredentialCreationOptionsEntity} options creation options in PublicKeyCredentialCreationOptionsJSON form
   * @returns {Promise<object>}
   * @throws {WebauthnRelyingPartyIpAddressError} if the page is reached through an IP address
   * @throws {WebauthnCeremonyError} if the relying party id does not match the current page origin
   * @throws {Error} if something goes wrong and that the abort did already drop the ceremony
   */
  async run(id, options) {
    this.abortController?.abort();

    const abortController = new AbortController();
    this.abortController = abortController;

    this.pendingId = id;

    try {
      if (Validator.isIP(location.hostname.replace(/^\[(.*)\]$/, "$1"))) {
        throw new WebauthnRelyingPartyIpAddressError();
      }

      if (location.hostname !== options?.rp?.id) {
        throw new WebauthnCeremonyError(`The relying party id "${options?.rp?.id}" does not match the page origin.`);
      }

      const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(options.toDto());
      const credential = await navigator.credentials.create({ publicKey, signal: abortController.signal });

      return {
        id,
        credential: credential.toJSON(),
        aaguid: this.getAaguid(credential),
      };
    } catch (error) {
      // the background requested the abort and has not already dropped the ceremony
      if (!abortController.signal.aborted) {
        throw this.qualifyWebauthnCeremonyError(id, error);
      }
    } finally {
      if (this.abortController === abortController) {
        this.pendingId = null;
        this.abortController = null;
      }
    }
  }

  /**
   * Abort the pending ceremony if it is the one requested.
   * @param {string} id the webauthn ceremony id to abort
   */
  abort(id) {
    if (this.pendingId === id) {
      this.abortController?.abort();
    }
  }

  /**
   * Read the authenticator aaguid from the attestation, null when the authenticator data is truncated.
   * @param {PublicKeyCredential} credential
   * @returns {string|null} dashed hex, uuid-like
   * @private
   */
  getAaguid(credential) {
    const data = new Uint8Array(credential.response.getAuthenticatorData());
    if (data.length < AAGUID_OFFSET + AAGUID_LENGTH) {
      return null;
    }
    const hex = Array.from(data.subarray(AAGUID_OFFSET, AAGUID_OFFSET + AAGUID_LENGTH), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  /**
   * Map a ceremony exception to a typed error dto that crosses the port.
   * Exception names per https://www.w3.org/TR/webauthn-3/#sctn-createCredential
   * @param {string} ceremonyId
   * @param {Error} error
   * @returns {Error}
   * @private
   */
  qualifyWebauthnCeremonyError(ceremonyId, error) {
    let typedError;

    switch (error.name) {
      case "NotAllowedError":
        typedError = new WebauthnCeremonyCancelledError();
        break;
      case "InvalidStateError":
        typedError = new WebauthnAuthenticatorAlreadyRegisteredError();
        break;
      case "WebauthnCeremonyError":
      case "WebauthnRelyingPartyIpAddressError":
        typedError = error;
        break;
      case "SecurityError":
        typedError = new WebauthnTLSCertificateError();
        break;
      case "ConstraintError":
        typedError = new WebauthnAlreadyRunningCeremonyError();
        break;
      default:
        typedError = new WebauthnCeremonyError(`${error.name}: ${error.message}`);
    }

    typedError.ceremonyId = ceremonyId;
    // A passed-through error must not reference itself: the port serializes it with JSON.stringify.
    if (typedError !== error) {
      typedError.cause = error;
    }

    return typedError;
  }
}

export default new WebauthnSetupCeremonyContentScriptService();
