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

const ENTITY_NAME = 'GroupUserTransfer';

class GroupUserTransferEntity extends Entity {
  /**
   * GroupUserTransfer Entity constructor
   *
   * @param {Object} groupUserTransferDto membership transfers
   * @throws EntityValidationError if the dto cannot be converted into an entity
   * @public
   */
  constructor(groupUserTransferDto) {
    super(EntitySchema.validate(
      GroupUserTransferEntity.ENTITY_NAME,
      groupUserTransferDto,
      GroupUserTransferEntity.getSchema()
    ));
  }

  /**
   * Get managerTransfer entity schema
   *
   * @returns {Object} schema
   * @public
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "id", // Group user id
        "group_id", // Group ID
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "group_id": {
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
   * Get the group user ID
   * This is the membership ID of the user that will be promoted to manager
   *
   * @returns {string} uuid
   * @public
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get affected group id
   *
   * @returns {string} uuid
   * @public
   */
  get groupId() {
    return this._props.group_id;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * GroupUserTransferEntity.ENTITY_NAME
   *
   * @returns {string}
   * @public
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default GroupUserTransferEntity;
