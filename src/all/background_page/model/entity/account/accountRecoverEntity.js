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
import UserEntity from "../user/userEntity";
import AbstractAccountEntity from "./abstractAccountEntity";
import AuthenticationTokenEntity from "../authenticationToken/authenticationTokenEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import AccountRecoveryUserSettingEntity from "../accountRecovery/accountRecoveryUserSettingEntity";


const ENTITY_NAME = "AccountRecover";
const TYPE_ACCOUNT_RECOVER = "account-recover";

class AccountRecoverEntity extends AbstractAccountEntity {
  /**
   * Constructor
   *
   * @param {Object} accountRecoverDto account recover DTO
   * @throws {EntityValidationError} if the dto cannot be converted into an entity
   */
  constructor(accountRecoverDto) {
    AccountRecoverEntity.marshal(accountRecoverDto);

    super(EntitySchema.validate(
      AccountRecoverEntity.ENTITY_NAME,
      accountRecoverDto,
      AccountRecoverEntity.getSchema()
    ));

    // Recover account associations.
    if (this._props.account_recovery_user_setting) {
      this._account_recovery_user_setting = new AccountRecoveryUserSettingEntity(this._props.account_recovery_user_setting);
      delete this._props.account_recovery_user_setting;
    }
    if (this._props.user) {
      this._user = new UserEntity(this._props.user);
      delete this._props.user;
    }
  }

  /**
   * Marshal the dto
   * @param {Object} accountRecoverDto account recover DTO
   * @return {Object}
   */
  static marshal(accountRecoverDto) {
    Object.assign(
      accountRecoverDto,
      {
        type: AccountRecoverEntity.TYPE_ACCOUNT_RECOVER
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
        "authentication_token_token"
      ],
      "properties": {
        ... abstractAccountEntitySchema.properties,
        "type": {
          "type": "string",
          "pattern": `^${AccountRecoverEntity.TYPE_ACCOUNT_RECOVER}$`,
        },
        "authentication_token_token": authenticationTokenSchema.properties.token,
        // @todo refactoring-account-recovery check if it's necessary on the react and in the bp
        "user": UserEntity.getSchema(),
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

    if (!contains) {
      return result;
    }

    if (contains.user_private_armored_key) {
      result.user_private_armored_key = this.userPrivateArmoredKey;
    }
    if (contains.authentication_token_token) {
      result.authentication_token_token = this.authenticationTokenToken;
    }
    if (contains.security_token && this._security_token) {
      result.security_token = this._security_token.toDto();
    }
    if (contains.user && this._user) {
      result.user = this._user.toDto(UserEntity.ALL_CONTAIN_OPTIONS);
    }

    return result;
  }

  /**
   * Return a DTO ready to be sent the API to complete the recover process.
   * @returns {object}
   */
  toCompleteRecoverDto() {
    return {
      //@deprecated since v3.6.0: the expected format is authentication_token.
      authenticationtoken: {
        token: this.authenticationTokenToken
      },
      authentication_token: {
        token: this.authenticationTokenToken
      },
      gpgkey: {
        armored_key: this.userPublicArmoredKey
      },
      //@deprecated since v3.6.0: the `locale` field is now on the root object.
      user: {
        locale: this.locale
      },
      locale: this.locale,
    };
  }

  /**
   * Return a DTO ready to be sent the API to abort the recover process.
   * @returns {object}
   */
  toAbortRecoverDto() {
    return {
      authentication_token: {
        token: this.authenticationTokenToken
      },
    };
  }

  /**
   * Return a DTO ready to be sent the API to request an account recovery.
   * @returns {object}
   */
  toAccountRecoveryRequestDto() {
    return {
      authentication_token: {
        token: this.authenticationTokenToken
      },
      fingerprint: this.userKeyFingerprint,
      user_id: this.userId,
      armored_key: this.userPublicArmoredKey
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

  /*
   * ==================================================
   * Other associated properties methods
   * ==================================================
   */
  /**
   * Get the user
   * @returns {UserEntity|null}
   */
  get user() {
    return this._user || null;
  }

  /**
   * Set the user
   * @param {UserEntity} user The user to set
   */
  set user(user) {
    if (!user || !(user instanceof UserEntity)) {
      throw new TypeError('Failed to assert the parameter is a valid UserEntity');
    }
    this._user = user;
  }

  /**
   * Get the account recovery user setting
   * @returns {(AccountRecoveryUserSettingEntity|null)}
   */
  get accountRecoveryUserSetting() {
    return this._account_recovery_user_setting || null;
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
      security_token: true,
      authentication_token_token: true,
      user: true
    };
  }

  /**
   * AccountRecoverEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountRecoverEntity.TYPE_ACCOUNT_RECOVER
   * @returns {string}
   */
  static get TYPE_ACCOUNT_RECOVER() {
    return TYPE_ACCOUNT_RECOVER;
  }
}

export default AccountRecoverEntity;
