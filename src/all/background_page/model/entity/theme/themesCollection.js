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
 */
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import ThemeEntity from "./themeEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";

const ENTITY_NAME = 'Themes';

const RULE_UNIQUE_ID = 'unique_id';
const RULE_UNIQUE_NAME = 'unique_name';

class ThemesCollection extends EntityCollection {
  /**
   * Themes Collection constructor
   *
   * @param {Object} themesCollectionsDto secret DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(themesCollectionsDto) {
    super(EntitySchema.validate(
      ThemesCollection.ENTITY_NAME,
      themesCollectionsDto,
      ThemesCollection.getSchema()
    ));

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(secret => {
      this.push(new ThemeEntity(secret));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get secrets entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": ThemeEntity.getSchema(),
    };
  }

  /**
   * Get themes
   * @returns {Array<ThemeEntity>}
   */
  get themes() {
    return this._items;
  }

  /*
   * ==================================================
   * Assertions
   * ==================================================
   */
  /**
   * Assert there is no other theme with the same id in the collection
   *
   * @param {ThemeEntity} theme
   * @throws {EntityValidationError} if a theme with the same id already exist
   */
  assertUniqueId(theme) {
    if (!theme.id) {
      return;
    }
    const collectionErrorIndex = this.items.findIndex(item => item.id === theme.id);
    if (collectionErrorIndex !== -1) {
      throw new EntityCollectionError(collectionErrorIndex, ThemesCollection.RULE_UNIQUE_ID, `Theme id ${theme.id} already exists.`);
    }
  }

  /**
   * Assert there is no other theme with the same name in the collection
   *
   * @param {ThemeEntity} theme
   * @throws {EntityValidationError} if a theme with the same id already exist
   */
  assertUniqueName(theme) {
    if (!theme.name) {
      return;
    }
    const collectionErrorIndex = this.items.findIndex(item => item.name === theme.name);
    if (collectionErrorIndex !== -1) {
      throw new EntityCollectionError(collectionErrorIndex, ThemesCollection.RULE_UNIQUE_NAME, `Theme name ${theme.name} already exists.`);
    }
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * Push a copy of the theme to the list
   * @param {object} theme DTO or ThemeEntity
   */
  push(theme) {
    if (!theme || typeof theme !== 'object') {
      throw new TypeError(`ThemesCollection push parameter should be an object.`);
    }
    if (theme instanceof ThemeEntity) {
      theme = theme.toDto(); // clone
    }
    const themeEntity = new ThemeEntity(theme); // validate

    // Build rules
    this.assertUniqueId(themeEntity);
    this.assertUniqueName(themeEntity);

    super.push(themeEntity);
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * ThemesCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * ThemesCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }

  /**
   * ThemesCollection.RULE_UNIQUE_NAME
   * @returns {string}
   */
  static get RULE_UNIQUE_NAME() {
    return RULE_UNIQUE_NAME;
  }
}

export default ThemesCollection;
