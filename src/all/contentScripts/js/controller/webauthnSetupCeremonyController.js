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
import WebauthnCeremonyCancelledError from "../../../background_page/error/webauthnCeremonyCancelledError";
import WebauthnAuthenticatorAlreadyRegisteredError from "../../../background_page/error/webauthnAuthenticatorAlreadyRegisteredError";
import WebauthnCeremonyError from "../../../background_page/error/webauthnCeremonyError";

const RESULT_EVENT = "passbolt.app-bootstrap.webauthn-ceremony-result";
// Authenticator data: rpIdHash (32) + flags (1) + signCount (4) + aaguid (16), https://www.w3.org/TR/webauthn-3/#sctn-attested-credential-data
const AAGUID_OFFSET = 37;
const AAGUID_LENGTH = 16;

/**
 * Runs navigator.credentials.create() on the relying party origin on behalf of the background page.
 */
class WebauthnSetupCeremonyController {
  /**
   * @param {Port} port
   */
  constructor(port) {
    this.port = port;
    this.pendingId = null;
    this.abortController = null;
  }

  /**
   * Run a ceremony and emit its result. A ceremony still pending is aborted first.
   * @param {{id: string, options: object}} dto creation options in PublicKeyCredentialCreationOptionsJSON form
   * @returns {Promise<void>}
   */
  async run({ id, options }) {
    this.abortController?.abort();
    const abortController = new AbortController();
    this.pendingId = id;
    this.abortController = abortController;
    try {
      if (location.hostname !== options?.rp?.id) {
        throw new WebauthnCeremonyError(`The relying party id "${options?.rp?.id}" does not match the page origin.`);
      }
      const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(options);
      const credential = await navigator.credentials.create({ publicKey, signal: abortController.signal });
      this.port.emit(RESULT_EVENT, {
        id,
        status: "success",
        credential: credential.toJSON(),
        aaguid: this.getAaguid(credential),
      });
    } catch (error) {
      if (abortController.signal.aborted) {
        return; // the background requested the abort and has already dropped the ceremony
      }
      this.port.emit(RESULT_EVENT, { id, status: "error", error: this.mapErrorToDto(error) });
    } finally {
      if (this.abortController === abortController) {
        this.pendingId = null;
        this.abortController = null;
      }
    }
  }

  /**
   * Abort the pending ceremony if it is the one requested.
   * @param {{id: string}} dto
   */
  abort({ id }) {
    if (this.pendingId === id) {
      this.abortController?.abort();
    }
  }

  /**
   * Read the authenticator aaguid from the attestation, null when the authenticator data is truncated.
   * @param {PublicKeyCredential} credential
   * @returns {string|null} dashed hex, uuid-like
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
   * @param {Error} error
   * @returns {{name: string, message: string}}
   */
  mapErrorToDto(error) {
    let typedError;
    switch (error.name) {
      case "NotAllowedError":
        typedError = new WebauthnCeremonyCancelledError();
        break;
      case "InvalidStateError":
        typedError = new WebauthnAuthenticatorAlreadyRegisteredError();
        break;
      case "WebauthnCeremonyError":
        typedError = error;
        break;
      default:
        typedError = new WebauthnCeremonyError(`${error.name}: ${error.message}`);
    }
    return { name: typedError.name, message: typedError.message };
  }
}

export default WebauthnSetupCeremonyController;
