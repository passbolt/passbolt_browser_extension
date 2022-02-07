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
 * @since         3.6.0
 */
const {Entity} = require('../../abstract/entity');
const {EntitySchema} = require('../../abstract/entitySchema');
const {ExternalGpgKeyEntity} = require('./externalGpgKeyEntity');

const ENTITY_NAME = 'externalGpgKeyPairEntity';

class ExternalGpgKeyPairEntity extends Entity {
  /**
   * External GpgKey Pair entity constructor
   *
   * @param {Object} externalGpgKeyPeyPairDto externalGpgKeyPeyPair data transfer object
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(externalGpgKeyPeyPairDto) {
    super(EntitySchema.validate(
      ExternalGpgKeyPairEntity.ENTITY_NAME,
      externalGpgKeyPeyPairDto,
      ExternalGpgKeyPairEntity.getSchema()
    ));

    if (this._props.private_key) {
      this._private_key = new ExternalGpgKeyEntity(this._props.private_key);
      delete this._props.private_key;
    }

    if (this._props.public_key) {
      this._public_key = new ExternalGpgKeyEntity(this._props.public_key);
      delete this._props.public_key;
    }
  }

  /**
   * Get gpgkey entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "public_key",
        "private_key"
      ],
      "properties": {
        "public_key": ExternalGpgKeyEntity.getSchema(),
        "private_key": ExternalGpgKeyEntity.getSchema()
      }
    };
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API or content code
   * @returns {object}
   */
  toDto() {
    const result = Object.assign({}, this._props);
    if (this._public_key) {
      result.public_key = this._public_key.toDto();
    }
    if (this._private_key) {
      result.private_key = this._private_key.toDto();
    }

    return result;
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get the public key
   * @returns {ExternalGpgKeyEntity}
   */
  get publicKey() {
    return this._public_key;
  }

  /**
   * Get the private key
   * @returns {ExternalGpgKeyEntity}
   */
  get privateKey() {
    return this._private_key;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * ExternalGpgKeyPairEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

exports.ExternalGpgKeyPairEntity = ExternalGpgKeyPairEntity;
