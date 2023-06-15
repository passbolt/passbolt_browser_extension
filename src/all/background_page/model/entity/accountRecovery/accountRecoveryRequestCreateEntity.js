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
import AccountRecoveryRequestEntity from "./accountRecoveryRequestEntity";
import AuthenticationTokenEntity from "../authenticationToken/authenticationTokenEntity";

const ENTITY_NAME = 'AccountRecoveryRequestCreate';

class AccountRecoveryRequestCreateEntity extends Entity {
  /**
   * AccountRecoveryRequestCreateEntity entity constructor
   *
   * @param {Object} accountRecoveryRequestCreateDto account recovery request create DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountRecoveryRequestCreateDto) {
    super(EntitySchema.validate(
      AccountRecoveryRequestCreateEntity.ENTITY_NAME,
      accountRecoveryRequestCreateDto,
      AccountRecoveryRequestCreateEntity.getSchema()
    ));

    // Associations
    if (this._props.authentication_token) {
      this._authentication_token = new AuthenticationTokenEntity(this._props.authentication_token);
      delete this._props.authentication_token;
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
        "user_id",
        "fingerprint",
        "armored_key",
        "authentication_token",
      ],
      "properties": {
        "user_id": AccountRecoveryRequestEntity.getSchema().properties.user_id,
        "armored_key": AccountRecoveryRequestEntity.getSchema().properties.armored_key,
        "fingerprint": AccountRecoveryRequestEntity.getSchema().properties.fingerprint,
        // Associated models
        "authentication_token": AuthenticationTokenEntity.getSchema()
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
    if (this.authenticationToken && contain.authentication_token) {
      result.authentication_token = this.authenticationToken.toDto();
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(AccountRecoveryRequestCreateEntity.ALL_CONTAIN_OPTIONS);
  }

  /*
   * ==================================================
   * Associated properties getters
   * ==================================================
   */
  /**
   * Get the account recovery private key passwords
   * @returns {AuthenticationTokenEntity || null}
   */
  get authenticationToken() {
    return this._authentication_token || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AccountRecoveryRequestCreateEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountRecoveryRequestCreateEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {authentication_token: true};
  }
}

export default AccountRecoveryRequestCreateEntity;
