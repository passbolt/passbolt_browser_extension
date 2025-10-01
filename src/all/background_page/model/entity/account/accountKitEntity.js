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

const ENTITY_NAME = "AccountKit";
const PGP_KEY_MAX_LENGTH = 50000;
const TYPE_ACCOUNT = "account-kit";

class AccountKitEntity extends AbstractAccountEntity {
  /**
   * @inheritDoc
   */
  constructor(accountDto, options = {}) {
    super(EntitySchema.validate(
      AccountKitEntity.ENTITY_NAME,
      accountDto,
      AccountKitEntity.getSchema()
    ), options);
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    const abstractAccountEntitySchema = AbstractAccountEntity.getSchema();
    const schema = {
      "type": "object",
      "required": [
        "domain",
        "user_id",
        "username",
        "first_name",
        "last_name",
        "user_private_armored_key",
        "server_public_armored_key",
        "user_public_armored_key",
        "security_token",
      ],
      "properties": {
        domain: abstractAccountEntitySchema.properties.domain,
        user_id: abstractAccountEntitySchema.properties.user_id,
        username: abstractAccountEntitySchema.properties.username,
        first_name: abstractAccountEntitySchema.properties.first_name,
        last_name: abstractAccountEntitySchema.properties.last_name,
        security_token: abstractAccountEntitySchema.properties.security_token,
        "user_private_armored_key": {
          "type": "string",
          "maxLength": PGP_KEY_MAX_LENGTH
        },
        "user_public_armored_key": {
          "type": "string",
          "maxLength": PGP_KEY_MAX_LENGTH
        },
        "server_public_armored_key": {
          "type": "string",
          "maxLength": PGP_KEY_MAX_LENGTH
        },
      },
    };

    return schema;
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */

  /**
   * Return a DTO ready to be sent to front
   * @returns {object}
   */
  toDto() {
    const result = Object.assign({}, this._props);

    result.security_token = this._security_token.toDto();

    return result;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * AccountKitEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountKitEntity.TYPE_ACCOUNT
   * @returns {string}
   */
  static get TYPE_ACCOUNT() {
    return TYPE_ACCOUNT;
  }
}

export default AccountKitEntity;
