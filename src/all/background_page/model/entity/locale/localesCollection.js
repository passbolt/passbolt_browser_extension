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
import LocaleEntity from "./localeEntity";
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";


const ENTITY_NAME = 'Locales';

class LocalesCollection extends EntityCollection {
  /**
   * Locales collection constructor
   *
   * @param {Object} localesCollectionDto locales DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(localesCollectionDto) {
    super(EntitySchema.validate(
      LocalesCollection.ENTITY_NAME,
      localesCollectionDto,
      LocalesCollection.getSchema()
    ));

    // Directly push into the private property _items[]
    this._props.forEach(locale => {
      this._items.push(new LocaleEntity(locale));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get locales collection schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": LocaleEntity.getSchema(),
    };
  }

  /**
   * Get locale
   * @returns {Array<LocaleEntity>}
   */
  get locales() {
    return this._items;
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * Push a copy of the resource to the list
   * @param {object} locale DTO or LocaleEntity
   */
  push(locale) {
    if (!locale || typeof locale !== 'object') {
      throw new TypeError(`LocalesCollection push parameter should be an object.`);
    }
    if (locale instanceof LocaleEntity) {
      locale = locale.toDto(); // deep clone
    }
    const localeEntity = new LocaleEntity(locale); // validate

    super.push(localeEntity);
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * LocalesCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default LocalesCollection;
