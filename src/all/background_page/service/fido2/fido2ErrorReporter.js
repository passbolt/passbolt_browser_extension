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

/*
 * Temporary debugging aid: ships passkey-provider errors to a GlitchTip project so they can be
 * inspected during the live-integration bring-up. Runs in the service worker (no page CSP applies)
 * and never throws. To be removed once the ceremony is stable.
 */
const INGEST_URL = "https://errors.brf.sh/api/6/store/?sentry_key=e15ab7b3fc3c4b1a86991408323bb468";

class Fido2ErrorReporter {
  /**
   * Report an error to GlitchTip. Never throws.
   * @param {Error|object|string} error
   * @param {object} [context] {context: string, extra: object}
   * @returns {Promise<void>}
   */
  static async report(error, context = {}) {
    try {
      const isObject = error && typeof error === "object";
      const event = {
        event_id: Fido2ErrorReporter._eventId(),
        timestamp: new Date().toISOString(),
        platform: "javascript",
        level: "error",
        logger: "passbolt.fido2",
        exception: {
          values: [
            {
              type: (isObject && (error.name || error.type)) || "Error",
              value: isObject ? error.message || JSON.stringify(error) : String(error),
            },
          ],
        },
        tags: { feature: "passkey-provider", context: context.context || "unknown" },
        extra: { stack: isObject ? error.stack : undefined, ...(context.extra || {}) },
      };
      await fetch(INGEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
        keepalive: true,
      });
    } catch (reportingError) {
      // Never let error reporting break the flow.
      console.debug("[passbolt.fido2] error reporting failed", reportingError);
    }
  }

  /**
   * Generate a 32 char hex event id.
   * @returns {string}
   * @private
   */
  static _eventId() {
    try {
      return crypto.randomUUID().replace(/-/g, "");
    } catch {
      let id = "";
      for (let i = 0; i < 32; i++) {
        id += Math.floor(Math.random() * 16).toString(16);
      }
      return id;
    }
  }
}

export default Fido2ErrorReporter;
