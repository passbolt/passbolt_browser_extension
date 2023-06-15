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
import UpdatedPermissionEntity from "./updatedPermissionEntity";
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";

const ENTITY_NAME = 'UpdatedPermissions';

const RULE_UNIQUE_ID = 'unique_id';

class UpdatedPermissionsCollection extends EntityCollection {
  /**
   * Updated permissions collection constructor
   *
   * @param {Object} updatedPermissionsCollectionDto updated permissions DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(updatedPermissionsCollectionDto) {
    super(EntitySchema.validate(
      UpdatedPermissionsCollection.ENTITY_NAME,
      updatedPermissionsCollectionDto,
      UpdatedPermissionsCollection.getSchema()
    ));

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(updatedPermissionDto => {
      const updatePermissionEntity = new UpdatedPermissionEntity(updatedPermissionDto);
      this.push(updatePermissionEntity);
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get updated permissions collection schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": UpdatedPermissionEntity.getSchema()
    };
  }

  /**
   * Get updated permissions
   * @returns {Array<UpdatedPermissionEntity>}
   */
  get updatedPermissions() {
    return this._items;
  }

  /**
   * Get all the ids of the updated permissions in the collection
   *
   * @returns {Array<string>}
   */
  get ids() {
    return this._items.map(r => r.id);
  }

  /*
   * ==================================================
   * Assertions
   * ==================================================
   */

  /**
   * Assert there is no other updated permission with the same id in the collection
   *
   * @param {UpdatedPermissionEntity} updatedPermission
   * @throws {EntityValidationError} if a an item with the same id already exist
   */
  assertUniqueId(updatedPermission) {
    if (!updatedPermission.id) {
      return;
    }
    const length = this.updatedPermissions.length;
    let i = 0;
    for (; i < length; i++) {
      const existingUpdatedPermission = this.updatedPermissions[i];
      if (existingUpdatedPermission.id && existingUpdatedPermission.id === updatedPermission.id) {
        throw new EntityCollectionError(i, UpdatedPermissionsCollection.RULE_UNIQUE_ID, `Updated permission id ${updatedPermission.id} already exists.`);
      }
    }
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */

  /**
   * Push a copy of the updated permission to the list
   * @param {object} updatedPermission DTO or UpdatedPermissionEntity
   */
  push(updatedPermission) {
    if (!updatedPermission || typeof updatedPermission !== 'object') {
      throw new TypeError(`UpdatePermissionsCollection push parameter should be an object.`);
    }
    if (updatedPermission instanceof UpdatedPermissionEntity) {
      updatedPermission = updatedPermission.toDto(UpdatedPermissionEntity.ALL_CONTAIN_OPTIONS); // deep clone
    }
    const updatedPermissionEntity = new UpdatedPermissionEntity(updatedPermission); // validate

    // Build rules
    this.assertUniqueId(updatedPermissionEntity);

    super.push(updatedPermissionEntity);
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */

  /**
   * UpdatedPermissionsCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * UpdatedPermissionsCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }
}

export default UpdatedPermissionsCollection;
