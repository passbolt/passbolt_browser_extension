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
 * @since         3.9.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import Validator from "validator";

const ENTITY_NAME = "SsoKitServerPartEntity";
const JWK_ALGORITHM_AES_256_BITS = "A256GCM";
import {Buffer} from 'buffer';

/**
 * Entity related to the account recovery organization policy
 */
class SsoKitServerPartEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} ssoUserServerDataDto sso user's server data DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(ssoUserServerDataDto) {
    super(EntitySchema.validate(
      SsoKitServerPartEntity.ENTITY_NAME,
      ssoUserServerDataDto,
      SsoKitServerPartEntity.getSchema()
    ));
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": ["data"],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "user_id": {
          "type": "string",
          "format": "uuid"
        },
        "data": {
          "type": "x-custom",
          "validationCallback": SsoKitServerPartEntity.validateData
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
        "created_by": {
          "type": "string",
          "format": "uuid"
        },
        "modified_by": {
          "type": "string",
          "format": "uuid"
        },
      }
    };
  }

  /*
   * ==================================================
   * Custom validators
   * ==================================================
   */

  static validateData(value) {
    if (typeof value !== "string") {
      throw new TypeError("The data should be a string");
    }

    if (!Validator.isBase64(value)) {
      throw new TypeError("The data should be a base64 formated string");
    }

    /*
     * expected format:
     *   {
     *     alg: "A256GCM",
     *     ext: true,
     *     k: "1fbJmAeV44qez4TDiATBZsOoTbI3mhoV-rnAf6An8X0",
     *     key_ops: ["encrypt","decrypt"],
     *     kty: "oct"
     *   }
     */
    const deserializedKey = JSON.parse(Buffer.from(value, "base64").toString());

    if (deserializedKey.alg !== JWK_ALGORITHM_AES_256_BITS) {
      throw new TypeError('The SSO server key should use the algorithm AES 256 bits');
    }

    if (!deserializedKey.ext) {
      throw new TypeError('The SSO server key should be extractable');
    }

    if (deserializedKey.kty !== "oct") {
      throw new TypeError('The SSO server key type should be an octect sequence');
    }

    if (typeof deserializedKey.k !== "string") {
      throw new TypeError('The SSO server key data should be a string');
    }

    const usages = deserializedKey.key_ops;
    const areUsagesValid = usages.length === 2
      && usages.includes("encrypt")
      && usages.includes("decrypt");

    if (!areUsagesValid) {
      throw new TypeError('The SSO server key be usable for and only for encryption and decryption');
    }
  }

  /**
   * Returns the id props of the SSO kit.
   * @returns {string}
   */
  get id() {
    return this._props.id;
  }

  /**
   * Returns the data (containing the secret) props.
   * @returns {string}
   */
  get data() {
    return this._props.data;
  }

  /**
   * Returns the key parsed from the data.
   * @returns {object}
   */
  get key() {
    return JSON.parse(Buffer.from(this.data, "base64").toString());
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * SsoKitServerPartEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default SsoKitServerPartEntity;
