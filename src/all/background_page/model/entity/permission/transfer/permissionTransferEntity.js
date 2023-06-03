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
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'PermissionTransfer';

class PermissionTransferEntity extends Entity {
  /**
   * PermissionTransfer Entity constructor
   *
   * @param {Object} permissionTransferDto permission transfer
   * @throws EntityValidationError if the dto cannot be converted into an entity
   * @public
   */
  constructor(permissionTransferDto) {
    super(EntitySchema.validate(
      PermissionTransferEntity.ENTITY_NAME,
      permissionTransferDto,
      PermissionTransferEntity.getSchema()
    ));
  }

  /**
   * Get permissionTransfer entity schema
   *
   * @returns {Object} schema
   * @public
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "id", // Permission ID to promote to permission
        "aco_foreign_key", // Resource or Folder UUID
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "aco_foreign_key": {
          "type": "string",
          "format": "uuid"
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
   * Get permission id
   *
   * @returns {string} uuid
   * @public
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get target resource or folder uuid
   *
   * @returns {string} uuid
   * @public
   */
  get acoForeignKey() {
    return this._props.aco_foreign_key;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * PermissionTransferEntity.ENTITY_NAME
   *
   * @returns {string}
   * @public
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default PermissionTransferEntity;
