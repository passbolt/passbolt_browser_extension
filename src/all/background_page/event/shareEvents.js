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
 * @since         1.0.0
 */

import FolderModel from "../model/folder/folderModel";
import ShareResourcesController from "../controller/share/shareResourcesController";
import ShareOneFolderController from "../controller/share/shareOneFolderController";
import SearchUsersAndGroupsController from "../controller/share/searchUsersAndGroupsController";

/**
 * Listens the share events
 * @param {Worker} worker
 * @param {ApiClientOptions} apiClientOptions the api client options
 * @param {AccountEntity} account the user account
 */
const listen = function(worker, apiClientOptions, account) {
  /*
   * Retrieve the folders to share.
   * @listens passbolt.share.get-folders
   * @param {array} foldersIds The ids of the folders to retrieve.
   */
  worker.port.on('passbolt.share.get-folders', async(requestId, foldersIds) => {
    try {
      const folderModel = new FolderModel(apiClientOptions, account);
      const foldersCollection = await folderModel.findAllForShare(foldersIds);
      worker.port.emit(requestId, 'SUCCESS', foldersCollection);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Encrypt the shared password for all the new users it has been shared with.
   * @listens passbolt.share.submit
   * @param requestId {uuid} The request identifier
   * @param resourcesId {array<string>} The resources ids to share
   * @param permissionChangesDto {array} The permission changes
   */
  worker.port.on('passbolt.share.resources.save', async(requestId, resourcesIds, permissionChangesDto) => {
    const shareResourcesController = new ShareResourcesController(worker, requestId, apiClientOptions, account);
    await shareResourcesController._exec(resourcesIds, permissionChangesDto);
  });

  /*
   * Update the folder permissions
   *
   * @listens passbolt.share.folders.save
   * @param requestId {uuid} The request identifier
   * @param folderId {uuid} The folder id to share
   * @param permissionChangesDto {array} The permission changes
   */
  worker.port.on('passbolt.share.folders.save', async(requestId, folderId, permissionChangesDto) => {
    const shareFoldersController = new ShareOneFolderController(worker, requestId, apiClientOptions, account);
    await shareFoldersController._exec(folderId, permissionChangesDto);
  });

  /**
   * Search for any Groups or Users that match the given keyword
   *
   * @listens passbolt.share.search-aros
   * @param {string} requestId uuid, the request identifier
   * @param {string} keyword the keyword with which to run the search
   */
  worker.port.on('passbolt.share.search-aros', async(requestId, keyword) => {
    const controller = new SearchUsersAndGroupsController(worker, requestId, apiClientOptions);
    await controller._exec(keyword);
  });
};
export const ShareEvents = {listen};
