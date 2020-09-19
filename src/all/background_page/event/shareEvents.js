/**
 * Share Listeners
 *
 * Used for sharing passwords
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const Worker = require('../model/worker');
const {User} = require('../model/user');
const {Share} = require('../model/share');
const {ResourceModel} = require('../model/resource/resourceModel');
const {FolderModel} = require('../model/folder/folderModel');

const {FoldersCollection} = require('../model/entity/folder/foldersCollection');
const {PermissionChangesCollection} = require('../model/entity/permission/change/permissionChangesCollection');

const {ShareResourcesController} = require('../controller/share/shareResourcesController');
const {ShareFoldersController} = require('../controller/share/shareFoldersController');

const listen = function (worker) {
  /*
   * Search aros based on keywords.
   * @listens passbolt.share.search-aros
   * @param keywords {string} The keywords to search
   */
  worker.port.on('passbolt.share.search-aros', async function (requestId, keywords, resourcesForLegacyApi) {
    let aros;
    try {
      aros = await Share.searchAros(keywords);
    } catch (error) {
      if (resourcesForLegacyApi.resourcesIds && resourcesForLegacyApi.resourcesIds.length === 1) {
        // This code ensure the compatibility with passbolt < v2.4.0.
        aros = await Share.searchResourceAros(resourcesForLegacyApi.resourcesIds[0], keywords);
      } else {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      }
    }
    worker.port.emit(requestId, 'SUCCESS', aros);
  });

  /*
   * Retrieve the resources to share.
   * @listens passbolt.share.get-resources
   * @param {array} resourcesIds The ids of the resources to retrieve.
   */
  worker.port.on('passbolt.share.get-resources', async function (requestId, resourcesIds) {
    try {
      let apiClientOptions = await User.getInstance().getApiClientOptions();
      let resourceModel = new ResourceModel(apiClientOptions);
      const resourcesCollection = await resourceModel.findAllForShare(resourcesIds);
      worker.port.emit(requestId, 'SUCCESS', resourcesCollection.toJSON());
    } catch(error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
    }
  });

  /*
   * Retrieve the folders to share.
   * @listens passbolt.share.get-folders
   * @param {array} foldersIds The ids of the folders to retrieve.
   */
  worker.port.on('passbolt.share.get-folders', async function (requestId, foldersIds) {
    try {
      let apiClientOptions = await User.getInstance().getApiClientOptions();
      let folderModel = new FolderModel(apiClientOptions);
      const foldersCollection = await folderModel.findAllForShare(foldersIds);
      const folderDtos = foldersCollection.toJSON();
      worker.port.emit(requestId, 'SUCCESS', folderDtos);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
    }
  });

  /*
   * Encrypt the shared password for all the new users it has been shared with.
   * @listens passbolt.share.submit
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.share.resources.save', async function (requestId, resources, changes) {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const shareResourcesController = new ShareResourcesController(worker, requestId, apiClientOptions);
      await shareResourcesController.main(resources, changes);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
    }
  });

  /*
   * Update the folder permissions
   *
   * @listens passbolt.share.folders.save
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.share.folders.save', async function (requestId, foldersDto, changesDto) {
    try {
      const folders = new FoldersCollection(foldersDto);
      const permissionChanges = new PermissionChangesCollection(changesDto);
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const shareFoldersController = new ShareFoldersController(worker, requestId, apiClientOptions);
      await shareFoldersController.main(folders, permissionChanges);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
    }
  });

  /*
   * Close the share passwords dialog
   * @listens passbolt.share.close
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.share.close', function() {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.share.close-share-dialog');
  });

};
exports.listen = listen;
