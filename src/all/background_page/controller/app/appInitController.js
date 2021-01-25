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
 * @since         3.0.0
 */
const User = require('../../model/user').User;
const ResourceTypeModel = require("../../model/resourceType/resourceTypeModel").ResourceTypeModel;
const RoleModel = require("../../model/role/roleModel").RoleModel;

class AppInitController {
  /**
   *
   * @returns {Promise<>}
   */
  async main() {
    const syncUserSettingsPromise = this._syncUserSettings();
    const syncResourcesTypesPromise = this._syncResourcesTypesLocalStorage();
    const syncRolesPromise = this._syncRolesLocalStorage();
    return Promise.allSettled([syncUserSettingsPromise, syncResourcesTypesPromise, syncRolesPromise])
  }

  /**
   * Sync the user settings
   * @returns {Promise<void>}
   * @private
   */
  async _syncUserSettings() {
    const user = User.getInstance();
    try {
      await user.settings.sync()
    } catch (error) {
      // fail silently for CE users
      user.settings.setDefaults();
    }
  }

  /**
   * Sync the API resources types
   * @returns {Promise<void>}
   * @private
   */
  async _syncResourcesTypesLocalStorage() {
    const user = User.getInstance();
    const apiClientOptions = await user.getApiClientOptions();
    try {
      const resourceTypeModel = new ResourceTypeModel(apiClientOptions);
      await resourceTypeModel.updateLocalStorage();
    } catch (error) {
      // If API < v3, we expect an error here.
      console.error(error);
    }
  }

  /**
   * Sync the API roles
   * @returns {Promise<void>}
   * @private
   */
  async _syncRolesLocalStorage() {
    const user = User.getInstance();
    const apiClientOptions = await user.getApiClientOptions();
    try {
      const roleModel = new RoleModel(apiClientOptions);
      await roleModel.updateLocalStorage();
    } catch (error) {
      console.error(error);
    }
  }
}

exports.AppInitController = AppInitController;
