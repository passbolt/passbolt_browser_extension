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
import AccountRecoveryPrivateKeyEntity from "./accountRecoveryPrivateKeyEntity";
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";


const ENTITY_NAME = 'AccountRecoveryUserSetting';
const STATUS_APPROVED = 'approved';
const STATUS_REJECTED = 'rejected';

class AccountRecoveryUserSettingEntity extends Entity {
  /**
   * Resource entity constructor
   *
   * @param {Object} accountRecoveryUserSettingDto Account recovery user setting DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountRecoveryUserSettingDto) {
    super(EntitySchema.validate(
      AccountRecoveryUserSettingEntity.ENTITY_NAME,
      accountRecoveryUserSettingDto,
      AccountRecoveryUserSettingEntity.getSchema()
    ));

    if (this._props.account_recovery_private_key) {
      this._account_recovery_private_key = new AccountRecoveryPrivateKeyEntity(this._props.account_recovery_private_key);
      delete this._props.account_recovery_private_key;
    }
  }

  /**
   * Get resource entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
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
        "status": {
          "type": "string",
          "enum": [
            AccountRecoveryUserSettingEntity.STATUS_APPROVED,
            AccountRecoveryUserSettingEntity.STATUS_REJECTED
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
        "created_by": {
          "type": "string",
          "format": "uuid"
        },
        "modified_by": {
          "type": "string",
          "format": "uuid"
        },
        "account_recovery_private_key": AccountRecoveryPrivateKeyEntity.getSchema(),
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
   *
   * @param {object} [contain] optional
   * @returns {object}
   */
  toDto(contain) {
    const result = Object.assign({}, this._props);
    if (this._account_recovery_private_key && contain?.account_recovery_private_key) {
      result.account_recovery_private_key = this._account_recovery_private_key.toDto(AccountRecoveryPrivateKeyEntity.ALL_CONTAIN_OPTIONS);
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto();
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  get status() {
    return this._props.status;
  }

  /**
   * Return true if the user accepted to enroll to the account recovery program
   * @returns {boolean}
   */
  get isApproved() {
    return this.status === AccountRecoveryUserSettingEntity.STATUS_APPROVED;
  }

  /**
   * Return true if the user refused to enroll to the account recovery program
   * @returns {boolean}
   */
  get isRejected() {
    return this.status === AccountRecoveryUserSettingEntity.STATUS_REJECTED;
  }

  /*
   * ==================================================
   * Dynamic properties setters
   * ==================================================
   */

  /**
   * Get the user account recovery private key
   * @returns {(AccountRecoveryPrivateKeyEntity|null)}
   */
  get accountRecoveryPrivateKey() {
    return this._account_recovery_private_key || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AccountRecoveryUserSettingEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountRecoveryUserSettingEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {
      account_recovery_private_key: true,
    };
  }

  /**
   * AccountRecoveryUserSettingEntity.STATUS_APPROVED
   * @returns {string}
   */
  static get STATUS_APPROVED() {
    return STATUS_APPROVED;
  }

  /**
   * AccountRecoveryUserSettingEntity.STATUS_REJECTED
   * @returns {string}
   */
  static get STATUS_REJECTED() {
    return STATUS_REJECTED;
  }
}

export default AccountRecoveryUserSettingEntity;
