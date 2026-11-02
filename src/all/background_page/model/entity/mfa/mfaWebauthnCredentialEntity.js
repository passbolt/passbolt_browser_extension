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
import { AAGUID_PATTERN } from "./webauthnSetupCeremonyEntity";

/**
 * A WebAuthn credential registered by the user as MFA provider.
 */
class MfaWebauthnCredentialEntity extends EntityV2 {
  /**
   * Get the entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      type: "object",
      required: ["id", "credential_id", "aaguid", "name", "sign_count", "created", "modified"],
      properties: {
        id: {
          type: "string",
          format: "uuid",
        },
        credential_id: {
          type: "string",
          minLength: 1,
        },
        aaguid: {
          type: "string",
          pattern: AAGUID_PATTERN,
          nullable: true,
        },
        name: {
          type: "string",
          maxLength: 255,
          nullable: true,
        },
        sign_count: {
          type: "integer",
          minimum: 0,
        },
        last_used: {
          type: "string",
          format: "date-time",
          nullable: true,
        },
        created: {
          type: "string",
          format: "date-time",
        },
        modified: {
          type: "string",
          format: "date-time",
        },
      },
    };
  }

  /**
   * @returns {string}
   */
  get id() {
    return this._props.id;
  }

  /**
   * @returns {string}
   */
  get credentialId() {
    return this._props.credential_id;
  }

  /**
   * @returns {string|null}
   */
  get aaguid() {
    return this._props.aaguid || null;
  }

  /**
   * @returns {string|null}
   */
  get name() {
    return this._props.name || null;
  }

  /**
   * @returns {number}
   */
  get signCount() {
    return this._props.sign_count;
  }

  /**
   * @returns {string|null}
   */
  get lastUsed() {
    return this._props.last_used || null;
  }

  /**
   * @returns {string}
   */
  get created() {
    return this._props.created;
  }

  /**
   * @returns {string}
   */
  get modified() {
    return this._props.modified;
  }
}

export default MfaWebauthnCredentialEntity;
