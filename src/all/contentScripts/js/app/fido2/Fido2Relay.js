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

const REQUEST_EVENT = "passbolt.fido2.request";
const RESPONSE_EVENT = "passbolt.fido2.response";
const REPORT_EVENT = "passbolt.fido2.report-error";
const CONDITIONAL_EVENT = "passbolt.fido2.conditional";

// Fields a login form marks up for conditional-UI (autofill). The canonical signal is
// autocomplete="… webauthn"; the rest broaden coverage to ordinary username/email inputs so our
// passkeys are still offered on sites that do not tag the field (we only reach here when we actually
// hold a passkey for the site, so this is not over-eager).
const AUTOFILL_FIELD_SELECTORS = [
  'input[autocomplete*="webauthn" i]',
  'input[autocomplete*="username" i]',
  'input[type="email"]',
  'input[name*="user" i]',
  'input[name*="email" i]',
  'input[id*="user" i]',
];

// Safety net: the content-script port does not reject a pending request when the service worker is
// terminated mid-ceremony. Without this, the relying party's navigator.credentials promise would
// hang forever. The window is generous because a ceremony can legitimately wait on user input
// (passphrase/PIN in the popup, which pings to keep the worker alive). On timeout we fall back to
// the platform authenticator (resolve null) rather than error the site.
const CEREMONY_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Isolated-world relay for the passkey provider.
 *
 * It injects the MAIN-world page script (which overrides navigator.credentials) into the page, and
 * relays the ceremony requests it emits (via window.postMessage) to the service worker over the
 * content script port, forwarding the response back.
 *
 * Runs as part of the browser-integration content script, so it inherits its host coverage
 * (all third-party sites, excluding the Passbolt domain) and its authenticated port.
 */
class Fido2Relay {
  /**
   * Initialise the relay on the current page.
   * @param {Port} port the connected content script port
   */
  static init(port) {
    Fido2Relay._injectPageScript();
    window.addEventListener("message", (event) => Fido2Relay._onWindowMessage(event, port));
    // The service worker asks us to show/hide the ceremony as an in-page overlay (like the inform
    // menu) instead of a separate popup window. We answer whether we could show it, so the worker can
    // fall back to a popup window when the page blocks the injected extension frame.
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message?.type === "passbolt.fido2.overlay.show") {
        // Inject the frame; whether the page CSP actually let it boot is confirmed by the ceremony
        // page itself messaging the service worker directly (overlay.ready), so here we just report
        // that the DOM injection succeeded.
        sendResponse({ injected: Fido2Relay._showOverlay(message.ceremonyId) });
        return true;
      }
      if (message?.type === "passbolt.fido2.overlay.hide") {
        Fido2Relay._hideOverlay();
        sendResponse({ ok: true });
        return true;
      }
      return undefined;
    });
  }

  /**
   * Inject the ceremony page as a centered in-page overlay (backdrop + extension iframe).
   * @param {string} ceremonyId
   * @returns {boolean} whether the frame was injected into the DOM
   * @private
   */
  static _showOverlay(ceremonyId) {
    try {
      Fido2Relay._hideOverlay();
      // A side panel anchored to the top-right corner (like the passbolt quickaccess / inform menu),
      // NOT a modal over the page: the container does not capture clicks, only the panel does.
      const container = document.createElement("div");
      container.id = "passbolt-fido2-overlay";
      container.setAttribute("style", "position:fixed;top:12px;right:12px;z-index:2147483647;pointer-events:none;");
      const iframe = document.createElement("iframe");
      iframe.src = `${chrome.runtime.getURL("webAccessibleResources/fido2/ceremony.html")}?ceremonyId=${ceremonyId}&overlay=1`;
      iframe.setAttribute(
        "style",
        "width:360px;max-width:calc(100vw - 24px);height:600px;max-height:calc(100vh - 24px);border:none;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,0.35);background:transparent;pointer-events:auto;",
      );
      container.appendChild(iframe);
      (document.body || document.documentElement).appendChild(container);
      return true;
    } catch {
      Fido2Relay._hideOverlay();
      return false;
    }
  }

  /**
   * Remove the ceremony overlay if present.
   * @private
   */
  static _hideOverlay() {
    const existing = document.getElementById("passbolt-fido2-overlay");
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Inject the MAIN-world page script from the extension web-accessible resources.
   * @private
   */
  static _injectPageScript() {
    try {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("webAccessibleResources/js/dist/fido2/fido2-page.js");
      script.type = "text/javascript";
      script.onload = () => script.remove();
      (document.head || document.documentElement).appendChild(script);
    } catch (error) {
      console.debug("Fido2Relay: unable to inject the page script", error);
    }
  }

  /**
   * Handle a ceremony request posted by the page script.
   * @param {MessageEvent} event
   * @param {Port} port
   * @private
   */
  static async _onWindowMessage(event, port) {
    if (event.source !== window) {
      return;
    }

    // Forward page-script errors to the service worker for reporting (page CSP blocks direct fetch).
    if (event.data?.type === REPORT_EVENT) {
      Fido2Relay._forwardReport(port, event.data.report);
      return;
    }

    // Conditional mediation (autofill): offer our Passbolt passkeys inline when the user focuses a
    // login field. Does not block; resolves the page-script promise only if the user picks ours.
    if (event.data?.type === CONDITIONAL_EVENT) {
      Fido2Relay._handleConditional(port, event.data.requestId, event.data.payload);
      return;
    }

    if (event.data?.type !== REQUEST_EVENT) {
      return;
    }
    const { requestId, operation, payload } = event.data;

    if (operation !== "create" && operation !== "get") {
      Fido2Relay._respond(requestId, null, null);
      return;
    }

    let timeoutId = null;
    try {
      const timeout = new Promise((resolve) => {
        timeoutId = setTimeout(() => resolve({ __fido2Timeout: true }), CEREMONY_TIMEOUT_MS);
      });
      const result = await Promise.race([
        port.request(`passbolt.fido2.${operation}`, payload.options, payload.origin),
        timeout,
      ]);
      if (result && result.__fido2Timeout) {
        // Worker never answered -> fall back to the platform authenticator instead of hanging.
        Fido2Relay._respond(requestId, null, null);
        return;
      }
      Fido2Relay._respond(requestId, result, null);
    } catch (error) {
      Fido2Relay._forwardReport(port, { name: error?.name, message: error?.message, context: `relay.${operation}` });
      Fido2Relay._respond(requestId, null, Fido2Relay._serializeError(error));
    } finally {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    }
  }

  /**
   * Offer our Passbolt passkeys for a conditional-mediation (autofill) request. First checks the
   * service worker actually holds a passkey for the site (cheap, no decryption); if so, watches for
   * focus on the login field and runs our get ceremony (the side panel) when the user engages it,
   * resolving the page-script promise with the assertion. Coexists with native autofill: if the user
   * never picks ours, this simply never resolves (allowed for conditional mediation).
   * @param {Port} port
   * @param {string} requestId
   * @param {object} payload the serialized options + origin
   * @private
   */
  static async _handleConditional(port, requestId, payload) {
    let hasPasskey = false;
    try {
      hasPasskey = await port.request("passbolt.fido2.has-passkeys", payload.options, payload.origin);
    } catch {
      return; // provider unavailable -> leave autofill to the platform
    }
    if (!hasPasskey) {
      return;
    }
    const fields = Fido2Relay._autofillFields();
    if (!fields.length) {
      return; // no login field to anchor to -> leave autofill to the platform
    }

    let inFlight = false;
    let settled = false;
    const cleanup = () => {
      settled = true;
      for (const field of fields) {
        field.removeEventListener("focus", onFocus);
      }
    };
    const onFocus = async () => {
      if (inFlight || settled) {
        return;
      }
      inFlight = true;
      try {
        const result = await port.request("passbolt.fido2.get", payload.options, payload.origin);
        if (result) {
          Fido2Relay._respond(requestId, result, null);
          cleanup();
        } else {
          inFlight = false; // provider declined -> keep offering (or let native autofill win)
        }
      } catch (error) {
        // The user dismissing our panel (NotAllowedError) is not a failure of the autofill request:
        // stay silent so native autofill can still be used, and allow another attempt on re-focus.
        if (error?.name === "NotAllowedError" || error?.name === "__fallback__") {
          inFlight = false;
        } else {
          Fido2Relay._respond(requestId, null, Fido2Relay._serializeError(error));
          cleanup();
        }
      }
    };
    for (const field of fields) {
      field.addEventListener("focus", onFocus);
    }
    // Conditional get is usually issued on load; if the user has already focused the field, offer now.
    if (fields.includes(document.activeElement)) {
      onFocus();
    }
  }

  /**
   * Collect the login/autofill input fields our conditional menu can anchor to.
   * @returns {Array<HTMLElement>}
   * @private
   */
  static _autofillFields() {
    const set = new Set();
    for (const selector of AUTOFILL_FIELD_SELECTORS) {
      try {
        document.querySelectorAll(selector).forEach((node) => set.add(node));
      } catch {
        /* invalid selector on an old engine — skip */
      }
    }
    return [...set];
  }

  /**
   * Forward an error report to the service worker (which ships it to GlitchTip).
   * @param {Port} port
   * @param {object} report
   * @private
   */
  static _forwardReport(port, report) {
    try {
      port.emit("passbolt.fido2.report", report || {});
    } catch {
      /* ignore */
    }
  }

  /**
   * Post a response back to the page script.
   * @param {string} requestId
   * @param {object|null} result
   * @param {object|null} error
   * @private
   */
  static _respond(requestId, result, error) {
    window.postMessage({ type: RESPONSE_EVENT, requestId, result, error }, window.location.origin);
  }

  /**
   * Normalise a port error into a {name, message} the page script turns into a DOMException.
   * @param {*} error
   * @returns {{name: string, message: string}}
   * @private
   */
  static _serializeError(error) {
    if (error && typeof error === "object" && error.name) {
      return { name: error.name, message: error.message };
    }
    return { name: "UnknownError", message: typeof error === "string" ? error : "The passkey ceremony failed." };
  }
}

export default Fido2Relay;
