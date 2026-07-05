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
 * @since         5.14.0
 */
import { Buffer } from "buffer";
import PasskeyKitClientPartEntity from "../../model/entity/passkey/passkeyKitClientPartEntity";
import EncryptSsoPassphraseService from "../crypto/encryptSsoPassphraseService";
import DecryptSsoPassphraseService from "../crypto/decryptSsoPassphraseService";
import GenerateSsoIvService from "../crypto/generateSsoIvService";
import GenerateSsoKeyService from "../crypto/generateSsoKeyService";

/**
 * Builds and opens the passkey passphrase kit.
 *
 * The passphrase is encrypted in two AES-GCM rounds (exactly like the SSO kit): the first with a
 * non-extractable key (`nek`) that never leaves the device, the second with an extractable key
 * (`ek`). The client half (nek + ivs + ciphertext) is kept locally; the server half (the exported
 * `ek`) is sent to the API and released back only after a valid login assertion. Neither half alone
 * can recover the passphrase, so the server never holds anything able to decrypt it (zero-knowledge).
 *
 * The double-round crypto primitives are reused verbatim from the SSO implementation.
 */
class PasskeyKitService {
  /**
   * Generate a passphrase kit bound to a credential id.
   *
   * @param {string} passphrase The account passphrase to protect
   * @param {string} credentialId The base64url credential id the kit belongs to
   * @returns {Promise<{clientPart: PasskeyKitClientPartEntity, serverKitKey: string}>}
   *   the client half entity (to store locally) and the server half as base64(JWK) (to send to the API)
   */
  static async generateKit(passphrase, credentialId) {
    const nek = await GenerateSsoKeyService.generateSsoKey();
    const ek = await GenerateSsoKeyService.generateSsoKey(true);
    const iv1 = GenerateSsoIvService.generateIv();
    const iv2 = GenerateSsoIvService.generateIv();

    const secret = await EncryptSsoPassphraseService.encrypt(passphrase, nek, ek, iv1, iv2);
    const clientPart = new PasskeyKitClientPartEntity({ credential_id: credentialId, nek, iv1, iv2, secret });

    const exportedKey = await crypto.subtle.exportKey("jwk", ek);
    const serverKitKey = Buffer.from(JSON.stringify(exportedKey)).toString("base64");

    return { clientPart, serverKitKey };
  }

  /**
   * Recover the passphrase from a kit's two halves.
   *
   * @param {PasskeyKitClientPartEntity} clientPart The locally stored client half
   * @param {string} serverKitKey The server half (base64(JWK)) released by the API after a valid assertion
   * @returns {Promise<string>} the recovered passphrase
   */
  static async recoverPassphrase(clientPart, serverKitKey) {
    const jwk = JSON.parse(Buffer.from(serverKitKey, "base64").toString());
    const ek = await crypto.subtle.importKey("jwk", jwk, { name: "AES-GCM", length: 256 }, true, [
      "encrypt",
      "decrypt",
    ]);

    return DecryptSsoPassphraseService.decrypt(clientPart.secret, clientPart.nek, ek, clientPart.iv1, clientPart.iv2);
  }
}

export default PasskeyKitService;
