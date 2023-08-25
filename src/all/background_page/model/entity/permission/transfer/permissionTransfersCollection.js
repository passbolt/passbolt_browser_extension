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
import PermissionTransferEntity from "./permissionTransferEntity";
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'PermissionTransfers';

class PermissionTransfersCollection extends EntityCollection {
  /**
   * PermissionTransfers Entity constructor
   *
   * @param {array} permissionTransferDto permission changes DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(permissionTransferDto) {
    super(EntitySchema.validate(
      PermissionTransfersCollection.ENTITY_NAME,
      permissionTransferDto,
      PermissionTransfersCollection.getSchema()
    ));

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(permissionTransfer => {
      this.push(permissionTransfer);
    });

    // The collection cannot be empty
    if (!this.length) {
      throw new EntityValidationError(`The permission transfer collection cannot be empty.`);
    }

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get permissions entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": PermissionTransferEntity.getSchema(),
    };
  }

  /**
   * PermissionTransfersCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * Push a copy of the permission to the list
   * @param {PermissionTransferEntity} permissionTransfer DTO or PermissionTransferEntity
   */
  push(permissionTransfer) {
    if (!permissionTransfer || typeof permissionTransfer !== 'object') {
      throw new TypeError(`PermissionTransfersCollection push parameter should be an object.`);
    }
    if (permissionTransfer instanceof PermissionTransferEntity) {
      permissionTransfer = permissionTransfer.toDto(); // clone
    }
    permissionTransfer = new PermissionTransferEntity(permissionTransfer); // validate
    super.push(permissionTransfer);
  }
}

export default PermissionTransfersCollection;
