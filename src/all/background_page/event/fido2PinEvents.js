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

import i18n from "../sdk/i18n";
import Fido2PinService from "../service/fido2/fido2PinService";
import PasskeyVaultService from "../service/fido2/passkeyVaultService";
import GetPassphraseService from "../service/passphrase/getPassphraseService";
import PassphraseStorageService from "../service/session_storage/passphraseStorageService";
import ProgressService from "../service/progress/progressService";

/**
 * Application events for the passkey provider settings + in-vault management:
 *  - the optional passkey PIN (Profile > "PIN for passkeys"),
 *  - listing / deleting passkeys stored inside a resource secret.
 *
 * @param {Worker} worker
 * @param {ApiClientOptions} apiClientOptions
 * @param {AccountEntity} account
 */
const listen = function (worker, apiClientOptions, account) {
  const pinService = new Fido2PinService(account);
  const getPassphraseService = new GetPassphraseService(account);

  worker.port.on("passbolt.fido2-pin.is-set", async (requestId) => {
    try {
      worker.port.emit(requestId, "SUCCESS", await pinService.isPinSet());
    } catch (error) {
      worker.port.emit(requestId, "ERROR", error);
    }
  });

  worker.port.on("passbolt.fido2-pin.set", async (requestId, pin) => {
    try {
      // Confirm the master passphrase and seal it under the PIN, so the PIN can later stand in for
      // the passphrase during passkey ceremonies.
      const passphrase = await getPassphraseService.requestPassphrase(worker);
      await pinService.setPin(pin, passphrase);
      worker.port.emit(requestId, "SUCCESS");
    } catch (error) {
      worker.port.emit(requestId, "ERROR", error);
    }
  });

  worker.port.on("passbolt.fido2-pin.clear", async (requestId) => {
    try {
      // Security gate: removing the passkey PIN requires confirming the master passphrase.
      await getPassphraseService.requestPassphrase(worker);
      await pinService.clearPin();
      worker.port.emit(requestId, "SUCCESS");
    } catch (error) {
      worker.port.emit(requestId, "ERROR", error);
    }
  });

  /*
   * List the passkeys stored in a resource (safe fields only; the private key never leaves the SW).
   * When `silent` is true the cached passphrase is used and no prompt is shown (used to decide, on
   * resource view, whether the resource has any passkey at all) — a locked vault yields an empty list.
   * @listens passbolt.fido2-passkey.list
   */
  worker.port.on("passbolt.fido2-passkey.list", async (requestId, resourceId, silent) => {
    try {
      const passphrase = silent
        ? await PassphraseStorageService.get()
        : await getPassphraseService.getPassphrase(worker);
      if (silent && !passphrase) {
        worker.port.emit(requestId, "SUCCESS", []);
        return;
      }
      const vault = new PasskeyVaultService(account, apiClientOptions, null);
      const passkeys = await vault.listPasskeysInResource(resourceId, passphrase);
      const safe = passkeys.map((passkey) => ({
        id: passkey.id || passkey.credential_id,
        credential_id: passkey.credential_id,
        rp_id: passkey.rp_id,
        user_name: passkey.user_name || null,
        user_display_name: passkey.user_display_name || null,
        created: passkey.created || null,
      }));
      worker.port.emit(requestId, "SUCCESS", safe);
    } catch (error) {
      worker.port.emit(requestId, "ERROR", error);
    }
  });

  /*
   * Confirm the master passphrase before a sensitive passkey action (e.g. removing a passkey from
   * the edit form). Always prompts, so deleting a passkey cannot happen without the master password.
   * @listens passbolt.fido2-passkey.confirm-passphrase
   */
  worker.port.on("passbolt.fido2-passkey.confirm-passphrase", async (requestId) => {
    try {
      await getPassphraseService.requestPassphrase(worker);
      worker.port.emit(requestId, "SUCCESS");
    } catch (error) {
      worker.port.emit(requestId, "ERROR", error);
    }
  });

  /*
   * Delete a single passkey from a resource, keeping the resource and its other secrets.
   * @listens passbolt.fido2-passkey.delete
   */
  worker.port.on("passbolt.fido2-passkey.delete", async (requestId, resourceId, credentialId) => {
    const progressService = new ProgressService(worker, i18n.t("Removing passkey"));
    try {
      const passphrase = await getPassphraseService.getPassphrase(worker);
      progressService.start(3, i18n.t("Removing passkey"));
      const vault = new PasskeyVaultService(account, apiClientOptions, progressService);
      await vault.removePasskeyFromResource(resourceId, credentialId, passphrase);
      worker.port.emit(requestId, "SUCCESS");
    } catch (error) {
      worker.port.emit(requestId, "ERROR", error);
    } finally {
      await progressService.close();
    }
  });
};

export const Fido2PinEvents = { listen };
