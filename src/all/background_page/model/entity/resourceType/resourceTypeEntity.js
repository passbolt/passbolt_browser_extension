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
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'ResourceType';
const RESOURCE_TYPE_NAME_MAX_LENGTH = 255;
const RESOURCE_TYPE_SLUG_MAX_LENGTH = 64;
const RESOURCE_TYPE_DESCRIPTION_MAX_LENGTH = 255;

export const RESOURCE_TYPE_PASSWORD_STRING_SLUG = "password-string";
export const RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG = "password-and-description";
export const RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG = "password-description-totp";
export const RESOURCE_TYPE_TOTP_SLUG = "totp";

class ResourceTypeEntity extends Entity {
  /**
   * @inheritDoc
   */
  constructor(resourceTypeDto, options = {}) {
    super(EntitySchema.validate(
      ResourceTypeEntity.ENTITY_NAME,
      resourceTypeDto,
      ResourceTypeEntity.getSchema()
    ), options);
  }

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
          "anyOf": [{
            "type": "string",
            "maxLength": RESOURCE_TYPE_DESCRIPTION_MAX_LENGTH
          }, {
            "type": "null"
          }]
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
   * Get resource type name
   * @returns {string} name
   */
  get name() {
    return this._props.name;
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
   * @returns {string} definition
   */
  get definition() {
    return this._props.definition;
  }

  /**
   * Get resource type description
   * @returns {(string|null)} description
   */
  get description() {
    return this._props.description || null;
  }

  /**
   * Get created date
   * @returns {(string|null)} date
   */
  get created() {
    return this._props.created || null;
  }

  /**
   * Get modified date
   * @returns {(string|null)} date
   */
  get modified() {
    return this._props.modified || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * ResourceTypeEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default ResourceTypeEntity;
