/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.9.0
 */

class CryptoRandomValuesService {
  /**
   * Get a random value
   *
   * @param size {number}
   * @returns {Uint8Array}
   */
  static randomValuesArray(size) {
    const buf = new Uint8Array(size);
    self.crypto.getRandomValues(buf);
    return buf;
  }

  /**
   * Generate a random bits-length number as a hexadecimal string
   *
   * @param bits {number} The number of random bits to generate, an integer multiple of 8 between 8 and 65536.
   * @returns {string} A non-zero hexadecimal string of bits/4 characters, leading zeros preserved.
   * @throws {Error} If bits is not an integer multiple of 8 between 8 and 65536.
   */
  static randomHex(bits) {
    if (!Number.isInteger(bits) || bits % 8 !== 0 || bits < 8 || bits > 65536) {
      throw new Error("Number of bits must be an integer multiple of 8 between 8 and 65536.");
    }

    let bytes;
    do {
      bytes = this.randomValuesArray(bits / 8);
    } while (!bytes.some((byte) => byte !== 0)); // an all-zero secret is rejected
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
}

export default CryptoRandomValuesService;
