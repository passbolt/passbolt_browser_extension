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
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";

const ENTITY_NAME = 'Theme';

class ThemeEntity extends EntityV2 {
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
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "name": {
          "type": "string",
          "pattern": /^[a-zA-Z0-9-_]*$/,
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
   * @returns {string} uuid
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get theme name
   * @returns {string}
   */
  get name() {
    return this._props.name;
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
