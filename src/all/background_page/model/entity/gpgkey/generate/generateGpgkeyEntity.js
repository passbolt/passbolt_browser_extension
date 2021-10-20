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
 */
const {goog} = require('../../../../utils/format/emailaddress');
const {Entity} = require('../../abstract/entity');
const {EntitySchema} = require('../../abstract/entitySchema');

const ENTITY_NAME = "GenerateGpgkey";
const DEFAULT_LENGTH = 2048;
const PASSPHRASE_MIN_LENGTH = 8;

class GenerateGpgKeyEntity extends Entity {
  /**
   * GenerateGpgkey entity constructor
   *
   * @param {Object} GenerateGpgKeyDto data transfer object
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(GenerateGpgKeyDto) {
    super(EntitySchema.validate(
      GenerateGpgKeyEntity.ENTITY_NAME,
      GenerateGpgKeyDto,
      GenerateGpgKeyEntity.getSchema()
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
        "user_id",
        "armored_key"
      ],
      "properties": {
        "userId": {
          "type": "string",
          "custom": goog.format.EmailAddress.isValidAddress
        },
        "length": {
          "type": "integer",
          "enum": [
            DEFAULT_LENGTH
          ]
        },
        "passphrase": {
          "type": "string",
          "minLength": PASSPHRASE_MIN_LENGTH,
        },
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
  toGenerateOpengpgKeyDto() {
    return {
      userIds: [this.userId],
      rsaBits: this.length,
      passphrase: this.passphrase
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
    return this._props.userId;
  }

  /**
   * Get the rsa key length
   * @returns {string} ie. 2048
   */
  get length() {
    return this._props.rsaBits;
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
   * GenerateGpgkeyEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * GenerateGpgkeyEntity.DEFAULT_LENGTH
   * @returns {string}
   */
  static get DEFAULT_LENGTH() {
    return DEFAULT_LENGTH;
  }
}

exports.GenerateGpgKeyEntity = GenerateGpgKeyEntity;
