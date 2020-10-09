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
 * @since         v3.0.0
 */
const {RolesCollection} = require('../entity/role/rolesCollection');
const {RolesLocalStorage} = require('../../service/local_storage/rolesLocalStorage');
const {RoleService} = require('../../service/api/role/roleService');

class RoleModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.roleService = new RoleService(apiClientOptions);
  }

  /**
   * Update the roles local storage with the API roles.
   *
   * @return {RolesCollection}
   */
  async updateLocalStorage () {
    const rolesDtos = await this.roleService.findAll();
    const rolesCollection = new RolesCollection(rolesDtos);
    await RolesLocalStorage.set(rolesCollection);
    return rolesCollection;
  }
}

exports.RoleModel = RoleModel;
