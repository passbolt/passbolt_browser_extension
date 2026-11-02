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
import PermissionsCollection from "passbolt-styleguide/src/shared/models/entity/permission/permissionsCollection";
import PermissionChangeEntity from "./permissionChangeEntity";
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = "PermissionChanges";

class PermissionChangesCollection extends EntityCollection {
  /**
   * @inheritDoc
   */
  constructor(permissionsDto, options = {}) {
    super(
      EntitySchema.validate(
        PermissionChangesCollection.ENTITY_NAME,
        permissionsDto,
        PermissionChangesCollection.getSchema(),
      ),
      options,
    );

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach((permissionChange) => {
      this.push(permissionChange);
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get permissions entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      type: "array",
      items: PermissionChangeEntity.getSchema(),
    };
  }

  /**
   * PermissionChangesCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /*
   * ==================================================
   * Filters
   * ==================================================
   */
  /**
   * Filter By Aco Foreign Key
   *
   * @param {string} acoForeignKey
   * @returns {PermissionChangesCollection} a new set of permission changes
   */
  filterByAcoForeignKey(acoForeignKey) {
    const permissionChanges = this._items.filter((changeEntity) => changeEntity.acoForeignKey === acoForeignKey);
    return new PermissionChangesCollection(permissionChanges);
  }

  /**
   * Filter By Aco Foreign Key
   *
   * @param {string} aroForeignKey
   * @returns {PermissionChangesCollection} a new set of permission changes
   */
  filterByAroForeignKey(aroForeignKey) {
    const permissionChanges = this._items.filter((changeEntity) => changeEntity.aroForeignKey === aroForeignKey);
    return new PermissionChangesCollection(permissionChanges);
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * Push a copy of the permission to the list
   * @param {PermissionChangeEntity} permissionChange DTO or PermissionChangeEntity
   */
  push(permissionChange) {
    if (!permissionChange || typeof permissionChange !== "object") {
      throw new TypeError(`PermissionChangesCollection push parameter should be an object.`);
    }
    if (permissionChange instanceof PermissionChangeEntity) {
      permissionChange = permissionChange.toDto(); // clone
    }
    permissionChange = new PermissionChangeEntity(permissionChange); // validate
    super.push(permissionChange);
  }

  /**
   * Merge another set of permission changes in this one
   * @param {PermissionChangesCollection} permissionChangesCollection
   */
  merge(permissionChangesCollection) {
    for (const changes of permissionChangesCollection) {
      this.push(changes);
    }
  }

  /*
   * ==================================================
   * Changes calculation
   * ==================================================
   */
  /**
   * Build changes needed to go from one permission collection to the other
   *
   * @param {PermissionsCollection} originalSet
   * @param {PermissionsCollection} expectedSet
   */
  static calculateChanges(originalSet, expectedSet) {
    if (
      !originalSet ||
      !(originalSet instanceof PermissionsCollection) ||
      !expectedSet ||
      !(expectedSet instanceof PermissionsCollection)
    ) {
      throw new TypeError("PermissionChangesCollection calculateChanges invalid parameters");
    }
    const result = new PermissionChangesCollection([]);

    // Find new or updated permissions
    for (const expectedPermission of expectedSet) {
      const foundPermission = originalSet.getByAroMatchingPermission(expectedPermission);
      if (!foundPermission) {
        const newChange = PermissionChangeEntity.createFromPermission(
          expectedPermission,
          PermissionChangeEntity.PERMISSION_CHANGE_CREATE,
        );
        result.push(newChange);
      } else {
        if (expectedPermission.type !== foundPermission.type) {
          expectedPermission.id = foundPermission.id;
          const newChange = PermissionChangeEntity.createFromPermission(
            expectedPermission,
            PermissionChangeEntity.PERMISSION_CHANGE_UPDATE,
          );
          result.push(newChange);
        }
      }
    }

    // Find deleted permissions
    for (const originalPermission of originalSet) {
      if (!expectedSet.getByAroMatchingPermission(originalPermission)) {
        // Aka, permissions that are in the old set and not the new one
        const newChange = PermissionChangeEntity.createFromPermission(
          originalPermission,
          PermissionChangeEntity.PERMISSION_CHANGE_DELETE,
        );
        result.push(newChange);
      }
    }

    return result;
  }
}

export default PermissionChangesCollection;
