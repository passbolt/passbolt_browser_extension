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
 * @since         4.2.0
 */

import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'PasswordGeneratorSettings';

class PasswordGeneratorSettingsEntity extends Entity {
  /**
   * Password Generator Settings entity constructor
   *
   * @param {Object} passwordGeneratorSettingsDto password generator settings dto
   * @throws {EntityValidationError} if the dto cannot be converted into an entity
   */
  constructor(passwordGeneratorSettingsDto) {
    super(EntitySchema.validate(
      PasswordGeneratorSettingsEntity.ENTITY_NAME,
      passwordGeneratorSettingsDto,
      PasswordGeneratorSettingsEntity.getSchema()
    ));
  }

  /**
   * Get password policies entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "length",
        "mask_upper",
        "mask_lower",
        "mask_digit",
        "mask_parenthesis",
        "mask_emoji",
        "mask_char1",
        "mask_char2",
        "mask_char3",
        "mask_char4",
        "mask_char5",
        "exclude_look_alike_chars",
        "min_length",
        "max_length",
      ],
      "properties": {
        "length": {
          "type": "integer",
          "minimum": 8,
          "maximum": 128,
        },
        "mask_upper": {
          "type": "boolean",
        },
        "mask_lower": {
          "type": "boolean",
        },
        "mask_digit": {
          "type": "boolean",
        },
        "mask_parenthesis": {
          "type": "boolean",
        },
        "mask_emoji": {
          "type": "boolean",
        },
        "mask_char1": {
          "type": "boolean",
        },
        "mask_char2": {
          "type": "boolean",
        },
        "mask_char3": {
          "type": "boolean",
        },
        "mask_char4": {
          "type": "boolean",
        },
        "mask_char5": {
          "type": "boolean",
        },
        "exclude_look_alike_chars": {
          "type": "boolean",
        },
        "min_length": {
          "type": "integer",
        },
        "max_length": {
          "type": "integer",
        }
      },
    };
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * PasswordGeneratorSettingsEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * Return the default settings overriden with the given data if any.
   * @param {PasswordGeneratorSettingsEntity} data the data to override the entity with
   * @returns {PasswordGeneratorSettingsEntity}
   */
  static createFromDefault(data = {}) {
    const defaultDto = Object.assign({
      length: 18,
      min_length: 8,
      max_length: 128,
      mask_upper: true,
      mask_lower: true,
      mask_digit: true,
      mask_parenthesis: true,
      mask_char1: true,
      mask_char2: true,
      mask_char3: true,
      mask_char4: true,
      mask_char5: true,
      mask_emoji: false,
      exclude_look_alike_chars: true,
    }, data);

    return new PasswordGeneratorSettingsEntity(defaultDto);
  }
}

export default PasswordGeneratorSettingsEntity;
