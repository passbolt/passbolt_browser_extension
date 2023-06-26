/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.12.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = "PendingAccountRecoveryRequest";
const STATUS_PENDING = "pending";

class PendingAccountRecoveryEntity extends Entity {
  /**
   * @inheritDoc
   */
  constructor(dto = {}) {
    super(EntitySchema.validate(
      PendingAccountRecoveryEntity.ENTITY_NAME,
      dto,
      PendingAccountRecoveryEntity.getSchema()
    ));
  }

  /**
   * @inheritDoc
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "id",
        "status"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "status": {
          "type": "string",
          "enum": [STATUS_PENDING]
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
        "created_by": {
          "type": "string",
          "format": "uuid"
        },
        "modified_by": {
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
   * Get the id
   * @returns {string}
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get the status
   * @returns {string} status
   */
  get status() {
    return this._props.status;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * PendingAccountRecoveryRequest.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default PendingAccountRecoveryEntity;
