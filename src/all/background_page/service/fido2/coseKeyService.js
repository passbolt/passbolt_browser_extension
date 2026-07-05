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

import CborEncoderService from "./cborEncoderService";

// COSE key common parameters (RFC 8152).
const COSE_KTY = 1;
const COSE_ALG = 3;
const COSE_CRV = -1;
const COSE_X = -2;
const COSE_Y = -3;

// COSE values.
const COSE_KTY_EC2 = 2;
export const COSE_ALG_ES256 = -7;
const COSE_CRV_P256 = 1;

/**
 * Builds COSE_Key structures for the FIDO2 authenticator emulation.
 * Only the EC2 / P-256 / ES256 credential public key is supported (the passkey default).
 */
class CoseKeyService {
  /**
   * Build a canonical CBOR-encoded COSE_Key for an EC2 P-256 (ES256) public key.
   * @param {Uint8Array} x the 32 byte affine X coordinate
   * @param {Uint8Array} y the 32 byte affine Y coordinate
   * @returns {Uint8Array} the CBOR encoded COSE key
   */
  static buildEs256PublicKey(x, y) {
    if (x.length !== 32 || y.length !== 32) {
      throw new Error("CoseKeyService: EC2 P-256 coordinates must be 32 bytes each.");
    }
    const map = new Map([
      [COSE_KTY, COSE_KTY_EC2],
      [COSE_ALG, COSE_ALG_ES256],
      [COSE_CRV, COSE_CRV_P256],
      [COSE_X, x],
      [COSE_Y, y],
    ]);
    return CborEncoderService.encode(map);
  }

  /**
   * Split a raw uncompressed EC point (0x04 || X || Y, 65 bytes) into its coordinates.
   * @param {Uint8Array} rawPublicKey
   * @returns {{x: Uint8Array, y: Uint8Array}}
   */
  static splitRawPublicKey(rawPublicKey) {
    if (rawPublicKey.length !== 65 || rawPublicKey[0] !== 0x04) {
      throw new Error("CoseKeyService: expected an uncompressed 65 byte EC point.");
    }
    return {
      x: rawPublicKey.slice(1, 33),
      y: rawPublicKey.slice(33, 65),
    };
  }
}

export default CoseKeyService;
