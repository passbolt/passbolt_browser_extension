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
 * @since         3.5.0
 */
const {goog} = require('../../../../utils/format/emailaddress');
const {Entity} = require('../../abstract/entity');
const {EntitySchema} = require('../../abstract/entitySchema');

const ENTITY_NAME = "GenerateGpgKeyPairEntity";
const DEFAULT_LENGTH = 4096;

class GenerateGpgKeyPairEntity extends Entity {
  /**
   * GenerateGpgKeyPair entity constructor
   *
   * @param {Object} GenerateGpgKeyPairDto data transfer object
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(GenerateGpgKeyPairDto) {
    super(EntitySchema.validate(
      GenerateGpgKeyPairEntity.ENTITY_NAME,
      GenerateGpgKeyPairDto,
      GenerateGpgKeyPairEntity.getSchema()
    ));
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
        "keySize"
      ],
      "properties": {
        "name": {
          "type": "string",
          "minLength": 1
        },
        "email": {
          "type": "string",
          "custom": goog.format.EmailAddress.isValidAddress
        },
        "passphrase": {
          "type": "string",
          "minLength": 1
        },
        "keySize": {
          "type": "integer",
          "enum": [
            DEFAULT_LENGTH
          ]
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
   * Return dto in opengpg format
   * @returns {object}
   */
  toOpenPgpGenerateKeyDto() {
    return {
      userIds: [this.userId],
      rsaBits: this.rsaBits,
      password: this.passphrase
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

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * GenerateGpgKeyPairEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * GenerateGpgKeyPairEntity.DEFAULT_LENGTH
   * @returns {int}
   */
  static get DEFAULT_LENGTH() {
    return DEFAULT_LENGTH;
  }
}

exports.GenerateGpgKeyPairEntity = GenerateGpgKeyPairEntity;
