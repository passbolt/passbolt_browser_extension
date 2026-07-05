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

import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import PasskeyVaultService from "../../service/fido2/passkeyVaultService";
import Fido2PinService from "../../service/fido2/fido2PinService";
import Fido2AuthenticatorService from "../../service/fido2/fido2AuthenticatorService";
import Fido2CeremonyCoordinator from "../../service/fido2/fido2CeremonyCoordinator";
import ClientDataService, { CLIENT_DATA_TYPE_GET } from "../../service/fido2/clientDataService";
import WebauthnOriginValidationService from "../../service/fido2/webauthnOriginValidationService";
import Fido2Utils from "../../service/fido2/fido2Utils";
import Fido2ErrorReporter from "../../service/fido2/fido2ErrorReporter";

/**
 * Handles navigator.credentials.get() from a third-party website through the ceremony popup: the
 * user picks the account, optionally enters a PIN/passphrase, and the assertion is signed. Returns
 * null when there is no passkey for the site so the browser falls back to the platform authenticator.
 */
class Fido2GetController {
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
    this.authenticated = authenticated;
    this.getPassphraseService = new GetPassphraseService(account);
    this.pinService = new Fido2PinService(account);
    this.vaultService = new PasskeyVaultService(account, apiClientOptions, null);
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
      console.error("Fido2GetController error", error);
      await Fido2ErrorReporter.report(error, { context: "controller.get", extra: { origin } });
      this.worker.port.emit(this.requestId, "ERROR", this._serializeError(error));
    }
  }

  /**
   * @param {object} options
   * @param {string} origin
   * @returns {Promise<object|null>} the serialized assertion, or null to fall back to the platform
   */
  async exec(options, origin) {
    const rpId = WebauthnOriginValidationService.resolveRpId(options?.rpId, origin);

    // Not signed in: ask the user to sign in first instead of silently using the platform.
    if (!this.authenticated) {
      return this._runAuthRequiredCeremony(rpId, origin);
    }

    // Candidate resources for the site (metadata match, no decryption yet).
    const candidates = await this.vaultService.findResourcesForRpId(rpId);
    if (!candidates.length) {
      return null; // no passkey for this site -> platform authenticator
    }

    const pinRequired = await this.pinService.isPinSet();
    const cachedPassphrase = await PassphraseStorageService.get();
    const vaultLocked = !cachedPassphrase;

    // The relying party may narrow the request to specific credentials (e.g. after the user typed a
    // username, webauthn.io sends only that user's credential ids in allowCredentials). Only offer the
    // matching passkey(s) then — not every account we hold for the site.
    const allowedIds = (options?.allowCredentials || []).map((descriptor) => descriptor?.id).filter(Boolean);

    // With the vault unlocked we can read the real passkeys (their actual user name) and honour
    // allowCredentials before showing the chooser. Locked, we list the resource metadata and let the
    // allowCredentials filter apply after unlock (in _selectPasskey).
    let offered;
    if (cachedPassphrase) {
      let entries = await this.vaultService.findPasskeysForRpId(rpId, cachedPassphrase);
      if (allowedIds.length) {
        entries = entries.filter((entry) => allowedIds.includes(entry.passkey.credential_id));
      }
      if (!entries.length) {
        return null; // the requested credential is not in the vault -> platform authenticator
      }
      const byResource = new Map();
      for (const entry of entries) {
        if (!byResource.has(entry.resource.id)) {
          byResource.set(entry.resource.id, {
            credentialId: entry.resource.id, // the popup returns the chosen resource id
            userName: entry.passkey.user_name || entry.resource.metadata?.username || rpId,
            resourceName: entry.resource.metadata?.name || rpId,
          });
        }
      }
      offered = [...byResource.values()];
    } else {
      offered = candidates.map((resource) => ({
        credentialId: resource.id, // the popup returns the chosen resource id
        userName: resource.metadata?.username || rpId,
        resourceName: resource.metadata?.name || rpId,
      }));
    }

    const popupContext = {
      mode: "get",
      rpId,
      origin,
      vaultLocked,
      pinRequired,
      // A single account lets the popup skip the chooser and go straight in.
      autoSelect: offered.length === 1,
      passkeys: offered,
    };

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
        mode: "get",
        popup: popupContext,
        validate,
        tabId: this.worker.tab?.id,
      });
    } catch (error) {
      if (error?.name === "__fallback__") {
        return null;
      }
      throw error;
    }

    const passphrase = await PassphraseStorageService.get();

    const resource = candidates.find((candidate) => candidate.id === choice.credentialId);
    if (!resource) {
      return null;
    }

    const passkey = await this._selectPasskey(rpId, resource, passphrase, options?.allowCredentials);
    if (!passkey) {
      return null;
    }

    const clientDataJson = ClientDataService.build({
      type: CLIENT_DATA_TYPE_GET,
      challenge: options.challenge,
      origin,
    });
    const clientDataHash = await ClientDataService.hash(clientDataJson);

    const assertion = await Fido2AuthenticatorService.getAssertion({
      rpId,
      privateKeyPkcs8: passkey.private_key,
      clientDataHash,
      signCount: passkey.counter ?? 0,
    });

    return {
      id: passkey.credential_id,
      rawId: passkey.credential_id,
      type: "public-key",
      authenticatorAttachment: "platform",
      clientExtensionResults: {},
      response: {
        clientDataJSON: Fido2Utils.toBase64Url(clientDataJson),
        authenticatorData: Fido2Utils.toBase64Url(assertion.authenticatorData),
        signature: Fido2Utils.toBase64Url(assertion.signature),
        userHandle: passkey.user_handle || null,
      },
    };
  }

  /**
   * Whether the vault holds at least one passkey for the site (metadata match only, no decryption).
   * Used by conditional mediation (autofill) to decide whether to offer our passkeys inline before
   * bothering the user with any UI.
   * @param {object} options the serialized request options
   * @param {string} origin the caller origin
   * @returns {Promise<boolean>}
   */
  async hasCandidates(options, origin) {
    try {
      const rpId = WebauthnOriginValidationService.resolveRpId(options?.rpId, origin);
      const candidates = await this.vaultService.findResourcesForRpId(rpId);
      return candidates.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Decrypt the chosen resource and pick a passkey (respecting allowCredentials when provided).
   * @param {string} rpId
   * @param {object} resource
   * @param {string} passphrase
   * @param {Array|undefined} allowCredentials
   * @returns {Promise<object|null>}
   * @private
   */
  async _selectPasskey(rpId, resource, passphrase, allowCredentials) {
    const found = await this.vaultService.findPasskeysForRpId(rpId, passphrase);
    const passkeys = found.filter((entry) => entry.resource.id === resource.id).map((entry) => entry.passkey);
    if (!passkeys.length) {
      return null;
    }
    const allowedIds = (allowCredentials || []).map((descriptor) => descriptor?.id).filter(Boolean);
    if (allowedIds.length) {
      return passkeys.find((passkey) => allowedIds.includes(passkey.credential_id)) || null;
    }
    return passkeys[0];
  }

  /**
   * Open the ceremony popup in "sign in required" mode (account configured but not signed in) and
   * defer to the platform authenticator afterwards (we cannot decrypt a passkey without an unlocked
   * vault / signed-in account).
   * @param {string} rpId
   * @param {string} origin
   * @returns {Promise<null>}
   * @private
   */
  async _runAuthRequiredCeremony(rpId, origin) {
    const popup = { mode: "get", rpId, origin, authRequired: true, domain: this.account?.domain };
    try {
      await Fido2CeremonyCoordinator.runCeremony({ mode: "get", popup, tabId: this.worker.tab?.id });
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

export default Fido2GetController;
