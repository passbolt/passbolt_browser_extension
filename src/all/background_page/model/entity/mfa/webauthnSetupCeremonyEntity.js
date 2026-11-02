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
 * @since         5.17.0
 */
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";

const CEREMONY_TTL_MS = 5 * 60 * 1000;
// dashed hex of the 16 authenticator bytes; not an RFC 4122 uuid for some authenticators
export const AAGUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * The pending WebAuthn setup ceremony kept in session storage between begin, result and finish.
 */
class WebauthnSetupCeremonyEntity extends EntityV2 {
  /**
   * Get the entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      type: "object",
      required: ["id", "tab_id", "handle", "started_at"],
      properties: {
        id: {
          type: "string",
          format: "uuid",
        },
        tab_id: {
          type: "integer",
        },
        handle: {
          type: "string",
          minLength: 1,
        },
        started_at: {
          type: "string",
          format: "date-time",
        },
        credential: {
          type: "object",
          nullable: true,
        },
        aaguid: {
          type: "string",
          pattern: AAGUID_PATTERN,
          nullable: true,
        },
      },
    };
  }

  /**
   * The ceremony time to live in milliseconds, counted from started_at.
   * @returns {number}
   */
  static get TTL_MS() {
    return CEREMONY_TTL_MS;
  }

  /**
   * @returns {string}
   */
  get id() {
    return this._props.id;
  }

  /**
   * @returns {number}
   */
  get tabId() {
    return this._props.tab_id;
  }

  /**
   * @returns {string}
   */
  get handle() {
    return this._props.handle;
  }

  /**
   * @returns {object|null}
   */
  get credential() {
    return this._props.credential || null;
  }

  /**
   * @returns {string|null}
   */
  get aaguid() {
    return this._props.aaguid || null;
  }

  /**
   * Is the ceremony older than its time to live
   * @returns {boolean}
   */
  get isExpired() {
    return Date.now() - Date.parse(this._props.started_at) > CEREMONY_TTL_MS;
  }

  /**
   * Has the content script delivered a credential
   * @returns {boolean}
   */
  get hasCredential() {
    return Boolean(this._props.credential);
  }
}

export default WebauthnSetupCeremonyEntity;
