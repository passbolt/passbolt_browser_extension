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

const ENTITY_NAME = "AccountSetup";
const TYPE_ACCOUNT_SETUP = "account-setup";

class AccountSetupEntity extends AbstractAccountEntity {
  /**
   * Setup entity constructor
   *
   * @param {Object} accountSetupDto account setup DTO
   * @throws {EntityValidationError} if the dto cannot be converted into an entity
   */
  constructor(accountSetupDto) {
    AccountSetupEntity.marshal(accountSetupDto);

    super(EntitySchema.validate(
      AccountSetupEntity.ENTITY_NAME,
      accountSetupDto,
      AccountSetupEntity.getSchema()
    ));

    // Setup account associations.
    if (this._props.account_recovery_user_setting) {
      this._account_recovery_user_setting = new AccountRecoveryUserSettingEntity(this._props.account_recovery_user_setting);
      delete this._props.account_recovery_user_setting;
    }
  }

  /**
   * Marshal the dto
   * @param {Object} accountSetupDto account setup DTO
   * @return {Object}
   */
  static marshal(accountSetupDto) {
    Object.assign(
      accountSetupDto,
      {
        type: AccountSetupEntity.TYPE_ACCOUNT_SETUP
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
          "pattern": `^${AccountSetupEntity.TYPE_ACCOUNT_SETUP}$`,
        },
        "authentication_token_token": authenticationTokenSchema.properties.token,
        // @todo refactoring-account-recovery check if it's necessary on the react and in the bp
        "user": UserEntity.getSchema(),
        "account_recovery_user_setting": AccountRecoveryUserSettingEntity.getSchema(),
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
   * Return a DTO ready to be sent the API to complete the setup process.
   * @returns {object}
   */
  toCompleteSetupDto() {
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
      account_recovery_user_setting: this.accountRecoveryUserSetting?.toDto(AccountRecoveryUserSettingEntity.ALL_CONTAIN_OPTIONS),
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
   * Get the setup account recovery user setting
   * @returns {(AccountRecoveryUserSettingEntity|null)}
   */
  get accountRecoveryUserSetting() {
    return this._account_recovery_user_setting || null;
  }

  /**
   * set the setup account recovery user setting
   * @param {AccountRecoveryUserSettingEntity} accountRecoveryUserSetting The account recovery user setting
   */
  set accountRecoveryUserSetting(accountRecoveryUserSetting) {
    if (!accountRecoveryUserSetting || !(accountRecoveryUserSetting instanceof AccountRecoveryUserSettingEntity)) {
      throw new TypeError('Failed to assert the parameter is a valid AccountRecoveryUserSettingEntity');
    }
    this._account_recovery_user_setting = accountRecoveryUserSetting;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AccountSetupEntity.ALL_CONTAIN_OPTIONS
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
   * AccountSetupEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountSetupEntity.TYPE_ACCOUNT_RECOVERY
   * @returns {string}
   */
  static get TYPE_ACCOUNT_SETUP() {
    return TYPE_ACCOUNT_SETUP;
  }
}

export default AccountSetupEntity;
