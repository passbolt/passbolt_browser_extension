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

import sanitizeUrl, { urlProtocols } from "passbolt-styleguide/src/react-extension/lib/Sanitize/sanitizeUrl";
import BrowserTabService from "../../service/ui/browserTab.service";

// Tabs considered "blank" (a freshly opened/new-tab page), safe to navigate in place instead of
// opening yet another tab. Mirrors the list used by LaunchResourceController.
const BLANK_TAB_URLS = ["about:blank", "about:newtab", "chrome://newtab/", ""];

/**
 * Opens a resource URI from the quickaccess WITHOUT decrypting or autofilling any secret.
 *
 * Unlike the stock `passbolt.tabs.open-resource-uri` (App worker) which always opens a new tab, this
 * reuses the opener tab when it is blank (e.g. an incognito new-tab page), otherwise opens a new tab.
 * This keeps the autofill-disabled launch consistent with the autofill-enabled launch
 * (LaunchResourceController), which already reuses a blank opener tab.
 *
 * No secret is read here; http and https are both allowed (it only navigates a tab).
 */
export default class OpenResourceUriInOpenerTabController {
  /**
   * @param {Worker} worker
   * @param {string} requestId
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Wrap exec to emit the outcome on the worker port. Errors are sanitised to a generic message.
   * @param {string} uri
   * @param {number} openerTabId
   * @return {Promise<void>}
   */
  async _exec(uri, openerTabId) {
    try {
      await this.exec(uri, openerTabId);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", new Error("Unable to open the resource URL."));
    }
  }

  /**
   * Sanitise the URI and navigate to it, reusing the opener tab when it is blank.
   * @param {string} uriString
   * @param {number} openerTabId The id of the tab that was active when the popup opened.
   * @return {Promise<void>}
   * @throws {Error} if the URI is not a valid http(s) URL.
   */
  async exec(uriString, openerTabId) {
    const url = sanitizeUrl(uriString, {
      whiteListedProtocols: [urlProtocols.HTTPS, urlProtocols.HTTP],
      defaultProtocol: urlProtocols.HTTPS,
    });
    if (!url) {
      throw new Error("The given URL is not valid for opening in a tab.");
    }

    const targetTab = await this.resolveTargetTab(openerTabId);
    const targetUrl = targetTab?.url || targetTab?.pendingUrl || "";
    const isBlankTab = BLANK_TAB_URLS.includes(targetUrl) || !/^https?:/i.test(targetUrl);

    if (targetTab && isBlankTab) {
      await browser.tabs.update(targetTab.id, { url });
      return;
    }
    await browser.tabs.create({ url });
  }

  /**
   * Resolve the tab the user was on when they triggered the launch: the popup's opener tab first,
   * then the active tab of the last-focused / current window.
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
}
