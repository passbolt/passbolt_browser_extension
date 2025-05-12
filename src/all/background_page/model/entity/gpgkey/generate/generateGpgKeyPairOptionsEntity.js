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
import {GPG_KEY_TYPE_RSA, GPG_KEY_TYPE_EDDSA} from "passbolt-styleguide/src/shared/models/entity/gpgkey/gpgkeyEntity";

const ENTITY_NAME = "GenerateGpgKeyPairOptionsEntity";

const KEY_TYPE_RSA = "rsa";
const KEY_TYPE_ECC = "ecc";
const KEY_CURVE_ED25519 = "ed25519";
const DEFAULT_KEY_TYPE = KEY_TYPE_RSA;
const DEFAULT_RSA_KEY_SIZE = 3072;
const DEFAULT_RSA_ORK_KEY_SIZE = 4096;
const DEFAULT_ECC_KEY_CURVE = KEY_CURVE_ED25519;

class GenerateGpgKeyPairOptionsEntity extends Entity {
  /**
   * @inheritDoc
   */
  constructor(generateGpgKeyPairDto, options = {}) {
    GenerateGpgKeyPairOptionsEntity.marshal(generateGpgKeyPairDto);

    super(EntitySchema.validate(
      GenerateGpgKeyPairOptionsEntity.ENTITY_NAME,
      generateGpgKeyPairDto,
      GenerateGpgKeyPairOptionsEntity.getSchema()
    ), options);
  }

  /**
   * Marshal the dto
   * @param {Object} generateGpgKeyPairDto generate gpg key pair DTO
   * @return {Object}
   */
  static marshal(generateGpgKeyPairDto) {
    if (!generateGpgKeyPairDto.type) {
      generateGpgKeyPairDto.type = this.DEFAULT_KEY_TYPE;
    }
    if (generateGpgKeyPairDto.type === this.KEY_TYPE_RSA) {
      delete generateGpgKeyPairDto.curve;
      if (!generateGpgKeyPairDto.keySize) {
        generateGpgKeyPairDto.keySize = this.DEFAULT_RSA_KEY_SIZE;
      }
    }
    if (generateGpgKeyPairDto.type === this.KEY_TYPE_ECC) {
      delete generateGpgKeyPairDto.keySize;
      if (!generateGpgKeyPairDto.curve) {
        generateGpgKeyPairDto.curve = this.DEFAULT_ECC_KEY_CURVE;
      }
    }
  }

  /**
   * Get the entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "name",
        "email",
        "passphrase",
        "type",
      ],
      "properties": {
        "name": {
          "type": "string",
          "minLength": 1
        },
        "email": {
          "type": "string",
          "custom": AppEmailValidatorService.validate
        },
        "passphrase": {
          "type": "string",
          "minLength": 8,
        },
        "type": {
          "type": "string",
          "enum": [GenerateGpgKeyPairOptionsEntity.KEY_TYPE_RSA, GenerateGpgKeyPairOptionsEntity.KEY_TYPE_ECC],
        },
        "keySize": {
          "type": "integer",
          "minLength": GenerateGpgKeyPairOptionsEntity.DEFAULT_RSA_KEY_SIZE
        },
        "curve": {
          "type": "string",
          "minLength": [GenerateGpgKeyPairOptionsEntity.KEY_CURVE_ED25519],
        },
        "date": {
          "type": "integer"
        }
      }
    };
  }

  /**
   * Create entity for user key generation.
   *
   * @param {string} apiGpgKeyType API gpg key type preference: rsa or eddsa. Default to rsa.
   * @param {object} generateGpgKeyPairDto The dto used for key creation
   * @return {GenerateGpgKeyPairOptionsEntity}
   */
  static createForUserKeyGeneration(apiGpgKeyType = GPG_KEY_TYPE_RSA, generateGpgKeyPairDto) {
    let type = apiGpgKeyType?.toLowerCase() === GPG_KEY_TYPE_EDDSA ?
      GenerateGpgKeyPairOptionsEntity.KEY_TYPE_ECC :
      GenerateGpgKeyPairOptionsEntity.KEY_TYPE_RSA;

    const updatedGenerateKeyPairDto = {
      ...generateGpgKeyPairDto,
      type: type
    };

    if (type === GenerateGpgKeyPairOptionsEntity.KEY_TYPE_ECC) {
      updatedGenerateKeyPairDto.curve = GenerateGpgKeyPairOptionsEntity.DEFAULT_ECC_KEY_CURVE;
    } else if (type === GenerateGpgKeyPairOptionsEntity.KEY_TYPE_RSA) {
      updatedGenerateKeyPairDto.keySize = GenerateGpgKeyPairOptionsEntity.DEFAULT_RSA_KEY_SIZE;
    }

    return new GenerateGpgKeyPairOptionsEntity(updatedGenerateKeyPairDto);
  }

  /**
   * Create entity for account recovery key generation
   * @param {object} generateGpgKeyPairDto The dto used for key creation
   * @return {GenerateGpgKeyPairOptionsEntity}
   */
  static createForOrkKeyGeneration(generateGpgKeyPairDto) {
    return new GenerateGpgKeyPairOptionsEntity({
      ...generateGpgKeyPairDto,
      type: GenerateGpgKeyPairOptionsEntity.KEY_TYPE_RSA,
      keySize: DEFAULT_RSA_ORK_KEY_SIZE,
    });
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return dto used to generate an openPGP key.
   * @returns {object}
   */
  toGenerateOpenpgpKeyDto() {
    return {
      userIDs: [this.userId],
      rsaBits: this.rsaBits,
      passphrase: this.passphrase,
      type: this.type,
      curve: this.curve,
      date: this.date,
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get the user id
   * @returns {string} ie. Ada Lovelace <ada@passbolt.com>
   */
  get userId() {
    return {name: this.name, email: this.email};
  }

  /**
   * Get the user name
   * @returns {string} ie. Ada Lovelace
   */
  get name() {
    return this._props.name;
  }

  /**
   * Get the user email
   * @returns {string} ie. <ada@passbolt.com>
   */
  get email() {
    return this._props.email;
  }

  /**
   * Get the key type
   * @returns {string} ie. rsa
   */
  get type() {
    return this._props.type;
  }

  /**
   * Get the key curve
   * @returns {string} ie. ed25519
   */
  get curve() {
    return this._props.curve;
  }

  /**
   * Get the rsa key length
   * @returns {integer} ie. 4096
   */
  get rsaBits() {
    return this._props.keySize;
  }

  /**
   * Get the passphrase protecting the armored key
   * @returns {string}
   */
  get passphrase() {
    return this._props.passphrase;
  }

  /**
   * Get the creation date to be used for the key generation
   * @returns {Date}
   */
  get date() {
    return this._props.date !== undefined ?
      new Date(this._props.date) :
      new Date();
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * GenerateGpgKeyPairOptionsEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * GenerateGpgKeyPairOptionsEntity.DEFAULT_RSA_KEY_SIZE
   * @returns {number}
   */
  static get DEFAULT_RSA_KEY_SIZE() {
    return DEFAULT_RSA_KEY_SIZE;
  }

  /**
   * GenerateGpgKeyPairOptionsEntity.DEFAULT_KEY_TYPE
   * @returns {string}
   */
  static get DEFAULT_KEY_TYPE() {
    return DEFAULT_KEY_TYPE;
  }

  /**
   * GenerateGpgKeyPairOptionsEntity.DEFAULT_ECC_KEY_CURVE
   * @returns {string}
   */
  static get DEFAULT_ECC_KEY_CURVE() {
    return DEFAULT_ECC_KEY_CURVE;
  }

  /**
   * GenerateGpgKeyPairOptionsEntity.KEY_TYPE_RSA
   * @returns {string}
   */
  static get KEY_TYPE_RSA() {
    return KEY_TYPE_RSA;
  }

  /**
   * GenerateGpgKeyPairOptionsEntity.KEY_TYPE_ECC
   * @returns {string}
   */
  static get KEY_TYPE_ECC() {
    return KEY_TYPE_ECC;
  }

  /**
   * GenerateGpgKeyPairOptionsEntity.KEY_CURVE_ED25519
   * @returns {string}
   */
  static get KEY_CURVE_ED25519() {
    return KEY_CURVE_ED25519;
  }
}

export default GenerateGpgKeyPairOptionsEntity;
