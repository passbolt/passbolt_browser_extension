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

const ENTITY_NAME = 'PrivateGpgkey';

class PrivateGpgkeyEntity extends Entity {
  /**
   * PrivateGpgkey entity constructor
   *
   * @param {Object} privateGpgkeyDto privateGpgkey data transfer object
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(privateGpgkeyDto) {
    super(EntitySchema.validate(
      PrivateGpgkeyEntity.ENTITY_NAME,
      privateGpgkeyDto,
      PrivateGpgkeyEntity.getSchema()
    ));
  }

  /**
   * Get gpgkey entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "armored_key",
        "passphrase"
      ],
      "properties": {
        "armored_key": {
          "type": "string"
        },
        "passphrase": {
          "type": "string"
        }
      }
    };
  }
  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * Get private gpgkey armoreKey id
   * @returns {(string)} uuid
   */
  get armoredKey() {
    return this._props.armored_key;
  }

  /**
   * Get private gpgkey armoreKey id
   * @returns {(string)} uuid
   */
  get passphrase() {
    return this._props.passphrase;
  }

  /**
   * PrivateGpgkeyEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default PrivateGpgkeyEntity;
