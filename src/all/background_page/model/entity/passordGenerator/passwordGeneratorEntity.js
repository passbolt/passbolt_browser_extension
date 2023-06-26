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
 * @since         3.3.0
 */

import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'PasswordGenerator';

class PasswordGeneratorEntity extends Entity {
  /**
   * Folder entity constructor
   *
   * @param {Object} passwordGeneratorDto password genertor
   * @throws {EntityValidationError} if the dto cannot be converted into an entity
   */
  constructor(passwordGeneratorDto) {
    super(EntitySchema.validate(
      PasswordGeneratorEntity.ENTITY_NAME,
      passwordGeneratorDto,
      PasswordGeneratorEntity.getSchema()
    ));
  }

  /**
   * Get password generator entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [],
      "properties": {
        "default_generator": {
          "type": "string"
        },
        "generators": {
          "type": "object",
        }
      }
    };
  }

  get default_generator() {
    return this._props.default_generator;
  }

  get generators() {
    return this._props.generators;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * FolderEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default PasswordGeneratorEntity;
