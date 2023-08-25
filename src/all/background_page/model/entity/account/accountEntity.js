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
 */

import AbstractAccountEntity from "./abstractAccountEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";

const ENTITY_NAME = "Account";

// Type of account.
const TYPE_ACCOUNT = "Account";

class AccountEntity extends AbstractAccountEntity {
  /**
   * Setup entity constructor
   *
   * @param {Object} accountDto account DTO
   * @param {Object} options.
   * - {boolean} validateUsername Validate the username. Default true.
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountDto, options = {}) {
    AccountEntity.marshal(accountDto);

    // Should the username be validated.
    const isUsernameValidated = options?.validateUsername !== false;

    super(EntitySchema.validate(
      AccountEntity.ENTITY_NAME,
      accountDto,
      AccountEntity.getSchema(isUsernameValidated)
    ));

    this.isUsernameValidated = isUsernameValidated;
  }

  /**
   * Marshal the dto
   * @param {Object} accountDto account DTO
   * @return {Object}
   */
  static marshal(accountDto) {
    Object.assign(
      accountDto,
      {
        type: AccountEntity.TYPE_ACCOUNT
      }
    );
  }

  /**
   * Get entity schema
   * @param {boolean} validateUsername Should validate the username. Default true.
   * @returns {Object} schema
   */
  static getSchema(validateUsername = true) {
    const abstractAccountEntitySchema = AbstractAccountEntity.getSchema();
    const schema = {
      "type": "object",
      "required": [
        "type",
        "domain",
        "user_id",
        "username",
        "first_name",
        "last_name",
        "user_public_armored_key",
        "user_private_armored_key",
        "server_public_armored_key",
        "security_token",
      ],
      "properties": {
        ... abstractAccountEntitySchema.properties,
        "type": {
          "type": "string",
          "pattern": `^${AccountEntity.TYPE_ACCOUNT}$`,
        },
        "role_name": {
          "anyOf": [
            RoleEntity.getSchema().properties.name,
            {
              "type": "null"
            }]
        },
      }
    };

    /*
     * Do not validate the username. It is used on the applications bootstrap when an account is retrieved from the
     * storage, but the application settings cannot be retrieved yet as they require an account to work with.
     */
    if (!validateUsername) {
      schema.properties.username = {
        "type": "string"
      };
    }

    return schema;
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */

  /**
   * Return a DTO ready to be sent to API or content code
   * @param {Object} contains The contains
   * @returns {object}
   */
  toDto(contains = {}) {
    const result = Object.assign({}, this._props);

    // Ensure some properties are not leaked by default and require an explicit contain.
    delete result.user_private_armored_key;

    if (!contains) {
      return result;
    }

    if (contains.user_private_armored_key) {
      result.user_private_armored_key = this.userPrivateArmoredKey;
    }
    if (contains.security_token && this._security_token) {
      result.security_token = this._security_token.toDto();
    }

    return result;
  }

  /**
   * Return legacy user dto.
   * @returns {{firstname: string, id: string, username: string, lastname: string}}
   */
  toLegacyUserDto() {
    return {
      id: this.userId,
      username: this.username,
      firstname: this.firstName,
      lastname: this.lastName,
      locale: this.locale
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get the role name
   * @return {string}
   */
  get roleName() {
    return this._props.role_name;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * AbstractAccountEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {
      user_private_armored_key: true,
      security_token: true,
    };
  }

  /**
   * AccountEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountEntity.TYPE_ACCOUNT
   * @returns {string}
   */
  static get TYPE_ACCOUNT() {
    return TYPE_ACCOUNT;
  }
}

export default AccountEntity;
