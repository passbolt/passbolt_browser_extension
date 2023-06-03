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
 * @since         2.13.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";


const ENTITY_NAME = 'Theme';

class ThemeEntity extends Entity {
  /**
   * Theme entity constructor
   *
   * @param {Object} themeDto theme DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(themeDto) {
    super(EntitySchema.validate(
      ThemeEntity.ENTITY_NAME,
      themeDto,
      ThemeEntity.getSchema()
    ));
  }

  /**
   * Get secret entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "id",
        "name",
        "preview"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "name": {
          "type": "string",
          "pattern": /^[a-zA-Z0-9-_]*$/,
        },
        "preview": {
          "type": "string",
          "format": "x-url"
        }
      }
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get theme id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get theme name
   * @returns {string} admin or user
   */
  get name() {
    return this._props.name;
  }

  /**
   * Get theme preview
   * @returns {string} uuid
   */
  get preview() {
    return this._props.preview;
  }


  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * ThemeEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default ThemeEntity;
