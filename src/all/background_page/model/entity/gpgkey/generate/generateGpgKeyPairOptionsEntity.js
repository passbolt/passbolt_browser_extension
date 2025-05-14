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
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";
import AppEmailValidatorService from "../../../../service/validator/appEmailValidatorService";
import {GPG_KEY_TYPE_RSA, GPG_KEY_TYPE_EDDSA} from "passbolt-styleguide/src/shared/models/entity/gpgkey/gpgkeyEntity";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

const ENTITY_NAME = "GenerateGpgKeyPairOptionsEntity";

const KEY_TYPE_RSA = "rsa";
const KEY_TYPE_ECC = "ecc";
const KEY_CURVE_ED25519 = "ed25519";
const DEFAULT_KEY_TYPE = KEY_TYPE_RSA;
const DEFAULT_RSA_KEY_SIZE = 3072;
const DEFAULT_RSA_ORK_KEY_SIZE = 4096;
const DEFAULT_ECC_KEY_CURVE = KEY_CURVE_ED25519;

export default class GenerateGpgKeyPairOptionsEntity extends EntityV2 {
  /**
   * @inheritdoc
   */
  marshall() {
    if (typeof(this._props.type) === "undefined") {
      this._props.type = GenerateGpgKeyPairOptionsEntity.DEFAULT_KEY_TYPE;
    }

    if (this._props.type === GenerateGpgKeyPairOptionsEntity.KEY_TYPE_RSA && typeof(this._props.keySize) === "undefined") {
      this._props.keySize = GenerateGpgKeyPairOptionsEntity.DEFAULT_RSA_KEY_SIZE;
    }

    if (this._props.type === GenerateGpgKeyPairOptionsEntity.KEY_TYPE_ECC && typeof(this._props.curve) === "undefined") {
      this._props.curve = GenerateGpgKeyPairOptionsEntity.DEFAULT_ECC_KEY_CURVE;
    }
    super.marshall();
  }

  /**
   * @inheritDoc
   */
  validateBuildRules() {
    if (this._props.type === GenerateGpgKeyPairOptionsEntity.KEY_TYPE_RSA && Boolean(this._props.curve)) {
      const error = new EntityValidationError();
      error.addError("curve", "unwanted_curve", "The curve should not be set when the type is set to 'rsa'");
      throw error;
    }

    if (this._props.type === GenerateGpgKeyPairOptionsEntity.KEY_TYPE_ECC && Boolean(this._props.keySize)) {
      const error = new EntityValidationError();
      error.addError("keySize", "unwanted_keySize", "The keySize should not be set when the type is set to 'ecc'");
      throw error;
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
    const type = apiGpgKeyType?.toLowerCase() === GPG_KEY_TYPE_EDDSA ?
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
    const dto = {
      userIDs: [this.userId],
      passphrase: this.passphrase,
      type: this.type,
      date: this.date,
    };

    if (this.type === GenerateGpgKeyPairOptionsEntity.KEY_TYPE_RSA) {
      dto.rsaBits = this.rsaBits;
    }

    if (this.type === GenerateGpgKeyPairOptionsEntity.KEY_TYPE_ECC) {
      dto.curve = this.curve;
    }

    return dto;
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
   * @returns {string|null} ie. ed25519
   */
  get curve() {
    return this._props.curve || null;
  }

  /**
   * Get the rsa key length
   * @returns {integer|null} ie. 4096
   */
  get rsaBits() {
    return this._props.keySize || null;
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
