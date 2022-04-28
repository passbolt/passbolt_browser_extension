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

const {AbstractAccountEntity} = require("./abstractAccountEntity");
const {EntitySchema} = require('../abstract/entitySchema');
const {AuthenticationTokenEntity} = require("../authenticationToken/authenticationTokenEntity");
const {AccountRecoveryRequestEntity} = require("../accountRecovery/accountRecoveryRequestEntity");

const ENTITY_NAME = "AccountAccountRecovery";
const TYPE_ACCOUNT_ACCOUNT_RECOVERY = "account-account-recovery";

class AccountAccountRecoveryEntity extends AbstractAccountEntity {
  /**
   * Constructor
   *
   * @param {Object} accountAccountRecoveryDto account account recovery DTO
   * @throws {EntityValidationError} if the dto cannot be converted into an entity
   */
  constructor(accountAccountRecoveryDto) {
    AccountAccountRecoveryEntity.marshal(accountAccountRecoveryDto);

    super(EntitySchema.validate(
      AccountAccountRecoveryEntity.ENTITY_NAME,
      accountAccountRecoveryDto,
      AccountAccountRecoveryEntity.getSchema()
    ));

    // Associations
    if (this._props.account_recovery_request) {
      this._account_recovery_request = new AccountRecoveryRequestEntity(this._props.account_recovery_request);
      delete this._props.account_recovery_request;
    }
  }

  /**
   * Marshal the dto
   * @param {Object} accountAccountRecoveryDto account account recovery DTO
   * @return {Object}
   */
  static marshal(accountAccountRecoveryDto) {
    Object.assign(
      accountAccountRecoveryDto,
      {
        type: AccountAccountRecoveryEntity.TYPE_ACCOUNT_ACCOUNT_RECOVERY
      }
    );
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    const abstractAccountEntitySchema = AbstractAccountEntity.getSchema();
    const authenticationTokenSchema = AuthenticationTokenEntity.getSchema();
    return {
      "type": "object",
      "required": [
        "type",
        "domain",
        "user_id",
        "authentication_token_token",
        "account_recovery_request_id"
      ],
      "properties": {
        ... abstractAccountEntitySchema.properties,
        "type": {
          "type": "string",
          "pattern": `^${AccountAccountRecoveryEntity.TYPE_ACCOUNT_ACCOUNT_RECOVERY}$`,
        },
        "account_recovery_request_id": {
          "type": "string",
          "format": "uuid",
        },
        "authentication_token_token": authenticationTokenSchema.properties.token,
        "account_recovery_request": AccountRecoveryRequestEntity.getSchema(),
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
    delete result.authentication_token_token;
    delete result.account_recovery_request_id;

    if (!contains) {
      return result;
    }

    if (contains.user_private_armored_key) {
      result.user_private_armored_key = this.userPrivateArmoredKey;
    }
    if (contains.authentication_token_token) {
      result.authentication_token_token = this.authenticationTokenToken;
    }
    if (contains.account_recovery_request_id) {
      result.account_recovery_request_id = this.accountRecoveryRequestId;
    }
    if (contains.security_token && this._security_token) {
      result.security_token = this._security_token.toDto();
    }
    if (contains.accountRecoveryRequest && this._account_recovery_request) {
      result.account_recovery_request = this._account_recovery_request.toDto(AccountRecoveryRequestEntity.ALL_CONTAIN_OPTIONS);
    }

    return result;
  }

  /**
   * Return a DTO ready to be sent the API to abort the the account recovery process.
   * @returns {object}
   */
  toAbortRecoverDto() {
    return {
      authentication_token: {
        token: this.authenticationTokenToken
      },
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get the authentication token token.
   * @return {string|null}
   */
  get authenticationTokenToken() {
    return this._props.authentication_token_token || null;
  }

  /**
   * Get the account recovery request id
   * @returns {string|null}
   */
  get accountRecoveryRequestId() {
    return this._props.account_recovery_request_id || null;
  }

  /**
   * Set the account recovery request id
   * @param {string} accountRecoveryRequestId The account recovery request id
   */
  set accountRecoveryRequestId(accountRecoveryRequestId) {
    EntitySchema.validateProp("account_recovery_request_id", accountRecoveryRequestId, AccountAccountRecoveryEntity.getSchema().properties.account_recovery_request_id);
    this._props.account_recovery_request_id = accountRecoveryRequestId;
  }

  /*
   * ==================================================
   * Other associated properties methods
   * ==================================================
   */
  /**
   * Get the associated account recover request.
   * @returns {UserEntity|null}
   */
  get accountRecoveryRequest() {
    return this._account_recovery_request || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * AccountRecoverEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {
      user_private_armored_key: true,
      authentication_token_token: true,
      account_recovery_request_id: true,
      security_token: true,
      account_recovery_request: true,
    };
  }

  /**
   * AccountAccountRecoveryEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountAccountRecoveryEntity.TYPE_ACCOUNT_RECOVERY
   * @returns {string}
   */
  static get TYPE_ACCOUNT_ACCOUNT_RECOVERY() {
    return TYPE_ACCOUNT_ACCOUNT_RECOVERY;
  }
}

exports.AccountAccountRecoveryEntity = AccountAccountRecoveryEntity;