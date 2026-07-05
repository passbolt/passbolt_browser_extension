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

/**
 * MAIN-world page script for the passkey provider.
 *
 * It overrides navigator.credentials.create()/get() so that, like Dashlane / Bitwarden, Passbolt
 * can act as a WebAuthn authenticator for third-party relying parties. The override serializes the
 * request, hands it to the isolated content script (which relays it to the service worker), and
 * reconstructs a PublicKeyCredential-shaped result for the calling page.
 *
 * Design notes:
 *  - Must be injected at document_start, in the MAIN world, before the page touches
 *    navigator.credentials — otherwise the site falls through to the platform authenticator.
 *  - Coexists with platform authenticators (Dashlane behaviour): on cancel / no-credential / any
 *    provider failure it delegates back to the original native implementation instead of hijacking.
 *  - No extension APIs are available here (MAIN world); it communicates only via window.postMessage.
 */
(function () {
  const REQUEST_EVENT = "passbolt.fido2.request";
  const RESPONSE_EVENT = "passbolt.fido2.response";
  const REPORT_EVENT = "passbolt.fido2.report-error";
  const CONDITIONAL_EVENT = "passbolt.fido2.conditional";
  const MEDIATION_CONDITIONAL = "conditional";

  /**
   * Forward an error to the isolated relay (which ships it to GlitchTip via the service worker).
   * @param {*} error
   * @param {string} context
   */
  const postReport = (error, context) => {
    try {
      const report = {
        name: error?.name || "Error",
        message: error?.message || String(error),
        stack: error?.stack,
        context,
      };
      window.postMessage({ type: REPORT_EVENT, report }, window.location.origin);
    } catch {
      /* ignore */
    }
  };

  if (!window.navigator?.credentials || window.__passboltFido2Installed) {
    return;
  }
  window.__passboltFido2Installed = true;

  const nativeCredentials = window.navigator.credentials;
  const nativeCreate = nativeCredentials.create.bind(nativeCredentials);
  const nativeGet = nativeCredentials.get.bind(nativeCredentials);

  const pendingRequests = new Map();
  let requestCounter = 0;

  // A conditional-mediation (autofill) get we delegated to the platform. It stays pending against
  // the native implementation while the user browses. If a modal get then arrives, the browser only
  // allows one outstanding request, so we must abort this one before issuing any native modal call —
  // otherwise the fallback nativeGet fails with "a request is already pending" (OperationError).
  let pendingConditionalAbort = null;

  const cancelPendingConditional = () => {
    if (pendingConditionalAbort) {
      try {
        pendingConditionalAbort.abort();
      } catch {
        /* ignore */
      }
      pendingConditionalAbort = null;
    }
  };

  window.addEventListener("message", (event) => {
    if (event.source !== window || event.data?.type !== RESPONSE_EVENT) {
      return;
    }
    const pending = pendingRequests.get(event.data.requestId);
    if (!pending) {
      return;
    }
    pendingRequests.delete(event.data.requestId);
    if (event.data.error) {
      pending.reject(event.data.error);
    } else {
      pending.resolve(event.data.result);
    }
  });

  /**
   * Send a request to the isolated content script and await its response.
   * @param {string} operation "create" | "get"
   * @param {object} payload the serialized options + origin
   * @returns {Promise<object>}
   */
  const sendRequest = (operation, payload) =>
    new Promise((resolve, reject) => {
      const requestId = `fido2-${Date.now()}-${requestCounter++}`;
      pendingRequests.set(requestId, { resolve, reject });
      window.postMessage({ type: REQUEST_EVENT, requestId, operation, payload }, window.location.origin);
    });

  /**
   * Offer our Passbolt passkeys for a conditional-mediation (autofill) request. The relay surfaces them
   * when the user focuses the login field and resolves this with the assertion (or null if the user
   * dismisses / we hold no passkey for the site). Shares the RESPONSE_EVENT plumbing via requestId.
   * @param {object} payload the serialized options + origin
   * @returns {Promise<object|null>}
   */
  const requestConditional = (payload) =>
    new Promise((resolve, reject) => {
      const requestId = `fido2-cond-${Date.now()}-${requestCounter++}`;
      pendingRequests.set(requestId, { resolve, reject });
      window.postMessage({ type: CONDITIONAL_EVENT, requestId, payload }, window.location.origin);
    });

  // ---- (de)serialization helpers (ArrayBuffer <-> base64url over postMessage) ----

  const toBase64Url = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const fromBase64Url = (value) => {
    let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const serializeCreateOptions = (publicKey) => ({
    rp: publicKey.rp,
    user: publicKey.user
      ? { id: toBase64Url(publicKey.user.id), name: publicKey.user.name, displayName: publicKey.user.displayName }
      : undefined,
    challenge: toBase64Url(publicKey.challenge),
    pubKeyCredParams: publicKey.pubKeyCredParams,
    timeout: publicKey.timeout,
    excludeCredentials: (publicKey.excludeCredentials || []).map((c) => ({
      type: c.type,
      id: toBase64Url(c.id),
      transports: c.transports,
    })),
    authenticatorSelection: publicKey.authenticatorSelection,
    attestation: publicKey.attestation,
    extensions: publicKey.extensions,
  });

  const serializeGetOptions = (publicKey) => ({
    challenge: toBase64Url(publicKey.challenge),
    rpId: publicKey.rpId,
    timeout: publicKey.timeout,
    userVerification: publicKey.userVerification,
    allowCredentials: (publicKey.allowCredentials || []).map((c) => ({
      type: c.type,
      id: toBase64Url(c.id),
      transports: c.transports,
    })),
    extensions: publicKey.extensions,
  });

  /**
   * Rebuild a PublicKeyCredential-shaped object from the serialized service worker result.
   * @param {object} result
   * @returns {object}
   */
  const deserializeCredential = (result) => {
    const response = result.response;
    const attestation = typeof response.attestationObject !== "undefined";
    const authenticatorResponse = attestation
      ? {
          clientDataJSON: fromBase64Url(response.clientDataJSON),
          attestationObject: fromBase64Url(response.attestationObject),
          getTransports: () => response.transports || [],
          getPublicKeyAlgorithm: () => response.publicKeyAlgorithm,
          getAuthenticatorData: () => (response.authenticatorData ? fromBase64Url(response.authenticatorData) : null),
          getPublicKey: () => (response.publicKey ? fromBase64Url(response.publicKey) : null),
        }
      : {
          clientDataJSON: fromBase64Url(response.clientDataJSON),
          authenticatorData: fromBase64Url(response.authenticatorData),
          signature: fromBase64Url(response.signature),
          userHandle: response.userHandle ? fromBase64Url(response.userHandle) : null,
        };

    const credential = {
      id: result.id,
      rawId: fromBase64Url(result.rawId),
      type: "public-key",
      authenticatorAttachment: result.authenticatorAttachment || "platform",
      response: authenticatorResponse,
      getClientExtensionResults: () => result.clientExtensionResults || {},
    };
    // Present as a PublicKeyCredential instance where the platform exposes the constructor.
    if (typeof PublicKeyCredential === "function") {
      Object.setPrototypeOf(credential, PublicKeyCredential.prototype);
    }
    return credential;
  };

  /**
   * Wrap a conditional get's options with our own AbortController so we can cancel the delegated
   * native request when a modal ceremony starts. The caller's own signal (if any) still aborts it.
   * @param {object} options
   * @returns {object} options with a merged abort signal
   */
  const withConditionalTracking = (options) => {
    if (typeof AbortController !== "function") {
      return options; // very old engine: no tracking, best effort
    }
    const controller = new AbortController();
    pendingConditionalAbort = controller;
    if (options.signal) {
      if (options.signal.aborted) {
        controller.abort();
      } else {
        options.signal.addEventListener("abort", () => controller.abort(), { once: true });
      }
    }
    const clear = () => {
      if (pendingConditionalAbort === controller) {
        pendingConditionalAbort = null;
      }
    };
    controller.signal.addEventListener("abort", clear, { once: true });
    return { ...options, signal: controller.signal };
  };

  const rethrow = (error, fallback) => {
    if (error && error.name) {
      // Reconstruct a faithful DOMException so the site sees the right error type.
      return typeof DOMException === "function"
        ? new DOMException(error.message || error.name, error.name)
        : Object.assign(new Error(error.message || error.name), { name: error.name });
    }
    return fallback;
  };

  navigator.credentials.create = async function (options) {
    if (!options?.publicKey) {
      return nativeCreate(options);
    }
    // A create ceremony is modal; cancel any outstanding conditional get so the platform is free.
    cancelPendingConditional();
    try {
      console.debug("[passbolt.fido2] intercepted navigator.credentials.create", options.publicKey?.rp);
      const payload = { options: serializeCreateOptions(options.publicKey), origin: window.location.origin };
      const result = await sendRequest("create", payload);
      console.debug("[passbolt.fido2] create response", result ? "credential" : "null (fallback)");
      if (!result) {
        // Provider declined to handle it -> let the platform authenticator try.
        return nativeCreate(options);
      }
      return deserializeCredential(result);
    } catch (error) {
      console.debug("[passbolt.fido2] create error", error);
      postReport(error, "page-script.create");
      if (error?.name === "NotAllowedError" || error?.delegateToPlatform) {
        return nativeCreate(options);
      }
      throw rethrow(error, error);
    }
  };

  navigator.credentials.get = async function (options) {
    if (!options?.publicKey) {
      return nativeGet(options);
    }
    // Conditional mediation (autofill): coexist with the platform's native autofill (which lists the
    // OS/browser passkeys) AND offer our Passbolt passkeys. The native request stays pending so its
    // autofill dropdown still appears; in parallel our relay surfaces our passkeys when the user
    // focuses the login field. Whichever the user picks resolves the site's single promise; the other
    // is aborted. The promise may legitimately never resolve (user ignores autofill) — allowed here.
    if (options.mediation === MEDIATION_CONDITIONAL) {
      const native = nativeGet(withConditionalTracking(options));
      const ours = requestConditional({
        options: serializeGetOptions(options.publicKey),
        origin: window.location.origin,
      });
      const outcome = await Promise.race([
        native.then(
          (result) => ({ who: "native", result }),
          (error) => ({ who: "native", error }),
        ),
        ours.then(
          (result) => ({ who: "ours", result }),
          () => ({ who: "ours", result: null }),
        ),
      ]);
      if (outcome.who === "ours") {
        if (outcome.result) {
          cancelPendingConditional(); // our passkey won -> free the platform
          return deserializeCredential(outcome.result);
        }
        return native; // user dismissed our menu -> keep waiting on native autofill
      }
      if (outcome.error) {
        throw rethrow(outcome.error, outcome.error);
      }
      return outcome.result; // native autofill resolved
    }
    // A modal get is about to run; free the platform from any pending conditional get we delegated.
    cancelPendingConditional();
    try {
      console.debug("[passbolt.fido2] intercepted navigator.credentials.get", options.publicKey?.rpId);
      const payload = {
        options: serializeGetOptions(options.publicKey),
        origin: window.location.origin,
        mediation: options.mediation,
        conditional: options.mediation === MEDIATION_CONDITIONAL,
      };
      const result = await sendRequest("get", payload);
      console.debug("[passbolt.fido2] get response", result ? "assertion" : "null (fallback)");
      if (!result) {
        return nativeGet(options);
      }
      return deserializeCredential(result);
    } catch (error) {
      console.debug("[passbolt.fido2] get error", error);
      postReport(error, "page-script.get");
      // Mirror create(): if the user dismissed our popup (NotAllowedError) or the provider declined,
      // fall back to the platform authenticator instead of erroring the site (Dashlane coexistence).
      if (error?.name === "NotAllowedError" || error?.delegateToPlatform) {
        return nativeGet(options);
      }
      throw rethrow(error, error);
    }
  };

  // Advertise conditional mediation support (Dashlane-style autofill) while leaving the platform
  // authenticator availability answer to the real implementation (coexistence, no hijacking).
  if (typeof PublicKeyCredential === "function") {
    const nativeIsCMA = PublicKeyCredential.isConditionalMediationAvailable?.bind(PublicKeyCredential);
    PublicKeyCredential.isConditionalMediationAvailable = async function () {
      try {
        if (nativeIsCMA && (await nativeIsCMA())) {
          return true;
        }
      } catch {
        /* ignore and fall through to provider capability */
      }
      return true;
    };
  }
})();
