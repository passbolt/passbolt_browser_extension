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

class PermissionChangesEntity extends Entity {

  /**
   * A permission change is basically a Permission entity
   * Without the dates, without the associated data like user, group, etc.
   * With additional deleted fields (boolean flags)
   */
  static getSchema() {
    let schema = PermissionEntity.getSchema();
    schema = schema[PermissionEntity.ENTITY_NAME];
    let whitelistProps = schema.required;
    let extendedSchema = {
      "PermissionChanges": {
        "type": "object",
        "required": schema.required,
        "properties": {
          "deleted": {
            "type": "boolean",
          },
        }
      }
    };
    whitelistProps.forEach(prop => {
      extendedSchema.PermissionChanges.properties[prop] = schema.properties[prop];
    });
  }

  /**
   * Folder entity constructor
   *
   * @param {Object} permissionChangesDto data transfer object
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(permissionChangesDto) {
    super();

    this._props = EntitySchema.validate(
      PermissionChangesEntity.ENTITY_NAME,
      permissionChangesDto,
      PermissionChangesEntity.getSchema()
    );
  }

  get id() {
    return this._props.id;
  }

  get aro() {
    return this._props.aro;
  }

  get aco() {
    return this._props.aco;
  }

  get acoForeignKey() {
    return this._props.aco_foreign_key;
  }

  get aroForeignKey() {
    return this._props.aro_foreign_key;
  }

  get type() {
    return this._props.type;
  }

  get isDeleted() {
    return this._props.deleted || null;
  }
}
