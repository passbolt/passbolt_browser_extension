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
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import ThemeEntity from "./themeEntity";

const ENTITY_NAME = 'Themes';

class ThemesCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return ThemeEntity;
  }

  /**
   * @inheritDoc
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by ID.
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by user ID.
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection share the same metadata key ID.
   */
  constructor(dtos = [], options = {}) {
    super(dtos, options);
  }

  /*
   * ==================================================
   * Validation
   * ==================================================
   */

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

  /*
   * ==================================================
   * Assertions
   * ==================================================
   */

  /**
   * @inheritDoc
   * @param {Set} [options.uniqueIdsSetCache] A set of unique ids.
   * @param {Set} [options.uniqueNamesSetCache] A set of unique names.
   * @throws {EntityValidationError} If a theme already exists with the same id.
   * @throws {EntityValidationError} If a theme already exists with the same name.
   */
  validateBuildRules(item, options = {}) {
    this.assertNotExist("id", item._props.id, {haystackSet: options?.uniqueIdsSetCache});
    this.assertNotExist("name", item._props.name, {haystackSet: options?.uniqueNamesSetCache});
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */

  /**
   * @inheritDoc
   */
  pushMany(data, entityOptions = {}, options = {}) {
    const uniqueIdsSetCache = new Set(this.extract("id"));
    const uniqueNamesSetCache = new Set(this.extract("name"));
    const onItemPushed = item => {
      uniqueIdsSetCache.add(item._props.id);
      uniqueNamesSetCache.add(item._props.name);
    };

    options = {
      onItemPushed: onItemPushed,
      validateBuildRules: {...options?.validateBuildRules, uniqueIdsSetCache, uniqueNamesSetCache},
      ...options
    };

    super.pushMany(data, entityOptions, options);
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
}

export default ThemesCollection;
