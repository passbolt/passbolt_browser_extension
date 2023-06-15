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

const ENTITY_NAME = "AccountRecoveryPrivateKeyPasswordDecryptedData";

const PRIVATE_KEY_SECRET_MIN_LENGTH = 128;
const PRIVATE_KEY_SECRET_MAX_LENGTH = 128;

const PRIVATE_KEY_FINGERPRINT_MIN_LENGTH = 40;
const PRIVATE_KEY_FINGERPRINT_MAX_LENGTH = 40;

/**
 * Entity related to the account recovery private key password decrypted data
 */
class AccountRecoveryPrivateKeyPasswordDecryptedDataEntity extends Entity {
  /**
   * Constructor
   *
   * @param {Object} dto The dto
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(dto) {
    super(EntitySchema.validate(
      AccountRecoveryPrivateKeyPasswordDecryptedDataEntity.ENTITY_NAME,
      dto,
      AccountRecoveryPrivateKeyPasswordDecryptedDataEntity.getSchema()
    ));
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "type",
        "version",
        "domain",
        "private_key_user_id",
        "private_key_fingerprint",
        "private_key_secret",
        "created",
      ],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["account-recovery-private-key-password-decrypted-data"]
        },
        "version": {
          "type": "string",
          "enum": ["v1"]
        },
        "domain": {
          "type": "string",
        },
        "private_key_user_id": {
          "type": "string",
          "format": "uuid"
        },
        "private_key_fingerprint": {
          "type": "string",
          "minLength": PRIVATE_KEY_FINGERPRINT_MIN_LENGTH,
          "maxLength": PRIVATE_KEY_FINGERPRINT_MAX_LENGTH
        },
        "private_key_secret": {
          "type": "string",
          "minLength": PRIVATE_KEY_SECRET_MIN_LENGTH,
          "maxLength": PRIVATE_KEY_SECRET_MAX_LENGTH
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
      }
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Type.
   * @return {string}
   */
  get type() {
    return this._props.type;
  }

  /**
   * Version.
   * @return {string}
   */
  get version() {
    return this._props.version;
  }

  /**
   * Domain.
   * @return {string}
   */
  get domain() {
    return this._props.domain;
  }

  /**
   * Private key user id.
   * @return {string}
   */
  get privateKeyUserId() {
    return this._props.private_key_user_id;
  }

  /**
   * Private key fingerprint.
   * @return {string}
   */
  get privateKeyFingerprint() {
    return this._props.private_key_fingerprint;
  }

  /**
   * Private key secret.
   * @return {string}
   */
  get privateKeySecret() {
    return this._props.private_key_secret;
  }

  /**
   * Created date.
   * @return {string}
   */
  get created() {
    return this._props.created;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AccountRecoveryPrivateKeyPasswordDecryptedDataEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default AccountRecoveryPrivateKeyPasswordDecryptedDataEntity;
