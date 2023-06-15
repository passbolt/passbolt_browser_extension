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
import AccountRecoveryPrivateKeyPasswordsCollection from "./accountRecoveryPrivateKeyPasswordsCollection";

const ENTITY_NAME = "AccountRecoveryPrivateKey";

/**
 * Entity related to the account recovery private key
 */
class AccountRecoveryPrivateKeyEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} accountRecoveryPrivateKeyDto account recovery organization public key DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountRecoveryPrivateKeyDto) {
    super(EntitySchema.validate(
      AccountRecoveryPrivateKeyEntity.ENTITY_NAME,
      accountRecoveryPrivateKeyDto,
      AccountRecoveryPrivateKeyEntity.getSchema()
    ));

    // Associations
    if (this._props.account_recovery_private_key_passwords) {
      const sanitizedCollection = AccountRecoveryPrivateKeyPasswordsCollection.sanitizeDto(this._props.account_recovery_private_key_passwords);
      this._account_recovery_private_key_passwords = new AccountRecoveryPrivateKeyPasswordsCollection(sanitizedCollection);
      delete this._props.account_recovery_private_key_passwords;
    }
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "user_id": {
          "type": "string",
          "format": "uuid"
        },
        "data": {
          "type": "string"
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
        "account_recovery_private_key_passwords": AccountRecoveryPrivateKeyPasswordsCollection.getSchema(),
      }
    };
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API or content code
   *
   * @param {object} [contain] optional
   * @returns {object}
   */
  toDto(contain) {
    const result = Object.assign({}, this._props);
    if (!contain) {
      return result;
    }
    if (this._account_recovery_private_key_passwords && contain.account_recovery_private_key_passwords) {
      result.account_recovery_private_key_passwords = this._account_recovery_private_key_passwords.toDto();
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(AccountRecoveryPrivateKeyEntity.ALL_CONTAIN_OPTIONS);
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get the id
   * @returns {string|null}
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get the user id
   * @returns {string|null}
   */
  get userId() {
    return this._props.user_id || null;
  }

  /**
   * Get data
   * @returns {string|null} armored pgp message
   */
  get data() {
    return this._props.data || null;
  }

  /**
   * Get the associated account recovery private key passwords
   * @returns {AccountRecoveryPrivateKeyPasswordsCollection|null}
   */
  get accountRecoveryPrivateKeyPasswords() {
    return this._account_recovery_private_key_passwords || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AccountRecoveryPrivateKeyEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountRecoveryPrivateKeyEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {
      account_recovery_private_key_passwords: true,
    };
  }
}

export default AccountRecoveryPrivateKeyEntity;
