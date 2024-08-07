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
 * @since         4.10.0
 */
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";

const ENTITY_NAME = 'ResourceMetadataEntity';
const RESOURCE_NAME_MAX_LENGTH = 255;
const RESOURCE_USERNAME_MAX_LENGTH = 255;
const RESOURCE_URI_MAX_LENGTH = 1024;
const RESOURCE_DESCRIPTION_MAX_LENGTH = 10000;
const METADATA_OBJECT_TYPE = "PASSBOLT_METADATA_V5";

class ResourceMetadataEntity extends EntityV2 {
  /**
   * Get resource metadata entity schema
   * @throws TypeError unsupported
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "name"
      ],
      "properties": {
        "object_type": {
          "type": "string",
          "enum": [METADATA_OBJECT_TYPE]
        },
        "resource_type_id": {
          "type": "string",
          "format": "uuid",
          "nullable": true, // Nullable is allowed to have compatibility if resource id is undefined @TODO Remove after migration
        },
        "name": {
          "type": "string",
          "maxLength": RESOURCE_NAME_MAX_LENGTH
        },
        "username": {
          "type": "string",
          "maxLength": RESOURCE_USERNAME_MAX_LENGTH,
          "nullable": true,
        },
        "uris": {
          "type": "array", // Validating array of data is not yet supported by the validator @TODO Add validation
          "items": {
            "type": "string",
            "maxLength": RESOURCE_URI_MAX_LENGTH,
            "notEmpty": true
          }
        },
        "description": {
          "type": "string",
          "maxLength": RESOURCE_DESCRIPTION_MAX_LENGTH,
          "nullable": true,
        },
      },
    };
  }

  /**
   * Get resource metadata object type
   * @returns {string} admin or user
   */
  get objectType() {
    return this._props.object_type;
  }

  /**
   * Get resource metadata name
   * @returns {string} admin or user
   */
  get name() {
    return this._props.name;
  }

  /**
   * Get resource metadata username
   * @returns {string} username
   */
  get username() {
    return this._props.username;
  }

  /**
   * Get resource metadata description
   * @returns {(string|null)} description
   */
  get description() {
    return this._props.description || null;
  }

  /**
   * Get the resource type if any
   * @returns {(string|null)} uuid
   */
  get resourceTypeId() {
    return this._props.resource_type_id || null;
  }

  /**
   * Returns the resource metadata uris
   */
  get uris() {
    return this._props.uris || [];
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * ResourceMetadataEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * ResourceMetadataEntity.ENTITY_NAME
   * @returns {string}
   */
  static get METADATA_OBJECT_TYPE() {
    return METADATA_OBJECT_TYPE;
  }
}

export default ResourceMetadataEntity;
