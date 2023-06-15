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

const ENTITY_NAME = "GenerateGpgKeyPairOptionsEntity";

const TYPE_RSA = "rsa";
const DEFAULT_TYPE = TYPE_RSA;
const DEFAULT_KEY_SIZE = 3072;

class GenerateGpgKeyPairOptionsEntity extends Entity {
  /**
   * GenerateGpgKeyPair entity constructor
   *
   * @param {Object} generateGpgKeyPairDto data transfer object
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(generateGpgKeyPairDto) {
    GenerateGpgKeyPairOptionsEntity.marshal(generateGpgKeyPairDto);

    super(EntitySchema.validate(
      GenerateGpgKeyPairOptionsEntity.ENTITY_NAME,
      generateGpgKeyPairDto,
      GenerateGpgKeyPairOptionsEntity.getSchema()
    ));
  }

  /**
   * Marshal the dto
   * @param {Object} generateGpgKeyPairDto generate gpg key pair DTO
   * @return {Object}
   */
  static marshal(generateGpgKeyPairDto) {
    if (!generateGpgKeyPairDto.keySize) {
      generateGpgKeyPairDto.keySize = this.DEFAULT_KEY_SIZE;
    }

    if (!generateGpgKeyPairDto.type) {
      generateGpgKeyPairDto.type = this.DEFAULT_TYPE;
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
        "keySize",
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
          "enum": [GenerateGpgKeyPairOptionsEntity.TYPE_RSA],
        },
        "keySize": {
          "type": "integer",
          "minLength": this.DEFAULT_KEY_SIZE
        },
        "date": {
          "type": "integer"
        }
      }
    };
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
   * Get the key type length
   * @returns {string} ie. rsa
   */
  get type() {
    return this._props.type;
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
   * GenerateGpgKeyPairOptionsEntity.DEFAULT_KEY_SIZE
   * @returns {number}
   */
  static get DEFAULT_KEY_SIZE() {
    return DEFAULT_KEY_SIZE;
  }

  /**
   * GenerateGpgKeyPairOptionsEntity.DEFAULT_TYPE
   * @returns {string}
   */
  static get DEFAULT_TYPE() {
    return DEFAULT_TYPE;
  }

  /**
   * GenerateGpgKeyPairOptionsEntity.TYPE_RSA
   * @returns {string}
   */
  static get TYPE_RSA() {
    return TYPE_RSA;
  }
}

export default GenerateGpgKeyPairOptionsEntity;
