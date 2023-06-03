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
 */
import AbstractActionLogEntity from "./abstractActionLogEntity";
import UpdatedPermissionsCollection from "../permission/actionLog/updatedPermissionsCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'PermissionsUpdatedActionLog';

/**
 * Supported action log types
 */
const TYPE_PERMISSIONS_UPDATED = "Permissions.updated";

class PermissionsUpdatedActionLogEntity extends AbstractActionLogEntity {
  /**
   * Action log entity constructor
   *
   * @param {Object} actionLog action log DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(actionLog) {
    super(EntitySchema.validate(
      PermissionsUpdatedActionLogEntity.ENTITY_NAME,
      actionLog,
      PermissionsUpdatedActionLogEntity.getSchema()
    ));

    // Associations
    let permissionsAddedDto = [];
    let permissionsUpdatedDto = [];
    let permissionsRemovedDto = [];
    if (this._props.data) {
      if (this._props.data.permissions) {
        if (this._props.data.permissions.added) {
          permissionsAddedDto = this._props.data.permissions.added;
        }
        if (this._props.data.permissions.updated) {
          permissionsUpdatedDto = this._props.data.permissions.updated;
        }
        if (this._props.data.permissions.removed) {
          permissionsRemovedDto = this._props.data.permissions.removed;
        }
      }
      delete this._props.data;
    }
    this._permissionsAdded = new UpdatedPermissionsCollection(permissionsAddedDto);
    this._permissionsUpdated = new UpdatedPermissionsCollection(permissionsUpdatedDto);
    this._permissionsRemoved = new UpdatedPermissionsCollection(permissionsRemovedDto);
  }

  /**
   * Get action log entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    const schema = AbstractActionLogEntity.getSchema();
    schema.required = [...schema.required, "data"];
    schema.properties.type = {
      "type": "string",
      "enum": PermissionsUpdatedActionLogEntity.ALLOWED_TYPES
    };
    schema.properties.data = {
      "type": "object",
      "required": ["permissions"],
      "properties": {
        "permissions": {
          "type": "object",
          "properties": {
            "added": UpdatedPermissionsCollection.getSchema(),
            "updated": UpdatedPermissionsCollection.getSchema(),
            "removed": UpdatedPermissionsCollection.getSchema()
          }
        }
      }
    };
    return schema;
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */

  /**
   * Return a DTO ready to be sent to API
   *
   * @returns {object}
   */
  toDto() {
    const result = super.toDto();

    result.data = {
      permissions: {
        added: this.permissionsAdded.toDto(),
        updated: this.permissionsUpdated.toDto(),
        removed: this.permissionsRemoved.toDto(),
      }
    };

    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto();
  }

  /*
   * ==================================================
   * Other associated properties methods
   * ==================================================
   */

  /**
   * Get the added permissions
   * @returns {UpdatedPermissionsCollection}
   */
  get permissionsAdded() {
    return this._permissionsAdded;
  }

  /**
   * Get the updated permissions
   * @returns {UpdatedPermissionsCollection}
   */
  get permissionsUpdated() {
    return this._permissionsUpdated;
  }

  /**
   * Get the removed permissions
   * @returns {UpdatedPermissionsCollection}
   */
  get permissionsRemoved() {
    return this._permissionsRemoved;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * ActionLog.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * ActionLog.ALLOWED_TYPES
   * @returns {[string]} List of allowed action logs types
   */
  static get ALLOWED_TYPES() {
    return [
      TYPE_PERMISSIONS_UPDATED
    ];
  }
}

export default PermissionsUpdatedActionLogEntity;
