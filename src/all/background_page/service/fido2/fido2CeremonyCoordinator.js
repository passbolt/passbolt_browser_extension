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

import browser from "webextension-polyfill";
import { v4 as uuidv4 } from "uuid";

const CEREMONY_URL = "webAccessibleResources/fido2/ceremony.html";
const MESSAGE_PREFIX = "passbolt.fido2.ceremony.";

/**
 * Coordinates the SSO-style passkey ceremony popup window.
 *
 * A controller calls runCeremony(context) which opens a Passbolt popup window and resolves with the
 * user's choice ({action, resourceId, passphrase, pin, credentialId, ...}). The popup talks to the
 * service worker via runtime messages routed through onMessage(). The pending map and the awaiting
 * controller promise are in-memory, so the popup pings periodically to keep the MV3 service worker
 * alive for the duration of the ceremony (see the ping message).
 *
 * onMessage must be registered on chrome.runtime.onMessage in EVERY background entry point
 * (src/chrome-mv3/index.js for the MV3 service worker, src/all/background_page/index.js for MV2).
 */
const STORAGE_PREFIX = "fido2_ceremony_ctx_";

class Fido2CeremonyCoordinator {
  constructor() {
    this.pending = new Map();
    this.overlayReady = new Map(); // ceremonyId -> resolver, fulfilled when the overlay iframe boots
    this.onMessage = this.onMessage.bind(this);
    this._onWindowRemoved = this._onWindowRemoved.bind(this);
  }

  /**
   * Run a ceremony: open the popup and resolve with the user's decision.
   * @param {object} context {mode: "create"|"get", popup: {...data the popup renders...}}
   * @returns {Promise<object>} the popup result
   */
  async runCeremony(context) {
    const ceremonyId = uuidv4();

    const promise = new Promise((resolve, reject) => {
      // tabId is set optimistically so _settle can always ask the tab to hide the overlay (a no-op
      // when we fell back to a popup window).
      this.pending.set(ceremonyId, { resolve, reject, context, windowId: null, tabId: context.tabId || null });
    });

    // Also persist the render context durably: if the service worker is torn down between here and
    // the popup's first get-context message, the in-memory pending map is lost, but the popup can
    // still render from session storage instead of showing "This request is no longer available".
    await this._storeContext(ceremonyId, context.popup);

    // Prefer an in-page overlay injected into the calling tab (like the passbolt inform menu / login
    // page) so the ceremony stays on the page instead of a separate OS popup. The overlay iframe
    // confirms it actually booted (not blocked by the page CSP) by messaging us directly; if it does
    // not, fall back to a popup window.
    const injected = await this._injectOverlay(context.tabId, ceremonyId);
    if (injected && (await this._awaitOverlayReady(ceremonyId, 2500))) {
      return promise; // the in-page overlay is live
    }
    if (context.tabId) {
      browser.tabs.sendMessage(context.tabId, { type: "passbolt.fido2.overlay.hide", ceremonyId }).catch(() => {});
    }
    await this._openWindow(ceremonyId);

    return promise;
  }

  /**
   * Ask the calling tab's content script to inject the ceremony overlay frame.
   * @param {number} tabId
   * @param {string} ceremonyId
   * @returns {Promise<boolean>} whether the frame was injected
   * @private
   */
  async _injectOverlay(tabId, ceremonyId) {
    if (!tabId) {
      return false;
    }
    try {
      const response = await browser.tabs.sendMessage(tabId, { type: "passbolt.fido2.overlay.show", ceremonyId });
      return Boolean(response?.injected);
    } catch {
      return false;
    }
  }

  /**
   * Wait for the overlay iframe to confirm it booted, or time out (CSP blocked the frame).
   * @param {string} ceremonyId
   * @param {number} timeoutMs
   * @returns {Promise<boolean>}
   * @private
   */
  _awaitOverlayReady(ceremonyId, timeoutMs) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (value) => {
        if (done) {
          return;
        }
        done = true;
        this.overlayReady.delete(ceremonyId);
        resolve(value);
      };
      this.overlayReady.set(ceremonyId, () => finish(true));
      setTimeout(() => finish(false), timeoutMs);
    });
  }

  /**
   * Fallback: open the ceremony in a popup window.
   * @param {string} ceremonyId
   * @returns {Promise<void>}
   * @private
   */
  async _openWindow(ceremonyId) {
    const url = `${browser.runtime.getURL(CEREMONY_URL)}?ceremonyId=${ceremonyId}`;
    try {
      if (!browser.windows.onRemoved.hasListener(this._onWindowRemoved)) {
        browser.windows.onRemoved.addListener(this._onWindowRemoved);
      }
      const win = await browser.windows.create({ url, type: "popup", width: 440, height: 640 });
      const entry = this.pending.get(ceremonyId);
      if (entry) {
        entry.windowId = win.id;
      }
    } catch (error) {
      this._settle(ceremonyId, null, error, true);
    }
  }

  /**
   * Route a ceremony message from the popup (native chrome.runtime.onMessage style: respond
   * synchronously via sendResponse). Returns undefined for messages that are not ours.
   * @param {object} message
   * @param {object} sender
   * @param {Function} sendResponse
   * @returns {boolean|undefined}
   */
  onMessage(message, sender, sendResponse) {
    if (typeof message?.type !== "string" || !message.type.startsWith(MESSAGE_PREFIX)) {
      return undefined;
    }
    // The overlay iframe confirms it booted (used to decide against the popup-window fallback).
    if (message.type === `${MESSAGE_PREFIX}overlay-ready`) {
      const resolver = this.overlayReady.get(message.ceremonyId);
      if (resolver) {
        resolver();
      }
      sendResponse({ ok: true });
      return true;
    }
    const entry = this.pending.get(message.ceremonyId);

    // get-context is served from the durable session storage when the in-memory pending was lost to
    // a service-worker restart, so the popup always renders instead of "no longer available".
    if (message.type === `${MESSAGE_PREFIX}get-context`) {
      if (entry) {
        sendResponse({ context: entry.context.popup });
      } else {
        this._loadStoredContext(message.ceremonyId)
          .then((popup) => {
            sendResponse(popup ? { context: popup } : { error: "unknown-ceremony" });
            return null;
          })
          .catch(() => sendResponse({ error: "unknown-ceremony" }));
      }
      return true; // sendResponse may be called asynchronously
    }

    if (!entry) {
      sendResponse({ error: "unknown-ceremony" });
      return true;
    }

    switch (message.type) {
      case `${MESSAGE_PREFIX}ping`:
        // MV3 keepalive: the popup pings periodically so the service worker (and this in-memory
        // pending map + the awaiting controller promise) survives long user interactions.
        sendResponse({ ok: true });
        break;
      case `${MESSAGE_PREFIX}open-passbolt`:
        // "Sign in required" state: open the passbolt app so the user can sign in, then retry.
        sendResponse({ ok: true });
        if (entry.context?.popup?.domain) {
          browser.tabs.create({ url: entry.context.popup.domain }).catch(() => {});
        }
        break;
      case `${MESSAGE_PREFIX}submit`: {
        // If the controller provided a validator (passphrase/PIN check), run it before settling so a
        // wrong passphrase/PIN is reported back to the popup, which stays open for a retry, instead of
        // failing the whole ceremony. On success the ceremony settles with the user's choice.
        const validate = entry.context?.validate;
        if (typeof validate === "function") {
          Promise.resolve(validate(message.result))
            .then(() => {
              sendResponse({ ok: true });
              this._settle(message.ceremonyId, message.result, null);
              return null;
            })
            .catch((error) => {
              sendResponse({ error: error?.code || "invalid", message: error?.message || "Invalid input." });
            });
          return true; // sendResponse is called asynchronously
        }
        sendResponse({ ok: true });
        this._settle(message.ceremonyId, message.result, null);
        break;
      }
      case `${MESSAGE_PREFIX}fallback`:
        sendResponse({ ok: true });
        this._settle(message.ceremonyId, null, { name: "__fallback__", message: "use another method" });
        break;
      case `${MESSAGE_PREFIX}cancel`:
      default:
        sendResponse({ ok: true });
        this._settle(message.ceremonyId, null, { name: "NotAllowedError", message: "The ceremony was cancelled." });
        break;
    }
    return true;
  }

  /**
   * If the popup window is closed before submitting, treat it as a cancel.
   * @param {number} windowId
   * @private
   */
  _onWindowRemoved(windowId) {
    for (const [ceremonyId, entry] of this.pending.entries()) {
      if (entry.windowId === windowId) {
        this._settle(ceremonyId, null, { name: "NotAllowedError", message: "The ceremony window was closed." }, true);
      }
    }
  }

  /**
   * Resolve/reject a pending ceremony and close its window.
   * @param {string} ceremonyId
   * @param {object|null} result
   * @param {object|null} error
   * @param {boolean} [windowAlreadyGone]
   * @private
   */
  _settle(ceremonyId, result, error, windowAlreadyGone) {
    this._clearStoredContext(ceremonyId);
    const entry = this.pending.get(ceremonyId);
    if (!entry) {
      return;
    }
    this.pending.delete(ceremonyId);
    if (entry.tabId) {
      browser.tabs.sendMessage(entry.tabId, { type: "passbolt.fido2.overlay.hide", ceremonyId }).catch(() => {});
    }
    if (!windowAlreadyGone && entry.windowId) {
      browser.windows.remove(entry.windowId).catch(() => {});
    }
    if (error) {
      entry.reject(error);
    } else {
      entry.resolve(result);
    }
  }

  /**
   * Persist a ceremony's popup render context in session storage (survives SW restarts within the
   * browser session).
   * @param {string} ceremonyId
   * @param {object} popup
   * @returns {Promise<void>}
   * @private
   */
  async _storeContext(ceremonyId, popup) {
    try {
      await chrome.storage.session.set({ [`${STORAGE_PREFIX}${ceremonyId}`]: popup });
    } catch {
      /* session storage unavailable — fall back to in-memory only */
    }
  }

  /**
   * @param {string} ceremonyId
   * @returns {Promise<object|null>}
   * @private
   */
  async _loadStoredContext(ceremonyId) {
    try {
      const key = `${STORAGE_PREFIX}${ceremonyId}`;
      const stored = await chrome.storage.session.get(key);
      return stored?.[key] || null;
    } catch {
      return null;
    }
  }

  /**
   * @param {string} ceremonyId
   * @private
   */
  _clearStoredContext(ceremonyId) {
    try {
      chrome.storage.session.remove(`${STORAGE_PREFIX}${ceremonyId}`);
    } catch {
      /* ignore */
    }
  }
}

export default new Fido2CeremonyCoordinator();
