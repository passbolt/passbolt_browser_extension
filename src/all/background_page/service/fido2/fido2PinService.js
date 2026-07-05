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

import browser from "webextension-polyfill";
import Fido2Utils from "./fido2Utils";

const PBKDF2_ITERATIONS = 210000;

/**
 * Optional passkey PIN, configured by the user under Profile > "Passkey PIN".
 *
 * When set, the PIN takes the place of the master passphrase for passkey ceremonies (the same way
 * Windows Hello asks for its device PIN): the user's passphrase is encrypted with a key derived from
 * the PIN and stored locally (per account, per browser profile). Entering the PIN decrypts the
 * passphrase, which unlocks the OpenPGP private key needed to read/write the passkey. Without the PIN
 * the passkey cannot be used; when no PIN is set the user enters their master passphrase instead.
 *
 * The stored blob never contains the passphrase in the clear, and a wrong PIN simply fails to decrypt
 * (AES-GCM authentication), so there is no separate hash to verify.
 */
class Fido2PinService {
  /**
   * @param {AccountEntity} account
   */
  constructor(account) {
    this.storageKey = `fido2-passkey-pin-${account.userId || account.id || "default"}`;
  }

  /**
   * @returns {Promise<boolean>} whether a PIN is configured.
   */
  async isPinSet() {
    const record = await this._read();
    return Boolean(record?.ciphertext);
  }

  /**
   * Set (or replace) the PIN, sealing the current master passphrase under it.
   * @param {string} pin
   * @param {string} passphrase the master passphrase to seal (validated by the caller)
   * @returns {Promise<void>}
   */
  async setPin(pin, passphrase) {
    Fido2PinService._assertPin(pin);
    if (typeof passphrase !== "string" || passphrase.length === 0) {
      throw new Error("The passphrase is required to set a passkey PIN.");
    }
    const salt = Fido2Utils.randomBytes(16);
    const iv = Fido2Utils.randomBytes(12);
    const key = await Fido2PinService._deriveKey(pin, salt);
    const ciphertext = new Uint8Array(
      await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, Fido2Utils.fromUtf8(passphrase)),
    );
    await browser.storage.local.set({
      [this.storageKey]: {
        salt: Fido2Utils.toBase64Url(salt),
        iv: Fido2Utils.toBase64Url(iv),
        ciphertext: Fido2Utils.toBase64Url(ciphertext),
      },
    });
  }

  /**
   * Remove the PIN.
   * @returns {Promise<void>}
   */
  async clearPin() {
    await browser.storage.local.remove(this.storageKey);
  }

  /**
   * Decrypt and return the master passphrase sealed under the PIN.
   * @param {string} pin
   * @returns {Promise<string>} the master passphrase
   * @throws {Error} if no PIN is set or the PIN is incorrect
   */
  async unlockPassphrase(pin) {
    const record = await this._read();
    if (!record?.ciphertext) {
      throw new Error("No passkey PIN is set.");
    }
    if (typeof pin !== "string" || pin.length === 0) {
      throw new Error("The passkey PIN is incorrect.");
    }
    const salt = Fido2Utils.fromBase64Url(record.salt);
    const iv = Fido2Utils.fromBase64Url(record.iv);
    const ciphertext = Fido2Utils.fromBase64Url(record.ciphertext);
    const key = await Fido2PinService._deriveKey(pin, salt);
    let plaintext;
    try {
      plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    } catch {
      throw new Error("The passkey PIN is incorrect.");
    }
    return Fido2Utils.toUtf8(new Uint8Array(plaintext));
  }

  /**
   * Whether a PIN attempt is valid (decrypts the sealed passphrase).
   * @param {string} pin
   * @returns {Promise<boolean>}
   */
  async verifyPin(pin) {
    if (!(await this.isPinSet())) {
      return true; // no PIN configured -> nothing to verify
    }
    try {
      await this.unlockPassphrase(pin);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @returns {Promise<{salt: string, iv: string, ciphertext: string}|null>}
   * @private
   */
  async _read() {
    const stored = await browser.storage.local.get(this.storageKey);
    return stored?.[this.storageKey] || null;
  }

  /**
   * Derive an AES-GCM key from the PIN with PBKDF2.
   * @param {string} pin
   * @param {Uint8Array} salt
   * @returns {Promise<CryptoKey>}
   * @private
   */
  static async _deriveKey(pin, salt) {
    const baseKey = await crypto.subtle.importKey("raw", Fido2Utils.fromUtf8(pin), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
  }

  /**
   * @param {string} pin
   * @private
   */
  static _assertPin(pin) {
    if (typeof pin !== "string" || !/^\d{4,12}$/.test(pin)) {
      throw new Error("The PIN must be 4 to 12 digits.");
    }
  }
}

export default Fido2PinService;
