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
import AuthenticationTokenEntity from "../authenticationToken/authenticationTokenEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'transfer';

const TRANSFER_STATUS_START = 'start';
const TRANSFER_STATUS_IN_PROGRESS = 'in progress';
const TRANSFER_STATUS_COMPLETE = 'complete';
const TRANSFER_STATUS_CANCEL = 'cancel';
const TRANSFER_STATUS_ERROR = 'error';

class TransferEntity extends Entity {
  /**
   * Transfer entity constructor
   *
   * @param {Object} transferDto transfer DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(transferDto) {
    super(EntitySchema.validate(
      TransferEntity.ENTITY_NAME,
      transferDto,
      TransferEntity.getSchema()
    ));

    // Associations
    if (this._props.authentication_token) {
      this._authentication_token = new AuthenticationTokenEntity(this._props.authentication_token);
      delete this._props.authentication_token;
    }
  }

  /**
   * Get transfer entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        'total_pages'
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "user_id": {
          "type": "string",
          "format": "uuid"
        },
        "hash": {
          "type": "string"
        },
        "current_page": {
          "type": "integer"
        },
        "total_pages": {
          "type": "integer"
        },
        "status": {
          "type": "string",
          "enum": [
            TransferEntity.TRANSFER_STATUS_START,
            TransferEntity.TRANSFER_STATUS_COMPLETE,
            TransferEntity.TRANSFER_STATUS_IN_PROGRESS,
            TransferEntity.TRANSFER_STATUS_ERROR,
            TransferEntity.TRANSFER_STATUS_CANCEL
          ]
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
        // Associated models
        "authentication_token": AuthenticationTokenEntity.getSchema(),
      }
    };
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API
   * @param {object} [contain] optional for example {profile: {avatar:true}}
   * @returns {*}
   */
  toDto(contain) {
    const result = Object.assign({}, this._props);
    if (!contain) {
      return result;
    }
    if (this._authentication_token && contain.authentication_token) {
      result.authentication_token = this._authentication_token.toDto();
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(TransferEntity.ALL_CONTAIN_OPTIONS);
  }

  /**
   * GroupEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {
      'authentication_token': true,
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get transfer id
   * @returns {string} uuid
   */
  get id() {
    return this._props.id;
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

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * TransferEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * TransferEntity.TRANSFER_STATUS_START
   * @returns {string}
   */
  static get TRANSFER_STATUS_START() {
    return TRANSFER_STATUS_START;
  }

  /**
   * TransferEntity.TRANSFER_STATUS_IN_PROGRESS
   * @returns {string} in progress
   */
  static get TRANSFER_STATUS_IN_PROGRESS() {
    return TRANSFER_STATUS_IN_PROGRESS;
  }

  /**
   * TransferEntity.TRANSFER_STATUS_COMPLETE
   * @returns {string} complete
   */
  static get TRANSFER_STATUS_COMPLETE() {
    return TRANSFER_STATUS_COMPLETE;
  }

  /**
   * TransferEntity.TRANSFER_STATUS_CANCEL
   * @returns {string} cancel
   */
  static get TRANSFER_STATUS_CANCEL() {
    return TRANSFER_STATUS_CANCEL;
  }

  /**
   * TransferEntity.TRANSFER_STATUS_ERROR
   * @returns {string} error
   */
  static get TRANSFER_STATUS_ERROR() {
    return TRANSFER_STATUS_ERROR;
  }
}

export default TransferEntity;
