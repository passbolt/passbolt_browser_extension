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
 * @since         3.2.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'Locale';

/**
 * Local entity for the user language
 */
class LocaleEntity extends Entity {
  /**
   * Locale entity constructor
   *
   * @param {Object} localeDto locale DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(localeDto) {
    super(EntitySchema.validate(
      LocaleEntity.ENTITY_NAME,
      localeDto,
      LocaleEntity.getSchema()
    ));
  }

  /**
   * Get local entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "locale",
      ],
      "properties": {
        "locale": {
          "type": "string",
          "pattern": /^[a-z]{2}-[A-Z]{2}$/,
        },
        "label": {
          "type": "string"
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
   * Get the locale identifier
   * @returns {string}
   */
  get locale() {
    return this._props.locale;
  }

  /**
   * Get locale label
   * @returns {string}
   */
  get label() {
    return this._props.label;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * LocaleEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default LocaleEntity;
