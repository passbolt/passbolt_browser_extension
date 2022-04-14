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

const {AbstractAccountEntity} = require("./abstractAccountEntity");
const {EntitySchema} = require('../abstract/entitySchema');

const ENTITY_NAME = "Account";

// Type of account.
const TYPE_ACCOUNT = "Account";

class AccountEntity extends AbstractAccountEntity {
  /**
   * Setup entity constructor
   *
   * @param {Object} accountDto account DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountDto) {
    AccountEntity.marshal(accountDto);

    super(EntitySchema.validate(
      AccountEntity.ENTITY_NAME,
      accountDto,
      AccountEntity.getSchema()
    ));
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
   * @returns {Object} schema
   */
  static getSchema() {
    const abstractAccountEntitySchema = AbstractAccountEntity.getSchema();
    return {
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

exports.AccountEntity = AccountEntity;
