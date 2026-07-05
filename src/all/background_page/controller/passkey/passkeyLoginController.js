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
import AuthVerifyLoginChallengeService from "../../service/auth/authVerifyLoginChallengeService";
import KeepSessionAliveService from "../../service/session_storage/keepSessionAliveService";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import PostLoginService from "../../service/auth/postLoginService";
import PasskeyApiService from "../../service/api/passkey/passkeyApiService";
import PasskeyDataStorage from "../../service/indexedDB_storage/passkeyDataStorage";
import PasskeyKitService from "../../service/passkey/passkeyKitService";
import PasskeyPopupHandlerService from "../../service/passkey/passkeyPopupHandlerService";

/**
 * Completes a passkey login.
 *
 * WebAuthn can only run at the passbolt top-level origin (never in the extension app iframe), so the
 * ceremony runs in a popup at /passkey/login which deposits the raw assertion onto the challenge
 * token. Here we open that popup, collect the assertion, finish it server-side (which releases the
 * server half of the kit), recover the passphrase locally and run the normal GPGAuth challenge.
 */
class PasskeyLoginController {
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
    this.authVerifyLoginChallengeService = new AuthVerifyLoginChallengeService(apiClientOptions);
    this.popupHandler = new PasskeyPopupHandlerService(account.domain, worker?.tab?.id);
  }

  /**
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      await this.exec();
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async exec() {
    // Run the ceremony at the passbolt top-level origin and collect the deposited assertion.
    const ceremonyUrl = `${this.account.domain}/passkey/login?user_id=${encodeURIComponent(this.account.userId)}`;
    const { token, mode } = await this.popupHandler.run(ceremonyUrl);
    const { credential } = await this.passkeyApiService.collect({ user_id: this.account.userId, token, mode });
    if (!credential || !credential.id) {
      throw new Error("The passkey login did not return a valid credential.");
    }

    // The client half of the kit is kept locally, keyed by the credential the authenticator used.
    const clientPart = await PasskeyDataStorage.get(credential.id);
    if (!clientPart) {
      throw new Error("No passkey kit is registered on this browser profile for this security key.");
    }

    // Verify the assertion server-side; on success the server releases its half of the kit.
    const { server_kit_key: serverKitKey } = await this.passkeyApiService.finishLogin({
      user_id: this.account.userId,
      token: token,
      credential: credential,
    });
    if (!serverKitKey) {
      throw new Error("The server did not release the passphrase kit.");
    }

    // Recover the passphrase locally (server never sees it), then run the normal GPGAuth challenge.
    const passphrase = await PasskeyKitService.recoverPassphrase(clientPart, serverKitKey);
    await this.authVerifyLoginChallengeService.verifyAndValidateLoginChallenge(
      this.account.userKeyFingerprint,
      this.account.userPrivateArmoredKey,
      passphrase,
    );

    await Promise.all([PassphraseStorageService.set(passphrase, -1), KeepSessionAliveService.start()]);
    await PostLoginService.exec();
  }
}

export default PasskeyLoginController;
