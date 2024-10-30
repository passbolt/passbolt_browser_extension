/**
 * Share Listeners
 *
 * Used for sharing passwords
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import FolderModel from "../model/folder/folderModel";
import ShareResourcesController from "../controller/share/shareResourcesController";
import ShareFoldersController from "../controller/share/shareFoldersController";
import FoldersCollection from "../model/entity/folder/foldersCollection";
import PermissionChangesCollection from "../model/entity/permission/change/permissionChangesCollection";
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
   */
  worker.port.on('passbolt.share.resources.save', async(requestId, resources, changes) => {
    const shareResourcesController = new ShareResourcesController(worker, requestId, apiClientOptions, account);
    await shareResourcesController._exec(resources, changes);
  });

  /*
   * Update the folder permissions
   *
   * @listens passbolt.share.folders.save
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.share.folders.save', async(requestId, foldersDto, changesDto) => {
    try {
      const folders = new FoldersCollection(foldersDto);
      const permissionChanges = new PermissionChangesCollection(changesDto);
      const shareFoldersController = new ShareFoldersController(worker, requestId, apiClientOptions, account);
      await shareFoldersController.main(folders, permissionChanges);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
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
