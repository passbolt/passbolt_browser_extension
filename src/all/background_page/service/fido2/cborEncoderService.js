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

const MAJOR_UNSIGNED = 0;
const MAJOR_NEGATIVE = 1;
const MAJOR_BYTE_STRING = 2;
const MAJOR_TEXT_STRING = 3;
const MAJOR_ARRAY = 4;
const MAJOR_MAP = 5;
const MAJOR_SIMPLE = 7;

/**
 * Minimal, dependency-free CBOR (RFC 8949) encoder producing CTAP2 canonical output.
 *
 * Only the subset required to build a WebAuthn attestation object and COSE public keys is
 * supported: integers, byte strings, text strings, arrays, maps, booleans and null.
 *
 * JS -> CBOR type mapping:
 *  - number (integer)  -> unsigned/negative integer
 *  - Uint8Array        -> byte string
 *  - string            -> text string
 *  - Array             -> array
 *  - Map               -> map (keys re-ordered to CTAP2 canonical form)
 *  - boolean / null    -> simple value
 */
class CborEncoderService {
  /**
   * Encode a value to canonical CBOR bytes.
   * @param {number|Uint8Array|string|Array|Map|boolean|null} value
   * @returns {Uint8Array}
   */
  static encode(value) {
    if (typeof value === "number") {
      if (!Number.isInteger(value)) {
        throw new Error("CborEncoderService only supports integer numbers.");
      }
      return value >= 0
        ? CborEncoderService._encodeHead(MAJOR_UNSIGNED, value)
        : CborEncoderService._encodeHead(MAJOR_NEGATIVE, -value - 1);
    }
    if (value instanceof Uint8Array) {
      return Fido2Utils.concat(CborEncoderService._encodeHead(MAJOR_BYTE_STRING, value.length), value);
    }
    if (typeof value === "string") {
      const bytes = Fido2Utils.fromUtf8(value);
      return Fido2Utils.concat(CborEncoderService._encodeHead(MAJOR_TEXT_STRING, bytes.length), bytes);
    }
    if (Array.isArray(value)) {
      let result = CborEncoderService._encodeHead(MAJOR_ARRAY, value.length);
      for (const item of value) {
        result = Fido2Utils.concat(result, CborEncoderService.encode(item));
      }
      return result;
    }
    if (value instanceof Map) {
      return CborEncoderService._encodeMap(value);
    }
    if (typeof value === "boolean") {
      return new Uint8Array([(MAJOR_SIMPLE << 5) | (value ? 21 : 20)]);
    }
    if (value === null) {
      return new Uint8Array([(MAJOR_SIMPLE << 5) | 22]);
    }
    throw new Error("CborEncoderService: unsupported value type.");
  }

  /**
   * Encode a map with CTAP2 canonical key ordering (shorter encoded key first, then bytewise).
   * @param {Map} map
   * @returns {Uint8Array}
   * @private
   */
  static _encodeMap(map) {
    const entries = [];
    for (const [key, value] of map.entries()) {
      entries.push({
        keyBytes: CborEncoderService.encode(key),
        valueBytes: CborEncoderService.encode(value),
      });
    }
    entries.sort((a, b) => CborEncoderService._compareCanonical(a.keyBytes, b.keyBytes));

    let result = CborEncoderService._encodeHead(MAJOR_MAP, entries.length);
    for (const entry of entries) {
      result = Fido2Utils.concat(result, entry.keyBytes, entry.valueBytes);
    }
    return result;
  }

  /**
   * CTAP2 canonical comparison of two encoded map keys.
   * @param {Uint8Array} a
   * @param {Uint8Array} b
   * @returns {number}
   * @private
   */
  static _compareCanonical(a, b) {
    if (a.length !== b.length) {
      return a.length - b.length;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return a[i] - b[i];
      }
    }
    return 0;
  }

  /**
   * Encode the CBOR head (major type + argument) for a given unsigned argument.
   * @param {number} majorType
   * @param {number} argument
   * @returns {Uint8Array}
   * @private
   */
  static _encodeHead(majorType, argument) {
    const type = majorType << 5;
    if (argument < 24) {
      return new Uint8Array([type | argument]);
    }
    if (argument < 0x100) {
      return new Uint8Array([type | 24, argument]);
    }
    if (argument < 0x10000) {
      return new Uint8Array([type | 25, (argument >>> 8) & 0xff, argument & 0xff]);
    }
    if (argument < 0x100000000) {
      return new Uint8Array([
        type | 26,
        (argument >>> 24) & 0xff,
        (argument >>> 16) & 0xff,
        (argument >>> 8) & 0xff,
        argument & 0xff,
      ]);
    }
    // 64 bit argument (split into two 32 bit halves to stay within safe integer range).
    const high = Math.floor(argument / 0x100000000);
    const low = argument % 0x100000000;
    return new Uint8Array([
      type | 27,
      (high >>> 24) & 0xff,
      (high >>> 16) & 0xff,
      (high >>> 8) & 0xff,
      high & 0xff,
      (low >>> 24) & 0xff,
      (low >>> 16) & 0xff,
      (low >>> 8) & 0xff,
      low & 0xff,
    ]);
  }
}

export default CborEncoderService;
