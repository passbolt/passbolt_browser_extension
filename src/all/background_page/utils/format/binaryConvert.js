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
 * @since         3.2.0
 */

/**
 * The class that deals with Passbolt to convert binary.
 */
class BinaryConvert {
  /**
   * Get string from binary
   * @param binary
   * @returns {string}
   */
  static fromBinary(binary) {
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const concatenateStringFromByte = (data, byte) => data + String.fromCharCode(byte);
    return new Uint16Array(bytes.buffer).reduce(concatenateStringFromByte, '');
  }

  /**
   * Convert a Unicode string to a string in which
   * each 16-bit unit occupies only one byte
   */
  static toBinary(string) {
    const codeUnits = new Uint16Array(string.length);
    for (let i = 0; i < codeUnits.length; i++) {
      codeUnits[i] = string.charCodeAt(i);
    }
    const concatenateStringFromByte = (data, byte) => data + String.fromCharCode(byte);
    return new Uint8Array(codeUnits.buffer).reduce(concatenateStringFromByte, '');
  }
}

export default BinaryConvert;
