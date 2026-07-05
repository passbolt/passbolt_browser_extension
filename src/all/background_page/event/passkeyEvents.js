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
import PasskeyEnrollController from "../controller/passkey/passkeyEnrollController";
import PasskeyLoginController from "../controller/passkey/passkeyLoginController";
import PasskeyDataStorage from "../service/indexedDB_storage/passkeyDataStorage";
import PasskeyApiService from "../service/api/passkey/passkeyApiService";

/**
 * Listens to the passkey events. The WebAuthn ceremony itself runs in a top-level
 * passbolt-origin popup (never in the extension app iframe); the controllers open that popup, collect
 * the deposited credential and finish (kit crypto, GPGAuth). Every handler always responds on the
 * port so failures surface in the UI instead of hanging.
 *
 * @param {Worker} worker
 * @param {ApiClientOptions} apiClientOptions
 * @param {AccountEntity} account
 */
const listen = function (worker, apiClientOptions, account) {
  /*
   * Whether a passkey kit is stored locally for this profile (drives the login UI availability).
   *
   * @listens passbolt.passkey.has-local-kit
   */
  worker.port.on("passbolt.passkey.has-local-kit", async (requestId) => {
    try {
      worker.port.emit(requestId, "SUCCESS", await PasskeyDataStorage.hasAny());
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, "ERROR", error);
    }
  });

  /*
   * Run a passkey login (opens the top-level ceremony popup, then finishes + GPGAuth).
   *
   * @listens passbolt.passkey.login
   */
  worker.port.on("passbolt.passkey.login", async (requestId) => {
    await new PasskeyLoginController(worker, requestId, apiClientOptions, account)._exec();
  });

  /*
   * Run a passkey enrollment (opens the top-level ceremony popup, then builds the kit + finish).
   *
   * @listens passbolt.passkey.enroll
   */
  worker.port.on("passbolt.passkey.enroll", async (requestId, name) => {
    await new PasskeyEnrollController(worker, requestId, apiClientOptions, account)._exec(name);
  });

  /*
   * List the current user's enrolled passkey credentials (for the profile management screen).
   *
   * @listens passbolt.passkey.list-credentials
   */
  worker.port.on("passbolt.passkey.list-credentials", async (requestId) => {
    try {
      const body = await new PasskeyApiService(apiClientOptions).findAllCredentials();
      worker.port.emit(requestId, "SUCCESS", body?.credentials || []);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, "ERROR", error);
    }
  });

  /*
   * Delete one of the current user's enrolled passkey credentials.
   *
   * @listens passbolt.passkey.delete-credential
   */
  worker.port.on("passbolt.passkey.delete-credential", async (requestId, credentialId) => {
    try {
      await new PasskeyApiService(apiClientOptions).deleteCredential(credentialId);
      // Drop the matching local kit too (if this browser profile holds one for that credential), so a
      // deleted passkey stops counting towards the login availability.
      try {
        await PasskeyDataStorage.delete(credentialId);
      } catch {
        /* the server credential is gone; a missing local kit is not an error */
      }
      worker.port.emit(requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, "ERROR", error);
    }
  });

  /*
   * Whether passkey login is enabled for the organization (gates the login button + profile screen).
   *
   * @listens passbolt.passkey.is-org-enabled
   */
  worker.port.on("passbolt.passkey.is-org-enabled", async (requestId) => {
    try {
      worker.port.emit(requestId, "SUCCESS", await new PasskeyApiService(apiClientOptions).isOrganizationEnabled());
    } catch {
      // On any error assume enabled so a transient failure never hides a working feature.
      worker.port.emit(requestId, "SUCCESS", true);
    }
  });

  /*
   * Enable/disable passkey login for the organization (administrator only, server-enforced).
   *
   * @listens passbolt.passkey.set-org-enabled
   */
  worker.port.on("passbolt.passkey.set-org-enabled", async (requestId, enabled) => {
    try {
      const result = await new PasskeyApiService(apiClientOptions).setOrganizationEnabled(Boolean(enabled));
      worker.port.emit(requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, "ERROR", error);
    }
  });
};

export const PasskeyEvents = { listen };
