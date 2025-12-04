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
 * @since         5.8.0
 */

import jsSHA from "jssha";

/**
 * Service to generate TOTP (Time-based One-Time Password) codes.
 * Implements RFC 6238 (TOTP) using RFC 4226 (HOTP) as the underlying algorithm.
 */
class TotpService {
  /**
   * Base32 alphabet for decoding secret keys
   * @type {string}
   */
  static BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

  /**
   * Generate a TOTP code from a TOTP configuration object.
   * @param {Object} totp - The TOTP configuration object
   * @param {string} totp.secret_key - The base32 encoded secret key
   * @param {string} [totp.algorithm="SHA1"] - The hash algorithm (SHA1, SHA256, SHA512)
   * @param {number} [totp.digits=6] - The number of digits in the OTP
   * @param {number} [totp.period=30] - The time step in seconds
   * @param {number} [timestamp] - Optional timestamp to use instead of current time
   * @returns {string} The generated TOTP code
   */
  static generate(totp, timestamp = null) {
    const secretKey = totp.secret_key;
    const algorithm = totp.algorithm || "SHA1";
    const digits = totp.digits || 6;
    const period = totp.period || 30;

    // Get current time step
    const time = timestamp !== null ? timestamp : Date.now();
    const counter = Math.floor(time / 1000 / period);

    // Decode base32 secret to bytes
    const secretBytes = TotpService.base32ToBytes(secretKey);

    // Generate HOTP with time-based counter
    return TotpService.generateHotp(secretBytes, counter, algorithm, digits);
  }

  /**
   * Generate HOTP (HMAC-based One-Time Password) code.
   * @param {Uint8Array} secretBytes - The secret key as bytes
   * @param {number} counter - The counter value
   * @param {string} algorithm - The hash algorithm
   * @param {number} digits - The number of digits
   * @returns {string} The generated OTP code
   * @private
   */
  static generateHotp(secretBytes, counter, algorithm, digits) {
    // Convert counter to 8-byte big-endian array
    const counterBytes = new Uint8Array(8);
    let temp = counter;
    for (let i = 7; i >= 0; i--) {
      counterBytes[i] = temp & 0xff;
      temp = Math.floor(temp / 256);
    }

    // Map algorithm names to jsSHA format
    const shaVariant = TotpService.getShaVariant(algorithm);

    // Create HMAC
    const shaObj = new jsSHA(shaVariant, "UINT8ARRAY");
    shaObj.setHMACKey(secretBytes, "UINT8ARRAY");
    shaObj.update(counterBytes);
    const hmac = shaObj.getHMAC("UINT8ARRAY");

    // Dynamic truncation (RFC 4226)
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    // Generate OTP
    const otp = binary % Math.pow(10, digits);

    // Pad with leading zeros if necessary
    return otp.toString().padStart(digits, "0");
  }

  /**
   * Convert jsSHA algorithm variant name.
   * @param {string} algorithm - Algorithm name (SHA1, SHA256, SHA512)
   * @returns {string} jsSHA variant name
   * @private
   */
  static getShaVariant(algorithm) {
    const variants = {
      "SHA1": "SHA-1",
      "SHA256": "SHA-256",
      "SHA512": "SHA-512"
    };
    return variants[algorithm.toUpperCase()] || "SHA-1";
  }

  /**
   * Decode a base32 string to bytes.
   * @param {string} base32 - The base32 encoded string
   * @returns {Uint8Array} The decoded bytes
   * @private
   */
  static base32ToBytes(base32) {
    // Remove any spaces and convert to uppercase
    const cleanedInput = base32.replace(/\s+/g, "").toUpperCase();

    // Remove padding
    const input = cleanedInput.replace(/=+$/, "");

    let bits = "";
    for (const char of input) {
      const index = TotpService.BASE32_ALPHABET.indexOf(char);
      if (index === -1) {
        throw new Error(`Invalid base32 character: ${char}`);
      }
      bits += index.toString(2).padStart(5, "0");
    }

    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
    }

    return bytes;
  }
}

export default TotpService;
