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

/**
 * Low level byte helpers shared by the FIDO2 authenticator emulation.
 * Kept dependency-free: only WebCrypto (crypto.subtle) and the standard atob/btoa.
 */
class Fido2Utils {
  /**
   * Encode a byte array to a base64url string (no padding).
   * @param {Uint8Array|ArrayBuffer} bytes
   * @returns {string}
   */
  static toBase64Url(bytes) {
    const arr = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
    let binary = "";
    for (let i = 0; i < arr.length; i++) {
      binary += String.fromCharCode(arr[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  /**
   * Decode a base64url (or standard base64) string into a byte array.
   * @param {string} value
   * @returns {Uint8Array}
   */
  static fromBase64Url(value) {
    let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Concatenate several byte arrays into a single one.
   * @param {...Uint8Array} arrays
   * @returns {Uint8Array}
   */
  static concat(...arrays) {
    let length = 0;
    for (const a of arrays) {
      length += a.length;
    }
    const result = new Uint8Array(length);
    let offset = 0;
    for (const a of arrays) {
      result.set(a, offset);
      offset += a.length;
    }
    return result;
  }

  /**
   * Encode a text string to its UTF-8 bytes.
   * @param {string} value
   * @returns {Uint8Array}
   */
  static fromUtf8(value) {
    return new TextEncoder().encode(value);
  }

  /**
   * Decode UTF-8 bytes back to a text string.
   * @param {Uint8Array} bytes
   * @returns {string}
   */
  static toUtf8(bytes) {
    return new TextDecoder().decode(bytes);
  }

  /**
   * SHA-256 digest of a byte array.
   * @param {Uint8Array} bytes
   * @returns {Promise<Uint8Array>}
   */
  static async sha256(bytes) {
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return new Uint8Array(digest);
  }

  /**
   * Cryptographically strong random bytes.
   * @param {number} length
   * @returns {Uint8Array}
   */
  static randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  /**
   * Encode an unsigned 16 bit integer as a big endian byte array.
   * @param {number} value
   * @returns {Uint8Array}
   */
  static uint16BE(value) {
    return new Uint8Array([(value >>> 8) & 0xff, value & 0xff]);
  }

  /**
   * Encode an unsigned 32 bit integer as a big endian byte array.
   * @param {number} value
   * @returns {Uint8Array}
   */
  static uint32BE(value) {
    return new Uint8Array([(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff]);
  }

  /**
   * Convert a raw ECDSA signature (r||s, IEEE P1363, as produced by WebCrypto) into the
   * ASN.1 DER encoding (SEQUENCE { r INTEGER, s INTEGER }) expected by WebAuthn / X.509.
   * @param {Uint8Array} rawSignature the concatenation of r and s (each half the length)
   * @returns {Uint8Array}
   */
  static rawEcdsaSignatureToAsn1(rawSignature) {
    const half = rawSignature.length / 2;
    const r = Fido2Utils._derEncodeInteger(rawSignature.slice(0, half));
    const s = Fido2Utils._derEncodeInteger(rawSignature.slice(half));
    const body = Fido2Utils.concat(r, s);
    return Fido2Utils.concat(new Uint8Array([0x30, body.length]), body);
  }

  /**
   * DER encode a single unsigned big-endian integer (as an ASN.1 INTEGER).
   * Strips superfluous leading zeros and prepends 0x00 when the high bit is set (to keep it positive).
   * @param {Uint8Array} bytes
   * @returns {Uint8Array}
   * @private
   */
  static _derEncodeInteger(bytes) {
    let start = 0;
    while (start < bytes.length - 1 && bytes[start] === 0x00) {
      start++;
    }
    let value = bytes.slice(start);
    if (value[0] & 0x80) {
      value = Fido2Utils.concat(new Uint8Array([0x00]), value);
    }
    return Fido2Utils.concat(new Uint8Array([0x02, value.length]), value);
  }
}

export default Fido2Utils;
