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

export const CLIENT_DATA_TYPE_CREATE = "webauthn.create";
export const CLIENT_DATA_TYPE_GET = "webauthn.get";

/**
 * Builds the WebAuthn clientDataJSON structure that is bound into the ceremony signature.
 */
class ClientDataService {
  /**
   * Build the clientDataJSON bytes for a ceremony.
   * @param {object} params
   * @param {string} params.type CLIENT_DATA_TYPE_CREATE or CLIENT_DATA_TYPE_GET
   * @param {string} params.challenge the base64url encoded challenge (as received from the site)
   * @param {string} params.origin the caller origin
   * @param {boolean} [params.crossOrigin=false]
   * @returns {Uint8Array} the UTF-8 encoded clientDataJSON
   */
  static build({ type, challenge, origin, crossOrigin = false }) {
    if (type !== CLIENT_DATA_TYPE_CREATE && type !== CLIENT_DATA_TYPE_GET) {
      throw new Error("ClientDataService: unsupported client data type.");
    }
    const clientData = { type, challenge, origin, crossOrigin };
    return Fido2Utils.fromUtf8(JSON.stringify(clientData));
  }

  /**
   * Compute the SHA-256 hash of a clientDataJSON byte array.
   * @param {Uint8Array} clientDataJson
   * @returns {Promise<Uint8Array>}
   */
  static async hash(clientDataJson) {
    return Fido2Utils.sha256(clientDataJson);
  }
}

export default ClientDataService;
