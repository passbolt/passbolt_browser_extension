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
const {EntityCollection} = require('../abstract/entityCollection');
const {EntitySchema} = require('../abstract/entitySchema');
const {PermissionChangeEntity} = require('./permissionChangeEntity');
const {PermissionsCollection} = require('./PermissionsCollection');

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

    // Note: there is no "multi-item" validation
    // Collection validation will fail at the first item that doesn't validate
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
    }
  }

  /**
   * PermissionChangesCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  // ==================================================
  // Setters
  // ==================================================
  /**
   * Push a copy of the permission to the list
   * @param {PermissionChangeEntity} permission DTO or PermissionChangeEntity
   */
  push(permission) {
    if (!permission || typeof permission !== 'object') {
      throw new TypeError(`PermissionChangesCollection push parameter should be an object.`);
    }
    if (permission instanceof PermissionChangeEntity) {
      permission = permission.toDto(); // clone
    }
    permission = new PermissionChangeEntity(permission); // validate
    super.push(permission);
  }

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
   * Build changes needed to go from one permission collection to the other
   *
   * @param {PermissionsCollection} originalSet
   * @param {PermissionsCollection} expectedSet
   */
  static buildChangesFromPermissions(originalSet, expectedSet) {
    const result = new PermissionChangesCollection([]);

    // Find new or updated permissions
    for(let expectedPermission of expectedSet) {
      const foundPermission = originalSet.findByAro(expectedPermission);
      if (!foundPermission) {
        const newChange = PermissionChangeEntity.createFromPermission(expectedPermission, PermissionChangeEntity.PERMISSION_CHANGE_CREATE);
        result.push(newChange);
      } else {
        if (expectedPermission.type !== foundPermission.type) {
          const newChange = PermissionChangeEntity.createFromPermission(expectedPermission, PermissionChangeEntity.PERMISSION_CHANGE_UPDATE);
          result.push(newChange);
        }
      }
    }

    // Find deleted permissions
    for(let originalPermission of originalSet) {
      if (!expectedSet.findByAro(originalPermission)) {
        // Aka, permissions that are in the old set and not the new one
        const newChange = PermissionChangeEntity.createFromPermission(originalPermission, PermissionChangeEntity.PERMISSION_CHANGE_DELETE);
        result.push(newChange);
      }
    }

    return result;
  }
}

exports.PermissionChangesCollection = PermissionChangesCollection;
