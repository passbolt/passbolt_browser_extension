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
const {Entity} = require('../../abstract/entity');
const {EntitySchema} = require('../../abstract/entitySchema');

const ENTITY_NAME = 'externalGpgKey';

const FINGERPRINT_MIN_LENGTH = 40;
const FINGERPRINT_MAX_LENGTH = 40;
const KEY_ID_MIN_LENGTH = 8;
const KEY_ID_MAX_LENGTH = 16;

class ExternalGpgKeyEntity extends Entity {
  /**
   * External GpgKey entity constructor
   *
   * @param {Object} gpgkeyDto gpgkey data transfer object
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(gpgkeyDto) {
    super(EntitySchema.validate(
      ExternalGpgKeyEntity.ENTITY_NAME,
      gpgkeyDto,
      ExternalGpgKeyEntity.getSchema()
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
        "armored_key"
      ],
      "properties": {
        "armored_key": {
          "type": "string",
          "minLength": 1,
        },
        "key_id": {
          "type": "string",
          "minLength": KEY_ID_MIN_LENGTH,
          "maxLength": KEY_ID_MAX_LENGTH
        },
        "user_ids": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [
              "email", "name"
            ],
            "properties": {
              "email": {
                "type": "string",
                "format": "email"
              },
              "name": {
                "type": "string"
              }
            }
          }
        },
        "fingerprint": {
          "type": "string",
          "minLength": FINGERPRINT_MIN_LENGTH,
          "maxLength": FINGERPRINT_MAX_LENGTH
        },
        "expires": {
          "anyOf": [{
            "type": "string",
            "format": "date-time"
          }, {
            "type": "string",
            "pattern": "^Never$"
          }]
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "algorithm": {
          "type": "string",
          "enum": ["RSA"]
        },
        "length": {
          "type": "integer",
          "minimum": 1,
        },
        "curve": {
          "anyOf": [{
            "type": "string"
          }, {
            "type": "null"
          }]
        },
        "private": {
          "type": "boolean"
        },
        "revoked": {
          "type": "boolean"
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
   * Get gpgkey armored key block
   * @returns {string} description
   */
  get armoredKey() {
    return this._props.armored_key;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * ExternalGpgKeyEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

exports.ExternalGpgKeyEntity = ExternalGpgKeyEntity;
