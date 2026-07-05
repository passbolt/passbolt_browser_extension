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
 * Validates the relationship between a WebAuthn call origin and the requested relying party id,
 * following the WebAuthn rules (§5.1.3 / §7.1) with a pragmatic registrable-suffix check.
 *
 * A full public-suffix-list check is intentionally deferred (Phase 5 hardening); this guards the
 * common attacks (cross-site rpId, bare TLD rpId, insecure origin) the way consumer password
 * managers do.
 */
class WebauthnOriginValidationService {
  /**
   * Resolve and validate the effective relying party id for a ceremony.
   *
   * @param {string|undefined} rpId the requested relying party id (may be undefined -> defaults to host)
   * @param {string} origin the caller origin (e.g. "https://app.example.com")
   * @returns {string} the effective relying party id
   * @throws {Error} if the origin is insecure or the rpId is not allowed for the origin
   */
  static resolveRpId(rpId, origin) {
    const host = WebauthnOriginValidationService.assertSecureOriginHost(origin);

    if (!rpId) {
      return host;
    }
    const normalizedRpId = rpId.toLowerCase();
    if (normalizedRpId === host) {
      return normalizedRpId;
    }
    // rpId must be a registrable domain suffix of the host, on a label boundary.
    if (host.endsWith(`.${normalizedRpId}`) && WebauthnOriginValidationService._isRegistrable(normalizedRpId)) {
      return normalizedRpId;
    }
    throw new Error(`The relying party id "${rpId}" is not allowed for origin "${origin}".`);
  }

  /**
   * Ensure the origin is a secure context (https, or a localhost http origin) and return its host.
   * @param {string} origin
   * @returns {string} the lowercase hostname
   * @throws {Error} if the origin is not a valid secure context
   */
  static assertSecureOriginHost(origin) {
    let url;
    try {
      url = new URL(origin);
    } catch {
      throw new Error(`Invalid origin "${origin}".`);
    }
    const host = url.hostname.toLowerCase();
    const isLocalhost = host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost");
    if (url.protocol !== "https:" && !isLocalhost) {
      throw new Error(`WebAuthn requires a secure origin, got "${origin}".`);
    }
    return host;
  }

  /**
   * Reject rpIds that are a bare public suffix (no registrable label), e.g. "com" or "co.uk".
   * Pragmatic heuristic: require at least one dot. A full PSL check is a Phase 5 hardening.
   * @param {string} rpId
   * @returns {boolean}
   * @private
   */
  static _isRegistrable(rpId) {
    return rpId.includes(".");
  }
}

export default WebauthnOriginValidationService;
