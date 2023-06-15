/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'AccountRecoveryResponse';
const STATUS_REJECTED = "rejected";
const STATUS_APPROVED = "approved";
const RESPONDER_FOREIGN_MODEL_ORGANIZATION_KEY = "AccountRecoveryOrganizationKey";

class AccountRecoveryResponseEntity extends Entity {
  /**
   * AccountRecoveryResponseEntity entity constructor
   *
   * @param {Object} accountRecoveryResponseDto account recovery Response DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountRecoveryResponseDto) {
    super(EntitySchema.validate(
      AccountRecoveryResponseEntity.ENTITY_NAME,
      accountRecoveryResponseDto,
      AccountRecoveryResponseEntity.getSchema()
    ));
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "account_recovery_request_id",
        "responder_foreign_key",
        "responder_foreign_model",
        "status"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "account_recovery_request_id": {
          "type": "string",
          "format": "uuid"
        },
        "responder_foreign_key": {
          "type": "string",
          "format": "uuid"
        },
        "responder_foreign_model": {
          "type": "string",
          "enum": [this.RESPONDER_FOREIGN_MODEL_ORGANIZATION_KEY]
        },
        "data": {
          "type": "string",
        },
        "status": {
          "type": "string",
          "enum": [this.STATUS_REJECTED, this.STATUS_APPROVED]
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
   * @returns {(string|null)}
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get the status
   * @returns {string}
   */
  get status() {
    return this._props.status;
  }

  /**
   * Get the data
   * @returns {(string|null)}
   */
  get data() {
    return this._props.data || null;
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

  /**
   * Get created by user id
   * @returns {(string|null)} uuid
   */
  get createdBy() {
    return this._props.created_by || null;
  }

  /**
   * Get modified by user id
   * @returns {(string|null)} date
   */
  get modifiedBy() {
    return this._props.modified_by || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AccountRecoveryResponseEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountRecoveryResponseEntity.STATUS_APPROVED
   * @returns {string}
   */
  static get STATUS_APPROVED() {
    return STATUS_APPROVED;
  }

  /**
   * AccountRecoveryResponseEntity.STATUS_REJECTED
   * @returns {string}
   */
  static get STATUS_REJECTED() {
    return STATUS_REJECTED;
  }

  /**
   * AccountRecoveryResponseEntity.RESPONDER_FOREIGN_MODEL_ORGANIZATION_KEY
   */
  static get RESPONDER_FOREIGN_MODEL_ORGANIZATION_KEY() {
    return RESPONDER_FOREIGN_MODEL_ORGANIZATION_KEY;
  }
}

export default AccountRecoveryResponseEntity;
