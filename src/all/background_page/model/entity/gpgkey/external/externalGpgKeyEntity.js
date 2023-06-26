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
import AppEmailValidatorService from "../../../../service/validator/appEmailValidatorService";

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
    const sanitizedGpgkeyDto = ExternalGpgKeyEntity.sanitizeDto(gpgkeyDto);
    super(EntitySchema.validate(
      ExternalGpgKeyEntity.ENTITY_NAME,
      sanitizedGpgkeyDto,
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
                "custom": AppEmailValidatorService.validate
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
            "pattern": "^Infinity$"
          }, {
            "type": "null"
          }]
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "algorithm": {
          "type": "string"
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

  /**
   * Sanitized the given dto.
   * It accepts both old and new version of the dto and sets new fields with new ones if any.
   *
   * @param {Object} dto
   * @returns {Object}
   */
  static sanitizeDto(dto) {
    const sanitizedDto = JSON.parse(JSON.stringify(dto));

    /*
     * Previous key stored in the keyring have discrepancies with the keyring v3.6.0 stored format.
     * @deprecated since v3.6.0.
     */
    if (dto.key) {
      sanitizedDto.armored_key = dto.key;
      delete sanitizedDto.key;
    }
    if (dto.keyId) {
      sanitizedDto.key_id = dto.keyId;
      delete sanitizedDto.keyId;
    }
    if (dto.userIds) {
      sanitizedDto.user_ids = dto.userIds;
      delete sanitizedDto.userIds;
    }
    // Created date was not stored in its ISO format.
    if (dto.created) {
      try {
        const date = new Date(sanitizedDto.created);
        sanitizedDto.created = date.toISOString();
      } catch (error) {
        delete sanitizedDto.created;
      }
    }

    if (dto.expires === "Never") {
      sanitizedDto.expires = "Infinity";
    } else if (dto.expires && dto.expires !== "Infinity") {
      // Expires date was not stored in its ISO format.
      try {
        const date = new Date(sanitizedDto.expires);
        sanitizedDto.expires = date.toISOString();
      } catch (error) {
        delete sanitizedDto.expires;
        console.error(`ExternalGpgKeyEntity::sanitizeDto Unable to sanitize the key for the user ${dto.user_id}`);
      }
    }

    return sanitizedDto;
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

  /**
   * Get gpgkey key id
   * @returns {string}
   */
  get keyId() {
    return this._props.key_id;
  }

  /**
   * Get gpgkey user ids
   * @returns {Array<{name: string, email:string>}
   */
  get userIds() {
    return this._props.user_ids;
  }

  /**
   * Get gpgkey key fingerprint
   * @returns {string}
   */
  get fingerprint() {
    return this._props.fingerprint;
  }

  /**
   * Get time at when the key is considered as expired
   * @returns {string|null}
   */
  get expires() {
    return this._props.expires;
  }

  /**
   * Return true if the key is valid.
   * A key could be read by openpgp js while not being valid.
   * For instance, if we remove the checksum part of the key,
   * it's still readable but it can't be considered as valid.
   * @returns {boolean}
   */
  get isValid() {
    return this.expires !== null;
  }

  /**
   * Get time at when the key has been created
   * @returns {string}
   */
  get created() {
    return this._props.created;
  }

  /**
   * Get the algorithm use to generate the key
   * @returns {string}
   */
  get algorithm() {
    return this._props.algorithm;
  }

  /**
   * Get the size of the key
   * @returns {number}
   */
  get length() {
    return this._props.length;
  }

  /**
   * Get the curve used for the generation of the key
   * @returns {string | null}
   */
  get curve() {
    return this._props.curve;
  }

  /**
   * Get the revocation state of the keu
   * @returns {boolean}
   */
  get revoked() {
    return this._props.revoked;
  }

  /**
   * Returns true if the key is private false otherwise
   * @returns {boolean}
   */
  get private() {
    return this._props.private;
  }

  /**
   * Returns true if the key is expired
   * @returns {boolean|null}
   */
  get isExpired() {
    const expires = this.expires;
    if (expires === null) {
      return null;
    }

    if (expires === "Infinity") {
      return false;
    }
    const now = Date.now();
    const expirationDate = new Date(expires);

    return expirationDate < now;
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

export default ExternalGpgKeyEntity;
