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
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import PasskeyApiService from "../../service/api/passkey/passkeyApiService";
import PasskeyDataStorage from "../../service/indexedDB_storage/passkeyDataStorage";
import PasskeyKitService from "../../service/passkey/passkeyKitService";
import PasskeyPopupHandlerService from "../../service/passkey/passkeyPopupHandlerService";

/**
 * Enrols a security key for passkey login.
 *
 * WebAuthn can only run at the passbolt top-level origin (never in the extension app iframe), so the
 * ceremony runs in a popup at /passkey/setup which deposits the raw attestation onto the challenge
 * token. Here we open that popup, collect the attestation, build the passphrase kit (client half kept
 * locally, server half sent to the API) and finish. The account keeps being unlockable with the
 * passphrase too, so a lost key falls back to the passphrase.
 */
class PasskeyEnrollController {
  /**
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account The user account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.passkeyApiService = new PasskeyApiService(apiClientOptions);
    this.getPassphraseService = new GetPassphraseService(account);
    this.popupHandler = new PasskeyPopupHandlerService(account.domain, worker?.tab?.id);
  }

  /**
   * @param {string} [name] Optional friendly name for the passkey
   * @returns {Promise<void>}
   */
  async _exec(name) {
    try {
      const credential = await this.exec(name);
      this.worker.port.emit(this.requestId, "SUCCESS", credential);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * @param {string} [name] Optional friendly name for the passkey
   * @returns {Promise<Object>} the stored credential summary
   */
  async exec(name) {
    // Obtain the passphrase first (a native prompt while a popup is open is unreliable).
    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);

    // Run the ceremony at the passbolt top-level origin and collect the deposited attestation.
    const ceremonyUrl = `${this.account.domain}/passkey/setup`;
    const { token, mode } = await this.popupHandler.run(ceremonyUrl);
    const { credential } = await this.passkeyApiService.collect({ user_id: this.account.userId, token, mode });
    if (!credential || !credential.id) {
      throw new Error("The security key enrollment did not return a valid credential.");
    }

    // Build the kit and finish (store credential + server half), then keep the client half locally.
    const { clientPart, serverKitKey } = await PasskeyKitService.generateKit(passphrase, credential.id);
    const stored = await this.passkeyApiService.finishSetup({
      token: token,
      credential: credential,
      server_kit_key: serverKitKey,
      name: name?.trim() ? name.trim() : null,
    });
    await PasskeyDataStorage.save(clientPart);

    return stored;
  }
}

export default PasskeyEnrollController;
