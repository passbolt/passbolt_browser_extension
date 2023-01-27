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
import Entity from "../abstract/entity";
import EntitySchema from "../abstract/entitySchema";
import EntityValidationError from "../abstract/entityValidationError";

const ENTITY_NAME = "SsoKitClientPartEntity";

/**
 * Entity related to the SSO user's client data
 */
class SsoKitClientPartEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} ssoUserClientDataDto sso user's client data DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(ssoUserClientDataDto) {
    //Because of the type of the data in the dto, we cannot use JSON serialization to make a copy of the object, however we can use `structuredClone` to proceed
    const clonedDto = structuredClone(ssoUserClientDataDto);

    super(EntitySchema.validate(
      SsoKitClientPartEntity.ENTITY_NAME,
      clonedDto,
      SsoKitClientPartEntity.getSchema()
    ));

    SsoKitClientPartEntity.validateNek(clonedDto.nek);
    SsoKitClientPartEntity.validateIv(clonedDto.iv1);
    SsoKitClientPartEntity.validateIv(clonedDto.iv2);

    this._props.nek = clonedDto.nek;
    this._props.iv1 = clonedDto.iv1;
    this._props.iv2 = clonedDto.iv2;
  }

  /**
   * Validates client part the key.
   * The key must be:
   * - instance of CryptoKey
   * - non extractable
   * - use the algorithm AES-GCM with 256 bits
   * - Have exactly the capabilities: encrypt and decrypt
   * @param {CryptoKey} nek
   */
  static validateNek(nek) {
    if (!(nek instanceof CryptoKey)) {
      throw new EntityValidationError("SsoKitClientPartEntity expects an nek to be an instance of CryptoKey.");
    }

    if (nek.extractable) {
      throw new EntityValidationError("SsoKitClientPartEntity expects an nek not to be extractable.");
    }

    if (nek.algorithm.name !== "AES-GCM") {
      throw new EntityValidationError("SsoKitClientPartEntity expects an nek to use the algorithm 'AES-GSM'.");
    }

    if (nek.algorithm.length !== 256) {
      throw new EntityValidationError("SsoKitClientPartEntity expects an nek to use 256 bits.");
    }

    if (!nek.usages.includes("encrypt")) {
      throw new EntityValidationError("SsoKitClientPartEntity expects an nek to have the capability to encrypt.");
    }

    if (!nek.usages.includes("decrypt")) {
      throw new EntityValidationError("SsoKitClientPartEntity expects an nek to have the capability to decrypt.");
    }

    if (nek.usages.length !== 2) {
      throw new EntityValidationError("SsoKitClientPartEntity expects an nek to only have the following capabilities: encrypt and decrypt.");
    }
  }

  /**
   * Validates the IV.
   * An IV must be an Uint8Array of 12 bytes.
   * @param {Uint8Array} iv
   */
  static validateIv(iv) {
    if (!(iv instanceof Uint8Array)) {
      throw new EntityValidationError("SsoKitClientPartEntity expects IVs to be an instance of Uint8Array.");
    }

    if (iv.length !== 12) {
      throw new EntityValidationError("SsoKitClientPartEntity expects IVs to be of a length of 12 bytes.");
    }
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Not supported
   * @throws {Error}
   */
  toDto() {
    throw new Error("Serialization is not supported on this object");
  }

  /**
   * Get an object formated for IndexedDB
   * @returns {object}
   */
  toDbSerializableObject() {
    return structuredClone(this._props);
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": ["nek", "iv1", "iv2", "secret"],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "provider": {
          "type": "string",
        },
        "nek": {
          "type": "object",
        },
        "iv1": {
          "type": "object",
        },
        "iv2": {
          "type": "object",
        },
        "secret": {
          "type": "string"
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

  /**
   * Get the SSO Kit id
   * @returns {string}
   */
  set id(value) {
    const schema = SsoKitClientPartEntity.getSchema();
    EntitySchema.validateProp("id", value, schema.properties.id);
    this._props.id = value;
  }

  /**
   * Get the SSO Kit id
   * @returns {string}
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get the SSO provider identifier
   * @returns {string}
   */
  set provider(value) {
    const schema = SsoKitClientPartEntity.getSchema();
    EntitySchema.validateProp("provider", value, schema.properties.provider);
    this._props.provider = value;
  }

  /**
   * Get the SSO provider identifier
   * @returns {string}
   */
  get provider() {
    return this._props.provider;
  }

  /**
   * Get the SSO kit secret
   * @returns {string}
   */
  get secret() {
    return this._props.secret;
  }

  /**
   * Get the SSO kit' non extractable key
   * @returns {CryptoKey}
   */
  get nek() {
    return this._props.nek;
  }

  /**
   * Get the SSO kit's first Initialisation Vector
   * @returns {Uint8Array}
   */
  get iv1() {
    return this._props.iv1;
  }

  /**
   * Get the SSO kit's second Initialisation Vector
   * @returns {Uint8Array}
   */
  get iv2() {
    return this._props.iv2;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * SsoKitClientPartEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default SsoKitClientPartEntity;
