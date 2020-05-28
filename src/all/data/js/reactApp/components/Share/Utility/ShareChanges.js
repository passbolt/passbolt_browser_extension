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
 * @since         2.0.0
 */
const READ = 1;
// const UPDATE = 7;
const ADMIN = 15;

export default class ShareChanges {
  /**
   * Constructor
   * @param {array} resources
   * @param {array} folders
   */
  constructor(resources, folders) {
    this._folders = folders || [];
    this._resources = resources || [];
    this._permissions = [];
    this._aroPermissions = [];
    this._aros = {};
    this._acos = [];

    /*
     * Remap the resources and folder into an ACO array
     * Extend object with "_type" to keep distinction
     */
    this._resources.forEach(resource => {
      resource._type = 'Resource';
      this._acos.push(resource);
    });
    this._folders.forEach(folder => {
      folder._type = 'Folder';
      this._acos.push(folder);
    });

    // Build the permission list
    this._acos.forEach(aco => {
      aco.permissions.forEach(permission => {
        const aro = permission.user || permission.group;
        if (!this._aros[aro.id]) {
          this._aros[aro.id] = aro;
        }
        this._permissions.push(permission);
      });
    });
    this._changes = [];
  }

  // new
  getChanges() {
    return this._changes;
  }
  getResourcesChanges() {
    return this._changes.filter(element => element.aco === 'Resource');
  }
  getFoldersChanges() {
    return this._changes.filter(element => element.aco === 'Folder');
  }

  getAcos() {
    return this._acos;
  }

  /**
   * Check that a user is the original owner of the resources
   * @return {boolean}
   */
  isOriginalResourcesOwner() {
    return this._acos.reduce((carry, aco) => carry && aco.permission.type === ADMIN, true);
  }

  /**
   * Aggregate the permissions by user.
   * @return {object} The mapped permissions list
   *
   * {
   *    ARO_ID: {
   *      id: {string}, // The aro id
   *      aro: {object},
   *      type: int,
   *      permissions: array<object>
   *    }
   * }
   */
  aggregatePermissionsByAro() {
    // Aggregate the data as expected.
    const arosPermissions = this._permissions.reduce((carry, permission) => {
      let aroPermission = carry.find(_data => _data.id === permission.aro_foreign_key);
      if (!aroPermission) {
        const aro = permission.user || permission.group;
        aroPermission = {
          id: aro.id,
          aro: aro,
          type: permission.type,
          permissions: []
        };
        carry.push(aroPermission);
      }
      aroPermission.type = aroPermission.type === permission.type ? aroPermission.type : -1;
      aroPermission.permissions.push(permission);
      return carry;
    }, []);

    // Calculate varies details
    arosPermissions.forEach(aroPermissions => {
      // permission type varies also in the case there is less permissions than resources shared.
      if (aroPermissions.permissions.length !== this._acos.length) {
        aroPermissions.type = -1;
      }
      if (aroPermissions.type === -1) {
        // For each permission, aggregate the resources aro has access.
        aroPermissions.variesDetails = this._acos.reduce((carry, aco) => {
          const result = aroPermissions.permissions.filter(permission => permission.aco_foreign_key === aco.id);
          if (!result.length) {
            carry[0].push(aco.name);
          } else {
            carry[result[0].type].push(aco.name);
          }
          return carry;
        }, {0: [], 1: [], 7: [], 15: []});
      }
    });

    // Order the array by aros (user firstname / group name).
    arosPermissions.sort((a, b) => {
      const aValue = a.aro.profile ? a.aro.profile.first_name : a.aro.name;
      const bValue = b.aro.profile ? b.aro.profile.first_name : b.aro.name;
      if (aValue < bValue) {
        return -1;
      } else if (aValue > bValue) {
        return 1;
      }
      return 0;
    });

    this._aroPermissions = arosPermissions;
    return this._aroPermissions;
  }

  /**
   * Check if an aro has some changes
   * @param {string} aroId The aro identifier
   * @return {boolean}
   */
  hasChanges(aroId) {
    const change = this._changes.find(change => change.aro_foreign_key === aroId);
    return change !== undefined;
  }

  /**
   * Add new permission for a given aro
   * @return {object} The mapped permission
   *
   * {
   *    ARO_ID: {
   *      id: {string}, // The aro id
   *      aro: {object},
   *      type: int,
   *      permissions: array<object>
   *    }
   * }
   */
  addAroPermissions(aro) {
    const type = READ;
    this._aros[aro.id] = aro;
    this.updateAroPermissions(aro.id, READ);

    return {
      id: aro.id,
      aro: aro,
      type: type,
      permissions: []
    };
  }

  /**
   * Update aro's permissions.
   * @param {string} aroId The aro to update the permissions for
   * @param {int} type
   */
  updateAroPermissions(aroId, type) {
    this._removeAroChanges(aroId);
    this._acos.forEach(aco => {
      const permissionOriginal = this.getAcoAroPermission(aco, aroId);
      if (permissionOriginal) {
        if (permissionOriginal.type !== type) {
          const permissionChange = JSON.parse(JSON.stringify(permissionOriginal));
          permissionChange.type = type;
          this._changes.push(permissionChange);
        }
      } else {
        const aro = this._aros[aroId];
        const permissionChange = this._buildChange(aco, aro, type);
        this._changes.push(permissionChange);
      }
    });
  }

  /**
   * Delete aro's permissions.
   * @param {string} aroId The aro to delete the permissions for
   */
  deleteAroPermissions(aroId) {
    this._removeAroChanges(aroId);
    this._acos.forEach(aco => {
      const permissionOriginal = this.getAcoAroPermission(aco, aroId);
      if (permissionOriginal) {
        const permissionChange = JSON.parse(JSON.stringify(permissionOriginal));
        permissionChange.delete = true;
        this._changes.push(permissionChange);
      }
    });
    delete this._aros[aroId];
  }

  /**
   * Get the permission for a given resource and a given aro
   * @param {object} aco The resource or Folder to get the aro permission for
   * @param {string} aroId The User or Group to get the resource or folder permission for
   * @returns {object}
   */
  getAcoAroPermission(aco, aroId) {
    return this._permissions.find(permission => (permission.aro_foreign_key === aroId && permission.aco_foreign_key === aco.id));
  }

  /**
   * Get the resources with no owners after applying the changes.
   * @returns {Resource.List}
   */
  getResourcesWithNoOwner() {
    return this._acos.filter(aco => {
      const changes = this._changes.filter(change => change.aco_foreign_key === aco.id);
      // Check if a new owner is promoted.
      const grantedOwner = changes.find(change => change.type === ADMIN && !change.delete);
      if (grantedOwner) {
        return false;
      }
      // Check if there is at least one of the original owners after applying the change.
      const originalOwnersPermissionsIds = this._permissions.reduce((carry, permission) => {
        if (permission.aco_foreign_key === aco.id && permission.type === ADMIN) {
          carry = [...carry, permission.id];
        }
        return carry;
      }, []);
      // Check if owner was removed
      const revokedOwners = changes.filter(change => ((change.delete || change.type !== ADMIN) && originalOwnersPermissionsIds.indexOf(change.id) !== -1));

      return revokedOwners.length === originalOwnersPermissionsIds.length;
    });
  }

  /**
   * Remove all the permissions changes related to a given aro.
   * @param {string} aroId  The aro to delete the changes for
   * @private
   */
  _removeAroChanges(aroId) {
    this._acos.forEach(aco => {
      this._changes = this._changes.filter(change => !(change.aco_foreign_key === aco.id && change.aro_foreign_key === aroId));
    });
  }

  /**
   * Build a permission change
   * @param {object} aco The resource or folder to build a change for
   * @param {object} aro The aro to build a change for
   * @param {int} type The type of permission
   * @returns {object}
   * {
   *   {
   *     is_new: boolean,
   *     aro: string,
   *     aro_foreign_key: string
   *     aco: string,
   *     aco_foreign_key: string,
   *     type: int
   *   }
   * }
   *
   * @private
   */
  _buildChange(aco, aro, type) {
    return {
      is_new: true,
      aro: aro.profile ? 'User' : 'Group',
      aro_foreign_key: aro.id,
      aco: aco._type,
      aco_foreign_key: aco.id,
      type: type
    };
  }
}
