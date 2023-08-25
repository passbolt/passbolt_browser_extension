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
 * @since         2.13.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'Secret';

class SecretEntity extends Entity {
  /**
   * Secret entity constructor
   * Used to store encrypted secrets
   *
   * @param {Object} secretDto secret DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(secretDto) {
    super(EntitySchema.validate(
      SecretEntity.ENTITY_NAME,
      secretDto,
      SecretEntity.getSchema()
    ));

    SecretEntity.assertValidMessage(this._props.data);
  }

  /**
   * Get secret entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "data"
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
        "resource_id": {
          "type": "string",
          "format": "uuid"
        },
        "data": {
          "type": "string",
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        }
      }
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get secret id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get secret data
   * @returns {string} armored pgp message
   */
  get data() {
    return this._props.data;
  }

  /**
   * Get secret user id
   * @returns {string} uuid
   */
  get userId() {
    return this._props.user_id;
  }

  /**
   * Get secret resource id
   * @returns {string} uuid
   */
  get resourceId() {
    return this._props.resource_id;
  }

  /**
   * Get created date
   * @returns {(string|null)} date
   */
  get created() {
    return this._props.created || null;
  }

  /**
   * Get modified date
   * @returns {(string|null)} date
   */
  get modified() {
    return this._props.modified || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * SecretEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * Assert a given OpenPGP armored message block is valid
   * @param {string} message
   * @return {EntityValidationError} if the message is not a valid armored block
   * TODO a-fA-F0-9\=... before readArmored
   */
  static assertValidMessage(message) {
    const error = new EntityValidationError('This is not a valid OpenPGP armored message');
    if (!message || (typeof message !== 'string') || message === '') {
      error.addError('data', 'empty', 'The OpenPGP armored message should not be empty.');
      throw error;
    }
    if (!message.match(/-----BEGIN PGP MESSAGE-----/)) {
      error.addError('data', 'begin', 'The OpenPGP armored message should contain a start delimiter.');
      throw error;
    }
    if (!message.match(/-----END PGP MESSAGE-----/)) {
      error.addError('data', 'end', 'The OpenPGP armored message should contain an end delimiter.');
      throw error;
    }
  }
}

export default SecretEntity;
