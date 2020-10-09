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
const ResourceModel = require("../../model/resource/resourceModel").ResourceModel;
const FolderModel = require("../../model/folder/folderModel").FolderModel;
const GroupModel = require("../../model/group/groupModel").GroupModel;
const UserModel = require("../../model/user/userModel").UserModel;
const RoleModel = require("../../model/role/roleModel").RoleModel;

class AppInitController {

  constructor(worker) {
    this.worker = worker;
  }

  async main() {
    const user = User.getInstance();
    this.syncUserSettings(user);
    const apiOptions = await user.getApiClientOptions();
    this.syncResouresTypesLocalStorage(apiOptions);
    this.syncUsersLocalStorage(apiOptions);
    this.syncGroupsLocalStorage(apiOptions);
    this.syncResourcesLocalStorage(apiOptions);
    this.syncFoldersLocalStorage(apiOptions);
    this.syncRolesLocalStorage(apiOptions);
  }

  async syncUserSettings(user) {
    try {
      await user.settings.sync()
    } catch (error) {
      // fail silently for CE users
      user.settings.setDefaults();
    }
  }

  async syncUsersLocalStorage(apiOptions) {
    try {
      const userModel = new UserModel(apiOptions);
      await userModel.updateLocalStorage();
    } catch (error) {
      console.error(error);
    }
  }

  async syncGroupsLocalStorage(apiOptions) {
    try {
      const groupModel = new GroupModel(apiOptions);
      groupModel.updateLocalStorage();
    } catch (error) {
      console.error(error);
    }
  }

  async syncResouresTypesLocalStorage(apiOptions) {
    try {
      const resourceTypeModel = new ResourceTypeModel(apiOptions);
      resourceTypeModel.updateLocalStorage();
    } catch (error) {
      console.error(error);
    }
  }

  async syncResourcesLocalStorage(apiOptions) {
    try {
      const resourceModel = new ResourceModel(apiOptions);
      resourceModel.updateLocalStorage();
    } catch (error) {
      console.error(error);
    }
  }

  async syncFoldersLocalStorage(apiOptions) {
    try {
      const folderModel = new FolderModel(apiOptions);
      folderModel.updateLocalStorage();
    } catch (error) {
      console.error(error);
    }
  }

  async syncRolesLocalStorage(apiOptions) {
    try {
      const roleModel = new RoleModel(apiOptions);
      roleModel.updateLocalStorage();
    } catch (error) {
      console.error(error);
    }
  }
}

exports.AppInitController = AppInitController;
