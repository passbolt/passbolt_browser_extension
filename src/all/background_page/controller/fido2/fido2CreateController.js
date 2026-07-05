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

import i18n from "../../sdk/i18n";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import ProgressService from "../../service/progress/progressService";
import VerifyOrTrustMetadataKeyService from "../../service/metadata/verifyOrTrustMetadataKeyService";
import PasskeyVaultService from "../../service/fido2/passkeyVaultService";
import Fido2PinService from "../../service/fido2/fido2PinService";
import Fido2AuthenticatorService from "../../service/fido2/fido2AuthenticatorService";
import Fido2CeremonyCoordinator from "../../service/fido2/fido2CeremonyCoordinator";
import ClientDataService, { CLIENT_DATA_TYPE_CREATE } from "../../service/fido2/clientDataService";
import WebauthnOriginValidationService from "../../service/fido2/webauthnOriginValidationService";
import Fido2Utils from "../../service/fido2/fido2Utils";
import Fido2ErrorReporter from "../../service/fido2/fido2ErrorReporter";

/**
 * Handles navigator.credentials.create() from a third-party website through the SSO-style ceremony
 * popup: the user consents, optionally enters a PIN and passphrase, and chooses whether to create a
 * new item or attach the passkey to an existing resource.
 */
class Fido2CreateController {
  /**
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account
   * @param {boolean} [authenticated] whether the account currently has a usable signed-in session
   */
  constructor(worker, requestId, apiClientOptions, account, authenticated = true) {
    this.worker = worker;
    this.requestId = requestId;
    this.account = account;
    this.apiClientOptions = apiClientOptions;
    this.authenticated = authenticated;
    this.progressService = new ProgressService(this.worker, i18n.t("Creating passkey"));
    this.getPassphraseService = new GetPassphraseService(account);
    this.pinService = new Fido2PinService(account);
    this.verifyOrTrustMetadataKeyService = new VerifyOrTrustMetadataKeyService(worker, account, apiClientOptions);
    this.vaultService = new PasskeyVaultService(account, apiClientOptions, this.progressService);
  }

  /**
   * @param {object} options
   * @param {string} origin
   * @returns {Promise<void>}
   */
  async _exec(options, origin) {
    try {
      const result = await this.exec(options, origin);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error("Fido2CreateController error", error);
      await Fido2ErrorReporter.report(error, { context: "controller.create", extra: { origin } });
      this.worker.port.emit(this.requestId, "ERROR", this._serializeError(error));
    }
  }

  /**
   * @param {object} options
   * @param {string} origin
   * @returns {Promise<object|null>} the serialized credential, or null to fall back to the platform
   */
  async exec(options, origin) {
    const rpId = WebauthnOriginValidationService.resolveRpId(options?.rp?.id, origin);

    // Not signed in: open the popup and ask the user to sign in first (instead of silently going to
    // the platform authenticator). We cannot store a passkey without a session, so this defers.
    if (!this.authenticated) {
      return this._runAuthRequiredCeremony("create", rpId, origin);
    }

    const pinRequired = await this.pinService.isPinSet();
    const vaultLocked = !(await PassphraseStorageService.get());
    const resources = await this.vaultService.findResourcesForRpId(rpId);
    const popupContext = {
      mode: "create",
      rpId,
      origin,
      userName: options?.user?.name ?? null,
      vaultLocked,
      pinRequired,
      resources: resources.map((resource) => ({
        id: resource.id,
        name: resource.metadata?.name || rpId,
        username: resource.metadata?.username || "",
      })),
    };

    // Validate during the popup's submit so a wrong one is shown inline and the popup stays open for
    // a retry. When a PIN is set it stands in for the passphrase (it unlocks it); otherwise the
    // master passphrase is required directly.
    const validate = async (choice) => {
      if (pinRequired) {
        await this._unlockWithPin(choice.pin);
      } else {
        await this._validatePassphrase(choice.passphrase);
      }
    };

    let choice;
    try {
      choice = await Fido2CeremonyCoordinator.runCeremony({
        mode: "create",
        popup: popupContext,
        validate,
        tabId: this.worker.tab?.id,
      });
    } catch (error) {
      if (error?.name === "__fallback__") {
        return null; // user chose another method -> platform authenticator
      }
      throw error;
    }

    // The passphrase was already validated + cached by `validate`.
    const passphrase = await PassphraseStorageService.get();
    await this.verifyOrTrustMetadataKeyService.verifyTrustedOrTrustNewMetadataKey(passphrase);
    this.progressService.start(4, i18n.t("Creating passkey"));

    try {
      const credential = await Fido2AuthenticatorService.makeCredential({ rpId, userVerified: true });
      const passkey = {
        credential_id: Fido2Utils.toBase64Url(credential.credentialId),
        rp_id: rpId,
        user_handle: options?.user?.id ?? null,
        user_name: options?.user?.name || "Passbolt Passkey",
        user_display_name: options?.user?.displayName ?? null,
        private_key: credential.privateKeyPkcs8,
        public_key: credential.publicKeyRaw,
        algorithm: credential.algorithm,
        counter: credential.signCount,
        discoverable: true,
        created: new Date().toISOString(),
      };

      if (choice.resourceId) {
        await this.vaultService.attachPasskeyToResource(choice.resourceId, passkey, passphrase);
      } else {
        await this.vaultService.createResourceWithPasskey(passkey, rpId, passphrase);
      }

      const clientDataJson = ClientDataService.build({
        type: CLIENT_DATA_TYPE_CREATE,
        challenge: options.challenge,
        origin,
      });

      return {
        id: passkey.credential_id,
        rawId: passkey.credential_id,
        type: "public-key",
        authenticatorAttachment: "platform",
        clientExtensionResults: {},
        response: {
          clientDataJSON: Fido2Utils.toBase64Url(clientDataJson),
          attestationObject: Fido2Utils.toBase64Url(credential.attestationObject),
          transports: ["internal", "hybrid"],
          publicKeyAlgorithm: credential.algorithm,
        },
      };
    } finally {
      await this.progressService.close();
    }
  }

  /**
   * Open the ceremony popup in "sign in required" mode (account configured but not signed in). The
   * popup asks the user to sign in to Passbolt or to use another method; either way this defers to
   * the platform authenticator (we cannot store a passkey without a session).
   * @param {string} mode
   * @param {string} rpId
   * @param {string} origin
   * @returns {Promise<null>}
   * @private
   */
  async _runAuthRequiredCeremony(mode, rpId, origin) {
    const popup = { mode, rpId, origin, authRequired: true, domain: this.account?.domain };
    try {
      await Fido2CeremonyCoordinator.runCeremony({ mode, popup, tabId: this.worker.tab?.id });
    } catch {
      /* fallback / cancel / closed -> defer to the platform either way */
    }
    return null;
  }

  /**
   * Validate the passphrase (cached one wins), caching it on success. Throws a coded error the popup
   * turns into an inline "wrong passphrase" message.
   * @param {string|null} fromPopup
   * @returns {Promise<string>}
   * @private
   */
  async _validatePassphrase(fromPopup) {
    const cached = await PassphraseStorageService.get();
    if (cached) {
      return cached;
    }
    if (!fromPopup) {
      throw this._codedError("bad-passphrase", "Enter your Passbolt passphrase.");
    }
    try {
      await this.getPassphraseService.validatePassphrase(fromPopup);
    } catch {
      throw this._codedError("bad-passphrase", "The passphrase is incorrect.");
    }
    await PassphraseStorageService.set(fromPopup, -1);
    return fromPopup;
  }

  /**
   * Unlock + cache the master passphrase from the passkey PIN (the PIN stands in for the passphrase).
   * @param {string} pin
   * @returns {Promise<string>}
   * @private
   */
  async _unlockWithPin(pin) {
    let passphrase;
    try {
      passphrase = await this.pinService.unlockPassphrase(pin);
    } catch {
      throw this._codedError("bad-pin", "The passkey PIN is incorrect.");
    }
    await PassphraseStorageService.set(passphrase, -1);
    return passphrase;
  }

  /**
   * @param {string} code
   * @param {string} message
   * @returns {Error}
   * @private
   */
  _codedError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  /**
   * @param {Error} error
   * @returns {{name: string, message: string}}
   * @private
   */
  _serializeError(error) {
    const name = error?.name === "UserAbortsOperationError" ? "NotAllowedError" : error?.name || "UnknownError";
    return { name, message: error?.message || String(error) };
  }
}

export default Fido2CreateController;
