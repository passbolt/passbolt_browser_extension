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
import ExternalGpgKeyEntity from "./externalGpgKeyEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";


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
   * @param {object} [contain] optional
   * @returns {object}
   */
  toDto(contain) {
    const result = Object.assign({}, this._props);

    if (!contain) {
      return result;
    }

    if (contain.public_key && this._public_key) {
      result.public_key = this.publicKey.toDto();
    }
    if (contain.private_key && this._private_key) {
      result.private_key = this.privateKey.toDto();
    }

    return result;
  }


  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(ExternalGpgKeyPairEntity.ALL_CONTAIN_OPTIONS);
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

  /**
   * ExternalGpgKeyPairEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {public_key: true, private_key: true};
  }
}

export default ExternalGpgKeyPairEntity;
