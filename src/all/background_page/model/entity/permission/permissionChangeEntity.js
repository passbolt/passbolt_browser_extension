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
 * @since         2.13.0
 */
const {Entity} = require('../abstract/entity');
const {EntitySchema} = require('../abstract/entitySchema');
const {PermissionEntity} = require('./permissionEntity');

const ENTITY_NAME = 'PermissionChange';

class PermissionChangeEntity extends Entity {
  /**
   * Permission entity constructor
   *
   * @param {Object} permissionChangesDto data transfer object
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(permissionChangesDto) {
    super(EntitySchema.validate(
      PermissionChangeEntity.ENTITY_NAME,
      permissionChangesDto,
      PermissionChangeEntity.getSchema()
    ));
  }

  /**
   * A permission change is basically a Permission entity
   * Without the dates, without the associated data like user, group, etc.
   * With additional deleted fields (boolean flags)
   */
  static getSchema() {
    let schema = PermissionEntity.getSchema();
    let whitelistProps = schema.required;
    let extendedSchema = {
      "type": "object",
      "required": schema.required,
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "delete": {
          "type": "boolean",
        }
      }
    };

    whitelistProps.forEach(prop => {
      extendedSchema.properties[prop] = schema.properties[prop];
    });

    return extendedSchema;
  }

  // ==================================================
  // Dynamic properties getters
  // ==================================================
  /**
   * Get permission id
   * @returns {string|null} uuid if set
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get ACO - Access Control Object
   * @returns {string} Group or User
   */
  get aco() {
    return this._props.aco;
  }

  /**
   * Get ARO - Access Request Object
   * @returns {string} Resource or Folder
   */
  get aro() {
    return this._props.aro;
  }

  /**
   * Get ARO id
   * @returns {string} uuid
   */
  get aroForeignKey() {
    return this._props.aro_foreign_key;
  }

  /**
   * Get ACO id
   * @returns {string} uuid
   */
  get acoForeignKey() {
    return this._props.aco_foreign_key;
  }

  /**
   * Get permission type
   * @returns {int} 1: read, 5: update, 15: admin
   */
  get type() {
    return this._props.type;
  }

  /**
   * Get deleted status flag
   * @returns {boolean} true if deleted
   */
  get isDeleted() {
    return this._props.deleted || null;
  }

  // ==================================================
  // Static properties getters
  // ==================================================
  /**
   * PermissionEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

exports.PermissionChangeEntity = PermissionChangeEntity;
