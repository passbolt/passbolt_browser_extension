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
import GroupUserTransferEntity from "./groupUserTransferEntity";
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'GroupUserTransfers';

class GroupUserTransfersCollection extends EntityCollection {
  /**
   * GroupUserTransfers Entity constructor
   *
   * @param {array} groupUserTransferDto groupUser changes DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(groupUserTransferDto) {
    super(EntitySchema.validate(
      GroupUserTransfersCollection.ENTITY_NAME,
      groupUserTransferDto,
      GroupUserTransfersCollection.getSchema()
    ));

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(groupUserTransfer => {
      this.push(groupUserTransfer);
    });

    // The collection cannot be empty
    if (!this.length) {
      throw new EntityValidationError(`The group user transfer collection cannot be empty.`);
    }

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get groupUsers entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": GroupUserTransferEntity.getSchema(),
    };
  }

  /**
   * GroupUserTransfersCollection.ENTITY_NAME
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
   * Push a copy of the groupUser to the list
   * @param {GroupUserTransferEntity} groupUserTransfer DTO or GroupUserTransferEntity
   */
  push(groupUserTransfer) {
    if (!groupUserTransfer || typeof groupUserTransfer !== 'object') {
      throw new TypeError(`GroupUserTransfersCollection push parameter should be an object.`);
    }
    if (groupUserTransfer instanceof GroupUserTransferEntity) {
      groupUserTransfer = groupUserTransfer.toDto(); // clone
    }
    groupUserTransfer = new GroupUserTransferEntity(groupUserTransfer); // validate
    super.push(groupUserTransfer);
  }
}

export default GroupUserTransfersCollection;
