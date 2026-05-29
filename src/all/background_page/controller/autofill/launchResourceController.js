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
 * @since         5.12.1
 */

import ResourceModel from "../../model/resource/resourceModel";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import WorkerService from "../../service/worker/workerService";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import DecryptAndParseResourceSecretService from "../../service/secret/decryptAndParseResourceSecretService";
import FindSecretService from "../../service/secret/findSecretService";
import BrowserTabService from "../../service/ui/browserTab.service";
import AutofillSettingsService from "../../service/autofill/autofillSettingsService";
import Validator from "validator";

const BLANK_TAB_URLS = ["about:blank", "about:newtab", "chrome://newtab/", ""];

/**
 * Launches a resource: navigates a tab to the resource's stored URI and autofills the login form
 * once the page has loaded — when the user has enabled "autofill on launch".
 *
 * Security notes:
 * - This controller deliberately does NOT submit the form. Auto-submitting credentials without a
 *   human seeing the loaded page is the gating behaviour Passbolt intentionally keeps; it is out of
 *   scope here. The fill is a value the user can inspect and undo.
 * - Before decrypting or filling, the loaded page's origin is verified on the trusted (service
 *   worker) side against the resource's stored origin, using the browser-verified sender URL of the
 *   content-script worker — not a URL computed before navigation. This defends against a redirect,
 *   DNS/MITM, or a re-registered/expired domain causing the credential to be filled into another
 *   origin.
 * - Only https resource URIs are launched-and-filled (plaintext http is refused for this path).
 */
class LaunchResourceController {
  /**
   * LaunchResourceController constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.resourceModel = new ResourceModel(apiClientOptions, account);
    this.findSecretService = new FindSecretService(account, apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.getPassphraseService = new GetPassphraseService(account);
  }

  /**
   * Wrap the exec to emit the request outcome on the worker port.
   * Non-abort errors are sanitised to a generic message so decryption/secret error detail is never
   * forwarded to the popup.
   * @param {string} resourceId A resource identifier
   * @return {Promise<void>}
   */
  async _exec(resourceId, openerTabId) {
    try {
      await this.exec(resourceId, openerTabId);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      const safeError =
        error?.name === "UserAbortsOperationError"
          ? error
          : new Error("Unable to launch and autofill the resource.");
      this.worker.port.emit(this.requestId, "ERROR", safeError);
    }
  }

  /**
   * Launch a resource: navigate to its primary URI and autofill the login form once the page loaded,
   * when "autofill on launch" is enabled.
   *
   * @param {string} resourceId A resource identifier
   * @param {number} openerTabId The id of the tab that was active when the popup opened
   * @return {Promise<void>}
   * @throws {Error} if autofill on launch is disabled, the URI is invalid, the loaded origin does not
   *   match the resource origin, or decryption fails.
   */
  async exec(resourceId, openerTabId) {
    // Validate the caller-supplied identifier at the boundary (defence in depth) before any work.
    if (!Validator.isUUID(resourceId)) {
      throw new Error("The resource id is not a valid identifier.");
    }

    const settings = await AutofillSettingsService.get();
    // Guard: only reachable when autofill on launch is enabled. When disabled the popup uses a plain
    // anchor and never dispatches this request.
    if (!settings.autofillOnLaunch) {
      throw new Error("Autofill on launch is not enabled.");
    }

    const resource = await this.resourceModel.getById(resourceId);
    const uri = resource?.metadata?.uris?.[0];
    this.assertHttpsUrl(uri);
    const expectedOrigin = new URL(uri).origin;

    // Navigate (reuse the opener tab when blank, else open a new tab) and bind to the exact target tab.
    const tabId = await this.navigateToUri(uri, openerTabId);

    /*
     * Wait for the web integration content script on the destination page. Time-boxed to ~3s
     * (30 × 100ms) so a destination that never loads the integration (e.g. a non-HTML response)
     * fails fast instead of hanging the launch on the default 5s budget.
     */
    await WorkerService.waitExists("WebIntegration", tabId, 30);
    const webIntegrationWorker = await WorkerService.get("WebIntegration", tabId);

    /*
     * Trusted-side origin binding (critical). Verify the page that actually loaded matches the
     * resource's stored origin BEFORE decrypting or filling, using the browser-verified sender URL
     * of the content-script worker. Refuse on mismatch — a redirect / DNS / takeover that sent the
     * tab elsewhere must not receive the credential.
     */
    this.assertWorkerOriginMatches(webIntegrationWorker, expectedOrigin);

    /*
     * Get the passphrase from the quickaccess in detached mode if not stored in memory.
     * Works standalone and prompts the user when the vault is locked.
     */
    const passphrase = await this.getPassphraseService.requestPassphraseFromQuickAccess();

    // Decrypt and parse the resource secret, mirroring AutofillController.exec().
    const secret = await this.findSecretService.findByResourceId(resourceId);
    const secretSchema = await this.resourceTypeModel.getSecretSchemaById(resource.resourceTypeId);
    const privateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
    const plaintextSecret = await DecryptAndParseResourceSecretService.decryptAndParse(
      secret,
      secretSchema,
      privateKey,
    );

    const username = resource.metadata?.username || "";
    const password = plaintextSecret?.password || "";
    const totp = plaintextSecret?.totp;

    /*
     * TOCTOU re-check (critical). The passphrase prompt above can take seconds-to-minutes, during
     * which the tab could navigate (same-document change, or a worker reused for a new page). Re-fetch
     * the worker and re-verify its browser-verified origin immediately before dispatching the
     * credential, so the fill cannot land on an origin that differs from the resource's.
     */
    const fillWorker = await WorkerService.get("WebIntegration", tabId);
    this.assertWorkerOriginMatches(fillWorker, expectedOrigin);

    /*
     * Dispatch the fill to the web integration content script via the standalone quickaccess fill
     * path (autofills without a prior in-form-menu interaction, required for a freshly navigated
     * page). No submit is requested — the form is filled, not submitted.
     */
    await fillWorker.port.request("passbolt.quickaccess.fill-form", username, password, totp, uri);
  }

  /**
   * Navigate to the given URI, reusing the opener tab when it is blank, otherwise opening a new tab.
   *
   * The "opener tab" is the tab that was active when the popup opened — not the currently focused tab,
   * which from the service worker is the popup's own context. The destination tab id is taken from the
   * navigation API result (not re-queried), so the fill is bound to the exact tab that was navigated.
   * @param {string} uri The validated https URI to navigate to.
   * @param {number} openerTabId The id of the tab that was active when the popup opened.
   * @return {Promise<number>} The destination tab id.
   * @private
   */
  async navigateToUri(uri, openerTabId) {
    const targetTab = await this.resolveTargetTab(openerTabId);
    const targetUrl = targetTab?.url || targetTab?.pendingUrl || "";
    const isBlankTab = BLANK_TAB_URLS.includes(targetUrl) || !/^https?:/i.test(targetUrl);

    if (targetTab && isBlankTab) {
      const updatedTab = await browser.tabs.update(targetTab.id, { url: uri });
      return updatedTab.id;
    }

    const createdTab = await browser.tabs.create({ url: uri });
    return createdTab.id;
  }

  /**
   * Resolve the tab the user was on when they triggered the launch. Tries the popup's opener tab
   * first, then the active tab of the last-focused / current window (mirrors ToolbarService).
   * @param {number|string} openerTabId
   * @return {Promise<object|null>}
   * @private
   */
  async resolveTargetTab(openerTabId) {
    if (openerTabId !== undefined && openerTabId !== null && openerTabId !== "") {
      try {
        const tab = await BrowserTabService.getById(openerTabId);
        if (tab) {
          return tab;
        }
      } catch (error) {
        // fall through to the active-tab queries
      }
    }
    for (const queryOptions of [{ active: true, lastFocusedWindow: true }, { active: true, currentWindow: true }]) {
      try {
        const tabs = await browser.tabs.query(queryOptions);
        if (tabs?.[0]) {
          return tabs[0];
        }
      } catch (error) {
        // try the next query
      }
    }
    return null;
  }

  /**
   * Assert that the content-script worker's browser-verified page origin matches the expected origin.
   * @param {Worker} webIntegrationWorker
   * @param {string} expectedOrigin The resource URI origin.
   * @throws {Error} if the loaded origin cannot be determined or does not match.
   * @private
   */
  assertWorkerOriginMatches(webIntegrationWorker, expectedOrigin) {
    const senderUrl = webIntegrationWorker?.port?._port?.sender?.url;
    let landedOrigin;
    try {
      landedOrigin = new URL(senderUrl).origin;
    } catch (error) {
      throw new Error("Could not determine the loaded page origin for autofill.");
    }
    if (landedOrigin !== expectedOrigin) {
      throw new Error("Refusing to autofill: the loaded page origin does not match the resource URL.");
    }
  }

  /**
   * Assert that the given value is a valid https URL. Plaintext http is refused for launch-and-fill.
   * @param {string} urlString
   * @throws {Error} if the value is not a valid https URL.
   * @private
   */
  assertHttpsUrl(urlString) {
    const validationOption = {
      require_tld: false,
      require_host: true,
      require_protocol: true,
      require_valid_protocol: true,
      protocols: ["https"],
    };

    if (typeof urlString !== "string" || !Validator.isURL(urlString, validationOption)) {
      throw new Error("The resource does not have a valid https URL to launch.");
    }
  }
}

export default LaunchResourceController;
