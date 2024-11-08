/*
 * This code is based on the OpenPGP.js library, licensed under the LGPL License.
 * https://github.com/openpgpjs/openpgpjs
 *
 * Copyright (c) OpenPGP.js Authors
 *
 * Modifications made by Passbolt SA.
 * - Regroup transformation methods into dedicated utility.
 *
 * @url https://github.com/openpgpjs/openpgpjs/blob/main/src/util.js
 */

/**
 * The class to convert Uint8Array.
 */
class Uint8ArrayConvert {
  /**
   * Convert a hex string to an array of 8-bit integers
   * @param {String} hex - A hex string to convert
   * @returns {Uint8Array} An array of 8-bit integers.
   */
  static fromHex(hex) {
    const result = new Uint8Array(hex.length >> 1);
    for (let k = 0; k < hex.length >> 1; k++) {
      result[k] = parseInt(hex.substr(k << 1, 2), 16);
    }
    return result;
  }
}

export default Uint8ArrayConvert;
