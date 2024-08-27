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
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import ResourceTypeEntity, {
  RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG, RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG,
  RESOURCE_TYPE_PASSWORD_STRING_SLUG, RESOURCE_TYPE_TOTP_SLUG
} from "./resourceTypeEntity";

const SUPPORTED_RESOURCE_TYPES = [
  RESOURCE_TYPE_PASSWORD_STRING_SLUG,
  RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
  RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG,
  RESOURCE_TYPE_TOTP_SLUG
];

const PASSWORD_RESOURCE_TYPES = [
  RESOURCE_TYPE_PASSWORD_STRING_SLUG,
  RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
  RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG,
];

class ResourceTypesCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return ResourceTypeEntity;
  }

  /**
   * @inheritDoc
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by ID.
   */
  constructor(dtos = [], options = {}) {
    super(dtos, options);
  }

  /**
   * Get resources entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": ResourceTypeEntity.getSchema(),
    };
  }

  /**
   * @inheritDoc
   * @param {Set} [options.uniqueIdsSetCache] A set of unique ids.
   * @throws {EntityValidationError} If a permission already exists with the same id.
   */
  validateBuildRules(item, options = {}) {
    this.assertNotExist("id", item._props.id, {haystackSet: options?.uniqueIdsSetCache});
    this.assertNotExist("slug", item._props.slug, {haystackSet: options?.uniqueSlugsSetCache});
  }

  /*
   * ==================================================
   * Assertions
   * ==================================================
   */

  /**
   * Is resource type id present (supported)
   * @param id The id
   * @return {boolean}
   */
  isResourceTypeIdPresent(id) {
    return this._items.some(resourceType => resourceType.id === id);
  }

  /*
   * ==================================================
   * Filter
   * ==================================================
   */

  /**
   * Filter by password resource types.
   * @return {void} The function alters the collection itself.
   */
  filterByPasswordResourceTypes() {
    this.filterByPropertyValueIn("slug", PASSWORD_RESOURCE_TYPES);
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
    const uniqueSlugsSetCache = new Set(this.extract("slug"));

    const onItemPushed = item => {
      uniqueIdsSetCache.add(item.id);
      uniqueSlugsSetCache.add(item.slug);
    };

    options = {
      onItemPushed: onItemPushed,
      validateBuildRules: {...options?.validateBuildRules, uniqueIdsSetCache, uniqueSlugsSetCache},
      ...options
    };

    super.pushMany(data, entityOptions, options);
  }

  /**
   * The resource type is checked to ensure that it is supported first.
   * If it's not supported, the resource type is not added and does not throw any Error.
   *
   * @inheritDoc
   */
  push(data, entityOptions = {}, options = {}) {
    if (!SUPPORTED_RESOURCE_TYPES.includes(data?.slug)) {
      return;
    }
    super.push(data, entityOptions, options);
  }
}

export default ResourceTypesCollection;
