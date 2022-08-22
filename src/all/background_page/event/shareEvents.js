/**
 * Share Listeners
 *
 * Used for sharing passwords
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import User from "../model/user";
import ResourceModel from "../model/resource/resourceModel";
import FolderModel from "../model/folder/folderModel";
import Share from "../model/share";
import ShareResourcesController from "../controller/share/shareResourcesController";
import ShareFoldersController from "../controller/share/shareFoldersController";
import FoldersCollection from "../model/entity/folder/foldersCollection";
import PermissionChangesCollection from "../model/entity/permission/change/permissionChangesCollection";

const listen = function(worker) {
  /*
   * Search aros based on keywords.
   * @listens passbolt.share.search-aros
   * @param keywords {string} The keywords to search
   */
  worker.port.on('passbolt.share.search-aros', async(requestId, keywords, resourcesForLegacyApi) => {
    let aros;
    try {
      aros = await Share.searchAros(keywords);
    } catch (error) {
      if (resourcesForLegacyApi.resourcesIds && resourcesForLegacyApi.resourcesIds.length === 1) {
        // This code ensure the compatibility with passbolt < v2.4.0.
        aros = await Share.searchResourceAros(resourcesForLegacyApi.resourcesIds[0], keywords);
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
    worker.port.emit(requestId, 'SUCCESS', aros);
  });

  /*
   * Retrieve the resources to share.
   * @listens passbolt.share.get-resources
   * @param {array} resourcesIds The ids of the resources to retrieve.
   */
  worker.port.on('passbolt.share.get-resources', async(requestId, resourcesIds) => {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const resourceModel = new ResourceModel(apiClientOptions);
      const resourcesCollection = await resourceModel.findAllForShare(resourcesIds);
      worker.port.emit(requestId, 'SUCCESS', resourcesCollection);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Retrieve the folders to share.
   * @listens passbolt.share.get-folders
   * @param {array} foldersIds The ids of the folders to retrieve.
   */
  worker.port.on('passbolt.share.get-folders', async(requestId, foldersIds) => {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const folderModel = new FolderModel(apiClientOptions);
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
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const shareResourcesController = new ShareResourcesController(worker, requestId, apiClientOptions);
      await shareResourcesController.main(resources, changes);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
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
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const shareFoldersController = new ShareFoldersController(worker, requestId, apiClientOptions);
      await shareFoldersController.main(folders, permissionChanges);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};
export const ShareEvents = {listen};
