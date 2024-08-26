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
 * @since         3.0.0
 */
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";

const RESOURCE_TYPE_NAME_MAX_LENGTH = 255;
const RESOURCE_TYPE_SLUG_MAX_LENGTH = 64;
const RESOURCE_TYPE_DESCRIPTION_MAX_LENGTH = 255;

export const RESOURCE_TYPE_PASSWORD_STRING_SLUG = "password-string";
export const RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG = "password-and-description";
export const RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG = "password-description-totp";
export const RESOURCE_TYPE_TOTP_SLUG = "totp";

class ResourceTypeEntity extends EntityV2 {
  /**
   * Get resource type entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "id",
        "name",
        "slug",
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": RESOURCE_TYPE_NAME_MAX_LENGTH
        },
        "slug": {
          "type": "string",
          "minLength": 1,
          "maxLength": RESOURCE_TYPE_SLUG_MAX_LENGTH
        },
        "definition": {
          "type": "object"
        },
        "description": {
          "type": "string",
          "maxLength": RESOURCE_TYPE_DESCRIPTION_MAX_LENGTH,
          "nullable": true,
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
      }
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get resource type id
   * @returns {string} uuid
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get resource type slug
   * @returns {string} slug
   */
  get slug() {
    return this._props.slug;
  }

  /**
   * Get resource type definition (JSON compatible schema)
   * @returns {object|null} definition
   */
  get definition() {
    return this._props.definition || null;
  }
}

export default ResourceTypeEntity;
