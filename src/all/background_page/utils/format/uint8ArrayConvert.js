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

  /**
   * Convert an array of 8-bit integers to a hex string
   * @param {Uint8Array} bytes - Array of 8-bit integers to convert
   * @returns {String} Hexadecimal representation of the array.
   */
  static toHex(bytes) {
    const result = [];
    const length = bytes.length;
    let index = 0;
    let character;
    while (index < length) {
      character = bytes[index++].toString(16);
      while (character.length < 2) {
        character = `0${character}`;
      }
      result.push(`${character}`);
    }
    return result.join('').toUpperCase();
  }
}

export default Uint8ArrayConvert;
