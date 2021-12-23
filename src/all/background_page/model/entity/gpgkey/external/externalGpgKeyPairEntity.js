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
const {Entity} = require('../../abstract/entity');
const {EntitySchema} = require('../../abstract/entitySchema');
const {EntityValidationError} = require('../../abstract/entityValidationError');
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

    if (typeof(this.privateKey.private) !== "undefined" && !this.privateKey.private) {
      throw new EntityValidationError(`Could not validate entity ${ExternalGpgKeyPairEntity.ENTITY_NAME}. The private key part is public`);
    }

    if (typeof(this.publicKey.private) !== "undefined" && this.publicKey.private) {
      throw new EntityValidationError(`Could not validate entity ${ExternalGpgKeyPairEntity.ENTITY_NAME}. The public key part is private`);
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
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get the public key
   * @returns {ExternalGpgKeyEntity}
   */
  get publicKey() {
    return this._props.public_key;
  }

  /**
   * Get the private key
   * @returns {ExternalGpgKeyEntity}
   */
  get privateKey() {
    return this._props.private_key;
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
