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
import RolesLocalStorage from "../../service/local_storage/rolesLocalStorage";
import RoleService from "../../service/api/role/roleService";
import RolesCollection from "passbolt-styleguide/src/shared/models/entity/role/rolesCollection";

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
  async updateLocalStorage() {
    const rolesDtos = await this.roleService.findAll();
    const rolesCollection = new RolesCollection(rolesDtos);
    await RolesLocalStorage.set(rolesCollection);
    return rolesCollection;
  }

  /**
   * Get a collection of all roles from the local storage.
   * If the local storage is unset, initialize it.
   *
   * @return {ResourceTypesCollection}
   */
  async getOrFindAll() {
    const rolesDto = await RolesLocalStorage.get();
    if (typeof rolesDto !== 'undefined') {
      return new RolesCollection(rolesDto);
    }
    return this.updateLocalStorage();
  }
}

export default RoleModel;
