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
import AccountRecoveryResponsesCollection from "./accountRecoveryResponsesCollection";
import AccountRecoveryPrivateKeyEntity from "./accountRecoveryPrivateKeyEntity";
import UserEntity from "../user/userEntity";

const ENTITY_NAME = "AccountRecoveryRequest";
const FINGERPRINT_LENGTH = 40;
const STATUS_PENDING = "pending";
const STATUS_REJECTED = "rejected";
const STATUS_APPROVED = "approved";
const STATUS_COMPLETED = "completed";

class AccountRecoveryRequestEntity extends Entity {
  /**
   * @inheritDoc
   */
  constructor(accountRecoveryRequestDto = {}) {
    super(EntitySchema.validate(
      AccountRecoveryRequestEntity.ENTITY_NAME,
      accountRecoveryRequestDto,
      AccountRecoveryRequestEntity.getSchema()
    ));

    // Associations
    if (this._props.account_recovery_private_key) {
      this._account_recovery_private_key = new AccountRecoveryPrivateKeyEntity(this._props.account_recovery_private_key);
      delete this._props.account_recovery_private_key;
    }
    if (this._props.account_recovery_responses) {
      this._account_recovery_responses = new AccountRecoveryResponsesCollection(this._props.account_recovery_responses);
      delete this._props.account_recovery_responses;
    }
    if (this._props.creator) {
      this._creator = new UserEntity(this._props.creator);
      delete this._props.creator;
    }
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
        "user_id": {
          "type": "string",
          "format": "uuid"
        },
        "armored_key": {
          "type": "string",
        },
        "fingerprint": {
          "anyOf": [{
            "type": "string",
            "length": FINGERPRINT_LENGTH
          }, {
            "type": "null"
          }]
        },
        "status": {
          "type": "string",
          "enum": [STATUS_PENDING, STATUS_REJECTED, STATUS_APPROVED, STATUS_COMPLETED]
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
        // Associated models
        "account_recovery_private_key": AccountRecoveryPrivateKeyEntity.getSchema(),
        "creator": UserEntity.getSchema(),
        "account_recovery_responses": AccountRecoveryResponsesCollection.getSchema(),
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
   * @param {object} [contain] optional for example {user: true}
   * @returns {*}
   */
  toDto(contain) {
    const result = Object.assign({}, this._props);
    if (!contain) {
      return result;
    }
    if (this.accountRecoveryPrivateKey && contain.account_recovery_private_key) {
      result.account_recovery_private_key = this.accountRecoveryPrivateKey.toDto(AccountRecoveryPrivateKeyEntity.ALL_CONTAIN_OPTIONS);
    }
    if (this.creator && contain.creator) {
      result.creator = this.creator.toDto(UserEntity.ALL_CONTAIN_OPTIONS);
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(AccountRecoveryRequestEntity.ALL_CONTAIN_OPTIONS);
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
   * Get the user id
   * @returns {string}
   */
  get userId() {
    return this._props.user_id;
  }

  /**
   * Get the status
   * @returns {string} status
   */
  get status() {
    return this._props.status;
  }

  /**
   * Get the armored key
   * @returns {string} armored_key
   */
  get armoredKey() {
    return this._props.armored_key;
  }

  /**
   * AccountRecoveryRequestEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {account_recovery_private_key: true, creator: true};
  }

  /*
   * ==================================================
   * Associated properties getters
   * ==================================================
   */

  /**
   * Get the request creator
   * @returns {UserEntity|null}
   */
  get creator() {
    return this._creator || null;
  }

  /**
   * Get the account recovery private key
   * @returns {AccountRecoveryPrivateKeyEntity || null} account_recovery_private_key
   */
  get accountRecoveryPrivateKey() {
    return this._account_recovery_private_key || null;
  }

  /**
   * Get the account recovery responses
   * @returns {AccountRecoveryResponsesCollection || null}
   */
  get accountRecoveryResponses() {
    return this._account_recovery_responses || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * ResourceEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default AccountRecoveryRequestEntity;
