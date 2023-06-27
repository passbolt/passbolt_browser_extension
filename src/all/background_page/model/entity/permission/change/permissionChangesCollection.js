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
import PermissionEntity from "../permissionEntity";
import PermissionsCollection from "../permissionsCollection";
import PermissionChangeEntity from "./permissionChangeEntity";
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'PermissionChanges';

class PermissionChangesCollection extends EntityCollection {
  /**
   * PermissionChanges Entity constructor
   *
   * @param {array} permissionsDto permission changes DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(permissionsDto) {
    super(EntitySchema.validate(
      PermissionChangesCollection.ENTITY_NAME,
      permissionsDto,
      PermissionChangesCollection.getSchema()
    ));

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(permissionChange => {
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
      "type": "array",
      "items": PermissionChangeEntity.getSchema(),
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
    const permissionChanges = this._items.filter(changeEntity => changeEntity.acoForeignKey === acoForeignKey);
    return new PermissionChangesCollection(permissionChanges);
  }

  /**
   * Filter By Aco Foreign Key
   *
   * @param {string} aroForeignKey
   * @returns {PermissionChangesCollection} a new set of permission changes
   */
  filterByAroForeignKey(aroForeignKey) {
    const permissionChanges = this._items.filter(changeEntity => changeEntity.aroForeignKey === aroForeignKey);
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
    if (!permissionChange || typeof permissionChange !== 'object') {
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

  /**
   * Copy permission changes for another ACO (folder or resource)
   * Useful to apply a collection of changes to another item
   *
   * @param {string} aco type folder or resource
   * @param {string} acoForeignKey uuid
   */
  copyForAnotherAco(aco, acoForeignKey) {
    const results = new PermissionChangesCollection([]);
    for (const change of this.items) {
      results.push(change.copyForAnotherAco(aco, acoForeignKey));
    }
    return results;
  }

  /*
   * ==================================================
   * Changes calculation
   * ==================================================
   */
  /**
   * Return true if the changes can be applied
   * @param {string} aco folder or resource to reuse the changes for
   * @param {string} acoId uuid of the folder or resource to reuse the changes for
   * @param {PermissionsCollection} permissions
   * @param {PermissionChangesCollection} changes
   * @param {PermissionsCollection} originalPermissions
   */
  static reuseChanges(aco, acoId, permissions, changes, originalPermissions) {
    if (!aco || !acoId || !permissions || !originalPermissions || !changes) {
      throw new TypeError('PermissionChangesCollection reuseChanges call is missing parameter(s).');
    }
    const result = new PermissionChangesCollection([]);
    for (const change of changes) {
      const permission = permissions.getByAro(change.aro, change.aroForeignKey);
      switch (change.scenario) {
        case PermissionChangeEntity.PERMISSION_CHANGE_DELETE:
          if (permission && permission.type === change.type) {
            result.push(PermissionChangeEntity.createFromPermission(
              permission, PermissionChangeEntity.PERMISSION_CHANGE_DELETE
            ));
          }
          break;
        case PermissionChangeEntity.PERMISSION_CHANGE_CREATE:
          if (!permission) {
            result.push(new PermissionChangeEntity({
              aco: aco,
              aco_foreign_key: acoId,
              aro: change.aro,
              aro_foreign_key: change.aroForeignKey,
              type: change.type
            }));
          }
          break;
        case PermissionChangeEntity.PERMISSION_CHANGE_UPDATE:
          if (permission && permission.type !== change.type) {
            const originalPermission = originalPermissions.items.find(p => p.id === change.id);
            if (originalPermission.type === permission.type) {
              const expectedPermission = new PermissionEntity(permission.toDto());
              expectedPermission.type = change.type;
              result.push(PermissionChangeEntity.createFromPermission(
                expectedPermission, PermissionChangeEntity.PERMISSION_CHANGE_UPDATE
              ));
            }
          }
          break;
      }
    }
    return result;
  }

  /**
   * Build changes needed to go from one permission collection to the other
   *
   * @param {PermissionsCollection} originalSet
   * @param {PermissionsCollection} expectedSet
   */
  static calculateChanges(originalSet, expectedSet) {
    if (!originalSet || !(originalSet instanceof PermissionsCollection) || !expectedSet || !(expectedSet instanceof PermissionsCollection)) {
      throw new TypeError('PermissionChangesCollection calculateChanges invalid parameters');
    }
    const result = new PermissionChangesCollection([]);

    // Find new or updated permissions
    for (const expectedPermission of expectedSet) {
      const foundPermission = originalSet.getByAroMatchingPermission(expectedPermission);
      if (!foundPermission) {
        const newChange = PermissionChangeEntity.createFromPermission(expectedPermission, PermissionChangeEntity.PERMISSION_CHANGE_CREATE);
        result.push(newChange);
      } else {
        if (expectedPermission.type !== foundPermission.type) {
          expectedPermission.id = foundPermission.id;
          const newChange = PermissionChangeEntity.createFromPermission(expectedPermission, PermissionChangeEntity.PERMISSION_CHANGE_UPDATE);
          result.push(newChange);
        }
      }
    }

    // Find deleted permissions
    for (const originalPermission of originalSet) {
      if (!expectedSet.getByAroMatchingPermission(originalPermission)) {
        // Aka, permissions that are in the old set and not the new one
        const newChange = PermissionChangeEntity.createFromPermission(originalPermission, PermissionChangeEntity.PERMISSION_CHANGE_DELETE);
        result.push(newChange);
      }
    }

    return result;
  }
}

export default PermissionChangesCollection;
