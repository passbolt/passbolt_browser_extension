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

import Fido2CreateController from "../controller/fido2/fido2CreateController";
import Fido2GetController from "../controller/fido2/fido2GetController";
import Fido2ErrorReporter from "../service/fido2/fido2ErrorReporter";
import GetActiveAccountService from "../service/account/getActiveAccountService";
import BuildApiClientOptionsService from "../service/account/buildApiClientOptionsService";

/**
 * Resolve the account + api client options for the passkey provider. Resolved lazily at request time.
 *  - authenticated: a fully usable, signed-in account (the ceremony can store/use passkeys).
 *  - not authenticated but an account IS configured: the ceremony popup still opens and asks the user
 *    to sign in first (instead of silently going to the platform authenticator).
 *  - no account configured at all: null -> the site falls back to the platform authenticator.
 * @returns {Promise<{account: AccountEntity, apiClientOptions: ApiClientOptions, authenticated: boolean}|null>}
 */
const resolveProviderContext = async () => {
  try {
    const account = await GetActiveAccountService.get({ role: true });
    const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
    return { account, apiClientOptions, authenticated: true };
  } catch {
    try {
      const account = await GetActiveAccountService.get();
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
      return { account, apiClientOptions, authenticated: false };
    } catch {
      return null;
    }
  }
};

/**
 * Listen to the passkey provider ceremony events emitted by the third-party site relay.
 *
 * The handlers are registered UNCONDITIONALLY (even when logged out): the MAIN-world page script
 * overrides navigator.credentials as soon as the content script attaches, so the service worker must
 * always answer — otherwise the relying party's create()/get() promise hangs forever. When the
 * provider is unavailable the handler resolves with null, which the page script reads as "fall back
 * to the platform authenticator".
 * @param {Worker} worker
 */
const listen = function (worker) {
  /*
   * Create a passkey on behalf of a third-party relying party.
   *
   * @listens passbolt.fido2.create
   * @param {uuid} requestId
   * @param {object} options the serialized PublicKeyCredentialCreationOptions
   * @param {string} origin the caller origin
   */
  worker.port.on("passbolt.fido2.create", async (requestId, options, origin) => {
    const providerContext = await resolveProviderContext();
    if (!providerContext) {
      worker.port.emit(requestId, "SUCCESS", null); // provider inactive -> platform fallback
      return;
    }
    const controller = new Fido2CreateController(
      worker,
      requestId,
      providerContext.apiClientOptions,
      providerContext.account,
      providerContext.authenticated,
    );
    await controller._exec(options, origin);
  });

  /*
   * Authenticate with a passkey on behalf of a third-party relying party.
   *
   * @listens passbolt.fido2.get
   * @param {uuid} requestId
   * @param {object} options the serialized PublicKeyCredentialRequestOptions
   * @param {string} origin the caller origin
   */
  worker.port.on("passbolt.fido2.get", async (requestId, options, origin) => {
    const providerContext = await resolveProviderContext();
    if (!providerContext) {
      worker.port.emit(requestId, "SUCCESS", null); // provider inactive -> platform fallback
      return;
    }
    const controller = new Fido2GetController(
      worker,
      requestId,
      providerContext.apiClientOptions,
      providerContext.account,
      providerContext.authenticated,
    );
    await controller._exec(options, origin);
  });

  /*
   * Tell the relay whether we hold any passkey for a site, so conditional mediation (autofill) can
   * decide whether to offer our passkeys inline. Cheap: metadata match only, no decryption/unlock.
   *
   * @listens passbolt.fido2.has-passkeys
   * @param {uuid} requestId
   * @param {object} options the serialized request options
   * @param {string} origin the caller origin
   */
  worker.port.on("passbolt.fido2.has-passkeys", async (requestId, options, origin) => {
    const providerContext = await resolveProviderContext();
    if (!providerContext) {
      worker.port.emit(requestId, "SUCCESS", false);
      return;
    }
    const controller = new Fido2GetController(
      worker,
      requestId,
      providerContext.apiClientOptions,
      providerContext.account,
      providerContext.authenticated,
    );
    const has = await controller.hasCandidates(options, origin);
    worker.port.emit(requestId, "SUCCESS", has);
  });

  /*
   * Forward errors caught in the page script / relay (content script contexts) to GlitchTip via the
   * service worker, which is not subject to the third-party page CSP. Temporary debugging aid.
   *
   * @listens passbolt.fido2.report
   * @param {object} report {name, message, stack, context, extra}
   */
  worker.port.on("passbolt.fido2.report", async (report) => {
    await Fido2ErrorReporter.report(
      { name: report?.name, message: report?.message, stack: report?.stack },
      { context: report?.context || "content-script", extra: report?.extra },
    );
  });
};

export const Fido2Events = { listen };
