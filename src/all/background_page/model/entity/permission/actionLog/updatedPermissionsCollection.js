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
   * @inheritDoc
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by ID.
   */
  constructor(updatedPermissionsCollectionDto, options = {}) {
    super(EntitySchema.validate(
      UpdatedPermissionsCollection.ENTITY_NAME,
      updatedPermissionsCollectionDto,
      UpdatedPermissionsCollection.getSchema()
    ), options);

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(updatedPermissionDto => {
      const updatePermissionEntity = new UpdatedPermissionEntity(updatedPermissionDto, {clone: false});
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
    for (let i = 0; i < length; i++) {
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

  /**
   * Sort the current collection by grantee type and their names.
   * This method is mutatative
   */
  sort() {
    this._items.sort(UpdatedPermissionsCollection.sortPermissionsByGranteeTypeAndName);
  }

  /**
   * Delegate function to use as a callback to sort permissions.
   * Permissions are sorted this way:
   * - Defined users first
   * - Defined groups second
   * - Unknown users third
   * - Unknown groups fourth
   * - Unknown grantee type fifth
   * Users are sorted by their `${user.first_name} ${user.last_name}`
   * Groups are sorted by their `${group.name}`
   *
   * @param {PermissionEntity} permissionA
   * @param {PermissionEntity} permissionB
   * @returns {number} -1 if permissionA comes first, 1 if permissionB comes first, 0 it they are "equals"
   * @static
   * @private
   */
  static sortPermissionsByGranteeTypeAndName(permissionA, permissionB) {
    //compare AROs, if they are different, aro User is coming first in the list
    const isADefinedUserPermission = Boolean(permissionA.user);
    const isBDefinedUserPermission = Boolean(permissionB.user);

    if (isADefinedUserPermission && isBDefinedUserPermission) {
      //both users are defined, we need to order by their full name.
      const userAName = permissionA.user.profile.name;
      const userBName = permissionB.user.profile.name;

      return userAName.localeCompare(userBName);
    }

    if (isADefinedUserPermission) {
      // permissionA is a user, permissionB is either an undefined user, a group, an undefined group. So permissionA comes first.
      return -1;
    } else if (isBDefinedUserPermission) {
      // permissionB is a user, permissionA is either an undefined user, a group, an undefined group. So permissionB comes first.
      return 1;
    }

    //here both permissionA and permissionB are for group permission. But their group could be undefined though
    const isADefinedGroupPermission = Boolean(permissionA.group);
    const isBDefinedGroupPermission = Boolean(permissionB.group);

    if (isADefinedGroupPermission && isBDefinedGroupPermission) {
      // both permission are for defined group, we need to order them by their group name
      const groupAName = permissionA.group.name;
      const groupBName = permissionB.group.name;

      return groupAName.localeCompare(groupBName);
    }

    if (isADefinedGroupPermission) {
      // permissionA is for a defined group and permissionB is for an undefined group. permissionA comes first
      return -1;
    } else if (isBDefinedGroupPermission) {
      // permissionB is for a defined group and permissionA is for an undefined group. permissionB comes first
      return 1;
    }

    // both permissions are for unknown grantee type. They are considered "equals"
    return 0;
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
