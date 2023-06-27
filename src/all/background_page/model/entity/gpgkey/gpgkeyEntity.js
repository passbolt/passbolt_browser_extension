/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.8.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";


const ENTITY_NAME = 'gpgkey';

const FINGERPRINT_MIN_LENGTH = 40;
const FINGERPRINT_MAX_LENGTH = 40;
const KEY_ID_MIN_LENGTH = 8;
const KEY_ID_MAX_LENGTH = 16;

class GpgkeyEntity extends Entity {
  /**
   * Gpgkey entity constructor
   *
   * @param {Object} gpgkeyDto gpgkey data transfer object
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(gpgkeyDto) {
    super(EntitySchema.validate(
      GpgkeyEntity.ENTITY_NAME,
      gpgkeyDto,
      GpgkeyEntity.getSchema()
    ));
  }

  /**
   * Get gpgkey entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "user_id",
        "armored_key"
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
        "fingerprint": {
          "type": "string",
          "minLength": FINGERPRINT_MIN_LENGTH,
          "maxLength": FINGERPRINT_MAX_LENGTH
        },
        "armored_key": {
          "type": "string"
        },
        "deleted": {
          "type": "boolean"
        },
        "type": {
          "anyOf": [{
            "type": "string"
          }, {
            "type": "null"
          }]
        },
        "uid": {
          "type": "string"
        },
        "bits": {
          "anyOf": [{
            "type": "integer",
          }, {
            "type": "null"
          }]
        },
        "key_id": {
          "type": "string",
          "minLength": KEY_ID_MIN_LENGTH,
          "maxLength": KEY_ID_MAX_LENGTH
        },
        "key_created": {
          "type": "string",
          "format": "date-time"
        },
        "expires": {
          "anyOf": [{
            "type": "string",
            "format": "date-time"
          }, {
            "type": "null"
          }]
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
   * Get gpgkey id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get gpgkey name
   * @returns {string} admin or user
   */
  get userId() {
    return this._props.user_id;
  }

  /**
   * Get gpgkey armored key block
   * @returns {string} description
   */
  get armoredKey() {
    return this._props.armored_key;
  }

  /**
   * Get gpgkey fingerprint
   * @returns {string} fingerprint
   */
  get fingerprint() {
    return this._props.fingerprint;
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

  /**
   * Get deleted flag info
   * @returns {{boolean|null}} true if deleted
   */
  get isDeleted() {
    if (typeof this._props.deleted === 'undefined') {
      return null;
    }
    return this._props.deleted;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * GpgkeyEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default GpgkeyEntity;
