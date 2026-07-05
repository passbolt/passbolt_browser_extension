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
import UserAbortsOperationError from "../../error/userAbortsOperationError";

const POPUP_WINDOW_HEIGHT = 600;
const POPUP_WINDOW_WIDTH = 420;
const CEREMONY_COMPLETE_ENDPOINT = "/passkey/ceremony/complete";

/**
 * Runs the top-level passkey ceremony in a popup window at the passbolt origin (the
 * only place WebAuthn can run — never in the extension cross-origin app iframe), and resolves with the
 * ceremony correlation ({token, mode, userId}) once the ceremony page reaches its completion url. This
 * mirrors the SSO PopupHandlerService, watching a passbolt url instead of a third party idp redirect.
 */
class PasskeyPopupHandlerService {
  /**
   * @param {string} accountDomain the passbolt domain
   * @param {number} originTabIdCall id of the tab the ceremony was initiated from
   */
  constructor(accountDomain, originTabIdCall) {
    this.popup = null;
    this.popupTabId = null;
    this.verifyCompletion = this.verifyCompletion.bind(this);
    this.verifyPopupClosed = this.verifyPopupClosed.bind(this);
    this.completeUrl = `${accountDomain}${CEREMONY_COMPLETE_ENDPOINT}`;
    this.originTabIdCall = originTabIdCall;
  }

  /**
   * Open the ceremony page and resolve with the correlation once it completes.
   *
   * @param {string} ceremonyUrl the passbolt-origin ceremony page url (/passkey/setup or /passkey/login)
   * @returns {Promise<{token: string, mode: string, userId: string}>}
   */
  async run(ceremonyUrl) {
    this.popup = await browser.windows.create({
      url: ceremonyUrl,
      type: "popup",
      width: POPUP_WINDOW_WIDTH,
      height: POPUP_WINDOW_HEIGHT,
    });
    this.popupTabId = this.popup.tabs[0].id;

    return new Promise((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
      browser.tabs.onUpdated.addListener(this.verifyCompletion);
      browser.tabs.onRemoved.addListener(this.verifyPopupClosed);
    });
  }

  /**
   * Watch the popup tab for the completion url, extracting the ceremony correlation.
   *
   * @param {number} tabId
   * @param {object} changeInfo
   * @param {object} tab
   * @returns {Promise<void>}
   */
  async verifyCompletion(tabId, changeInfo, tab) {
    if (tabId !== this.popupTabId || tab.status !== "complete") {
      return;
    }
    if (this.isErrorCompletion(tab.url)) {
      // The ceremony page failed (WebAuthn cancelled/no key) and redirected here after showing the
      // error; reject so the caller falls back to the passphrase form instead of hanging.
      this.rejectPromise(new UserAbortsOperationError("The security key ceremony did not complete."));
      await this.closeHandler();
      return;
    }
    const correlation = this.grabCorrelationFromUrl(tab.url);
    if (correlation !== null) {
      this.resolvePromise(correlation);
      await this.closeHandler();
    }
  }

  /**
   * Whether the popup reached the completion url carrying an error flag.
   * @param {string} url
   * @returns {boolean}
   */
  isErrorCompletion(url) {
    if (!url || !url.startsWith(this.completeUrl)) {
      return false;
    }
    return new URL(url).searchParams.get("error") === "1";
  }

  /**
   * @param {number} tabId
   * @returns {Promise<void>}
   */
  async verifyPopupClosed(tabId) {
    if (tabId === this.popupTabId) {
      this.rejectPromise(new UserAbortsOperationError("The user closed the security key window."));
      await this.closeHandler();
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async closeHandler() {
    browser.tabs.onUpdated.removeListener(this.verifyCompletion);
    browser.tabs.onRemoved.removeListener(this.verifyPopupClosed);
    this.resolvePromise = null;
    this.rejectPromise = null;
    if (this.popup && !this.popup.closed) {
      try {
        await browser.tabs.remove(this.popupTabId);
      } catch {
        /* the window may already be gone */
      }
    }
    this.popup = null;
  }

  /**
   * Extract {token, mode, userId} from the completion url, or null if not the completion url.
   *
   * @param {string} url
   * @returns {{token: string, mode: string, userId: string}|null}
   */
  grabCorrelationFromUrl(url) {
    if (!url || !url.startsWith(this.completeUrl)) {
      return null;
    }
    const parsed = new URL(url);
    const token = parsed.searchParams.get("token");
    const mode = parsed.searchParams.get("mode");
    const userId = parsed.searchParams.get("user_id");
    if (!token || !mode) {
      return null;
    }
    return { token, mode, userId };
  }
}

export default PasskeyPopupHandlerService;
